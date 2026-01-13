import React from 'react';

export default function Banner(): React.ReactNode {
  return (
    <div className="mx-auto mt-4 px-6 max-w-[1800px] w-full z-50">
      <div className="glass-card bg-[#0a0a0a]/80 border-white/5 py-4 px-10 flex justify-between items-center relative overflow-hidden backdrop-blur-3xl">
        <div className="flex items-center gap-6">
          <div className="glow-dot"></div>
          <span className="etched-label tracking-[0.5em] text-white/30">
            SYSTEM_STATE_v4.0 // <span className="text-white">ENCRYPTED_SIGNAL_STABLE</span>
          </span>
        </div>
        <div className="hidden md:flex gap-10 etched-label opacity-20 text-[7px] font-medium">
          <span className="flex items-center gap-2">VECTOR_REF: <span className="text-white">0x442A</span></span>
          <span className="flex items-center gap-2">UPTIME: <span className="text-white">99.98%</span></span>
        </div>
      </div>
    </div>
  );
}