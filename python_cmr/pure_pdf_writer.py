"""
Pure Python PDF Generator for official UN CMR Consignment Notes.
Requires ZERO external packages (built exclusively on Python standard library).
Produces 100% standards-compliant PDF 1.4 documents.
"""

from typing import List, Tuple, Dict, Any, Optional
import io
import math
from .models import CMRDocument, CargoItem

# Standard A4 in PostScript Points (72 points = 1 inch, 210mm x 297mm)
PAGE_WIDTH = 595.28
PAGE_HEIGHT = 841.89

# Official CMR Copy colors
COPY_THEMES = {
    "1": {
        "title": "1 - Exemplaire pour l'expéditeur / Copy for sender / Exemplar für den Absender",
        "color_rgb": (0.55, 0.36, 0.96),  # Light Violet
        "badge_bg": (0.96, 0.95, 1.0),
        "name": "Sender Copy (Light Violet)"
    },
    "2": {
        "title": "2 - Exemplaire pour le destinataire / Copy for consignee / Exemplar für den Empfänger",
        "color_rgb": (0.10, 0.35, 0.75),  # Blue
        "badge_bg": (0.90, 0.94, 0.99),
        "name": "Consignee Copy (Blue)"
    },
    "3": {
        "title": "3 - Exemplaire pour le transporteur / Copy for carrier / Exemplar für den Frachtführer",
        "color_rgb": (0.12, 0.55, 0.25),  # Green
        "badge_bg": (0.90, 0.97, 0.92),
        "name": "Carrier Copy (Green)"
    },
    "4": {
        "title": "4 - Exemplaire pour l'administration / Copy for carrier office / Exemplar für das Büro",
        "color_rgb": (0.25, 0.25, 0.25),  # Black / Charcoal
        "badge_bg": (0.93, 0.93, 0.93),
        "name": "Administration Copy (Black)"
    }
}


def escape_pdf_text(text: str) -> str:
    """Escapes string characters for PDF text operators."""
    if not text:
        return ""
    # Map common non-ASCII or clean Latin-1
    text = text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
    # Replace unicode characters that might exceed standard WinAnsi / Latin-1
    replacements = {
        "€": "EUR", "–": "-", "—": "-", "“": '"', "”": '"', "’": "'", "‘": "'",
        "é": "e", "è": "e", "ê": "e", "ë": "e", "à": "a", "â": "a", "ä": "ae",
        "ö": "oe", "ü": "ue", "ß": "ss", "ç": "c", "î": "i", "ï": "i", "ô": "o"
    }
    for orig, rep in replacements.items():
        text = text.replace(orig, rep)
    # Filter to printable ASCII
    return "".join(c if 32 <= ord(c) <= 126 else " " for c in text)


class PDFStreamBuilder:
    def __init__(self):
        self.commands: List[str] = []

    def set_line_width(self, w: float):
        self.commands.append(f"{w:.2f} w")

    def set_stroke_color(self, r: float, g: float, b: float):
        self.commands.append(f"{r:.3f} {g:.3f} {b:.3f} RG")

    def set_fill_color(self, r: float, g: float, b: float):
        self.commands.append(f"{r:.3f} {g:.3f} {b:.3f} rg")

    def rect(self, x: float, y: float, w: float, h: float, stroke=True, fill=False):
        self.commands.append(f"{x:.2f} {y:.2f} {w:.2f} {h:.2f} re")
        if stroke and fill:
            self.commands.append("B")
        elif fill:
            self.commands.append("f")
        elif stroke:
            self.commands.append("S")

    def line(self, x1: float, y1: float, x2: float, y2: float):
        self.commands.append(f"{x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S")

    def text(self, x: float, y: float, content: str, font="F1", size=8.0, r=0.0, g=0.0, b=0.0):
        safe = escape_pdf_text(content)
        self.commands.append(f"q {r:.3f} {g:.3f} {b:.3f} rg BT /{font} {size:.2f} Tf {x:.2f} {y:.2f} Td ({safe}) Tj ET Q")

    def get_stream(self) -> bytes:
        return "\n".join(self.commands).encode("latin-1", "replace")


