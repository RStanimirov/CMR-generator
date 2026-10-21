import { CMRConsignment } from '../types/cmr';

export const createEmptyConsignment = (): CMRConsignment => ({
  consignmentNumber: '',
  issueDate: new Date().toISOString().split('T')[0],
  sender: {
    name: '',
    address: '',
    cityPostal: '',
    country: '',
    contactPhone: '',
    contactEmail: '',
    vatId: ''
  },
  consignee: {
    name: '',
    address: '',
    cityPostal: '',
    country: '',
    contactPhone: '',
    contactEmail: '',
    vatId: ''
  },
  deliveryPlace: '',
  deliveryCountry: '',
  takingOverPlace: '',
  takingOverCountry: '',
  takingOverDate: new Date().toISOString().split('T')[0],
  documentsAttached: '',
  items: [
    {
      id: '1',
      marksAndNumbers: '',
      packagesCount: 1,
      packingMethod: 'Euro-pallets',
      natureOfGoods: '',
      statisticalNumber: '',
      grossWeightKg: 0,
      volumeM3: 0,
      adrDetails: ''
    }
  ],
  senderInstructions: '',
  codAmount: '',
  paymentInstructions: 'Carriage Paid',
  carrier: {
    name: '',
    address: '',
    cityPostal: '',
    country: '',
    contactPhone: '',
    contactEmail: '',
    vatId: ''
  },
  carrierTruckPlate: '',
  carrierTrailerPlate: '',
  successiveCarrier: {
    name: '',
    address: '',
    cityPostal: '',
    country: '',
    contactPhone: '',
    contactEmail: '',
    vatId: ''
  },
  carrierReservations: '',
  specialAgreements: 'CMR Convention 1956 applies.',
  charges: {
    carriagePaid: 0,
    carriageForward: 0,
    reductionsSender: 0,
    reductionsConsignee: 0,
    balanceSender: 0,
    balanceConsignee: 0,
    currency: 'EUR'
  },
  establishedPlace: '',
  establishedDate: new Date().toISOString().split('T')[0],
  signatures: {
    senderSignerName: '',
    carrierDriverName: '',
    consigneeReceiverName: '',
    goodsReceivedDate: ''
  }
});
