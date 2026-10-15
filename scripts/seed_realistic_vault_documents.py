"""
Seed realistic Moroccan clinical PDFs and medical images into Dossia MinIO Vault & PostgreSQL.
Replaces dummy 40-byte seed files with fully renderable, high-fidelity documents.
"""

import io
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from minio import Minio
import subprocess

def create_cnops_attestation_pdf() -> bytes:
    """Generate authentic CNOPS / AMO Attestation d'Ouverture des Droits PDF."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm
    )
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#0F4C81')  # Moroccan administrative deep blue
    )
    sub_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#4A5568')
    )
    label_bold = ParagraphStyle(
        'LabelBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1A202C')
    )
    val_style = ParagraphStyle(
        'ValStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#2D3748')
    )
    header_th = ParagraphStyle(
        'ThStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        alignment=TA_CENTER,
        textColor=colors.white
    )
    cell_td = ParagraphStyle(
        'TdStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1A202C')
    )
    cell_td_center = ParagraphStyle(
        'TdStyleCenter',
        parent=cell_td,
        alignment=TA_CENTER
    )

    elements = []

    # Moroccan Official Header
    elements.append(Paragraph("<b>ROYAUME DU MAROC</b>", title_style))
    elements.append(Paragraph("Caisse Nationale des Organismes de Prévoyance Sociale (CNOPS)", sub_style))
    elements.append(Paragraph("Assurance Maladie Obligatoire (AMO) — Secteur Public", sub_style))
    elements.append(Spacer(1, 4 * mm))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0F4C81'), spaceAfter=10))

    # Document Header Badge
    elements.append(Paragraph("<b>ATTESTATION D'IMMATRICULATION ET D'OUVERTURE DES DROITS AMO</b>", title_style))
    elements.append(Paragraph("Délivrée en application des dispositions de la Loi n° 65-00 portant Code de la Couverture Médicale de Base", sub_style))
    elements.append(Spacer(1, 6 * mm))

    # Patient / Assuré Table
    patient_data = [
        [
            Paragraph("<b>Nom &amp; Prénom de l'Assuré(e) :</b>", label_bold),
            Paragraph("EL IDRISSI Fatima Zahra", val_style),
            Paragraph("<b>N° d'Immatriculation AMO :</b>", label_bold),
            Paragraph("284759302", val_style),
        ],
        [
            Paragraph("<b>Carte d'Identité Nationale (CIN) :</b>", label_bold),
            Paragraph("BE892341", val_style),
            Paragraph("<b>Date de Naissance :</b>", label_bold),
            Paragraph("23/11/1990", val_style),
        ],
        [
            Paragraph("<b>Organisme Gestionnaire :</b>", label_bold),
            Paragraph("MGPAP (Mutuelle Générale du Personnel)", val_style),
            Paragraph("<b>Statut Couverture :</b>", label_bold),
            Paragraph("<font color='#0D9488'><b>OUVERTS (À JOUR DE COTISATIONS)</b></font>", val_style),
        ],
        [
            Paragraph("<b>Période de Validité des Droits :</b>", label_bold),
            Paragraph("Du 01/01/2026 au 31/12/2026", val_style),
            Paragraph("<b>Taux de Prise en Charge :</b>", label_bold),
            Paragraph("80% Ambulatoire / 90% Hospitalisation", val_style),
        ]
    ]

    t_patient = Table(patient_data, colWidths=[4.2 * cm, 4.5 * cm, 4.2 * cm, 4.5 * cm])
    t_patient.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(t_patient)
    elements.append(Spacer(1, 6 * mm))

    # Eligible Beneficiaries Table
    elements.append(Paragraph("<b>1. Ayants-droit rattachés à l'assuré(e)</b>", label_bold))
    elements.append(Spacer(1, 2 * mm))

    ben_data = [
        [
            Paragraph("Nom et Prénom", header_th),
            Paragraph("Lien de Parenté", header_th),
            Paragraph("Date Naissance", header_th),
            Paragraph("N° Immatriculation", header_th),
            Paragraph("État des Droits", header_th),
        ],
        [
            Paragraph("EL IDRISSI Fatima Zahra", cell_td),
            Paragraph("Assuré(e) Principal(e)", cell_td),
            Paragraph("23/11/1990", cell_td_center),
            Paragraph("284759302-00", cell_td_center),
            Paragraph("<font color='#0D9488'><b>Actif</b></font>", cell_td_center),
        ],
        [
            Paragraph("MANSOURI Rayan", cell_td),
            Paragraph("Enfant à charge", cell_td),
            Paragraph("14/06/2018", cell_td_center),
            Paragraph("284759302-01", cell_td_center),
            Paragraph("<font color='#0D9488'><b>Actif (Scolarité)</b></font>", cell_td_center),
        ],
    ]
    t_ben = Table(ben_data, colWidths=[4.5 * cm, 3.2 * cm, 2.8 * cm, 3.5 * cm, 3.4 * cm])
    t_ben.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F4C81')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#0F4C81')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(t_ben)
    elements.append(Spacer(1, 6 * mm))

    # Guarantee Matrix
    elements.append(Paragraph("<b>2. Prestations couvertes &amp; Barèmes de Remboursement</b>", label_bold))
    elements.append(Spacer(1, 2 * mm))

    prest_data = [
        [
            Paragraph("Nature des Prestations Médicales", header_th),
            Paragraph("Taux Couverture", header_th),
            Paragraph("Plafond / Règles de Remboursement", header_th),
        ],
        [
            Paragraph("Consultations Généralistes &amp; Spécialistes", cell_td),
            Paragraph("80% TNR", cell_td_center),
            Paragraph("Tarif National de Référence (80 à 250 MAD)", cell_td),
        ],
        [
            Paragraph("Médicaments remboursables (GMR)", cell_td),
            Paragraph("70% à 100%", cell_td_center),
            Paragraph("Prix Public Maroc (PPM) - Liste officielle", cell_td),
        ],
        [
            Paragraph("Analyses Biologiques &amp; Imagerie Médicale", cell_td),
            Paragraph("80% TNR", cell_td_center),
            Paragraph("Nomenclature Générale des Actes Professionnels (NGAP)", cell_td),
        ],
        [
            Paragraph("Affections Longue Durée (ALD / ALC)", cell_td),
            Paragraph("100% Exonération", cell_td_center),
            Paragraph("Prise en charge intégrale après entente préalable", cell_td),
        ],
    ]
    t_prest = Table(prest_data, colWidths=[6.5 * cm, 3.2 * cm, 7.7 * cm])
    t_prest.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#334155')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(t_prest)
    elements.append(Spacer(1, 8 * mm))

    # Footer note & stamp
    footer_text = (
        "<i>La présente attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit auprès des praticiens, "
        "cliniques, laboratoires et officines pharmaceutiques conventionnés. "
        "Conformément à la loi 09-08 relative à la protection des données à caractère personnel (CNDP), "
        "ce document comporte un cachet d'authenticité électronique vérifiable sur le portail cnops.org.ma.</i>"
    )
    elements.append(Paragraph(footer_text, sub_style))
    elements.append(Spacer(1, 4 * mm))

    # Stamp & Signature block
    sign_data = [
        [
            Paragraph("<b>Identifiant Sécurisé :</b> CNOPS-AMO-2026-8947219<br/><b>Date d'émission :</b> 14 Octobre 2026", sub_style),
            Paragraph("<b>Pour le Directeur Général de la CNOPS</b><br/><i>Service Immatriculation &amp; Droits Ouverts</i><br/><br/>[Cachet Électronique Sécurisé Validé]", ParagraphStyle('R', parent=sub_style, alignment=TA_RIGHT)),
        ]
    ]
    t_sign = Table(sign_data, colWidths=[9 * cm, 8.4 * cm])
    t_sign.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_sign)

    doc.build(elements)
    return buffer.getvalue()


def create_biologie_report_pdf() -> bytes:
    """Generate authentic Moroccan Biology Lab Report PDF."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm
    )
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'BioTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=16,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#065F46')  # Clinical emerald
    )
    sub_style = ParagraphStyle(
        'BioSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#475569')
    )
    section_head = ParagraphStyle(
        'SecHead',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#065F46')
    )
    th_style = ParagraphStyle(
        'ThBio',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        alignment=TA_CENTER,
        textColor=colors.white
    )
    td_style = ParagraphStyle(
        'TdBio',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#1E293B')
    )
    td_bold = ParagraphStyle(
        'TdBioBold',
        parent=td_style,
        fontName='Helvetica-Bold'
    )
    td_center = ParagraphStyle(
        'TdBioCenter',
        parent=td_style,
        alignment=TA_CENTER
    )

    elements = []

    # Header
    elements.append(Paragraph("<b>LABORATOIRE CENTRAL D'ANALYSES MÉDICALES ET BIOLOGIQUES</b>", title_style))
    elements.append(Paragraph("Dr. Amine TAZI — Biologiste Médical Spécialiste | Casablanca Boulevard d'Anfa", sub_style))
    elements.append(Paragraph("Tél: +212 522 20 40 80 — Agrément Ministère de la Santé N° 4582/BM", sub_style))
    elements.append(Spacer(1, 3 * mm))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#065F46'), spaceAfter=8))

    # Patient & Sample Info
    meta_data = [
        [
            Paragraph("<b>Patient :</b> Mohamed MANSOURI", td_style),
            Paragraph("<b>N° Dossier :</b> BIO-2026-09412", td_style),
        ],
        [
            Paragraph("<b>CIN :</b> JC458921 | <b>Né(e) le :</b> 14/05/1982 (44 ans)", td_style),
            Paragraph("<b>Date Prélèvement :</b> 14/10/2026 à 08h15", td_style),
        ],
        [
            Paragraph("<b>Prescripteur :</b> Dr. Amine TAZI (Médecine Interne)", td_style),
            Paragraph("<b>Date Validation :</b> 14/10/2026 à 11h40", td_style),
        ],
    ]
    t_meta = Table(meta_data, colWidths=[9 * cm, 8.4 * cm])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#94A3B8')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_meta)
    elements.append(Spacer(1, 5 * mm))

    # Blood Test Results Table
    elements.append(Paragraph("<b>HÉMATOLOGIE — HÉMOGRAMME COMPLET (NFS)</b>", section_head))
    elements.append(Spacer(1, 2 * mm))

    nfs_data = [
        [
            Paragraph("Paramètre", th_style),
            Paragraph("Résultat", th_style),
            Paragraph("Unité", th_style),
            Paragraph("Valeurs de Référence", th_style),
            Paragraph("Antériorité", th_style),
        ],
        [Paragraph("Hémoglobine", td_bold), Paragraph("14.8", td_center), Paragraph("g/dL", td_center), Paragraph("13.0 - 17.5", td_center), Paragraph("14.5", td_center)],
        [Paragraph("Hématocrite", td_style), Paragraph("44.2", td_center), Paragraph("%", td_center), Paragraph("40.0 - 52.0", td_center), Paragraph("43.8", td_center)],
        [Paragraph("Globules Rouges (Hématies)", td_style), Paragraph("4.92", td_center), Paragraph("M/µL", td_center), Paragraph("4.50 - 5.90", td_center), Paragraph("4.85", td_center)],
        [Paragraph("VGM", td_style), Paragraph("89.8", td_center), Paragraph("fL", td_center), Paragraph("80.0 - 100.0", td_center), Paragraph("90.3", td_center)],
        [Paragraph("TCMH", td_style), Paragraph("30.1", td_center), Paragraph("pg", td_center), Paragraph("27.0 - 33.0", td_center), Paragraph("29.9", td_center)],
        [Paragraph("Leucocytes (Globules Blancs)", td_bold), Paragraph("6 800", td_center), Paragraph("/µL", td_center), Paragraph("4 000 - 10 000", td_center), Paragraph("7 200", td_center)],
        [Paragraph("Plaquettes", td_bold), Paragraph("235 000", td_center), Paragraph("/µL", td_center), Paragraph("150 000 - 400 000", td_center), Paragraph("242 000", td_center)],
    ]
    t_nfs = Table(nfs_data, colWidths=[5.5 * cm, 2.5 * cm, 2.4 * cm, 4.5 * cm, 2.5 * cm])
    t_nfs.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#065F46')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#065F46')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
    ]))
    elements.append(t_nfs)
    elements.append(Spacer(1, 4 * mm))

    # Biochemistry Table
    elements.append(Paragraph("<b>BIOCHIMIE SANGUINE &amp; BILAN RÉNAL / LIPIDIQUE</b>", section_head))
    elements.append(Spacer(1, 2 * mm))

    bio_data = [
        [
            Paragraph("Examen", th_style),
            Paragraph("Résultat", th_style),
            Paragraph("Unité", th_style),
            Paragraph("Valeurs Usuelles", th_style),
            Paragraph("Statut", th_style),
        ],
        [Paragraph("Glycémie à jeun", td_bold), Paragraph("1.02", td_center), Paragraph("g/L", td_center), Paragraph("0.70 - 1.10", td_center), Paragraph("Normal", td_center)],
        [Paragraph("Urée plasmatique", td_style), Paragraph("0.32", td_center), Paragraph("g/L", td_center), Paragraph("0.15 - 0.45", td_center), Paragraph("Normal", td_center)],
        [Paragraph("Créatinine sanguine", td_bold), Paragraph("9.4", td_center), Paragraph("mg/L", td_center), Paragraph("7.0 - 12.0", td_center), Paragraph("Normal", td_center)],
        [Paragraph("Clairance DFG (CKD-EPI)", td_bold), Paragraph("98.5", td_center), Paragraph("mL/min", td_center), Paragraph("&gt; 90.0", td_center), Paragraph("Fonction Rénale Normale", td_center)],
        [Paragraph("Cholestérol Total", td_style), Paragraph("1.95", td_center), Paragraph("g/L", td_center), Paragraph("&lt; 2.00", td_center), Paragraph("Normal", td_center)],
        [Paragraph("Triglycérides", td_style), Paragraph("1.30", td_center), Paragraph("g/L", td_center), Paragraph("&lt; 1.50", td_center), Paragraph("Normal", td_center)],
        [Paragraph("Cholestérol HDL", td_style), Paragraph("0.48", td_center), Paragraph("g/L", td_center), Paragraph("&gt; 0.40", td_center), Paragraph("Normal", td_center)],
        [Paragraph("Cholestérol LDL (Calculé)", td_bold), Paragraph("1.21", td_center), Paragraph("g/L", td_center), Paragraph("&lt; 1.30", td_center), Paragraph("Normal", td_center)],
    ]
    t_bio = Table(bio_data, colWidths=[5.5 * cm, 2.5 * cm, 2.4 * cm, 4.5 * cm, 2.5 * cm])
    t_bio.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#065F46')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#065F46')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
    ]))
    elements.append(t_bio)
    elements.append(Spacer(1, 6 * mm))

    # Conclusion & Stamp
    elements.append(Paragraph("<b>Conclusion Biologique :</b> Bilan hématologique et biochimique sans anomalie notable. Fonction rénale et profil lipidique satisfaisants.", ParagraphStyle('Conc', parent=td_style, fontName='Helvetica-Oblique', fontSize=8.5)))
    elements.append(Spacer(1, 4 * mm))

    sign_data = [
        [
            Paragraph("<i>Document généré électroniquement conforme aux exigences de traçabilité CNDP Maroc.</i>", sub_style),
            Paragraph("<b>Dr. Amine TAZI</b><br/>Spécialiste en Biologie Médicale<br/>INPE: 104928174<br/>[Signature &amp; Cachet Validés]", ParagraphStyle('R2', parent=sub_style, alignment=TA_RIGHT)),
        ]
    ]
    t_sign = Table(sign_data, colWidths=[9 * cm, 8.4 * cm])
    elements.append(t_sign)

    doc.build(elements)
    return buffer.getvalue()


