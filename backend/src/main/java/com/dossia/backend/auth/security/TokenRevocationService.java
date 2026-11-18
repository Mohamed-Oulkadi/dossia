package com.dossia.backend.auth.security;

import com.dossia.backend.auth.domain.RevokedToken;
import com.dossia.backend.auth.domain.User;
import com.dossia.backend.auth.repository.RevokedTokenRepository;
import com.dossia.backend.auth.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenRevocationService {

    private final RevokedTokenRepository revokedTokenRepository;
    private final UserRepository userRepository;

    // Fast in-memory caches to guarantee sub-microsecond latency in JwtAuthenticationFilter
    private final Map<String, Instant> revokedJtiCache = new ConcurrentHashMap<>();
    private final Map<UUID, Instant> userRevocationBarrierCache = new ConcurrentHashMap<>();

    @PostConstruct
    public void initCache() {
        try {
            Instant now = Instant.now();
            revokedTokenRepository.findAllByExpiresAtAfter(now).forEach(r ->
                    revokedJtiCache.put(r.getJti(), r.getExpiresAt())
            );
            log.info("Initialized TokenRevocationService cache with {} active revocations.", revokedJtiCache.size());
        } catch (Exception ex) {
            log.warn("Could not pre-warm TokenRevocationService cache on startup: {}", ex.getMessage());
        }
    }

    /**
     * Revokes a single token identified by its unique JTI.
     */
    @Transactional
    public void revokeToken(String jti, UUID userId, Instant expiresAt, String reason) {
        if (jti == null || jti.isBlank()) {
            return;
        }

        Instant effectiveExpiry = expiresAt != null ? expiresAt : Instant.now().plus(Duration.ofDays(1));
        revokedJtiCache.put(jti, effectiveExpiry);

        try {
            revokedTokenRepository.save(RevokedToken.builder()
                    .jti(jti)
                    .userId(userId)
                    .reason(reason != null ? reason : "LOGOUT")
                    .expiresAt(effectiveExpiry)
                    .revokedAt(Instant.now())
                    .build());
            log.info("Revoked JWT token jti={} (user: {}, reason: {})", jti, userId, reason);
        } catch (Exception ex) {
            log.error("Failed to persist token revocation for jti={}: {}", jti, ex.getMessage());
        }
    }

    /**
     * Invalidates all active tokens for a specific user (e.g., password reset, account suspension).
     */
    @Transactional
    public void revokeAllUserTokens(UUID userId, String reason) {
        if (userId == null) {
            return;
        }

        Instant now = Instant.now();
        userRevocationBarrierCache.put(userId, now);

        try {
            userRepository.findById(userId).ifPresent(user -> {
                user.setTokensRevokedBefore(now);
                userRepository.save(user);
            });
            log.info("Revoked all active tokens for user {} at {} (reason: {})", userId, now, reason);
        } catch (Exception ex) {
            log.error("Failed to persist user token revocation barrier for user {}: {}", userId, ex.getMessage());
        }
    }

    /**
     * High-speed validation checking if a token's JTI is revoked or if it was issued before user-level invalidation barrier.
     */
    public boolean isRevoked(String jti, UUID userId, Instant issuedAt) {
        Instant now = Instant.now();

        // 1. Check granular JTI in in-memory cache
        if (jti != null) {
            Instant expiresAt = revokedJtiCache.get(jti);
            if (expiresAt != null) {
                if (expiresAt.isAfter(now)) {
                    return true;
                } else {
                    revokedJtiCache.remove(jti);
                }
            }
        }

        // 2. Check user-level revocation barrier (tokens issued at or before barrier are invalid)
        if (userId != null && issuedAt != null) {
            Instant barrier = userRevocationBarrierCache.get(userId);
            if (barrier == null) {
                // Fallback check database if not present in memory cache
                try {
                    barrier = userRepository.findById(userId)
                            .map(User::getTokensRevokedBefore)
                            .orElse(null);
                    if (barrier != null) {
                        userRevocationBarrierCache.put(userId, barrier);
                    }
                } catch (Exception ex) {
                    log.debug("Could not check user revocation barrier from DB: {}", ex.getMessage());
                }
            }

            if (barrier != null) {
                // Compare at epoch second resolution because JWT 'iat' claim conforms to RFC 7519 NumericDate (seconds)
                long issuedAtSec = issuedAt.getEpochSecond();
                long barrierSec = barrier.getEpochSecond();
                if (issuedAtSec <= barrierSec) {
                    return true;
                }
            }
        }

        // 3. Fallback check DB for JTI if not found in memory (e.g. multi-node / cache miss)
        if (jti != null) {
            try {
                if (revokedTokenRepository.existsByJti(jti)) {
                    return true;
                }
            } catch (Exception ex) {
                log.debug("Could not verify JTI against DB: {}", ex.getMessage());
            }
        }

        return false;
    }

    /**
     * Scheduled hourly cleanup of naturally expired revocation records.
     */
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void purgeExpiredRevocations() {
        Instant now = Instant.now();
        revokedJtiCache.entrySet().removeIf(entry -> entry.getValue().isBefore(now));

        try {
            int deleted = revokedTokenRepository.deleteExpiredTokens(now);
            if (deleted > 0) {
                log.info("Purged {} expired token revocations from database.", deleted);
            }
        } catch (Exception ex) {
            log.warn("Failed to delete expired token revocations: {}", ex.getMessage());
        }
    }

    /**
     * Test utility to reset cache state.
     */
    public void clearCache() {
        revokedJtiCache.clear();
        userRevocationBarrierCache.clear();
    }
}
