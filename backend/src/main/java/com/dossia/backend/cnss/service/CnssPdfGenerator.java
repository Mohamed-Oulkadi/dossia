package com.dossia.backend.cnss.service;

import com.dossia.backend.cnss.domain.FeuilleDeSoins;
import com.dossia.backend.cnss.domain.FormType;
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
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@Slf4j
public class CnssPdfGenerator {

    private static final ZoneId CASABLANCA_ZONE = ZoneId.of("Africa/Casablanca");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.FRENCH);
    private static final String DEFAULT_INPE = "102938475"; // Official 9-digit ANAM INPE

    public byte[] generateFeuilleDeSoinsPdf(
            FeuilleDeSoins feuille,
            PatientResponse patient,
            BigDecimal amountPaid,
            LocalDate careDate
    ) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 35, 35, 30, 30);
            PdfWriter.getInstance(document, out);
            document.open();

            // Official Theme Colors
            Color colorBorder = new Color(51, 65, 85);    // Slate 700 (Crisp official borders)
            Color colorBgSection = new Color(241, 245, 249); // Slate 100
            Color colorTextDark = new Color(15, 23, 42);   // Slate 900
            Color colorTextMuted = new Color(71, 85, 105); // Slate 600
            Color colorAccent = new Color(15, 118, 110);   // Teal 700 (Official AMO Moroccan green/teal)

            // Fonts
            Font fontKingdom = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, colorTextDark);
            Font fontHeaderTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, colorAccent);
            Font fontHeaderSubtitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, colorTextDark);
            Font fontBadge = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, colorTextDark);

            Font fontSectionHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
            Font fontFieldLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, colorTextMuted);
            Font fontFieldValue = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, colorTextDark);
            Font fontFieldValueNormal = FontFactory.getFont(FontFactory.HELVETICA, 8.5f, colorTextDark);

            Font fontBoxDigit = FontFactory.getFont(FontFactory.COURIER_BOLD, 10, colorTextDark);
            Font fontTableHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, colorTextDark);
            Font fontTableBody = FontFactory.getFont(FontFactory.HELVETICA, 8, colorTextDark);
            Font fontTableMoney = FontFactory.getFont(FontFactory.COURIER_BOLD, 9, colorTextDark);

            Font fontLegal = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 7, colorTextMuted);
            Font fontFooter = FontFactory.getFont(FontFactory.HELVETICA, 7, new Color(148, 163, 184));

            // ── 1. Official Header ──
            PdfPTable topHeader = new PdfPTable(3);
            topHeader.setWidthPercentage(100);
            topHeader.setWidths(new float[]{30, 45, 25});

            // Kingdom Header Left
            PdfPCell cLeft = new PdfPCell();
            cLeft.setBorder(Rectangle.NO_BORDER);
            cLeft.addElement(new Paragraph("ROYAUME DU MAROC", fontKingdom));
            cLeft.addElement(new Paragraph("Ministère de la Santé", fontFieldLabel));
            cLeft.addElement(new Paragraph("ANAM — Assurance Maladie", fontFieldLabel));
            topHeader.addCell(cLeft);

            // Title Center
            PdfPCell cMid = new PdfPCell();
            cMid.setBorder(Rectangle.NO_BORDER);
            cMid.setHorizontalAlignment(Element.ALIGN_CENTER);
            Paragraph pAmo = new Paragraph("FEUILLE DE SOINS MALADIE", fontHeaderTitle);
            pAmo.setAlignment(Element.ALIGN_CENTER);
            cMid.addElement(pAmo);
            Paragraph pSub = new Paragraph("Soins Ambulatoires & Consultations (Modèle FIP-1)", fontHeaderSubtitle);
            pSub.setAlignment(Element.ALIGN_CENTER);
            cMid.addElement(pSub);
            topHeader.addCell(cMid);

            // Insurance Type Badge Right
            PdfPCell cRight = new PdfPCell();
            cRight.setBorderColor(colorBorder);
            cRight.setBackgroundColor(colorBgSection);
            cRight.setPadding(6);
            cRight.setHorizontalAlignment(Element.ALIGN_CENTER);
            String formName = feuille.getFormType() == FormType.CNSS ? "C.N.S.S." : feuille.getFormType().name();
            Paragraph pBadge = new Paragraph("RÉGIME : " + formName, fontBadge);
            pBadge.setAlignment(Element.ALIGN_CENTER);
            cRight.addElement(pBadge);
            Paragraph pRef = new Paragraph("N° Dossier: " + feuille.getId().toString().substring(0, 8).toUpperCase(), fontFieldLabel);
            pRef.setAlignment(Element.ALIGN_CENTER);
            cRight.addElement(pRef);
            topHeader.addCell(cRight);

            document.add(topHeader);
            document.add(new Paragraph(" "));

            // ── 2. Cadre I : Le Praticien Traitant (Doctor & Structured INPE Box) ──
            PdfPTable docSectionTitle = new PdfPTable(1);
            docSectionTitle.setWidthPercentage(100);
            PdfPCell secCell1 = new PdfPCell(new Phrase("1. IDENTIFICATION DU MÉDECIN TRAITANT", fontSectionHeader));
            secCell1.setBackgroundColor(colorAccent);
            secCell1.setPadding(4);
            docSectionTitle.addCell(secCell1);
            document.add(docSectionTitle);

            PdfPTable docTable = new PdfPTable(2);
            docTable.setWidthPercentage(100);
            docTable.setWidths(new float[]{55, 45});

            // Doctor details left
            PdfPCell docInfoCell = new PdfPCell();
            docInfoCell.setBorderColor(colorBorder);
            docInfoCell.setPadding(6);
            docInfoCell.addElement(new Paragraph("Nom et Prénom du Praticien :", fontFieldLabel));
            docInfoCell.addElement(new Paragraph("Dr. Amina Benjelloun", fontFieldValue));
            docInfoCell.addElement(new Paragraph("Qualification / Spécialité :", fontFieldLabel));
            docInfoCell.addElement(new Paragraph("Médecine Générale — Cabinet Dossia", fontFieldValueNormal));
            docInfoCell.addElement(new Paragraph("Adresse : Casablanca, Maroc  |  ICE: 002345678000091", fontFieldLabel));
            docTable.addCell(docInfoCell);

            // Doctor INPE Structured Boxed Grid Right
            PdfPCell docInpeCell = new PdfPCell();
            docInpeCell.setBorderColor(colorBorder);
            docInpeCell.setPadding(6);
            docInpeCell.addElement(new Paragraph("Code I.N.P.E. du Médecin (Obligatoire ANAM) :", fontFieldLabel));
            docInpeCell.addElement(new Paragraph(" "));
            PdfPTable inpeBoxTable = createBoxedDigitsTable(DEFAULT_INPE, 9, fontBoxDigit, colorBorder, colorBgSection);
            docInpeCell.addElement(inpeBoxTable);
            docInpeCell.addElement(new Paragraph(" "));
            docInpeCell.addElement(new Paragraph("Identifiant Fiscal (IF): 45892134  |  Patente: 38291045", fontFieldLabel));
            docTable.addCell(docInpeCell);

            document.add(docTable);
            document.add(new Paragraph(" "));

            // ── 3. Cadre II : L'Assuré & Le Bénéficiaire (Patient & Structured CNSS Box) ──
            PdfPTable patSectionTitle = new PdfPTable(1);
            patSectionTitle.setWidthPercentage(100);
            PdfPCell secCell2 = new PdfPCell(new Phrase("2. IDENTIFICATION DE L'ASSURÉ(E) & DU MALADE", fontSectionHeader));
            secCell2.setBackgroundColor(colorAccent);
            secCell2.setPadding(4);
            patSectionTitle.addCell(secCell2);
            document.add(patSectionTitle);

            PdfPTable patTable = new PdfPTable(2);
            patTable.setWidthPercentage(100);
            patTable.setWidths(new float[]{55, 45});

            // Patient Identity Left
            PdfPCell patInfoCell = new PdfPCell();
            patInfoCell.setBorderColor(colorBorder);
            patInfoCell.setPadding(6);
            patInfoCell.addElement(new Paragraph("Nom et Prénom de l'Assuré(e) :", fontFieldLabel));
            patInfoCell.addElement(new Paragraph(patient.firstName() + " " + patient.lastName(), fontFieldValue));
            patInfoCell.addElement(new Paragraph("N° C.I.N. (Carte d'Identité Nationale) :", fontFieldLabel));
            patInfoCell.addElement(new Paragraph(patient.cin() != null ? patient.cin() : "Non renseigné", fontFieldValue));
            String birthStr = patient.birthDate() != null ? patient.birthDate().format(DATE_FORMATTER) : "Non renseignée";
            patInfoCell.addElement(new Paragraph("Date de Naissance : " + birthStr + "  |  Tél : " + (patient.phoneNumber() != null ? patient.phoneNumber() : "-"), fontFieldLabel));
            patTable.addCell(patInfoCell);

            // Patient CNSS Structured Boxed Grid Right
            PdfPCell patCnssCell = new PdfPCell();
            patCnssCell.setBorderColor(colorBorder);
            patCnssCell.setPadding(6);
            patCnssCell.addElement(new Paragraph("N° d'Immatriculation CNSS / CNOPS :", fontFieldLabel));
            patCnssCell.addElement(new Paragraph(" "));
            String cleanCnss = patient.cnssNumber() != null ? patient.cnssNumber().replaceAll("[^a-zA-Z0-9]", "") : "";
            PdfPTable cnssBoxTable = createBoxedDigitsTable(cleanCnss, 9, fontBoxDigit, colorBorder, colorBgSection);
            patCnssCell.addElement(cnssBoxTable);
            patCnssCell.addElement(new Paragraph(" "));
            patCnssCell.addElement(new Paragraph("Qualité du Malade : [X] Assuré lui-même   [ ] Conjoint   [ ] Enfant", fontFieldLabel));
            patTable.addCell(patCnssCell);

            document.add(patTable);
            document.add(new Paragraph(" "));

            // ── 4. Cadre III : Actes Médicaux & Honoraires (NGAP) ──
            PdfPTable actesSectionTitle = new PdfPTable(1);
            actesSectionTitle.setWidthPercentage(100);
            PdfPCell secCell3 = new PdfPCell(new Phrase("3. ACTES MÉDICAUX & DÉCOMPTE DES HONORAIRES (NOMENCLATURE NGAP)", fontSectionHeader));
            secCell3.setBackgroundColor(colorAccent);
            secCell3.setPadding(4);
            actesSectionTitle.addCell(secCell3);
            document.add(actesSectionTitle);

            PdfPTable actsTable = new PdfPTable(6);
            actsTable.setWidthPercentage(100);
            actsTable.setWidths(new float[]{18, 36, 12, 10, 12, 12});

            addHeaderCell(actsTable, "Date Soins", fontTableHeader, colorBgSection, colorBorder);
            addHeaderCell(actsTable, "Désignation de l'Acte Médical", fontTableHeader, colorBgSection, colorBorder);
            addHeaderCell(actsTable, "Code Acte", fontTableHeader, colorBgSection, colorBorder);
            addHeaderCell(actsTable, "Cotation", fontTableHeader, colorBgSection, colorBorder);
            addHeaderCell(actsTable, "Honoraires", fontTableHeader, colorBgSection, colorBorder, Element.ALIGN_RIGHT);
            addHeaderCell(actsTable, "Payé (MAD)", fontTableHeader, colorBgSection, colorBorder, Element.ALIGN_RIGHT);

            String formattedCareDate = careDate != null ? careDate.format(DATE_FORMATTER) : LocalDate.now(CASABLANCA_ZONE).format(DATE_FORMATTER);
            BigDecimal fee = amountPaid != null ? amountPaid : new BigDecimal("300.00");

            addBodyCell(actsTable, formattedCareDate, fontTableBody, colorBorder, Element.ALIGN_LEFT);
            addBodyCell(actsTable, "Consultation Médicale au Cabinet", fontTableBody, colorBorder, Element.ALIGN_LEFT);
            addBodyCell(actsTable, "C", fontTableBody, colorBorder, Element.ALIGN_CENTER);
            addBodyCell(actsTable, "1.0", fontTableBody, colorBorder, Element.ALIGN_CENTER);
            addBodyCell(actsTable, formatMAD(fee), fontTableMoney, colorBorder, Element.ALIGN_RIGHT);
            addBodyCell(actsTable, formatMAD(fee), fontTableMoney, colorBorder, Element.ALIGN_RIGHT);

            document.add(actsTable);

            // ── 5. Total & Signature Boxes ──
            PdfPTable footerBoxes = new PdfPTable(2);
            footerBoxes.setWidthPercentage(100);
            footerBoxes.setWidths(new float[]{50, 50});

            PdfPCell patientSignCell = new PdfPCell();
            patientSignCell.setBorderColor(colorBorder);
            patientSignCell.setPadding(8);
            patientSignCell.addElement(new Paragraph("Signature de l'Assuré(e) :", fontFieldLabel));
            patientSignCell.addElement(new Paragraph("\nJe certifie l'exactitude des informations portées ci-dessus.", fontLegal));
            patientSignCell.addElement(new Paragraph("\n___________________________", fontFieldLabel));
            footerBoxes.addCell(patientSignCell);

            PdfPCell docSignCell = new PdfPCell();
            docSignCell.setBorderColor(colorBorder);
            docSignCell.setPadding(8);
            docSignCell.addElement(new Paragraph("Cachet & Signature du Médecin Traitant :", fontFieldLabel));
            docSignCell.addElement(new Paragraph("Honoraires perçus : " + formatMAD(fee), fontFieldValue));
            docSignCell.addElement(new Paragraph("\n___________________________", fontFieldLabel));
            footerBoxes.addCell(docSignCell);

            document.add(footerBoxes);

            // ── 6. Legal & CNDP Watermark Footer ──
            document.add(new Paragraph(" "));
            Paragraph cndpPara = new Paragraph(
                    "Ce document est conforme au modèle officiel ANAM pour le remboursement AMO. " +
                    "Traitement automatisé sécurisé par Dossia SaaS Maroc. Conformité CNDP Loi 09-08.",
                    fontFooter
            );
            cndpPara.setAlignment(Element.ALIGN_CENTER);
            document.add(cndpPara);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Erreur lors de la génération de la Feuille de Soins PDF {}", feuille.getId(), e);
            throw new RuntimeException("Échec de génération de la Feuille de Soins PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Build an authentic Moroccan boxed-digit grid where each character is placed in an individual rectangular cell.
     */
    private PdfPTable createBoxedDigitsTable(
            String code,
            int totalBoxes,
            Font font,
            Color borderColor,
            Color bgColor
    ) {
        PdfPTable table = new PdfPTable(totalBoxes);
        table.setWidthPercentage(90);

        String padded = code != null ? code.trim() : "";
        while (padded.length() < totalBoxes) {
            padded += " ";
        }

        for (int i = 0; i < totalBoxes; i++) {
            char ch = i < padded.length() ? padded.charAt(i) : ' ';
            PdfPCell cell = new PdfPCell(new Phrase(String.valueOf(ch), font));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setPadding(3);
            cell.setFixedHeight(18);
            cell.setBorderColor(borderColor);
            cell.setBackgroundColor(bgColor);
            table.addCell(cell);
        }

        return table;
    }

    private void addHeaderCell(PdfPTable table, String text, Font font, Color bg, Color border) {
        addHeaderCell(table, text, font, bg, border, Element.ALIGN_LEFT);
    }

    private void addHeaderCell(PdfPTable table, String text, Font font, Color bg, Color border, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setBorderColor(border);
        cell.setPadding(4);
        cell.setHorizontalAlignment(align);
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String text, Font font, Color border, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorderColor(border);
        cell.setPadding(5);
        cell.setHorizontalAlignment(align);
        table.addCell(cell);
    }

    private String formatMAD(BigDecimal amount) {
        if (amount == null) return "0,00 MAD";
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.FRENCH);
        symbols.setGroupingSeparator(' ');
        symbols.setDecimalSeparator(',');
        DecimalFormat df = new DecimalFormat("#,##0.00", symbols);
        return df.format(amount) + " MAD";
    }
}
