package com.dossia.backend.auth.service;

import com.dossia.backend.auth.SecurityUtils;
import com.dossia.backend.auth.domain.Clinic;
import com.dossia.backend.auth.domain.SubscriptionStatus;
import com.dossia.backend.auth.domain.User;
import com.dossia.backend.auth.dto.AuthRequest;
import com.dossia.backend.auth.dto.AuthResponse;
import com.dossia.backend.auth.dto.UserProfileResponse;
import com.dossia.backend.auth.repository.ClinicRepository;
import com.dossia.backend.auth.repository.UserRepository;
import com.dossia.backend.auth.security.JwtService;
import com.dossia.backend.auth.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final ClinicRepository clinicRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Adresse email ou mot de passe incorrect."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Adresse email ou mot de passe incorrect.");
        }

        if (!user.isActive()) {
            throw new DisabledException("Votre compte utilisateur est désactivé. Veuillez contacter l'administrateur.");
        }

        String clinicName = null;
        if (user.getClinicId() != null) {
            Clinic clinic = clinicRepository.findById(user.getClinicId())
                    .orElse(null);

            if (clinic != null) {
                if (clinic.getSubscriptionStatus() == SubscriptionStatus.SUSPENDED) {
                    throw new LockedException("L'abonnement de votre établissement médical est actuellement suspendu.");
                }
                clinicName = clinic.getName();
            }
        }

        UserPrincipal principal = UserPrincipal.from(user);
        String token = jwtService.generateToken(principal);

        UserProfileResponse userProfile = new UserProfileResponse(
                user.getId(),
                user.getClinicId(),
                clinicName,
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole()
        );

        return AuthResponse.of(token, userProfile);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentProfile() {
        UserPrincipal principal = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new BadCredentialsException("Aucune session active détectée."));

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadCredentialsException("Utilisateur introuvable."));

        String clinicName = null;
        if (user.getClinicId() != null) {
            clinicName = clinicRepository.findById(user.getClinicId())
                    .map(Clinic::getName)
                    .orElse(null);
        }

        return new UserProfileResponse(
                user.getId(),
                user.getClinicId(),
                clinicName,
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
