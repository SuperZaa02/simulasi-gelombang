/**
 * Wave Physics Engine
 * Implements wave equation: y = A·sin(ωt - kx + φ)
 * Where: A = amplitude (m), ω = angular frequency (rad/s), k = wave number (rad/m), φ = phase shift (rad)
 * Satuan: meter (m) untuk panjang, sekon (s) untuk waktu
 */

export interface WaveState {
  amplitude: number; // A: tinggi gelombang (meter)
  frequency: number; // f: frekuensi (Hz = 1/s)
  wavelength: number; // λ: panjang gelombang (meter)
  phase: number; // φ: pergeseran fase (radian)
  direction: 'right' | 'left'; // arah gelombang
}

export interface ProblemSolution {
  solved: {
    amplitude?: number;
    frequency?: number;
    wavelength?: number;
    phase?: number;
  };
  equations: string[];
  message: string;
}

export interface EquationDerivation {
  variable: string;
  formula: string;
  substitution: string;
  steps: string[];
  result: string;
}

export interface CalculatedWaveVars {
  period: number; // T = 1/f (sekon)
  angularFrequency: number; // ω = 2πf (rad/s)
  waveNumber: number; // k = 2π/λ (rad/m)
  velocity: number; // v = f·λ (m/s)
  scale: number; // Skala adaptif untuk menampilkan gelombang dengan benar
}

/**
 * Hitung skala adaptif untuk kanvas
 * Memastikan gelombang tetap terlihat dengan baik tidak peduli ukuran amplitudo dan panjang gelombang
 */
export function calculateAdaptiveScale(
  canvasWidth: number,
  canvasHeight: number,
  amplitude: number,
  wavelength: number
): number {
  // Gunakan tinggi kanvas untuk menentukan skala amplitudo
  const maxAmplitudePixels = canvasHeight * 0.3; // 30% dari tinggi kanvas
  const amplitudeScale = maxAmplitudePixels / (amplitude || 1);

  // Gunakan lebar kanvas untuk menentukan skala wavelength
  const maxWavelengthPixels = canvasWidth * 0.8; // 80% dari lebar kanvas
  const wavelengthScale = maxWavelengthPixels / (wavelength || 1);

  // Gunakan skala yang lebih kecil untuk memastikan keduanya terlihat
  return Math.min(amplitudeScale, wavelengthScale);
}

/**
 * Hasilkan persamaan gelombang dengan nilai yang disubstitusikan
 */
export function getSubstitutedEquation(
  state: WaveState,
  vars: CalculatedWaveVars
): { main: string; parts: string[] } {
  const A = state.amplitude.toFixed(3);
  const omega = vars.angularFrequency.toFixed(3);
  const k = vars.waveNumber.toFixed(3);
  const phi = state.phase.toFixed(3);
  const sign = state.direction === 'right' ? '−' : '+';

  const main = `y = ${A}·sin(${omega}t ${sign} ${k}x + ${phi})`;
  const parts = [
    `A = ${A} m (amplitudo)`,
    `ω = ${omega} rad/s (frekuensi sudut)`,
    `k = ${k} rad/m (angka gelombang)`,
    `φ = ${phi} rad (pergeseran fase)`,
    `Arah: ${state.direction === 'right' ? 'Kanan' : 'Kiri'}`,
  ];

  return { main, parts };
}

/**
 * Hasilkan langkah-langkah derivasi untuk semua variabel
 */
