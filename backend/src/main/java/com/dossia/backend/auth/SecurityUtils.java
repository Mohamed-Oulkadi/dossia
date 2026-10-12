package com.dossia.backend.auth;

import com.dossia.backend.auth.domain.UserRole;
import com.dossia.backend.auth.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

/**
 * Public Security Utilities for Dossia Multi-Tenancy & Authorization enforcement.
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    public static Optional<UserPrincipal> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }

    /**
     * Extracts the active tenant clinic ID from the SecurityContext.
     * Returns null for unauthenticated contexts or SUPER_ADMIN users.
     */
    public static UUID getCurrentClinicId() {
        return getCurrentUser()
                .map(UserPrincipal::getClinicId)
                .orElse(null);
    }

    public static Optional<UserRole> getCurrentRole() {
        return getCurrentUser().map(UserPrincipal::getRole);
    }

    public static boolean isDoctor() {
        return getCurrentRole().filter(r -> r == UserRole.DOCTOR).isPresent();
    }

    public static boolean isSecretary() {
        return getCurrentRole().filter(r -> r == UserRole.SECRETARY).isPresent();
    }

    public static boolean isSuperAdmin() {
        return getCurrentRole().filter(r -> r == UserRole.SUPER_ADMIN).isPresent();
    }
}
