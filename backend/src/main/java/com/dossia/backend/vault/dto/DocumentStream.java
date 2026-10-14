package com.dossia.backend.vault.dto;

import java.io.InputStream;

/**
 * Holder for streaming binary files safely to the client.
 */
public record DocumentStream(
        InputStream inputStream,
        String filename,
        String contentType,
        long contentLength
) {}