def render_cmr_page_stream(doc: CMRDocument, copy_key: str = "1") -> bytes:
    """Builds the vector PDF stream for an official 24-box CMR consignment note."""
    builder = PDFStreamBuilder()
    theme = COPY_THEMES.get(str(copy_key), COPY_THEMES["1"])
    cr, cg, cb = theme["color_rgb"]
    
    # Outer margin and boundaries
    left = 22.0
    right = PAGE_WIDTH - 22.0
    top = PAGE_HEIGHT - 22.0
    bottom = 26.0
    width = right - left
    height = top - bottom

    # Outer border with copy accent color
    builder.set_stroke_color(cr, cg, cb)
    builder.set_line_width(1.5)
    builder.rect(left, bottom, width, height, stroke=True, fill=False)

    # Top Copy Badge Bar
    header_bar_height = 20.0
    header_y = top - header_bar_height
    br, bg, bb = theme["badge_bg"]
    builder.set_fill_color(br, bg, bb)
    builder.set_stroke_color(cr, cg, cb)
    builder.set_line_width(0.75)
    builder.rect(left, header_y, width, header_bar_height, stroke=True, fill=True)
    
    # Header Copy text
    builder.text(left + 8, header_y + 6, theme["title"], font="F2", size=8.5, r=cr, g=cg, b=cb)

    # Document Title & International Convention header
    main_top = header_y
    title_height = 42.0
    title_y = main_top - title_height
    
    # Right-aligned Consignment No & CMR emblem box
    emblem_width = 210.0
    emblem_x = right - emblem_width
    builder.line(emblem_x, main_top, emblem_x, title_y)
    
    # Title Left Box
    builder.text(left + 8, main_top - 14, "INTERNATIONAL CONSIGNMENT NOTE / LETTRE DE VOITURE INTERNATIONALE", font="F2", size=9.0, r=0.1, g=0.1, b=0.1)
    builder.text(left + 8, main_top - 25, "Ce transport est soumis, nonobstant toute clause contraire, à la Convention relative au contrat", font="F1", size=6.5, r=0.3, g=0.3, b=0.3)
    builder.text(left + 8, main_top - 33, "de transport international de marchandises par route (CMR). Geneva, 19 May 1956.", font="F1", size=6.5, r=0.3, g=0.3, b=0.3)
    
    # Emblem Box Right
    builder.text(emblem_x + 10, main_top - 18, "CMR", font="F2", size=18.0, r=cr, g=cg, b=cb)
    builder.text(emblem_x + 65, main_top - 15, "No.", font="F2", size=9.0, r=0.2, g=0.2, b=0.2)
    builder.text(emblem_x + 85, main_top - 15, doc.consignment_number, font="F2", size=11.0, r=cr, g=cg, b=cb)
    builder.text(emblem_x + 65, main_top - 28, f"Copy: {theme['name']}", font="F1", size=7.5, r=0.3, g=0.3, b=0.3)

    builder.set_stroke_color(0.4, 0.4, 0.4)
    builder.set_line_width(0.6)
    builder.line(left, title_y, right, title_y)

    # Standard CMR Grid Coordinates
    # Half-width column division
    mid_x = left + (width * 0.50)
    
    # ------------------ TOP SECTION (Boxes 1 to 5 & 16 to 19) ------------------
    # Left Column: Box 1 (Sender), Box 2 (Consignee), Box 3 (Delivery place), Box 4 (Taking over), Box 5 (Docs)
    # Right Column: Box 16 (Carrier), Box 17 (Successive), Box 18 (Reservations), Box 19 (Agreements)
    
    # Row 1: Box 1 (left, h=64) & Box 16 (right, h=64)
    b1_top = title_y
    b1_h = 66.0
    b1_bottom = b1_top - b1_h
    builder.line(left, b1_bottom, right, b1_bottom)
    builder.line(mid_x, b1_top, mid_x, b1_bottom)
    
    # Box 1: Sender
    builder.text(left + 4, b1_top - 8, "1  Expéditeur (nom, adresse, pays) / Sender (name, address, country)", font="F2", size=7.2, r=0.1, g=0.1, b=0.1)
    builder.set_stroke_color(0.85, 0.85, 0.85)
    builder.line(left + 2, b1_top - 12, mid_x - 2, b1_top - 12)
    builder.set_stroke_color(0.7, 0.7, 0.7)
    lines_s = doc.sender.formatted_address().split("\n")
    sy = b1_top - 21
    for idx, line in enumerate(lines_s[:5]):
        f = "F2" if idx == 0 else "F1"
        s = 9.2 if idx == 0 else 8.2
        builder.text(left + 6, sy, line, font=f, size=s, r=0.0, g=0.0, b=0.0)
        sy -= 9.5
        
    # Box 16: Carrier
    builder.text(mid_x + 4, b1_top - 8, "16  Transporteur (nom, adresse, pays) / Carrier (name, address, country)", font="F2", size=7.2, r=0.1, g=0.1, b=0.1)
    builder.set_stroke_color(0.85, 0.85, 0.85)
    builder.line(mid_x + 2, b1_top - 12, right - 2, b1_top - 12)
    builder.set_stroke_color(0.7, 0.7, 0.7)
    lines_c = doc.carrier.formatted_address().split("\n")
    cy = b1_top - 21
    for idx, line in enumerate(lines_c[:4]):
        f = "F2" if idx == 0 else "F1"
        s = 9.2 if idx == 0 else 8.2
        builder.text(mid_x + 6, cy, line, font=f, size=s, r=0.0, g=0.0, b=0.0)
        cy -= 9.5
    plates = f"Truck: {doc.carrier_license_plate or '-'}  |  Trailer: {doc.carrier_trailer_plate or '-'}"
    builder.text(mid_x + 6, b1_bottom + 5, plates, font="F2", size=8.0, r=cr, g=cg, b=cb)

    # Row 2: Box 2 (Consignee, h=64) & Box 17 (Successive carriers, h=32) + Box 18 (Reservations, h=32)
    b2_top = b1_bottom
    b2_h = 66.0
    b2_bottom = b2_top - b2_h
    builder.line(left, b2_bottom, right, b2_bottom)
    builder.line(mid_x, b2_top, mid_x, b2_bottom)
    
    # Box 2: Consignee
    builder.text(left + 4, b2_top - 8, "2  Destinataire (nom, adresse, pays) / Consignee (name, address, country)", font="F2", size=7.2, r=0.1, g=0.1, b=0.1)
    builder.set_stroke_color(0.85, 0.85, 0.85)
    builder.line(left + 2, b2_top - 12, mid_x - 2, b2_top - 12)
    builder.set_stroke_color(0.7, 0.7, 0.7)
    lines_d = doc.consignee.formatted_address().split("\n")
    dy = b2_top - 21
    for idx, line in enumerate(lines_d[:5]):
        f = "F2" if idx == 0 else "F1"
        s = 9.2 if idx == 0 else 8.2
        builder.text(left + 6, dy, line, font=f, size=s, r=0.0, g=0.0, b=0.0)
        dy -= 9.5
        
    # Box 17: Successive carrier (half height)
    b17_h = 32.0
    b17_bottom = b2_top - b17_h
    builder.line(mid_x, b17_bottom, right, b17_bottom)
    builder.text(mid_x + 4, b2_top - 9, "17  Transporteurs successifs / Successive carriers", font="F2", size=7.0, r=0.1, g=0.1, b=0.1)
    if doc.successive_carrier.name:
        sc_text = f"{doc.successive_carrier.name}, {doc.successive_carrier.city_postal} {doc.successive_carrier.country}"
        builder.text(mid_x + 6, b2_top - 20, sc_text[:50], font="F1", size=8.0)
    else:
        builder.text(mid_x + 6, b2_top - 20, "None / Non applicable", font="F1", size=7.5, r=0.3, g=0.3, b=0.3)
        
    # Box 18: Carrier reservations
    builder.text(mid_x + 4, b17_bottom - 9, "18  Réserves et observations du transporteur / Carrier's reservations", font="F2", size=7.0, r=0.1, g=0.1, b=0.1)
    res_text = doc.carrier_reservations or "None / Good order and condition"
    builder.text(mid_x + 6, b17_bottom - 20, res_text[:58], font="F1", size=8.0, r=0.1, g=0.1, b=0.1)

    # Row 3: Box 3 (Delivery place, h=30) & Box 4 (Taking over, h=30)
    b3_top = b2_bottom
    b3_h = 30.0
    b3_bottom = b3_top - b3_h
    builder.line(left, b3_bottom, right, b3_bottom)
    builder.line(mid_x, b3_top, mid_x, b3_bottom)
    
    # Box 3: Place of delivery
    builder.text(left + 4, b3_top - 8, "3  Lieu prévu pour la livraison / Place of delivery of the goods", font="F2", size=7.0, r=0.1, g=0.1, b=0.1)
    del_str = f"Place: {doc.delivery_place or '-'}   |   Country: {doc.delivery_country or '-'}"
    builder.text(left + 6, b3_top - 20, del_str, font="F2", size=8.5)
    
    # Box 4: Taking over goods
    builder.text(mid_x + 4, b3_top - 8, "4  Lieu et date de prise en charge / Place & date of taking over", font="F2", size=7.0, r=0.1, g=0.1, b=0.1)
    to_str = f"Place: {doc.taking_over_place or '-'}   |   Date: {doc.taking_over_date or '-'}"
    builder.text(mid_x + 6, b3_top - 20, to_str, font="F2", size=8.5)

    # Row 4: Box 5 (Documents attached, full width, h=24)
    b5_top = b3_bottom
    b5_h = 24.0
    b5_bottom = b5_top - b5_h
    builder.line(left, b5_bottom, right, b5_bottom)
    builder.text(left + 4, b5_top - 8, "5  Documents annexés / Documents attached (Invoice, packing list, certificates)", font="F2", size=7.0, r=0.1, g=0.1, b=0.1)
    builder.text(left + 6, b5_top - 18, (doc.documents_attached or "None")[:110], font="F1", size=8.0)

    # ------------------ MIDDLE SECTION: GOODS TABLE (Boxes 6 to 12) ------------------
    table_top = b5_bottom
    table_header_h = 22.0
    table_body_h = 188.0  # Expanded so signature boxes 22-24 move down ~3cm to the bottom
    table_bottom = table_top - table_header_h - table_body_h
    
    # Column definitions:
    # 6: Marks & Nos (w=85)
    # 7: No of packages (w=45)
    # 8: Method of packing (w=75)
    # 9: Nature of goods & ADR (w=175)
    # 10: Statistical No (w=55)
    # 11: Gross Weight kg (w=60)
    # 12: Volume m3 (w=55)
    c6_w = 75.0
    c7_w = 40.0
    c8_w = 68.0
    c9_w = 172.0
    c10_w = 55.0
    c11_w = 70.0
    c12_w = width - (c6_w + c7_w + c8_w + c9_w + c10_w + c11_w)
    
    col_x = [
        left,
        left + c6_w,
        left + c6_w + c7_w,
        left + c6_w + c7_w + c8_w,
        left + c6_w + c7_w + c8_w + c9_w,
        left + c6_w + c7_w + c8_w + c9_w + c10_w,
        left + c6_w + c7_w + c8_w + c9_w + c10_w + c11_w,
        right
    ]
    
    # Table header fill
    builder.set_fill_color(0.96, 0.96, 0.96)
    builder.rect(left, table_top - table_header_h, width, table_header_h, stroke=False, fill=True)
    builder.line(left, table_top - table_header_h, right, table_top - table_header_h)
    
    # Vertical grid lines
    for x in col_x[1:-1]:
        builder.line(x, table_top, x, table_bottom)
    builder.line(left, table_bottom, right, table_bottom)

    # Column titles
    th_y = table_top - 8
    th_y2 = table_top - 16
    builder.text(col_x[0] + 3, th_y, "6 Marques et No", font="F2", size=6.5)
    builder.text(col_x[0] + 3, th_y2, "Marks & Nos", font="F1", size=6.0)
    
    builder.text(col_x[1] + 3, th_y, "7 Nb colis", font="F2", size=6.5)
    builder.text(col_x[1] + 3, th_y2, "No packages", font="F1", size=6.0)
    
    builder.text(col_x[2] + 3, th_y, "8 Mode embal.", font="F2", size=6.5)
    builder.text(col_x[2] + 3, th_y2, "Method packing", font="F1", size=6.0)
    
    builder.text(col_x[3] + 3, th_y, "9 Nature de la marchandise / ADR Class", font="F2", size=6.8)
    builder.text(col_x[3] + 3, th_y2, "Nature of goods (ADR UN / Class / Group)", font="F1", size=6.0)
    
    builder.text(col_x[4] + 3, th_y, "10 No statist.", font="F2", size=6.5)
    builder.text(col_x[4] + 3, th_y2, "Statistical No", font="F1", size=6.0)
    
    builder.text(col_x[5] + 3, th_y, "11 Poids brut kg", font="F2", size=6.5)
    builder.text(col_x[5] + 3, th_y2, "Gross weight kg", font="F1", size=6.0)
    
    builder.text(col_x[6] + 3, th_y, "12 Volume m³", font="F2", size=6.5)
    builder.text(col_x[6] + 3, th_y2, "Volume m³", font="F1", size=6.0)

    # Render cargo item rows
    item_y = table_top - table_header_h - 13.0
    for idx, item in enumerate(doc.items[:6]):
        builder.text(col_x[0] + 3, item_y, (item.marks_and_numbers or "-")[:16], font="F1", size=8.0)
        builder.text(col_x[1] + 6, item_y, str(item.packages_count), font="F2", size=8.5)
        builder.text(col_x[2] + 3, item_y, (item.packing_method or "-")[:14], font="F1", size=8.0)
        
        # Nature of goods + ADR note
        desc = item.nature_of_goods[:44]
        builder.text(col_x[3] + 3, item_y, desc, font="F2", size=8.5)
        if item.adr_details:
            builder.text(col_x[3] + 3, item_y - 8, f"ADR: {item.adr_details[:40]}", font="F2", size=7.2, r=0.8, g=0.1, b=0.1)
            
        builder.text(col_x[4] + 3, item_y, (item.statistical_number or "-")[:10], font="F1", size=8.0)
        builder.text(col_x[5] + 6, item_y, f"{item.gross_weight_kg:,.1f}", font="F2", size=8.5)
        builder.text(col_x[6] + 6, item_y, f"{item.volume_m3:,.2f}" if item.volume_m3 else "-", font="F1", size=8.0)
        
        item_y -= 24.0

    # Cargo Totals Bar
    totals_h = 16.0
    totals_y = table_bottom
    builder.set_fill_color(0.92, 0.94, 0.97)
    builder.rect(left, totals_y, width, totals_h, stroke=True, fill=True)
    builder.text(left + 8, totals_y + 5, "TOTALS / TOTAL:", font="F2", size=8.2, r=0.1, g=0.1, b=0.1)
    builder.text(col_x[1] + 6, totals_y + 5, f"{doc.total_packages} pkgs", font="F2", size=8.5, r=cr, g=cg, b=cb)
    builder.text(col_x[5] + 6, totals_y + 5, f"{doc.total_gross_weight_kg:,.1f} kg", font="F2", size=8.5, r=cr, g=cg, b=cb)
    builder.text(col_x[6] + 6, totals_y + 5, f"{doc.total_volume_m3:,.2f} m³", font="F2", size=8.2, r=cr, g=cg, b=cb)

    # ------------------ LOWER MIDDLE SECTION (Boxes 13, 14, 15, 19, 20) ------------------
    lm_top = totals_y
    lm_h = 72.0
    lm_bottom = lm_top - lm_h
    builder.line(left, lm_bottom, right, lm_bottom)
    
    # Split left (Box 13 Sender Instructions) & right (Box 19 Special Agreements + Box 20 Charges)
    lm_mid = left + (width * 0.52)
    builder.line(lm_mid, lm_top, lm_mid, lm_bottom)
    
    # Box 13: Sender instructions
    builder.text(left + 4, lm_top - 8, "13  Instructions de l'expéditeur / Sender's instructions", font="F2", size=7.0)
    ins_lines = (doc.sender_instructions or "None").split("\n")
    iy = lm_top - 18
    for l in ins_lines[:4]:
        builder.text(left + 8, iy, l[:50], font="F1", size=7.8)
        iy -= 9.0
        
    # Box 14 (COD) & Box 15 (Carriage paid) at bottom of left half
    b14_y = lm_bottom + 22.0
    builder.line(left, b14_y, lm_mid, b14_y)
    builder.text(left + 4, b14_y - 7, "14  Remboursement / Cash on delivery", font="F2", size=6.5)
    builder.text(left + 8, b14_y - 17, doc.cod_amount or "N/A", font="F2", size=8.2)
    
    b15_x = left + (width * 0.26)
    builder.line(b15_x, lm_bottom, b15_x, b14_y)
    builder.text(b15_x + 4, b14_y - 7, "15  Paiement transport / Carriage", font="F2", size=6.5)
    builder.text(b15_x + 8, b14_y - 17, doc.payment_instructions[:20], font="F1", size=7.8)

    # Right side: Box 19 (Conventions particulières, h=28) & Box 20 (Charges, h=44)
    b19_bottom = lm_top - 28.0
    builder.line(lm_mid, b19_bottom, right, b19_bottom)
    builder.text(lm_mid + 4, lm_top - 8, "19  Conventions particulières / Special agreements", font="F2", size=7.0)
    builder.text(lm_mid + 8, lm_top - 18, (doc.special_agreements or "CMR Convention 1956 applies.")[:52], font="F1", size=7.8)
    
    # Box 20: Charges breakdown
    builder.text(lm_mid + 4, b19_bottom - 8, "20  À payer par / To be paid by", font="F2", size=7.0)
    builder.text(lm_mid + 80, b19_bottom - 8, f"Expéditeur (Sender) / Destinataire ({doc.charges.currency})", font="F1", size=6.0)
    builder.text(lm_mid + 8, b19_bottom - 18, f"Prix de transport (Carriage charges):  {doc.charges.carriage_paid:.2f} {doc.charges.currency}", font="F1", size=7.8)
    builder.text(lm_mid + 8, b19_bottom - 28, f"Solde / Balance:                      {doc.charges.balance_sender:.2f} {doc.charges.currency}", font="F2", size=8.2, r=cr, g=cg, b=cb)

    # ------------------ BOTTOM SECTION: SIGNATURES (Boxes 21, 22, 23, 24) ------------------
    # Box 21: Established place/date across top of signature area
    b21_top = lm_bottom
    b21_h = 20.0
    b21_bottom = b21_top - b21_h
    builder.line(left, b21_bottom, right, b21_bottom)
    
    builder.text(left + 4, b21_top - 7, "21  Établi à / le / Established in / on", font="F2", size=7.0)
    est_str = f"Established at: {doc.established_place or '-'}        Date: {doc.established_date or '-'}"
    builder.text(left + 8, b21_top - 15, est_str, font="F2", size=8.5, r=0.1, g=0.1, b=0.1)

    # Signatures: 3 equal columns: Box 22 (Sender), Box 23 (Carrier), Box 24 (Consignee)
    sig_top = b21_bottom
    sig_w = width / 3.0
    sig_x1 = left + sig_w
    sig_x2 = left + (2.0 * sig_w)
    
    builder.line(sig_x1, sig_top, sig_x1, bottom)
    builder.line(sig_x2, sig_top, sig_x2, bottom)
    
    # Box 22: Sender signature
    builder.text(left + 4, sig_top - 8, "22  Signature et timbre de l'expéditeur", font="F2", size=6.8)
    builder.text(left + 4, sig_top - 15, "Signature and stamp of the sender", font="F1", size=6.0)
    builder.text(left + 8, sig_top - 24, f"Date: {doc.taking_over_date or '___/___/2026'}", font="F1", size=7.2, r=0.3, g=0.3, b=0.3)
    if doc.sender_signer_name:
        builder.text(left + 8, sig_top - 33, f"Signer: {doc.sender_signer_name}", font="F2", size=7.8)
        builder.line(left + 8, sig_top - 46, sig_x1 - 10, sig_top - 46)
        builder.text(left + 12, sig_top - 42, "[ Digitally Certified / Signé ]", font="F1", size=7.5, r=cr, g=cg, b=cb)
    else:
        builder.line(left + 8, sig_top - 46, sig_x1 - 10, sig_top - 46)
        builder.text(left + 12, sig_top - 54, "(Signature / Stamp)", font="F1", size=6.5, r=0.5, g=0.5, b=0.5)

    # Box 23: Carrier signature
    builder.text(sig_x1 + 4, sig_top - 8, "23  Signature et timbre du transporteur", font="F2", size=6.8)
    builder.text(sig_x1 + 4, sig_top - 15, "Signature and stamp of the carrier", font="F1", size=6.0)
    builder.text(sig_x1 + 8, sig_top - 24, f"Prise en charge: {doc.taking_over_date or '___/___/2026'}", font="F1", size=7.2, r=0.3, g=0.3, b=0.3)
    if doc.carrier_driver_name:
        builder.text(sig_x1 + 8, sig_top - 33, f"Driver: {doc.carrier_driver_name}", font="F2", size=7.8)
        builder.line(sig_x1 + 8, sig_top - 46, sig_x2 - 10, sig_top - 46)
        builder.text(sig_x1 + 12, sig_top - 42, "[ Driver Signed / Prise en charge ]", font="F1", size=7.5, r=cr, g=cg, b=cb)
    else:
        builder.line(sig_x1 + 8, sig_top - 46, sig_x2 - 10, sig_top - 46)
        builder.text(sig_x1 + 12, sig_top - 54, "(Driver Signature / Stamp)", font="F1", size=6.5, r=0.5, g=0.5, b=0.5)

    # Box 24: Consignee signature (Goods received)
    builder.text(sig_x2 + 4, sig_top - 8, "24  Marchandises reçues / Goods received", font="F2", size=6.8)
    builder.text(sig_x2 + 4, sig_top - 15, "Signature et timbre du destinataire / Consignee", font="F1", size=6.0)
    builder.text(sig_x2 + 8, sig_top - 24, f"Date: {doc.goods_received_date or '___/___/2026'}", font="F1", size=7.2, r=0.3, g=0.3, b=0.3)
    if doc.consignee_receiver_name:
        builder.text(sig_x2 + 8, sig_top - 33, f"Received by: {doc.consignee_receiver_name}", font="F2", size=7.8)
        builder.line(sig_x2 + 8, sig_top - 46, right - 10, sig_top - 46)
        builder.text(sig_x2 + 12, sig_top - 42, "[ Delivered & Received / Reçu ]", font="F1", size=7.5, r=cr, g=cg, b=cb)
    else:
        builder.line(sig_x2 + 8, sig_top - 46, right - 10, sig_top - 46)
        builder.text(sig_x2 + 12, sig_top - 54, "(Consignee Signature / Stamp)", font="F1", size=6.5, r=0.5, g=0.5, b=0.5)

    # Official Footer Note
    builder.text(left + 4, bottom - 10, "International Consignment Note under the Convention on the Contract for the International Carriage of Goods by Road (CMR 1956)", font="F1", size=6.0, r=0.3, g=0.3, b=0.3)
    builder.text(right - 120, bottom - 10, f"Page 1 / {theme['name'][:12]}", font="F2", size=6.0, r=0.3, g=0.3, b=0.3)

    return builder.get_stream()


