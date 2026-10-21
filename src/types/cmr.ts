export interface Party {
  name: string;
  address: string;
  cityPostal: string;
  country: string;
  contactPhone: string;
  contactEmail: string;
  vatId: string;
}

export interface CargoItem {
  id: string;
  marksAndNumbers: string;
  packagesCount: number;
  packingMethod: string;
  natureOfGoods: string;
  statisticalNumber: string;
  grossWeightKg: number;
  volumeM3: number;
  adrDetails?: string;
}

export interface CarriageCharges {
  carriagePaid: number;
  carriageForward: number;
  reductionsSender: number;
  reductionsConsignee: number;
  balanceSender: number;
  balanceConsignee: number;
  currency: string;
}

export interface Signatures {
  senderSignerName: string;
  senderSignatureDataUrl?: string;
  senderSignedAt?: string;

  carrierDriverName: string;
  carrierSignatureDataUrl?: string;
  carrierSignedAt?: string;

  consigneeReceiverName: string;
  consigneeSignatureDataUrl?: string;
  consigneeSignedAt?: string;
  goodsReceivedDate?: string;
}

export interface CMRConsignment {
  consignmentNumber: string;
  issueDate: string;

  // Box 1: Sender (Expéditeur)
  sender: Party;

  // Box 2: Consignee (Destinataire)
  consignee: Party;

  // Box 3: Place of delivery of the goods (Lieu prévu pour la livraison)
  deliveryPlace: string;
  deliveryCountry: string;

  // Box 4: Place and date of taking over (Lieu et date de prise en charge)
  takingOverPlace: string;
  takingOverCountry: string;
  takingOverDate: string;

  // Box 5: Documents attached (Documents annexés)
  documentsAttached: string;

  // Boxes 6 to 12: Goods
  items: CargoItem[];

  // Box 13: Sender's instructions (Instructions de l'expéditeur)
  senderInstructions: string;

  // Box 14: Cash on delivery (Remboursement)
  codAmount: string;

  // Box 15: Payment instructions (Paiement du prix de transport)
  paymentInstructions: string;

  // Box 16: Carrier (Transporteur)
  carrier: Party;
  carrierTruckPlate: string;
  carrierTrailerPlate: string;

  // Box 17: Successive carriers (Transporteurs successifs)
  successiveCarrier: Party;

  // Box 18: Carrier's reservations and observations (Réserves et observations)
  carrierReservations: string;

  // Box 19: Special agreements (Conventions particulières)
  specialAgreements: string;

  // Box 20: To be paid by (À payer par)
  charges: CarriageCharges;

  // Box 21: Established in/on (Établi à / le)
  establishedPlace: string;
  establishedDate: string;

  // Boxes 22, 23, 24: Signatures
  signatures: Signatures;
}

export type CMRCopyType = '1_sender' | '2_consignee' | '3_carrier' | '4_admin' | 'all';

export interface CopyMetadata {
  id: CMRCopyType;
  number: number;
  name: string;
  titleFr: string;
  titleEn: string;
  recipient: string;
  badgeBg: string;
  borderColor: string;
  textColor: string;
  accentHex: string;
}

export const CMR_COPIES: Record<string, CopyMetadata> = {
  '1_sender': {
    id: '1_sender',
    number: 1,
    name: 'Copy 1 (Light Violet)',
    titleFr: "Exemplaire pour l'expéditeur",
    titleEn: 'Copy for sender',
    recipient: 'Sender / Expéditeur',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
    borderColor: 'border-violet-400',
    textColor: 'text-violet-600',
    accentHex: '#C4121A'
  },
  '2_consignee': {
    id: '2_consignee',
    number: 2,
    name: 'Copy 2 (Blue)',
    titleFr: 'Exemplaire pour le destinataire',
    titleEn: 'Copy for consignee',
    recipient: 'Consignee / Destinataire',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    borderColor: 'border-blue-600',
    textColor: 'text-blue-600',
    accentHex: '#2563eb'
  },
  '3_carrier': {
    id: '3_carrier',
    number: 3,
    name: 'Copy 3 (Green)',
    titleFr: 'Exemplaire pour le transporteur',
    titleEn: 'Copy for carrier',
    recipient: 'Carrier / Transporteur',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderColor: 'border-emerald-600',
    textColor: 'text-emerald-600',
    accentHex: '#16a34a'
  },
  '4_admin': {
    id: '4_admin',
    number: 4,
    name: 'Copy 4 (Black)',
    titleFr: "Exemplaire pour l'administration",
    titleEn: 'Copy for carrier administration',
    recipient: 'Administration / Office',
    badgeBg: 'bg-neutral-100 text-neutral-700 border-neutral-300',
    borderColor: 'border-neutral-700',
    textColor: 'text-neutral-700',
    accentHex: '#334155'
  }
};
