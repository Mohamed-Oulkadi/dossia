package com.dossia.backend.auth.service;

import com.dossia.backend.auth.domain.User;

public interface UserNotificationService {
    /**
     * Dispatches a temporary password to the user via a secure communication channel (e.g., email / SMS / secure log).
     *
     * @param user the recipient user
     * @param temporaryPassword the plain temporary password generated for first-time login
     */
    void sendTemporaryPassword(User user, String temporaryPassword);
}
