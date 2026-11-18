package com.dossia.backend.auth.web;

import com.dossia.backend.auth.dto.AuthRequest;
import com.dossia.backend.auth.dto.AuthResponse;
import com.dossia.backend.auth.dto.UserProfileResponse;
import com.dossia.backend.auth.security.JwtService;
import com.dossia.backend.auth.security.TokenRevocationService;
import com.dossia.backend.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    public static final String AUTH_COOKIE_NAME = "dossia_token";

    private final AuthService authService;
    private final JwtService jwtService;
    private final TokenRevocationService tokenRevocationService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody AuthRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        String clientIp = resolveClientIp(httpRequest);
        AuthResponse authResponse = authService.login(request, clientIp);

        // SEC-05: Store JWT in an HttpOnly, SameSite=Strict cookie to prevent XSS exfiltration
        ResponseCookie cookie = ResponseCookie.from(AUTH_COOKIE_NAME, authResponse.token())
                .httpOnly(true)
                .secure(httpRequest.isSecure())
                .path("/")
                .maxAge(Duration.ofDays(1))
                .sameSite("Strict")
                .build();

        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        // SEC-06: Invalidate JWT token so it cannot be reused even if intercepted or replayed
        String jwt = extractJwt(httpRequest);
        if (jwt != null && !jwt.isBlank()) {
            try {
                String jti = jwtService.extractJti(jwt);
                UUID userId = jwtService.extractUserId(jwt);
                Instant expiresAt = jwtService.extractExpiration(jwt);
                if (jti != null) {
                    tokenRevocationService.revokeToken(jti, userId, expiresAt, "LOGOUT");
                }
            } catch (Exception ex) {
                // If token has parsing issues, continue to clear cookie
            }
        }

        // Clear HttpOnly authentication cookie
        ResponseCookie cookie = ResponseCookie.from(AUTH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(httpRequest.isSecure())
                .path("/")
                .maxAge(Duration.ZERO)
                .sameSite("Strict")
                .build();

        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.noContent().build();
    }

    private String extractJwt(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if (AUTH_COOKIE_NAME.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                    return cookie.getValue().trim();
                }
            }
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        return null;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me() {
        return ResponseEntity.ok(authService.getCurrentProfile());
    }

    private String resolveClientIp(HttpServletRequest request) {
        if (request == null) {
            return "127.0.0.1";
        }
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            int commaIdx = xForwardedFor.indexOf(',');
            return commaIdx > 0 ? xForwardedFor.substring(0, commaIdx).trim() : xForwardedFor.trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }
}
