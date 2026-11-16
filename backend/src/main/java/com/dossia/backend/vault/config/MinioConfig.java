package com.dossia.backend.vault.config;

import io.minio.MinioClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(MinioProperties.class)
public class MinioConfig {

    @Bean
    public MinioClient minioClient(MinioProperties properties) {
        String access = (properties.getAccessKey() != null && !properties.getAccessKey().isBlank())
                ? properties.getAccessKey()
                : "dossia_unconfigured_access";
        String secret = (properties.getSecretKey() != null && !properties.getSecretKey().isBlank())
                ? properties.getSecretKey()
                : "dossia_unconfigured_secret";

        return MinioClient.builder()
                .endpoint(properties.getEndpoint())
                .credentials(access, secret)
                .build();
    }
}
