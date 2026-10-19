"""
Unit tests for the CMR Generator.
Run with: python3 -m unittest discover tests
"""

import unittest
import json
from python_cmr.models import CMRDocument, CargoItem, Party, CarriageCharges, create_sample_cmr
from python_cmr.pure_pdf_writer import build_pdf_document


class TestCMRDocument(unittest.TestCase):
    def test_sample_creation(self):
        doc = create_sample_cmr()
        self.assertEqual(doc.consignment_number, "CMR-2026-EU-7890")
        self.assertEqual(len(doc.items), 2)
        self.assertEqual(doc.total_packages, 18)
        self.assertEqual(doc.total_gross_weight_kg, 7270.0)
        self.assertEqual(doc.total_volume_m3, 26.70)

    def test_json_serialization(self):
        doc = create_sample_cmr()
        json_str = doc.to_json()
        restored = CMRDocument.from_json(json_str)
        self.assertEqual(restored.consignment_number, doc.consignment_number)
        self.assertEqual(restored.sender.name, doc.sender.name)
        self.assertEqual(restored.total_packages, doc.total_packages)
        self.assertEqual(restored.total_gross_weight_kg, doc.total_gross_weight_kg)

    def test_pdf_generation_single_page(self):
        doc = create_sample_cmr()
        pdf_bytes = build_pdf_document(doc, copies=["1"])
        self.assertTrue(pdf_bytes.startswith(b"%PDF-1.4"))
        self.assertTrue(b"trailer" in pdf_bytes)
        self.assertGreater(len(pdf_bytes), 5000)

    def test_pdf_generation_all_copies(self):
        doc = create_sample_cmr()
        pdf_bytes = build_pdf_document(doc, copies=["1", "2", "3", "4"])
        self.assertTrue(pdf_bytes.startswith(b"%PDF-1.4"))
        self.assertTrue(b"/Count 4" in pdf_bytes)
        self.assertGreater(len(pdf_bytes), 20000)


if __name__ == "__main__":
    unittest.main()
