package com.dossia.backend.common.exception;

import lombok.Getter;

/**
 * Thrown when an account is temporarily locked due to excessive failed login attempts (HTTP 423).
 */
@Getter
public class AccountLockedException extends RuntimeException {

    private final long remainingSeconds;

    public AccountLockedException(String message, long remainingSeconds) {
        super(message);
        this.remainingSeconds = remainingSeconds;
    }
}