def create_ultrasound_image() -> bytes:
    """Generate realistic high-contrast grayscale medical ultrasound scan PNG."""
    width, height = 900, 650
    # Acoustic dark background with faint noise
    img = Image.new('L', (width, height), color=12)
    draw = ImageDraw.Draw(img)

    # Ultrasound sector geometry
    origin_x, origin_y = width // 2, 80
    max_radius = 500
    angle_spread = 45  # degrees each side

    # Draw acoustic cone background
    for r in range(max_radius, 50, -5):
        gray = int(22 + 10 * math.sin(r / 40.0))
        # Sector arc
        bbox = [origin_x - r, origin_y - r, origin_x + r, origin_y + r]
        draw.arc(bbox, 90 - angle_spread, 90 + angle_spread, fill=gray, width=5)

    # Draw synthetic liver parenchyma texture inside sector
    random.seed(42)
    for _ in range(12000):
        # Sample inside cone
        ang = math.radians(random.uniform(90 - angle_spread + 3, 90 + angle_spread - 3))
        r = random.uniform(90, max_radius - 20)
        px = int(origin_x + r * math.cos(ang))
        py = int(origin_y + r * math.sin(ang))

        # Liver tissue intensity with portal structures
        dist_to_center = math.hypot(px - 450, py - 320)
        if dist_to_center < 70:
            # Gallbladder / vascular hypoechoic lumen
            intensity = random.randint(15, 40)
        elif dist_to_center < 85:
            # Hyperechoic wall
            intensity = random.randint(160, 240)
        else:
            # Hepatic speckle
            depth_factor = 1.0 - (r / max_radius) * 0.35
            intensity = int(random.gauss(100, 30) * depth_factor)
            intensity = max(10, min(230, intensity))

        draw.point((px, py), fill=intensity)

    # Smooth the acoustic texture slightly
    img = img.filter(ImageFilter.GaussianBlur(radius=0.7))
    draw = ImageDraw.Draw(img)

    # Draw ultrasound depth markers (1cm ticks on right side)
    for d in range(1, 16):
        tick_y = origin_y + int((d / 15.0) * (max_radius - 80))
        draw.line([(width - 70, tick_y), (width - 55, tick_y)], fill=180, width=1)
        if d % 2 == 0:
            draw.text((width - 50, tick_y - 5), f"{d}", fill=160)

    # Medical Monitor HUD Overlay
    hud_color = 240
    draw.text((25, 20), "CLINIQUE DOSSIA — CASABLANCA", fill=hud_color)
    draw.text((25, 38), "ECHOGRAPHE NUMERIQUE LOGIQ-E9", fill=170)
    draw.text((25, 56), "SONDE: C1-5-D CONVEXE (3.5 MHz)", fill=170)

    draw.text((580, 20), "PATIENT: BERRADA, Youssef", fill=hud_color)
    draw.text((580, 38), "CIN: BK304912 | DOSSIER: RAD-2025-081", fill=170)
    draw.text((580, 56), "DATE: 14/10/2025 09:40:12", fill=170)

    # Technical parameters
    draw.text((25, 560), "GAIN: 78 dB | PROF: 16.0 cm", fill=180)
    draw.text((25, 578), "FR: 28 Hz | DR: 65 | MI: 1.1 | TIS: 0.3", fill=180)
    draw.text((25, 596), "INDICATION: Douleurs HCD & Bilan Stéatose", fill=180)

    # Measurement caliper
    caliper_color = 255
    draw.line([(380, 280), (380, 420)], fill=caliper_color, width=1)
    draw.line([(375, 280), (385, 280)], fill=caliper_color, width=1)
    draw.line([(375, 420), (385, 420)], fill=caliper_color, width=1)
    draw.text((395, 345), "+ D1: 142.8 mm (Flèche hépatique)", fill=caliper_color)

    # Orientation probe marker
    draw.arc([origin_x - 35, origin_y - 20, origin_x + 35, origin_y + 20], 0, 180, fill=220, width=3)
    draw.polygon([(origin_x - 45, origin_y), (origin_x - 35, origin_y - 8), (origin_x - 35, origin_y + 8)], fill=220)

    buffer = io.BytesIO()
    img.save(buffer, format='PNG', optimize=True)
    return buffer.getvalue()


