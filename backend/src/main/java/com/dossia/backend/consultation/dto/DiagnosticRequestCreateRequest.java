package com.dossia.backend.consultation.dto;

import com.dossia.backend.consultation.domain.DiagnosticRequestType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record DiagnosticRequestCreateRequest(
        @NotNull(message = "Le type de demande (BIOLOGIE ou RADIOLOGIE) est obligatoire")
        DiagnosticRequestType requestType,
        @NotEmpty(message = "Au moins un examen doit être sélectionné")
        List<String> items,
        String clinicalIndication
) {}
