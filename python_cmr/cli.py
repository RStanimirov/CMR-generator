"""
Command Line Interface for the CMR Consignment Note Generator.
"""

import argparse
import sys
import os
import json
from .models import CMRDocument, create_sample_cmr
from .pure_pdf_writer import build_pdf_document


def cmd_sample(args):
    """Generates a sample CMR PDF document."""
    doc = create_sample_cmr()
    copies = ["1", "2", "3", "4"] if args.copies == "all" else [args.copies]
    pdf_bytes = build_pdf_document(doc, copies=copies)
    
    out_path = args.output or f"sample_cmr_{doc.consignment_number}.pdf"
    with open(out_path, "wb") as f:
        f.write(pdf_bytes)
        
    print(f"✓ Successfully generated sample CMR PDF: {out_path} ({len(pdf_bytes)} bytes)")
    print(f"  Consignment: {doc.consignment_number}")
    print(f"  Sender:      {doc.sender.name} ({doc.sender.country})")
    print(f"  Consignee:   {doc.consignee.name} ({doc.consignee.country})")
    print(f"  Carrier:     {doc.carrier.name}")
    print(f"  Total Cargo: {doc.total_packages} packages, {doc.total_gross_weight_kg:,.1f} kg, {doc.total_volume_m3:.2f} m³")
    print(f"  Copies:      {', '.join(copies)}")


def cmd_generate(args):
    """Generates a CMR PDF from a JSON input file."""
    if not os.path.exists(args.input):
        print(f"Error: Input file '{args.input}' not found.", file=sys.stderr)
        sys.exit(1)
        
    with open(args.input, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    doc = CMRDocument.from_dict(data)
    copies = ["1", "2", "3", "4"] if args.copies == "all" else [args.copies]
    pdf_bytes = build_pdf_document(doc, copies=copies)
    
    out_path = args.output or f"{doc.consignment_number or 'cmr_consignment'}.pdf"
    with open(out_path, "wb") as f:
        f.write(pdf_bytes)
        
    print(f"✓ Generated CMR PDF: {out_path} ({len(pdf_bytes)} bytes)")


def cmd_template(args):
    """Exports a sample/template JSON structure."""
    doc = create_sample_cmr()
    out_path = args.output or "cmr_template.json"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(doc.to_json(indent=2))
    print(f"✓ Exported CMR JSON template to {out_path}")


def cmd_validate(args):
    """Validates a CMR JSON file against standard logistics requirements."""
    if not os.path.exists(args.input):
        print(f"Error: File '{args.input}' not found.", file=sys.stderr)
        sys.exit(1)
        
    with open(args.input, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    doc = CMRDocument.from_dict(data)
    errors = []
    warnings = []
    
    if not doc.consignment_number:
        errors.append("Box 0: Consignment number is missing.")
    if not doc.sender.name:
        errors.append("Box 1: Sender name is required.")
    if not doc.consignee.name:
        errors.append("Box 2: Consignee name is required.")
    if not doc.delivery_place:
        warnings.append("Box 3: Delivery place is not specified.")
    if not doc.taking_over_place:
        warnings.append("Box 4: Taking over place is not specified.")
    if not doc.carrier.name:
        warnings.append("Box 16: Carrier name is blank.")
    if not doc.items:
        errors.append("Boxes 6-12: At least one cargo item must be entered.")
    else:
        for idx, item in enumerate(doc.items, 1):
            if not item.nature_of_goods:
                warnings.append(f"Cargo item #{idx}: Nature of goods is empty.")
            if item.gross_weight_kg <= 0:
                warnings.append(f"Cargo item #{idx}: Gross weight is 0 or negative.")
                
    print(f"\n--- CMR Validation Report for {doc.consignment_number} ---")
    if errors:
        print(f"❌ {len(errors)} Critical Errors:")
        for e in errors:
            print(f"   • {e}")
    else:
        print("✓ All mandatory CMR legal boxes validated.")
        
    if warnings:
        print(f"⚠️  {len(warnings)} Advisory Warnings:")
        for w in warnings:
            print(f"   • {w}")
    else:
        print("✓ No logistics warnings found.")
        
    if errors:
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="UN Geneva Convention CMR International Consignment Note Generator (Python)"
    )
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")
    
    # Sample generator
    p_sample = subparsers.add_parser("sample", help="Generate a sample CMR PDF")
    p_sample.add_argument("-o", "--output", help="Output PDF file path")
    p_sample.add_argument("-c", "--copies", default="all", choices=["1", "2", "3", "4", "all"], help="Copies to produce")
    p_sample.set_defaults(func=cmd_sample)
    
    # Generate from JSON
    p_gen = subparsers.add_parser("generate", help="Generate PDF from CMR JSON file")
    p_gen.add_argument("-i", "--input", required=True, help="Input JSON file path")
    p_gen.add_argument("-o", "--output", help="Output PDF file path")
    p_gen.add_argument("-c", "--copies", default="all", choices=["1", "2", "3", "4", "all"], help="Copies to produce")
    p_gen.set_defaults(func=cmd_generate)
    
    # Template
    p_tmpl = subparsers.add_parser("template", help="Export empty/sample JSON template")
    p_tmpl.add_argument("-o", "--output", help="Output JSON file path")
    p_tmpl.set_defaults(func=cmd_template)
    
    # Validate
    p_val = subparsers.add_parser("validate", help="Validate a CMR JSON file")
    p_val.add_argument("-i", "--input", required=True, help="Input JSON file path")
    p_val.set_defaults(func=cmd_validate)
    
    args = parser.parse_args()
    if not hasattr(args, "func"):
        parser.print_help()
        sys.exit(0)
    args.func(args)


if __name__ == "__main__":
    main()
