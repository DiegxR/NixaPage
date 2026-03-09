"use client";

import { useEffect, useState } from "react";

interface MeteorsProps {
  number?: number;
}

export function Meteors({ number = 20 }: MeteorsProps) {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const styles = [...new Array(number)].map(() => ({
      ["--meteor-x" as string]: Math.random() * 100,
      top: Math.random() * 55 + "%",
      animationDelay: Math.random() * 15 + "s",
      animationDuration: Math.floor(Math.random() * 5 + 5) + "s",
    }));
    setMeteorStyles(styles);
  }, [number]);

  if (meteorStyles.length === 0) return null;

  return (
    <div className="meteors-inner">
      {meteorStyles.map((style, idx) => (
        <span key={idx} className="meteor" style={style}>
          <span className="meteor-tail" />
        </span>
      ))}
    </div>
  );
}

export default Meteors;
