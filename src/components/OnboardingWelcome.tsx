import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onStart: () => void;
}

// The structural definition of each narrative phase
// `lines` is an array of strings that will drop in sequentially
// `stagger` determines the delay between each line dropping
// `duration` determines how long the ENTIRE phase stays on screen
const PHASES = [
  { lines: ["Mitä nikotiiniriippuvuutesi", "todella maksaa?"], stagger: 0.8, duration: 5000, align: "center" },
  { 
    lines: ["Savukkeet.", "Nuuska.", "Sähkötupakka.", "Pussit.", "Sillä ei ole väliä."], 
    stagger: 0.5, 
    duration: 6500, 
    align: "center" 
  },
  { 
    lines: [
      "On olemassa luku, josta useimmat", 
      "käyttäjät eivät ole tietoisia.",
      "Tai jota he eivät halua nähdä."
    ], 
    stagger: 0.8, 
    duration: 6000, 
    align: "center" 
  },
  { 
    lines: ["Kuvitellaan tilanne,", "jossa kulu on 8 € päivässä."], 
    stagger: 0.8, 
    duration: 5000, 
    align: "center" 
  },
  { 
    lines: [
      "1 kuukausi: 243 €.", 
      "1 vuosi: 2 920 €.", 
      "10 vuotta: 29 200 €.", 
      "30 vuotta: 87 600 €.",
      { text: "50 vuotta: 146 000 €.", color: "text-red-500", impact: true }
    ], 
    stagger: 0.6, 
    duration: 10500,
    align: "left"
  },
  { 
    lines: [
      "Entä jos sijoittaisit ne mieluummin?", 
      "243 €/kk globaaliin indeksirahastoon.", 
      "7 % vuosittaisella tuotto-odotuksella."
    ], 
    stagger: 1.0, 
    duration: 6500, 
    align: "center" 
  },
  { 
    lines: [
      "10 vuotta: 42 000 €.", 
      "20 vuotta: 126 000 €.",
      "30 vuotta: 296 000 €.",
      "40 vuotta: 637 000 €.",
      { text: "50 vuotta: 1 280 000 €.", color: "text-emerald-500", impact: true }
    ], 
    stagger: 0.6, 
    duration: 10500, 
    align: "center" 
  },
  { decision: true, duration: Infinity }
];

// Cinematic drift impact
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    filter: "blur(0px)",
    transition: { 
      duration: 1.2, 
      ease: [0.22, 1, 0.36, 1]
    } 
  }
};

const impactVariants = {
  hidden: { opacity: 0, y: -40, scale: 1.2, filter: "blur(15px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    filter: "blur(0px)",
    transition: { 
      type: "spring",
      stiffness: 400,
      damping: 12,
      mass: 0.8,
      delay: 2.8 // Clear pause after the 30y/40y line finishes
    } 
  }
};

