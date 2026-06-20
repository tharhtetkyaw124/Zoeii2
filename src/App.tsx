import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Music, Play, Pause, Volume2, Mail, Lock, 
  MapPin, Calendar, Clock, Edit3, Image as ImageIcon, 
  Gift, Ticket, Sparkles, Youtube, Check, X, Shield, LockOpen, Gamepad2
} from 'lucide-react';

const START_DATE = new Date('2026-03-22T00:00:00').getTime();

// --- 1. Global Components ---

function FloatingHearts() {
  const [hearts, setHearts] = useState<{id: number, left: string, size: number, duration: number, delay: number}[]>([]);
  
  useEffect(() => {
    setHearts(Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${(Math.random() * 100).toFixed(2)}%`,
      size: Math.random() * 12 + 10,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 10,
    })));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map(h => (
        <motion.div
          key={h.id}
          className="absolute text-rose-300 opacity-40 select-none"
          style={{ left: h.left, fontSize: h.size, bottom: '-50px' }}
          animate={{
            y: ['0vh', '-110vh'],
            x: ['-20px', '20px', '-20px', '20px']
          }}
          transition={{
            y: { duration: h.duration, repeat: Infinity, ease: "linear", delay: h.delay },
            x: { duration: h.duration / 4, repeat: Infinity, ease: "easeInOut", delay: h.delay }
          }}
        >
          ♥
        </motion.div>
      ))}
    </div>
  );
}

const TimeUnit = ({ val, label }: { val: number, label: string }) => (
  <div className="flex flex-col items-center mx-1 sm:mx-2 min-w-[50px]">
    <div className="bg-white/80 backdrop-blur shadow-sm text-rose-600 font-mono font-bold text-lg sm:text-2xl px-2 py-1 rounded w-full text-center tabular-nums overflow-hidden relative h-[36px] sm:h-[42px] flex items-center justify-center border border-rose-100">
      <AnimatePresence>
        <motion.span
          key={val}
          className="absolute"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -15, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {val.toString().padStart(2, '0')}
        </motion.span>
      </AnimatePresence>
    </div>
    <span className="text-[10px] sm:text-xs text-rose-500 mt-1 uppercase tracking-wider font-semibold">{label}</span>
  </div>
);

function DayCounter() {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, Date.now() - START_DATE);
      setTime({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60)
      });
    };
    calc();
    const int = setInterval(calc, 1000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-white/60 backdrop-blur-md px-4 py-2 sm:px-6 sm:py-3 rounded-full border border-rose-100/50 shadow-md shadow-rose-100/30 flex items-center gap-1 sm:gap-2">
       <TimeUnit val={time.d} label="Days" />
       <span className="text-xl font-bold text-rose-300 pb-4">:</span>
       <TimeUnit val={time.h} label="Hrs" />
       <span className="text-xl font-bold text-rose-300 pb-4">:</span>
       <TimeUnit val={time.m} label="Min" />
       <span className="text-xl font-bold text-rose-300 pb-4">:</span>
       <TimeUnit val={time.s} label="Sec" />
    </div>
  );
}

function AudioPill() {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const [expanded, setExpanded] = useState(false);
  
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscRef = useRef<OscillatorNode[]>([]);

  const stop = () => {
    oscRef.current.forEach(o => { try{o.stop(); o.disconnect()}catch(e){} });
    oscRef.current = [];
    setPlaying(false);
  };

  const start = () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();

    gainRef.current = ctxRef.current.createGain();
    gainRef.current.gain.value = volume;
    gainRef.current.connect(ctxRef.current.destination);

    // Ethereal ambient chord: C E G
    [261.63, 329.63, 392.00].forEach((f, i) => {
      const osc = ctxRef.current!.createOscillator();
      osc.type = i === 1 ? 'triangle' : 'sine';
      osc.frequency.value = f + Math.random(); 
      const g = ctxRef.current!.createGain();
      g.gain.value = 0.15;
      osc.connect(g);
      g.connect(gainRef.current!);
      osc.start();
      oscRef.current.push(osc);
    });
    setPlaying(true);
  };

  const toggle = () => (playing ? stop() : start());

  useEffect(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.setTargetAtTime(volume, ctxRef.current.currentTime, 0.1);
    }
  }, [volume]);

  return (
    <motion.div 
      className="fixed bottom-24 right-4 z-40 bg-white shadow-xl shadow-rose-200/50 rounded-full border border-rose-100 flex items-center overflow-hidden"
      animate={{ width: expanded ? 160 : 48 }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <button 
        onClick={toggle}
        className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-rose-600 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors relative"
      >
        {playing ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
        {playing && <span className="absolute inset-0 rounded-full border border-rose-400 animate-ping opacity-30 pointer-events-none" />}
      </button>

      <div className="flex-1 px-3 flex items-center gap-2 overflow-hidden h-full">
         <Volume2 size={16} className="text-rose-400 flex-shrink-0" />
         <input 
           type="range" 
           min="0" max="0.5" step="0.01" 
           value={volume}
           onChange={e => setVolume(parseFloat(e.target.value))}
           className="w-16 accent-rose-500"
         />
      </div>
    </motion.div>
  );
}

// --- 2. Screen Components ---

function EnvelopeScreen({ onOpen }: { onOpen: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'opening' | 'letter'>('idle');
  const [skipped, setSkipped] = useState(false);
  
  const text = `Zoeii,

There are a thousand ways I could try to tell you
how much you mean to me — but words always feel
too small for something this enormous.

You are the reason my days feel warmer,
my laughter comes easier, and my heart
feels impossibly full.

Every memory we've made together is a treasure
I carry with me everywhere I go.

This little world I built — it's yours.
All of it. Always.

With every heartbeat, yours truly ♥`;

  const Paragraphs = text.split('\n\n');
  const [pIndex, setPIndex] = useState(0);
  const [cIndex, setCIndex] = useState(0);

  useEffect(() => {
    if (phase !== 'letter') return;
    if (pIndex >= Paragraphs.length) return;
    
    if (cIndex < Paragraphs[pIndex].length) {
      const t = setTimeout(() => setCIndex(cIndex + 1), 35);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setPIndex(pIndex + 1);
        setCIndex(0);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [cIndex, pIndex, phase]);

  const handleSVGClick = () => {
    if (phase === 'idle') setPhase('opening');
  };

  useEffect(() => {
    if (phase === 'opening') {
      const t = setTimeout(() => setPhase('letter'), 1200);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div className="w-full h-[60vh] flex items-center justify-center relative">
      <AnimatePresence>
        {(phase === 'idle' || phase === 'opening') && (
          <motion.div 
            className="cursor-pointer absolute"
            animate={phase === 'idle' ? { y: [-15, 15, -15] } : { scale: 0.9, opacity: 0 }}
            transition={phase === 'idle' ? { y: { duration: 3, repeat: Infinity, ease: 'easeInOut' } } : { duration: 0.8 }}
            onClick={handleSVGClick}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="relative w-64 h-48 drop-shadow-2xl">
              {/* Back flap */}
              <div className="absolute inset-0 bg-white rounded-lg border-2 border-rose-200" />
              {/* Card creeping out */}
              <motion.div 
                className="absolute inset-x-2 top-2 h-44 bg-rose-50 rounded shadow flex items-start justify-center pt-4"
                animate={phase === 'opening' ? { y: -80 } : {}}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                 <Heart className="text-rose-400" size={32} />
              </motion.div>
              {/* Front panels */}
              <svg width="256" height="192" viewBox="0 0 256 192" className="absolute inset-0 pointer-events-none">
                <path d="M0 192 L128 92 L256 192" fill="#fff5f7" stroke="#fda4af" strokeWidth="4" />
                <path d="M0 0 L128 92 L0 192" fill="#fff" stroke="#fda4af" strokeWidth="2" />
                <path d="M256 0 L128 92 L256 192" fill="#fff" stroke="#fda4af" strokeWidth="2" />
                {/* Top Flap */}
                <motion.path 
                  d="M0 0 L128 100 L256 0" 
                  fill="#ffe4e6" stroke="#fda4af" strokeWidth="4"
                  animate={phase === 'opening' ? { d: "M0 0 L128 -80 L256 0" } : {}}
                  transition={{ duration: 0.5 }}
                />
              </svg>
            </div>
            {phase === 'idle' && (
              <motion.div 
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-rose-500 font-bold bg-white/80 px-4 py-1 rounded-full shadow-sm text-sm"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Tap to open
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'letter' && (
        <motion.div 
          className="w-full max-w-lg bg-white p-8 sm:p-12 rounded-xl shadow-xl border border-rose-100 relative bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
           {pIndex < Paragraphs.length && (
             <button 
               onClick={() => { setSkipped(true); setPIndex(Paragraphs.length); setCIndex(0); }}
               className="absolute top-4 right-4 text-xs font-bold text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-full transition-colors"
             >
               Skip
             </button>
           )}
           <div className="font-serif text-lg text-rose-900 leading-loose space-y-4">
             {Paragraphs.slice(0, pIndex).map((p, i) => <p key={i}>{p}</p>)}
             {pIndex < Paragraphs.length && (
               <p>
                 {Paragraphs[pIndex].substring(0, cIndex)}
                 <motion.span animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}>|</motion.span>
               </p>
             )}
           </div>
           
           <AnimatePresence>
             {pIndex >= Paragraphs.length && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: skipped ? 0 : 1 }}
                 className="mt-12 flex flex-col items-center"
               >
                 <Heart className="text-rose-500 fill-rose-500 mb-6" size={32} />
                 <button 
                   onClick={onOpen}
                   className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-8 rounded-full shadow-md shadow-rose-200 transition-transform active:scale-95"
                 >
                   Enter Our Space
                 </button>
               </motion.div>
             )}
           </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function MemoryTimeline() {
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const p = canvas.parentElement;
    if(!p) return;
    canvas.width = p.clientWidth;
    canvas.height = p.clientHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw pretty mask
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#f9a8d4'); 
    grad.addColorStop(0.5, '#fb7185'); 
    grad.addColorStop(1, '#fda4af');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch to Reveal ✨', canvas.width/2, canvas.height/2);
  }, []);

  const handleScratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (scratchRevealed || e.buttons !== 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fill();

    // Check transparency ratio
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    let clear = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 128) clear++;
    }
    if (clear / (data.length / 4) > 0.6) {
      setScratchRevealed(true);
    }
  };

  const Card = ({ date, title, text, special, imgUrl }: { date: string, title: string, text: string, special?: boolean, imgUrl?: string }) => (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="bg-white p-5 rounded-2xl shadow-sm border border-rose-100 flex flex-col items-center w-full max-w-sm mx-auto mb-10 relative z-10"
    >
      <div className="absolute -top-4 bg-rose-50 border border-rose-200 text-rose-600 font-bold px-4 py-1 rounded-full text-sm shadow-sm">{date}</div>
      <div className={`w-full relative h-48 rounded-xl overflow-hidden bg-rose-50 border-2 ${imgUrl ? 'border-solid' : 'border-dashed'} border-rose-200 flex items-center justify-center mt-2 mb-4`}>
        {special ? (
           <>
             <div className="absolute inset-0 bg-white flex flex-col items-center justify-center overflow-hidden">
                <img src="https://res.cloudinary.com/deeygdbqi/image/upload/v1779295096/photo_6084756567581463141_y_mjr7cj.jpg" alt="Surprise memory" className="w-full h-full object-cover" />
             </div>
             {!scratchRevealed && (
               <canvas 
                 ref={canvasRef}
                 className="absolute inset-0 touch-none cursor-crosshair"
                 onPointerMove={handleScratch}
               />
             )}
             <AnimatePresence>
                {scratchRevealed && (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: [1, 1.2, 0], opacity: [1, 0] }}
                    className="absolute inset-0 flex items-center justify-center text-4xl pointer-events-none"
                  >
                    ✨🎉✨
                  </motion.div>
                )}
             </AnimatePresence>
           </>
        ) : imgUrl ? (
          <img src={imgUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-rose-400 flex flex-col items-center font-medium">
             <ImageIcon className="mb-2" /> Add photo here ♥
          </div>
        )}
      </div>
      <h3 className="font-bold text-rose-900 text-xl w-full text-center mb-2">{title}</h3>
      <p className="text-rose-700 text-sm w-full text-center leading-relaxed">{text}</p>
    </motion.div>
  );

  return (
    <div className="relative py-12 px-4 w-full max-w-lg mx-auto">
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-rose-200 via-rose-300 to-rose-200 opacity-50 rounded-full" />
      <Card date="Mar 22, 2026" title="The Beginning" text="The day everything changed for the better. A simple hello that became my forever." imgUrl="https://res.cloudinary.com/deeygdbqi/image/upload/v1779294551/photo_6084756567581463139_y_cgcpwc.jpg" />
      <Card date="Our First Date" title="When Time Stood Still" text="Two souls meeting, sharing a moment that sparked a beautiful eternity. The sweetest beginning I could ever ask for." imgUrl="https://res.cloudinary.com/deeygdbqi/image/upload/v1781630240/photo_6165883242762931763_y_qxnhxr.jpg" />
      <Card date="Apr 10, 2026" title="Secret Surprise" text="Scratch off the card above to reveal one of our favorite memories." special />
      <Card date="Present Day" title="Still Going Strong" text="Every day I find new reasons to love you more. Let's keep adding to this timeline." imgUrl="https://res.cloudinary.com/deeygdbqi/image/upload/v1779294551/photo_6084756567581463139_y_cgcpwc.jpg" />
    </div>
  );
}

function LoveCoupons() {
  const [coupons, setCoupons] = useState([
    { id: 1, title: 'Blanket Fort', emoji: '🏕️', terms: 'Requires immediate construction of a cozy fort.', redeemed: false },
    { id: 2, title: 'Full Massage', emoji: '💆‍♀️', terms: 'Valid for 1 uninterrupted 30-min session of pure relaxation.', redeemed: false },
    { id: 3, title: 'Movie Night', emoji: '🍿', terms: 'You get ultimate executive control over the movie choice.', redeemed: false },
    { id: 4, title: 'Free Dessert', emoji: '🍰', terms: 'I will buy or bake your favorite dessert, no questions asked.', redeemed: false },
    { id: 5, title: 'Win an Argument', emoji: '🏳️', terms: 'Instant winner, no matter the topic. Use wisely!', redeemed: false },
    { id: 6, title: 'Big Bear Hug', emoji: '🐻', terms: 'Redeemable anytime, anywhere, for minimum 5 minutes.', redeemed: false },
  ]);

  const redeem = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setCoupons(c => c.map(x => x.id === id ? { ...x, redeemed: true } : x));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl mx-auto pb-12 relative z-10 px-4">
      {coupons.map((c) => (
        <CouponCard key={c.id} data={c} onRedeem={(e) => redeem(c.id, e)} />
      ))}
    </div>
  );
}

function CouponCard({ data, onRedeem }: { data: any, onRedeem: (e: any) => void }) {
  const [flipped, setFlipped] = useState(false);
  
  return (
    <div className="w-full aspect-[2.2/1] perspective-[1000px]">
      <motion.div
        className="w-full h-full relative cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        onClick={() => !data.redeemed && setFlipped(!flipped)}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 w-full h-full bg-white border-2 border-rose-200 rounded-xl shadow-[0_4px_14px_0_rgba(253,164,175,0.39)] flex flex-col items-center justify-center transition-all"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-rose-50 border-r-2 border-rose-200" />
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-rose-50 border-l-2 border-rose-200" />
          <div className="absolute inset-x-8 top-1/2 h-[2px] border-t-2 border-dashed border-rose-100 -translate-y-1/2" />
          
          <div className={`flex flex-col items-center z-10 bg-white px-6 w-full text-center ${data.redeemed ? 'opacity-40 grayscale' : ''}`}>
             <span className="text-4xl mb-2">{data.emoji}</span>
             <h3 className="font-bold text-rose-800 text-lg uppercase tracking-wider">{data.title}</h3>
          </div>
          {data.redeemed && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
               <span className="border-4 border-rose-500 text-rose-500 text-2xl font-black rounded-lg px-4 py-1 rotate-12 bg-white/80">REDEEMED ✓</span>
            </div>
          )}
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 w-full h-full bg-rose-50 border-2 border-rose-300 rounded-xl shadow-md flex flex-col items-center justify-center p-6 text-center"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
           <p className="text-sm font-medium text-rose-700 italic flex-grow flex items-center mb-4">"{data.terms}"</p>
           {!data.redeemed && (
             <button 
               onClick={onRedeem}
               className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-6 rounded-full shadow-md transition-transform active:scale-95 text-sm uppercase tracking-wide"
             >
               Redeem Coupon
             </button>
           )}
        </div>
      </motion.div>
    </div>
  );
}

function Mixtape() {
  // Hardcoded YouTube IDs
  const videos = ['lY5V4hSLWY8', 'CwGbMYLjIpQ', 'Ip6cw8gfHHI', 'xGPeNN9S0Fg', 'TbLT12eg-lw', 'YuH_90giGTQ', '3eT464L1YRA'];

  return (
    <div className="w-full max-w-3xl mx-auto relative z-10 px-4">
       <div className="text-center mb-8">
          <h2 className="font-serif text-3xl text-rose-900 font-bold mb-3 drop-shadow-sm flex items-center justify-center">
            <Music className="mr-3 text-rose-500" /> Our Soundtrack
          </h2>
          <p className="text-rose-700 max-w-lg mx-auto leading-relaxed">
            These are the memorial songs that paint the picture of our beautiful journey. 
            Every note reminds me of a special moment we've shared.
          </p>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map(id => (
            <motion.div key={id} initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="bg-white p-2 rounded-2xl shadow-sm border border-rose-100">
               <iframe 
                 className="w-full aspect-video rounded-xl bg-gray-100"
                 src={`https://www.youtube-nocookie.com/embed/${id}`}
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
               />
            </motion.div>
          ))}
       </div>
    </div>
  );
}