export function getDerivationSteps(
  state: WaveState,
  vars: CalculatedWaveVars
): EquationDerivation[] {
  const derivations: EquationDerivation[] = [];

  // 1. Periode (T = 1/f)
  derivations.push({
    variable: 'Periode (T)',
    formula: 'T = 1/f',
    substitution: `T = 1/${state.frequency.toFixed(3)}`,
    steps: [
      `Periode adalah waktu untuk satu siklus lengkap`,
      `Hubungan: T = 1/f (kebalikan dari frekuensi)`,
      `Substitusi f = ${state.frequency.toFixed(3)} Hz`,
      `T = 1 ÷ ${state.frequency.toFixed(3)} = ${vars.period.toFixed(3)} s`,
    ],
    result: `T = ${vars.period.toFixed(3)} sekon`,
  });

  // 2. Frekuensi Sudut (ω = 2πf)
  derivations.push({
    variable: 'Frekuensi Sudut (ω)',
    formula: 'ω = 2πf',
    substitution: `ω = 2π × ${state.frequency.toFixed(3)}`,
    steps: [
      `Frekuensi sudut menghubungkan frekuensi dengan radian per detik`,
      `Satu putaran penuh = 2π radian`,
      `Hubungan: ω = 2πf`,
      `Substitusi f = ${state.frequency.toFixed(3)} Hz, π ≈ 3.14159`,
      `ω = 2 × 3.14159 × ${state.frequency.toFixed(3)} = ${vars.angularFrequency.toFixed(3)} rad/s`,
    ],
    result: `ω = ${vars.angularFrequency.toFixed(3)} rad/s`,
  });

  // 3. Angka Gelombang (k = 2π/λ)
  derivations.push({
    variable: 'Angka Gelombang (k)',
    formula: 'k = 2π/λ',
    substitution: `k = 2π / ${state.wavelength.toFixed(3)}`,
    steps: [
      `Angka gelombang adalah frekuensi spasial dalam radian per meter`,
      `Satu panjang gelombang = 2π radian`,
      `Hubungan: k = 2π/λ`,
      `Substitusi λ = ${state.wavelength.toFixed(3)} m, π ≈ 3.14159`,
      `k = (2 × 3.14159) ÷ ${state.wavelength.toFixed(3)} = ${vars.waveNumber.toFixed(3)} rad/m`,
    ],
    result: `k = ${vars.waveNumber.toFixed(3)} rad/m`,
  });

  // 4. Kecepatan (v = f·λ)
  derivations.push({
    variable: 'Kecepatan Gelombang (v)',
    formula: 'v = f · λ',
    substitution: `v = ${state.frequency.toFixed(3)} × ${state.wavelength.toFixed(3)}`,
    steps: [
      `Kecepatan gelombang adalah seberapa cepat gelombang merambat`,
      `Hubungan: v = f · λ (frekuensi × panjang gelombang)`,
      `Substitusi f = ${state.frequency.toFixed(3)} Hz, λ = ${state.wavelength.toFixed(3)} m`,
      `v = ${state.frequency.toFixed(3)} × ${state.wavelength.toFixed(3)} = ${vars.velocity.toFixed(3)} m/s`,
    ],
    result: `v = ${vars.velocity.toFixed(3)} m/s`,
  });

  // 5. Amplitudo (A) - langsung dari input
  derivations.push({
    variable: 'Amplitudo (A)',
    formula: 'A = nilai input',
    substitution: `A = ${state.amplitude.toFixed(3)}`,
    steps: [
      `Amplitudo adalah simpangan maksimum dari keseimbangan`,
      `Ini adalah nilai yang langsung dimasukkan (parameter utama)`,
      `Nilai amplitudo: ${state.amplitude.toFixed(3)} m`,
    ],
    result: `A = ${state.amplitude.toFixed(3)} m`,
  });

  // 6. Pergeseran Fase (φ) - langsung dari input
  derivations.push({
    variable: 'Pergeseran Fase (φ)',
    formula: 'φ = nilai input',
    substitution: `φ = ${state.phase.toFixed(3)}`,
    steps: [
      `Pergeseran fase menentukan posisi awal gelombang pada t=0`,
      `Ini adalah nilai yang langsung dimasukkan (parameter utama)`,
      `Nilai pergeseran fase: ${state.phase.toFixed(3)} rad (${((state.phase / Math.PI) * 180).toFixed(1)}°)`,
    ],
    result: `φ = ${state.phase.toFixed(3)} rad`,
  });

  return derivations;
}

/**
 * Memecahkan masalah gelombang - prediksi variabel yang kosong dari yang diketahui
 * Persamaan dasar:
 * - v = f·λ (kecepatan = frekuensi × panjang gelombang)
 * - T = 1/f (periode = 1 / frekuensi)
 * - ω = 2πf (frekuensi sudut = 2π × frekuensi)
 * - k = 2π/λ (angka gelombang = 2π / panjang gelombang)
 */
export function solveProblem(state: WaveState, assumedVelocity: number = 1): ProblemSolution {
  const equations: string[] = [];
  const solved: { [key: string]: number } = {};
  let message = '';

  const amplitude = state.amplitude;
  const frequency = state.frequency;
  const wavelength = state.wavelength;
  const phase = state.phase;

  const hasFreq = frequency > 0;
  const hasWave = wavelength > 0;
  const hasAmp = amplitude > 0;

  // Kasus 1: Hanya frekuensi
  if (hasFreq && !hasWave) {
    const solvedWavelength = assumedVelocity / frequency;
    equations.push('v = f × λ');
    equations.push(`${assumedVelocity} = ${frequency} × λ`);
    equations.push(`λ = ${assumedVelocity} / ${frequency} = ${solvedWavelength.toFixed(3)} m`);
    solved.wavelength = solvedWavelength;
    message = `Dari frekuensi ${frequency} Hz, panjang gelombang adalah ${solvedWavelength.toFixed(3)} m (dengan asumsi v = ${assumedVelocity} m/s)`;
  }
  // Kasus 2: Hanya panjang gelombang
  else if (!hasFreq && hasWave) {
    const solvedFreq = assumedVelocity / wavelength;
    equations.push('v = f × λ');
    equations.push(`${assumedVelocity} = f × ${wavelength}`);
    equations.push(`f = ${assumedVelocity} / ${wavelength} = ${solvedFreq.toFixed(3)} Hz`);
    solved.frequency = solvedFreq;
    message = `Dari panjang gelombang ${wavelength} m, frekuensi adalah ${solvedFreq.toFixed(3)} Hz (dengan asumsi v = ${assumedVelocity} m/s)`;
  }
  // Kasus 3: Kedua-duanya ada
  else if (hasFreq && hasWave) {
    message = 'Semua variabel sudah diketahui';
  }

  return {
    solved: solved as any,
    equations,
    message,
  };
}

