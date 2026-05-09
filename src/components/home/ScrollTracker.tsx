'use client';

import { useScrollDepthTracking } from '../GoogleAnalytics';

export default function ScrollTracker() {
  useScrollDepthTracking();
  return null;
}
