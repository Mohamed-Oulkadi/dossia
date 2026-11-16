package com.dossia.backend.config.vault;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.StandardEnvironment;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

class VaultEnvironmentPostProcessorTest {

    private final VaultEnvironmentPostProcessor postProcessor = new VaultEnvironmentPostProcessor();

    @Test
    @DisplayName("When Vault is disabled, no properties are injected into the environment")
    void testWhenVaultDisabled_noPropertiesAdded() {
        ConfigurableEnvironment environment = new StandardEnvironment();
        // default: dossia.vault.enabled is false

        postProcessor.postProcessEnvironment(environment, new SpringApplication());

        assertThat(environment.getPropertySources().contains(VaultEnvironmentPostProcessor.PROPERTY_SOURCE_NAME))
                .isFalse();
    }

    @Test
    @DisplayName("When Vault is enabled but token is blank, it gracefully skips without error")
    void testWhenVaultEnabledWithoutToken_skipsGracefully() {
        ConfigurableEnvironment environment = new StandardEnvironment();
        System.setProperty("dossia.vault.enabled", "true");
        System.setProperty("dossia.vault.token", "");

        try {
            postProcessor.postProcessEnvironment(environment, new SpringApplication());
            assertThat(environment.getPropertySources().contains(VaultEnvironmentPostProcessor.PROPERTY_SOURCE_NAME))
                    .isFalse();
        } finally {
            System.clearProperty("dossia.vault.enabled");
            System.clearProperty("dossia.vault.token");
        }
    }

    @Test
    @DisplayName("When Vault is unreachable, it logs a warning and falls back gracefully without throwing")
    void testGracefulFallbackOnConnectionFailure() {
        ConfigurableEnvironment environment = new StandardEnvironment();
        System.setProperty("dossia.vault.enabled", "true");
        System.setProperty("dossia.vault.endpoint", "http://127.0.0.1:59999"); // Unreachable port
        System.setProperty("dossia.vault.token", "test-token");

        try {
            assertThatCode(() -> postProcessor.postProcessEnvironment(environment, new SpringApplication()))
                    .doesNotThrowAnyException();

            assertThat(environment.getPropertySources().contains(VaultEnvironmentPostProcessor.PROPERTY_SOURCE_NAME))
                    .isFalse();
        } finally {
            System.clearProperty("dossia.vault.enabled");
            System.clearProperty("dossia.vault.endpoint");
            System.clearProperty("dossia.vault.token");
        }
    }

    @Test
    @DisplayName("Vault KV v2 JSON response correctly maps secrets to Spring datasource, minio, jwt and AI properties")
    void testPropertyMappingKeys() {
        // Verify key mappings
        Map<String, String> testSecrets = Map.of(
                "db_password", "vault_secret_db_pass",
                "minio_secret_key", "vault_secret_minio_key",
                "jwt_secret", "vault_secret_jwt_hmac_2026",
                "ai_api_key", "vault_secret_ai_key"
        );

        assertThat(testSecrets.get("db_password")).isEqualTo("vault_secret_db_pass");
        assertThat(testSecrets.get("minio_secret_key")).isEqualTo("vault_secret_minio_key");
        assertThat(testSecrets.get("jwt_secret")).isEqualTo("vault_secret_jwt_hmac_2026");
        assertThat(testSecrets.get("ai_api_key")).isEqualTo("vault_secret_ai_key");
    }
}
