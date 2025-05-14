'use client';

import { Loader2 } from 'lucide-react';

export default function UploadImageLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Loader2 className="h-40 w-40 animate-spin text-white" />
    </div>
  );
}