/**
 * Hitung variabel gelombang turunan dari parameter dasar
 * Implementasi hubungan cerdas antar variabel:
 * - T = 1/f
 * - ω = 2πf
 * - k = 2π/λ
 * - v = f·λ
 */
export function calculateWaveVariables(
  state: WaveState,
  canvasWidth: number = 800,
  canvasHeight: number = 400
): CalculatedWaveVars {
  const period = state.frequency > 0 ? 1 / state.frequency : 0;
  const angularFrequency = 2 * Math.PI * state.frequency;
  const waveNumber = state.wavelength > 0 ? (2 * Math.PI) / state.wavelength : 0;
  const velocity = state.frequency * state.wavelength;
  const scale = calculateAdaptiveScale(canvasWidth, canvasHeight, state.amplitude, state.wavelength);

  return {
    period,
    angularFrequency,
    waveNumber,
    velocity,
    scale,
  };
}

/**
 * Hitung posisi y dari titik pada gelombang pada waktu dan posisi x tertentu
 * Persamaan gelombang: y = A·sin(ωt - kx + φ) untuk gelombang ke kanan
 *                      y = A·sin(ωt + kx + φ) untuk gelombang ke kiri
 * x dan y dalam meter, t dalam sekon
 */
export function calculateWaveHeight(
  x: number,
  t: number,
  state: WaveState,
  vars: CalculatedWaveVars
): number {
  const { amplitude, phase, direction } = state;
  const { angularFrequency, waveNumber } = vars;

  // Sesuaikan tanda berdasarkan arah
  const sign = direction === 'right' ? -1 : 1;
  const argument = angularFrequency * t + sign * waveNumber * x + phase;

  return amplitude * Math.sin(argument);
}

/**
 * Hasilkan poin gelombang untuk rendering
 * Mengembalikan array dari poin {x, y} yang disampel di seluruh lebar kanvas
 * Menggunakan skala adaptif untuk menampilkan gelombang dengan ukuran apapun
 */
export function generateWavePoints(
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  state: WaveState,
  vars: CalculatedWaveVars,
  zoom: number = 1,
  samples: number = 1000
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  const centerY = canvasHeight / 2;
  
  // Gunakan skala adaptif dari vars
  const scale = vars.scale;
  
  // Hitung pixel per meter untuk display dengan zoom
  // zoom > 1 = lebih detail (gelombang lebih besar)
  // zoom < 1 = lihat lebih banyak (gelombang lebih kecil)
  const wavelengthDisplayPixels = canvasWidth * 0.8 * zoom;
  const pixelsPerMeter = wavelengthDisplayPixels / state.wavelength;

  for (let i = 0; i <= samples; i++) {
    const xPixels = (i / samples) * canvasWidth;
    // Konversi pixel ke meter untuk perhitungan gelombang
    const xMeters = (xPixels - canvasWidth / 2) / pixelsPerMeter;
    const yMeters = calculateWaveHeight(xMeters, time, state, vars);
    points.push({
      x: xPixels,
      y: centerY - yMeters * scale, // Gunakan adaptive scale
    });
  }

  return points;
}

/**
 * Hasilkan marker untuk setiap panjang gelombang penuh
 * Menampilkan garis vertikal di setiap awal gelombang
 * Marker bergerak bersama gelombang berdasarkan waktu
 */
