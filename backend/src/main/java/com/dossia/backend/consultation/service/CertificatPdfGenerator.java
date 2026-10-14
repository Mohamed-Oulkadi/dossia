package com.dossia.backend.consultation.service;

import com.dossia.backend.consultation.domain.MedicalCertificate;
import com.dossia.backend.consultation.domain.MedicalCertificateType;
import com.dossia.backend.patient.dto.PatientResponse;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@Slf4j
public class CertificatPdfGenerator {

    private static final ZoneId CASABLANCA_ZONE = ZoneId.of("Africa/Casablanca");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy", Locale.FRENCH);
    private static final DateTimeFormatter DATE_SHORT_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.FRENCH);

    public byte[] generateCertificatePdf(MedicalCertificate cert, PatientResponse patient) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 45, 45, 45, 45);
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font fontHeaderDoctor = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(15, 23, 42));
            Font fontHeaderSubtitle = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(71, 85, 105));
            Font fontHeaderIds = FontFactory.getFont(FontFactory.COURIER_BOLD, 9, new Color(51, 65, 85));

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(15, 23, 42));
            Font fontBody = FontFactory.getFont(FontFactory.HELVETICA, 10.5f, new Color(30, 41, 59));
            Font fontBodyBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10.5f, new Color(15, 23, 42));
            Font fontLegal = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9.5f, new Color(71, 85, 105));

            Font fontFooter = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(148, 163, 184));

            // ── 1. Doctor Header & Clinic Identifiers ──
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60, 40});

            // Doctor Left
            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            leftCell.addElement(new Paragraph("Dr. Amina Benjelloun", fontHeaderDoctor));
            leftCell.addElement(new Paragraph("Médecine Générale & Suivi Clinique", fontHeaderSubtitle));
            leftCell.addElement(new Paragraph("Cabinet Médical Al Amal · Boulevard Hassan II, Casablanca", fontHeaderSubtitle));
            leftCell.addElement(new Paragraph("Tél: +212 5 22 12 34 56 · Fax: +212 5 22 12 34 57", fontHeaderSubtitle));
            headerTable.addCell(leftCell);

            // Identifiers Right
            PdfPCell rightCell = new PdfPCell();
            rightCell.setBorder(Rectangle.NO_BORDER);
            rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph id1 = new Paragraph("INPE: 100234567", fontHeaderIds);
            id1.setAlignment(Element.ALIGN_RIGHT);
            Paragraph id2 = new Paragraph("N° Ordre: 14285/C", fontHeaderIds);
            id2.setAlignment(Element.ALIGN_RIGHT);
            Paragraph id3 = new Paragraph("ICE: 001928374000082", fontHeaderSubtitle);
            id3.setAlignment(Element.ALIGN_RIGHT);
            rightCell.addElement(id1);
            rightCell.addElement(id2);
            rightCell.addElement(id3);
            headerTable.addCell(rightCell);

            document.add(headerTable);

            // Hairline separator
            document.add(new Paragraph(" "));
            LineSeparator sep = new LineSeparator(1, 100, new Color(203, 213, 225), Element.ALIGN_CENTER, -2);
            document.add(sep);
            document.add(new Paragraph(" "));

            // ── 2. City & Date Banner ──
            LocalDate todayCasablanca = LocalDate.now(CASABLANCA_ZONE);
            Paragraph datePara = new Paragraph("Fait à Casablanca, le " + todayCasablanca.format(DATE_FORMATTER), fontBody);
            datePara.setAlignment(Element.ALIGN_RIGHT);
            datePara.setSpacingAfter(25);
            document.add(datePara);

            // ── 3. Certificate Title ──
            String titleText;
            if (cert.getCertificateType() == MedicalCertificateType.ARRET_TRAVAIL) {
                titleText = Boolean.TRUE.equals(cert.getIsProlongation())
                        ? "CERTIFICAT MÉDICAL DE PROLONGATION D'ARRÊT DE TRAVAIL"
                        : "CERTIFICAT MÉDICAL INITIAL D'ARRÊT DE TRAVAIL";
            } else if (cert.getCertificateType() == MedicalCertificateType.APTITUDE) {
                titleText = "CERTIFICAT MÉDICAL D'APTITUDE PHYSIQUE";
            } else if (cert.getCertificateType() == MedicalCertificateType.SPORT) {
                titleText = "CERTIFICAT MÉDICAL D'APTITUDE À LA PRATIQUE SPORTIVE";
            } else {
                titleText = "CERTIFICAT MÉDICAL DE DISPENSE / REPRISE SCOLAIRE";
            }

            Paragraph titlePara = new Paragraph(titleText, fontTitle);
            titlePara.setAlignment(Element.ALIGN_CENTER);
            titlePara.setSpacingAfter(25);
            document.add(titlePara);

            // ── 4. Patient Information & Medical Attestation ──
            String patientName = (patient != null) ? (patient.firstName() + " " + patient.lastName()).toUpperCase() : "LE PATIENT";
            String cin = (patient != null && patient.cin() != null) ? patient.cin() : "Non précisée";
            String patientAgeStr = "âge non précisé";
            if (patient != null && patient.birthDate() != null) {
                int age = Period.between(patient.birthDate(), todayCasablanca).getYears();
                patientAgeStr = age + " ans";
            }

            Paragraph attestation = new Paragraph();
            attestation.setLeading(18f);
            attestation.setSpacingAfter(15);

            attestation.add(new Chunk("Je soussignée, ", fontBody));
            attestation.add(new Chunk("Dr. Amina Benjelloun", fontBodyBold));
            attestation.add(new Chunk(" (INPE: 100234567, Médecin Généraliste), certifie avoir examiné ce jour :\n\n", fontBody));

            attestation.add(new Chunk("Le(la) nommé(e) : ", fontBody));
            attestation.add(new Chunk(patientName + " (" + patientAgeStr + ")\n", fontBodyBold));
            attestation.add(new Chunk("Titulaire de la Carte d'Identité Nationale (CIN) N° : ", fontBody));
            attestation.add(new Chunk(cin + "\n\n", fontBodyBold));

            if (cert.getCertificateType() == MedicalCertificateType.ARRET_TRAVAIL) {
                int days = (cert.getRestDays() != null) ? cert.getRestDays() : 1;
                String daysInWords = FrenchNumberSpellout.toWords(days);

                attestation.add(new Chunk(
                        "et déclare que son état de santé nécessite un repos médical de ", fontBody
                ));
                attestation.add(new Chunk(days + " (" + daysInWords + ") jour(s)", fontBodyBold));
                attestation.add(new Chunk(
                        ", sauf complications ultérieures, à compter du ", fontBody
                ));
                attestation.add(new Chunk(cert.getStartDate().format(DATE_SHORT_FORMATTER), fontBodyBold));
                attestation.add(new Chunk(" jusqu'au ", fontBody));
                attestation.add(new Chunk(cert.getEndDate().format(DATE_SHORT_FORMATTER) + " inclus", fontBodyBold));
                attestation.add(new Chunk(".\n", fontBody));
            } else if (cert.getCertificateType() == MedicalCertificateType.APTITUDE) {
                attestation.add(new Chunk(
                        "et déclare qu'après examen clinique complet ce jour, son état de santé ne présente aucune contre-indication apparente à l'exercice d'une activité professionnelle normale.\n",
                        fontBody
                ));
            } else if (cert.getCertificateType() == MedicalCertificateType.SPORT) {
                attestation.add(new Chunk(
                        "et déclare qu'après examen clinique et cardiovasculaire de repos ce jour, son état de santé ne présente aucune contre-indication médicale apparente à la pratique des activités physiques et sportives.\n",
                        fontBody
                ));
            } else {
                attestation.add(new Chunk(
                        "et déclare que son état de santé justifie une dispense d'activités physiques ou scolaires du " +
                        cert.getStartDate().format(DATE_SHORT_FORMATTER) + " au " + cert.getEndDate().format(DATE_SHORT_FORMATTER) + " inclus.\n",
                        fontBody
                ));
            }

            document.add(attestation);

            // Custom Notes / Observations if present
            if (cert.getCustomNotes() != null && !cert.getCustomNotes().isBlank()) {
                Paragraph notesPara = new Paragraph();
                notesPara.setSpacingBefore(10);
                notesPara.setSpacingAfter(15);
                notesPara.add(new Chunk("Observations / Recommandations complémentaires :\n", fontBodyBold));
                notesPara.add(new Chunk(cert.getCustomNotes(), fontLegal));
                document.add(notesPara);
            }

            // Legal statement
            Paragraph deliverPara = new Paragraph(
                    "Certificat médical délivré en mains propres à l'intéressé(e) pour servir et valoir ce que de droit.",
                    fontLegal
            );
            deliverPara.setSpacingBefore(15);
            deliverPara.setSpacingAfter(25);
            document.add(deliverPara);

            // ── 5. Signature & Stamp Box ──
            PdfPTable signTable = new PdfPTable(2);
            signTable.setWidthPercentage(100);
            signTable.setWidths(new float[]{50, 50});

            PdfPCell signLeft = new PdfPCell();
            signLeft.setBorder(Rectangle.NO_BORDER);
            signTable.addCell(signLeft);

            PdfPCell signRight = new PdfPCell();
            signRight.setBorder(Rectangle.NO_BORDER);
            Paragraph signPara = new Paragraph("Signature & Cachet du Médecin:", fontBody);
            signPara.setAlignment(Element.ALIGN_CENTER);
            signRight.addElement(signPara);

            Paragraph stampSpace = new Paragraph("\n\n\n\n\n", fontBody);
            signRight.addElement(stampSpace);
            signTable.addCell(signRight);

            document.add(signTable);

            // ── 6. Anti-Fraud & CNDP Footer ──
            Paragraph footer = new Paragraph(
                    "Document médical officiel infalsifiable établi sous la responsabilité du praticien. Conforme à la loi CNDP 09-08 et au code de déontologie médicale.",
                    fontFooter
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(35);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Medical Certificate PDF for request {}: {}", cert.getId(), e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la génération du certificat médical PDF", e);
        }
    }
}