function DateNight({ onOpenChange }: { onOpenChange?: (isOpen: boolean) => void }) {
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [fireworks, setFireworks] = useState<{id:number, x:number, y:number, c:string}[]>([]);

  useEffect(() => {
    onOpenChange?.(isBoxOpen);
  }, [isBoxOpen, onOpenChange]);

  useEffect(() => {
    if(!isBoxOpen) return;
    const int = setInterval(() => {
       setFireworks(prev => [
         ...prev.slice(-4), 
         { id: Date.now(), x: Math.random() * 80 + 10, y: Math.random() * 50 + 10, c: ['#f43f5e', '#fbbf24', '#a78bfa', '#38bdf8', '#fb7185'][Math.floor(Math.random()*5)] }
       ]);
    }, 1200);
    return () => clearInterval(int);
  }, [isBoxOpen]);

  return (
    <div className="w-full h-[60vh] flex items-center justify-center relative z-10 px-4">
       {!isBoxOpen && (
         <motion.div 
           className="cursor-pointer flex flex-col items-center group"
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={() => setIsBoxOpen(true)}
         >
           <div className="w-32 h-32 bg-rose-100 rounded-3xl flex items-center justify-center shadow-lg border border-rose-200 group-hover:shadow-rose-300 transition-all duration-500 mb-6 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
             <Gift size={64} className="text-rose-500 drop-shadow-md animate-pulse" />
             <Sparkles size={24} className="text-amber-400 absolute top-4 right-4" />
           </div>
           <h2 className="text-2xl font-serif text-rose-900 drop-shadow-sm font-bold text-center">Click to unveil our private dream oasis...</h2>
         </motion.div>
       )}

       <AnimatePresence>
         {isBoxOpen && (
           <motion.div 
             initial={{ clipPath: 'circle(0% at center)' }}
             animate={{ clipPath: 'circle(150% at center)' }}
             exit={{ opacity: 0 }}
             transition={{ duration: 1.2, ease: "easeInOut" }}
             className="fixed inset-0 z-[100] bg-[#0B0F19] overflow-hidden flex flex-col items-center justify-end"
           >
             {/* Stars */}
             <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
             
             {/* Moon */}
             <motion.div initial={{ y: -50, opacity: 0}} animate={{y:0, opacity:1}} transition={{delay:1}} className="absolute top-16 left-1/2 -translate-x-1/2 sm:top-24 sm:left-1/4 w-32 h-32 rounded-full bg-amber-100/90 shadow-[0_0_80px_rgba(253,230,138,0.3)]" />

             {/* Fireworks */}
             {fireworks.map(fw => (
                <div key={fw.id} className="absolute pointer-events-none z-10" style={{ left: `${fw.x}%`, top: `${fw.y}%` }}>
                  {Array.from({length: 12}).map((_, i) => (
                     <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{ backgroundColor: fw.c, boxShadow: `0 0 10px ${fw.c}` }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                        animate={{ 
                          x: Math.cos(i * 30 * Math.PI / 180) * (Math.random() * 50 + 80), 
                          y: Math.sin(i * 30 * Math.PI / 180) * (Math.random() * 50 + 80) + 40,
                          opacity: 0, scale: 1.5
                        }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                     />
                  ))}
                </div>
             ))}

             {/* Couple Scene */}
             <motion.div initial={{ y: 200 }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.5, type: 'spring' }} className="relative z-30 w-full max-w-4xl flex justify-center pb-[10vh]">
                <div className="text-[120px] sm:text-[180px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                  👩‍❤️‍👨
                </div>
                {/* Flowers cluster - Increased z-index to be extremely visible */}
                <div className="absolute bottom-10 sm:bottom-0 text-5xl sm:text-6xl flex justify-between w-full max-w-xl left-1/2 -translate-x-1/2 opacity-100 drop-shadow-2xl z-[60]">
                  <span>🌹🌺</span><span>🌸🌷</span><span>🌺🥀</span>
                </div>
             </motion.div>
             
             {/* Hills */}
             <motion.svg initial={{y:100}} animate={{y:0}} transition={{duration:1}} width="100%" height="200" viewBox="0 0 1440 200" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[30vh] min-h-[200px] z-20">
               <path fill="#0f172a" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
             </motion.svg>

             <button onClick={() => setIsBoxOpen(false)} className="absolute top-6 right-6 z-[110] bg-white/10 hover:bg-white/20 backdrop-blur p-3 rounded-full text-white transition-colors">
                <X size={24} />
             </button>
          </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}

function DinnerProposal() {
  const [details, setDetails] = useState({
    loc: 'Koori',
    date: 'June 21, 2026',
    time: '5:00 PM',
    map: 'https://maps.google.com/maps?q=Koori&output=embed',
    mapLink: 'https://maps.app.goo.gl/cR8e53MXf1jSNaQa6'
  });
  
  const [adminMode, setAdminMode] = useState(false);
  const [lockOpen, setLockOpen] = useState(false);
  const [pin, setPin] = useState('');
  
  const [rsvp, setRsvp] = useState('pending');
  const [noPos, setNoPos] = useState({x: 0, y: 0});

  const dodge = (e: any) => {
    e.preventDefault();
    const mag = Math.random() * 60 + 100; 
    const ang = Math.random() * Math.PI * 2;
    setNoPos({ x: Math.cos(ang) * mag, y: (Math.abs(Math.sin(ang)) * mag * -1) });
  };

  if (adminMode) {
    if (!lockOpen) {
      return (
        <div className="w-full max-w-sm mx-auto bg-white p-6 rounded-2xl shadow border border-rose-100 flex flex-col items-center relative z-10 px-4">
           <Lock size={40} className="text-rose-400 mb-4" />
           <h3 className="text-xl font-bold text-rose-900 mb-4">Admin Access</h3>
           <input type="password" value={pin} onChange={e => {
             setPin(e.target.value);
             if (e.target.value === '1234') { setLockOpen(true); setPin(''); }
           }} placeholder="Enter PIN (1234)" className="w-full px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-center font-mono tracking-[0.5em] focus:outline-rose-400 outline-none mb-4" />
           <button onClick={() => setAdminMode(false)} className="text-rose-400 text-sm font-medium">Cancel</button>
        </div>
      );
    }
    return (
      <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl shadow-xl border border-rose-200 relative z-10 px-4">
         <h2 className="text-2xl font-bold text-rose-900 mb-6 flex items-center"><Edit3 className="mr-2"/> Configuration</h2>
         <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-rose-700 mb-1 flex items-center"><MapPin size={16} className="mr-1"/> Location</label>
              <input type="text" value={details.loc} onChange={e=>setDetails({...details, loc: e.target.value})} className="w-full p-2 border rounded bg-rose-50 border-rose-200 outline-none focus:border-rose-400"/>
            </div>
            <div>
              <label className="block text-sm font-bold text-rose-700 mb-1 flex items-center"><Calendar size={16} className="mr-1"/> Date</label>
              <input type="text" value={details.date} onChange={e=>setDetails({...details, date: e.target.value})} className="w-full p-2 border rounded bg-rose-50 border-rose-200 outline-none focus:border-rose-400"/>
            </div>
            <div>
              <label className="block text-sm font-bold text-rose-700 mb-1 flex items-center"><Clock size={16} className="mr-1"/> Time</label>
              <input type="text" value={details.time} onChange={e=>setDetails({...details, time: e.target.value})} className="w-full p-2 border rounded bg-rose-50 border-rose-200 outline-none focus:border-rose-400"/>
            </div>
            <div>
              <label className="block text-sm font-bold text-rose-700 mb-1">Google Maps Embed URL</label>
              <textarea value={details.map} onChange={e=>setDetails({...details, map: e.target.value})} className="w-full p-2 border rounded bg-rose-50 border-rose-200 outline-none text-xs break-all h-24 focus:border-rose-400"/>
            </div>
         </div>
         <button onClick={() => { setAdminMode(false); setLockOpen(false); }} className="w-full mt-6 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors active:scale-95">Save & Close</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-auto mx-auto relative z-10 px-4 pb-12 w-full max-w-lg">
      {rsvp === 'yes' && (
         <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden flex flex-col">
            {Array.from({length: 80}).map((_, i) => (
               <motion.div key={i} className="absolute text-rose-500 text-3xl sm:text-5xl shadow-rose-200 drop-shadow-lg"
                 initial={{ top: '-10%', left: `${Math.random()*100}%`, rotate: 0 }}
                 animate={{ top: '110%', rotate: Math.random()*360 }}
                 transition={{ duration: Math.random()*3+2, ease: "linear", repeat: Infinity, delay: Math.random()*2 }}
               >{i%3===0 ? '🌸' : i%2===0 ? '💕' : '♥'}</motion.div>
            ))}
         </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl shadow-rose-100 border border-rose-200 overflow-hidden">
        <div className="bg-rose-500 p-6 text-center text-white relative overflow-hidden">
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/floral-flourishes.png')]" />
           <h2 className="text-3xl font-serif italic mb-1 uppercase tracking-wider relative z-10">Date Night</h2>
           <p className="opacity-90 font-medium relative z-10">I'd love to take you out.</p>
        </div>
        
        <div className="p-6 sm:p-8 space-y-6 bg-white shrink-0 relative">
          <div className="flex items-center text-rose-900 bg-rose-50 p-4 rounded-xl border border-rose-100">
             <MapPin className="text-rose-500 mr-4 shrink-0" size={28}/>
             <div>
               <a href={details.mapLink} target="_blank" rel="noopener noreferrer" className="font-bold text-lg leading-tight hover:underline text-rose-900">{details.loc}</a>
             </div>
          </div>
          <div className="flex items-center text-rose-900 bg-rose-50 p-4 rounded-xl border border-rose-100">
             <Calendar className="text-rose-500 mr-4 shrink-0" size={28}/>
             <div>
               <p className="font-bold text-lg leading-tight">{details.date}</p>
             </div>
          </div>
          <div className="flex items-center text-rose-900 bg-rose-50 p-4 rounded-xl border border-rose-100">
             <Clock className="text-rose-500 mr-4 shrink-0" size={28}/>
             <div>
               <p className="font-bold text-lg leading-tight">{details.time}</p>
             </div>
          </div>

          <div className="w-full h-48 bg-rose-100 rounded-xl overflow-hidden border-2 border-rose-200 shadow-inner">
             {details.map ? (
               <iframe className="w-full h-full border-0" src={details.map} allowFullScreen loading="lazy" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-rose-400 font-bold">Map Preview</div>
             )}
          </div>
        </div>

        <div className="p-8 pt-4 bg-rose-50/50 flex flex-col items-center border-t border-rose-100 shrink-0">
           {rsvp === 'pending' ? (
             <div className="relative w-full h-[120px] flex justify-center items-center gap-6 mt-2">
                 <button onClick={() => setRsvp('yes')} className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-rose-200 transition-transform active:scale-95 z-20 text-lg flex items-center">
                   Yes! <Heart className="ml-2 fill-current" size={20} />
                 </button>

                 <motion.button 
                   animate={{ x: noPos.x, y: noPos.y }}
                   transition={{ type: "spring", stiffness: 300, damping: 20 }}
                   onPointerEnter={dodge}
                   onPointerDown={dodge}
                   className="relative bg-white text-rose-400 border border-rose-200 font-bold py-3 px-8 rounded-full shadow-sm z-30 touch-none flex-shrink-0"
                 >
                   No, thanks
                 </motion.button>
             </div>
           ) : (
             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-rose-600 font-black text-3xl italic my-6 flex flex-col items-center drop-shadow-sm">
                <Heart size={48} className="fill-rose-500 mb-2 animate-pulse" />
                She Said Yes!
             </motion.div>
           )}
        </div>
      </div>
      
      <div className="flex justify-center mt-6">
         <button onClick={() => setAdminMode(true)} className="text-rose-400/60 hover:text-rose-500 text-xs font-medium flex items-center transition-colors">
            <LockOpen size={12} className="mr-1" /> manage details
         </button>
      </div>
    </div>
  );
}

const MOCK_PHOTOS = [
  { id: 1, url: 'https://res.cloudinary.com/deeygdbqi/image/upload/v1780505349/photo_6125239838391866636_y_trpyvn.jpg', note: 'Our beautiful moment ❤️', date: 'Apr 5, 2026', loc: 'The Corner Cafe', rot: 'rotate-1' },
  { id: 2, url: 'https://res.cloudinary.com/deeygdbqi/image/upload/v1780505350/photo_6125239838391866635_y_oskqkf.jpg', note: 'Our beautiful moment ❤️', date: 'May 14, 2026', loc: 'Le Petit Charm', rot: '-rotate-1' },
  { id: 3, url: 'https://res.cloudinary.com/deeygdbqi/image/upload/v1779294551/photo_6084756567581463139_y_cgcpwc.jpg', note: 'Our beautiful moment ❤️', date: 'Jun 2, 2026', loc: 'With You', rot: '-rotate-2' },
  { id: 4, url: 'https://res.cloudinary.com/deeygdbqi/image/upload/v1781630240/photo_6165883242762931764_y_xe6qqb.jpg', note: 'Our first date and the first of many flowers ✨', date: 'Jun 12, 2026', loc: 'With You', rot: 'rotate-2' },
];

function PhotoAlbum({ onOpenChange }: { onOpenChange?: (isOpen: boolean) => void }) {
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [shake, setShake] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  useEffect(() => {
    onOpenChange?.(!!selectedPhoto);
  }, [selectedPhoto, onOpenChange]);

  const handleKeyPress = (num: number) => {
    if (passcode.length < 4) {
      const newPass = passcode + num;
      setPasscode(newPass);
      
      if (newPass.length === 4) {
        if (newPass === '2502') {
          setTimeout(() => setUnlocked(true), 400);
        } else {
          setShake(true);
          setTimeout(() => {
            setPasscode('');
            setShake(false);
          }, 600);
        }
      }
    }
  };

  if (!unlocked) {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col items-center relative z-10 px-4 pt-10">
        <motion.div animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }} className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-rose-100 flex flex-col items-center w-full">
           <Lock size={40} className="text-rose-400 mb-4 drop-shadow-sm" />
           <h2 className="text-2xl font-serif font-bold text-rose-900 mb-2">Secret Album</h2>
           <p className="text-rose-500 text-sm mb-8 text-center max-w-[200px]">Enter the passcode to enter our memories (Hint: THK's BD)</p>
           
           <div className="flex gap-4 mb-8">
             {[0, 1, 2, 3].map(i => (
               <motion.div key={i} animate={passcode.length > i ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }} className="w-6 h-6 flex items-center justify-center">
                 <Heart size={24} className={`transition-colors duration-300 ${passcode.length > i ? "fill-rose-500 text-rose-500" : "text-rose-200"}`} />
               </motion.div>
             ))}
           </div>
           
           <div className="relative w-full mb-6">
             {shake && <p className="absolute -top-10 left-0 right-0 text-xs font-bold text-red-500 text-center uppercase tracking-wider">Wrong passcode</p>}
           </div>
           
           <div className="grid grid-cols-3 gap-3 w-full max-w-[220px]">
             {[1,2,3,4,5,6,7,8,9].map(num => (
               <button key={num} onClick={() => handleKeyPress(num)} className="w-full aspect-square rounded-full flex items-center justify-center text-2xl font-medium text-rose-800 bg-rose-50/80 hover:bg-rose-100 active:bg-rose-200 active:scale-95 transition-all outline-none">
                 {num}
               </button>
             ))}
             <div />
             <button onClick={() => handleKeyPress(0)} className="w-full aspect-square rounded-full flex items-center justify-center text-2xl font-medium text-rose-800 bg-rose-50/80 hover:bg-rose-100 active:bg-rose-200 active:scale-95 transition-all outline-none">
               0
             </button>
             <button onClick={() => setPasscode('')} className="w-full aspect-square rounded-full flex items-center justify-center text-sm font-bold text-rose-400 hover:text-rose-600 active:scale-95 transition-all outline-none">
               CLR
             </button>
           </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto relative z-10 px-4 pb-20">
      <div className="text-center mb-12">
         <h2 className="font-serif text-3xl sm:text-4xl text-rose-900 font-bold mb-4 drop-shadow-sm flex items-center justify-center">
           <ImageIcon className="mr-3 text-rose-500" size={32} /> Photo Album
         </h2>
         <p className="text-rose-700 font-medium max-w-lg mx-auto">A collection of our most cherished moments, kept safe just for us.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
         {MOCK_PHOTOS.map((photo, i) => (
           <motion.button
             key={photo.id}
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1, type: 'spring', damping: 20 }}
             onClick={() => setSelectedPhoto(photo)}
             className={`bg-[#fdfbf7] p-3 pb-12 sm:p-4 sm:pb-16 border border-stone-200 shadow-xl shadow-stone-300/30 rounded-sm hover:-translate-y-4 hover:rotate-0 hover:shadow-2xl hover:z-20 transition-all duration-300 ${photo.rot} flex flex-col group relative`}
           >
             <div className="relative w-full aspect-[4/5] overflow-hidden bg-stone-100 shadow-inner mb-4">
               <img src={photo.url} alt={photo.note} className="absolute inset-0 w-full h-full object-cover filter sepia-[0.15] contrast-[1.05] group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
             </div>
             <p className="font-serif italic text-stone-700 text-lg sm:text-xl text-center px-2 w-full truncate relative z-10">
               {photo.note}
             </p>
           </motion.button>
         ))}
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto"
          >
            <button onClick={() => setSelectedPhoto(null)} className="absolute top-6 right-6 z-[110] bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full text-white shadow-lg transition-all hover:scale-110 active:scale-95">
               <X size={24} />
            </button>
            <motion.div
              layoutId={`img-${selectedPhoto.id}`}
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="max-w-4xl w-full bg-[#fdfbf7] p-4 pb-20 sm:p-6 sm:pb-32 rounded-sm shadow-2xl relative"
            >
              <div className="w-full relative shadow-inner bg-stone-100 mb-6 sm:mb-8 overflow-hidden flex items-center justify-center max-h-[65vh]">
                <img src={selectedPhoto.url} alt={selectedPhoto.note} className="w-full h-full max-h-[65vh] object-contain filter sepia-[0.1] contrast-[1.05] block mx-auto" />
              </div>
              <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 px-8 sm:px-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                 <div>
                   <p className="font-serif italic text-3xl sm:text-4xl text-stone-800 font-medium tracking-tight leading-tight">{selectedPhoto.note}</p>
                   <p className="text-stone-500 text-sm sm:text-base font-medium mt-2 flex items-center tracking-wide uppercase">
                     <MapPin size={16} className="mr-1.5 text-stone-400" /> {selectedPhoto.loc}
                   </p>
                 </div>
                 <p className="font-mono text-stone-400 text-sm sm:text-base font-bold bg-stone-100 px-4 py-2 rounded-full border border-stone-200 shrink-0">
                   {selectedPhoto.date}
                 </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MemoryGame() {
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [popup, setPopup] = useState<string | null>(null);

  const CARDS_DATA = [
    { id: 1, symbol: '❤️', story: 'My heart beats only for you. I love you more than words can ever say.' },
    { id: 2, symbol: '⭐', story: 'You are the brightest star in my universe, illuminating everything around you.' },
    { id: 3, symbol: '☀️', story: 'You bring sunshine into my life. Your smile is my absolute favorite thing.' },
    { id: 4, symbol: '🌙', story: 'I love you to the moon and back. Thank you for being you.' },
    { id: 5, symbol: '✨', story: 'You make everything feel magical. Being with you is a dream come true.' },
    { id: 6, symbol: '🌸', story: 'You are the most beautiful person I know, inside and out.' },
  ];

  useEffect(() => {
    const deck = [...CARDS_DATA, ...CARDS_DATA]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ ...card, uid: index }));
    setCards(deck);
  }, []);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].id)) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const match = cards[newFlipped[0]].id === cards[newFlipped[1]].id;
      if (match) {
        setTimeout(() => {
          setMatched((prev) => [...prev, cards[newFlipped[0]].id]);
          setFlipped([]);
          setPopup(cards[newFlipped[0]].story);
        }, 500);
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative z-10 px-4 min-h-[70vh] flex flex-col items-center">
      <div className="text-center mb-8">
         <h2 className="text-3xl sm:text-4xl font-extrabold text-rose-800 mb-4 inline-block drop-shadow-sm font-serif">
           Our Memory Match
         </h2>
         <p className="text-rose-700 font-medium max-w-lg mx-auto">
           Flip the cards to match the symbols and uncover the stories behind them.
         </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-md mx-auto" style={{ perspective: 1000 }}>
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(card.id);
          return (
            <div
              key={card.uid}
              className="relative aspect-[3/4] w-full cursor-pointer transition-transform duration-500"
              style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              onClick={() => handleCardClick(index)}
            >
              <div className="absolute inset-0 w-full h-full bg-white/80 backdrop-blur-sm rounded-xl border border-rose-200 shadow-sm flex items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
                <Heart className="text-rose-300 w-8 h-8 opacity-50" />
              </div>
              <div className="absolute inset-0 w-full h-full bg-white rounded-xl border border-rose-100 shadow-md flex items-center justify-center text-4xl sm:text-5xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                {card.symbol}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/20 backdrop-blur-sm"
            onClick={() => setPopup(null)}
          >
            <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-sm w-full shadow-2xl border border-rose-100 relative text-center" onClick={(e) => e.stopPropagation()}>
              <Heart className="text-rose-500 w-12 h-12 mx-auto mb-4" />
              <p className="text-lg text-rose-800 font-medium leading-relaxed italic border-l-4 border-rose-300 pl-4 mb-6">
                "{popup}"
              </p>
              <button 
                onClick={() => setPopup(null)}
                className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-semibold py-2 px-6 rounded-full transition-colors w-full"
              >
                Keep Playing
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {matched.length === CARDS_DATA.length && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <p className="text-xl text-rose-600 font-bold mb-4">You matched all our memories! 💖</p>
          <button 
            onClick={() => {
              setMatched([]);
              setFlipped([]);
              const deck = [...CARDS_DATA, ...CARDS_DATA]
                .sort(() => Math.random() - 0.5)
                .map((card, index) => ({ ...card, uid: index }));
              setCards(deck);
            }}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-8 rounded-full shadow-md transition-colors"
          >
            Play Again
          </button>
        </motion.div>
      )}
    </div>
  );
}

