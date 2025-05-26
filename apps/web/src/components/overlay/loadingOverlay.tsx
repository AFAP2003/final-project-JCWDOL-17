// components/ui/overlay-spinner.tsx
'use client';

import { Loader2 } from 'lucide-react';
import React from 'react';

export default function OverlaySpinner() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <Loader2 className="h-10 w-10 animate-spin text-white" />
    </div>
  );
}
