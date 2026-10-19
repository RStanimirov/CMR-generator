import { CMRConsignment } from '../types/cmr';

export const SAMPLE_PRESETS: Record<string, { label: string; description: string; data: CMRConsignment }> = {
  general_cargo: {
    label: 'Standard EU Industrial Cargo',
    description: 'Germany to France automotive spare parts & components',
    data: {
      consignmentNumber: 'CMR-2026-DE-8910',
      issueDate: '2026-10-20',
      sender: {
        name: 'EURO-LOGISTICS INDUSTRIE GMBH',
        address: 'Industriestrasse 45-47, Tor 8',
        cityPostal: '60314 Frankfurt am Main',
        country: 'Germany',
        contactPhone: '+49 69 9876 5430',
        contactEmail: 'dispatch@euro-logistics.de',
        vatId: 'DE812345678'
      },
      consignee: {
        name: 'TRANS-FRANCE DISTRIBUTION SAS',
        address: '12 Rue du Port Fluvial, Z.I. Nord',
        cityPostal: '69007 Lyon',
        country: 'France',
        contactPhone: '+33 4 72 00 11 22',
        contactEmail: 'reception@trans-france.fr',
        vatId: 'FR45987654321'
      },
      deliveryPlace: 'Lyon, Z.I. Nord, Entrepôt B',
      deliveryCountry: 'France',
      takingOverPlace: 'Frankfurt am Main',
      takingOverCountry: 'Germany',
      takingOverDate: '2026-10-20',
      documentsAttached: 'Commercial Invoice #INV-2026-4412, Packing List (3 pages), EUR.1 Certificate',
      items: [
        {
          id: '1',
          marksAndNumbers: 'FR/EXP-01 TO 12',
          packagesCount: 12,
          packingMethod: 'Euro-pallets',
          natureOfGoods: 'Automotive Precision Transmission Components (Dry, Sealed)',
          statisticalNumber: '8708.40.50',
          grossWeightKg: 4850.0,
          volumeM3: 18.5,
          adrDetails: ''
        },
        {
          id: '2',
          marksAndNumbers: 'FR/EXP-13 TO 18',
          packagesCount: 6,
          packingMethod: 'Heavy Wooden Crates',
          natureOfGoods: 'Hydraulic Pump Assemblies & Fasteners',
          statisticalNumber: '8413.60.31',
          grossWeightKg: 2420.0,
          volumeM3: 8.2,
          adrDetails: ''
        }
      ],
      senderInstructions: 'Keep dry. Do not double stack wooden crates. Temperature range: +5°C to +30°C. Customs clearance at Strasbourg Border.',
      codAmount: '',
      paymentInstructions: 'Carriage Paid (Franco domicile)',
      carrier: {
        name: 'SCHNEIDER SPEDITION & CO. KG',
        address: 'Rheinhafen 12',
        cityPostal: '68169 Mannheim',
        country: 'Germany',
        contactPhone: '+49 621 555 4321',
        contactEmail: 'ops@schneider-spedition.de',
        vatId: 'DE123987456'
      },
      carrierTruckPlate: 'MA-SC-8840',
      carrierTrailerPlate: 'MA-TR-9120',
      successiveCarrier: {
        name: 'RHÔNE EXPRESS CARGO SARL',
        address: 'Zone Fret Aéroport St. Exupéry',
        cityPostal: '69125 Colombier-Saugnieu',
        country: 'France',
        contactPhone: '+33 4 72 22 33 44',
        contactEmail: '',
        vatId: 'FR789123456'
      },
      carrierReservations: 'Goods checked in rainproof sealed condition. Pallets shrink-wrapped. Number of packages verified.',
      specialAgreements: 'CMR Convention 1956 applies. Jurisdiction: Frankfurt am Main. ADR not applicable.',
      charges: {
        carriagePaid: 1650.0,
        carriageForward: 0.0,
        reductionsSender: 0.0,
        reductionsConsignee: 0.0,
        balanceSender: 1650.0,
        balanceConsignee: 0.0,
        currency: 'EUR'
      },
      establishedPlace: 'Frankfurt am Main',
      establishedDate: '2026-10-20',
      signatures: {
        senderSignerName: 'Klaus Müller (Shipping Mgr)',
        senderSignedAt: '2026-10-20 08:30',
        carrierDriverName: 'Hans Becker (Driver ID 4920)',
        carrierSignedAt: '2026-10-20 09:15',
        consigneeReceiverName: 'Jean Dupont (Warehouse Lead)',
        goodsReceivedDate: '2026-10-21'
      }
    }
  },

  adr_chemicals: {
    label: 'ADR Hazardous Chemicals (Rotterdam -> Antwerp)',
    description: 'Class 3 Flammable liquids in certified IBC containers',
    data: {
      consignmentNumber: 'CMR-2026-ADR-502',
      issueDate: '2026-10-21',
      sender: {
        name: 'NOVA CHEMIE ROTTERDAM B.V.',
        address: 'Botlek Havennummer 4200, Pier 4',
        cityPostal: '3197 KA Botlek Rotterdam',
        country: 'Netherlands',
        contactPhone: '+31 10 490 8800',
        contactEmail: 'adr-logistics@novachemie.nl',
        vatId: 'NL801234567B01'
      },
      consignee: {
        name: 'BELGO-SOLVENTS INDUSTRIEPARK N.V.',
        address: 'Scheldelaan 255, Haven 1020',
        cityPostal: '2040 Antwerpen',
        country: 'Belgium',
        contactPhone: '+32 3 540 6000',
        contactEmail: 'intake@belgosolvents.be',
        vatId: 'BE0412398765'
      },
      deliveryPlace: 'Haven van Antwerpen, Scheldelaan 255',
      deliveryCountry: 'Belgium',
      takingOverPlace: 'Rotterdam Botlek',
      takingOverCountry: 'Netherlands',
      takingOverDate: '2026-10-21',
      documentsAttached: 'ADR Transport Document, Safety Data Sheet (SDS), Multimodal Dangerous Goods Form',
      items: [
        {
          id: '1',
          marksAndNumbers: 'IBC-01 TO 10',
          packagesCount: 10,
          packingMethod: 'Intermediate Bulk Containers (IBC 31HA1)',
          natureOfGoods: 'UN 1993 FLAMMABLE LIQUID, N.O.S. (Ethanol & Isopropanol mixture)',
          statisticalNumber: '2905.12.00',
          grossWeightKg: 9800.0,
          volumeM3: 10.0,
          adrDetails: 'UN 1993, 3, PG II, (D/E), Special provision 274'
        }
      ],
      senderInstructions: 'ADR Transport Category 2 (Factor 3 = 29,400 points). Emergency response telephone: +31 10 490 8899. Drivers with valid ADR Certificate required.',
      codAmount: '',
      paymentInstructions: 'Carriage Paid',
      carrier: {
        name: 'VAN DIJK TANK & BULK TRANSPORT B.V.',
        address: 'Waalhaven Z.z. 88',
        cityPostal: '3089 JJ Rotterdam',
        country: 'Netherlands',
        contactPhone: '+31 10 283 1100',
        contactEmail: 'planning@vandijkbulk.nl',
        vatId: 'NL809988776B01'
      },
      carrierTruckPlate: '78-BXT-3',
      carrierTrailerPlate: 'OF-45-ZZ',
      successiveCarrier: {
        name: '',
        address: '',
        cityPostal: '',
        country: '',
        contactPhone: '',
        contactEmail: '',
        vatId: ''
      },
      carrierReservations: 'Tanks inspected for leakage: None. Visual seals intact. Hazard placards affixed front/rear/sides.',
      specialAgreements: 'Tunnel restriction code (D/E) enforced. ADR instructions written in NL/FR/EN.',
      charges: {
        carriagePaid: 950.0,
        carriageForward: 0.0,
        reductionsSender: 0.0,
        reductionsConsignee: 0.0,
        balanceSender: 950.0,
        balanceConsignee: 0.0,
        currency: 'EUR'
      },
      establishedPlace: 'Rotterdam',
      establishedDate: '2026-10-21',
      signatures: {
        senderSignerName: 'Martijn de Jong (Dangerous Goods Safety Advisor)',
        senderSignedAt: '2026-10-21 07:15',
        carrierDriverName: 'Pieter van Loon (ADR Cert #NL-2024-9182)',
        carrierSignedAt: '2026-10-21 07:45',
        consigneeReceiverName: '',
        goodsReceivedDate: ''
      }
    }
  },

  cold_chain: {
    label: 'Temperature Controlled Fresh Food',
    description: 'Valencia to Munich citrus fruits with continuous +4°C monitoring',
    data: {
      consignmentNumber: 'CMR-2026-REEF-1109',
      issueDate: '2026-10-19',
      sender: {
        name: 'CITRICOS DEL MEDITERRANEO S.A.',
        address: 'Poligono Industrial Fuente del Jarro, C/ Ciudad de Sevilla 18',
        cityPostal: '46988 Paterna, Valencia',
        country: 'Spain',
        contactPhone: '+34 96 134 5000',
        contactEmail: 'export@citricosmed.es',
        vatId: 'ESA46123456'
      },
      consignee: {
        name: 'FRUCHTHOF MÜNCHEN GMBH & CO. KG',
        address: 'Schäftlarnstrasse 10, Großmarkthalle',
        cityPostal: '81371 München',
        country: 'Germany',
        contactPhone: '+49 89 7421 8800',
        contactEmail: 'wareneingang@fruchthof-muenchen.de',
        vatId: 'DE129876543'
      },
      deliveryPlace: 'Grossmarkthalle München, Halle 4',
      deliveryCountry: 'Germany',
      takingOverPlace: 'Paterna (Valencia)',
      takingOverCountry: 'Spain',
      takingOverDate: '2026-10-19',
      documentsAttached: 'Phytosanitary Certificate ES-46/2026, Thermologger Data Certificate #TH-8821, CMR Consignment Note',
      items: [
        {
          id: '1',
          marksAndNumbers: 'VAL-ORANGE 01-33',
          packagesCount: 33,
          packingMethod: 'Euro-pallets wrapped with netting',
          natureOfGoods: 'Fresh Navelina Oranges Class 1 (Temperature set: +4.0°C)',
          statisticalNumber: '0805.10.22',
          grossWeightKg: 21450.0,
          volumeM3: 65.0,
          adrDetails: ''
        }
      ],
      senderInstructions: 'Continuous temperature setpoint at +4.0°C (+/- 1.0°C). Thermoking datalogger active. Do not interrupt cooling during transit or border stops.',
      codAmount: '',
      paymentInstructions: 'Carriage Paid (Franco)',
      carrier: {
        name: 'IBERIA REEFER LOGISTICS SL',
        address: 'Autovía A-3, km 342',
        cityPostal: '46930 Quart de Poblet, Valencia',
        country: 'Spain',
        contactPhone: '+34 96 150 9000',
        contactEmail: 'traffic@iberiareefer.com',
        vatId: 'ESB98765432'
      },
      carrierTruckPlate: '4410-LXZ',
      carrierTrailerPlate: 'R-8822-BCN (ThermoKing SLXi 400)',
      successiveCarrier: {
        name: '',
        address: '',
        cityPostal: '',
        country: '',
        contactPhone: '',
        contactEmail: '',
        vatId: ''
      },
      carrierReservations: 'Temperature at loading verified at +4.2°C. Reefer unit precooled to +3.8°C prior to loading. Pallets intact.',
      specialAgreements: 'ATP Certificate Class FRC (valid until 2028). Direct transit without transshipment.',
      charges: {
        carriagePaid: 3200.0,
        carriageForward: 0.0,
        reductionsSender: 0.0,
        reductionsConsignee: 0.0,
        balanceSender: 3200.0,
        balanceConsignee: 0.0,
        currency: 'EUR'
      },
      establishedPlace: 'Paterna',
      establishedDate: '2026-10-19',
      signatures: {
        senderSignerName: 'Carlos Benitez (Quality Control)',
        senderSignedAt: '2026-10-19 14:00',
        carrierDriverName: 'Antonio Morales Ruiz',
        carrierSignedAt: '2026-10-19 14:30',
        consigneeReceiverName: '',
        goodsReceivedDate: ''
      }
    }
  },

  blank: {
    label: 'Blank Consignment Note',
    description: 'Empty form ready for custom input',
    data: {
      consignmentNumber: `CMR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
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
    }
  }
};
