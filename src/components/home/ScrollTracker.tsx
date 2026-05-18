'use client';

import { useEffect } from 'react';

export default function ScrollTracker() {
  useEffect(() => {
    const thresholds = [25, 50, 75, 90];
    const tracked = new Set<number>();

    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const depth = Math.round((window.scrollY / scrollable) * 100);
      for (const threshold of thresholds) {
        if (depth >= threshold && !tracked.has(threshold)) {
          tracked.add(threshold);
          window.dispatchEvent(new CustomEvent('rubberq-scroll-depth', { detail: { depth: threshold } }));
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
}