def create_xray_lumbar_image() -> bytes:
    """Generate realistic high-contrast X-ray radiograph of lumbar spine JPEG."""
    width, height = 800, 1000
    # X-ray exposure dark base with soft scatter
    img = Image.new('L', (width, height), color=15)
    draw = ImageDraw.Draw(img)

    # Draw soft tissue silhouette (abdomen/flank gradient)
    center_x = width // 2
    for y in range(80, height - 80):
        # Soft tissue lateral shading
        for x in range(center_x - 220, center_x + 220, 2):
            dist = abs(x - center_x)
            factor = math.exp(- (dist ** 2) / (2 * 120 ** 2))
            val = int(25 + 35 * factor)
            draw.point((x, y), fill=val)

    # Draw lumbar vertebrae L1 to L5 and sacrum base
    vertebrae = [
        ("L1", 180, 75, 60),
        ("L2", 270, 82, 65),
        ("L3", 370, 90, 70),
        ("L4", 480, 98, 75),
        ("L5", 600, 105, 80),
    ]

    for label, y_top, w_body, h_body in vertebrae:
        x_left = center_x - w_body // 2
        # Vertebral body rectangular density
        for vy in range(y_top, y_top + h_body):
            for vx in range(x_left, x_left + w_body):
                # Cortical bone is denser at edges
                edge_dist = min(vx - x_left, (x_left + w_body) - vx, vy - y_top, (y_top + h_body) - vy)
                if edge_dist < 4:
                    intensity = random.randint(180, 235)  # Dense cortical endplate
                else:
                    intensity = random.randint(110, 160)  # Trabecular bone
                draw.point((vx, vy), fill=intensity)

        # Pedicles (dense oval eyes on both sides)
        pedicle_y = y_top + h_body // 3
        draw.ellipse([x_left + 10, pedicle_y, x_left + 24, pedicle_y + 20], fill=210)
        draw.ellipse([x_left + w_body - 24, pedicle_y, x_left + w_body - 10, pedicle_y + 20], fill=210)

        # Spinous process midline faint projection
        draw.polygon([
            (center_x - 8, y_top + h_body),
            (center_x + 8, y_top + h_body),
            (center_x, y_top + h_body + 30)
        ], fill=150)

    # Sacrum / Pelvis top rim
    draw.polygon([
        (center_x - 140, 720),
        (center_x + 140, 720),
        (center_x + 80, 850),
        (center_x - 80, 850)
    ], fill=140)

    # Apply medical radiographic blur to simulate X-ray beam scatter
    img = img.filter(ImageFilter.GaussianBlur(radius=1.2))
    draw = ImageDraw.Draw(img)

    # Re-draw anatomical markers & orientation
    # "D" for Droite (Right side)
    draw.text((60, 120), "D", fill=240, font=None)
    draw.ellipse([50, 110, 85, 145], outline=240, width=2)

    # Technical metadata text
    draw.text((width - 320, 40), "CENTRE D'IMAGERIE DU PARC", fill=210)
    draw.text((width - 320, 60), "CHRAIBI, MEHDI — 31 ans", fill=240)
    draw.text((width - 320, 80), "CIN: D928374 | ID: RX-2026-1049", fill=190)
    draw.text((width - 320, 100), "INCIDENCE: RACHIS LOMBAIRE FACE", fill=190)
    draw.text((width - 320, 120), "PARAMETRES: 75 kV - 32 mAs", fill=170)
    draw.text((width - 320, 140), "DATE: 14/10/2026 10:40", fill=170)

    # Vertebrae anatomical side labels
    draw.text((center_x + 80, 200), "L1", fill=160)
    draw.text((center_x + 85, 290), "L2", fill=160)
    draw.text((center_x + 90, 395), "L3", fill=160)
    draw.text((center_x + 95, 505), "L4", fill=160)
    draw.text((center_x + 100, 625), "L5", fill=160)
    draw.text((center_x + 80, 750), "S1", fill=160)

    buffer = io.BytesIO()
    img.save(buffer, format='JPEG', quality=92)
    return buffer.getvalue()


