'use client';

import React, { useEffect, useRef, useMemo, memo, useState } from 'react';
import {
  WaveState,
  calculateWaveVariables,
  generateWavePoints,
  findWavePeaks,
  generateWavelengthMarkers,
} from '@/lib/wave-utils';

interface WaveCanvasProps {
  state: WaveState;
  time: number;
  isPlaying: boolean;
  zoom?: number;
  panX?: number;
}

function WaveCanvasComponent({ state, time, isPlaying, zoom = 1, panX = 0 }: WaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Perbarui dimensi canvas saat container berubah ukuran
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      // Pastikan dimensi tidak nol atau terlalu kecil
      const width = Math.max(rect.width, 100);
      const height = Math.max(rect.height, 100);
      setDimensions({ width, height });
    };
    
    // Initial dimension update
    updateDimensions();
    
    // Delay sedikit untuk memastikan container sudah terender
    const timeoutId = setTimeout(updateDimensions, 100);
    
    // Gunakan ResizeObserver untuk mendeteksi perubahan ukuran container
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);
    
    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, []);

  // Dapatkan dimensi canvas dari state
  const { width: canvasWidth, height: canvasHeight } = dimensions;

  // Memoize wave variables untuk menghindari perhitungan ulang yang tidak perlu
  const vars = useMemo(() => {
    return calculateWaveVariables(state, canvasWidth, canvasHeight);
  }, [state, canvasWidth, canvasHeight]);

  // Memoize wave points untuk performa yang lebih baik, hanya dihitung ulang saat state, time, vars, zoom, atau dimensi canvas berubah
  const wavePoints = useMemo(() => {
    return generateWavePoints(canvasWidth, canvasHeight, time, state, vars, zoom);
  }, [state, time, vars, zoom, canvasWidth, canvasHeight]);

  // Memoize peaks untuk performa yang lebih baik, hanya dihitung ulang saat state, time, vars, zoom, atau dimensi canvas berubah
  const peaks = useMemo(() => {
    return findWavePeaks(canvasWidth, canvasHeight, time, state, vars, zoom);
  }, [state, time, vars, zoom, canvasWidth, canvasHeight]);

  // Memoize wavelength markers untuk performa yang lebih baik, hanya dihitung ulang saat state, time, vars, zoom, panX, atau dimensi canvas berubah
  const wavelengthMarkers = useMemo(() => {
    return generateWavelengthMarkers(canvasWidth, canvasHeight, time, state, vars, zoom, panX);
  }, [state, time, vars, zoom, panX, canvasWidth, canvasHeight]);

  // Gunakan ref untuk menyimpan dimensi terbaru untuk digunakan dalam efek penggambaran
  const canvasSizeRef = useRef({ width: 0, height: 0 });

  // Efek untuk menangani pengubahan ukuran canvas (hanya dijalankan saat dimensi berubah)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dapatkan dimensi terbaru
    const rect = container.getBoundingClientRect();
    const width = rect.width || dimensions.width;
    const height = rect.height || dimensions.height;

    // Simpan dimensi ke ref untuk akses sinkron di efek gambar
    canvasSizeRef.current = { width, height };

    // Atur ukuran canvas untuk mendukung resolusi tinggi (retina) dan skalakan konteksnya
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }, [dimensions.width, dimensions.height]);

  // Efek untuk menggambar gelombang (dijalankan setiap frame animasi)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // Optimasi performa
    if (!ctx) return;

    const { width, height } = canvasSizeRef.current;
    if (width === 0 || height === 0) return;

    // Warna
    const isDark = document.documentElement.classList.contains('dark') || 
                   window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const colors = isDark ? {
      bg: '#0f0f0f',
      border: '#2a2a2a',
      text: '#e0e0e0',
      muted: '#707070',
      primary: '#3b82f6',
      destructive: '#ff4444',
    } : {
      bg: '#ffffff',
      border: '#e5e7eb',
      text: '#000000',
      muted: '#888888',
      primary: '#0066ff',
      destructive: '#ff4444',
    };

    // Bersihkan canvas tanpa mengubah ukurannya
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, width, height);

    // Gambar grid
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.15;
    const gridSize = 100;

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // Gambar wavelength markers
    if (wavelengthMarkers.length > 0) {
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      ctx.setLineDash([4, 4]);

      for (const marker of wavelengthMarkers) {
        if (marker.x >= 0 && marker.x <= width) {
          ctx.beginPath();
          ctx.moveTo(marker.x, 0);
          ctx.lineTo(marker.x, height);
          ctx.stroke();

          ctx.fillStyle = colors.primary;
          ctx.font = '10px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.globalAlpha = 0.8;
          ctx.fillText(marker.label, marker.x, 12);
          ctx.globalAlpha = 0.5;
        }
      }

      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
    }

    // Gambar garis tengah (sumbu x)
    ctx.strokeStyle = colors.muted;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // Gambar gelombang
    if (wavePoints.length > 1) {
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(wavePoints[0].x, wavePoints[0].y);

      for (let i = 1; i < wavePoints.length; i++) {
        ctx.lineTo(wavePoints[i].x, wavePoints[i].y);
      }
      ctx.stroke();
    }

    // Gambar puncak
    if (peaks.length > 0) {
      ctx.fillStyle = colors.destructive;
      const peakRadius = 5;

      for (const peak of peaks) {
        ctx.beginPath();
        ctx.arc(peak.x, peak.y, peakRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Gambar panel info
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';

    const info = [
      `f = ${state.frequency.toFixed(2)} Hz`,
      `λ = ${state.wavelength.toFixed(3)} m`,
      `A = ${state.amplitude.toFixed(3)} m`,
      `v = ${vars.velocity.toFixed(3)} m/s`,
      `T = ${vars.period.toFixed(3)} s`,
    ];

    let infoY = 20;
    for (const line of info) {
      ctx.fillText(line, 15, infoY);
      infoY += 16;
    }

    // Status indicator & Zoom info
    ctx.fillStyle = isPlaying ? colors.primary : colors.muted;
    ctx.fillRect(width - 30, 15, 8, 8);
    ctx.fillStyle = colors.text;
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(isPlaying ? 'Animasi' : 'Jeda', width - 40, 21);

    ctx.fillStyle = colors.muted;
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.globalAlpha = 0.7;
    ctx.fillText(`Zoom: ${(zoom * 100).toFixed(0)}%`, width - 15, height - 10);
    ctx.globalAlpha = 1;
  }, [wavePoints, peaks, isPlaying, state, wavelengthMarkers, zoom, vars.velocity, vars.period]);

  return (
    <div ref={containerRef} className="w-full h-full bg-background">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}

export const WaveCanvas = memo(WaveCanvasComponent);
