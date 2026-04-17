import React from 'react';
import { Smartphone } from 'lucide-react';

export default function PortraitLock() {
  return (
    <div className="portrait-lock-overlay hidden fixed inset-0 z-[99999] bg-[#050505]/95 backdrop-blur-xl flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center max-w-sm mx-auto text-center">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
          <Smartphone size={48} className="text-white/90 animate-rotate-phone" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-light text-white mb-3">Please rotate your device</h2>
        <p className="text-white/50 text-sm leading-relaxed">
          Addiction Ticker is designed to be experienced in portrait mode.
        </p>
      </div>
    </div>
  );
}
