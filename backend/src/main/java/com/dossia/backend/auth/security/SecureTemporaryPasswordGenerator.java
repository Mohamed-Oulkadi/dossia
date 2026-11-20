package com.dossia.backend.auth.security;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Generates cryptographically secure, high-entropy temporary passwords
 * meeting Moroccan CNDP and OWASP password complexity recommendations.
 */
@Component
public class SecureTemporaryPasswordGenerator {

    private static final String UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude I, O to avoid visual confusion
    private static final String LOWER = "abcdefghijkmnopqrstuvwxyz"; // exclude l to avoid visual confusion
    private static final String DIGITS = "23456789";                  // exclude 0, 1
    private static final String SYMBOLS = "!@#$%^&*()-_=+";
    private static final String ALL_CHARS = UPPER + LOWER + DIGITS + SYMBOLS;
    private static final int DEFAULT_LENGTH = 16;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generates a 16-character temporary password with guaranteed entropy:
     * - At least 2 uppercase letters
     * - At least 2 lowercase letters
     * - At least 2 digits
     * - At least 2 special symbols
     * - Remainder filled randomly and Fisher-Yates shuffled.
     */
    public String generate() {
        return generate(DEFAULT_LENGTH);
    }

    public String generate(int length) {
        if (length < 12) {
            length = DEFAULT_LENGTH;
        }

        List<Character> passwordChars = new ArrayList<>(length);

        // Guarantee diversity
        appendRandomChars(passwordChars, UPPER, 2);
        appendRandomChars(passwordChars, LOWER, 2);
        appendRandomChars(passwordChars, DIGITS, 2);
        appendRandomChars(passwordChars, SYMBOLS, 2);

        // Fill remaining slots
        int remaining = length - passwordChars.size();
        appendRandomChars(passwordChars, ALL_CHARS, remaining);

        // Cryptographically shuffle positions
        Collections.shuffle(passwordChars, secureRandom);

        StringBuilder sb = new StringBuilder(length);
        for (char c : passwordChars) {
            sb.append(c);
        }
        return sb.toString();
    }

    private void appendRandomChars(List<Character> list, String pool, int count) {
        for (int i = 0; i < count; i++) {
            int index = secureRandom.nextInt(pool.length());
            list.add(pool.charAt(index));
        }
    }
}
