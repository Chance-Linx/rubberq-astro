'use client';

import { useState } from 'react';
import { Award, Building2, ZoomIn } from 'lucide-react';
import CertificateLightbox from '../CertificateLightbox';
import { trackGaEvent } from '../../lib/inquiryTracking';

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

interface QualityPageClientProps {
  certificates: Certificate[];
  viewDetailsText: string;
}

function CertificateCard({ 
  certificate, 
  onClick,
  viewDetailsText
}: { 
  certificate: Certificate; 
  onClick: () => void;
  viewDetailsText: string;
}) {
  return (
    <div 
      className="group bg-white border border-industrial-200 hover:border-accent-orange hover:shadow-xl transition-all cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Certificate Preview */}
      <div className="aspect-[1.414/1] bg-industrial-50 p-6 flex items-center justify-center relative overflow-hidden">
        <div className="bg-white shadow-lg border-4 border-industrial-100 p-6 w-full h-full flex flex-col items-center justify-center text-center transform group-hover:scale-105 transition-transform duration-500">
          <Award className="w-12 h-12 text-industrial-300 mb-3" />
          <h3 className="text-lg font-bold text-industrial-900">{certificate.name}</h3>
          <p className="text-xs text-industrial-500 mt-1">{certificate.org}</p>
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-industrial-900/0 group-hover:bg-industrial-900/60 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-white font-medium">
            <ZoomIn className="w-5 h-5" />
            {viewDetailsText}
          </div>
        </div>

      </div>

      {/* Certificate Info */}
      <div className="p-5">
        <h3 className="font-bold text-industrial-900 mb-1 group-hover:text-accent-orange transition-colors">
          {certificate.name}
        </h3>
        <p className="text-xs text-industrial-500 uppercase tracking-wider mb-3">{certificate.org}</p>
        
        <div className="flex items-center gap-4 text-xs text-industrial-600">
          <div className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            <span>{certificate.issuer}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QualityPageClient({ 
  certificates, 
  viewDetailsText
}: QualityPageClientProps) {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleCertClick = (cert: Certificate) => {
    setSelectedCert(cert);
    setIsLightboxOpen(true);
    trackGaEvent('certificate_view', { category: 'engagement', certificate: cert.name });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {certificates.map((cert) => (
          <CertificateCard 
            key={cert.id} 
            certificate={cert} 
            onClick={() => handleCertClick(cert)}
            viewDetailsText={viewDetailsText}
          />
        ))}
      </div>

      <CertificateLightbox
        certificate={selectedCert}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  );
}
