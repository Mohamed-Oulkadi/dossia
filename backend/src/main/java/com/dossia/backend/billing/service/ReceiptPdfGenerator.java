package com.dossia.backend.billing.service;

import com.dossia.backend.billing.domain.Invoice;
import com.dossia.backend.billing.domain.Payment;
import com.dossia.backend.billing.domain.PaymentMethod;
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
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@Slf4j
public class ReceiptPdfGenerator {

    private static final ZoneId CASABLANCA_ZONE = ZoneId.of("Africa/Casablanca");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy à HH:mm", Locale.FRENCH);
    private static final DateTimeFormatter RECEIPT_NUM_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    public byte[] generateReceiptPdf(Invoice invoice, PatientResponse patient) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A5, 30, 30, 30, 30); // Clean, elegant A5 receipt format
            PdfWriter.getInstance(document, out);
            document.open();

            // Palette
            Color colorDark = new Color(15, 23, 42);      // Slate 900
            Color colorMuted = new Color(100, 116, 139);  // Slate 500
            Color colorBorder = new Color(226, 232, 240); // Slate 200
            Color colorBgLight = new Color(248, 250, 252);// Slate 50
            Color colorAccent = new Color(5, 150, 105);   // Emerald 600

            // Fonts
            Font fontDoctorTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, colorDark);
            Font fontSubtitle = FontFactory.getFont(FontFactory.HELVETICA, 8, colorMuted);
            Font fontFiscalIds = FontFactory.getFont(FontFactory.COURIER_BOLD, 7.5f, new Color(51, 65, 85));

            Font fontDocTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, colorAccent);
            Font fontReceiptId = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, colorDark);

            Font fontLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, colorMuted);
            Font fontValue = FontFactory.getFont(FontFactory.HELVETICA, 8.5f, colorDark);
            Font fontValueBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8.5f, colorDark);

            Font fontTableHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, colorDark);
            Font fontTableBody = FontFactory.getFont(FontFactory.HELVETICA, 8, colorDark);
            Font fontTableMoney = FontFactory.getFont(FontFactory.COURIER_BOLD, 9, colorDark);

            Font fontFooter = FontFactory.getFont(FontFactory.HELVETICA, 6.5f, colorMuted);

            // ── 1. Doctor & Clinic Header ──
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60, 40});

            PdfPCell docCell = new PdfPCell();
            docCell.setBorder(Rectangle.NO_BORDER);
            docCell.addElement(new Paragraph("Dr. Amina Benjelloun", fontDoctorTitle));
            docCell.addElement(new Paragraph("Médecine Générale & Suivi Médical", fontSubtitle));
            docCell.addElement(new Paragraph("Cabinet Médical Dossia — Casablanca", fontSubtitle));
            headerTable.addCell(docCell);

            PdfPCell fiscalCell = new PdfPCell();
            fiscalCell.setBorder(Rectangle.NO_BORDER);
            fiscalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            fiscalCell.addElement(new Paragraph("INPE: 102938475", fontFiscalIds));
            fiscalCell.addElement(new Paragraph("ICE: 002345678000091", fontFiscalIds));
            fiscalCell.addElement(new Paragraph("IF: 45892134  |  Patente: 38291045", fontFiscalIds));
            headerTable.addCell(fiscalCell);

            document.add(headerTable);

            // Hairline separator
            LineSeparator separator = new LineSeparator(0.5f, 100, colorBorder, Element.ALIGN_CENTER, -4);
            document.add(new Chunk(separator));
            document.add(new Paragraph(" "));

            // ── 2. Receipt Badge & Date ──
            PdfPTable titleTable = new PdfPTable(2);
            titleTable.setWidthPercentage(100);
            titleTable.setWidths(new float[]{60, 40});

            PdfPCell titleCell = new PdfPCell();
            titleCell.setBorder(Rectangle.NO_BORDER);
            titleCell.addElement(new Paragraph("REÇU / NOTE D'HONORAIRES", fontDocTitle));
            String receiptNum = "REC-" + RECEIPT_NUM_FORMATTER.format(invoice.getIssueDate().atZone(CASABLANCA_ZONE)) + "-" + invoice.getId().toString().substring(0, 8).toUpperCase();
            titleCell.addElement(new Paragraph("N° " + receiptNum, fontReceiptId));
            titleTable.addCell(titleCell);

            PdfPCell dateCell = new PdfPCell();
            dateCell.setBorder(Rectangle.NO_BORDER);
            dateCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            String issueDateStr = invoice.getIssueDate().atZone(CASABLANCA_ZONE).format(DATE_FORMATTER);
            Paragraph datePara = new Paragraph("Date: " + issueDateStr, fontValue);
            datePara.setAlignment(Element.ALIGN_RIGHT);
            dateCell.addElement(datePara);
            titleTable.addCell(dateCell);

            document.add(titleTable);
            document.add(new Paragraph(" "));

            // ── 3. Patient Information Box ──
            PdfPTable patientBox = new PdfPTable(2);
            patientBox.setWidthPercentage(100);
            patientBox.setWidths(new float[]{50, 50});

            PdfPCell pCell1 = new PdfPCell();
            pCell1.setBackgroundColor(colorBgLight);
            pCell1.setBorderColor(colorBorder);
            pCell1.setPadding(8);
            pCell1.addElement(new Paragraph("PATIENT(E)", fontLabel));
            pCell1.addElement(new Paragraph(patient.firstName() + " " + patient.lastName(), fontValueBold));
            pCell1.addElement(new Paragraph("CIN: " + (patient.cin() != null ? patient.cin() : "Non renseigné"), fontValue));
            patientBox.addCell(pCell1);

            PdfPCell pCell2 = new PdfPCell();
            pCell2.setBackgroundColor(colorBgLight);
            pCell2.setBorderColor(colorBorder);
            pCell2.setPadding(8);
            pCell2.addElement(new Paragraph("COUVERTURE MÉDICALE", fontLabel));
            pCell2.addElement(new Paragraph(patient.mutuelleType() != null ? patient.mutuelleType() : "Privé / Sans Mutuelle", fontValueBold));
            pCell2.addElement(new Paragraph("Tél: " + (patient.phoneNumber() != null ? patient.phoneNumber() : "-"), fontValue));
            patientBox.addCell(pCell2);

            document.add(patientBox);
            document.add(new Paragraph(" "));

            // ── 4. Financial Breakdown Table ──
            PdfPTable finTable = new PdfPTable(3);
            finTable.setWidthPercentage(100);
            finTable.setWidths(new float[]{50, 25, 25});

            addHeaderCell(finTable, "Prestation / Description", fontTableHeader, colorBgLight, colorBorder);
            addHeaderCell(finTable, "Règlement", fontTableHeader, colorBgLight, colorBorder);
            addHeaderCell(finTable, "Montant", fontTableHeader, colorBgLight, colorBorder, Element.ALIGN_RIGHT);

            // Acte row
            addBodyCell(finTable, "Consultation Médicale & Actes Cliniques", fontTableBody, colorBorder, Element.ALIGN_LEFT);
            addBodyCell(finTable, invoice.getStatus().name(), fontTableBody, colorBorder, Element.ALIGN_LEFT);
            addBodyCell(finTable, formatMAD(invoice.getTotalAmount()), fontTableMoney, colorBorder, Element.ALIGN_RIGHT);

            document.add(finTable);

            // ── 5. Payment Transactions Subtable ──
            if (invoice.getPayments() != null && !invoice.getPayments().isEmpty()) {
                document.add(new Paragraph("Détail des Encaissements:", fontLabel));

                PdfPTable payTable = new PdfPTable(4);
                payTable.setWidthPercentage(100);
                payTable.setWidths(new float[]{30, 25, 25, 20});

                addHeaderCell(payTable, "Date d'encaissement", fontTableHeader, colorBgLight, colorBorder);
                addHeaderCell(payTable, "Mode de Paiement", fontTableHeader, colorBgLight, colorBorder);
                addHeaderCell(payTable, "Référence / N° Chèque", fontTableHeader, colorBgLight, colorBorder);
                addHeaderCell(payTable, "Montant Reçu", fontTableHeader, colorBgLight, colorBorder, Element.ALIGN_RIGHT);

                for (Payment p : invoice.getPayments()) {
                    String pDate = p.getPaymentDate().atZone(CASABLANCA_ZONE).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
                    addBodyCell(payTable, pDate, fontTableBody, colorBorder, Element.ALIGN_LEFT);
                    addBodyCell(payTable, formatPaymentMethod(p.getPaymentMethod()), fontTableBody, colorBorder, Element.ALIGN_LEFT);
                    addBodyCell(payTable, p.getReferenceNumber() != null ? p.getReferenceNumber() : "-", fontTableBody, colorBorder, Element.ALIGN_LEFT);
                    addBodyCell(payTable, formatMAD(p.getAmount()), fontTableMoney, colorBorder, Element.ALIGN_RIGHT);
                }
                document.add(payTable);
            }

            document.add(new Paragraph(" "));

            // ── 6. Totals & Balance Due ──
            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(100);
            totalTable.setWidths(new float[]{65, 35});

            PdfPCell signCell = new PdfPCell();
            signCell.setBorder(Rectangle.NO_BORDER);
            signCell.addElement(new Paragraph("Cachet et Signature du Praticien:", fontLabel));
            signCell.addElement(new Paragraph("\n\n___________________________", fontSubtitle));
            totalTable.addCell(signCell);

            PdfPCell sumCell = new PdfPCell();
            sumCell.setBackgroundColor(colorBgLight);
            sumCell.setBorderColor(colorBorder);
            sumCell.setPadding(8);

            Paragraph totPara = new Paragraph("Total Dû:  " + formatMAD(invoice.getTotalAmount()), fontValueBold);
            totPara.setAlignment(Element.ALIGN_RIGHT);
            sumCell.addElement(totPara);

            Paragraph paidPara = new Paragraph("Total Réglé:  " + formatMAD(invoice.getTotalPaid()), fontValueBold);
            paidPara.setAlignment(Element.ALIGN_RIGHT);
            sumCell.addElement(paidPara);

            Font fontReste = invoice.getRemainingAmount().compareTo(BigDecimal.ZERO) > 0
                    ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9.5f, new Color(220, 38, 38))
                    : FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9.5f, colorAccent);

            Paragraph restePara = new Paragraph("Reste à Payer:  " + formatMAD(invoice.getRemainingAmount()), fontReste);
            restePara.setAlignment(Element.ALIGN_RIGHT);
            sumCell.addElement(restePara);

            totalTable.addCell(sumCell);
            document.add(totalTable);

            // ── 7. Legal Disclaimer Footer ──
            document.add(new Paragraph(" "));
            Paragraph footer = new Paragraph(
                    "Conformément à la loi 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, " +
                    "les informations contenues dans ce reçu sont strictement confidentielles. Dossia Cloud Médical Maroc.",
                    fontFooter
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Erreur lors de la génération du reçu PDF pour la facture {}", invoice.getId(), e);
            throw new RuntimeException("Échec de génération du reçu PDF: " + e.getMessage(), e);
        }
    }

    private void addHeaderCell(PdfPTable table, String text, Font font, Color bg, Color border) {
        addHeaderCell(table, text, font, bg, border, Element.ALIGN_LEFT);
    }

    private void addHeaderCell(PdfPTable table, String text, Font font, Color bg, Color border, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setBorderColor(border);
        cell.setPadding(5);
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

    private String formatPaymentMethod(PaymentMethod method) {
        if (method == null) return "-";
        return switch (method) {
            case ESPECES -> "Espèces";
            case TPE -> "Carte Bancaire (TPE)";
            case CHEQUE -> "Chèque Bancaire";
            case VIREMENT -> "Virement Bancaire";
        };
    }
}
