package com.dossia.backend.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminClinicCreateRequest(
        @NotBlank(message = "Le nom du cabinet est obligatoire")
        @Size(max = 150, message = "Le nom du cabinet ne peut pas dépasser 150 caractères")
        String name,

        @NotBlank(message = "L'ICE est obligatoire")
        @Pattern(regexp = "^\\d{15}$", message = "L'ICE marocain doit comporter exactement 15 chiffres")
        String ice,

        @NotBlank(message = "La ville est obligatoire")
        String city,

        @NotBlank(message = "Le prénom du praticien est obligatoire")
        String doctorFirstName,

        @NotBlank(message = "Le nom du praticien est obligatoire")
        String doctorLastName,

        @NotBlank(message = "L'email du praticien est obligatoire")
        @Email(message = "Format d'email invalide")
        String doctorEmail,

        String plan
) {
}
