"""
CMR Document Models and Data Schema
"""

from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict, Any
import json


@dataclass
class Party:
    name: str = ""
    address: str = ""
    city_postal: str = ""
    country: str = ""
    contact_phone: str = ""
    contact_email: str = ""
    vat_id: str = ""

    def formatted_address(self) -> str:
        lines = [self.name]
        if self.address:
            lines.append(self.address)
        if self.city_postal:
            lines.append(self.city_postal)
        if self.country:
            lines.append(self.country.upper())
        if self.contact_phone:
            lines.append(f"Tel: {self.contact_phone}")
        if self.vat_id:
            lines.append(f"VAT: {self.vat_id}")
        return "\n".join(lines)


@dataclass
class CargoItem:
    marks_and_numbers: str = ""       # Box 6
    packages_count: int = 1           # Box 7
    packing_method: str = "Pallets"   # Box 8 (e.g. Europallets, Boxes, Drums)
    nature_of_goods: str = ""         # Box 9
    statistical_number: str = ""      # Box 10 (HS Code)
    gross_weight_kg: float = 0.0      # Box 11
    volume_m3: float = 0.0            # Box 12
    adr_details: str = ""             # Dangerous goods (UN, Class, Packing Group)


@dataclass
class CarriageCharges:
    carriage_paid: float = 0.0
    carriage_forward: float = 0.0
    reductions_sender: float = 0.0
    reductions_consignee: float = 0.0
    balance_sender: float = 0.0
    balance_consignee: float = 0.0
    supplements_sender: float = 0.0
    supplements_consignee: float = 0.0
    miscellaneous_sender: float = 0.0
    miscellaneous_consignee: float = 0.0
    currency: str = "EUR"


@dataclass
class CMRDocument:
    # Header
    consignment_number: str = "CMR-2026-001"
    
    # Box 1: Sender (Expéditeur)
    sender: Party = field(default_factory=Party)
    
    # Box 2: Consignee (Destinataire)
    consignee: Party = field(default_factory=Party)
    
    # Box 3: Place of delivery of the goods (Lieu prévu pour la livraison)
    delivery_place: str = ""
    delivery_country: str = ""
    
    # Box 4: Place and date of taking over (Lieu et date de la prise en charge)
    taking_over_place: str = ""
    taking_over_country: str = ""
    taking_over_date: str = ""
    
    # Box 5: Documents attached (Documents annexés)
    documents_attached: str = ""
    
    # Boxes 6 to 12: Goods table
    items: List[CargoItem] = field(default_factory=list)
    
    # Box 13: Sender's instructions (Instructions de l'expéditeur)
    sender_instructions: str = ""
    
    # Box 14: Cash on delivery (Prescriptions d'affranchissement / Remboursement)
    cod_amount: str = ""
    
    # Box 15: Payment instructions (Paiement du prix de transport)
    payment_instructions: str = "Carriage Paid (Franco)"
    
    # Box 16: Carrier (Transporteur)
    carrier: Party = field(default_factory=Party)
    carrier_license_plate: str = ""
    carrier_trailer_plate: str = ""
    
    # Box 17: Successive carriers (Transporteurs successifs)
    successive_carrier: Party = field(default_factory=Party)
    
    # Box 18: Carrier's reservations and observations (Réserves et observations)
    carrier_reservations: str = ""
    
    # Box 19: Special agreements (Conventions particulières)
    special_agreements: str = ""
    
    # Box 20: To be paid by (À payer par)
    charges: CarriageCharges = field(default_factory=CarriageCharges)
    
    # Box 21: Established in/on (Établi à / le)
    established_place: str = ""
    established_date: str = ""
    
    # Box 22: Sender signature/stamp (Signature et timbre de l'expéditeur)
    sender_signer_name: str = ""
    sender_signature_svg: str = ""
    
    # Box 23: Carrier signature/stamp (Signature et timbre du transporteur)
    carrier_driver_name: str = ""
    carrier_signature_svg: str = ""
    
    # Box 24: Goods received (Marchandises reçues)
    consignee_receiver_name: str = ""
    goods_received_date: str = ""
    consignee_signature_svg: str = ""

    @property
    def total_packages(self) -> int:
        return sum(item.packages_count for item in self.items)

    @property
    def total_gross_weight_kg(self) -> float:
        return round(sum(item.gross_weight_kg for item in self.items), 2)

    @property
    def total_volume_m3(self) -> float:
        return round(sum(item.volume_m3 for item in self.items), 3)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "CMRDocument":
        sender = Party(**data.get("sender", {})) if isinstance(data.get("sender"), dict) else Party()
        consignee = Party(**data.get("consignee", {})) if isinstance(data.get("consignee"), dict) else Party()
        carrier = Party(**data.get("carrier", {})) if isinstance(data.get("carrier"), dict) else Party()
        successive_carrier = Party(**data.get("successive_carrier", {})) if isinstance(data.get("successive_carrier"), dict) else Party()
        charges = CarriageCharges(**data.get("charges", {})) if isinstance(data.get("charges"), dict) else CarriageCharges()
        
        items_data = data.get("items", [])
        items = [CargoItem(**item) if isinstance(item, dict) else item for item in items_data]
        
        doc_kwargs = {k: v for k, v in data.items() if k not in ("sender", "consignee", "carrier", "successive_carrier", "charges", "items")}
        return cls(
            sender=sender,
            consignee=consignee,
            carrier=carrier,
            successive_carrier=successive_carrier,
            charges=charges,
            items=items,
            **doc_kwargs
        )

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent, ensure_ascii=False)

    @classmethod
    def from_json(cls, json_str: str) -> "CMRDocument":
        return cls.from_dict(json.loads(json_str))


