package com.dossia.backend.vault.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "dossia.minio")
@Getter
@Setter
public class MinioProperties {

    private String endpoint = "http://localhost:9000";
    private String accessKey = "dossia_minio_admin";
    private String secretKey = "dossia_minio_dev_secret_2026";
    private String bucketName = "dossia-medical-vault";
}
