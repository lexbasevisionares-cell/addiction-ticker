import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';

export default function WebsiteNav() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

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

  const navLinks: { label: string; to?: string; action?: () => void }[] = [
    { label: 'Features', action: handleFeaturesClick },
    { label: 'Privacy', to: '/privacy' },
    { label: 'Support', to: '/info' },
    { label: 'Web App', action: () => navigate('/app') },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-40 bg-[#0D0D0D]/70 backdrop-blur-3xl border-b border-white/[0.06] font-sans">
        <div className="max-w-7xl mx-auto px-6 h-[clamp(60px,8dvh,80px)] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group active:scale-95 transition-transform z-50">
            <div className="w-7 h-7 rounded-[22%] shrink-0 overflow-hidden">
              <img src="/icon-512x512.png" alt="Addiction Ticker" className="w-full h-full object-cover" />
            </div>
            <span className="font-medium text-[11px] uppercase tracking-[0.45em] text-white/80 group-hover:text-white transition-colors">Addiction Ticker</span>
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            className="text-[10px] uppercase tracking-[0.4em] font-medium text-white/50 hover:text-white transition-colors py-2 active:scale-95 z-50"
          >
            Menu
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
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-[#0D0D0D]/98 backdrop-blur-3xl flex flex-col items-center justify-center"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 px-4 py-2 text-[10px] uppercase tracking-[0.4em] font-medium text-white/40 hover:text-white transition-colors"
            >
              Close
            </button>

            {/* Menu Items */}
            <div className="flex flex-col items-center gap-10 md:gap-14">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + index * 0.08, duration: 0.5, ease: 'easeOut' }}
                >
                  {link.to ? (
                    <Link
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className="text-4xl md:text-5xl lg:text-6xl font-light text-white/50 hover:text-white transition-colors tracking-tight"
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
                      className="text-4xl md:text-5xl lg:text-6xl font-light text-white/50 hover:text-white transition-colors tracking-tight"
                    >
                      {link.label}
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
