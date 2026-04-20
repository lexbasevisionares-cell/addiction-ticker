import React from 'react';
import { useNavigate } from 'react-router-dom';
import WebsiteNav from '../components/WebsiteNav';

export default function Info() {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#0D0D0D] text-white font-sans w-full relative">
      <WebsiteNav />

      <main className="max-w-2xl w-full mx-auto px-6 pt-[120px] md:pt-[160px] pb-32 relative z-10">

        <div className="mb-16 md:mb-20">
          <h1 className="text-4xl md:text-5xl font-extralight tracking-tight mb-3 text-white/90">Addiction Ticker</h1>
          <div className="text-[10px] uppercase tracking-[0.4em] font-medium text-white/25">
            Financial addiction auditing tool
          </div>
        </div>

        <div className="info-content w-full">
          <style>{`
            .info-content h2 {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.45em;
              color: rgba(255,255,255,0.3);
              margin-top: 52px;
              margin-bottom: 20px;
              font-weight: 500;
            }
            .info-content p {
              margin-bottom: 20px;
              font-weight: 300;
              color: rgba(255,255,255,0.45);
              line-height: 1.85;
              font-size: 16px;
            }
            .info-content strong {
              color: rgba(255,255,255,0.85);
              font-weight: 500;
            }
            .info-content ul {
              padding-left: 0;
              margin-bottom: 32px;
              list-style-type: none;
            }
            .info-content li {
              margin-bottom: 12px;
              padding-left: 0;
              color: rgba(255,255,255,0.4);
              font-weight: 300;
              font-size: 15px;
              line-height: 1.7;
              border-left: 1px solid rgba(255,255,255,0.08);
              padding-left: 20px;
            }
          `}</style>

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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-20 mb-12">
          <a
            href="https://apps.apple.com/us/app/addiction-ticker/id6761534960"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center bg-white text-black px-8 py-4 rounded-full text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-white/90 transition-all active:scale-95"
          >
            App Store
          </a>

          <button
            onClick={() => navigate('/app')}
            className="flex-1 flex items-center justify-center text-white/40 px-8 py-4 rounded-full text-[11px] uppercase tracking-[0.3em] font-medium hover:text-white transition-colors active:scale-95 border border-white/[0.06]"
          >
            Open Web App
          </button>
        </div>

        <div className="w-full">
          <a
            href="mailto:touko.aunio@icloud.com"
            className="w-full flex items-center justify-center py-6 text-[10px] uppercase tracking-[0.4em] font-medium text-white/25 hover:text-white/60 transition-colors"
          >
            Contact Support
          </a>
        </div>

        <div className="mt-8 pt-8 border-t border-white/[0.04] text-center text-[9px] uppercase tracking-[0.35em] font-medium text-white/20">
          © 2026 Addiction Ticker. All rights reserved.
        </div>
      </main>
    </div>
  );
}
