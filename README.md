# Python CMR Generator 🚛📑
### International Consignment Note / Lettre de Voiture Internationale (UN Geneva Convention 1956)

A functional, compliant generator for international road transport **CMR Consignment Notes**. Includes zero-dependency pure Python PDF generation, full CLI, validation engine, and 4-copy official booklet support (Red, Blue, Green, Black).

---

## Features

- **Full 24-Box Coverage**: Precise adherence to the UN Geneva CMR Convention 1956 standard layout.
- **Zero-Dependency PDF Engine**: Runs out of the box on standard Python 3.8+ without `pip install` required.
- **4 Official Copy Color Schemes**:
  - `Copy 1 (Red)`: Exemplaire pour l'expéditeur (Sender)
  - `Copy 2 (Blue)`: Exemplaire pour le destinataire (Consignee)
  - `Copy 3 (Green)`: Exemplaire pour le transporteur (Carrier)
  - `Copy 4 (Black)`: Exemplaire pour l'administration (Carrier office)
  - `All Copies`: Automatically generates the complete multi-page document bundle.
- **Cargo Calculation**: Auto-summing packages count, total gross weight (kg), and volume (m³).
- **Dangerous Goods (ADR)**: Dedicated fields for UN numbers, ADR hazard classes, and packing groups.
- **Validation Engine**: Flags missing mandatory legal fields before dispatch.
- **CLI & Web Ready**: Command-line interface + JSON import/export + web preview interface.

---

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

### Generate Sample CMR PDF
```bash
python3 -m python_cmr.cli sample --copies all --output cmr_sample.pdf
```

### Generate from Custom JSON
```bash
python3 -m python_cmr.cli generate --input my_consignment.json --output consignment.pdf --copies all
```

### Export JSON Template
```bash
python3 -m python_cmr.cli template --output template.json
```

### Validate CMR Data
```bash
python3 -m python_cmr.cli validate --input my_consignment.json
```

---

# Build PDF for all 4 official copies
pdf_bytes = build_pdf_document(doc, copies=["1", "2", "3", "4"])

with open("waybill.pdf", "wb") as f:
    f.write(pdf_bytes)
```

---

## Project Structure

```
├── python_cmr/
│   ├── __init__.py           # Package exports
│   ├── models.py             # Dataclass schemas & cargo math
│   ├── pure_pdf_writer.py    # Zero-dependency vector PDF 1.4 engine
│   ├── reportlab_writer.py   # Optional ReportLab integration
│   └── cli.py                # Command-line interface
├── tests/
│   └── test_cmr.py           # Unit tests
├── requirements.txt          # Optional dev packages
├── pyproject.toml            # Packaging configuration
└── src/                      # Interactive Web GUI (React + Tailwind)
```

## Testing

Run test suite:
```bash
python3 -m unittest discover tests
```

---

## 📄 License
MIT License. Free for commercial and logistics operations.
