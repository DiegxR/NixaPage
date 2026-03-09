"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioAnalyzer } from "@/hooks/useAudioAnalyzer";
import { Scene } from "@/components/Scene";
import { Meteors } from "@/components/Meteors";
import { FFT_SIZE, SMOOTHING, DEFAULT_SONG_PATH, METEORS_START_AT, NEON_BUTTON_APPEAR_AT } from "@/config/visualizer";

export default function Home() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMeteors, setShowMeteors] = useState(false);
  const [showNeonButton, setShowNeonButton] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowMeteors(true), METEORS_START_AT * 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowNeonButton(true), NEON_BUTTON_APPEAR_AT * 1000);
    return () => clearTimeout(t);
  }, []);

  const {
    frequencyDataRef,
    play,
    pause,
    loadFile,
    isPlaying,
    isReady,
    loadedFileName,
  } = useAudioAnalyzer({
    initialSrc: encodeURI(DEFAULT_SONG_PATH),
    fftSize: FFT_SIZE,
    smoothing: SMOOTHING,
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("audio/")) loadFile(file);
    },
    [loadFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadFile(file);
      e.target.value = "";
    },
    [loadFile]
  );

  const hasAudio = !!loadedFileName;
  const hasAutoplayed = useRef(false);

  useEffect(() => {
    if (isReady && hasAudio && !hasAutoplayed.current) {
      hasAutoplayed.current = true;
      play();
    }
  }, [isReady, hasAudio, play]);

  return (
    <main
      className="relative w-full h-screen"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Meteoros: detrás del modelo, zona izquierda de la pantalla */}
      <div
        className="meteors-container"
        style={{
          opacity: showMeteors ? 1 : 0,
          transition: "opacity 3s ease-out",
          zIndex: 1,
        }}
        aria-hidden
      >
        <Meteors number={100} />
      </div>

      <Scene frequencyDataRef={frequencyDataRef} />

      {/* Botón neon: aparece tras NEON_BUTTON_APPEAR_AT segundos */}
      {showNeonButton && (
        <div
          className="neon-button-frame"
          style={{
            position: "fixed",
            left: "50%",
            bottom: "28%",
            transform: "translateX(-50%)",
            zIndex: 90,
            pointerEvents: "auto",
          }}
        >
          <button type="button" className="tranlate-x-[-100px] custom-btn btn-5">
            <span></span>
            <span>Conoce más</span>
          </button>
        </div>
      )}

      {isDragOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm border-4 border-dashed border-[#6b7fd7] rounded-lg pointer-events-none">
          <p className="text-xl font-medium text-white">Suelta el MP3 aquí</p>
        </div>
      )}

      {/* Barra de audio: siempre visible, por encima del canvas */}
      <div
        className="hidden bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 bg-black/90 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 shadow-xl min-w-[320px] pointer-events-auto"
        style={{ isolation: "isolate" }}
      >
        {!hasAudio ? (
          <label className="flex  items-center gap-3 cursor-pointer hover:text-white text-white/80 text-sm flex-1">
            Arrastra un audio o haz clic para elegir
            <input
              type="file"
              accept="audio/mpeg,audio/mp3,.mp3,audio/wav,audio/*,.wav,.mp3"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        ) : (
          <>
            <span className="text-white/90 text-sm truncate max-w-[180px]" title={loadedFileName}>
              {decodeURIComponent(loadedFileName)}
            </span>
            <button
              type="button"
              onClick={isPlaying ? pause : play}
              disabled={!hasAudio}
              className="flex custom-btn btn-5 "
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              )}
            </button>
            <label className="text-white/70 text-xs cursor-pointer hover:text-white/90">
              Cambiar
              <input
                type="file"
                accept="audio/mpeg,audio/mp3,.mp3,audio/wav,audio/*,.wav,.mp3"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </>
        )}
      </div>
    </main>
  );
}
