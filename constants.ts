import { Vector3 } from 'three';
import { CameraPoint } from './types';

// CAR DIMENSIONS (Derived from User Config)
// Center X: -1.09
// Front Z: +1.45
// Rear Z: -1.52
// Wing Z: -2.10
// Left Side X: -0.22
// Right Side X: -1.96

export const CAMERA_PATH: CameraPoint[] = [
  {
    // 1. INTRO - High Front 3/4 (Left Side)
    position: new Vector3(2.5, 1.4, 4.0),
    target: new Vector3(-1.09, 0.4, 0),
    text: "THE GHOST",
    subtext: "INITIATING SEQUENCE"
  },
  {
    // 2. WHEEL - Extreme Close up on Front Left Wheel (Pos: -0.21, 0.35, 1.43)
    position: new Vector3(0.6, 0.35, 1.8),
    target: new Vector3(-0.21, 0.35, 1.43),
    text: "PRECISION",
    subtext: "CARBON CERAMIC BRAKES"
  },
  {
    // 3. SIDE AERO - Sliding down the flank
    position: new Vector3(2.8, 0.9, 1.0),
    target: new Vector3(-1.09, 0.6, 0.5),
    text: "AERODYNAMICS",
    subtext: "SCULPTED BY WIND"
  },
  {
    // 4. REAR WING - High Rear view focusing on Wing (Pos: -1.11, 1.13, -2.10)
    position: new Vector3(1.0, 1.6, -3.5),
    target: new Vector3(-1.11, 1.13, -2.10),
    text: "DOWNFORCE",
    subtext: "ACTIVE AERO SYSTEM"
  },
  {
    // 5. TOP DOWN - Directly above Center Body
    position: new Vector3(-1.09, 4.5, 0.1), // Slight Z offset to prevent LookAt gimbal lock
    target: new Vector3(-1.09, 0, 0),
    text: "LIGHTWEIGHT",
    subtext: "FULL CARBON MONOCOQUE"
  },
  {
    // 6. LOW SIDE/REAR - Aggressive low angle from the side
    position: new Vector3(-4.93, 1.32, -4.46),
    target: new Vector3(-1.09, 0.5, -0.5),
    text: "VELOCITY",
    subtext: "400+ KM/H TOP SPEED"
  },
  // --- NEW ORBITAL KEYFRAMES FOR SMOOTH SPIN ---
  {
    // 7. MID SIDE - Wide orbit to avoid clipping
    position: new Vector3(-5.50, 1.00, 0.00),
    target: new Vector3(-1.09, 0.5, 0.0),
    text: "G-FORCE",
    subtext: "2.0G LATERAL ACCELERATION"
  },
  {
    // 8. FRONT QUARTER - Transitioning to front
    position: new Vector3(-4.00, 0.80, 3.00),
    target: new Vector3(-1.09, 0.5, 0.8),
    text: "AGILITY",
    subtext: "ELECTRONIC DIFFERENTIAL"
  },
  // ---------------------------------------------
  {
    // 9. HERO FRONT - Dead center front
    position: new Vector3(-1.09, 0.5, 3.8),
    target: new Vector3(-1.09, 0.6, 1.0),
    text: "LEGACY",
    subtext: "SPIRIT OF PERFORMANCE"
  }
];

export const INITIAL_CHAT_MESSAGE = "Welcome to the Ghost configuration interface. Ask me about the engineering specs, history, or performance data of this machine.";

export const SYSTEM_INSTRUCTION = `
You are the AI Assistant for a high-end automotive showcase of a Koenigsegg hypercar.
Your tone is sophisticated, technical, and concise. 
You are embedded in a 3D experience.
Focus on engineering excellence, carbon fiber construction, extreme performance figures (MW power, 1360hp+, 0-400-0 records).
Do not be overly flowery, stay grounded in engineering facts.
If asked about the car model, acknowledge it is a digital representation of a Koenigsegg.
`;