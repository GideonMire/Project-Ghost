import React, { Suspense, useRef, useMemo } from 'react';
import { ScrollControls, Environment, Sparkles, Stars, OrbitControls, Html } from '@react-three/drei';
import { useThree, useFrame, ThreeElements } from '@react-three/fiber';
import { CarModel } from './CarModel';
import { CameraRig } from './CameraRig';
import { Planets } from './Planets';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { Group, Vector3, MathUtils } from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface ExperienceProps {
  setStep: (idx: number) => void;
  freeRoam: boolean;
  freeLook: boolean;
}

// --- SUN DIRECTION & LIGHT COLOR PRD ---
const SUN_CONFIG = {
  "sun_lon_lat": [-65, 18], // Degrees: [Longitude, Latitude]
  "sun_distance_factor": 600.0,
  "sun_color_hex": "#fffbe8",
  "sun_temperature_k": 5800,
  "sun_intensity_suggestion": 3.2, // Balanced for PBR
  "bloom_strength_hint": 1.2,
  "corona_radius_deg": 1.5,
  "notes": "Placed to create strong contrast and distinct shadows across the hood."
};

// Helper: Convert Lat/Lon to Vector3 (Spherical -> Cartesian)
const getSunPosition = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  
  return new Vector3(x, y, z);
};

const Sun = () => {
  const position = useMemo(() => {
    return getSunPosition(SUN_CONFIG.sun_lon_lat[1], SUN_CONFIG.sun_lon_lat[0], SUN_CONFIG.sun_distance_factor);
  }, []);

  // Calculate physical radius for the visual mesh based on angular diameter
  // r = d * tan(theta/2)
  const visualRadius = SUN_CONFIG.sun_distance_factor * Math.tan((SUN_CONFIG.corona_radius_deg * Math.PI / 180) / 2);

  return (
    <group position={position}>
        {/* Visible Sun Disk */}
        <mesh>
            <sphereGeometry args={[visualRadius * 4, 32, 32]} />
            <meshBasicMaterial color={SUN_CONFIG.sun_color_hex} toneMapped={false} />
        </mesh>
        
        {/* Main Key Light */}
        <directionalLight 
            intensity={SUN_CONFIG.sun_intensity_suggestion} 
            color={SUN_CONFIG.sun_color_hex} 
            castShadow
            shadow-bias={-0.0001}
            shadow-mapSize={[2048, 2048]}
        />
    </group>
  );
};

// HUD Overlay for coordinate tracking
const DebugHUD = ({ controlsRef }: { controlsRef: React.RefObject<any> }) => {
  const { camera } = useThree();
  const hudRef = useRef<HTMLDivElement>(null);

  useFrame(() => {
    if (hudRef.current) {
      const { x, y, z } = camera.position;
      let tx = 0, ty = 0, tz = 0;
      
      // Robust check for OrbitControls target
      const controls = controlsRef.current;
      if (controls && controls.target) {
        tx = controls.target.x;
        ty = controls.target.y;
        tz = controls.target.z;
      }

      hudRef.current.innerHTML = `
        <div style="margin-bottom:8px; border-bottom:1px solid #555; padding-bottom:4px; color:#0f0; font-weight:bold;">CAMERA DEBUG</div>
        <div style="display:flex; justify-content:space-between;"><span>POS X:</span> <span style="color:#fff">${x.toFixed(2)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>POS Y:</span> <span style="color:#fff">${y.toFixed(2)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>POS Z:</span> <span style="color:#fff">${z.toFixed(2)}</span></div>
        <div style="margin-top:8px; border-top:1px solid #333; paddingTop:4px; color:#aaa;">TARGET (LOOKAT)</div>
        <div style="display:flex; justify-content:space-between;"><span>TGT X:</span> <span>${tx.toFixed(2)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>TGT Y:</span> <span>${ty.toFixed(2)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>TGT Z:</span> <span>${tz.toFixed(2)}</span></div>
      `;
    }
  });

  return (
    <Html position={[0, 0, 0]} fullscreen style={{ pointerEvents: 'none', zIndex: 1000 }}>
      <div 
        ref={hudRef} 
        style={{ 
          position: 'absolute', 
          top: 20, 
          left: 20, 
          width: '200px',
          fontFamily: 'monospace', 
          fontSize: '12px', 
          backgroundColor: 'rgba(0,0,0,0.85)', 
          padding: '15px',
          border: '1px solid #333',
          borderRadius: '4px',
          color: '#888',
          pointerEvents: 'auto',
          userSelect: 'text'
        }} 
      />
    </Html>
  );
};