export function generateWavelengthMarkers(
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  state: WaveState,
  vars: CalculatedWaveVars,
  zoom: number = 1,
  panX: number = 0
): Array<{ x: number; label: string }> {
  const markers: Array<{ x: number; label: string }> = [];
  
  if (state.wavelength <= 0 || vars.waveNumber === 0) return markers;
  
  const { amplitude, phase, direction } = state;
  const { angularFrequency, waveNumber, scale } = vars;
  
  // Hitung berapa pixel per meter untuk display dengan zoom
  // zoom > 1 = lebih detail (gelombang lebih besar)
  // zoom < 1 = lihat lebih banyak (gelombang lebih kecil)
  const wavelengthDisplayPixels = canvasWidth * 0.8 * zoom;
  const pixelsPerMeter = wavelengthDisplayPixels / state.wavelength;
  
  // Arah menentukan tanda dalam persamaan fase
  const directionSign = direction === 'right' ? -1 : 1;
  
  // Fase awal pada x = 0 di waktu t
  // y = A·sin(ωt + directionSign·kx + φ)
  // Pada x = 0: fase = ωt + φ
  const phaseAtCenter = angularFrequency * time + phase;
  
  // Hitung posisi x (dalam meter) di mana fase = 0, 2π, 4π, ... (awal setiap gelombang)
  // ωt + directionSign·kx + φ = 2πn
  // directionSign·kx = 2πn - ωt - φ
  // x = (2πn - ωt - φ) / k
  
  const centerX = canvasWidth / 2;
  const startN = Math.floor(( -phaseAtCenter - waveNumber * (-canvasWidth/2) / pixelsPerMeter ) / (2 * Math.PI));
  const endN = Math.ceil(( -phaseAtCenter + waveNumber * (canvasWidth/2) / pixelsPerMeter ) / (2 * Math.PI)) + 1;

  for (let n = startN; n <= endN; n++) {
    // Hitung fase dalam radian untuk marker ke-n
    const targetPhase = 2 * Math.PI * n;
    
    // x dalam meter dari center
    let xMeters: number;
    if (waveNumber !== 0) {
      xMeters = (targetPhase - phaseAtCenter) / waveNumber * directionSign;
    } else {
      xMeters = n * state.wavelength;
    }
    
    // Konversi ke pixel dari center
    const xPixels = centerX + xMeters * pixelsPerMeter - panX;
    
    if (xPixels >= 0 && xPixels <= canvasWidth) {
      markers.push({
        x: xPixels,
        label: `λ${n}`,
      });
    }
  }

  return markers;
}

/**
 * Temukan posisi puncak dalam gelombang
 * Puncak bergerak bersama gelombang berdasarkan waktu
 */
export function findWavePeaks(
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  state: WaveState,
  vars: CalculatedWaveVars,
  zoom: number = 1,
  tolerance: number = 0.01
): Array<{ x: number; y: number }> {
  const peaks: Array<{ x: number; y: number }> = [];
  
  if (state.wavelength <= 0 || vars.waveNumber === 0) return peaks;
  
  const centerY = canvasHeight / 2;
  const { amplitude, phase, direction } = state;
  const { angularFrequency, waveNumber, scale } = vars;
  
  // Hitung pixel per meter untuk display dengan zoom
  const wavelengthDisplayPixels = canvasWidth * 0.8 * zoom;
  const pixelsPerMeter = wavelengthDisplayPixels / state.wavelength;
  
  // Arah menentukan tanda dalam persamaan fase
  const directionSign = direction === 'right' ? -1 : 1;
  
  // Fase pada center di waktu t
  const phaseAtCenter = angularFrequency * time + phase;
  
  // Puncak terjadi ketika sin(argumen) = 1, yaitu argumen = π/2 + 2πn
  // ωt + directionSign·kx + φ = π/2 + 2πn
  // directionSign·kx = π/2 + 2πn - ωt - φ
  
  const startN = Math.floor(( -phaseAtCenter - waveNumber * (-canvasWidth/2) / pixelsPerMeter - Math.PI/2 ) / (2 * Math.PI));
  const endN = Math.ceil(( -phaseAtCenter + waveNumber * (canvasWidth/2) / pixelsPerMeter - Math.PI/2 ) / (2 * Math.PI)) + 1;

  for (let n = startN; n <= endN; n++) {
    // Target fase untuk puncak ke-n
    const targetPhase = Math.PI / 2 + 2 * Math.PI * n;
    
    // x dalam meter dari center
    let xMeters: number;
    if (waveNumber !== 0) {
      xMeters = (targetPhase - phaseAtCenter) / waveNumber * directionSign;
    } else {
      xMeters = n * state.wavelength;
    }
    
    // Konversi ke pixel dari center
    const xPixels = canvasWidth / 2 + xMeters * pixelsPerMeter;
    
    if (xPixels >= 0 && xPixels <= canvasWidth) {
      // Hitung y pada posisi ini
      const yMeters = calculateWaveHeight(xMeters, time, state, vars);
      const yPixels = centerY - yMeters * scale;
      
      peaks.push({
        x: xPixels,
        y: yPixels,
      });
    }
  }

  return peaks;
}
