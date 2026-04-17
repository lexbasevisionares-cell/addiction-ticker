import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-y-auto bg-[#050505] text-[#FAFAFA] font-sans flex items-center justify-center selection:bg-white/20 p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-8 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5">
          <div className="text-[#A3A3A3] text-2xl font-light">404</div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Page not found</h1>
        <p className="text-[#A3A3A3] text-[16px] leading-relaxed mb-10">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-zinc-200 transition-transform active:scale-95"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}
