"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import {
  TIMELAPSE_APPROACH_DURATION,
  STARS_APPEAR_AT,
  CAMERA_START_Z,
  CAMERA_END_Z,
  CAMERA_DRIFT_POSITION,
  CAMERA_DRIFT_LOOKAT,
  CAMERA_DRIFT_SPEED,
} from "@/config/visualizer";

interface TimelapseCameraProps {
  onShowStars: (show: boolean) => void;
  onZoomComplete?: (complete: boolean) => void;
}

const startPos = new Vector3(0, 0, CAMERA_START_Z);
const endPos = new Vector3(0, 0, CAMERA_END_Z);
const lookAtTarget = new Vector3(0, 0, 0);

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
      // Reducir deriva al final para que la cámara quede centrada al dar control
      const driftFactor = progress < 0.85 ? 1 : 1 - (progress - 0.85) / 0.15;

      // Zoom base: de inicio a fin
      camera.position.lerpVectors(startPos, endPos, eased);

      // Movimiento automático tenue: deriva en X/Y y lookAt para reflejos y cambio de perspectiva
      const driftX = Math.sin(t * CAMERA_DRIFT_SPEED) * CAMERA_DRIFT_POSITION * driftFactor;
      const driftY = Math.cos(t * CAMERA_DRIFT_SPEED * 0.9) * CAMERA_DRIFT_POSITION * 0.8 * driftFactor;
      camera.position.x += driftX;
      camera.position.y += driftY;

      lookAtTarget.set(
        Math.sin(t * CAMERA_DRIFT_SPEED * 0.7) * CAMERA_DRIFT_LOOKAT * driftFactor,
        Math.cos(t * CAMERA_DRIFT_SPEED * 0.6) * CAMERA_DRIFT_LOOKAT * driftFactor,
        0
      );
      camera.lookAt(lookAtTarget);
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
