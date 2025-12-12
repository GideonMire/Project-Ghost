import React, { Component, useLayoutEffect, ReactNode, useRef, forwardRef } from 'react';
import { useGLTF, useHelper } from '@react-three/drei';
import { MeshPhysicalMaterial, Color, Box3, Vector3, DoubleSide, BoxHelper, Group } from 'three';
import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// The specific model URL provided by the user
const MODEL_URL = 'https://raw.githubusercontent.com/GideonMire/agera/db3bdfdf3ebf643560c4a8e3cc300fb7fe01eb59/public/uploads_files_2792345_Koenigsegg.obj.glb';

// Fallback component if model fails
const PlaceholderCar = () => {
  return (
    <group>
        <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[4.5, 1.2, 2]} />
            <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[-Math.PI/2, 0, 0]}>
             <planeGeometry args={[10, 10]} />
             <meshStandardMaterial color="#050505" metalness={0.8} roughness={0.2} />
        </mesh>
    </group>
  );
};

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }
  
  componentDidCatch(error: any) {
    console.error("CRITICAL: 3D Model failed to load.", error);
  }
  
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const ModelContent = forwardRef<Group, { debug?: boolean }>(({ debug }, ref) => {
  const gltf = useGLTF(MODEL_URL, true) as any;
  const innerRef = useRef<Group>(null);

  // Debug visualizer
  useHelper(debug ? innerRef : null, BoxHelper, 'cyan');

  useLayoutEffect(() => {
    if (gltf && gltf.scene) {
        const scene = gltf.scene;

        // Reset any previous transforms to ensure clean state
        scene.position.set(0, 0, 0);
        scene.rotation.set(0, 0, 0);
        scene.scale.setScalar(1);
        scene.updateMatrixWorld();

        // --- 1. ORIENTATION FIX ---
        // Measure initial bounds
        const box = new Box3().setFromObject(scene);
        const size = new Vector3();
        box.getSize(size);

        if (size.y > size.x && size.y > size.z) {
            scene.rotation.x = -Math.PI / 2;
            scene.updateMatrixWorld();
        }

        // --- 2. NORMALIZATION ---
        // Re-measure after rotation
        const box2 = new Box3().setFromObject(scene);
        const size2 = new Vector3();
        box2.getSize(size2);

        // Auto-Scale: Force max dimension to 5.0 units
        const maxDim = Math.max(size2.x, size2.y, size2.z);
        const scaleFactor = maxDim > 0 ? 5.0 / maxDim : 1;
        scene.scale.setScalar(scaleFactor);
        scene.updateMatrixWorld();

        // Auto-Center: Place on floor (Y=0) and center X/Z
        const finalBox = new Box3().setFromObject(scene);
        const center = new Vector3();
        finalBox.getCenter(center);
        scene.position.x += -center.x;
        scene.position.y += -finalBox.min.y;
        scene.position.z += -center.z;

        // --- 3. MATERIAL STYLING ---
        scene.traverse((obj: any) => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
                
                // Ensure smooth shading where applicable
                if (obj.geometry) {
                  obj.geometry.computeVertexNormals();
                }

                if (obj.material) {
                    const mat = obj.material;
                    const name = (mat.name || '').toLowerCase();
                    const meshName = (obj.name || '').toLowerCase();

                    // --- PALETTE ---
                    const COLOR_ORANGE = new Color('#ff4400'); // Vivid Orange
                    const COLOR_CARBON = new Color('#0a0a0a'); // Deep Black/Grey
                    const COLOR_RIM = new Color('#050505');    // Matte Black Rims

                    // --- LOGIC ---
                    // Brake Calipers / Accents
                    if (
                        name.includes('brake') || 
                        name.includes('caliper') || 
                        name.includes('detail') || 
                        name.includes('stripe') ||
                        meshName.includes('caliper')
                    ) {
                        obj.material = new MeshPhysicalMaterial({
                            color: COLOR_ORANGE,
                            metalness: 0.8,
                            roughness: 0.2,
                            clearcoat: 1.0,
                            clearcoatRoughness: 0.1,
                            emissive: COLOR_ORANGE,
                            emissiveIntensity: 0.5
                        });
                    }
                    // Lights (Headlights/Tailights)
                    else if (name.includes('light') || name.includes('lamp') || name.includes('led')) {
                        obj.material = new MeshPhysicalMaterial({
                            color: new Color('#ff0000'),
                            emissive: new Color('#ff0000'),
                            emissiveIntensity: 20,
                            toneMapped: false,
                            transparent: true,
                            opacity: 0.95
                        });
                    }
                    // Glass / Windows
                    else if (name.includes('glass') || name.includes('window') || mat.opacity < 1) {
                        obj.material = new MeshPhysicalMaterial({
                            color: '#000000',
                            metalness: 1.0,
                            roughness: 0.0,
                            transmission: 0.1, // Very dark tint
                            thickness: 1.5,
                            transparent: true,
                            opacity: 0.6,
                            envMapIntensity: 3.0,
                            clearcoat: 1.0
                        });
                    }
                    // Rims / Wheels
                    else if (name.includes('rim') || name.includes('wheel') || meshName.includes('wheel')) {
                         obj.material = new MeshPhysicalMaterial({
                            color: COLOR_RIM,
                            metalness: 0.9,
                            roughness: 0.3,
                            clearcoat: 0.5,
                            clearcoatRoughness: 0.2
                        });
                    }
                    // Tires
                    else if (name.includes('tire') || name.includes('rubber')) {
                        obj.material = new MeshPhysicalMaterial({
                            color: '#111111',
                            roughness: 0.9,
                            metalness: 0.1,
                            clearcoat: 0,
                            flatShading: false
                        });
                    }
                    // Main Body (Carbon Fiber + Metallic Flake Look)
                    else {
                        obj.material = new MeshPhysicalMaterial({
                            color: COLOR_CARBON,
                            metalness: 0.8,  // Higher metalness for flake perception
                            roughness: 0.3,  // Balanced for carbon
                            clearcoat: 1.0,  // Maximum gloss top coat
                            clearcoatRoughness: 0.05,
                            envMapIntensity: 2.5,
                            specularIntensity: 1.2
                        });
                    }
                }
            }
        });
    }
  }, [gltf]);

  return (
    <group ref={ref}>
        <primitive ref={innerRef} object={gltf.scene} />
    </group>
  );
});

export const CarModel = forwardRef<Group, { debug?: boolean }>((props, ref) => {
  return (
    <ErrorBoundary fallback={<PlaceholderCar />}>
      <ModelContent {...props} ref={ref} />
    </ErrorBoundary>
  );
});

useGLTF.preload(MODEL_URL);