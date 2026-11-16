package com.dossia.backend.config.vault;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * Early Spring Boot EnvironmentPostProcessor for HashiCorp Vault Community Edition (SEC-01).
 * Queries HashiCorp Vault KV v2 secret engine at application startup and injects secrets into the
 * Spring Environment with highest priority before DataSource, MinioClient, or security beans initialize.
 * Falls back gracefully to environment variables if Vault is disabled or unreachable.
 */
public class VaultEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final Log log = LogFactory.getLog(VaultEnvironmentPostProcessor.class);

    public static final String PROPERTY_SOURCE_NAME = "hashicorpVaultPropertySource";

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 15;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String enabledStr = environment.getProperty("dossia.vault.enabled");
        if (enabledStr == null) {
            enabledStr = environment.getProperty("DOSSIA_VAULT_ENABLED", "false");
        }

        boolean vaultEnabled = Boolean.parseBoolean(enabledStr);
        String vaultAddr = environment.getProperty("dossia.vault.endpoint");
        if (vaultAddr == null) {
            vaultAddr = environment.getProperty("VAULT_ADDR", "http://localhost:8200");
        }

        String vaultToken = environment.getProperty("dossia.vault.token");
        if (vaultToken == null) {
            vaultToken = environment.getProperty("VAULT_TOKEN", "");
        }

        String secretPath = environment.getProperty("dossia.vault.secret-path");
        if (secretPath == null) {
            secretPath = environment.getProperty("VAULT_SECRET_PATH", "secret/data/dossia");
        }

        if (!vaultEnabled || vaultToken.isBlank()) {
            log.debug("HashiCorp Vault integration is disabled or no VAULT_TOKEN provided; using local configuration.");
            return;
        }

        try {
            Map<String, Object> vaultProperties = fetchSecretsFromVault(vaultAddr, vaultToken, secretPath);
            if (!vaultProperties.isEmpty()) {
                environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, vaultProperties));
                log.info("Successfully loaded " + vaultProperties.size() + " secrets from HashiCorp Vault (" + secretPath + ").");
            }
        } catch (Exception ex) {
            log.warn("Could not retrieve secrets from HashiCorp Vault (" + vaultAddr + "): " + ex.getMessage() +
                    ". Falling back to local environment properties.");
        }
    }

    Map<String, Object> fetchSecretsFromVault(String vaultAddr, String token, String secretPath) throws Exception {
        String cleanBase = vaultAddr.endsWith("/") ? vaultAddr.substring(0, vaultAddr.length() - 1) : vaultAddr;
        String cleanPath = secretPath.startsWith("/") ? secretPath.substring(1) : secretPath;
        String url = cleanBase + "/v1/" + cleanPath;

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(2500))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("X-Vault-Token", token)
                .header("Accept", "application/json")
                .timeout(Duration.ofMillis(4000))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new IllegalStateException("Vault returned HTTP " + response.statusCode() + ": " + response.body());
        }

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response.body());

        // Vault KV v2 structure: data.data.{key: value}
        JsonNode dataNode = root.path("data").path("data");
        if (dataNode.isMissingNode() || !dataNode.isObject()) {
            // Check if KV v1 structure: data.{key: value}
            dataNode = root.path("data");
        }

        Map<String, Object> properties = new HashMap<>();

        if (dataNode.isObject()) {
            Iterator<Map.Entry<String, JsonNode>> fields = dataNode.properties().iterator();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                String key = field.getKey();
                String value = field.getValue().asText();

                // Put raw key
                properties.put("vault." + key, value);

                // Map standard Dossia sensitive properties
                switch (key) {
                    case "database.password", "db_password" -> properties.put("spring.datasource.password", value);
                    case "database.username", "db_user" -> properties.put("spring.datasource.username", value);
                    case "database.url", "db_url" -> properties.put("spring.datasource.url", value);
                    case "minio.secret_key", "minio_secret_key" -> properties.put("dossia.minio.secret-key", value);
                    case "minio.access_key", "minio_access_key" -> properties.put("dossia.minio.access-key", value);
                    case "jwt.secret", "jwt_secret" -> properties.put("dossia.security.jwt.secret", value);
                    case "ai.api_key", "ai_api_key" -> properties.put("dossia.ai.api-key", value);
                }
            }
        }

        return properties;
    }
}
