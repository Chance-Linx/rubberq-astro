'use client';

import type { ReactNode } from 'react';
import { trackDownload } from '../lib/inquiryTracking';

export default function TrackableDownloadLink({
  href,
  fileName,
  fileType,
  className,
  children,
  title,
  download = true,
}: {
  href: string;
  fileName: string;
  fileType: string;
  className?: string;
  children: ReactNode;
  title?: string;
  download?: boolean;
}) {
  const handleClick = () => {
    trackDownload(fileName, fileType);
  };

  return (
    <a href={href} download={download} onClick={handleClick} className={className} title={title}>
      {children}
    </a>
  );
}
