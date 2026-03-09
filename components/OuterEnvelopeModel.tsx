"use client";

import { useRef, useEffect, useState, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group, type Material } from "three";
import {
  SECOND_MODEL_PATH,
  SECOND_MODEL_APPEAR_AT,
  SECOND_MODEL_APPEAR_DURATION,
  SECOND_MODEL_SCALE,
} from "@/config/visualizer";

/** Hace los materiales semi-transparentes para ver el modelo interior */
function setTransparentMaterials(scene: Group, opacity: number) {
  scene.traverse((child) => {
    if ("material" in child && child.material) {
      const mat = child.material as Material & { transparent?: boolean; opacity?: number };
      mat.transparent = true;
      mat.opacity = opacity;
    }
  });
}

interface OuterEnvelopeModelProps {
  frequencyDataRef: MutableRefObject<Uint8Array>;
}

/** Velocidad de rotación al ritmo de la música (sobre su propio eje) */
const ROTATION_STRENGTH = 0.035;
/** Intensidad del rebote en el sitio (pulso de escala) */
const BOUNCE_STRENGTH = 0.08;

export function OuterEnvelopeModel({ frequencyDataRef }: OuterEnvelopeModelProps) {
  const groupRef = useRef<Group>(null);
  const [loadedScene, setLoadedScene] = useState<Group | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadedScene(null);

    const loadModel = async () => {
      try {
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
        const loader = new GLTFLoader();
        const url = SECOND_MODEL_PATH.startsWith("/")
          ? `${typeof window !== "undefined" ? window.location.origin : ""}${SECOND_MODEL_PATH}`
          : SECOND_MODEL_PATH;
        const gltf = await new Promise<{ scene: Group }>((resolve, reject) => {
          loader.load(url, resolve, undefined, reject);
        });
        if (cancelled) return;
        const scene = gltf.scene.clone();
        setTransparentMaterials(scene, 0.45);
        setLoadedScene(scene);
      } catch {
        if (!cancelled) setLoadedScene(null);
      }
    };

    loadModel();
    return () => {
      cancelled = true;
    };
  }, []);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    const elapsed = state.clock.elapsedTime;
    const appearProgress = Math.min(
      1,
      Math.max(0, (elapsed - SECOND_MODEL_APPEAR_AT) / SECOND_MODEL_APPEAR_DURATION)
    );

    const data = frequencyDataRef.current;
    const low = data.length > 0 ? data[0] / 255 : 0;
    const mid = data.length > 8 ? data[Math.floor(data.length * 0.25)] / 255 : 0;
    const high = data.length > 0 ? data[data.length - 1] / 255 : 0;

    const baseScale = SECOND_MODEL_SCALE * appearProgress;
    const bouncePulse = 1 + Math.sin(elapsed * 4) * low * BOUNCE_STRENGTH * appearProgress;
    group.scale.setScalar(baseScale * bouncePulse);

    group.rotation.y += (low + mid * 0.5) * ROTATION_STRENGTH;
    group.rotation.x += (mid + high * 0.5) * ROTATION_STRENGTH * 0.5;

    group.position.set(0, 0, 0);
  });

  if (!loadedScene) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={loadedScene} />
    </group>
  );
}
