import jsPDF from 'jspdf';
import { CMRConsignment, CMRCopyType, CMR_COPIES } from '../types/cmr';

interface RenderOptions {
  copyType: CMRCopyType;
}

export function generateCMRPdf(consignment: CMRConsignment, options: RenderOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const copiesToRender: string[] = options.copyType === 'all'
    ? ['1_sender', '2_consignee', '3_carrier', '4_admin']
    : [options.copyType];

  copiesToRender.forEach((copyKey, index) => {
    if (index > 0) {
      doc.addPage('a4', 'portrait');
    }
    renderSingleCMRSheet(doc, consignment, copyKey);
  });

  return doc;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function renderSingleCMRSheet(doc: jsPDF, c: CMRConsignment, copyKey: string) {
  const meta = CMR_COPIES[copyKey] || CMR_COPIES['1_sender'];
  const [accentR, accentG, accentB] = hexToRgb(meta.accentHex);

  const marginX = 8;
  const marginY = 8;
  const pageWidth = 210 - (2 * marginX); // 194 mm
  const midX = marginX + (pageWidth / 2); // 105 mm

  // Outer border with copy accent
  doc.setDrawColor(accentR, accentG, accentB);
  doc.setLineWidth(0.6);
  doc.rect(marginX, marginY, pageWidth, 281);

  // Top Copy Banner
  doc.setFillColor(accentR, accentG, accentB);
  doc.rect(marginX, marginY, pageWidth, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`${meta.number} - ${meta.titleFr.toUpperCase()} / ${meta.titleEn.toUpperCase()}`, marginX + 3, marginY + 4.5);

  // Header Box (Title & CMR Logo & Number)
  const headerY = marginY + 6.5;
  const headerH = 14;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.line(marginX, headerY + headerH, marginX + pageWidth, headerY + headerH);

  // Title left
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('INTERNATIONAL CONSIGNMENT NOTE / LETTRE DE VOITURE INTERNATIONALE', marginX + 3, headerY + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(90, 90, 90);
  doc.text('Ce transport est soumis, nonobstant toute clause contraire, à la Convention de Genève (CMR 1956).', marginX + 3, headerY + 8);
  doc.text('This carriage is subject, notwithstanding any clause to the contrary, to the Convention on Contract for Intl Carriage of Goods by Road.', marginX + 3, headerY + 11.5);

  // Emblem and Number right
  const emblemX = marginX + pageWidth - 65;
  doc.line(emblemX, headerY, emblemX, headerY + headerH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(accentR, accentG, accentB);
  doc.text('CMR', emblemX + 3, headerY + 7);

  doc.setFontSize(7);
  doc.setTextColor(60, 60, 60);
  doc.text('No.', emblemX + 22, headerY + 5);
  doc.setFontSize(9.5);
  doc.setTextColor(accentR, accentG, accentB);
  doc.text(c.consignmentNumber, emblemX + 27, headerY + 5.5);

  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(`Issue Date: ${c.issueDate}`, emblemX + 22, headerY + 11);

  // Grid vertical separator between columns
  const sectionTopY = headerY + headerH;

  // Box 1 (Sender) & Box 16 (Carrier)
  const row1H = 24;
  const colHalfW = pageWidth / 2;
  drawBoxHeader(doc, marginX, sectionTopY, '1', 'Expéditeur (nom, adresse, pays)', 'Sender (name, address, country)', colHalfW);
  renderPartyText(doc, marginX + 2, sectionTopY, c.sender);

  drawBoxHeader(doc, midX, sectionTopY, '16', 'Transporteur (nom, adresse, pays)', 'Carrier (name, address, country)', colHalfW);
  renderPartyText(doc, midX + 2, sectionTopY, c.carrier);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(accentR, accentG, accentB);
  doc.text(`Tractor / Camion: ${c.carrierTruckPlate || '-'}   Trailer / Remorque: ${c.carrierTrailerPlate || '-'}`, midX + 2, sectionTopY + row1H - 1.8);

  doc.line(marginX, sectionTopY + row1H, marginX + pageWidth, sectionTopY + row1H);
  doc.line(midX, sectionTopY, midX, sectionTopY + row1H);

  // Box 2 (Consignee) & Box 17 (Successive) + Box 18 (Reservations)
  const row2Y = sectionTopY + row1H;
  const row2H = 24;
  drawBoxHeader(doc, marginX, row2Y, '2', 'Destinataire (nom, adresse, pays)', 'Consignee (name, address, country)', colHalfW);
  renderPartyText(doc, marginX + 2, row2Y, c.consignee);

  // Box 17 & 18 right
  const halfRightH = row2H / 2;
  drawBoxHeader(doc, midX, row2Y, '17', 'Transporteurs successifs', 'Successive carriers', colHalfW);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 30, 30);
  if (c.successiveCarrier.name) {
    doc.text(`${c.successiveCarrier.name}, ${c.successiveCarrier.cityPostal} ${c.successiveCarrier.country}`, midX + 2, row2Y + 8.5);
  } else {
    doc.setTextColor(140, 140, 140);
    doc.text('None / Néant', midX + 2, row2Y + 8.5);
  }

  doc.line(midX, row2Y + halfRightH, marginX + pageWidth, row2Y + halfRightH);

  drawBoxHeader(doc, midX, row2Y + halfRightH, '18', 'Réserves et observations du transporteur', "Carrier's reservations", colHalfW);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 30, 30);
  doc.text((c.carrierReservations || 'None / Received in apparent good order and condition').substring(0, 75), midX + 2, row2Y + halfRightH + 8.5);

  doc.line(marginX, row2Y + row2H, marginX + pageWidth, row2Y + row2H);
  doc.line(midX, row2Y, midX, row2Y + row2H);

  // Box 3 (Delivery place) & Box 4 (Taking over goods)
  const row3Y = row2Y + row2H;
  const row3H = 12;
  drawBoxHeader(doc, marginX, row3Y, '3', 'Lieu prévu pour la livraison', 'Place of delivery of the goods', colHalfW);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(20, 20, 20);
  doc.text(`${c.deliveryPlace || '-'}, ${c.deliveryCountry || '-'}`, marginX + 2, row3Y + 8.5);

  drawBoxHeader(doc, midX, row3Y, '4', 'Lieu et date de la prise en charge', 'Place & date of taking over', colHalfW);
  doc.text(`${c.takingOverPlace || '-'} (${c.takingOverCountry || '-'})  -  Date: ${c.takingOverDate || '-'}`, midX + 2, row3Y + 8.5);

  doc.line(marginX, row3Y + row3H, marginX + pageWidth, row3Y + row3H);
  doc.line(midX, row3Y, midX, row3Y + row3H);

  // Box 5: Documents attached (full width)
  const row5Y = row3Y + row3H;
  const row5H = 10;
  drawBoxHeader(doc, marginX, row5Y, '5', 'Documents annexés (Factures, listes de colisage, certificats)', 'Documents attached', pageWidth);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 30, 30);
  doc.text((c.documentsAttached || 'None').substring(0, 140), marginX + 2, row5Y + 8.2);
  doc.line(marginX, row5Y + row5H, marginX + pageWidth, row5Y + row5H);

  // GOODS TABLE (Boxes 6 to 12)
  const goodsTopY = row5Y + row5H;
  const goodsHeaderH = 8;
  const goodsBodyH = 76; // Expanded by 30mm (3 cm) so signature boxes 22-24 move down to the bottom
  const goodsTotalH = 7;

  // Table header background
  doc.setFillColor(245, 246, 248);
  doc.rect(marginX, goodsTopY, pageWidth, goodsHeaderH, 'F');
  doc.line(marginX, goodsTopY + goodsHeaderH, marginX + pageWidth, goodsTopY + goodsHeaderH);

  // Column definitions (total width 194mm)
  // 6: Marks (26mm), 7: Colis (14mm), 8: Emballage (24mm), 9: Nature & ADR (66mm), 10: Statist (18mm), 11: Poids (24mm), 12: Volume (22mm)
  const colW = [26, 14, 24, 66, 18, 24, 22];
  let curX = marginX;
  const colX = [curX];
  for (let w of colW) {
    curX += w;
    colX.push(curX);
  }

  // Draw vertical table lines
  for (let i = 1; i < colX.length - 1; i++) {
    doc.line(colX[i], goodsTopY, colX[i], goodsTopY + goodsHeaderH + goodsBodyH);
  }

  // Column headers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(40, 40, 40);

  const headers = [
    { no: '6', fr: 'Marques et No', en: 'Marks & Nos' },
    { no: '7', fr: 'Nb colis', en: 'No pkgs' },
    { no: '8', fr: "Mode d'emb.", en: 'Packing' },
    { no: '9', fr: 'Nature marchandise / ADR', en: 'Nature of goods / ADR' },
    { no: '10', fr: 'No statist.', en: 'Stat. No' },
    { no: '11', fr: 'Poids brut kg', en: 'Gross wt kg' },
    { no: '12', fr: 'Volume m³', en: 'Volume m³' }
  ];

  headers.forEach((h, i) => {
    doc.text(`${h.no} ${h.fr}`, colX[i] + 1.5, goodsTopY + 3.2);
    doc.setFont('helvetica', 'normal');
    doc.text(h.en, colX[i] + 1.5, goodsTopY + 6.2);
    doc.setFont('helvetica', 'bold');
  });

  // Table items rows
  let rowY = goodsTopY + goodsHeaderH + 4.5;
  c.items.slice(0, 6).forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(20, 20, 20);

    doc.text(item.marksAndNumbers.substring(0, 16), colX[0] + 1.5, rowY);
    doc.text(String(item.packagesCount), colX[1] + 2, rowY);
    doc.text(item.packingMethod.substring(0, 15), colX[2] + 1.5, rowY);

    doc.setFont('helvetica', 'bold');
    doc.text(item.natureOfGoods.substring(0, 48), colX[3] + 1.5, rowY);
    if (item.adrDetails) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(accentR, accentG, accentB);
      doc.text(`ADR: ${item.adrDetails.substring(0, 50)}`, colX[3] + 1.5, rowY + 3.2);
      doc.setTextColor(20, 20, 20);
      doc.setFontSize(6.5);
    }

    doc.setFont('helvetica', 'normal');
    doc.text(item.statisticalNumber || '-', colX[4] + 1.5, rowY);
    doc.text(item.grossWeightKg.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }), colX[5] + 2, rowY);
    doc.text(item.volumeM3 ? item.volumeM3.toFixed(2) : '-', colX[6] + 2, rowY);

    rowY += 9.5;
  });

  // Table bottom line
  const tableBottomY = goodsTopY + goodsHeaderH + goodsBodyH;
  doc.line(marginX, tableBottomY, marginX + pageWidth, tableBottomY);

  // Totals Row
  const totalPkgs = c.items.reduce((s, it) => s + (Number(it.packagesCount) || 0), 0);
  const totalWt = c.items.reduce((s, it) => s + (Number(it.grossWeightKg) || 0), 0);
  const totalVol = c.items.reduce((s, it) => s + (Number(it.volumeM3) || 0), 0);

  doc.setFillColor(238, 242, 246);
  doc.rect(marginX, tableBottomY, pageWidth, goodsTotalH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(20, 20, 20);
  doc.text('TOTAL / TOTALS:', colX[0] + 1.5, tableBottomY + 4.5);
  doc.setTextColor(accentR, accentG, accentB);
  doc.text(`${totalPkgs} pkgs`, colX[1] + 2, tableBottomY + 4.5);
  doc.text(`${totalWt.toLocaleString(undefined, { minimumFractionDigits: 1 })} kg`, colX[5] + 2, tableBottomY + 4.5);
  doc.text(`${totalVol.toFixed(2)} m³`, colX[6] + 2, tableBottomY + 4.5);
  doc.line(marginX, tableBottomY + goodsTotalH, marginX + pageWidth, tableBottomY + goodsTotalH);

  // LOWER SECTION (Boxes 13, 14, 15, 19, 20)
  const lowerTopY = tableBottomY + goodsTotalH;
  const lowerH = 34;

  // Split: Left (Boxes 13, 14, 15: 105mm) | Right (Boxes 19, 20: 89mm)
  const lowerMidX = marginX + 105;
  doc.line(lowerMidX, lowerTopY, lowerMidX, lowerTopY + lowerH);
  doc.line(marginX, lowerTopY + lowerH, marginX + pageWidth, lowerTopY + lowerH);

  // Box 13: Sender instructions
  drawBoxHeader(doc, marginX, lowerTopY, '13', "Instructions de l'expéditeur", "Sender's instructions", 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 30, 30);
  const insLines = doc.splitTextToSize(c.senderInstructions || 'None', 100);
  doc.text(insLines.slice(0, 3), marginX + 2, lowerTopY + 8.5);

  // Boxes 14 (COD) & 15 (Carriage paid) at bottom of left half
  const b14Y = lowerTopY + 22;
  doc.line(marginX, b14Y, lowerMidX, b14Y);

  const b15X = marginX + 52;
  doc.line(b15X, b14Y, b15X, lowerTopY + lowerH);

  drawBoxHeader(doc, marginX, b14Y, '14', 'Prescriptions de remboursement', 'Cash on delivery', 52);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(c.codAmount ? `${c.codAmount} ${c.charges.currency}` : 'NIL / NÉANT', marginX + 2, b14Y + 8.5);

  drawBoxHeader(doc, b15X, b14Y, '15', 'Dispositions paiement transport', 'Carriage payment instructions', 53);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(c.paymentInstructions || 'Carriage Paid (Franco)', b15X + 2, b14Y + 8.5);

  // Box 19 (Conventions particulières) & Box 20 (Charges breakdown) right
  const b19H = 14;
  drawBoxHeader(doc, lowerMidX, lowerTopY, '19', 'Conventions particulières', 'Special agreements', pageWidth - 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 30, 30);
  doc.text((c.specialAgreements || 'CMR Convention 1956 applies.').substring(0, 58), lowerMidX + 2, lowerTopY + 8.5);

  doc.line(lowerMidX, lowerTopY + b19H, marginX + pageWidth, lowerTopY + b19H);

  // Box 20: To be paid by
  const b20Y = lowerTopY + b19H;
  drawBoxHeader(doc, lowerMidX, b20Y, '20', 'À payer par (Prix de transport)', `To be paid by (${c.charges.currency})`, pageWidth - 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`Prix de transport / Carriage: ${c.charges.carriagePaid.toFixed(2)} ${c.charges.currency}`, lowerMidX + 2, b20Y + 8.2);
  doc.text(`Solde / Balance:           ${c.charges.balanceSender.toFixed(2)} ${c.charges.currency}`, lowerMidX + 2, b20Y + 12.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentR, accentG, accentB);
  doc.text(`Total: ${c.charges.carriagePaid.toFixed(2)} ${c.charges.currency}`, lowerMidX + 55, b20Y + 12.5);

  // BOX 21 (Established Place & Date)
  const b21Y = lowerTopY + lowerH;
  const b21H = 8;
  doc.setFillColor(250, 250, 250);
  doc.rect(marginX, b21Y, pageWidth, b21H, 'F');
  drawBoxHeader(doc, marginX, b21Y, '21', 'Établi à / le', 'Established in / on');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(20, 20, 20);
  doc.text(`Place / Lieu: ${c.establishedPlace || '-'}        Date: ${c.establishedDate || '-'}`, marginX + 45, b21Y + 5);
  doc.line(marginX, b21Y + b21H, marginX + pageWidth, b21Y + b21H);

  // SIGNATURES ROW (Boxes 22, 23, 24: 3 equal columns of ~64.6mm) - Evenly Aligned to Bottom
  const sigY = b21Y + b21H;
  const bottomBorderY = marginY + 281; // 289mm
  const footerH = 5.5;
  const sigH = bottomBorderY - footerH - sigY; // Extends flush to the bottom footer
  const colSigW = pageWidth / 3;

  // Box 22, 23, 24 vertical dividers
  doc.line(marginX + colSigW, sigY, marginX + colSigW, sigY + sigH);
  doc.line(marginX + (2 * colSigW), sigY, marginX + (2 * colSigW), sigY + sigH);

  // Box 22: Sender Signature
  drawBoxHeader(doc, marginX, sigY, '22', "Signature et timbre de l'expéditeur", 'Signature & stamp of sender');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(110, 110, 110);
  doc.text(`Date: ${c.signatures.senderSignedAt || c.takingOverDate || '____ / ____ / 2026'}`, marginX + 2, sigY + 8.5);

  if (c.signatures.senderSignatureDataUrl) {
    try {
      doc.addImage(c.signatures.senderSignatureDataUrl, 'PNG', marginX + 6, sigY + 11, 48, sigH - 25);
    } catch {
      // fallback
    }
  }

  // Box 22 Baseline & Signer Name
  doc.setDrawColor(180, 180, 180);
  doc.line(marginX + 2, sigY + sigH - 6.5, marginX + colSigW - 2, sigY + sigH - 6.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 30, 30);
  doc.text(`Signer: ${c.signatures.senderSignerName || '(Authorized Signature)'}`, marginX + 2, sigY + sigH - 2.5);

  // Box 23: Carrier Signature
  const sig23X = marginX + colSigW;
  drawBoxHeader(doc, sig23X, sigY, '23', 'Signature et timbre du transporteur', 'Signature & stamp of carrier');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(110, 110, 110);
  doc.text(`Prise en charge: ${c.signatures.carrierSignedAt || c.takingOverDate || '____ / ____ / 2026'}`, sig23X + 2, sigY + 8.5);

  if (c.signatures.carrierSignatureDataUrl) {
    try {
      doc.addImage(c.signatures.carrierSignatureDataUrl, 'PNG', sig23X + 6, sigY + 11, 48, sigH - 25);
    } catch {
      // fallback
    }
  }

  // Box 23 Baseline & Driver Name
  doc.line(sig23X + 2, sigY + sigH - 6.5, sig23X + colSigW - 2, sigY + sigH - 6.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 30, 30);
  doc.text(`Driver: ${c.signatures.carrierDriverName || '(Driver Signature)'}`, sig23X + 2, sigY + sigH - 2.5);

  // Box 24: Consignee Signature (Goods received)
  const sig24X = marginX + (2 * colSigW);
  drawBoxHeader(doc, sig24X, sigY, '24', 'Marchandises reçues (Destinataire)', 'Goods received (Consignee)');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(110, 110, 110);
  doc.text(`Date arrival: ${c.signatures.goodsReceivedDate || '____ / ____ / 2026'}`, sig24X + 2, sigY + 8.5);

  if (c.signatures.consigneeSignatureDataUrl) {
    try {
      doc.addImage(c.signatures.consigneeSignatureDataUrl, 'PNG', sig24X + 6, sigY + 11, 48, sigH - 25);
    } catch {
      // fallback
    }
  }

  // Box 24 Baseline & Receiver Name
  doc.line(sig24X + 2, sigY + sigH - 6.5, marginX + pageWidth - 2, sigY + sigH - 6.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 30, 30);
  doc.text(`Receiver: ${c.signatures.consigneeReceiverName || '(Consignee Signature)'}`, sig24X + 2, sigY + sigH - 2.5);

  // Horizontal line separating signature boxes from footer
  doc.setDrawColor(180, 180, 180);
  doc.line(marginX, sigY + sigH, marginX + pageWidth, sigY + sigH);

  // Footer notes flush at bottom
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(120, 120, 120);
  doc.text('Convention on the Contract for the International Carriage of Goods by Road (CMR Geneva 1956)', marginX + 2, bottomBorderY - 1.8);
  doc.text(`Copy: ${meta.name} | Doc: ${c.consignmentNumber}`, marginX + pageWidth - 55, bottomBorderY - 1.8);
}

