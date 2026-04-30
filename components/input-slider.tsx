'use client';

import { memo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InputSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  decimals?: number;
}

function InputSliderComponent({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = '',
  decimals = 2,
}: InputSliderProps) {
  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(Math.max(min, Math.min(max, newValue)));
    }
  };

  const displayValue = value.toFixed(decimals);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-baseline gap-1">
          <Input
            type="number"
            value={displayValue}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            className="w-16 md:w-20 h-10 md:h-8 text-right text-sm md:text-xs"
          />
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={handleSliderChange}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
}

export const InputSlider = memo(InputSliderComponent);
