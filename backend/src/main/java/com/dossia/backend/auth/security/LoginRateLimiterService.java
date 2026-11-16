package com.dossia.backend.auth.security;

import com.dossia.backend.common.exception.AccountLockedException;
import com.dossia.backend.common.exception.LoginRateLimitExceededException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe In-Memory Login Rate Limiter & Brute-Force Protection Service.
 * Implements SEC-03 defense-in-depth:
 * 1. IP Flooding Protection: Max 10 login requests per minute per IP address.
 * 2. Account Brute-Force Lockout: 5 consecutive failed login attempts triggers a 15-minute lockout.
 */
@Service
@Slf4j
public class LoginRateLimiterService {

    public static final int MAX_FAILED_ATTEMPTS = 5;
    public static final Duration LOCKOUT_DURATION = Duration.ofMinutes(15);
    public static final int MAX_IP_REQUESTS_PER_MINUTE = 10;
    public static final long IP_WINDOW_MILLIS = 60_000L; // 1 minute sliding window

    private record AccountAttemptRecord(int failedAttempts, Instant lockedUntil) {}

    private final Map<String, AccountAttemptRecord> accountAttempts = new ConcurrentHashMap<>();
    private final Map<String, Deque<Long>> ipRequestTimestamps = new ConcurrentHashMap<>();

    /**
     * Checks if the client IP has exceeded the allowed request frequency.
     * Throws {@link LoginRateLimitExceededException} if rate limit is exceeded.
     */
    public void checkIpRateLimit(String clientIp) {
        if (clientIp == null || clientIp.isBlank()) {
            return;
        }

        String normalizedIp = clientIp.trim();
        long now = System.currentTimeMillis();
        long windowStart = now - IP_WINDOW_MILLIS;

        ipRequestTimestamps.compute(normalizedIp, (ip, deque) -> {
            if (deque == null) {
                deque = new ArrayDeque<>();
            }

            // Evict timestamps outside sliding window
            while (!deque.isEmpty() && deque.peekFirst() < windowStart) {
                deque.pollFirst();
            }

            if (deque.size() >= MAX_IP_REQUESTS_PER_MINUTE) {
                log.warn("CNDP Security Alert: IP {} exceeded login rate limit ({} requests in last 60s)",
                        normalizedIp, deque.size());
                throw new LoginRateLimitExceededException(
                        "Trop de tentatives de connexion depuis cette adresse IP. Veuillez patienter une minute avant de réessayer."
                );
            }

            deque.addLast(now);
            return deque;
        });
    }

    /**
     * Checks if the given account is temporarily locked due to brute-force protection.
     * Throws {@link AccountLockedException} if account is locked.
     */
    public void checkAccountLock(String email) {
        if (email == null || email.isBlank()) {
            return;
        }

        String normalizedEmail = email.trim().toLowerCase();
        AccountAttemptRecord record = accountAttempts.get(normalizedEmail);

        if (record != null && record.lockedUntil() != null) {
            Instant now = Instant.now();
            if (now.isBefore(record.lockedUntil())) {
                long remainingSeconds = Duration.between(now, record.lockedUntil()).toSeconds();
                long remainingMinutes = Math.max(1, (remainingSeconds + 59) / 60);

                log.warn("CNDP Security Alert: Blocked login attempt to locked account {} (remaining: {}s)",
                        normalizedEmail, remainingSeconds);

                throw new AccountLockedException(
                        "Ce compte médical a été temporairement verrouillé suite à " + MAX_FAILED_ATTEMPTS +
                                " tentatives infructueuses. Veuillez réessayer dans " + remainingMinutes + " minute(s).",
                        remainingSeconds
                );
            } else {
                // Lockout window expired: reset state
                accountAttempts.remove(normalizedEmail);
            }
        }
    }

    /**
     * Records a failed login attempt for the specified email and client IP.
     * If failed attempts reach the threshold, the account is locked for 15 minutes.
     */
    public void recordFailedAttempt(String email, String clientIp) {
        if (email == null || email.isBlank()) {
            return;
        }

        String normalizedEmail = email.trim().toLowerCase();

        accountAttempts.compute(normalizedEmail, (key, existing) -> {
            int newCount = (existing != null) ? existing.failedAttempts() + 1 : 1;
            Instant lockedUntil = null;

            if (newCount >= MAX_FAILED_ATTEMPTS) {
                lockedUntil = Instant.now().plus(LOCKOUT_DURATION);
                log.warn("CNDP Security Alert: Account {} LOCKED for 15 minutes following {} consecutive failed login attempts from IP {}",
                        normalizedEmail, newCount, clientIp);
            } else {
                log.info("Failed login attempt #{} for account {} from IP {}", newCount, normalizedEmail, clientIp);
            }

            return new AccountAttemptRecord(newCount, lockedUntil);
        });
    }

    /**
     * Resets the failed attempts counter for the specified email upon successful login.
     */
    public void recordSuccessfulLogin(String email, String clientIp) {
        if (email == null || email.isBlank()) {
            return;
        }

        String normalizedEmail = email.trim().toLowerCase();
        accountAttempts.remove(normalizedEmail);
        log.info("Successful login for account {} from IP {}", normalizedEmail, clientIp);
    }

    /**
     * Returns the current failed attempts count for an email.
     */
    public int getFailedAttempts(String email) {
        if (email == null || email.isBlank()) {
            return 0;
        }
        AccountAttemptRecord record = accountAttempts.get(email.trim().toLowerCase());
        return record != null ? record.failedAttempts() : 0;
    }

    /**
     * Resets state for testing or administrative unlock.
     */
    public void reset(String email) {
        if (email != null) {
            accountAttempts.remove(email.trim().toLowerCase());
        }
    }

    /**
     * Clears all tracking state (used in unit/integration test teardowns).
     */
    public void clearAll() {
        accountAttempts.clear();
        ipRequestTimestamps.clear();
    }
}
