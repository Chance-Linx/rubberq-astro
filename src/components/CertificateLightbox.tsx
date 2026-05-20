'use client';

import { useEffect, useCallback } from 'react';
import { X, ZoomIn, Download, FileText, Building2, Award } from 'lucide-react';
// TrackableDownloadLink stub - removed for Astro migration

interface Certificate {
  id: string;
  name: string;
  org: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  description: string;
  placeholder: string;
  downloadUrl?: string;
}

interface CertificateLightboxProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CertificateLightbox({ certificate, isOpen, onClose }: CertificateLightboxProps) {
  // Handle ESC key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !certificate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-industrial-100">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-accent-orange" />
            <h2 className="text-xl font-bold text-industrial-900">{certificate.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-industrial-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-industrial-600" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Certificate Image */}
          <div className="lg:w-2/3 bg-industrial-50 p-8 flex items-center justify-center min-h-[400px]">
            <div className="relative w-full max-w-2xl">
              <div className="bg-white shadow-xl border-8 border-industrial-100 p-8 aspect-[1.414/1] flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-industrial-100 rounded-full flex items-center justify-center mb-6">
                  <Award className="w-12 h-12 text-industrial-400" />
                </div>
                <h3 className="text-2xl font-bold text-industrial-900 mb-2">{certificate.name}</h3>
                <p className="text-industrial-500 mb-4">{certificate.org}</p>
                <div className="w-32 h-1 bg-accent-orange mb-4" />
                <p className="text-sm text-industrial-400">Certificate Summary</p>
                <p className="text-xs text-industrial-300 mt-8">Issued by {certificate.issuer}</p>
              </div>
              
              {/* Zoom Hint */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-2">
                <ZoomIn className="w-3 h-3" />
                Open certificate summary
              </div>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="lg:w-1/3 p-6 bg-white border-l border-industrial-100">
            {/* Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-industrial-500 text-sm mb-1">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium uppercase tracking-wider">Issuing Authority</span>
                </div>
                <p className="text-industrial-900 font-semibold">{certificate.issuer}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-industrial-500 text-sm mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium uppercase tracking-wider">Documentation</span>
                </div>
                <p className="text-industrial-900">{certificate.issueDate}</p>
              </div>

              <div>
                <h4 className="font-medium text-industrial-900 mb-2">Scope</h4>
                <p className="text-sm text-industrial-600 leading-relaxed">{certificate.description}</p>
              </div>

              {/* Download Button */}
              {certificate.downloadUrl && (
                <a
                  href={certificate.downloadUrl}
                  download
                  className="w-full flex items-center justify-center gap-2 bg-industrial-900 text-white px-6 py-3 font-bold uppercase tracking-wider text-sm hover:bg-accent-orange transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Certificate
                </a>
              )}
            </div>

            {/* Verification Note */}
            <div className="mt-8 pt-6 border-t border-industrial-100">
              <p className="text-xs text-industrial-500">
                This certificate can be verified through the issuing authority's official registry using the certificate number.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
