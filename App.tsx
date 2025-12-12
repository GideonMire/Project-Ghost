import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { AIChat } from './components/AIChat';

const App = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [freeRoam, setFreeRoam] = useState(false);
  const [freeLook, setFreeLook] = useState(false);

  return (
    <div className="w-full h-screen bg-[#050505] relative">
      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 35 }}>
        <Experience setStep={setCurrentStep} freeRoam={freeRoam} freeLook={freeLook} />
      </Canvas>
      
      {/* UI Overlay (Hidden in Free Roam) */}
      {!freeRoam && <Overlay currentStep={currentStep} />}
      
      {/* AI Chat Widget */}
      <AIChat />

      {/* Control Buttons - Responsive positioning and size */}
      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50 flex gap-2">
        {/* Free Look Toggle (Only active in Cinematic Mode) */}
        {!freeRoam && (
          <button 
              onClick={() => setFreeLook(!freeLook)}
              className={`px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold tracking-widest border rounded hover:bg-white hover:text-black transition-all uppercase ${freeLook ? 'bg-green-500 border-green-500 text-black' : 'bg-transparent border-white/20 text-white/50'}`}
          >
              {freeLook ? 'FREE LOOK ON' : 'FREE LOOK'}
          </button>
        )}

        {/* Debug/Free Roam Toggle */}
        <button 
            onClick={() => setFreeRoam(!freeRoam)}
            className={`px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold tracking-widest border rounded hover:bg-white hover:text-black transition-all uppercase ${freeRoam ? 'bg-red-500 border-red-500 text-white' : 'bg-transparent border-white/20 text-white/50'}`}
        >
            {freeRoam ? 'EXIT DEBUG' : 'DEBUG'}
        </button>
      </div>

      <Loader 
        containerStyles={{ background: '#000' }} 
        innerStyles={{ width: '300px', height: '2px', background: '#333' }}
        barStyles={{ background: '#fff', height: '2px' }}
        dataStyles={{ fontFamily: 'Rajdhani', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em' }}
      />
    </div>
  );
};

export default App;