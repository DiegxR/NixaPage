"use client";

import { Stars } from "@react-three/drei";

export function TimelapseStars() {
  return (
    <Stars
      radius={120}
      depth={80}
      count={22000}
      factor={6}
      fade
      speed={1.2}
    />
  );
}
