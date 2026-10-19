import { CMRConsignment } from '../types/cmr';

/**
 * Converts camelCase CMRConsignment to snake_case dictionary matching Python models.
 */
export function convertToPythonDict(c: CMRConsignment): Record<string, any> {
  return {
    consignment_number: c.consignmentNumber,
    sender: {
      name: c.sender.name,
      address: c.sender.address,
      city_postal: c.sender.cityPostal,
      country: c.sender.country,
      contact_phone: c.sender.contactPhone,
      contact_email: c.sender.contactEmail,
      vat_id: c.sender.vatId
    },
    consignee: {
      name: c.consignee.name,
      address: c.consignee.address,
      city_postal: c.consignee.cityPostal,
      country: c.consignee.country,
      contact_phone: c.consignee.contactPhone,
      contact_email: c.consignee.contactEmail,
      vat_id: c.consignee.vatId
    },
    delivery_place: c.deliveryPlace,
    delivery_country: c.deliveryCountry,
    taking_over_place: c.takingOverPlace,
    taking_over_country: c.takingOverCountry,
    taking_over_date: c.takingOverDate,
    documents_attached: c.documentsAttached,
    items: c.items.map((it) => ({
      marks_and_numbers: it.marksAndNumbers,
      packages_count: Number(it.packagesCount) || 1,
      packing_method: it.packingMethod,
      nature_of_goods: it.natureOfGoods,
      statistical_number: it.statisticalNumber,
      gross_weight_kg: Number(it.grossWeightKg) || 0.0,
      volume_m3: Number(it.volumeM3) || 0.0,
      adr_details: it.adrDetails || ''
    })),
    sender_instructions: c.senderInstructions,
    cod_amount: c.codAmount,
    payment_instructions: c.paymentInstructions,
    carrier: {
      name: c.carrier.name,
      address: c.carrier.address,
      city_postal: c.carrier.cityPostal,
      country: c.carrier.country,
      contact_phone: c.carrier.contactPhone,
      contact_email: c.carrier.contactEmail,
      vat_id: c.carrier.vatId
    },
    carrier_license_plate: c.carrierTruckPlate,
    carrier_trailer_plate: c.carrierTrailerPlate,
    successive_carrier: {
      name: c.successiveCarrier.name,
      address: c.successiveCarrier.address,
      city_postal: c.successiveCarrier.cityPostal,
      country: c.successiveCarrier.country,
      contact_phone: c.successiveCarrier.contactPhone,
      contact_email: c.successiveCarrier.contactEmail,
      vat_id: c.successiveCarrier.vatId
    },
    carrier_reservations: c.carrierReservations,
    special_agreements: c.specialAgreements,
    charges: {
      carriage_paid: Number(c.charges.carriagePaid) || 0.0,
      carriage_forward: Number(c.charges.carriageForward) || 0.0,
      reductions_sender: Number(c.charges.reductionsSender) || 0.0,
      reductions_consignee: Number(c.charges.reductionsConsignee) || 0.0,
      balance_sender: Number(c.charges.balanceSender) || 0.0,
      balance_consignee: Number(c.charges.balanceConsignee) || 0.0,
      currency: c.charges.currency || 'EUR'
    },
    established_place: c.establishedPlace,
    established_date: c.establishedDate,
    sender_signer_name: c.signatures.senderSignerName,
    carrier_driver_name: c.signatures.carrierDriverName,
    consignee_receiver_name: c.signatures.consigneeReceiverName,
    goods_received_date: c.signatures.goodsReceivedDate || ''
  };
}

/**
 * Generates an executable standalone Python script recreating the consignment.
 */
export function generateExecutablePythonScript(c: CMRConsignment): string {
  const data = convertToPythonDict(c);
  const jsonString = JSON.stringify(data, null, 4);

  return `#!/usr/bin/env python3
"""
Standalone CMR Consignment Note Generator script.
Generated for consignment: ${c.consignmentNumber}
Ready to push to GitHub!
"""

import sys
import json
from python_cmr.models import CMRDocument
from python_cmr.pure_pdf_writer import build_pdf_document

# Consignment Data
CONSIGNMENT_DATA = ${jsonString}

def main():
    doc = CMRDocument.from_dict(CONSIGNMENT_DATA)
    output_filename = f"{doc.consignment_number}.pdf"
    
    print(f"Generating official 4-copy CMR booklet for: {doc.consignment_number}...")
    pdf_bytes = build_pdf_document(doc, copies=["1", "2", "3", "4"])
    
    with open(output_filename, "wb") as f:
        f.write(pdf_bytes)
        
    print(f"✓ Saved {len(pdf_bytes)} bytes to {output_filename}")
    print(f"  • Sender:    {doc.sender.name} ({doc.sender.country})")
    print(f"  • Consignee: {doc.consignee.name} ({doc.consignee.country})")
    print(f"  • Carrier:   {doc.carrier.name}")
    print(f"  • Total:     {doc.total_packages} pkgs, {doc.total_gross_weight_kg:,.1f} kg")

if __name__ == "__main__":
    main()
`;
}
