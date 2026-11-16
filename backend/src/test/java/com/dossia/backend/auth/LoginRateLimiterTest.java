package com.dossia.backend.auth;

import com.dossia.backend.auth.security.LoginRateLimiterService;
import com.dossia.backend.common.exception.AccountLockedException;
import com.dossia.backend.common.exception.LoginRateLimitExceededException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LoginRateLimiterTest {

    private LoginRateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        rateLimiterService = new LoginRateLimiterService();
        rateLimiterService.clearAll();
    }

    @Test
    @DisplayName("IP rate limit allows up to 10 requests per minute and blocks the 11th with HTTP 429")
    void testIpRateLimitEnforcement() {
        String clientIp = "196.200.145.22";

        // First 10 requests within the minute window must pass
        for (int i = 1; i <= 10; i++) {
            rateLimiterService.checkIpRateLimit(clientIp);
        }

        // The 11th request must be rejected with LoginRateLimitExceededException
        assertThatThrownBy(() -> rateLimiterService.checkIpRateLimit(clientIp))
                .isInstanceOf(LoginRateLimitExceededException.class)
                .hasMessageContaining("Trop de tentatives de connexion depuis cette adresse IP");
    }

    @Test
    @DisplayName("Different IP addresses have independent rate limit quotas")
    void testIndependentIpQuotas() {
        String ip1 = "10.0.0.1";
        String ip2 = "10.0.0.2";

        // Saturate ip1
        for (int i = 1; i <= 10; i++) {
            rateLimiterService.checkIpRateLimit(ip1);
        }
        assertThatThrownBy(() -> rateLimiterService.checkIpRateLimit(ip1))
                .isInstanceOf(LoginRateLimitExceededException.class);

        // ip2 must still be unaffected
        rateLimiterService.checkIpRateLimit(ip2);
    }

    @Test
    @DisplayName("Account lockout triggers after exactly 5 consecutive failed login attempts (HTTP 423)")
    void testAccountLockoutAfter5Failures() {
        String email = "dr.amrani@dossia.ma";
        String ip = "192.168.1.50";

        // Attempts 1 to 4 should record failures without locking
        for (int i = 1; i <= 4; i++) {
            rateLimiterService.checkAccountLock(email);
            rateLimiterService.recordFailedAttempt(email, ip);
            assertThat(rateLimiterService.getFailedAttempts(email)).isEqualTo(i);
        }

        // 5th failed attempt triggers the lockout
        rateLimiterService.recordFailedAttempt(email, ip);
        assertThat(rateLimiterService.getFailedAttempts(email)).isEqualTo(5);

        // Subsequent check must throw AccountLockedException
        assertThatThrownBy(() -> rateLimiterService.checkAccountLock(email))
                .isInstanceOf(AccountLockedException.class)
                .hasMessageContaining("temporairement verrouillé")
                .satisfies(ex -> {
                    AccountLockedException lockedEx = (AccountLockedException) ex;
                    assertThat(lockedEx.getRemainingSeconds()).isGreaterThan(0);
                });
    }

    @Test
    @DisplayName("Successful login resets failed attempts counter to zero")
    void testSuccessfulLoginResetsCounter() {
        String email = "secretaire.amina@dossia.ma";
        String ip = "192.168.1.51";

        rateLimiterService.recordFailedAttempt(email, ip);
        rateLimiterService.recordFailedAttempt(email, ip);
        assertThat(rateLimiterService.getFailedAttempts(email)).isEqualTo(2);

        // Successful authentication
        rateLimiterService.recordSuccessfulLogin(email, ip);
        assertThat(rateLimiterService.getFailedAttempts(email)).isEqualTo(0);

        // Account is clear and unlocked
        rateLimiterService.checkAccountLock(email);
    }

    @Test
    @DisplayName("Lockout on one user account does not affect another user account")
    void testAccountIsolation() {
        String victimEmail = "dr.amrani@dossia.ma";
        String otherEmail = "secretaire.amina@dossia.ma";
        String ip = "192.168.1.52";

        // Lock victim account
        for (int i = 1; i <= 5; i++) {
            rateLimiterService.recordFailedAttempt(victimEmail, ip);
        }

        // Victim is locked
        assertThatThrownBy(() -> rateLimiterService.checkAccountLock(victimEmail))
                .isInstanceOf(AccountLockedException.class);

        // Other account is untouched
        rateLimiterService.checkAccountLock(otherEmail);
        assertThat(rateLimiterService.getFailedAttempts(otherEmail)).isEqualTo(0);
    }
}
