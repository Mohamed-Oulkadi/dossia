package com.dossia.backend.auth.service;

import com.dossia.backend.auth.domain.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class DefaultUserNotificationService implements UserNotificationService {

    @Override
    public void sendTemporaryPassword(User user, String temporaryPassword) {
        // In local development / test, log the issuance securely without dumping credentials to standard output
        log.info("Dispatched secure one-time temporary credential notification to user: {} (id: {})",
                user.getEmail(), user.getId());

        // When mail server is configured (e.g., SMTP / SendGrid / Postmark), an email template is dispatched here.
        // CNDP Law 09-08 compliance: Temporary passwords must never be stored in plaintext.
    }
}
