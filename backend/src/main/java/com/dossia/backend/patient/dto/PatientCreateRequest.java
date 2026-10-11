package com.dossia.backend.patient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record PatientCreateRequest(
        @NotBlank(message = "Le prénom est obligatoire.")
        String firstName,

        @NotBlank(message = "Le nom est obligatoire.")
        String lastName,

        @NotBlank(message = "Le CIN est obligatoire.")
        @Pattern(regexp = "^[A-Za-z]{1,2}\\d{5,8}$", message = "Format de CIN marocain invalide (ex. JA123456 ou AB12345).")
        String cin,

        @NotBlank(message = "Le numéro de téléphone est obligatoire.")
        @Pattern(regexp = "^(?:\\+212|0)[5-7]\\d{8}$", message = "Format de téléphone marocain invalide (ex. +212661234567 ou 0661234567).")
        String phoneNumber,

        @NotNull(message = "La date de naissance est obligatoire.")
        @Past(message = "La date de naissance doit être dans le passé.")
        LocalDate birthDate,

        String cnssNumber,

        String mutuelleType
) {}
