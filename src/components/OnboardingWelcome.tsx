import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onStart: () => void;
}

// The structural definition of each narrative phase
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
      delay: 2.8 
    } 
  }
};

export default function OnboardingWelcome({ onStart }: Props) {
  const [phase, setPhase] = useState(0);
  const [tickerYear, setTickerYear] = useState(0);
  
  const isFinalPhase = phase === PHASES.length - 1;

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

  const costPerDay = 8;
  const redValue = tickerYear * 365 * costPerDay;
  const r = 0.07;
  const n = 12;
  const pmt = 243;
  const months = tickerYear * 12;
  const greenValue = months === 0 ? 0 : pmt * (Math.pow(1 + r/n, months) - 1) / (r/n);

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
              className={`font-sans font-medium tracking-tighter leading-[1.1] text-3xl md:text-6xl lg:text-8xl text-balance ${colorClass}`}
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
      className="h-full bg-[#050505] text-white flex flex-col font-sans overflow-hidden cursor-pointer selection:bg-transparent relative"
      onClick={handleTap}
    >
      
      {/* Top Section: Title (Brand) -> Progress Bar (Navigation) */}
      <div className="shrink-0 pt-[clamp(32px,5.5vh,48px)] pb-2 flex flex-col items-center w-full relative z-20">
        <span className="text-[11px] font-semibold text-white uppercase tracking-[0.6em] mb-5">Addiction Ticker</span>
        
        <div className="w-full max-w-lg px-6 flex gap-1.5 pointer-events-none">
          {PHASES.map((_, i) => (
            <div key={i} className="h-0.5 flex-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white/60"
                initial={{ width: "0%" }}
                animate={{ width: i < phase ? "100%" : i === phase ? "100%" : "0%" }}
                transition={{ duration: i === phase && PHASES[i].duration !== Infinity ? PHASES[i].duration / 1000 : 0.3, ease: "linear" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Middle Section: Narrative Content - Optical Centering applied via mt-[-4vh] */}
      <div className={`flex-1 flex flex-col items-center ${isFinalPhase ? 'justify-evenly' : 'justify-center'} min-h-0 px-8 mt-[-4vh]`}>
        {isFinalPhase ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full flex flex-col items-center justify-evenly flex-1"
          >
            {/* MENETÄ. SIJOITA. */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex w-full justify-center gap-6 sm:gap-20 items-center max-w-2xl">
                <h2 className="text-5xl md:text-7xl lg:text-9xl font-light text-red-500 tracking-tighter">MENETÄ.</h2>
                <h2 className="text-5xl md:text-7xl lg:text-9xl font-light text-emerald-500 tracking-tighter">SIJOITA.</h2>
              </div>
              <p className="text-[11px] md:text-lg font-semibold tracking-[0.4em] uppercase text-white/60">
                Jokainen sekunti on valinta.
              </p>
            </div>

            {/* Live Ticker */}
            <div className="flex flex-col items-center gap-8 w-full">
              {/* YEAR TICKER */}
              <div className="flex items-baseline justify-center">
                <span className="text-white font-sans font-light text-4xl md:text-6xl tabular-nums tracking-tighter">
                  {Math.floor(tickerYear).toString().padStart(2, '0')}
                </span>
                <span className="text-white/60 text-[11px] md:text-[14px] uppercase tracking-[0.6em] font-semibold ml-4">
                  vuotta
                </span>
              </div>

              {/* METRICS ROW */}
              <div className="w-full flex flex-row items-center justify-center px-4 max-w-5xl mx-auto">
                <div className="flex-1 flex flex-col items-end pr-5 md:pr-16 lg:pr-32">
                  <span className="text-[10px] md:text-[12px] uppercase tracking-[0.4em] text-red-500/90 font-bold mb-4">Riippuvainen</span>
                  <div className="text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] font-sans font-light text-red-500 tracking-tighter tabular-nums leading-none">
                    -{redValue.toLocaleString('fi-FI', { maximumFractionDigits: 0 })}
                  </div>
                </div>
                
                <div className="w-px h-12 md:h-24 bg-white/5 mx-2 md:mx-10 shrink-0" />
                
                <div className="flex-1 flex flex-col items-start pl-5 md:pl-16 lg:pl-32">
                  <span className="text-[10px] md:text-[12px] uppercase tracking-[0.4em] text-emerald-500/90 font-bold mb-4">Vapaa</span>
                  <div className="text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] font-sans font-light text-emerald-500 tracking-tighter tabular-nums leading-none">
                    +{greenValue.toLocaleString('fi-FI', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="max-w-5xl w-full flex flex-col items-center text-center pointer-events-none">
            <AnimatePresence mode="wait">
              {renderNarrative()}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom Section: CTA Button */}
      <div className="shrink-0 w-full flex flex-col items-center px-8 pb-10 md:pb-16 pt-4 z-50">
        <motion.button
          onClick={(e) => { e.stopPropagation(); onStart(); }}
          animate={isFinalPhase ? { 
            scale: [1, 1.02, 1],
          } : { scale: 1 }}
          transition={isFinalPhase ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
          className="w-full max-w-sm relative flex items-center justify-center bg-white text-black font-semibold py-5 md:py-6 px-10 rounded-full overflow-hidden transition-[transform,opacity] hover:scale-[1.03] active:scale-[0.98] text-[10px] md:text-xs tracking-[0.6em] uppercase group"
        >
          <span className="relative z-10">Aseta numerosi</span>
          <div className="absolute inset-0 -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        </motion.button>
        <p className="text-[10px] md:text-[11px] text-zinc-400 font-semibold uppercase tracking-[0.2em] mt-5 md:mt-7 text-center">
           Numerosi paljastavat totuuden.
        </p>
      </div>

    </div>
  );
}
