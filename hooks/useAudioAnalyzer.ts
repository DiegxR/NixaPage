"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const FFT_SIZE_DEFAULT = 256;

export interface UseAudioAnalyzerOptions {
  initialSrc?: string;
  fftSize?: number;
  smoothing?: number;
}

export function useAudioAnalyzer(options: UseAudioAnalyzerOptions = {}) {
  const { initialSrc = "", fftSize = FFT_SIZE_DEFAULT, smoothing = 0.7 } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const frequencyDataRef = useRef<Uint8Array>(new Uint8Array(fftSize / 2));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(() =>
    initialSrc ? (initialSrc.split("/").pop() ?? null) : null
  );
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const updateFrequencyData = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    analyser.getByteFrequencyData(
      frequencyDataRef.current as unknown as Uint8Array<ArrayBuffer>
    );
    rafRef.current = requestAnimationFrame(updateFrequencyData);
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (!contextRef.current) {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      contextRef.current = ctx;
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothing;
      analyser.minDecibels = -70;
      analyser.maxDecibels = -10;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      setIsReady(true);
    }

    const ctx = contextRef.current;
    if (ctx.state === "suspended") ctx.resume();
    audio.play().then(() => {
      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(updateFrequencyData);
    }).catch(console.error);
  }, [fftSize, smoothing, updateFrequencyData]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) audio.pause();
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    setIsPlaying(false);
  }, []);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("audio/")) return;
    const audio = audioRef.current;
    if (!audio) return;
    pause();
    revokeObjectUrl();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    audio.src = url;
    setLoadedFileName(file.name);
    const onCanPlay = () => {
      setIsReady(true);
      audio.removeEventListener("canplaythrough", onCanPlay);
    };
    audio.addEventListener("canplaythrough", onCanPlay);
  }, [pause, revokeObjectUrl]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    if (initialSrc) {
      const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${initialSrc}` : initialSrc;
      audio.src = fullUrl;
      setLoadedFileName(initialSrc.split("/").pop() ?? null);
      const onCanPlay = () => setIsReady(true);
      audio.addEventListener("canplaythrough", onCanPlay, { once: true });
      audio.addEventListener("error", () => setIsReady(false), { once: true });
    }
    return () => {
      audio.pause();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audio.src = "";
      audioRef.current = null;
      revokeObjectUrl();
      contextRef.current = null;
      analyserRef.current = null;
    };
  }, [initialSrc, revokeObjectUrl]);

  return {
    audioRef,
    frequencyDataRef,
    play,
    pause,
    loadFile,
    isPlaying,
    isReady,
    loadedFileName,
    stop,
  };
}
