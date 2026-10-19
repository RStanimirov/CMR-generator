"""
CMR Generator CLI & Package Entrypoint
"""

from .models import CMRDocument, CargoItem, Party, CarriageCharges, create_sample_cmr
from .pure_pdf_writer import build_pdf_document, COPY_THEMES

__version__ = "1.0.0"
__all__ = [
    "CMRDocument",
    "CargoItem",
    "Party",
    "CarriageCharges",
    "create_sample_cmr",
    "build_pdf_document",
    "COPY_THEMES"
]
