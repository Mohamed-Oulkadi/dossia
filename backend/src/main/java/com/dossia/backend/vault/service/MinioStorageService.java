package com.dossia.backend.vault.service;

import com.dossia.backend.vault.config.MinioProperties;
import io.minio.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioStorageService {

    private final MinioClient minioClient;
    private final MinioProperties properties;

    @PostConstruct
    public void initBucket() {
        try {
            String bucket = properties.getBucketName();
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!found) {
                log.info("MinIO bucket '{}' not found. Creating medical vault bucket...", bucket);
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                log.info("MinIO bucket '{}' created successfully.", bucket);
            } else {
                log.info("MinIO bucket '{}' already exists and is healthy.", bucket);
            }
        } catch (Exception e) {
            log.warn("Could not initialize MinIO bucket '{}' during startup (MinIO may be offline or in test mode): {}",
                    properties.getBucketName(), e.getMessage());
        }
    }

    public void uploadObject(String objectKey, InputStream stream, long size, String contentType) {
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(properties.getBucketName())
                            .object(objectKey)
                            .stream(stream, size, -1)
                            .contentType(contentType)
                            .build()
            );
            log.debug("Successfully stored object '{}' in bucket '{}'", objectKey, properties.getBucketName());
        } catch (Exception e) {
            log.error("Failed to upload object '{}' to MinIO: {}", objectKey, e.getMessage(), e);
            throw new RuntimeException("Erreur de stockage dans le coffre-fort médical MinIO : " + e.getMessage(), e);
        }
    }

    public InputStream getObjectStream(String objectKey) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(properties.getBucketName())
                            .object(objectKey)
                            .build()
            );
        } catch (Exception e) {
            log.error("Failed to fetch object '{}' from MinIO: {}", objectKey, e.getMessage(), e);
            throw new RuntimeException("Impossible de récupérer le document depuis le coffre-fort MinIO : " + e.getMessage(), e);
        }
    }

    public void removeObject(String objectKey) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(properties.getBucketName())
                            .object(objectKey)
                            .build()
            );
            log.debug("Removed object '{}' from bucket '{}'", objectKey, properties.getBucketName());
        } catch (Exception e) {
            log.warn("Failed to remove object '{}' from MinIO: {}", objectKey, e.getMessage());
        }
    }
}
