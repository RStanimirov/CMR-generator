import React, { useState } from 'react';
import {
  CMRConsignment,
  CargoItem,
  Party
} from '../types/cmr';
import {
  Plus,
  Trash2,
  Truck,
  Users,
  Package,
  FileText,
  DollarSign,
  PenTool,
  Info
} from 'lucide-react';
import { createEmptyConsignment } from '../utils/presets';

interface CMRFormEditorProps {
  consignment: CMRConsignment;
  onChange: (updated: CMRConsignment) => void;
  onOpenSignatureModal: (type: 'sender' | 'carrier' | 'consignee') => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const CMRFormEditor: React.FC<CMRFormEditorProps> = ({
  consignment,
  onChange,
  onOpenSignatureModal,
  activeTab,
  onTabChange
}) => {
  const updateParty = (field: 'sender' | 'consignee' | 'carrier' | 'successiveCarrier', subfield: keyof Party, value: string) => {
    onChange({
      ...consignment,
      [field]: {
        ...consignment[field],
        [subfield]: value
      }
    });
  };

  const updateRoot = (field: keyof CMRConsignment, value: any) => {
    onChange({
      ...consignment,
      [field]: value
    });
  };

  const handleCargoChange = (index: number, field: keyof CargoItem, value: any) => {
    const updatedItems = [...consignment.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    onChange({
      ...consignment,
      items: updatedItems
    });
  };

  const addCargoRow = () => {
    const newItem: CargoItem = {
      id: String(Date.now()),
      marksAndNumbers: `COLIS-${consignment.items.length + 1}`,
      packagesCount: 1,
      packingMethod: 'Euro-pallets',
      natureOfGoods: '',
      statisticalNumber: '',
      grossWeightKg: 100,
      volumeM3: 0.5,
      adrDetails: ''
    };
    onChange({
      ...consignment,
      items: [...consignment.items, newItem]
    });
  };

  const removeCargoRow = (index: number) => {
    if (consignment.items.length <= 1) return;
    const updated = consignment.items.filter((_, i) => i !== index);
    onChange({
      ...consignment,
      items: updated
    });
  };

  const totalPkgs = consignment.items.reduce((s, it) => s + (Number(it.packagesCount) || 0), 0);
  const totalWeight = consignment.items.reduce((s, it) => s + (Number(it.grossWeightKg) || 0), 0);
  const totalVol = consignment.items.reduce((s, it) => s + (Number(it.volumeM3) || 0), 0);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2.5 flex-wrap gap-2">
        <span className="text-xs text-neutral-500 font-medium">Consignment Details</span>
        <button
          onClick={() => {
            if (window.confirm('Clear all fields and reset to blank?')) {
              onChange(createEmptyConsignment());
            }
          }}
          className="rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition-colors shadow-2xs"
        >
          Clear Form
        </button>
      </div>

      {/* Editor Navigation Tabs */}
      <div className="flex border-b border-neutral-200 bg-white px-4">
        {[
          { id: 'parties', label: 'Parties', icon: Users, box: '1, 2, 16' },
          { id: 'route', label: 'Route & Dates', icon: Truck, box: '3, 4, 21' },
          { id: 'cargo', label: 'Cargo & ADR', icon: Package, box: '6-12' },
          { id: 'charges', label: 'Instructions & Cost', icon: DollarSign, box: '5, 13-20' },
          { id: 'signatures', label: 'Signatures', icon: PenTool, box: '22-24' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-neutral-900 text-neutral-900 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              <span className="text-[10px] text-neutral-400 font-mono">({tab.box})</span>
            </button>
          );
        })}
      </div>

      {/* Form Content Area */}
      <div className="flex-1 overflow-auto p-5 space-y-5">
        {/* TAB 1: PARTIES */}
        {activeTab === 'parties' && (
          <div className="space-y-6">
            {/* Box 1: Sender */}
            <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                    1
                  </span>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase">Expéditeur / Sender</h4>
                </div>
                <span className="text-[11px] text-neutral-400">Shipper / Dispatch company</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Company / Full Name</label>
                  <input
                    type="text"
                    value={consignment.sender.name}
                    onChange={(e) => updateParty('sender', 'name', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Street Address</label>
                  <input
                    type="text"
                    value={consignment.sender.address}
                    onChange={(e) => updateParty('sender', 'address', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">City & Postal Code</label>
                  <input
                    type="text"
                    value={consignment.sender.cityPostal}
                    onChange={(e) => updateParty('sender', 'cityPostal', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Country</label>
                  <input
                    type="text"
                    value={consignment.sender.country}
                    onChange={(e) => updateParty('sender', 'country', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">VAT / Tax ID</label>
                  <input
                    type="text"
                    value={consignment.sender.vatId}
                    onChange={(e) => updateParty('sender', 'vatId', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Box 2: Consignee */}
            <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                    2
                  </span>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase">Destinataire / Consignee</h4>
                </div>
                <span className="text-[11px] text-neutral-400">Receiver / Destination party</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Company / Full Name</label>
                  <input
                    type="text"
                    value={consignment.consignee.name}
                    onChange={(e) => updateParty('consignee', 'name', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Street Address</label>
                  <input
                    type="text"
                    value={consignment.consignee.address}
                    onChange={(e) => updateParty('consignee', 'address', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">City & Postal Code</label>
                  <input
                    type="text"
                    value={consignment.consignee.cityPostal}
                    onChange={(e) => updateParty('consignee', 'cityPostal', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Country</label>
                  <input
                    type="text"
                    value={consignment.consignee.country}
                    onChange={(e) => updateParty('consignee', 'country', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Contact Phone</label>
                  <input
                    type="text"
                    value={consignment.consignee.contactPhone}
                    onChange={(e) => updateParty('consignee', 'contactPhone', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Box 16: Carrier */}
            <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                    16
                  </span>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase">Transporteur / Carrier</h4>
                </div>
                <span className="text-[11px] text-neutral-400">Road haulier / Fleet operator</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Carrier Company Name</label>
                  <input
                    type="text"
                    value={consignment.carrier.name}
                    onChange={(e) => updateParty('carrier', 'name', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Tractor Plate (Camion)</label>
                  <input
                    type="text"
                    value={consignment.carrierTruckPlate}
                    onChange={(e) => updateRoot('carrierTruckPlate', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-mono text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Trailer Plate (Remorque)</label>
                  <input
                    type="text"
                    value={consignment.carrierTrailerPlate}
                    onChange={(e) => updateRoot('carrierTrailerPlate', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-mono text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Carrier Address</label>
                  <input
                    type="text"
                    value={consignment.carrier.address}
                    onChange={(e) => updateParty('carrier', 'address', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Carrier City & Country</label>
                  <input
                    type="text"
                    value={consignment.carrier.cityPostal}
                    onChange={(e) => updateParty('carrier', 'cityPostal', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Box 17: Successive Carrier */}
            <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                    17
                  </span>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase">Transporteurs successifs / Successive Carriers</h4>
                </div>
                <span className="text-[11px] text-neutral-400">Subcontracted / connecting haulier</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Successive Carrier Name</label>
                  <input
                    type="text"
                    value={consignment.successiveCarrier.name}
                    onChange={(e) => updateParty('successiveCarrier', 'name', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Address / Depot</label>
                  <input
                    type="text"
                    value={consignment.successiveCarrier.address}
                    onChange={(e) => updateParty('successiveCarrier', 'address', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">City & Country</label>
                  <input
                    type="text"
                    value={consignment.successiveCarrier.cityPostal}
                    onChange={(e) => updateParty('successiveCarrier', 'cityPostal', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROUTE & DATES */}
        {activeTab === 'route' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <h4 className="text-xs font-bold text-neutral-900 uppercase">Waybill Identification</h4>
                <span className="text-[11px] text-neutral-400">Box Header</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Consignment Note Number (CMR No.)</label>
                  <input
                    type="text"
                    value={consignment.consignmentNumber}
                    onChange={(e) => updateRoot('consignmentNumber', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-mono font-bold text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Issue Date</label>
                  <input
                    type="date"
                    value={consignment.issueDate}
                    onChange={(e) => updateRoot('issueDate', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-mono text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Box 3: Delivery Place */}
            <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                  3
                </span>
                <h4 className="text-xs font-bold text-neutral-900 uppercase">Lieu de livraison / Place of Delivery</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Delivery Place / City / Warehouse</label>
                  <input
                    type="text"
                    value={consignment.deliveryPlace}
                    onChange={(e) => updateRoot('deliveryPlace', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Delivery Country</label>
                  <input
                    type="text"
                    value={consignment.deliveryCountry}
                    onChange={(e) => updateRoot('deliveryCountry', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Box 4: Taking over */}
            <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                  4
                </span>
                <h4 className="text-xs font-bold text-neutral-900 uppercase">Prise en charge / Taking Over Goods</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Collection Place / Depot</label>
                  <input
                    type="text"
                    value={consignment.takingOverPlace}
                    onChange={(e) => updateRoot('takingOverPlace', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Country</label>
                  <input
                    type="text"
                    value={consignment.takingOverCountry}
                    onChange={(e) => updateRoot('takingOverCountry', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Date of Loading</label>
                  <input
                    type="date"
                    value={consignment.takingOverDate}
                    onChange={(e) => updateRoot('takingOverDate', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-mono text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Box 21: Established place & date */}
            <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                  21
                </span>
                <h4 className="text-xs font-bold text-neutral-900 uppercase">Établi à / le / Established In / On</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Established Place</label>
                  <input
                    type="text"
                    value={consignment.establishedPlace}
                    onChange={(e) => updateRoot('establishedPlace', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Established Date</label>
                  <input
                    type="date"
                    value={consignment.establishedDate}
                    onChange={(e) => updateRoot('establishedDate', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-mono text-neutral-900 bg-white focus:border-violet-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CARGO & ADR */}
        {activeTab === 'cargo' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 uppercase">Boxes 6 to 12: Goods Specification</h4>
                <p className="text-[11px] text-neutral-500">Add lines for packages, commodity codes, gross weight, and ADR dangerous goods details.</p>
              </div>
              <button
                onClick={addCargoRow}
                className="flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Cargo Line
              </button>
            </div>

            {/* Dynamic Items Table */}
            <div className="space-y-3">
              {consignment.items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-3.5 space-y-3 transition-colors hover:border-neutral-300"
                >
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                    <span className="font-mono text-xs font-semibold text-neutral-700">Item #{index + 1}</span>
                    {consignment.items.length > 1 && (
                      <button
                        onClick={() => removeCargoRow(index)}
                        className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-medium text-neutral-500 mb-0.5">Box 6: Marks & Numbers</label>
                      <input
                        type="text"
                        value={item.marksAndNumbers}
                        onChange={(e) => handleCargoChange(index, 'marksAndNumbers', e.target.value)}
                        placeholder="e.g. FR/EXP-01 TO 12"
                        className="w-full rounded-md border border-neutral-300 px-2.5 py-1 text-xs text-neutral-900 bg-white focus:border-red-500 focus:outline-hidden font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-medium text-neutral-500 mb-0.5">Box 7: Pkgs Count</label>
                      <input
                        type="number"
                        min="1"
                        value={item.packagesCount}
                        onChange={(e) => handleCargoChange(index, 'packagesCount', parseInt(e.target.value) || 1)}
                        className="w-full rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-mono text-neutral-900 bg-white focus:border-red-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-medium text-neutral-500 mb-0.5">Box 8: Packing Method</label>
                      <select
                        value={item.packingMethod}
                        onChange={(e) => handleCargoChange(index, 'packingMethod', e.target.value)}
                        className="w-full rounded-md border border-neutral-300 px-2.5 py-1 text-xs text-neutral-900 bg-white focus:border-red-500 focus:outline-hidden"
                      >
                        <option value="Euro-pallets">Euro-pallets (EPAL)</option>
                        <option value="Industrial Pallets">Industrial Pallets (120x100)</option>
                        <option value="Wooden Crates">Wooden Crates</option>
                        <option value="Carton Boxes">Carton Boxes</option>
                        <option value="IBC Containers">IBC Containers (31HA1)</option>
                        <option value="Steel Drums">Steel Drums</option>
                        <option value="Big Bags">Big Bags (FIBC)</option>
                        <option value="Rolls / Coils">Rolls / Coils</option>
                        <option value="Loose / Bulk">Loose / Bulk Cargo</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-medium text-neutral-500 mb-0.5">Box 11: Gross Wt (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={item.grossWeightKg}
                        onChange={(e) => handleCargoChange(index, 'grossWeightKg', parseFloat(e.target.value) || 0)}
                        className="w-full rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-mono text-neutral-900 bg-white focus:border-red-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-medium text-neutral-500 mb-0.5">Box 12: Volume (m³)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.volumeM3}
                        onChange={(e) => handleCargoChange(index, 'volumeM3', parseFloat(e.target.value) || 0)}
                        className="w-full rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-mono text-neutral-900 bg-white focus:border-red-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-8">
                      <label className="block text-[10px] font-medium text-neutral-500 mb-0.5">Box 9: Nature of Goods / Trade Description</label>
                      <input
                        type="text"
                        value={item.natureOfGoods}
                        onChange={(e) => handleCargoChange(index, 'natureOfGoods', e.target.value)}
                        placeholder="e.g. Automotive Precision Transmission Components"
                        className="w-full rounded-md border border-neutral-300 px-2.5 py-1 text-xs text-neutral-900 bg-white focus:border-red-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-medium text-neutral-500 mb-0.5">Box 10: Statistical / HS Code</label>
                      <input
                        type="text"
                        value={item.statisticalNumber}
                        onChange={(e) => handleCargoChange(index, 'statisticalNumber', e.target.value)}
                        placeholder="e.g. 8708.40.50"
                        className="w-full rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-mono text-neutral-900 bg-white focus:border-red-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-12">
                      <label className="block text-[10px] font-medium text-red-600 mb-0.5">
                        ADR Dangerous Goods (UN Number / Class / Packing Group - leave blank if not hazardous)
                      </label>
                      <input
                        type="text"
                        value={item.adrDetails || ''}
                        onChange={(e) => handleCargoChange(index, 'adrDetails', e.target.value)}
                        placeholder="e.g. UN 1993 FLAMMABLE LIQUID, N.O.S., 3, PG II, (D/E)"
                        className="w-full rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-mono text-neutral-900 bg-white focus:border-red-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Totals Card */}
            <div className="rounded-lg border border-neutral-300 bg-neutral-100 p-3.5 flex items-center justify-between text-xs font-mono font-semibold">
              <span className="text-neutral-700">Calculated Totals:</span>
              <div className="flex items-center gap-6">
                <span>{totalPkgs} packages</span>
                <span>{totalWeight.toLocaleString(undefined, { minimumFractionDigits: 1 })} kg gross</span>
                <span>{totalVol.toFixed(2)} m³</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INSTRUCTIONS & CHARGES */}
        {activeTab === 'charges' && (
          <div className="space-y-6">
            {/* Box 5: Documents attached */}
            <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                  5
                </span>
                <h4 className="text-xs font-bold text-neutral-900 uppercase">Documents annexés / Documents Attached</h4>
              </div>
              <div>
                <input
                  type="text"
                  value={consignment.documentsAttached}
                  onChange={(e) => updateRoot('documentsAttached', e.target.value)}
                  placeholder="e.g. Commercial Invoice #INV-2026-4412, Packing List, EUR.1 Certificate, T1"
                  className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-red-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Box 13: Sender instructions */}
            <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                  13
                </span>
                <h4 className="text-xs font-bold text-neutral-900 uppercase">Instructions de l'expéditeur / Sender's Instructions</h4>
              </div>
              <div>
                <textarea
                  rows={3}
                  value={consignment.senderInstructions}
                  onChange={(e) => updateRoot('senderInstructions', e.target.value)}
                  placeholder="e.g. Keep dry. Customs clearance at Strasbourg Border. Temperature set: +4°C."
                  className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-red-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Box 14 & 15 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                    14
                  </span>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase">Remboursement / Cash on Delivery</h4>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">COD Amount (Leave blank if none)</label>
                  <input
                    type="text"
                    value={consignment.codAmount}
                    onChange={(e) => updateRoot('codAmount', e.target.value)}
                    placeholder="e.g. 5400.00"
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-mono text-neutral-900 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                    15
                  </span>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase">Paiement du transport / Terms</h4>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Carriage Terms</label>
                  <select
                    value={consignment.paymentInstructions}
                    onChange={(e) => updateRoot('paymentInstructions', e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-red-500 focus:outline-hidden"
                  >
                    <option value="Carriage Paid (Franco domicile)">Carriage Paid (Franco domicile)</option>
                    <option value="Carriage Forward (Non franco)">Carriage Forward (Non franco / To pay)</option>
                    <option value="Carriage Paid to Frontier">Carriage Paid to Frontier</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Box 18: Carrier Reservations */}
            <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                  18
                </span>
                <h4 className="text-xs font-bold text-neutral-900 uppercase">Réserves et observations du transporteur</h4>
              </div>
              <div>
                <input
                  type="text"
                  value={consignment.carrierReservations}
                  onChange={(e) => updateRoot('carrierReservations', e.target.value)}
                  placeholder="e.g. Goods checked in rainproof sealed condition. Pallets shrink-wrapped."
                  className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-red-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Box 20: Charges */}
            <div className="rounded-lg border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                    20
                  </span>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase">À payer par / To be paid by (Carriage charges)</h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-neutral-500">Currency:</span>
                  <input
                    type="text"
                    value={consignment.charges.currency}
                    onChange={(e) =>
                      onChange({
                        ...consignment,
                        charges: { ...consignment.charges, currency: e.target.value.toUpperCase() }
                      })
                    }
                    className="w-16 rounded border border-neutral-300 px-2 py-0.5 text-xs font-mono font-bold uppercase text-neutral-900 text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Carriage Rate / Freight Charge</label>
                  <input
                    type="number"
                    step="0.01"
                    value={consignment.charges.carriagePaid}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      onChange({
                        ...consignment,
                        charges: {
                          ...consignment.charges,
                          carriagePaid: val,
                          balanceSender: val
                        }
                      });
                    }}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-mono text-neutral-900 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Net Balance Payable</label>
                  <input
                    type="number"
                    step="0.01"
                    value={consignment.charges.balanceSender}
                    onChange={(e) =>
                      onChange({
                        ...consignment,
                        charges: { ...consignment.charges, balanceSender: parseFloat(e.target.value) || 0 }
                      })
                    }
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-mono font-bold text-neutral-900 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SIGNATURES */}
        {activeTab === 'signatures' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 uppercase">Boxes 22, 23 & 24: Digital Signatures</h4>
                <p className="text-[11px] text-neutral-500">
                  Draw or verify official digital signatures for dispatch, driver collection, and customer delivery receipt.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Box 22: Sender */}
              <div className="rounded-lg border border-neutral-200 p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                      22
                    </span>
                    <h5 className="text-xs font-bold text-neutral-900 uppercase">Sender Signature</h5>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">Authorized shipping manager at dispatch</p>
                </div>

                <div className="h-28 rounded-md border border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center p-2">
                  {consignment.signatures.senderSignatureDataUrl ? (
                    <img
                      src={consignment.signatures.senderSignatureDataUrl}
                      alt="Sender signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-neutral-400">No signature recorded</span>
                  )}
                </div>

                <div>
                  <div className="text-xs font-medium text-neutral-800 truncate mb-2">
                    {consignment.signatures.senderSignerName || 'Name not specified'}
                  </div>
                  <button
                    onClick={() => onOpenSignatureModal('sender')}
                    className="w-full rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
                  >
                    {consignment.signatures.senderSignatureDataUrl ? 'Change Signature' : 'Sign Box 22'}
                  </button>
                </div>
              </div>

              {/* Box 23: Carrier */}
              <div className="rounded-lg border border-neutral-200 p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                      23
                    </span>
                    <h5 className="text-xs font-bold text-neutral-900 uppercase">Carrier Signature</h5>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">Driver taking over goods at origin</p>
                </div>

                <div className="h-28 rounded-md border border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center p-2">
                  {consignment.signatures.carrierSignatureDataUrl ? (
                    <img
                      src={consignment.signatures.carrierSignatureDataUrl}
                      alt="Carrier signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-neutral-400">No driver signature</span>
                  )}
                </div>

                <div>
                  <div className="text-xs font-medium text-neutral-800 truncate mb-2">
                    {consignment.signatures.carrierDriverName || 'Driver not specified'}
                  </div>
                  <button
                    onClick={() => onOpenSignatureModal('carrier')}
                    className="w-full rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
                  >
                    {consignment.signatures.carrierSignatureDataUrl ? 'Change Signature' : 'Sign Box 23'}
                  </button>
                </div>
              </div>

              {/* Box 24: Consignee */}
              <div className="rounded-lg border border-neutral-200 p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                      24
                    </span>
                    <h5 className="text-xs font-bold text-neutral-900 uppercase">Consignee Receipt</h5>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">Warehouse receipt & date upon arrival</p>
                </div>

                <div className="h-28 rounded-md border border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center p-2">
                  {consignment.signatures.consigneeSignatureDataUrl ? (
                    <img
                      src={consignment.signatures.consigneeSignatureDataUrl}
                      alt="Consignee signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-neutral-400">Awaiting arrival signature</span>
                  )}
                </div>

                <div>
                  <div className="text-xs font-medium text-neutral-800 truncate mb-2">
                    {consignment.signatures.consigneeReceiverName || 'Receiver not specified'}
                  </div>
                  <button
                    onClick={() => onOpenSignatureModal('consignee')}
                    className="w-full rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
                  >
                    {consignment.signatures.consigneeSignatureDataUrl ? 'Change Signature' : 'Sign Box 24'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
