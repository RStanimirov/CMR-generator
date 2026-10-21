# Python CMR Generator

A functional generator for international road transport CMR (International Consignment Note). 

Features pure Python PDF generation with zero external dependencies, built-in validation, and automated support for the official 4-copy booklet layout (Red, Blue, Green, Black).

## Note on Purpose

The primary purpose of this application is to demonstrate software engineering techniques, architectural patterns, and data modeling (such as zero-dependency vector rendering). Initially prototyped with Google AI Studio and refined/optimized via Antigravity, it is intended as a technical demonstration rather than a certified production-ready solution for official freight registration.

## Key Features

* **Zero-Dependency PDF Engine:** Runs out of the box on standard Python 3.8+ without additional package installations.
* **4-Copy Booklet Support:** Generates multi-page bundles with custom color schemes:
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
python -m python_cmr.cli sample --copies all --output cmr_sample.pdf
```

Generate from a custom JSON file:
```bash
python -m python_cmr.cli generate --input my_consignment.json --output consignment.pdf --copies all
```

Export a blank JSON template:
```bash
python -m python_cmr.cli template --output template.json
```

Validate consignment data:
```bash
python -m python_cmr.cli validate --input my_consignment.json
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
python -m unittest discover tests
```

## License & Disclaimer

**License:** Distributed under the MIT License. For educational and logistics evaluation purposes.

**Disclaimer:** This software is provided "as is", without warranty of any kind, express or implied. International road transport regulations and local customs enforcement requirements vary significantly by jurisdiction. Since this project is primarily a demonstration of software architecture and modeling rather than a certified tool, users are strictly advised to manually validate the generated PDF output against local legal requirements and official guidelines before using it for live logistics operations.