// --- BASE SPACE BACKGROUND ---
// Physically accurate star density, no planets/sun meshes.
const SpaceBackground = () => (
  <group>
     {/* 1. DEEP FIELD: Dense background dust/stars (The 'Canvas') */}
     <Stars radius={500} depth={200} count={15000} factor={2} saturation={0} fade speed={0.1} />
     
     {/* 2. MID FIELD: Standard visible star layer */}
     <Stars radius={300} depth={100} count={6000} factor={5} saturation={0.5} fade speed={0.3} />

     {/* 3. NEAR FIELD: Bright, distinct stars */}
     <Stars radius={150} depth={50} count={1500} factor={8} saturation={1} fade speed={0.5} />

     {/* 4. GLOWING GIANTS: Simulated bloom on large stars (Blue Giants) */}
     <Sparkles 
       count={120} 
       scale={400} 
       size={60} 
       speed={0.2} 
       opacity={0.5} 
       color="#aaddff"
       noise={50} // High noise to disperse them naturally
     />

     {/* 5. GLOWING GIANTS: Simulated bloom on large stars (Red/Orange Giants) */}
     <Sparkles 
       count={100} 
       scale={400} 
       size={60} 
       speed={0.2} 
       opacity={0.5} 
       color="#ffccaa"
       noise={50}
     />

     {/* 6. NEBULA: Volumetric Clouds - Deep Purple/Blue Base */}
     <Sparkles 
       count={2000} 
       scale={500} 
       size={250} 
       speed={0} 
       opacity={0.12} 
       color="#2a0044" 
       noise={20} 
     />

     {/* 7. NEBULA HIGHLIGHTS: Cyan/Teal wisps */}
     <Sparkles 
       count={1500} 
       scale={400} 
       size={300} 
       speed={0} 
       opacity={0.08} 
       color="#003366" 
       noise={15} 
     />
     
     {/* 8. GOLDEN DUST: Tie-in with the warm key light */}
     <Sparkles 
       count={800} 
       scale={300} 
       size={150} 
       speed={0} 
       opacity={0.05} 
       color="#553311" 
       noise={10} 
     />

     {/* 9. FINE GRIT: High frequency floating particles to give 'air' feeling */}
     <Sparkles count={2000} scale={100} size={2} speed={0.2} opacity={0.3} color="#ffffff" />
  </group>
);

export const Experience: React.FC<ExperienceProps> = ({ setStep, freeRoam, freeLook }) => {
  const controlsRef = useRef<any>(null);
  const carGroupRef = useRef<Group>(null);

  // Auto-rotate the car and add "alive" motion when not in debug mode
  useFrame((state, delta) => {
    if (!freeRoam && carGroupRef.current) {
      const t = state.clock.getElapsedTime();

      // 1. SPIN: Constant subtle rotation (one direction)
      carGroupRef.current.rotation.y -= delta * 0.03;

      // 2. SLOW WOBBLE (Floating in Zero-G)
      // Replaced high-frequency shake with gentle, non-linear drift on axes
      carGroupRef.current.rotation.x = Math.sin(t * 0.5) * 0.015; // Gentle Pitch
      carGroupRef.current.rotation.z = Math.cos(t * 0.3) * 0.015; // Gentle Roll

      // 3. VERTICAL DRIFT
      // Slow breathing motion
      carGroupRef.current.position.y = Math.sin(t * 0.25) * 0.08;

    } else if (freeRoam && carGroupRef.current) {
      // Reset transforms in debug mode
      carGroupRef.current.rotation.y = 0;
      carGroupRef.current.rotation.x = 0;
      carGroupRef.current.rotation.z = 0;
      carGroupRef.current.position.y = 0;
    }
  });

  const SceneContent = () => (
    <>
      <Suspense fallback={null}>
          <CarModel ref={carGroupRef} debug={freeRoam} />
      </Suspense>

      <SpaceBackground />
      <Planets />
      <Sun />
      
      {/* DEBUG HELPERS */}
      {freeRoam && (
        <>
            <axesHelper args={[10]} position={[0, 0.01, 0]} /> 
            <gridHelper args={[500, 500, 0xff0000, 0x222222]} position={[0, 0, 0]} />
            <DebugHUD controlsRef={controlsRef} />
        </>
      )}
    </>
  );

  return (
    <>
      <color attach="background" args={['#000000']} />

      {/* Base Ambiance - Deep Space */}
      <ambientLight intensity={0.2} color="#111122" />
      
      {/* Key Light (Sun) is now handled by the <Sun /> component */}

      {/* Rim Light for shape definition - kept opposite to the Sun */}
      <spotLight position={[-200, 50, -100]} angle={1} intensity={5} color="#224488" decay={2} distance={800} />

      {/* Studio Environment for Sharp Car Reflections */}
      {/* Using 'city' preset but heavily dimmed and blurred to simulate generalized reflections */}
      <Environment preset="city" background={false} blur={0.7} environmentIntensity={0.5} />

      <EffectComposer enableNormalPass={false}>
        {/* Cinematic Soft Bloom - Tuning for "No hard edges" */}
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={SUN_CONFIG.bloom_strength_hint} 
          radius={0.6} 
        />
        {/* Reduced Noise opacity by 50% (0.12 -> 0.06) */}
        <Noise opacity={0.06} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      {freeRoam ? (
        <>
          <OrbitControls ref={controlsRef} enableZoom={true} enablePan={true} dampingFactor={0.05} />
          <SceneContent />
        </>
      ) : (
        <ScrollControls pages={10} damping={0.5}>
          <CameraRig setStep={setStep} carRef={carGroupRef} freeLook={freeLook} smoothMode={true} />
          <SceneContent />
        </ScrollControls>
      )}
    </>
  );
};