def create_sample_cmr() -> CMRDocument:
    """Returns a generic sample international CMR consignment document."""
    return CMRDocument(
        consignment_number="CMR-2026-EU-7890",
        sender=Party(
            name="SAMPLE SENDER GMBH",
            address="100 Logistics Way",
            city_postal="60314 Frankfurt am Main",
            country="Germany",
            contact_phone="+49 000 000000",
            contact_email="sender@example.com",
            vat_id="DE000000000"
        ),
        consignee=Party(
            name="SAMPLE CONSIGNEE SAS",
            address="12 Rue du Port Fluvial",
            city_postal="69007 Lyon",
            country="France",
            contact_phone="+33 000 000000",
            contact_email="consignee@example.com",
            vat_id="FR00000000000"
        ),
        delivery_place="Lyon, Entrepôt B",
        delivery_country="France",
        taking_over_place="Frankfurt am Main",
        taking_over_country="Germany",
        taking_over_date="2026-10-20",
        documents_attached="Commercial Invoice #INV-2026-0001, Packing List",
        items=[
            CargoItem(
                marks_and_numbers="EXP-01 TO 12",
                packages_count=12,
                packing_method="Euro-pallets",
                nature_of_goods="Industrial Components (Dry, Sealed)",
                statistical_number="8708.40.50",
                gross_weight_kg=4850.0,
                volume_m3=18.5,
                adr_details=""
            ),
            CargoItem(
                marks_and_numbers="EXP-13 TO 18",
                packages_count=6,
                packing_method="Heavy Wooden Crates",
                nature_of_goods="Mechanical Equipment & Fasteners",
                statistical_number="8413.60.31",
                gross_weight_kg=2420.0,
                volume_m3=8.2,
                adr_details=""
            )
        ],
        sender_instructions="Keep dry. Temperature range: +5°C to +30°C.",
        cod_amount="",
        payment_instructions="Carriage Paid",
        carrier=Party(
            name="SAMPLE CARRIER LOGISTICS",
            address="Rheinhafen 12",
            city_postal="68169 Mannheim",
            country="Germany",
            contact_phone="+49 000 000001",
            contact_email="carrier@example.com",
            vat_id="DE111111111"
        ),
        carrier_license_plate="SAMPLE-TRUCK-01",
        carrier_trailer_plate="SAMPLE-TRAILER-01",
        successive_carrier=Party(
            name="SAMPLE SUCCESSIVE CARRIER",
            address="Zone Fret",
            city_postal="69125 Lyon",
            country="France"
        ),
        carrier_reservations="Goods checked in rainproof sealed condition. Pallets shrink-wrapped.",
        special_agreements="CMR Convention 1956 applies.",
        charges=CarriageCharges(
            carriage_paid=1650.00,
            carriage_forward=0.00,
            reductions_sender=0.00,
            reductions_consignee=0.00,
            balance_sender=1650.00,
            balance_consignee=0.00,
            currency="EUR"
        ),
        established_place="Frankfurt am Main",
        established_date="2026-10-20",
        sender_signer_name="Authorized Sender Signatory",
        carrier_driver_name="Carrier Driver",
        consignee_receiver_name="Consignee Receiver",
        goods_received_date=""
    )
