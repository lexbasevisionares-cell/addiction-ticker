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
  { lines: ["What does your nicotine habit", "really cost you?"], stagger: 0.8, duration: 5000, align: "center" },
  { 
    lines: ["Cigarettes.", "Snus.", "Pouches.", "Vapes.", "It doesn't matter which."], 
    stagger: 0.5, 
    duration: 6500, 
    align: "center" 
  },
  { 
    lines: ["There's a number most nicotine", "users never want to see."], 
    stagger: 0.8, 
    duration: 4500, 
    align: "center" 
  },
  { 
    lines: ["€8 a day. The average."], 
    stagger: 0, 
    duration: 3500, 
    align: "center" 
  },
  { 
    lines: [
      "1 month: €243.", 
      "1 year: €2,920.", 
      "10 years: €29,200.", 
      "30 years: €87,600.",
      "50 years: €146,000."
    ], 
    stagger: 0.6, 
    duration: 8500,
    align: "left"
  },
  { 
    lines: [
      "But what if you invested it instead?", 
      "€243/mo into a global index fund.", 
      "At 7% annual return."
    ], 
    stagger: 1.0, 
    duration: 6500, 
    align: "center" 
  },
  { 
    lines: [
      "10 years: €42,000.", 
      "20 years: €126,000.",
      "30 years: €296,000.",
      "40 years: €637,000.",
      "50 years: €1,280,000."
    ], 
    stagger: 0.6, 
    duration: 8500, 
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
      duration: 1.6, 
      ease: [0.22, 1, 0.36, 1]
    } 
  }
};

const numberVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { delay: 1, duration: 1.5, ease: "easeOut" }
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
    const duration = 25000; // Slowed down from 12s to 25s for readable progression

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      let progress = (time - startTime) / duration;
      
      // Pause for 3 seconds at the end of the loop, then restart
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
    
    // Tap left 30% of the screen to go back, otherwise go forward
    if (clickX < screenWidth * 0.3) {
      if (phase > 0) setPhase(p => p - 1);
    } else {
      if (phase < PHASES.length - 1) setPhase(p => p + 1);
    }
  };

  // Render narrative text layers
  const renderNarrative = () => {
    if (isFinalPhase) {
      return (
        <motion.div
          key="decision"
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full flex flex-col items-center gap-4 sm:gap-6"
        >
          <div className="flex w-full justify-center gap-4 sm:gap-16 items-center max-w-2xl px-2">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-red-500 tracking-tighter">BURN IT.</h2>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-emerald-500 tracking-tighter">BUILD IT.</h2>
          </div>
          <p className="text-xs md:text-xl font-bold tracking-[0.3em] uppercase text-white/50">
            Every dose is a vote.
          </p>
        </motion.div>
      );
    }

    const currentPhase = PHASES[phase];
    if (!currentPhase) return null;

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
         {currentPhase.lines && currentPhase.lines.map((line, idx) => (
           <motion.h2 
             key={idx}
             variants={itemVariants}
             className={`font-sans font-black tracking-tight leading-[1.3] text-3xl md:text-5xl lg:text-7xl`}
           >
             {line}
           </motion.h2>
         ))}
       </motion.div>
    );
  };

  return (
    <div 
      className="fixed inset-0 min-h-[100dvh] bg-[#050505] text-white flex flex-col items-center justify-center font-sans overflow-hidden cursor-pointer selection:bg-transparent"
      onClick={handleTap}
    >
      
      {/* Top Segmented Progress Bar */}
      <div className="absolute top-8 md:top-10 w-full max-w-lg px-6 flex gap-1 z-50 pointer-events-none">
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

      <div className="absolute top-16 md:top-20 w-full flex justify-center pointer-events-none z-40">
        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.8em]">Addiction Ticker</span>
      </div>

      {/* The Living Mirror - Background Tickers */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isFinalPhase ? 1 : 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-x-0 top-[65%] md:top-[65%] -translate-y-1/2 flex flex-row items-center justify-center pointer-events-none z-0 px-4"
      >
        <div className="flex-1 flex flex-col items-end pr-4 md:pr-12 lg:pr-24">
          <span className="text-[9px] md:text-[13px] uppercase tracking-[0.4em] md:tracking-[0.6em] text-red-500 font-black mb-4">Addicted</span>
          <div className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-serif font-black text-red-500/80 tracking-tighter tabular-nums leading-none">
            -{redValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="relative flex items-center justify-center shrink-0 w-8 md:w-16 h-32 md:h-64">
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-white/10" />
          <div className="bg-[#050505] relative z-10 py-4 flex flex-col items-center">
            <span className="text-[8px] md:text-[9px] text-white/30 uppercase tracking-[0.3em] font-black">Year</span>
            <span className="text-white/80 font-serif font-black text-lg md:text-2xl tabular-nums mt-1">
              {Math.floor(tickerYear).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-start pl-4 md:pl-12 lg:pl-24">
          <span className="text-[9px] md:text-[13px] uppercase tracking-[0.4em] md:tracking-[0.6em] text-emerald-500 font-black mb-4">Free</span>
          <div className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-serif font-black text-emerald-500/80 tracking-tighter tabular-nums leading-none">
            +{greenValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </motion.div>

      {/* Narrative Layer Engine */}
      <div className="max-w-4xl w-full px-6 flex flex-col items-center text-center z-10 pointer-events-none absolute top-[42%] md:top-[42%] -translate-y-1/2">
        <AnimatePresence mode="wait">
          {renderNarrative()}
        </AnimatePresence>
      </div>

      {/* Action Section */}
      <div className="absolute bottom-16 md:bottom-20 w-full max-w-sm px-6 flex flex-col items-center z-50">
        <motion.button
          onClick={(e) => { e.stopPropagation(); onStart(); }}
          animate={isFinalPhase ? { 
            scale: [1, 1.05, 1],
            boxShadow: ["0 0 0 rgba(255,255,255,0)", "0 0 30px rgba(255,255,255,0.3)", "0 0 0 rgba(255,255,255,0)"]
          } : { scale: 1 }}
          transition={isFinalPhase ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
          className="w-full relative flex items-center justify-center bg-white text-black font-black py-4 md:py-6 px-10 rounded-full overflow-hidden transition-[transform,opacity] hover:scale-[1.05] active:scale-[0.95] text-[9px] md:text-xs tracking-[0.3em] uppercase group"
        >
          <span className="relative z-10">Calculate your freedom</span>
          <div className="absolute inset-0 -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        </motion.button>
        <p className="text-[8px] md:text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] mt-3 md:mt-5 text-center">
           Calculated with your exact numbers
        </p>
      </div>

    </div>
  );
}
