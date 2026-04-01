import { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'motion/react';
import { Lock, Unlock } from 'lucide-react';

interface Props {
  onConfirm: () => void;
  label: string;
  color?: 'emerald' | 'red' | 'blue';
}

export default function SlideToConfirm({ onConfirm, label, color = 'emerald' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const x = useMotionValue(0);
  const controls = useAnimation();
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
    
    // Recalculate on resize
    const handleResize = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const slideThreshold = containerWidth * 0.7;
  const opacityText = useTransform(x, [0, slideThreshold], [0.6, 0]);
  const progressWidth = useTransform(x, (val) => val + 64); // 64 is handle width approximately

  const handleDragEnd = async () => {
    if (x.get() >= slideThreshold) {
      setIsConfirmed(true);
      await controls.start({ x: containerWidth - 58, transition: { duration: 0.2, ease: "easeOut" } });
      setTimeout(() => onConfirm(), 300);
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } });
    }
  };

  const activeColor = color === 'emerald' ? 'bg-emerald-500' : color === 'red' ? 'bg-red-500' : 'bg-blue-500';
  const activeBorder = color === 'emerald' ? 'border-emerald-500/20' : color === 'red' ? 'border-red-500/20' : 'border-blue-500/20';
  const activeBg = color === 'emerald' ? 'bg-emerald-500/10' : color === 'red' ? 'bg-red-500/10' : 'bg-blue-500/10';

  return (
    <div
      ref={containerRef}
      className={`relative h-14 lg:h-16 rounded-full overflow-hidden border ${activeBorder} bg-white/5 backdrop-blur-md`}
    >
      <motion.div
        style={{ opacity: opacityText }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <span className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[9px] lg:text-[10px] z-10 pointer-events-none select-none">
          {label}
        </span>
      </motion.div>

      <motion.div
        style={{ width: progressWidth }}
        className={`absolute left-0 top-0 bottom-0 ${activeBg}`}
      />

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: Math.max(0, containerWidth - 56) }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className={`absolute left-1 top-1 bottom-1 w-12 lg:w-14 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_5px_20px_rgba(0,0,0,0.3)] z-20 transition-colors duration-300 ${
          isConfirmed ? `${activeColor} text-black` : 'bg-white text-black'
        }`}
      >
        {isConfirmed ? <Unlock size={20} /> : <Lock size={20} />}
      </motion.div>
    </div>
  );
}
