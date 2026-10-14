package com.dossia.backend.consultation.service;

import com.dossia.backend.consultation.domain.DiagnosticRequest;
import com.dossia.backend.consultation.domain.DiagnosticRequestType;
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
import java.util.List;
import java.util.Locale;

@Service
@Slf4j
public class BilanPdfGenerator {

    private static final ZoneId CASABLANCA_ZONE = ZoneId.of("Africa/Casablanca");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy", Locale.FRENCH);

    public byte[] generateBilanPdf(DiagnosticRequest request, List<String> items, PatientResponse patient) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 40, 40, 40, 40);
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font fontHeaderDoctor = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(15, 23, 42));
            Font fontHeaderSubtitle = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(71, 85, 105));
            Font fontHeaderIds = FontFactory.getFont(FontFactory.COURIER_BOLD, 9, new Color(51, 65, 85));

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(15, 23, 42));
            Font fontPatient = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(30, 41, 59));
            Font fontPatientBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(15, 23, 42));

            Font fontSectionHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(30, 41, 59));
            Font fontItem = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10.5f, new Color(15, 23, 42));
            Font fontIndication = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9.5f, new Color(71, 85, 105));

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

            // ── 2. Patient & Date Banner ──
            PdfPTable patientTable = new PdfPTable(2);
            patientTable.setWidthPercentage(100);
            patientTable.setWidths(new float[]{60, 40});

            String patientName = (patient != null) ? (patient.firstName() + " " + patient.lastName()).toUpperCase() : "PATIENT";
            String patientAgeStr = "Âge non précisé";
            if (patient != null && patient.birthDate() != null) {
                int age = Period.between(patient.birthDate(), LocalDate.now(CASABLANCA_ZONE)).getYears();
                patientAgeStr = age + " ans";
            }
            String cinStr = (patient != null && patient.cin() != null) ? patient.cin() : "Non renseignée";

            PdfPCell pLeft = new PdfPCell();
            pLeft.setBorder(Rectangle.NO_BORDER);
            Paragraph pNamePara = new Paragraph();
            pNamePara.add(new Chunk("Patient(e): ", fontPatient));
            pNamePara.add(new Chunk(patientName, fontPatientBold));
            pNamePara.add(new Chunk(" (" + patientAgeStr + " · CIN: " + cinStr + ")", fontPatient));
            pLeft.addElement(pNamePara);
            patientTable.addCell(pLeft);

            LocalDate todayCasablanca = LocalDate.now(CASABLANCA_ZONE);
            PdfPCell pRight = new PdfPCell();
            pRight.setBorder(Rectangle.NO_BORDER);
            Paragraph pDatePara = new Paragraph("Casablanca, le " + todayCasablanca.format(DATE_FORMATTER), fontPatient);
            pDatePara.setAlignment(Element.ALIGN_RIGHT);
            pRight.addElement(pDatePara);
            patientTable.addCell(pRight);

            document.add(patientTable);

            // ── 3. Title ──
            document.add(new Paragraph(" "));
            String titleText = (request.getRequestType() == DiagnosticRequestType.BIOLOGIE)
                    ? "DEMANDE D'EXPLORATION BIOLOGIQUE (BILAN SANGUIN & URINAIRE)"
                    : "DEMANDE D'EXPLORATION RADIOLOGIQUE & IMAGERIE MÉDICALE";
            Paragraph titlePara = new Paragraph(titleText, fontTitle);
            titlePara.setAlignment(Element.ALIGN_CENTER);
            titlePara.setSpacingAfter(12);
            document.add(titlePara);

            // ── 4. Clinical Indication Box (if specified) ──
            if (request.getClinicalIndication() != null && !request.getClinicalIndication().isBlank()) {
                PdfPTable indTable = new PdfPTable(1);
                indTable.setWidthPercentage(100);
                PdfPCell indCell = new PdfPCell();
                indCell.setBackgroundColor(new Color(248, 250, 252));
                indCell.setBorderColor(new Color(226, 232, 240));
                indCell.setPadding(8);

                Paragraph indHeader = new Paragraph("Renseignements Cliniques / Indication:", fontSectionHeader);
                Paragraph indText = new Paragraph(request.getClinicalIndication(), fontIndication);
                indCell.addElement(indHeader);
                indCell.addElement(indText);
                indTable.addCell(indCell);

                indTable.setSpacingAfter(15);
                document.add(indTable);
            }

            // ── 5. List of Requested Exams ──
            Paragraph introExams = new Paragraph("Prière de bien vouloir réaliser les examens complémentaires suivants:", fontPatient);
            introExams.setSpacingAfter(10);
            document.add(introExams);

            if (items != null && !items.isEmpty()) {
                int index = 1;
                for (String exam : items) {
                    Paragraph examPara = new Paragraph();
                    examPara.setSpacingBefore(6);
                    examPara.setSpacingAfter(3);
                    examPara.add(new Chunk("  [ ]  " + index + ". ", fontPatientBold));
                    examPara.add(new Chunk(exam, fontItem));
                    document.add(examPara);
                    index++;
                }
            } else {
                Paragraph noExams = new Paragraph("Aucun examen spécifié.", fontIndication);
                document.add(noExams);
            }

            // ── 6. Signature & Stamp Box ──
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));
            PdfPTable signTable = new PdfPTable(2);
            signTable.setWidthPercentage(100);
            signTable.setWidths(new float[]{50, 50});

            PdfPCell signLeft = new PdfPCell();
            signLeft.setBorder(Rectangle.NO_BORDER);
            signTable.addCell(signLeft);

            PdfPCell signRight = new PdfPCell();
            signRight.setBorder(Rectangle.NO_BORDER);
            Paragraph signPara = new Paragraph("Signature & Cachet du Médecin:", fontPatient);
            signPara.setAlignment(Element.ALIGN_CENTER);
            signRight.addElement(signPara);

            Paragraph stampSpace = new Paragraph("\n\n\n\n", fontPatient);
            signRight.addElement(stampSpace);
            signTable.addCell(signRight);

            document.add(signTable);

            // ── 7. Legal Footer ──
            Paragraph footer = new Paragraph(
                    "Ce document médical est strictement confidentiel. Établi dans le respect de la déontologie médicale et de la loi CNDP 09-08 relative à la protection des données personnelles.",
                    fontFooter
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(30);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Bilan PDF for request {}: {}", request.getId(), e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la génération de la demande de bilan PDF", e);
        }
    }
}
