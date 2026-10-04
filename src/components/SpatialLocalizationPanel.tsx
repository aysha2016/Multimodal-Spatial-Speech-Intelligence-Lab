/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Section 9: Speaker Localization Research Simulation (White Laboratory Theme)
 * Mode A (Audio Only), Mode B (Visual Only), Mode C (Audio + Visual Fusion)
 */

import React, { useState } from 'react';
import {
  Speaker,
  MicrophoneArrayConfig,
  CameraConfig,
  RoomAcoustics,
  NoiseSourceConfig,
  ProcessingMode
} from '../types/research';
import {
  computeDOAResults,
  computeBeamformingSpectrum,
  calculateTDOAMicroseconds,
  calculateBeamwidthDeg
} from '../utils/acousticEngine';
import {
  Compass,
  Layers,
  Radio,
  Eye,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

interface SpatialLocalizationPanelProps {
  speakers: Speaker[];
  micArray: MicrophoneArrayConfig;
  camera: CameraConfig;
  room: RoomAcoustics;
  noise: NoiseSourceConfig;
}

export const SpatialLocalizationPanel: React.FC<SpatialLocalizationPanelProps> = ({
  speakers,
  micArray,
  camera,
  room,
  noise,
}) => {
  const [activeMode, setActiveMode] = useState<ProcessingMode>('audio_visual');
  const activeSpeakers = speakers.filter((s) => s.active);

  const doaResults = computeDOAResults(activeSpeakers, micArray, camera, room, noise);
  const spectrumPoints = computeBeamformingSpectrum(activeSpeakers, doaResults, micArray, noise);
  const beamwidthDeg = calculateBeamwidthDeg(micArray.micCount, micArray.spacingMeters);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-600" />
            Spatial Direction of Arrival (DOA) Localization
          </h2>
          <p className="text-xs text-slate-500">
            Acoustic phase interferometry (TDOA), optical perspective transformation, and Bayesian Kalman audio-visual fusion.
          </p>
        </div>

        {/* Processing Mode Segmented Control */}
        <div className="flex items-center gap-1 bg-white border border-slate-300 p-1 rounded-xl text-xs font-medium shadow-xs">
          <button
            onClick={() => setActiveMode('audio_only')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              activeMode === 'audio_only'
                ? 'bg-amber-500 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mode A: Audio Only
          </button>
          <button
            onClick={() => setActiveMode('visual_only')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              activeMode === 'visual_only'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mode B: Visual Only
          </button>
          <button
            onClick={() => setActiveMode('audio_visual')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              activeMode === 'audio_visual'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mode C: Audio + Visual Fusion
          </button>
        </div>
      </div>

      {/* Main Grid: Polar Angular Spectrum & Detailed Comparison Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Angular Power Spectrum Plot (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              Spatial Angular Spectrum Response P(θ) [-90°, +90°]
            </h3>
            <span className="font-mono text-slate-500">Array 3dB BW: ~{beamwidthDeg.toFixed(1)}°</span>
          </div>

          {/* SVG Angular Power Chart on pure white background */}
          <div className="relative aspect-[21/9] w-full bg-slate-50/50 rounded-lg border border-slate-300 p-2 overflow-hidden shadow-inner">
            <svg viewBox="-95 -10 190 120" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              {[-90, -60, -30, 0, 30, 60, 90].map((ang) => (
                <g key={ang}>
                  <line
                    x1={ang}
                    y1={0}
                    x2={ang}
                    y2={100}
                    stroke="#e2e8f0"
                    strokeWidth="0.8"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={ang}
                    y={112}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="6"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {ang > 0 ? `+${ang}` : ang}°
                  </text>
                </g>
              ))}

              {/* Baseline Horizontal Zero Line */}
              <line x1="-90" y1="100" x2="90" y2="100" stroke="#94a3b8" strokeWidth="1" />

              {/* Mode A: Audio SRP-PHAT Power Curve */}
              {(activeMode === 'audio_only' || activeMode === 'audio_visual') && (
                <polyline
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="1.8"
                  strokeOpacity={activeMode === 'audio_visual' ? '0.5' : '1.0'}
                  points={spectrumPoints
                    .map((p) => `${p.angle},${100 - p.audioPower * 95}`)
                    .join(' ')}
                />
              )}

              {/* Mode B: Visual Optical Likelihood Curve */}
              {(activeMode === 'visual_only' || activeMode === 'audio_visual') && (
                <polyline
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="1.8"
                  strokeDasharray={activeMode === 'audio_visual' ? '3,2' : undefined}
                  strokeOpacity={activeMode === 'audio_visual' ? '0.55' : '1.0'}
                  points={spectrumPoints
                    .map((p) => `${p.angle},${100 - p.visualLikelihood * 95}`)
                    .join(' ')}
                />
              )}

              {/* Mode C: Fused Posterior Peak Curve */}
              {activeMode === 'audio_visual' && (
                <polyline
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.8"
                  points={spectrumPoints
                    .map((p) => `${p.angle},${100 - p.fusedPosterior * 95}`)
                    .join(' ')}
                />
              )}

              {/* Ground Truth True DOA Vertical Markers */}
              {doaResults.map((res, idx) => {
                const spk = activeSpeakers[idx];
                return (
                  <g key={res.speakerId}>
                    <line
                      x1={res.trueDOA}
                      y1={0}
                      x2={res.trueDOA}
                      y2={100}
                      stroke={spk?.color || '#0284c7'}
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={res.trueDOA}
                      cy={10}
                      r="2.5"
                      fill={spk?.color || '#0284c7'}
                    />
                    <text
                      x={res.trueDOA}
                      y={6}
                      textAnchor="middle"
                      fill="#0f172a"
                      fontSize="5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {spk?.label}: {res.trueDOA > 0 ? `+${res.trueDOA}` : res.trueDOA}°
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-600 pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-1 bg-amber-500 inline-block rounded" /> Mode A: Audio SRP-PHAT
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-1 bg-purple-600 inline-block rounded" /> Mode B: Optical Centroid
              </span>
              <span className="flex items-center gap-1.5 font-bold text-sky-800">
                <span className="w-3 h-1.5 bg-sky-600 inline-block rounded" /> Mode C: MAP Fusion
              </span>
            </div>
            <span className="text-slate-500 font-semibold">True DOA = Vertical Solid Lines</span>
          </div>
        </div>

        {/* Right: Exact Numerical Readouts from Prompt (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-600" />
                DOA Error Analysis: |True DOA - Estimated DOA|
              </h3>
              <span className="text-xs font-mono text-slate-500">Unit: Degrees (°)</span>
            </div>

            {/* Per-speaker exact table adhering to prompt specification */}
            <div className="space-y-4">
              {doaResults.map((res, idx) => {
                const spk = activeSpeakers[idx];
                const tdoaUs = calculateTDOAMicroseconds(res.trueDOA, micArray.spacingMeters);

                return (
                  <div
                    key={res.speakerId}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: spk?.color }} />
                        <span className="font-bold text-slate-900">{spk?.label} ({spk?.name})</span>
                      </div>
                      <span className="text-slate-600 font-semibold">
                        True DOA: <span className="text-slate-950 font-bold">{res.trueDOA > 0 ? `+${res.trueDOA}` : res.trueDOA}°</span>
                      </span>
                    </div>

                    {/* Mode Comparison Table */}
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] tabular-nums">
                      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-amber-700 text-[10px] block font-sans font-semibold">Audio-Only</span>
                        <span className="text-slate-900 font-semibold">{res.audioDOA > 0 ? `+${res.audioDOA}` : res.audioDOA}°</span>
                        <span className="text-amber-700 text-[10px] block mt-0.5 font-bold">
                          Error: {res.audioError.toFixed(1)}°
                        </span>
                      </div>

                      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-purple-700 text-[10px] block font-sans font-semibold">Visual-Only</span>
                        <span className="text-slate-900 font-semibold">{res.visualDOA > 0 ? `+${res.visualDOA}` : res.visualDOA}°</span>
                        <span className="text-purple-700 text-[10px] block mt-0.5 font-bold">
                          Error: {res.visualError.toFixed(1)}°
                        </span>
                      </div>

                      <div className="bg-sky-50 p-2 rounded-lg border border-sky-300 shadow-2xs">
                        <span className="text-sky-800 text-[10px] block font-sans font-bold">Audio + Visual</span>
                        <span className="text-sky-950 font-bold">{res.fusedDOA > 0 ? `+${res.fusedDOA}` : res.fusedDOA}°</span>
                        <span className="text-emerald-700 text-[10px] block mt-0.5 font-bold">
                          Error: {res.fusedError.toFixed(1)}°
                        </span>
                      </div>
                    </div>

                    {/* Acoustic TDOA delay readout */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                      <span>Inter-Mic Delay (Δτ₁₂):</span>
                      <span className="text-slate-900 font-bold">{tdoaUs > 0 ? `+${tdoaUs.toFixed(1)}` : tdoaUs.toFixed(1)} μs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Research Insight Card */}
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2 text-xs">
            <h4 className="font-semibold text-sky-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
              Hypothesis H1 Verification Note
            </h4>
            <p className="text-sky-800 leading-relaxed">
              Notice how Audio-Only error expands significantly as Room Reverberation (RT60 = {room.rt60Seconds}s) increases due to wall multipath reflection rays. The optical camera provides an orthogonal line-of-sight constraint that stabilizes the fused DOA error to &lt;2.5°.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
