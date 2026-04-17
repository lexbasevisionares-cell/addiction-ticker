import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Menu } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function WebsiteNav() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleFeaturesClick = () => {
    if (window.location.pathname === '/') {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  };

  const navLinks: { label: string; to?: string; action?: () => void; highlight?: boolean }[] = [
    { label: 'Features', action: handleFeaturesClick },
    { label: 'Privacy', to: '/privacy' },
    { label: 'Support', to: '/info' },
    { label: 'Open Web App', action: () => navigate('/app'), highlight: true },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-40 bg-[#050505]/60 backdrop-blur-3xl border-b border-white/5 font-sans">
        <div className="max-w-7xl mx-auto px-6 h-[clamp(60px,8dvh,80px)] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group active:scale-95 transition-transform z-50">
            <div className="w-8 h-8 rounded-[22%] shrink-0 shadow-[0_0_12px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_16px_rgba(255,255,255,0.1)] transition-all overflow-hidden border border-white/10">
              <img src="/icon-512x512.png" alt="Addiction Ticker Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-[12px] uppercase tracking-[0.4em] text-white/90">Addiction Ticker</span>
          </Link>

          <button 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-medium text-white/70 hover:text-white transition-colors py-2 active:scale-95 z-50"
          >
            <span>Menu</span>
            <Menu size={16} />
          </button>
        </div>
      </nav>

      {/* Full-screen Overlay Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-3xl flex flex-col items-center justify-center"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-4 text-white/50 hover:text-white transition-colors hover:rotate-90 duration-500"
            >
              <X size={32} strokeWidth={1} />
            </button>

            {/* Menu Items */}
            <div className="flex flex-col items-center gap-10 md:gap-14">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.5, ease: "easeOut" }}
                >
                  {link.to ? (
                    <Link 
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className="text-4xl md:text-5xl lg:text-6xl font-light text-white/70 hover:text-white transition-colors tracking-tight"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        if (link.action) {
                          const action = link.action;
                          setTimeout(() => action(), 300);
                        }
                      }}
                      className={`text-4xl md:text-5xl lg:text-6xl font-light text-white/70 transition-colors tracking-tight ${link.highlight ? 'hover:text-emerald-400 relative group' : 'hover:text-white'}`}
                    >
                      {link.label}
                      {link.highlight && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-emerald-400 group-hover:w-full transition-all duration-300"></span>}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
