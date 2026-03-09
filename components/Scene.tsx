"use client";

import { useState, type MutableRefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { MusicReactiveObject } from "./MusicReactiveObject";
import { TimelapseCamera } from "./TimelapseCamera";
import { TimelapseStars } from "./TimelapseStars";
import { MODEL_3D_PATH, CAMERA_START_Z } from "@/config/visualizer";

interface SceneProps {
  frequencyDataRef: MutableRefObject<Uint8Array>;
  experienceStarted?: boolean;
}

const NEON_PURPLE = "#b24bf3";
const NEON_PURPLE_DIM = "#6b2d99";

export function Scene({ frequencyDataRef, experienceStarted = false }: SceneProps) {
  const [modelError, setModelError] = useState<string | null>(null);
  const [showStars, setShowStars] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const fileName = MODEL_3D_PATH.split("/").pop() ?? "modelo.glb";

  return (
    <div
      className="w-full h-full"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        minHeight: "100vh",
        zIndex: 10,
      }}
    >
      {modelError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/80 backdrop-blur-sm p-6 text-center">
          <p className="text-red-400 font-medium">No se pudo cargar el modelo 3D</p>
          <p className="text-white/80 text-sm max-w-md">
            {modelError}
          </p>
          <p className="text-white/60 text-sm">
            Coloca el archivo <strong className="text-white/90">{fileName}</strong> en la carpeta <code className="bg-white/10 px-1.5 py-0.5 rounded">public/</code> del proyecto y recarga la página.
          </p>
          <p className="text-white/50 text-xs">Mientras tanto se muestra un objeto de respaldo.</p>
        </div>
      )}
      <Canvas
        shadows
        camera={{ position: [0, 0, CAMERA_START_Z], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#050508"]} />
        <ambientLight intensity={0.2} />
        <pointLight
          position={[0, 0, 4]}
          intensity={3}
          color={NEON_PURPLE}
          distance={12}
          decay={1.5}
        />
        <pointLight
          position={[2, 2, 3]}
          intensity={1.2}
          color={NEON_PURPLE_DIM}
          distance={15}
        />
        <pointLight position={[-2.5, 1, 3.5]} intensity={1.5} color={NEON_PURPLE} distance={10} />
        <pointLight position={[2, -1.5, 3]} intensity={1} color={NEON_PURPLE_DIM} distance={10} />
        <pointLight position={[0, 2.5, 2]} intensity={0.8} color={NEON_PURPLE} distance={8} />
        <directionalLight position={[0, 0, 5]} intensity={0.8} />
        <TimelapseCamera
          started={experienceStarted}
          onShowStars={setShowStars}
          onZoomComplete={setControlsEnabled}
        />
        {showStars && <TimelapseStars />}
        <MusicReactiveObject
          frequencyDataRef={frequencyDataRef}
          experienceStarted={experienceStarted}
          onLoadError={setModelError}
          disableMouseFollow={controlsEnabled}
        />
        <OrbitControls
          enabled={controlsEnabled}
          enableZoom={controlsEnabled}
          enablePan={controlsEnabled}
          enableRotate={controlsEnabled}
          minDistance={2}
          maxDistance={25}
        />
      </Canvas>
    </div>
  );
}
