"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import {
  TIMELAPSE_APPROACH_DURATION,
  STARS_APPEAR_AT,
  CAMERA_START_Z,
  CAMERA_END_Z,
} from "@/config/visualizer";

interface TimelapseCameraProps {
  onShowStars: (show: boolean) => void;
  onZoomComplete?: (complete: boolean) => void;
}

const startPos = new Vector3(0, 0, CAMERA_START_Z);
const endPos = new Vector3(0, 0, CAMERA_END_Z);

export function TimelapseCamera({ onShowStars, onZoomComplete }: TimelapseCameraProps) {
  const elapsedRef = useRef(0);
  const starsShownRef = useRef(false);
  const zoomCompleteRef = useRef(false);
  const { camera } = useThree();

  useFrame((_, delta) => {
    elapsedRef.current += delta;
    const t = elapsedRef.current;

    if (t < TIMELAPSE_APPROACH_DURATION) {
      const progress = Math.min(t / TIMELAPSE_APPROACH_DURATION, 1);
      const eased = 1 - (1 - progress) ** 1.2;
      camera.position.lerpVectors(startPos, endPos, eased);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    } else if (!zoomCompleteRef.current) {
      zoomCompleteRef.current = true;
      onZoomComplete?.(true);
    }

    if (t >= STARS_APPEAR_AT && !starsShownRef.current) {
      starsShownRef.current = true;
      onShowStars(true);
    }
  });

  return null;
}
