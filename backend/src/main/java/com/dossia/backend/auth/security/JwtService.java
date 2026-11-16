package com.dossia.backend.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMs;

    public static final int MINIMUM_SECRET_LENGTH = 32;

    public JwtService(
            @Value("${dossia.security.jwt.secret}") String secret,
            @Value("${dossia.security.jwt.expiration-ms:86400000}") long expirationMs // 24 hours default
    ) {
        if (secret == null || secret.trim().length() < MINIMUM_SECRET_LENGTH) {
            throw new IllegalStateException(
                    "Le secret cryptographique JWT (dossia.security.jwt.secret / JWT_SECRET) doit comporter au moins 32 caractères (256 bits). " +
                    "La présence de secrets hardcodés par défaut est strictement interdite (CWE-321 / SEC-04)."
            );
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.trim().getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(UserPrincipal principal) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        var builder = Jwts.builder()
                .subject(principal.getUsername())
                .claim("userId", principal.getId().toString())
                .claim("role", principal.getRole().name())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(signingKey);

        if (principal.getClinicId() != null) {
            builder.claim("clinic_id", principal.getClinicId().toString());
            builder.claim("clinicId", principal.getClinicId().toString());
        }

        return builder.compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public UUID extractClinicId(String token) {
        Claims claims = extractAllClaims(token);
        String clinicIdStr = claims.get("clinic_id", String.class);
        if (clinicIdStr == null) {
            clinicIdStr = claims.get("clinicId", String.class);
        }
        return clinicIdStr != null ? UUID.fromString(clinicIdStr) : null;
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public UUID extractUserId(String token) {
        String userIdStr = extractClaim(token, claims -> claims.get("userId", String.class));
        return userIdStr != null ? UUID.fromString(userIdStr) : null;
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