export default function OnboardingWelcome({ onStart }: Props) {
  const [phase, setPhase] = useState(0);
  const [tickerYear, setTickerYear] = useState(0);
  
  const isFinalPhase = phase === PHASES.length - 1;

  // Time Machine background ticker logic
  useEffect(() => {
    if (!isFinalPhase) return;

    let animationFrameId: number;
    let startTime: number | null = null;
    const duration = 25000;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      let progress = (time - startTime) / duration;
      
      if (progress >= 1) {
        if (progress > 1.25) {
            startTime = time;
            progress = 0;
        } else {
            progress = 1;
        }
      }

      const currentYear = progress * 50; 
      setTickerYear(currentYear);
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isFinalPhase]);

  // Calculate live values based on the time machine year
  const costPerDay = 8;
  const redValue = tickerYear * 365 * costPerDay;
  const r = 0.07;
  const n = 12;
  const pmt = 243;
  const months = tickerYear * 12;
  const greenValue = months === 0 ? 0 : pmt * (Math.pow(1 + r/n, months) - 1) / (r/n);

  // Auto-advance logic
  useEffect(() => {
    if (phase >= PHASES.length - 1) return;
    
    const currentPhase = PHASES[phase];
    const timer = setTimeout(() => {
      setPhase(p => p + 1);
    }, currentPhase.duration);
    
    return () => clearTimeout(timer);
  }, [phase]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const clickX = e.clientX;
    const screenWidth = window.innerWidth;
    
    if (clickX < screenWidth * 0.3) {
      if (phase > 0) setPhase(p => p - 1);
    } else {
      if (phase < PHASES.length - 1) setPhase(p => p + 1);
    }
  };

  // Render narrative text layers
  const renderNarrative = () => {
    const currentPhase = PHASES[phase];
    if (!currentPhase || isFinalPhase) return null;

    return (
       <motion.div
          key={phase}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -20, scale: 1.05, filter: "blur(10px)", transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }}
          variants={{
            visible: {
               transition: { staggerChildren: currentPhase.stagger || 0.4 }
            }
          }}
          className={`flex flex-col ${currentPhase.align === "left" ? "items-start" : "items-center"} justify-center pointer-events-none gap-6 md:gap-10`}
       >
         {currentPhase.lines && currentPhase.lines.map((line, idx) => {
           const isObject = typeof line === 'object';
           const text = isObject ? line.text : line;
           const colorClass = isObject ? line.color : '';
           const variants = isObject && line.impact ? impactVariants : itemVariants;

           return (
            <motion.h2 
              key={idx}
              variants={variants}
              className={`font-sans font-black tracking-tight leading-[1.3] text-3xl md:text-5xl lg:text-7xl ${colorClass}`}
            >
              {text}
            </motion.h2>
           );
         })}
       </motion.div>
    );
  };

  return (
    <div 
      className="fixed inset-0 h-[100dvh] bg-[#050505] text-white flex flex-col font-sans overflow-hidden cursor-pointer selection:bg-transparent"
      onClick={handleTap}
    >
      
      {/* Top Section: Progress Bar + Title */}
      <div className="shrink-0 pt-14 md:pt-10 pb-2 flex flex-col items-center w-full">
        {/* Segmented Progress Bar */}
        <div className="w-full max-w-lg px-6 flex gap-1 pointer-events-none">
          {PHASES.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: i < phase ? "100%" : i === phase ? "100%" : "0%" }}
                transition={{ duration: i === phase && PHASES[i].duration !== Infinity ? PHASES[i].duration / 1000 : 0.3, ease: "linear" }}
              />
            </div>
          ))}
        </div>
        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.8em] mt-4">Addiction Ticker</span>
      </div>

      {/* Middle Section: Narrative Content — fills available space */}
      <div className={`flex-1 flex flex-col items-center ${isFinalPhase ? 'justify-evenly' : 'justify-center'} min-h-0 px-6`}>
        {isFinalPhase ? (
          /* Final decision phase: unified flow filling available space */
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full flex flex-col items-center justify-evenly flex-1"
          >
            {/* POLTA. SIJOITA. */}
            <div className="flex flex-col items-center gap-3 sm:gap-5">
              <div className="flex w-full justify-center gap-4 sm:gap-16 items-center max-w-2xl px-2">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-red-500 tracking-tighter">POLTA.</h2>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-emerald-500 tracking-tighter">SIJOITA.</h2>
              </div>
              <p className="text-[11px] md:text-xl font-bold tracking-[0.3em] uppercase text-white/50">
                Jokainen annos on valinta.
              </p>
            </div>

            {/* Live Ticker */}
            <div className="flex flex-col items-center gap-5 w-full">
              {/* YEAR TICKER */}
              <div className="flex items-baseline justify-center">
                <span className="text-white/80 font-serif font-black text-3xl md:text-4xl tabular-nums tracking-tighter">
                  {Math.floor(tickerYear).toString().padStart(2, '0')}
                </span>
                <span className="text-white/50 text-[10px] md:text-[13px] uppercase tracking-[0.4em] font-black ml-3">
                  vuotta
                </span>
              </div>

              {/* METRICS ROW */}
              <div className="w-full flex flex-row items-center justify-center px-2 max-w-4xl mx-auto">
                <div className="flex-1 flex flex-col items-end pr-4 md:pr-12 lg:pr-24">
                  <span className="text-[9px] md:text-[13px] uppercase tracking-[0.4em] md:tracking-[0.6em] text-red-500 font-black mb-3">Riippuvainen</span>
                  <div className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-serif font-black text-red-500/80 tracking-tighter tabular-nums leading-none">
                    -{redValue.toLocaleString('fi-FI', { maximumFractionDigits: 0 })}
                  </div>
                </div>
                
                <div className="w-[1px] h-16 md:h-32 bg-white/10 mx-2 md:mx-6 shrink-0" />
                
                <div className="flex-1 flex flex-col items-start pl-4 md:pl-12 lg:pl-24">
                  <span className="text-[9px] md:text-[13px] uppercase tracking-[0.4em] md:tracking-[0.6em] text-emerald-500 font-black mb-3">Vapaa</span>
                  <div className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-serif font-black text-emerald-500/80 tracking-tighter tabular-nums leading-none">
                    +{greenValue.toLocaleString('fi-FI', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Narrative phases 0-6: centered text */
          <div className="max-w-4xl w-full flex flex-col items-center text-center pointer-events-none">
            <AnimatePresence mode="wait">
              {renderNarrative()}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom Section: CTA Button — fixed to bottom with proper spacing */}
      <div className="shrink-0 w-full flex flex-col items-center px-6 pb-8 md:pb-12 pt-4 z-50">
        <motion.button
          onClick={(e) => { e.stopPropagation(); onStart(); }}
          animate={isFinalPhase ? { 
            scale: [1, 1.05, 1],
            boxShadow: ["0 0 0 rgba(255,255,255,0)", "0 0 30px rgba(255,255,255,0.3)", "0 0 0 rgba(255,255,255,0)"]
          } : { scale: 1 }}
          transition={isFinalPhase ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
          className="w-full max-w-sm relative flex items-center justify-center bg-white text-black font-black py-5 md:py-7 px-10 rounded-full overflow-hidden transition-[transform,opacity] hover:scale-[1.05] active:scale-[0.95] text-xs md:text-sm tracking-[0.3em] uppercase group"
        >
          <span className="relative z-10">Laske vapautesi</span>
          <div className="absolute inset-0 -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        </motion.button>
        <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-3 md:mt-5 text-center">
           Laskettu omilla numeroillasi
        </p>
      </div>

    </div>
  );
}
