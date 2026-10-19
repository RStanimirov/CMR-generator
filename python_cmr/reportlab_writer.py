"""
Optional ReportLab-based PDF generator for enhanced styling.
Used if 'reportlab' is installed in the python environment.
Falls back seamlessly to pure_pdf_writer if reportlab is not present.
"""

from typing import List, Optional
from .models import CMRDocument
from .pure_pdf_writer import build_pdf_document as pure_build_pdf

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


def build_cmr_with_reportlab(doc: CMRDocument, copies: List[str] = None) -> bytes:
    """
    Renders CMR consignment note using ReportLab if installed,
    otherwise falls back to pure Python PDF writer.
    """
    if not REPORTLAB_AVAILABLE:
        return pure_build_pdf(doc, copies=copies)

    import io
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    if copies is None:
        copies = ["1"]
    elif "all" in copies:
        copies = ["1", "2", "3", "4"]

    copy_colors = {
        "1": colors.HexColor("#dc2626"),  # Red
        "2": colors.HexColor("#2563eb"),  # Blue
        "3": colors.HexColor("#16a34a"),  # Green
        "4": colors.HexColor("#334155")   # Black / Slate
    }

    for copy_id in copies:
        theme_color = copy_colors.get(copy_id, colors.HexColor("#dc2626"))
        
        # Border
        c.setStrokeColor(theme_color)
        c.setLineWidth(1.5)
        c.rect(20, 25, width - 40, height - 50)
        
        # Top Header Bar
        c.setFillColor(theme_color)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(25, height - 42, f"CMR Consignment Note - Copy {copy_id} | Ref: {doc.consignment_number}")
        
        # Title
        c.setFillColor(colors.black)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(25, height - 60, "INTERNATIONAL CONSIGNMENT NOTE / LETTRE DE VOITURE (CMR 1956)")
        
        # Sender & Consignee
        c.setLineWidth(0.5)
        c.setStrokeColor(colors.gray)
        c.rect(20, height - 170, (width - 40) / 2, 95)
        c.setFont("Helvetica-Bold", 7)
        c.drawString(25, height - 85, "1. Sender / Expéditeur")
        c.setFont("Helvetica", 8)
        c.drawString(25, height - 100, doc.sender.name[:45])
        c.drawString(25, height - 112, doc.sender.address[:45])
        c.drawString(25, height - 124, f"{doc.sender.city_postal} {doc.sender.country}")
        
        c.rect(20 + (width - 40) / 2, height - 170, (width - 40) / 2, 95)
        c.setFont("Helvetica-Bold", 7)
        c.drawString(25 + (width - 40) / 2, height - 85, "16. Carrier / Transporteur")
        c.setFont("Helvetica", 8)
        c.drawString(25 + (width - 40) / 2, height - 100, doc.carrier.name[:45])
        c.drawString(25 + (width - 40) / 2, height - 112, f"Truck: {doc.carrier_license_plate} | Trailer: {doc.carrier_trailer_plate}")

        c.showPage()

    c.save()
    return buffer.getvalue()
