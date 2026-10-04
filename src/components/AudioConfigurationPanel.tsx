/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Section 6: Audio Configuration (White Laboratory Theme)
 * Microphone Array & Noise Environment Setup
 */

import React from 'react';
import {
  MicrophoneArrayConfig,
  NoiseSourceConfig,
  RoomAcoustics,
  MicCount,
  NoiseType,
  SNRLevel
} from '../types/research';
import {
  calculateSpatialAliasingFreq,
  calculateArrayGainDb,
  calculateBeamwidthDeg
} from '../utils/acousticEngine';
import {
  Mic,
  Volume2,
  Radio,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';

interface AudioConfigurationPanelProps {
  micArray: MicrophoneArrayConfig;
  setMicArray: React.Dispatch<React.SetStateAction<MicrophoneArrayConfig>>;
  noise: NoiseSourceConfig;
  setNoise: React.Dispatch<React.SetStateAction<NoiseSourceConfig>>;
  room: RoomAcoustics;
  setRoom: React.Dispatch<React.SetStateAction<RoomAcoustics>>;
}

export const AudioConfigurationPanel: React.FC<AudioConfigurationPanelProps> = ({
  micArray,
  setMicArray,
  noise,
  setNoise,
  room,
  setRoom,
}) => {
  const fAliasHz = calculateSpatialAliasingFreq(micArray.spacingMeters);
  const arrayGainDb = calculateArrayGainDb(micArray.micCount);
  const beamwidthDeg = calculateBeamwidthDeg(micArray.micCount, micArray.spacingMeters);

  const noiseProfiles: { type: NoiseType; label: string; desc: string; freqBand: string }[] = [
    {
      type: 'crowd',
      label: 'Crowd / Babble Noise',
      desc: 'Multi-speaker competing babble (cocktail party). High spectral overlap with target speech.',
      freqBand: '300 Hz – 4.5 kHz',
    },
    {
      type: 'white',
      label: 'Gaussian White Noise',
      desc: 'Stationary broadband flat spectrum. Standard theoretical benchmark for spatial beamformers.',
      freqBand: '0 Hz – 8.0 kHz',
    },
    {
      type: 'restaurant',
      label: 'Restaurant Acoustic Clutter',
      desc: 'Diffuse background banter combined with high-frequency cutlery clatter and acoustic transients.',
      freqBand: '200 Hz – 6.5 kHz',
    },
    {
      type: 'traffic',
      label: 'Urban Traffic Noise',
      desc: 'Dominated by low-frequency engine rumbles and tire friction. Minimal high-frequency interference.',
      freqBand: '50 Hz – 1.2 kHz',
    },
    {
      type: 'machinery',
      label: 'Industrial Machinery',
      desc: 'Periodic tonal peaks (pumps, turbines) with impulsive mechanical vibration harmonics.',
      freqBand: '100 Hz – 3.2 kHz',
    },
    {
      type: 'vehicle',
      label: 'Vehicle In-Cabin Noise',
      desc: 'Wind turbulence across windshield combined with powertrain acoustic resonant modes.',
      freqBand: '80 Hz – 2.0 kHz',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Mic className="w-5 h-5 text-sky-600" />
          Acoustic Transducer & Environmental Noise Configuration
        </h2>
        <p className="text-xs text-slate-500">
          Calibrate microphone array aperture parameters, spatial aliasing boundaries, and acoustic interference profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Microphone Array Controls */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-600" />
              Microphone Array Transducer Geometry
            </h3>
            <span className="text-xs font-mono text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200 font-bold">
              {micArray.geometry.toUpperCase()} ULA
            </span>
          </div>

          {/* Number of Microphones */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Array Element Count (M)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([2, 4, 6, 8] as MicCount[]).map((count) => (
                <button
                  key={count}
                  onClick={() => setMicArray((prev) => ({ ...prev, micCount: count }))}
                  className={`py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    micArray.micCount === count
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {count} Mics
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Higher element counts narrow the spatial mainlobe and increase array gain (10 log₁₀ M).
            </p>
          </div>

          {/* Microphone Spacing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold">Inter-Element Spacing (d)</span>
              <span className="font-mono text-sky-700 font-bold">
                {(micArray.spacingMeters * 100).toFixed(1)} cm
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              {[0.02, 0.04, 0.08, 0.12].map((spacing) => (
                <button
                  key={spacing}
                  onClick={() => setMicArray((prev) => ({ ...prev, spacingMeters: spacing }))}
                  className={`py-1.5 rounded-lg cursor-pointer transition-colors ${
                    micArray.spacingMeters === spacing
                      ? 'bg-sky-50 text-sky-800 border-2 border-sky-500 font-bold'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {spacing * 100} cm
                </button>
              ))}
            </div>
          </div>

          {/* Sampling Rate */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Audio Sampling Rate (fs)
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {[16000, 48000].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setMicArray((prev) => ({ ...prev, samplingRateHz: rate }))}
                  className={`py-2 rounded-lg cursor-pointer transition-colors ${
                    micArray.samplingRateHz === rate
                      ? 'bg-sky-50 text-sky-800 border-2 border-sky-500 font-bold'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {rate / 1000} kHz {rate === 16000 ? '(Standard Speech / ASR)' : '(Studio Wideband)'}
                </button>
              ))}
            </div>
          </div>

          {/* Theoretical Physical Readouts Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
            <span className="text-[11px] uppercase tracking-wider text-slate-600 font-bold block">
              Calculated Acoustic Array Parameters
            </span>
            <div className="grid grid-cols-2 gap-2 tabular-nums">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[10px] block">Spatial Aliasing Frequency</span>
                <span className="text-slate-900 font-bold text-sm">
                  {Math.round(fAliasHz)} Hz
                </span>
                <span className="text-[10px] text-slate-500 block">f_alias = c / 2d</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[10px] block">Uncorrelated Array Gain</span>
                <span className="text-emerald-700 font-bold text-sm">
                  +{arrayGainDb.toFixed(1)} dB
                </span>
                <span className="text-[10px] text-slate-500 block">10 log₁₀(M)</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[10px] block">Mainlobe 3dB Beamwidth</span>
                <span className="text-sky-700 font-bold text-sm">
                  ~{beamwidthDeg.toFixed(1)}°
                </span>
                <span className="text-[10px] text-slate-500 block">@ 1.5 kHz broadside</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[10px] block">Total Array Aperture</span>
                <span className="text-purple-700 font-bold text-sm">
                  {((micArray.micCount - 1) * micArray.spacingMeters * 100).toFixed(1)} cm
                </span>
                <span className="text-[10px] text-slate-500 block">(M - 1) · d</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Acoustic Interference & SNR Controls */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-600" />
              Acoustic Noise Environment & SNR
            </h3>
            <span className="text-xs font-mono text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 font-bold">
              SNR: {noise.snrDb > 0 ? `+${noise.snrDb}` : noise.snrDb} dB
            </span>
          </div>

          {/* SNR Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Signal-to-Noise Ratio (dB)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {([10, 5, 0, -5, -10] as SNRLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setNoise((prev) => ({ ...prev, snrDb: level }))}
                  className={`py-2 text-xs font-mono font-bold rounded-lg cursor-pointer transition-colors ${
                    noise.snrDb === level
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {level > 0 ? `+${level}` : level} dB
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>+10 dB (Favorable)</span>
              <span>0 dB (Equal Power)</span>
              <span>-10 dB (Severe Adverse)</span>
            </div>
          </div>

          {/* Noise Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Noise Type Spectrum Profile
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {noiseProfiles.map((np) => {
                const isSelected = noise.type === np.type;
                return (
                  <button
                    key={np.type}
                    onClick={() => setNoise((prev) => ({ ...prev, type: np.type }))}
                    className={`p-2.5 rounded-lg text-left transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-400 text-slate-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className={isSelected ? 'text-amber-900 font-bold' : 'text-slate-900 font-semibold'}>
                        {np.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <p className="text-[10px] text-slate-600 line-clamp-2 mt-1 leading-snug">
                      {np.desc}
                    </p>
                    <span className="text-[10px] font-mono text-slate-500 block mt-1">
                      Band: {np.freqBand}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reverberation RT60 Info */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-semibold">Room Reverberation (RT60)</span>
              <span className="font-mono text-sky-700 font-bold">{room.rt60Seconds.toFixed(2)} s</span>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.95"
              step="0.05"
              value={room.rt60Seconds}
              onChange={(e) => setRoom((prev) => ({ ...prev, rt60Seconds: parseFloat(e.target.value) }))}
              className="w-full accent-sky-600 bg-slate-200 h-2 rounded cursor-pointer"
            />
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Early room reflections cause destructive phase comb-filtering at the microphones, shifting the apparent acoustic Direction of Arrival (DOA).
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
