import React from 'react';
import { Download, FileCode, Printer, RotateCcw } from 'lucide-react';
import { CMRCopyType, CMR_COPIES } from '../types/cmr';

interface HeaderProps {
  onOpenPythonModal: () => void;
  onDownloadPdf: () => void;
  onPrint: () => void;
  onReset: () => void;
  selectedCopy: CMRCopyType;
  onSelectCopy: (copy: CMRCopyType) => void;
  activeSection: string;
  onNavigateSection: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPythonModal,
  onDownloadPdf,
  onPrint,
  onReset,
  selectedCopy,
  onSelectCopy,
  activeSection,
  onNavigateSection
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 border-b border-neutral-200 bg-white/95 px-6 py-3.5 backdrop-blur-md">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onNavigateSection('form');
        }}
        className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0 hover:text-violet-600 transition-colors"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 text-xs font-mono font-bold text-white shadow-xs">
          CMR
        </span>
        <span>CMR Generator</span>
      </a>

      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-neutral-600">
        <button
          onClick={() => onNavigateSection('parties')}
          className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'parties' ? 'text-neutral-950 font-semibold underline underline-offset-4' : ''
          }`}
        >
          Parties (1, 2, 16)
        </button>
        <button
          onClick={() => onNavigateSection('cargo')}
          className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'cargo' ? 'text-neutral-950 font-semibold underline underline-offset-4' : ''
          }`}
        >
          Cargo & ADR (6-12)
        </button>
        <button
          onClick={() => onNavigateSection('charges')}
          className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'charges' ? 'text-neutral-950 font-semibold underline underline-offset-4' : ''
          }`}
        >
          Freight & Terms (13-20)
        </button>
        <button
          onClick={() => onNavigateSection('signatures')}
          className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'signatures' ? 'text-neutral-950 font-semibold underline underline-offset-4' : ''
          }`}
        >
          Signatures (22-24)
        </button>
        {/* <button
          onClick={onOpenPythonModal}
          className="flex items-center gap-1.5 text-neutral-800 font-semibold hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0"
        >
          <FileCode className="h-3.5 w-3.5 text-yellow-600" />
          Python & GitHub
        </button> */}
      </nav>

      <div className="flex items-center gap-2.5 shrink-0">
        {/* <button
          onClick={onPrint}
          title="Direct Browser Print (Ctrl+P)"
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors whitespace-nowrap shrink-0"
        >
          <Printer className="h-3.5 w-3.5 text-neutral-500" />
          Print
        </button> */}

        {/* <button
          onClick={onOpenPythonModal}
          title="View Python Source & CLI"
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-100 transition-colors whitespace-nowrap shrink-0"
        >
          <FileCode className="h-3.5 w-3.5 text-yellow-600" />
          Python Repo
        </button> */}

        <button
          onClick={onDownloadPdf}
          className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          Download PDF
        </button>
      </div>
    </header>
  );
};
