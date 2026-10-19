import React from 'react';
import { CMRConsignment, CMRCopyType, CMR_COPIES } from '../types/cmr';
import { ZoomIn, ZoomOut, Maximize2, ShieldCheck, PenTool } from 'lucide-react';

interface CMRDocumentViewProps {
  consignment: CMRConsignment;
  selectedCopy: CMRCopyType;
  onSelectCopy: (copy: CMRCopyType) => void;
  onEditBox?: (boxNumber: number) => void;
  onOpenSignatureModal: (type: 'sender' | 'carrier' | 'consignee') => void;
  zoomLevel: number;
  onZoomChange: (level: number) => void;
}

export const CMRDocumentView: React.FC<CMRDocumentViewProps> = ({
  consignment,
  selectedCopy,
  onSelectCopy,
  onEditBox,
  onOpenSignatureModal,
  zoomLevel,
  onZoomChange
}) => {
  const currentCopy = selectedCopy === 'all' ? '1_sender' : selectedCopy;
  const meta = CMR_COPIES[currentCopy] || CMR_COPIES['1_sender'];

  const totalPackages = consignment.items.reduce((s, it) => s + (Number(it.packagesCount) || 0), 0);
  const totalGrossWeight = consignment.items.reduce((s, it) => s + (Number(it.grossWeightKg) || 0), 0);
  const totalVolume = consignment.items.reduce((s, it) => s + (Number(it.volumeM3) || 0), 0);

  return (
    <div className="flex flex-col h-full bg-neutral-200/70 rounded-xl border border-neutral-300 overflow-hidden shadow-inner">
      {/* Document Toolbar */}
      <div className="flex items-center justify-between border-b border-neutral-300 bg-neutral-100 px-4 py-2.5">
        {/* Copy Selector Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['1_sender', '2_consignee', '3_carrier', '4_admin', 'all'] as CMRCopyType[]).map((key) => {
            const isAll = key === 'all';
            const m = isAll ? null : CMR_COPIES[key];
            const isActive = selectedCopy === key;

            return (
              <button
                key={key}
                onClick={() => onSelectCopy(key)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
                }`}
              >
                {!isAll && (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: m?.accentHex }}
                  />
                )}
                <span>{isAll ? 'All 4 Copies' : `Copy ${m?.number}`}</span>
              </button>
            );
          })}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-0.5">
          <button
            onClick={() => onZoomChange(Math.max(0.65, zoomLevel - 0.1))}
            title="Zoom Out"
            className="p-1 rounded text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-xs text-neutral-700 px-1.5 min-w-[3rem] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(1.3, zoomLevel + 0.1))}
            title="Zoom In"
            className="p-1 rounded text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onZoomChange(1.0)}
            title="Reset to 100%"
            className="p-1 rounded text-neutral-600 hover:bg-neutral-100 transition-colors text-xs font-medium"
          >
            1:1
          </button>
        </div>
      </div>

      {/* Sheet Preview Scroll Container */}
      <div className="flex-1 overflow-auto p-4 md:p-6 flex justify-center items-start">
        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.15s ease-out' }}
          className="transition-all"
        >
          {/* Printable Sheet */}
          <div
            className="cmr-sheet-container w-[794px] h-[1123px] max-h-[1123px] bg-white border-[2.5px] text-neutral-900 shadow-xl transition-colors font-sans flex flex-col justify-between overflow-hidden"
            style={{ borderColor: meta.accentHex }}
          >
            {/* Top Color Banner */}
            <div
              className="px-3 py-1.5 flex items-center justify-between text-white font-bold text-[10px] tracking-wide shrink-0"
              style={{ backgroundColor: meta.accentHex }}
            >
              <span>{meta.number} - {meta.titleFr.toUpperCase()} / {meta.titleEn.toUpperCase()}</span>
              <span className="opacity-90">{meta.recipient}</span>
            </div>

            {/* Header Box: Conventions & CMR Logo */}
            <div className="grid grid-cols-12 border-b border-neutral-400 shrink-0">
              <div className="col-span-8 p-2.5 border-r border-neutral-400">
                <h1 className="text-xs font-bold uppercase tracking-tight text-neutral-900">
                  INTERNATIONAL CONSIGNMENT NOTE / LETTRE DE VOITURE INTERNATIONALE
                </h1>
                <p className="text-[9px] text-neutral-600 leading-tight mt-1">
                  Ce transport est soumis, nonobstant toute clause contraire, à la Convention relative au contrat de transport international de marchandises par route (CMR). Genève, 19 mai 1956.
                </p>
                <p className="text-[8px] text-neutral-500 leading-tight">
                  This carriage is subject, notwithstanding any clause to the contrary, to the Convention on the Contract for the International Carriage of Goods by Road (CMR).
                </p>
              </div>

              <div className="col-span-4 p-2.5 flex items-center justify-between bg-neutral-50/50">
                <div>
                  <span className="text-2xl font-black tracking-tight" style={{ color: meta.accentHex }}>
                    CMR
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-semibold text-neutral-500 uppercase">Consignment No.</div>
                  <div className="font-mono text-sm font-bold" style={{ color: meta.accentHex }}>
                    {consignment.consignmentNumber}
                  </div>
                  <div className="text-[9px] text-neutral-500 font-mono">Date: {consignment.issueDate}</div>
                </div>
              </div>
            </div>

            {/* Row 1: Box 1 (Sender) & Box 16 (Carrier) */}
            <div className="grid grid-cols-2 border-b border-neutral-400">
              {/* Box 1: Sender */}
              <div
                onClick={() => onEditBox?.(1)}
                className="p-2 border-r border-neutral-400 hover:bg-neutral-50/80 cursor-pointer transition-colors relative min-h-[96px] flex flex-col justify-start"
              >
                <div className="flex items-baseline justify-between border-b border-neutral-200/80 pb-1 mb-1.5">
                  <div className="text-[9px] font-bold text-neutral-800 uppercase tracking-tight">
                    1 Expéditeur <span className="text-neutral-500 font-medium">/ Sender</span>
                  </div>
                  <div className="text-[8px] text-neutral-400 font-normal">
                    (nom, adresse, pays)
                  </div>
                </div>
                <div className="text-xs font-bold text-neutral-900 tracking-tight">{consignment.sender.name || '—'}</div>
                <div className="text-[11px] text-neutral-700 leading-snug">{consignment.sender.address}</div>
                <div className="text-[11px] text-neutral-700 font-medium">
                  {consignment.sender.cityPostal} {consignment.sender.country.toUpperCase()}
                </div>
                {consignment.sender.contactPhone && (
                  <div className="text-[10px] text-neutral-500 mt-0.5">Tel: {consignment.sender.contactPhone}</div>
                )}
                {consignment.sender.vatId && (
                  <div className="text-[10px] text-neutral-500">VAT: {consignment.sender.vatId}</div>
                )}
              </div>

              {/* Box 16: Carrier */}
              <div
                onClick={() => onEditBox?.(16)}
                className="p-2 hover:bg-neutral-50/80 cursor-pointer transition-colors relative min-h-[96px] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-baseline justify-between border-b border-neutral-200/80 pb-1 mb-1.5">
                    <div className="text-[9px] font-bold text-neutral-800 uppercase tracking-tight">
                      16 Transporteur <span className="text-neutral-500 font-medium">/ Carrier</span>
                    </div>
                    <div className="text-[8px] text-neutral-400 font-normal">
                      (nom, adresse, pays)
                    </div>
                  </div>
                  <div className="text-xs font-bold text-neutral-900 tracking-tight">{consignment.carrier.name || '—'}</div>
                  <div className="text-[11px] text-neutral-700 leading-snug">{consignment.carrier.address}</div>
                  <div className="text-[11px] text-neutral-700 font-medium">
                    {consignment.carrier.cityPostal} {consignment.carrier.country.toUpperCase()}
                  </div>
                </div>
                <div className="mt-1.5 pt-1 border-t border-neutral-100 flex items-center gap-3 text-[10px] font-mono font-semibold" style={{ color: meta.accentHex }}>
                  <span>Tractor: {consignment.carrierTruckPlate || '—'}</span>
                  <span>Trailer: {consignment.carrierTrailerPlate || '—'}</span>
                </div>
              </div>
            </div>

            {/* Row 2: Box 2 (Consignee) & Box 17 (Successive) + Box 18 (Reservations) */}
            <div className="grid grid-cols-2 border-b border-neutral-400">
              {/* Box 2: Consignee */}
              <div
                onClick={() => onEditBox?.(2)}
                className="p-2 border-r border-neutral-400 hover:bg-neutral-50/80 cursor-pointer transition-colors relative min-h-[96px] flex flex-col justify-start"
              >
                <div className="flex items-baseline justify-between border-b border-neutral-200/80 pb-1 mb-1.5">
                  <div className="text-[9px] font-bold text-neutral-800 uppercase tracking-tight">
                    2 Destinataire <span className="text-neutral-500 font-medium">/ Consignee</span>
                  </div>
                  <div className="text-[8px] text-neutral-400 font-normal">
                    (nom, adresse, pays)
                  </div>
                </div>
                <div className="text-xs font-bold text-neutral-900 tracking-tight">{consignment.consignee.name || '—'}</div>
                <div className="text-[11px] text-neutral-700 leading-snug">{consignment.consignee.address}</div>
                <div className="text-[11px] text-neutral-700 font-medium">
                  {consignment.consignee.cityPostal} {consignment.consignee.country.toUpperCase()}
                </div>
                {consignment.consignee.contactPhone && (
                  <div className="text-[10px] text-neutral-500 mt-0.5">Tel: {consignment.consignee.contactPhone}</div>
                )}
                {consignment.consignee.vatId && (
                  <div className="text-[10px] text-neutral-500">VAT: {consignment.consignee.vatId}</div>
                )}
              </div>

              {/* Right: Box 17 (Successive) & Box 18 (Reservations) */}
              <div className="flex flex-col">
                <div
                  onClick={() => onEditBox?.(17)}
                  className="p-2 border-b border-neutral-400 hover:bg-neutral-50/80 cursor-pointer transition-colors flex-1"
                >
                  <div className="flex items-baseline justify-between border-b border-neutral-200/80 pb-0.5 mb-1">
                    <div className="text-[9px] font-bold text-neutral-800 uppercase tracking-tight">
                      17 Transporteurs successifs <span className="text-neutral-500 font-medium">/ Successive carriers</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-700">
                    {consignment.successiveCarrier.name ? (
                      <span>{consignment.successiveCarrier.name}, {consignment.successiveCarrier.cityPostal} {consignment.successiveCarrier.country}</span>
                    ) : (
                      <span className="text-neutral-400 italic">None / Néant</span>
                    )}
                  </div>
                </div>

                <div
                  onClick={() => onEditBox?.(18)}
                  className="p-2 hover:bg-neutral-50/80 cursor-pointer transition-colors flex-1"
                >
                  <div className="flex items-baseline justify-between border-b border-neutral-200/80 pb-0.5 mb-1">
                    <div className="text-[9px] font-bold text-neutral-800 uppercase tracking-tight">
                      18 Réserves et observations <span className="text-neutral-500 font-medium">/ Carrier reservations</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-700 leading-snug">
                    {consignment.carrierReservations || <span className="text-neutral-400 italic">No reservations / Apparent good condition</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Box 3 (Delivery place) & Box 4 (Taking over) */}
            <div className="grid grid-cols-2 border-b border-neutral-400">
              <div
                onClick={() => onEditBox?.(3)}
                className="p-2 border-r border-neutral-400 hover:bg-neutral-50/80 cursor-pointer transition-colors"
              >
                <div className="flex items-baseline justify-between border-b border-neutral-200/80 pb-0.5 mb-1">
                  <div className="text-[9px] font-bold text-neutral-800 uppercase tracking-tight">
                    3 Lieu prévu pour la livraison <span className="text-neutral-500 font-medium">/ Place of delivery</span>
                  </div>
                </div>
                <div className="text-[11px] font-medium text-neutral-900">
                  {consignment.deliveryPlace || '—'}, {consignment.deliveryCountry || '—'}
                </div>
              </div>

              <div
                onClick={() => onEditBox?.(4)}
                className="p-2 hover:bg-neutral-50/80 cursor-pointer transition-colors"
              >
                <div className="flex items-baseline justify-between border-b border-neutral-200/80 pb-0.5 mb-1">
                  <div className="text-[9px] font-bold text-neutral-800 uppercase tracking-tight">
                    4 Lieu et date de prise en charge <span className="text-neutral-500 font-medium">/ Place & date of taking over</span>
                  </div>
                </div>
                <div className="text-[11px] font-medium text-neutral-900">
                  {consignment.takingOverPlace || '—'} ({consignment.takingOverCountry || '—'}) — <span className="font-mono">{consignment.takingOverDate}</span>
                </div>
              </div>
            </div>

            {/* Row 4: Box 5 (Documents attached) */}
            <div
              onClick={() => onEditBox?.(5)}
              className="p-2 border-b border-neutral-400 hover:bg-neutral-50/80 cursor-pointer transition-colors"
            >
              <div className="flex items-baseline justify-between border-b border-neutral-200/80 pb-0.5 mb-1">
                <div className="text-[9px] font-bold text-neutral-800 uppercase tracking-tight">
                  5 Documents annexés <span className="text-neutral-500 font-medium">/ Documents attached</span>
                </div>
                <span className="text-[8px] text-neutral-400">(Invoice, packing list, EUR.1, etc.)</span>
              </div>
              <div className="text-[11px] text-neutral-800">
                {consignment.documentsAttached || <span className="text-neutral-400 italic">None</span>}
              </div>
            </div>

            {/* GOODS TABLE (Boxes 6 to 12) */}
            <div className="border-b border-neutral-400">
              {/* Table Header */}
              <div className="grid grid-cols-12 bg-neutral-100 border-b border-neutral-300 text-[8.5px] font-bold text-neutral-700 divide-x divide-neutral-300">
                <div className="col-span-2 p-1.5">
                  <div>6 Marques & No</div>
                  <div className="text-[7.5px] font-normal text-neutral-500">Marks & Nos</div>
                </div>
                <div className="col-span-1 p-1.5 text-center">
                  <div>7 Nb colis</div>
                  <div className="text-[7.5px] font-normal text-neutral-500">No pkgs</div>
                </div>
                <div className="col-span-2 p-1.5">
                  <div>8 Mode embal.</div>
                  <div className="text-[7.5px] font-normal text-neutral-500">Packing</div>
                </div>
                <div className="col-span-4 p-1.5">
                  <div>9 Nature de la marchandise / ADR</div>
                  <div className="text-[7.5px] font-normal text-neutral-500">Nature of goods & ADR class</div>
                </div>
                <div className="col-span-1 p-1.5 text-center">
                  <div>10 No stat.</div>
                  <div className="text-[7.5px] font-normal text-neutral-500">HS code</div>
                </div>
                <div className="col-span-1 p-1.5 text-right">
                  <div>11 Poids brut</div>
                  <div className="text-[7.5px] font-normal text-neutral-500">Gross wt kg</div>
                </div>
                <div className="col-span-1 p-1.5 text-right">
                  <div>12 Volume</div>
                  <div className="text-[7.5px] font-normal text-neutral-500">Vol m³</div>
                </div>
              </div>

              {/* Table Rows */}
              <div className="min-h-[210px] divide-y divide-neutral-200">
                {consignment.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    onClick={() => onEditBox?.(6)}
                    className="grid grid-cols-12 text-[10px] divide-x divide-neutral-200 hover:bg-neutral-50/80 cursor-pointer transition-colors"
                  >
                    <div className="col-span-2 p-1.5 font-mono text-[9.5px] text-neutral-700 truncate">
                      {item.marksAndNumbers || '—'}
                    </div>
                    <div className="col-span-1 p-1.5 text-center font-mono font-medium">
                      {item.packagesCount}
                    </div>
                    <div className="col-span-2 p-1.5 text-neutral-700 truncate">
                      {item.packingMethod}
                    </div>
                    <div className="col-span-4 p-1.5">
                      <div className="font-medium text-neutral-900 leading-tight">
                        {item.natureOfGoods || '—'}
                      </div>
                      {item.adrDetails && (
                        <div className="mt-0.5 text-[8.5px] font-mono text-red-600 font-semibold">
                          ADR: {item.adrDetails}
                        </div>
                      )}
                    </div>
                    <div className="col-span-1 p-1.5 text-center font-mono text-[9px] text-neutral-600">
                      {item.statisticalNumber || '—'}
                    </div>
                    <div className="col-span-1 p-1.5 text-right font-mono font-medium">
                      {Number(item.grossWeightKg).toLocaleString(undefined, { minimumFractionDigits: 1 })}
                    </div>
                    <div className="col-span-1 p-1.5 text-right font-mono text-neutral-600">
                      {item.volumeM3 ? item.volumeM3.toFixed(2) : '—'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Bar */}
              <div className="grid grid-cols-12 bg-neutral-100/90 border-t border-neutral-300 p-1.5 text-[10px] font-bold text-neutral-900">
                <div className="col-span-2 uppercase tracking-wide">
                  TOTAL / TOTALS:
                </div>
                <div className="col-span-1 text-center font-mono" style={{ color: meta.accentHex }}>
                  {totalPackages}
                </div>
                <div className="col-span-2 text-neutral-500 font-normal">
                  packages
                </div>
                <div className="col-span-4 text-neutral-500 font-normal">
                  Gross goods weight & cubage:
                </div>
                <div className="col-span-1 text-center font-mono text-neutral-500">
                  —
                </div>
                <div className="col-span-1 text-right font-mono" style={{ color: meta.accentHex }}>
                  {totalGrossWeight.toLocaleString(undefined, { minimumFractionDigits: 1 })} kg
                </div>
                <div className="col-span-1 text-right font-mono" style={{ color: meta.accentHex }}>
                  {totalVolume.toFixed(2)} m³
                </div>
              </div>
            </div>

            {/* LOWER SECTION (Boxes 13, 14, 15, 19, 20) */}
            <div className="grid grid-cols-12 border-b border-neutral-400">
              {/* Left Column (Boxes 13, 14, 15) */}
              <div className="col-span-7 border-r border-neutral-400 flex flex-col">
                {/* Box 13: Sender instructions */}
                <div
                  onClick={() => onEditBox?.(13)}
                  className="p-2 border-b border-neutral-400 hover:bg-neutral-50/80 cursor-pointer transition-colors flex-1"
                >
                  <div className="flex items-baseline justify-between border-b border-neutral-200/80 pb-0.5 mb-1">
                    <div className="text-[9px] font-bold text-neutral-800 uppercase tracking-tight">
                      13 Instructions de l'expéditeur <span className="text-neutral-500 font-medium">/ Sender's instructions</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-700 whitespace-pre-wrap leading-tight">
                    {consignment.senderInstructions || <span className="text-neutral-400 italic">None / Standard rules</span>}
                  </div>
                </div>

                {/* Box 14 & 15 Row */}
                <div className="grid grid-cols-2 divide-x divide-neutral-400">
                  <div
                    onClick={() => onEditBox?.(14)}
                    className="p-2 hover:bg-neutral-50/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-baseline justify-between border-b border-neutral-200/80 pb-0.5 mb-1">
                      <div className="text-[9px] font-bold text-neutral-800 uppercase tracking-tight">
                        14 Remboursement <span className="text-neutral-500 font-medium">/ COD</span>
                      </div>
                    </div>
                    <div className="text-xs font-mono font-bold text-neutral-900 mt-0.5">
                      {consignment.codAmount ? `${consignment.codAmount} ${consignment.charges.currency}` : 'NIL / NÉANT'}
                    </div>
                  </div>

                  <div
                    onClick={() => onEditBox?.(15)}
                    className="p-2 hover:bg-neutral-50/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-baseline justify-between border-b border-neutral-200/80 pb-0.5 mb-1">
                      <div className="text-[9px] font-bold text-neutral-800 uppercase tracking-tight">
                        15 Paiement transport <span className="text-neutral-500 font-medium">/ Carriage</span>
                      </div>
                    </div>
                    <div className="text-[11px] font-medium text-neutral-900 mt-0.5">
                      {consignment.paymentInstructions || 'Carriage Paid'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Boxes 19 & 20) */}
              <div className="col-span-5 flex flex-col">
                {/* Box 19: Special agreements */}
                <div
                  onClick={() => onEditBox?.(19)}
                  className="p-2 border-b border-neutral-400 hover:bg-neutral-50/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-baseline justify-between border-b border-neutral-200/80 pb-0.5 mb-1">
                    <div className="text-[9px] font-bold text-neutral-800 uppercase tracking-tight">
                      19 Conventions particulières <span className="text-neutral-500 font-medium">/ Special agreements</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-700 leading-snug">
                    {consignment.specialAgreements || 'CMR Convention 1956 applies.'}
                  </div>
                </div>

                {/* Box 20: To be paid by */}
                <div
                  onClick={() => onEditBox?.(20)}
                  className="p-2 hover:bg-neutral-50/80 cursor-pointer transition-colors flex-1"
                >
                  <div className="flex items-baseline justify-between border-b border-neutral-200/80 pb-0.5 mb-1">
                    <div className="text-[9px] font-bold text-neutral-800 uppercase tracking-tight">
                      20 À payer par <span className="text-neutral-500 font-medium">/ To be paid by</span>
                    </div>
                    <span className="font-mono text-[8.5px] text-neutral-500">Currency: {consignment.charges.currency}</span>
                  </div>

                  <div className="mt-1 space-y-0.5 text-[9.5px]">
                    <div className="flex justify-between text-neutral-600">
                      <span>Prix transport (Carriage):</span>
                      <span className="font-mono">{consignment.charges.carriagePaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t border-neutral-200" style={{ color: meta.accentHex }}>
                      <span>Solde / Balance:</span>
                      <span className="font-mono">{consignment.charges.balanceSender.toFixed(2)} {consignment.charges.currency}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 21: Established in/on */}
            <div
              onClick={() => onEditBox?.(21)}
              className="p-2 border-b border-neutral-400 bg-neutral-50/60 hover:bg-neutral-50 cursor-pointer transition-colors flex items-center justify-between shrink-0"
            >
              <div className="text-[9px] font-bold text-neutral-800">
                21 Établi à / le <span className="font-normal text-neutral-500">/ Established in / on</span>
              </div>
              <div className="text-[11px] font-medium text-neutral-900 font-mono">
                Place: <span className="font-bold">{consignment.establishedPlace || '—'}</span> &nbsp;|&nbsp; Date: <span className="font-bold">{consignment.establishedDate}</span>
              </div>
            </div>

            {/* SIGNATURES ROW (Boxes 22, 23, 24) - Compact & Evenly Aligned to Bottom */}
            <div className="grid grid-cols-3 divide-x divide-neutral-400 h-[105px] shrink-0 border-b border-neutral-400 bg-white">
              {/* Box 22: Sender Signature */}
              <div
                onClick={() => onOpenSignatureModal('sender')}
                className="p-2 hover:bg-neutral-50/80 cursor-pointer transition-colors flex flex-col justify-between h-full group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-neutral-900">22 Signature expéditeur</span>
                    <PenTool className="h-3 w-3 text-neutral-400 group-hover:text-violet-600 transition-colors" />
                  </div>
                  <div className="text-[7.5px] text-neutral-500">Signature and stamp of sender</div>
                  <div className="text-[8px] text-neutral-400 font-mono truncate">
                    Date: {consignment.signatures.senderSignedAt || consignment.takingOverDate || '____ / ____ / 2026'}
                  </div>
                </div>

                <div className="my-0.5 flex-1 min-h-[42px] max-h-[48px] rounded border border-dashed border-neutral-300 bg-neutral-50/70 flex items-center justify-center p-1 transition-colors group-hover:border-violet-300">
                  {consignment.signatures.senderSignatureDataUrl ? (
                    <img
                      src={consignment.signatures.senderSignatureDataUrl}
                      alt="Sender Signature"
                      className="max-h-9 max-w-[130px] object-contain"
                    />
                  ) : (
                    <div className="text-[8px] text-neutral-400 text-center font-medium">
                      Click to Sign (Box 22)
                    </div>
                  )}
                </div>

                <div className="pt-0.5">
                  <div className="border-b border-neutral-400 w-full mb-0.5" />
                  <div className="text-[8.5px] font-semibold text-neutral-800 truncate">
                    Signer: {consignment.signatures.senderSignerName || '(Authorized Signature)'}
                  </div>
                </div>
              </div>

              {/* Box 23: Carrier Signature */}
              <div
                onClick={() => onOpenSignatureModal('carrier')}
                className="p-2 hover:bg-neutral-50/80 cursor-pointer transition-colors flex flex-col justify-between h-full group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-neutral-900">23 Signature transporteur</span>
                    <PenTool className="h-3 w-3 text-neutral-400 group-hover:text-violet-600 transition-colors" />
                  </div>
                  <div className="text-[7.5px] text-neutral-500">Signature and stamp of carrier</div>
                  <div className="text-[8px] text-neutral-400 font-mono truncate">
                    Prise en charge: {consignment.signatures.carrierSignedAt || consignment.takingOverDate || '____ / ____ / 2026'}
                  </div>
                </div>

                <div className="my-0.5 flex-1 min-h-[42px] max-h-[48px] rounded border border-dashed border-neutral-300 bg-neutral-50/70 flex items-center justify-center p-1 transition-colors group-hover:border-violet-300">
                  {consignment.signatures.carrierSignatureDataUrl ? (
                    <img
                      src={consignment.signatures.carrierSignatureDataUrl}
                      alt="Carrier Signature"
                      className="max-h-9 max-w-[130px] object-contain"
                    />
                  ) : (
                    <div className="text-[8px] text-neutral-400 text-center font-medium">
                      Driver Sign (Box 23)
                    </div>
                  )}
                </div>

                <div className="pt-0.5">
                  <div className="border-b border-neutral-400 w-full mb-0.5" />
                  <div className="text-[8.5px] font-semibold text-neutral-800 truncate">
                    Driver: {consignment.signatures.carrierDriverName || '(Driver Signature)'}
                  </div>
                </div>
              </div>

              {/* Box 24: Consignee Signature */}
              <div
                onClick={() => onOpenSignatureModal('consignee')}
                className="p-2 hover:bg-neutral-50/80 cursor-pointer transition-colors flex flex-col justify-between h-full group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-neutral-900">24 Marchandises reçues</span>
                    <PenTool className="h-3 w-3 text-neutral-400 group-hover:text-violet-600 transition-colors" />
                  </div>
                  <div className="text-[7.5px] text-neutral-500">Goods received / Consignee signature</div>
                  <div className="text-[8px] text-neutral-400 font-mono truncate">
                    Date arrival: {consignment.signatures.goodsReceivedDate || '____ / ____ / 2026'}
                  </div>
                </div>

                <div className="my-0.5 flex-1 min-h-[42px] max-h-[48px] rounded border border-dashed border-neutral-300 bg-neutral-50/70 flex items-center justify-center p-1 transition-colors group-hover:border-violet-300">
                  {consignment.signatures.consigneeSignatureDataUrl ? (
                    <img
                      src={consignment.signatures.consigneeSignatureDataUrl}
                      alt="Consignee Signature"
                      className="max-h-9 max-w-[130px] object-contain"
                    />
                  ) : (
                    <div className="text-[8px] text-neutral-400 text-center font-medium">
                      Receipt Sign (Box 24)
                    </div>
                  )}
                </div>

                <div className="pt-0.5">
                  <div className="border-b border-neutral-400 w-full mb-0.5" />
                  <div className="text-[8.5px] font-semibold text-neutral-800 truncate">
                    Receiver: {consignment.signatures.consigneeReceiverName || '(Consignee Signature)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Official Bottom Footer Note */}
            <div className="p-2 bg-neutral-50 text-[8px] text-neutral-500 flex items-center justify-between shrink-0">
              <span>UN Geneva Convention on the Contract for the International Carriage of Goods by Road (CMR 1956)</span>
              <span className="font-mono">Page 1 / {meta.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
