import React from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import WebsiteNav from '../components/WebsiteNav';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="h-[100dvh] overflow-y-auto overflow-x-hidden bg-[#0D0D0D] text-white font-sans flex flex-col pt-[clamp(60px,8dvh,80px)]">

      <WebsiteNav />

      {/* Hero */}
      <main className="flex-1 relative flex flex-col justify-center pb-20 px-6 min-h-[600px]">

        <div className="max-w-5xl mx-auto w-full flex flex-col items-center text-center relative z-10 pt-4 md:pt-10">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="flex flex-col items-center gap-10 max-w-2xl px-2 lg:px-0"
          >

            <div className="flex flex-col items-center gap-6">
              <div className="text-[10px] font-medium text-white/30 uppercase tracking-[0.7em]">
                Financial Clarity
              </div>
              <h1 className="text-[2.6rem] md:text-6xl lg:text-[4.25rem] font-extralight tracking-tight leading-[1.06] text-white/90">
                See the true cost<br />of nicotine.
              </h1>
            </div>

            <p className="text-base md:text-lg text-white/40 leading-relaxed font-light max-w-xl">
              Stop hiding the numbers. Track exactly how much your habit costs you in real-time, and discover what that money could become if you invested it instead.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
              <a
                href="https://apps.apple.com/app/addiction-ticker/id6761534960"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-white text-black px-9 py-4 rounded-full text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-white/90 transition-all active:scale-95"
              >
                Download on iOS
              </a>

              <button
                onClick={() => navigate('/app')}
                className="flex items-center justify-center text-white/40 px-9 py-4 rounded-full text-[11px] uppercase tracking-[0.3em] font-medium hover:text-white transition-colors active:scale-95"
              >
                Open Web App
              </button>
            </div>

            <div className="flex items-center gap-6 pt-2 text-[9px] text-white/20 uppercase tracking-[0.3em] font-medium">
              <span>100% On-Device</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span>7 Languages</span>
            </div>

          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 px-6 shrink-0 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-[9px] text-white/20 uppercase tracking-[0.35em] font-medium">
            © 2026 Addiction Ticker
          </span>
          <div className="flex gap-10 text-[9px] text-white/30 uppercase tracking-[0.35em] font-medium">
            <Link to="/info" className="hover:text-white transition-colors">Support</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
