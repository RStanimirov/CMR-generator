import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CMRFormEditor } from './components/CMRFormEditor';
import { CMRDocumentView } from './components/CMRDocumentView';
import { SignatureModal } from './components/SignatureModal';
import { PythonCodeModal } from './components/PythonCodeModal';
import { CMRConsignment, CMRCopyType } from './types/cmr';
import { createEmptyConsignment } from './utils/presets';
import { generateCMRPdf } from './utils/pdfGenerator';
import confetti from 'canvas-confetti';
import { AlertCircle, CheckCircle, Eye, Edit3, Code2, Download } from 'lucide-react';

const STORAGE_KEY = 'cmr_active_consignment_v1';

export default function App() {
  const [consignment, setConsignment] = useState<CMRConsignment>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return createEmptyConsignment();
  });

  const [selectedCopy, setSelectedCopy] = useState<CMRCopyType>('1_sender');
  const [activeFormTab, setActiveFormTab] = useState('parties');
  const [zoomLevel, setZoomLevel] = useState(0.85);
  const [mobileViewMode, setMobileViewMode] = useState<'editor' | 'preview'>('editor');

  // Modals
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [signatureModalState, setSignatureModalState] = useState<{
    isOpen: boolean;
    type: 'sender' | 'carrier' | 'consignee';
  }>({
    isOpen: false,
    type: 'sender'
  });

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consignment));
    } catch {
      // ignore
    }
  }, [consignment]);

  const handleOpenSignature = (type: 'sender' | 'carrier' | 'consignee') => {
    setSignatureModalState({
      isOpen: true,
      type
    });
  };

  const handleSaveSignature = (dataUrl: string, signerName: string) => {
    const type = signatureModalState.type;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setConsignment((prev) => {
      const updated = { ...prev };
      if (type === 'sender') {
        updated.signatures = {
          ...updated.signatures,
          senderSignatureDataUrl: dataUrl,
          senderSignerName: signerName,
          senderSignedAt: now
        };
      } else if (type === 'carrier') {
        updated.signatures = {
          ...updated.signatures,
          carrierSignatureDataUrl: dataUrl,
          carrierDriverName: signerName,
          carrierSignedAt: now
        };
      } else if (type === 'consignee') {
        updated.signatures = {
          ...updated.signatures,
          consigneeSignatureDataUrl: dataUrl,
          consigneeReceiverName: signerName,
          consigneeSignedAt: now,
          goodsReceivedDate: updated.signatures.goodsReceivedDate || new Date().toISOString().split('T')[0]
        };
      }
      return updated;
    });
  };

  const handleDownloadPdf = () => {
    try {
      const doc = generateCMRPdf(consignment, { copyType: selectedCopy });
      const filename = `${consignment.consignmentNumber || 'cmr_consignment'}_${selectedCopy}.pdf`;
      doc.save(filename);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 }
      });
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (window.confirm('Clear consignment note and start with a blank form?')) {
      setConsignment(createEmptyConsignment());
    }
  };

  const handleNavigateSection = (section: string) => {
    if (section === 'parties') setActiveFormTab('parties');
    else if (section === 'cargo') setActiveFormTab('cargo');
    else if (section === 'charges') setActiveFormTab('charges');
    else if (section === 'signatures') setActiveFormTab('signatures');
    setMobileViewMode('editor');
  };

  const handleEditBoxFromPreview = (boxNo: number) => {
    if ([1, 2, 16, 17].includes(boxNo)) setActiveFormTab('parties');
    else if ([3, 4, 21].includes(boxNo)) setActiveFormTab('route');
    else if ([6, 7, 8, 9, 10, 11, 12].includes(boxNo)) setActiveFormTab('cargo');
    else if ([5, 13, 14, 15, 18, 19, 20].includes(boxNo)) setActiveFormTab('charges');
    else if ([22, 23, 24].includes(boxNo)) setActiveFormTab('signatures');
    setMobileViewMode('editor');
  };

  // Quick validation
  const validationWarnings: string[] = [];
  if (!consignment.sender.name) validationWarnings.push('Box 1: Sender name missing');
  if (!consignment.consignee.name) validationWarnings.push('Box 2: Consignee name missing');
  if (!consignment.deliveryPlace) validationWarnings.push('Box 3: Delivery place missing');
  if (!consignment.carrier.name) validationWarnings.push('Box 16: Carrier name missing');

  const sigModalConfig = {
    sender: {
      title: "Box 22: Sender Signature & Stamp",
      recipient: "Expéditeur / Dispatch Organization",
      initialName: consignment.signatures.senderSignerName
    },
    carrier: {
      title: "Box 23: Carrier / Driver Signature",
      recipient: "Transporteur / Road Freight Operator",
      initialName: consignment.signatures.carrierDriverName
    },
    consignee: {
      title: "Box 24: Goods Received Receipt",
      recipient: "Destinataire / Delivery Warehouse",
      initialName: consignment.signatures.consigneeReceiverName
    }
  }[signatureModalState.type];

  return (
    <div className="flex h-screen w-screen flex-col bg-neutral-100 overflow-hidden font-sans">
      {/* Top Bar adhering to Top Bar Contract */}
      <div className="no-print">
        <Header
          onOpenPythonModal={() => setIsPythonModalOpen(true)}
          onDownloadPdf={handleDownloadPdf}
          onPrint={handlePrint}
          onReset={handleReset}
          selectedCopy={selectedCopy}
          onSelectCopy={setSelectedCopy}
          activeSection={activeFormTab}
          onNavigateSection={handleNavigateSection}
        />
      </div>

      {/* Mobile Toggle Bar */}
      <div className="lg:hidden no-print flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-2">
        <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-lg">
          <button
            onClick={() => setMobileViewMode('editor')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mobileViewMode === 'editor'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Note
          </button>
          <button
            onClick={() => setMobileViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mobileViewMode === 'preview'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Live Preview
          </button>
        </div>

        <button
          onClick={() => setIsPythonModalOpen(true)}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-800 hover:text-neutral-950"
        >
          <Code2 className="h-3.5 w-3.5 text-yellow-600" />
          Python CLI
        </button>
      </div>

      {/* Main Workspace Viewport */}
      <main className="flex-1 overflow-hidden p-3 md:p-4">
        <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Form Editor (5 cols on desktop) */}
          <div
            className={`h-full lg:col-span-5 flex flex-col no-print ${
              mobileViewMode === 'preview' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <CMRFormEditor
              consignment={consignment}
              onChange={setConsignment}
              onOpenSignatureModal={handleOpenSignature}
              activeTab={activeFormTab}
              onTabChange={setActiveFormTab}
            />
          </div>

          {/* Right Column: Live Official CMR Note Preview (7 cols on desktop) */}
          <div
            className={`h-full lg:col-span-7 flex flex-col ${
              mobileViewMode === 'editor' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <CMRDocumentView
              consignment={consignment}
              selectedCopy={selectedCopy}
              onSelectCopy={setSelectedCopy}
              onEditBox={handleEditBoxFromPreview}
              onOpenSignatureModal={handleOpenSignature}
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <SignatureModal
        isOpen={signatureModalState.isOpen}
        onClose={() => setSignatureModalState({ isOpen: false, type: 'sender' })}
        title={sigModalConfig?.title || 'Digital Signature'}
        recipientLabel={sigModalConfig?.recipient || ''}
        initialSignerName={sigModalConfig?.initialName || ''}
        onSave={handleSaveSignature}
      />

      <PythonCodeModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
        consignment={consignment}
      />
    </div>
  );
}
