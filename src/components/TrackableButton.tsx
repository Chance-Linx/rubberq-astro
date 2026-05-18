'use client';

import type { ReactNode } from 'react';
import { trackGaEvent, trackOutboundLink } from '../lib/inquiryTracking';

interface TrackableButtonProps {
  children: ReactNode;
  eventName: string;
  eventParams?: {
    category?: string;
    label?: string;
    value?: number;
    [key: string]: string | number | boolean | null | undefined;
  };
  onClick?: () => void;
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function TrackableButton({
  children,
  eventName,
  eventParams,
  onClick,
  className = '',
  href,
  target,
  rel,
  type = 'button',
  disabled = false,
}: TrackableButtonProps) {
  const handleClick = () => {
    trackGaEvent(eventName, eventParams);
    
    // Call the original onClick if provided
    if (onClick) {
      onClick();
    }
  };

  // If href is provided, render as link
  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        onClick={handleClick}
        className={className}
      >
        {children}
      </a>
    );
  }

  // Otherwise render as button
  return (
    <button
      type={type}
      onClick={handleClick}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// Pre-configured CTA button
export function TrackableCTA({
  children,
  ctaText,
  location,
  href,
  onClick,
  className = '',
}: {
  children: ReactNode;
  ctaText: string;
  location: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <TrackableButton
      eventName="cta_click"
      eventParams={{
        category: 'conversion',
        label: ctaText,
        location: location,
      }}
      href={href}
      onClick={onClick}
      className={className}
    >
      {children}
    </TrackableButton>
  );
}

// Trackable link for navigation
export function TrackableLink({
  children,
  href,
  className = '',
  target,
  rel,
}: {
  children: ReactNode;
  href: string;
  className?: string;
  target?: string;
  rel?: string;
}) {
  const handleClick = () => {
    // Check if it's an outbound link
    if (href.startsWith('http') && !href.includes('rubberq.com')) {
      trackOutboundLink(href);
    }
  };

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
