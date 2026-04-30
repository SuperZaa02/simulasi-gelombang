'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { WaveCanvas } from '@/components/wave-canvas';
import { ControlPanel } from '@/components/control-panel';
import { WaveState } from '@/lib/wave-utils';

// Satuan: Amplitudo (m), Frekuensi (Hz), Panjang Gelombang (m), Fase (radian)
const INITIAL_STATE: WaveState = {
  amplitude: 0.5, // 0.5 meter
  frequency: 1, // 1 Hz
  wavelength: 2, // 2 meter
  phase: 0,
  direction: 'right',
};

export default function Home() {
  const [waveState, setWaveState] = useState<WaveState>(INITIAL_STATE);
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());

  // Pengulangan animasi menggunakan requestAnimationFrame (RAF)
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 1000; // konversi ke detik
      lastTimeRef.current = now;

      setTime((prevTime) => prevTime + deltaTime);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const handleStateChange = useCallback((newState: Partial<WaveState>) => {
    setWaveState((prevState) => ({
      ...prevState,
      ...newState,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setWaveState(INITIAL_STATE);
    setTime(0);
    lastTimeRef.current = Date.now();
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
    lastTimeRef.current = Date.now();
  }, []);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setZoom((prev) => {
      const newZoom = direction === 'in' ? prev * 1.2 : prev / 1.2;
      // Batasan zoom: 0.2x sampai 10x
      return Math.max(0.2, Math.min(10, newZoom));
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPanX(0);
  }, []);

  return (
    <main className="h-dvh bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 md:px-6 py-3 md:py-4 shrink-0">
        <h1 className="text-xl md:text-3xl font-bold text-foreground">Simulasi Gelombang</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden sm:block">
          Jelajahi fisika gelombang dengan kontrol interaktif dan visualisasi real-time (satuan: meter dan sekon)
        </p>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Canvas Area */}
        <div className="flex-none lg:flex-1 p-2 md:p-4 bg-background order-1">
          <div className="w-full h-[40vh] lg:h-full bg-background rounded-lg border border-border overflow-hidden shadow-lg">
            <WaveCanvas 
              state={waveState} 
              time={time} 
              isPlaying={isPlaying}
              zoom={zoom}
              panX={panX}
            />
          </div>
        </div>

        {/* Control Panel */}
        <div className="flex-1 lg:w-2/5 p-2 md:p-4 bg-muted/30 lg:border-l border-t lg:border-t-0 border-border overflow-y-auto order-2">
          <ControlPanel
            state={waveState}
            isPlaying={isPlaying}
            onStateChange={handleStateChange}
            onTogglePlay={handleTogglePlay}
            onReset={handleReset}
            zoom={zoom}
            onZoom={handleZoom}
            onResetZoom={handleResetZoom}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-3 text-center text-xs text-muted-foreground shrink-0">
        <p>
          Dibuat oleh{" "}
          <a
            href="https://superzaa.my.id"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Faeza Raziq
          </a>{" "}
          | Sumber terbuka di{" "}
          <a
            href="https://github.com/SuperZaa02/simulasi-gelombang"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}