// --- 3. Main Application Assembly ---

type ScreenType = 'letter' | 'timeline' | 'coupons' | 'mixtape' | 'magicbox' | 'dinner' | 'album' | 'games';

export default function CouplesApp() {
  const [screen, setScreen] = useState<ScreenType>('letter');
  const [unlocked, setUnlocked] = useState(false);
  const [hideNav, setHideNav] = useState(false);

  const navItems: { id: ScreenType, icon: any, label: string }[] = [
    { id: 'timeline', icon: Calendar, label: 'Memories' },
    { id: 'album', icon: ImageIcon, label: '📸 Photo Album' },
    { id: 'coupons', icon: Ticket, label: 'Coupons' },
    { id: 'mixtape', icon: Youtube, label: 'Mixtape' },
    { id: 'magicbox', icon: Sparkles, label: 'MagicBox' },
    { id: 'games', icon: Gamepad2, label: 'Games' },
    { id: 'dinner', icon: MapPin, label: 'RSVP' }
  ];

  return (
    <div className="min-h-screen bg-rose-50 bg-[url('https://www.transparenttextures.com/patterns/clean-textile.png')] text-rose-950 font-sans selection:bg-rose-200 selection:text-rose-900 overflow-x-hidden pt-36 pb-32 flex flex-col">
       <FloatingHearts />
       {unlocked && <DayCounter />}
       
       <main className="flex-grow w-full h-full flex flex-col">
          <AnimatePresence mode="wait">
             <motion.div 
               key={screen}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.4 }}
               className="flex-grow flex flex-col"
             >
                {screen === 'letter' && <EnvelopeScreen onOpen={() => { setUnlocked(true); setScreen('timeline'); }} />}
                {screen === 'timeline' && <MemoryTimeline />}
                {screen === 'album' && <PhotoAlbum onOpenChange={setHideNav} />}
                {screen === 'coupons' && <LoveCoupons />}
                {screen === 'mixtape' && <Mixtape />}
                {screen === 'magicbox' && <DateNight onOpenChange={setHideNav} />}
                {screen === 'games' && <MemoryGame />}
                {screen === 'dinner' && <DinnerProposal />}
             </motion.div>
          </AnimatePresence>
       </main>

       {unlocked && !hideNav && (
         <div className="fixed bottom-0 sm:bottom-4 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 z-40 bg-white/90 backdrop-blur-md sm:rounded-full border-t sm:border border-rose-100 shadow-[0_-4px_20px_0_rgba(253,164,175,0.2)] p-2 px-4 sm:px-6">
            <div className="flex items-center justify-between sm:gap-4 max-w-lg mx-auto w-full">
               {navItems.map(item => (
                 <button
                   key={item.id}
                   onClick={() => setScreen(item.id)}
                   className={`flex flex-col items-center p-2 rounded-xl sm:rounded-2xl transition-all duration-300 relative ${screen === item.id ? 'text-rose-600 scale-110' : 'text-rose-300 hover:text-rose-400'}`}
                 >
                   <item.icon size={24} className={screen === item.id ? 'fill-rose-50 stroke-rose-600 drop-shadow' : ''} />
                   <span className={`text-[10px] font-bold mt-1 tracking-wide uppercase transition-all duration-300 ${screen === item.id ? 'opacity-100' : 'opacity-0 h-0 scale-50'}`}>
                     {item.label}
                   </span>
                   {screen === item.id && (
                     <motion.div layoutId="navIndicator" className="absolute -bottom-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                   )}
                 </button>
               ))}
            </div>
         </div>
       )}
       
       {unlocked && !hideNav && <AudioPill />}
    </div>
  );
}
