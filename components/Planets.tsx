import React, { useMemo } from 'react';
import { Float } from '@react-three/drei';
import { DoubleSide, Color } from 'three';
import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// --- PRD JSON SPECIFICATION ---
const PLANETS_DATA = [
  {
    "id": "planet_gas_giant_01",
    "type": "gas",
    "angular_diameter_deg": 5.5,
    "distance_scale": 1.0,
    "color": "#1a2b3c",
    "albedo": 0.4,
    "emissive": false,
    "lon_lat": [-45, 15],
    "blur_px": 0,
    "notes": "Deep slate blue, subtle banding, large presence in background."
  },
  {
    "id": "planet_ringed_01",
    "type": "ringed",
    "angular_diameter_deg": 3.0,
    "distance_scale": 1.1,
    "color": "#d4c5a0",
    "albedo": 0.6,
    "emissive": false,
    "lon_lat": [120, 25],
    "blur_px": 2,
    "notes": "Beige/Gold, prominent ring system, caught in sunlight."
  },
  {
    "id": "planet_terrestrial_01",
    "type": "terrestrial",
    "angular_diameter_deg": 1.8,
    "distance_scale": 0.9,
    "color": "#5080a0",
    "albedo": 0.3,
    "emissive": false,
    "lon_lat": [-160, -10],
    "blur_px": 1,
    "notes": "Ice world, sharp silhouette, high reflectivity."
  },
  {
    "id": "moon_01",
    "type": "moon",
    "angular_diameter_deg": 0.8,
    "distance_scale": 1.0,
    "color": "#888888",
    "albedo": 0.2,
    "emissive": false,
    "lon_lat": [-40, 18], // Near the gas giant
    "blur_px": 0,
    "notes": "Small shepherd moon for the gas giant."
  },
  {
    "id": "moon_02",
    "type": "moon",
    "angular_diameter_deg": 0.4,
    "distance_scale": 1.0,
    "color": "#555555",
    "albedo": 0.15,
    "emissive": false,
    "lon_lat": [125, 23], // Near ringed planet
    "blur_px": 0,
    "notes": "Tiny asteroid moon."
  }
];

// Helper: Convert Lat/Lon to Vector3 on a sphere of radius R
const getPosition = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  
  return [x, y, z] as [number, number, number];
};

// Helper: Convert Angular Diameter to Physical Radius at distance D
const getRadius = (angularDeg: number, distance: number) => {
  // tan(theta/2) = radius / distance
  // radius = distance * tan(theta/2)
  const rad = (angularDeg * Math.PI) / 180;
  return distance * Math.tan(rad / 2);
};

const BASE_DISTANCE = 400; // Distance from center where planets 'live'

export const Planets = () => {
  
  const planets = useMemo(() => {
    return PLANETS_DATA.map(data => {
      const dist = BASE_DISTANCE * data.distance_scale;
      const pos = getPosition(data.lon_lat[1], data.lon_lat[0], dist);
      const size = getRadius(data.angular_diameter_deg, dist);
      
      return { ...data, pos, size };
    });
  }, []);

  return (
    <group>
      {planets.map((planet) => (
        <group key={planet.id} position={planet.pos}>
            <Float speed={0.5} rotationIntensity={0.1} floatIntensity={2}>
              
              {/* Main Planet Body */}
              <mesh castShadow receiveShadow>
                <sphereGeometry args={[planet.size, 64, 64]} />
                <meshStandardMaterial 
                  color={planet.color} 
                  roughness={planet.type === 'gas' ? 0.9 : 0.7}
                  metalness={planet.type === 'terrestrial' ? 0.2 : 0.0}
                  envMapIntensity={0.2}
                />
              </mesh>

              {/* Atmosphere Glow (Fake Rim) - Only for larger bodies */}
              {(planet.type === 'gas' || planet.type === 'terrestrial') && (
                 <mesh scale={[1.05, 1.05, 1.05]}>
                    <sphereGeometry args={[planet.size, 32, 32]} />
                    <meshBasicMaterial 
                        color={planet.color} 
                        transparent 
                        opacity={0.1} 
                        side={DoubleSide}
                        blending={2} // Additive blending for glow
                    />
                 </mesh>
              )}

              {/* Rings */}
              {planet.type === 'ringed' && (
                <group rotation={[1.2, 0.5, 0]}>
                  <mesh>
                    <ringGeometry args={[planet.size * 1.4, planet.size * 2.2, 64]} />
                    <meshStandardMaterial 
                      color="#c0b090" 
                      side={DoubleSide} 
                      transparent 
                      opacity={0.7} 
                      roughness={0.8}
                    />
                  </mesh>
                  {/* Inner Ring Detail */}
                   <mesh>
                    <ringGeometry args={[planet.size * 1.2, planet.size * 1.35, 64]} />
                    <meshStandardMaterial 
                      color="#807060" 
                      side={DoubleSide} 
                      transparent 
                      opacity={0.4} 
                    />
                  </mesh>
                </group>
              )}
            </Float>
        </group>
      ))}
    </group>
  );
};