/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import {
  FileText,
  FileCheck,
  Archive,
  Download,
  Mail,
  Linkedin,
  X,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-modal-title"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
              Arch Technologies · Month 1 Submission
            </span>
            <h2
              id="submission-modal-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Internship Report & Project Deliverables
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Candidate Profile Summary */}
          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Candidate Name:</span>
              <span className="font-semibold text-slate-900 dark:text-white text-sm">Alisha Ashraf</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Internship Domain:</span>
              <span className="font-semibold text-slate-900 dark:text-white text-sm">Web Development (Month 1)</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Email:</span>
              <span className="text-slate-800 dark:text-slate-200 font-mono">alishaashraf206@gmail.com</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Phone Number:</span>
              <span className="text-slate-800 dark:text-slate-200 font-mono">0323 5525737</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Education:</span>
              <span className="text-slate-800 dark:text-slate-200">
                University of Veterinary & Animal Sciences (UVAS), Lahore (BS Computer Science)
              </span>
            </div>
          </div>

          {/* Download Cards */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Generated Files & Deliverables
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Word Document */}
              <a
                href="/downloads/Alisha_Ashraf_Web_Development_Month1.docx"
                download="Alisha_Ashraf_Web_Development_Month1.docx"
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Word Report (.docx)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Editable format with cover page, code section & screenshots.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .docx</span>
                </div>
              </a>

              {/* PDF Document */}
              <a
                href="/downloads/Alisha_Ashraf_Web_Development_Month1.pdf"
                download="Alisha_Ashraf_Web_Development_Month1.pdf"
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-red-400 dark:hover:border-red-500 transition-all flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-2.5">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400">
                    PDF Document (.pdf)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Ready for direct email submission to Arch Technologies.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .pdf</span>
                </div>
              </a>

              {/* ZIP Bundle */}
              <a
                href="/downloads/Alisha_Ashraf_Web_Development_Month1.zip"
                download="Alisha_Ashraf_Web_Development_Month1.zip"
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5">
                    <Archive className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Complete ZIP Bundle (.zip)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Contains DOCX, PDF, full source code, and assets.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .zip</span>
                </div>
              </a>
            </div>
          </div>

          {/* Submission Guidelines & Next Steps */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Submission Checklist
            </h3>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    1. File Naming Standard Enforced:
                  </span>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    Alisha_Ashraf_Web_Development_Month1.pdf
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    2. Email Submission:
                  </span>
                  <span>
                    Attach the PDF and send your submission to{' '}
                    <strong className="text-slate-900 dark:text-white font-mono">
                      submissions.archtech@gmail.com
                    </strong>
                    .
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <Linkedin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    3. LinkedIn Upload & Mention:
                  </span>
                  <span>
                    Publish a post showcasing your project highlights, screenshots, and tag{' '}
                    <strong className="text-blue-600 dark:text-blue-400">@Arch Technologies</strong>.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
