import React from 'react';
import { useNavigate } from 'react-router-dom';
import WebsiteNav from '../components/WebsiteNav';
import { Apple, ChevronRight } from 'lucide-react';

export default function Info() {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#050505] text-white font-sans selection:bg-rose-500/30 w-full relative">
      <WebsiteNav />
      
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-rose-500/10 blur-[150px] rounded-full pointer-events-none opacity-40 fixed" />
      <div className="absolute top-40 left-1/4 w-[350px] h-[350px] bg-emerald-400/5 blur-[120px] rounded-full pointer-events-none opacity-30 fixed" />

      <main className="max-w-3xl w-full mx-auto px-6 pt-[120px] md:pt-[160px] pb-32 relative z-10 flex flex-col items-center">
        
        <div className="text-center mb-16 md:mb-20">
          <div className="w-24 h-24 mx-auto mb-8 bg-zinc-900 rounded-3xl flex items-center justify-center border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            <img 
              src="/icon-512x512.png" 
              alt="Addiction Ticker Logo" 
              className="w-full h-full rounded-[22%]" 
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight m-0 mb-4 text-white">Addiction Ticker</h1>
          <div className="text-[10px] uppercase tracking-[0.3em] font-medium text-emerald-400 mt-2">
            Financial addiction auditing tool
          </div>
        </div>

        <div className="info-content w-full relative text-left">
          <style>{`
             .info-content h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.4em; color: #10b981; margin-top: 56px; margin-bottom: 24px; font-weight: 600; }
             .info-content p { margin-bottom: 20px; font-weight: 300; color: #a1a1aa; line-height: 1.8; font-size: 16px; }
             .info-content strong { color: #ffffff; font-weight: 500; }
             .info-content ul { padding-left: 0; margin-bottom: 32px; list-style-type: none; }
             .info-content li { margin-bottom: 12px; position: relative; padding-left: 20px; color: #a1a1aa; font-weight: 300; font-size: 15px; line-height: 1.6; }
             .info-content li::before { content: "•"; position: absolute; left: 0; color: #f43f5e; font-size: 20px; line-height: 1; top: -2px; }
          `}</style>
          
          <div>
            <p><strong>The journey to freedom starts one second at a time.</strong></p>
            <p>Nicotine addiction is more than just a habit – it is a relentless wealth tax and a constant transfer of capital from your pocket to the control of others. Addiction Ticker is designed for those who want to see the truth through pure mathematics – whether you have already quit or are just considering starting your journey.</p>
            <p>This is not your typical quitting app. Ticker does not provide badges or motivational quotes. It is a clinical financial auditing tool that transforms every second into a real-time vision of your lost or accumulated capital.</p>
            <h2>Entirely Fact-Based</h2>
            <p>The application's mathematical model produces an objective analysis based on your own settings:</p>
            <ul>
                <li>The exact moment you quit or started</li>
                <li>Daily consumption and estimated inflation</li>
                <li>Your expected rate of return from the investment markets</li>
            </ul>
            <h2>Core Features</h2>
            <ul>
                <li><strong>Real-time tracking:</strong> Experience the growth of your savings in a kinetic interface that updates in fractions of a second.</li>
                <li><strong>The power of compound interest:</strong> See how your saved capital would grow as potential investments over the coming decades.</li>
                <li><strong>Opportunity cost:</strong> Visualize the massive sum you would lose if you continued consumption instead of investing.</li>
                <li><strong>Total privacy:</strong> No cloud sync, no accounts, no tracking. Everything is processed locally on your own device.</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-20 w-full mb-12">
          {/* Main App Store Button */}
          <a 
            href="https://apps.apple.com/us/app/addiction-ticker/id6761534960" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-white/[0.05] backdrop-blur-2xl border border-white/10 text-white px-8 py-5 rounded-full font-semibold hover:bg-white/[0.1] hover:border-white/20 transition-all active:scale-95"
          >
            <Apple size={22} className="mb-[1px]" />
            <span className="text-[11px] uppercase tracking-[0.2em] pt-0.5">App Store</span>
          </a>
          
          <button 
            onClick={() => navigate('/app')}
            className="flex-1 min-w-[200px] group flex items-center justify-center gap-2 bg-transparent border border-transparent text-zinc-400 px-8 py-5 rounded-full font-medium hover:text-white hover:bg-white/[0.02] transition-colors active:scale-95"
          >
            <span className="text-[11px] uppercase tracking-[0.2em] pt-0.5">Open Web App</span>
            <ChevronRight size={14} className="opacity-60 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="w-full">
           <a 
            href="mailto:touko.aunio@icloud.com"
            className="w-full flex items-center justify-center py-6 text-[10px] uppercase tracking-[0.3em] font-medium text-emerald-400/80 hover:text-emerald-400 transition-colors"
           >
            Contact Support
           </a>
        </div>

        <div className="mt-8 pt-8 border-t border-white/[0.02] w-full text-center text-[9px] uppercase tracking-[0.3em] font-medium text-white/40">
          &copy; 2026 Addiction Ticker. All rights reserved.
        </div>
      </main>
    </div>
  );
}
