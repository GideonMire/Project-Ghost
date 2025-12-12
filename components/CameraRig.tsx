import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { Vector3, CatmullRomCurve3, Group, MathUtils } from 'three';
import { CAMERA_PATH } from '../constants';

interface CameraRigProps {
    setStep: (idx: number) => void;
    carRef: React.RefObject<Group>;
    freeLook: boolean;
    smoothMode: boolean; // ⭐ NEW FLAG FOR MODE SWITCH
}

export const CameraRig: React.FC<CameraRigProps> = ({
  setStep,
  carRef,
  freeLook,
  smoothMode
}) => {
  
  const scroll = useScroll();
  const upVector = useMemo(() => new Vector3(0, 1, 0), []);

  // Smooth scroll – used ONLY in smooth mode
  const smoothOffset = useRef(0);

  // Free-look offset
  const lookOffset = useRef(new Vector3());

  // ---------------------------
  // ORIGINAL LOW-RES CURVES
  // ---------------------------
  const { basePos, baseTar } = useMemo(() => {
    const points = CAMERA_PATH.map(p => p.position);
    const targets = CAMERA_PATH.map(p => p.target);

    return {
      basePos: new CatmullRomCurve3(points, false, "catmullrom", 0.5),
      baseTar: new CatmullRomCurve3(targets, false, "catmullrom", 0.5),
    };
  }, []);

  // ---------------------------
  // HIGH-RES SUBDIVIDED CURVES
  // ---------------------------
  const { smoothPos, smoothTar } = useMemo(() => {
    const RES = 1500; // Higher = smoother
    const posSamples: Vector3[] = [];
    const tarSamples: Vector3[] = [];

    for (let i = 0; i <= RES; i++) {
      const t = i / RES;
      posSamples.push(basePos.getPointAt(t));
      tarSamples.push(baseTar.getPointAt(t));
    }

    return {
      smoothPos: new CatmullRomCurve3(posSamples, false),
      smoothTar: new CatmullRomCurve3(tarSamples, false),
    };
  }, [basePos]);

  useFrame((state, delta) => {
    const rawOffset = scroll?.offset || 0;
    let t = rawOffset;

    // ---------------------------
    // ⭐ MODE SWITCHING LOGIC ⭐
    // ---------------------------
    if (smoothMode) {
      // Smooth scroll, micro-movement
      smoothOffset.current = MathUtils.lerp(
        smoothOffset.current,
        rawOffset,
        0.05 // lower = smoother
      );
      t = smoothOffset.current;
    } else {
      // RAW scroll (snap mode)
      t = rawOffset;
    }

    // Step indicator for UI (unchanged)
    const totalPoints = CAMERA_PATH.length;
    const exactIndex = t * (totalPoints - 1);
    setStep(Math.round(exactIndex));

    // Select curve depending on mode
    const posCurve = smoothMode ? smoothPos : basePos;
    const tarCurve = smoothMode ? smoothTar : baseTar;

    let rawPoint = posCurve.getPointAt(t);
    let rawTarget = tarCurve.getPointAt(t);

    if (!rawPoint || !rawTarget) return;

    // Rotate with car
    if (carRef.current) {
      const rotationY = carRef.current.rotation.y;
      rawPoint = rawPoint.clone().applyAxisAngle(upVector, rotationY);
      rawTarget = rawTarget.clone().applyAxisAngle(upVector, rotationY);
    }

    // ---------------------------
    // FREE LOOK (same as your original)
    // ---------------------------
    if (freeLook) {
      const viewDir = new Vector3().subVectors(rawTarget, rawPoint).normalize();
      const right = new Vector3().crossVectors(viewDir, upVector).normalize();
      const camUp = new Vector3().crossVectors(right, viewDir).normalize();

      const SENSITIVITY = 3.0;
      const targetX = state.pointer.x * SENSITIVITY;
      const targetY = state.pointer.y * SENSITIVITY;

      const desiredOffset = new Vector3()
        .addScaledVector(right, targetX)
        .addScaledVector(camUp, targetY);

      lookOffset.current.lerp(desiredOffset, delta * 5);
    } else {
      lookOffset.current.lerp(new Vector3(), delta * 5);
    }

    rawTarget.add(lookOffset.current);

    // ---------------------------
    // FINAL CAMERA OUTPUT
    // ---------------------------
    state.camera.position.copy(rawPoint);
    state.camera.lookAt(rawTarget);
  });

  return null;
};
