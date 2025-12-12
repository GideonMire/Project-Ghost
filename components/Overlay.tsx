import React, { useState, useEffect } from 'react';
import { CAMERA_PATH } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface OverlayProps {
  currentStep: number;
}

// --- CSS GLITCH TITLE COMPONENT ---
const GlitchTitle = () => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const triggerGlitch = () => {
      setIsGlitching(true);
      
      // Glitch active duration (short burst)
      setTimeout(() => {
        setIsGlitching(false);
        
        // Schedule next glitch: Random time between 5s and 15s
        const nextDelay = Math.random() * 10000 + 5000;
        timeoutId = setTimeout(triggerGlitch, nextDelay);
      }, 300);
    };

    // Initial delay before first glitch
    timeoutId = setTimeout(triggerGlitch, 4000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="glitch-container relative z-50">
      <style>{`
        .glitch-wrapper {
          position: relative;
          display: inline-block;
        }

        .glitch {
          position: relative;
          color: white;
          font-weight: 700;
          font-size: 1.75rem; /* Mobile Size */
          letter-spacing: -0.05em;
          text-transform: uppercase;
        }
        
        @media (min-width: 768px) {
          .glitch { font-size: 4rem; } /* Desktop Size */
        }

        /* Pseudo-elements for the effect - Hidden by default */
        .glitch::before,
        .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
          opacity: 0;
          display: none; 
        }

        /* Active State: Show and Animate */
        .glitch-active::before,
        .glitch-active::after {
          opacity: 0.8;
          display: block;
        }

        .glitch-active::before {
          left: 2px;
          text-shadow: -2px 0 #ff00c1;
          clip-path: inset(44% 0 61% 0);
          animation: glitch-anim-1 0.3s infinite linear alternate-reverse;
        }

        .glitch-active::after {
          left: -2px;
          text-shadow: -2px 0 #00fff9;
          clip-path: inset(56% 0 23% 0);
          animation: glitch-anim-2 0.3s infinite linear alternate-reverse;
        }

        @keyframes glitch-anim-1 {
          0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); }
          20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
          40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, 2px); }
          60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
          80% { clip-path: inset(10% 0 70% 0); transform: translate(-1px, 1px); }
          100% { clip-path: inset(50% 0 20% 0); transform: translate(1px, -1px); }
        }

        @keyframes glitch-anim-2 {
          0% { clip-path: inset(25% 0 55% 0); transform: translate(2px, -1px); }
          20% { clip-path: inset(65% 0 15% 0); transform: translate(-2px, 1px); }
          40% { clip-path: inset(15% 0 85% 0); transform: translate(2px, 0); }
          60% { clip-path: inset(55% 0 25% 0); transform: translate(-2px, 0); }
          80% { clip-path: inset(35% 0 45% 0); transform: translate(1px, -1px); }
          100% { clip-path: inset(85% 0 5% 0); transform: translate(-1px, 1px); }
        }
      `}</style>
      
      <div className="glitch-wrapper">
         <h1 
            className={`glitch mix-blend-difference ${isGlitching ? 'glitch-active' : ''}`} 
            data-text="PROJECT GHOST"
         >
            PROJECT GHOST
         </h1>
      </div>
      <div className="h-1 w-16 md:w-24 bg-white mt-1 md:mt-2"></div>
    </div>
  );
};

export const Overlay: React.FC<OverlayProps> = ({ currentStep }) => {
  const info = CAMERA_PATH[currentStep] || CAMERA_PATH[0];

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 md:p-16 overflow-hidden">
      
      {/* Top Bar */}
      <header className="flex justify-between items-start shrink-0">
        <GlitchTitle />
        <div className="text-right hidden md:block opacity-50">
          <p className="text-xs tracking-[0.3em]">CINEMATIC SEQUENCE</p>
          <p className="text-xs font-mono">SCROLL TO INTERACT</p>
        </div>
      </header>

      {/* Main Content Area - Expands to fill space */}
      <div className="flex-1 flex flex-col w-full max-w-4xl relative">
        
        {/* CENTER: Title & Subtitle (Vertically Centered in remaining space) */}
        <div className="flex-1 flex flex-col justify-center items-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={`title-${currentStep}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-2 md:space-y-4"
            >
              {/* Title - Responsive Text Sizes */}
              <h2 
                className="text-4xl sm:text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 uppercase leading-[0.9]"
                style={{ 
                  fontFamily: '"Arial Narrow", Arial, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                {info.text}
              </h2>
              
              {/* Subtitle */}
              <div className="flex items-center gap-2 md:gap-4">
                 <div className="h-px w-8 md:w-12 bg-green-500"></div>
                 <p 
                   className="text-sm md:text-xl text-green-400 uppercase"
                   style={{ 
                     fontFamily: '"Arial Narrow", Arial, sans-serif',
                     fontWeight: 500,
                     letterSpacing: '0.03em'
                   }}
                 >
                   {info.subtext}
                 </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* BOTTOM OF CONTENT AREA: Description */}
        <div className="mt-auto mb-16 md:mb-20"> 
          <AnimatePresence mode="wait">
             <motion.div
                key={`desc-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, delay: 0.2 }} // Slight delay for elegance
             >
                {info.description && (
                   <p 
                     className="text-xs md:text-base text-white/70 max-w-[85%] md:max-w-lg border-l border-white/20 pl-3 md:pl-4 py-1"
                     style={{ 
                       fontFamily: '"Trebuchet MS", Verdana, sans-serif',
                       fontWeight: 300,
                       lineHeight: 1.5
                     }}
                   >
                     {info.description}
                   </p>
                )}
             </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Footer / Progress */}
      <footer className="flex justify-between items-end shrink-0">
        <div className="flex gap-1 md:gap-2">
            {CAMERA_PATH.map((_, idx) => (
                <div 
                    key={idx}
                    className={`h-1 transition-all duration-300 ${idx === currentStep ? 'w-8 md:w-12 bg-white' : 'w-2 md:w-4 bg-white/20'}`}
                />
            ))}
        </div>
        <div className="text-right">
           <p className="text-[10px] md:text-xs text-white/40 mb-1">RENDER ENGINE: WEBGL // R3F</p>
           <p className="text-[10px] md:text-xs text-white/40">MODEL: KOENIGSEGG_REF_01</p>
        </div>
      </footer>
    </div>
  );
};