def build_pdf_document(doc: CMRDocument, copies: List[str] = None) -> bytes:
    """
    Builds a complete, multi-page or single-page PDF document in pure Python.
    No pip dependencies needed.
    """
    if copies is None:
        copies = ["1"]  # Default to Copy 1 (Sender)
    elif "all" in copies:
        copies = ["1", "2", "3", "4"]

    num_pages = len(copies)
    page_streams = [render_cmr_page_stream(doc, copy_key=c) for c in copies]

    # Assemble PDF 1.4 objects:
    # 1: Catalog
    # 2: Pages
    # 3.. 2+N: Page objects
    # 3+N.. 2+2N: Content stream objects
    # 3+2N: Font F1 (Helvetica)
    # 4+2N: Font F2 (Helvetica-Bold)

    objects: List[bytes] = []
    
    # Obj 1: Catalog
    objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")
    
    # Obj 2: Pages container
    kids_refs = " ".join(f"{3 + i} 0 R" for i in range(num_pages))
    pages_obj = f"<< /Type /Pages /Kids [ {kids_refs} ] /Count {num_pages} >>".encode("ascii")
    objects.append(pages_obj)
    
    font_f1_id = 3 + 2 * num_pages
    font_f2_id = 4 + 2 * num_pages
    
    # Page objects (3 to 2+N)
    for i in range(num_pages):
        content_id = 3 + num_pages + i
        page_dict = (
            f"<< /Type /Page /Parent 2 0 R "
            f"/MediaBox [ 0 0 {PAGE_WIDTH:.2f} {PAGE_HEIGHT:.2f} ] "
            f"/Contents {content_id} 0 R "
            f"/Resources << /Font << /F1 {font_f1_id} 0 R /F2 {font_f2_id} 0 R >> >> >>"
        ).encode("ascii")
        objects.append(page_dict)
        
    # Content streams (3+N to 2+2N)
    for stream_bytes in page_streams:
        stream_len = len(stream_bytes)
        obj_data = (
            f"<< /Length {stream_len} >>\nstream\n".encode("ascii")
            + stream_bytes
            + b"\nendstream"
        )
        objects.append(obj_data)
        
    # Fonts
    f1_data = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
    f2_data = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
    objects.append(f1_data)
    objects.append(f2_data)

    # Write PDF with exact cross-reference table (xref)
    output = io.BytesIO()
    output.write(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    
    offsets = []
    for i, obj in enumerate(objects, 1):
        offsets.append(output.tell())
        output.write(f"{i} 0 obj\n".encode("ascii"))
        output.write(obj)
        output.write(b"\nendobj\n")
        
    xref_offset = output.tell()
    output.write(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    output.write(b"0000000000 65535 f \n")
    for off in offsets:
        output.write(f"{off:010d} 00000 n \n".encode("ascii"))
        
    trailer = (
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
        f"startxref\n{xref_offset}\n%%EOF\n"
    ).encode("ascii")
    output.write(trailer)
    
    return output.getvalue()
