"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import type { AnimalKey } from "./animals";
import { AnimalEngine } from "./engine";
import type { Theme } from "./renderer";
import type { Tuning } from "./flock";

export interface AsciiAnimalsHandle {
  startle: (x: number, y: number) => void;
  engine: AnimalEngine | null;
}

export interface AsciiAnimalsProps {
  className?: string;
  style?: React.CSSProperties;
  animal?: AnimalKey;
  count?: number;
  theme?: Theme;
  transparent?: boolean;
  tuning?: Partial<Tuning>;
  onClick?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

/** Glyphs come from the canvas's font-family, so give it (or a parent) a monospace font. */
export const AsciiAnimals = forwardRef<AsciiAnimalsHandle, AsciiAnimalsProps>(
  function AsciiAnimals(
    {
      className,
      style,
      animal = "koi",
      count,
      theme = "dark",
      transparent = false,
      tuning,
      onClick,
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<AnimalEngine | null>(null);

    useImperativeHandle(ref, () => ({
      startle: (x: number, y: number) => engineRef.current?.startle(x, y),
      engine: engineRef.current,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const engine = new AnimalEngine(canvas, {
        animal,
        count,
        theme,
        transparent,
        tuning,
      });
      engineRef.current = engine;
      return () => engine.destroy();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transparent]);

    useEffect(() => {
      const engine = engineRef.current;
      if (engine && engine.animal.key !== animal) engine.setAnimal(animal, tuning);
    }, [animal, tuning]);

    useEffect(() => {
      engineRef.current?.setTheme(theme);
    }, [theme]);

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        onClick={onClick}
        className={`ascii-animals ${className ?? ""}`.trim()}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          ...style,
        }}
      />
    );
  }
);

export default AsciiAnimals;
