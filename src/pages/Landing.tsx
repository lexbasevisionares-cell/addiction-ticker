import React from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Apple, ShieldCheck, TrendingUp, Globe2, ChevronRight } from 'lucide-react';
import WebsiteNav from '../components/WebsiteNav';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#050505] text-white selection:bg-rose-500/30 font-sans flex flex-col">
      
      {/* Navbar - Glassmorphism matched to App */}
      <WebsiteNav />

      {/* Hero Section */}
      <main className="flex-1 relative flex flex-col justify-center pb-20 px-6 min-h-[600px] mt-16 md:mt-0">
        {/* APP-STYLE BACKGROUND GLOW */}
        <div className="absolute top-10 right-1/4 w-[400px] h-[400px] bg-rose-500/10 blur-[150px] rounded-full pointer-events-none opacity-60" />
        <div className="absolute top-40 left-1/4 w-[350px] h-[350px] bg-emerald-400/5 blur-[120px] rounded-full pointer-events-none opacity-50" />
        
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center text-center relative z-10 pt-4 md:pt-10">
          
          {/* Centered Copy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-8 max-w-3xl px-2 lg:px-0"
          >
            <div className="flex flex-col gap-5">
               <div className="text-[11px] md:text-[12px] font-semibold text-rose-500 uppercase tracking-[0.6em] md:tracking-[0.8em]">The Reality</div>
               <h1 className="text-[2.75rem] md:text-6xl lg:text-[4.5rem] font-light tracking-tight leading-[1.05]">
                 See the <span className="font-normal text-white">true cost</span> of nicotine.
               </h1>
            </div>
            <p className="text-lg lg:text-xl text-zinc-400/80 leading-relaxed font-light">
              Stop hiding the numbers. Track exactly how much your habit costs you in real-time, and discover what that money could become if you invested it instead.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
              {/* App Store Button - Changed to glassmorphic app-style button with subtle glow */}
              <a 
                href="https://apps.apple.com/app/addiction-ticker/id6761534960" 
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-row items-center justify-center gap-3 bg-white/[0.05] backdrop-blur-2xl border border-white/10 text-white px-8 py-5 rounded-full font-semibold hover:bg-white/[0.1] hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all active:scale-95"
              >
                <Apple size={22} className="mb-[1px]" />
                <span className="text-[11px] uppercase tracking-[0.2em] pt-0.5">Download on iOS</span>
              </a>
              
              {/* Web App Button - Minimalist secondary action */}
              <button 
                onClick={() => navigate('/app')}
                className="group flex items-center justify-center gap-2 bg-transparent border border-transparent text-zinc-400 px-8 py-5 rounded-full font-medium hover:text-white transition-colors active:scale-95"
              >
                <span className="text-[11px] uppercase tracking-[0.2em] pt-0.5">Open Web App</span>
                <ChevronRight size={14} className="opacity-60 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mt-8 md:mt-12 text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-medium">
              <span className="flex items-center gap-2"><ShieldCheck size={14} /> 100% On-Device</span>
              <span className="w-1 h-1 rounded-full bg-zinc-800" />
              <span className="flex items-center gap-2"><Globe2 size={14} /> 7 Languages</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 text-center shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="flex items-end gap-[2px] h-[10px] opacity-20 grayscale">
                 <div className="w-[2px] h-full bg-white rounded-full" />
                 <div className="w-[2px] h-[60%] bg-white rounded-full" />
             </div>
            <span className="text-[9px] text-zinc-600 uppercase tracking-[0.3em] font-medium pt-0.5">© 2026 Addiction Ticker</span>
          </div>
          <div className="flex gap-10 text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-medium">
            <Link to="/info" className="hover:text-white transition-colors">Support</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