function drawBoxHeader(doc: jsPDF, x: number, y: number, boxNo: string, frText: string, enText: string, w?: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(50, 50, 50);
  doc.text(`${boxNo}  ${frText}`, x + 1.5, y + 2.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.5);
  doc.setTextColor(120, 120, 120);
  doc.text(enText, x + 1.5, y + 4.5);

  if (w && w > 0) {
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.15);
    doc.line(x + 1, y + 5.5, x + w - 1, y + 5.5);
  }
}

function renderPartyText(doc: jsPDF, x: number, y: number, party: { name: string; address: string; cityPostal: string; country: string; contactPhone?: string; vatId?: string }) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 15, 15);
  // User input text starts at y + 8.5, completely below header text and subtle divider line
  doc.text(party.name || '-', x, y + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(50, 50, 50);
  let curY = y + 12.0;
  if (party.address) {
    doc.text(party.address, x, curY);
    curY += 3.4;
  }
  if (party.cityPostal || party.country) {
    doc.text(`${party.cityPostal} ${party.country.toUpperCase()}`, x, curY);
    curY += 3.4;
  }
  if (party.contactPhone || party.vatId) {
    const contactStr = [
      party.contactPhone ? `Tel: ${party.contactPhone}` : '',
      party.vatId ? `VAT: ${party.vatId}` : ''
    ].filter(Boolean).join(' | ');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 100, 100);
    doc.text(contactStr, x, curY);
  }
}
