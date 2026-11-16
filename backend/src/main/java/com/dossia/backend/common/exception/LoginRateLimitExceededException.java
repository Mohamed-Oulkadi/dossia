package com.dossia.backend.common.exception;

/**
 * Thrown when an IP address exceeds the maximum allowed authentication requests per time window (HTTP 429).
 */
public class LoginRateLimitExceededException extends RuntimeException {

    public LoginRateLimitExceededException(String message) {
        super(message);
    }
}
