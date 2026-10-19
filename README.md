# Python CMR Generator

A functional, compliant generator for international road transport CMR Consignment Notes according to the UN Geneva Convention 1956 standard. 

Features pure Python PDF generation with zero external dependencies, built-in validation, and automated support for the official 4-copy booklet layout (Red, Blue, Green, Black).

## Key Features

* **Full 24-Box Coverage:** Comliance with the official UN Geneva CMR Convention 1956 layout.
* **Zero-Dependency PDF Engine:** Runs out of the box on standard Python 3.8+ without additional package installations.
* **4-Copy Booklet Support:** Generates multi-page bundles with official color schemes:
  * Copy 1 (Red): Sender
  * Copy 2 (Blue): Consignee
  * Copy 3 (Green): Carrier
  * Copy 4 (Black): Carrier office
* **Automated Calculations:** Auto-sums package count, total gross weight (kg), and volume (m³).
* **Dangerous Goods (ADR):** Integrated fields for UN numbers, ADR hazard classes, and packing groups.
* **Validation Engine:** Flags missing mandatory fields before document generation.
* **Interfaces:** CLI, JSON import/export, and web preview integration.

## Quickstart

### Frontend Setup (TypeScript / React)
```bash
# Install dependencies
npm install

# Start the local Vite development server
npm run dev
```

### Backend Setup (Python)
The core engine runs on standard Python 3.8+ without mandatory dependencies. If you wish to use optional features or run development tools:
```bash
# Optional: Install development requirements
pip install -r requirements.txt
```

### Command Line Interface

Generate a sample CMR bundle:
```bash
python3 -m python_cmr.cli sample --copies all --output cmr_sample.pdf
```

Generate from a custom JSON file:
```bash
python3 -m python_cmr.cli generate --input my_consignment.json --output consignment.pdf --copies all
```

Export a blank JSON template:
```bash
python3 -m python_cmr.cli template --output template.json
```

Validate consignment data:
```bash
python3 -m python_cmr.cli validate --input my_consignment.json
```

## Project Structure

```text
├── python_cmr/
│   ├── __init__.py           # Package exports
│   ├── models.py             # Dataclass schemas & cargo math
│   ├── pure_pdf_writer.py    # Zero-dependency vector PDF 1.4 engine
│   ├── reportlab_writer.py   # Optional ReportLab integration
│   └── cli.py                # Command-line interface
├── src/                      # Interactive Web GUI (React + Tailwind)
├── tests/
│   └── test_cmr.py           # Unit tests
├── pyproject.toml            # Packaging configuration
└── requirements.txt          # Optional dev packages
```

## Testing

Run the test suite using standard unittest:
```bash
python3 -m unittest discover tests
```

## License

MIT License. Free for commercial and logistics operations.