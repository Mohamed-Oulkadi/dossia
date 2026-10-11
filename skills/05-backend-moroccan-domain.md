# Skill: Moroccan Backend Domain & Regulatory Schemas

> **Scope**: Backend data representations, JPA entity patterns, and validation rules in `backend/`.  
> **Applicability**: All domain packages (`patient`, `agenda`, `billing`, `cnss`).

---

## 1. Currency & Financial Accounting (MAD / Dirhams)

Financial calculations in Moroccan clinics must maintain exact mathematical precision:

1. **Mandatory Type**:
   - Monetary amounts in database columns and Java classes must strictly use `BigDecimal`.
   - Never use `double` or `float` under any circumstances.
2. **Precision & Scale**:
   - JPA Column definition: `@Column(precision = 12, scale = 2, nullable = false)`
   - Rounding rule: Scale of 2 decimal places with `RoundingMode.HALF_UP`:
     ```java
     public static final int MAD_SCALE = 2;
     public static final RoundingMode MAD_ROUNDING = RoundingMode.HALF_UP;

     public static BigDecimal roundMAD(BigDecimal amount) {
         return amount == null ? BigDecimal.ZERO : amount.setScale(MAD_SCALE, MAD_ROUNDING);
     }
     ```
3. **Database Representation (Flyway)**:
   ```sql
   amount_mad NUMERIC(12, 2) NOT NULL DEFAULT 0.00
   ```

---

## 2. Moroccan Identifiers & Validation Annotations

All patient and practitioner data must pass strict Bean Validation before persistence:

### A. INPE (*Identifiant National des Professionnels et Établissements de Santé*)
- **Format**: Exactly 9 numeric digits issued by ANAM / Ministry of Health.
- **Validation**: Enforce via custom `@ValidInpe` constraint:
  ```java
  package com.dossia.backend.common.validation;

  import jakarta.validation.Constraint;
  import jakarta.validation.Payload;
  import java.lang.annotation.*;

  @Documented
  @Constraint(validatedBy = InpeValidator.class)
  @Target({ ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT })
  @Retention(RetentionPolicy.RUNTIME)
  public @interface ValidInpe {
      String message() default "L'identifiant INPE doit comporter exactement 9 chiffres numériques.";
      Class<?>[] groups() default {};
      Class<? extends Payload>[] payload() default {};
  }
  ```
- **Validator**:
  ```java
  public class InpeValidator implements ConstraintValidator<ValidInpe, String> {
      private static final Pattern INPE_PATTERN = Pattern.compile("^\\d{9}$");

      @Override
      public boolean isValid(String value, ConstraintValidatorContext context) {
          return value != null && INPE_PATTERN.matcher(value.trim()).matches();
      }
  }
  ```

### B. ICE (*Identifiant Commun de l'Entreprise*)
- **Format**: Exactly 15 numeric digits representing the medical practice or clinic entity.
- **Regex**: `^\\d{15}$`
- **Validation Message**: *"L'ICE de l'établissement doit comporter exactement 15 chiffres."*

### C. Moroccan Phone Validation
- **Format**: Mobile numbers starting with 6 or 7; fixed landlines starting with 5. Supports both local prefix (`0`) and international format (`+212`).
- **Regex**: `^(?:\\+212|0)[5-7]\\d{8}$`
- **Example Valid Numbers**:
  - `+212661234567` (Mobile)
  - `0661234567` (Local mobile)
  - `+212528123456` (Agadir landline)
  - `0528123456` (Local landline)

---

## 3. CNSS / AMO Insurance & Claim Forms (FIP-1 to FIP-8)

Moroccan social security claims are standardized across specific form models:

| Form Code | Title | Usage in Dossia |
| :--- | :--- | :--- |
| **`FIP-1`** | Feuille de Soins Maladie (Médecine Générale & Spécialisée) | Standard outpatient consultations, diagnoses, and medical prescriptions. |
| **`FIP-2`** | Actes Bucco-Dentaires | Stomatology and dental care claims. |
| **`FIP-3`** | Biologie Médicale & Analyses | Lab tests and biological analyses. |
| **`FIP-4`** | Radiologie & Imagerie Médicale | X-rays, MRI, ultrasounds, and scanning acts. |
| **`FIP-5`** | Optique Médicale | Vision correction and optical devices. |
| **`FIP-6`** | Rééducation & Kinésithérapie | Physical therapy sessions. |
| **`FIP-7`** | Appareillage & Prothèses | Orthopedic and prosthetic devices. |
| **`FIP-8`** | Soins Ambulatoires Divers | Miscellaneous specialized outpatient care. |

All claim records must capture the patient's CNSS registration number, CIN, practitioner INPE, NGAP act codes, and billed amounts in MAD.

---

## 4. CNDP Law 09-08 Compliance (Medical Data Privacy)

Under Moroccan law (Commission Nationale de contrôle de la protection des Données à caractère Personnel - CNDP), clinical health records must meet strict data governance mandates:

### A. Base Auditable Entity
All domain entities must inherit standard auditing fields via Spring Data JPA `@EntityListeners(AuditingEntityListener.class)`:
```java
package com.dossia.backend.common.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public abstract class AuditableEntity {

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @CreatedBy
    @Column(name = "created_by", nullable = false, updatable = false)
    private String createdBy;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @LastModifiedBy
    @Column(name = "updated_by", nullable = false)
    private String updatedBy;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public boolean isDeleted() {
        return deletedAt != null;
    }
}
```

### B. Soft-Delete Guarantee
Medical records and patient histories cannot be physically erased (`DELETE FROM ...`) to maintain legal traceability. They must be soft-deleted by recording `deleted_at = Instant.now()`, ensuring long-term audit trail preservation.