def main():
    print("=== Generating Realistic Medical Documents for Dossia Vault ===")

    docs = {
        '40000000-0000-0000-0000-000000000001': {
            'filename': 'Bilan_Biologique_Mansouri_2026.pdf',
            'content_type': 'application/pdf',
            'key': '11111111-1111-1111-1111-111111111111/a1000000-0000-0000-0000-000000000001/biologie/bilan_biologique_mansouri_2026.pdf',
            'generator': create_biologie_report_pdf,
        },
        '40000000-0000-0000-0000-000000000002': {
            'filename': 'Attestation_Adhesion_CNOPS.pdf',
            'content_type': 'application/pdf',
            'key': '11111111-1111-1111-1111-111111111111/a1000000-0000-0000-0000-000000000002/administratif/attestation_cnops.pdf',
            'generator': create_cnops_attestation_pdf,
        },
        '40000000-0000-0000-0000-000000000003': {
            'filename': 'Echo_Abdominale_Berrada_2025.png',
            'content_type': 'image/png',
            'key': '11111111-1111-1111-1111-111111111111/a1000000-0000-0000-0000-000000000003/radiologie/echo_abdominale_berrada.png',
            'generator': create_ultrasound_image,
        },
        '40000000-0000-0000-0000-000000000004': {
            'filename': 'Radiographie_Rachis_Lombaire.jpeg',
            'content_type': 'image/jpeg',
            'key': '11111111-1111-1111-1111-111111111111/a1000000-0000-0000-0000-000000000005/radiologie/rx_lombaire_chraibi.jpeg',
            'generator': create_xray_lumbar_image,
        },
    }

    # Initialize MinIO client
    minio_client = Minio(
        'localhost:9000',
        access_key='dossia_minio_admin',
        secret_key='dossia_minio_dev_secret_2026',
        secure=False
    )
    bucket_name = 'dossia-medical-vault'

    sql_updates = []

    for doc_id, info in docs.items():
        print(f"\n[+] Generating {info['filename']}...")
        data = info['generator']()
        size_bytes = len(data)
        size_kb = size_bytes / 1024.0
        print(f"    Size: {size_bytes} bytes ({size_kb:.1f} Ko)")

        # Upload to MinIO
        data_stream = io.BytesIO(data)
        minio_client.put_object(
            bucket_name=bucket_name,
            object_name=info['key'],
            data=data_stream,
            length=size_bytes,
            content_type=info['content_type']
        )
        print(f"    Uploaded to MinIO: s3://{bucket_name}/{info['key']}")

        sql_updates.append(
            f"UPDATE patient_documents SET file_size_bytes = {size_bytes} WHERE id = '{doc_id}';"
        )

    # Apply database updates via docker psql
    full_sql = " ".join(sql_updates)
    print(f"\n[+] Executing SQL updates on PostgreSQL...")
    cmd = [
        "docker", "exec", "dossia-postgres",
        "psql", "-U", "dossia_user", "-d", "dossia_db",
        "-c", full_sql
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print("    Database updated successfully!")
        print(res.stdout)
    else:
        print("    Error updating database:", res.stderr)

    print("\n=== Verification ===")
    check_cmd = [
        "docker", "exec", "dossia-postgres",
        "psql", "-U", "dossia_user", "-d", "dossia_db",
        "-c", "SELECT id, original_filename, file_size_bytes, category FROM patient_documents;"
    ]
    subprocess.run(check_cmd)

if __name__ == '__main__':
    main()
