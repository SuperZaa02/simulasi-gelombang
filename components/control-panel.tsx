'use client';

import { memo, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputSlider } from './input-slider';
import { WaveState, calculateWaveVariables, solveProblem, getSubstitutedEquation, getDerivationSteps } from '@/lib/wave-utils';

interface ControlPanelProps {
  state: WaveState;
  isPlaying: boolean;
  onStateChange: (newState: Partial<WaveState>) => void;
  onTogglePlay: () => void;
  onReset: () => void;
  zoom?: number;
  onZoom?: (direction: 'in' | 'out') => void;
  onResetZoom?: () => void;
}

const INITIAL_STATE: WaveState = {
  amplitude: 0.5,
  frequency: 1,
  wavelength: 2,
  phase: 0,
  direction: 'right',
};

function ControlPanelComponent({
  state,
  isPlaying,
  onStateChange,
  onTogglePlay,
  onReset,
  zoom = 1,
  onZoom,
  onResetZoom,
}: ControlPanelProps) {
  const [expandedDerivation, setExpandedDerivation] = useState<string | null>(null);
  
  const vars = useMemo(() => calculateWaveVariables(state, 800, 400), [state]);
  const solution = useMemo(() => solveProblem(state, 1), [state]);
  const substitutedEq = useMemo(() => getSubstitutedEquation(state, vars), [state, vars]);
  const derivations = useMemo(() => getDerivationSteps(state, vars), [state, vars]);

  return (
    <Card className="w-full bg-card border-border flex flex-col gap-3 md:gap-4 p-3 md:p-6 rounded-lg">
      {/* Header */}
      <div className="border-b border-border pb-2 md:pb-3">
        <h2 className="text-base md:text-lg font-bold text-foreground">Kontrol Gelombang</h2>
        <p className="text-xs text-muted-foreground mt-1 hidden md:block">
          Sesuaikan parameter gelombang secara real-time
        </p>
      </div>

      {/* Physics Parameters */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Parameter Fisika</h3>

        <InputSlider
          label="Amplitudo (A)"
          value={state.amplitude}
          onChange={(value) => onStateChange({ amplitude: Math.max(0.01, value) })}
          min={0.01}
          max={20}
          step={0.1}
          unit="m"
          decimals={2}
        />

        <InputSlider
          label="Frekuensi (f)"
          value={state.frequency}
          onChange={(value) => onStateChange({ frequency: Math.max(0.01, value) })}
          min={0.01}
          max={10}
          step={0.1}
          unit="Hz"
          decimals={2}
        />

        <InputSlider
          label="Panjang Gelombang (λ)"
          value={state.wavelength}
          onChange={(value) => onStateChange({ wavelength: Math.max(0.1, value) })}
          min={0.1}
          max={50}
          step={0.1}
          unit="m"
          decimals={2}
        />

        <InputSlider
          label="Pergeseran Fase (φ)"
          value={state.phase}
          onChange={(value) => onStateChange({ phase: value })}
          min={0}
          max={2 * Math.PI}
          step={0.1}
          unit="rad"
          decimals={2}
        />
      </div>

      {/* Calculated Values */}
      <div className="bg-muted/50 rounded p-3 space-y-2 text-xs">
        <h3 className="font-semibold text-foreground">Nilai Turunan</h3>
        <div className="grid grid-cols-2 gap-2 text-muted-foreground font-mono">
          <div>T = {vars.period.toFixed(3)} s</div>
          <div>ω = {vars.angularFrequency.toFixed(3)} rad/s</div>
          <div>k = {vars.waveNumber.toFixed(3)} rad/m</div>
          <div>v = {vars.velocity.toFixed(3)} m/s</div>
          <div className="col-span-2 text-center pt-1 border-t border-border">
            Skala: {vars.scale.toFixed(1)} px/m
          </div>
        </div>
      </div>

      {/* Wave Direction */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Arah Gelombang</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => onStateChange({ direction: 'right' })}
            variant={state.direction === 'right' ? 'default' : 'outline'}
            className="flex-1 h-12 md:h-9"
            size="sm"
          >
            <span className="hidden md:inline">Kanan →</span>
            <span className="md:hidden text-lg">→</span>
          </Button>
          <Button
            onClick={() => onStateChange({ direction: 'left' })}
            variant={state.direction === 'left' ? 'default' : 'outline'}
            className="flex-1 h-12 md:h-9"
            size="sm"
          >
            <span className="hidden md:inline">← Kiri</span>
            <span className="md:hidden text-lg">←</span>
          </Button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="space-y-2 border-t border-border pt-3">
        <h3 className="text-sm font-semibold text-foreground">Kontrol Zoom</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => onZoom?.('out')}
            variant="outline"
            className="flex-1 h-12 md:h-10 text-base md:text-sm"
            aria-label="Perkecil zoom"
          >
            <span className="md:hidden text-xl">−</span>
            <span className="hidden md:inline">− Perkecil</span>
          </Button>
          <Button
            onClick={onResetZoom}
            variant="outline"
            className="flex-1 h-12 md:h-10 text-base md:text-sm"
            aria-label="Reset zoom ke 100%"
          >
            1:1
          </Button>
          <Button
            onClick={() => onZoom?.('in')}
            variant="outline"
            className="flex-1 h-12 md:h-10 text-base md:text-sm"
            aria-label="Perbesar zoom"
          >
            <span className="md:hidden text-xl">+</span>
            <span className="hidden md:inline">+ Perbesar</span>
          </Button>
        </div>
        <div className="text-center text-xs text-muted-foreground bg-muted/50 rounded p-2">
          Zoom: {(zoom * 100).toFixed(0)}%
        </div>
      </div>

      {/* Control Buttons */}
      <div className="space-y-2 border-t border-border pt-3">
        <Button
          onClick={onTogglePlay}
          className="w-full h-12 md:h-9"
          variant={isPlaying ? 'default' : 'secondary'}
        >
          {isPlaying ? '⏸ Jeda' : '▶ Putar'}
        </Button>

        <Button
          onClick={onReset}
          variant="outline"
          className="w-full h-12 md:h-9"
          size="sm"
        >
          ↻ Setel Ulang
        </Button>
      </div>

      {/* Main Equation */}
      <div className="border-t border-border pt-3 space-y-2 text-xs">
        <h3 className="font-semibold text-foreground">Persamaan Gelombang (Umum)</h3>
        <div className="bg-muted/50 rounded p-2 font-mono text-center text-xs">
          y = A·sin(ωt {state.direction === 'right' ? '−' : '+'} kx + φ)
        </div>

        <h3 className="font-semibold text-foreground pt-2">Persamaan dengan Substitusi Nilai</h3>
        <div className="bg-primary/10 rounded p-2 font-mono text-center break-all">
          {substitutedEq.main}
        </div>
        <div className="text-muted-foreground space-y-1 text-xs">
          {substitutedEq.parts.map((part, idx) => (
            <div key={idx}>• {part}</div>
          ))}
        </div>
      </div>

      {/* Derivation Steps */}
      <div className="border-t border-border pt-3 space-y-2">
        <h3 className="font-semibold text-foreground text-sm">Langkah-Langkah Derivasi Variabel</h3>
        <div className="space-y-2">
          {derivations.map((deriv, idx) => (
            <div key={idx} className="border border-border rounded p-2 bg-muted/30">
              <button
                onClick={() => setExpandedDerivation(
                  expandedDerivation === deriv.variable ? null : deriv.variable
                )}
                className="w-full text-left text-xs font-semibold text-foreground hover:text-primary transition-colors flex items-center justify-between"
              >
                <span>{deriv.variable}</span>
                <span className="text-muted-foreground">
                  {expandedDerivation === deriv.variable ? '▼' : '▶'}
                </span>
              </button>

              {expandedDerivation === deriv.variable && (
                <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground space-y-2">
                  <div className="font-semibold text-foreground">Rumus: {deriv.formula}</div>
                  
                  <div className="bg-background/50 rounded p-1 font-mono text-xs">
                    {deriv.substitution}
                  </div>

                  <div className="space-y-1">
                    <div className="font-semibold text-foreground">Langkah-Langkah:</div>
                    {deriv.steps.map((step, stepIdx) => (
                      <div key={stepIdx} className="ml-2 text-xs">
                        {stepIdx + 1}. {step}
                      </div>
                    ))}
                  </div>

                  <div className="bg-primary/10 rounded p-1 font-mono font-semibold text-foreground text-xs text-center">
                    {deriv.result}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Problem Solver Info */}
      {solution.message && (
        <div className="border-t border-border pt-3 space-y-2 text-xs bg-primary/10 rounded p-2">
          <h3 className="font-semibold text-foreground">Info Solver</h3>
          <p className="text-muted-foreground">{solution.message}</p>
          {solution.equations.length > 0 && (
            <div className="font-mono text-xs space-y-1">
              {solution.equations.map((eq, idx) => (
                <div key={idx}>{eq}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export const ControlPanel = memo(ControlPanelComponent);
