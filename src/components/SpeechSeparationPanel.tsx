/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Section 10: Speech Separation Experiment & Signal Flow (White Laboratory Theme)
 * Baseline Mixed vs Audio-Only MVDR vs Audio-Visual SepFormer Separation
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  Speaker,
  MicrophoneArrayConfig,
  RoomAcoustics,
  NoiseSourceConfig
} from '../types/research';
import {
  calculateSeparationMetrics,
  computeDOAResults
} from '../utils/acousticEngine';
import {
  audioSynthesizer,
  drawWaveform,
  drawSpectrogram
} from '../utils/audioSynthesizer';
import {
  Layers,
  Play,
  Square,
  Volume2,
  ArrowRight,
  Sparkles,
  Info,
  Sliders,
  Activity
} from 'lucide-react';

interface SpeechSeparationPanelProps {
  speakers: Speaker[];
  micArray: MicrophoneArrayConfig;
  room: RoomAcoustics;
  noise: NoiseSourceConfig;
}

export const SpeechSeparationPanel: React.FC<SpeechSeparationPanelProps> = ({
  speakers,
  micArray,
  room,
  noise,
}) => {
  const [selectedModality, setSelectedModality] = useState<'baseline' | 'audio_only' | 'audio_visual'>('audio_visual');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);

  // Waveform canvas refs
  const mixedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const spkACanvasRef = useRef<HTMLCanvasElement | null>(null);
  const spkBCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const noiseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const spectrogramCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeSpeakers = speakers.filter((s) => s.active);
  const doaResults = computeDOAResults(activeSpeakers, micArray, { position: { x: 0, y: 0.2 }, fovDegrees: 90, yawDegrees: 0, resolution: '1080p', occlusionMode: 'none' }, room, noise);
  const avgDoaError = doaResults.length > 0 ? doaResults.reduce((acc, r) => acc + r.audioError, 0) / doaResults.length : 5.0;

  // Calculate scientific metrics for all 3 pipelines
  const metricsBaseline = calculateSeparationMetrics('baseline', noise.snrDb, micArray.micCount, room.rt60Seconds, activeSpeakers.length, avgDoaError);
  const metricsAudioOnly = calculateSeparationMetrics('audio_only', noise.snrDb, micArray.micCount, room.rt60Seconds, activeSpeakers.length, avgDoaError);
  const metricsAudioVisual = calculateSeparationMetrics('audio_visual', noise.snrDb, micArray.micCount, room.rt60Seconds, activeSpeakers.length, avgDoaError);

  const currentMetrics =
    selectedModality === 'baseline'
      ? metricsBaseline
      : selectedModality === 'audio_only'
      ? metricsAudioOnly
      : metricsAudioVisual;

  // Draw waveforms and spectrograms
  useEffect(() => {
    if (mixedCanvasRef.current) drawWaveform(mixedCanvasRef.current, 'mixed', noise.snrDb);
    if (spkACanvasRef.current) drawWaveform(spkACanvasRef.current, 'speaker_a', noise.snrDb);
    if (spkBCanvasRef.current) drawWaveform(spkBCanvasRef.current, 'speaker_b', noise.snrDb);
    if (noiseCanvasRef.current) drawWaveform(noiseCanvasRef.current, 'noise', noise.snrDb);
    if (spectrogramCanvasRef.current) {
      drawSpectrogram(
        spectrogramCanvasRef.current,
        selectedModality === 'baseline' ? 'mixed' : selectedModality === 'audio_only' ? 'speaker_a' : 'separated_av',
        noise.snrDb
      );
    }
  }, [noise.snrDb, selectedModality, activeSpeakers]);

  // Handle Playback Audition with Real Human Speech & Acoustic Noise
  const handlePlay = (track: 'mixed' | 'audio_only' | 'audio_visual') => {
    if (isPlaying && playingTrack === track) {
      audioSynthesizer.stop();
      setIsPlaying(false);
      setPlayingTrack(null);
      return;
    }

    setPlayingTrack(track);
    setIsPlaying(true);

    const spkA = speakers.find((s) => s.id === 'spk_a') || speakers[0];
    const spkB = speakers.find((s) => s.id === 'spk_b') || speakers[1] || speakers[0];

    audioSynthesizer.playSeparationExperiment(
      track,
      spkA?.referenceTranscript || 'Please bring the calibration package from room three.',
      spkB?.referenceTranscript || 'Verify that the microphone array spacing is four centimeters.',
      noise.type,
      noise.snrDb,
      () => {
        setIsPlaying(false);
        setPlayingTrack(null);
      }
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-sky-600" />
            Speech Separation & Beamforming Experiment
          </h2>
          <p className="text-xs text-slate-500">
            Compare acoustic baseline vs. Spatial MVDR vs. Audio-Visual SepFormer neural masking.
          </p>
        </div>

        {/* Scientific Disclaimer Badge */}
        <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700">
          <span className="text-sky-700 font-bold">Mode: </span>
          Simulation / illustrative result
        </div>
      </div>

      {/* Conceptual Signal Flow Diagram required by prompt */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
          Conceptual Processing Signal Flow
        </h3>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex-1 min-w-[150px] p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-center">
            <span className="text-amber-800 font-bold block text-sm">1. Mixed Audio</span>
            <span className="text-slate-500 text-[10px] block mt-0.5">{micArray.micCount} channels + Noise</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

          <div className="flex-1 min-w-[150px] p-3 rounded-lg bg-purple-50/60 border border-purple-200 text-center">
            <span className="text-purple-800 font-bold block text-sm">2. Localization</span>
            <span className="text-slate-500 text-[10px] block mt-0.5">TDOA + Visual Prior</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

          <div className="flex-1 min-w-[150px] p-3 rounded-lg bg-sky-50/60 border border-sky-200 text-center">
            <span className="text-sky-800 font-bold block text-sm">3. Beamforming</span>
            <span className="text-slate-500 text-[10px] block mt-0.5">Speaker-Specific Nulls</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

          <div className="flex-1 min-w-[150px] p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-center">
            <span className="text-emerald-800 font-bold block text-sm">4. Separated Signals</span>
            <span className="text-slate-500 text-[10px] block mt-0.5">Isolated Target Streams</span>
          </div>
        </div>
      </section>

      {/* Pipeline Comparison & Audio Auditioning Controller */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pipeline 1: Baseline */}
        <div
          onClick={() => setSelectedModality('baseline')}
          className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
            selectedModality === 'baseline'
              ? 'bg-amber-50/50 border-amber-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-amber-800">Baseline</h4>
            <span className="text-[11px] font-mono text-slate-500">Unprocessed</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Composite mixed microphone signal with multi-speaker overlap and {noise.type} noise.
          </p>

          <div className="space-y-1 font-mono text-xs tabular-nums pt-1 border-t border-slate-200">
            <div className="flex justify-between text-slate-600">
              <span>SI-SDR:</span>
              <span className="text-slate-900 font-bold">{metricsBaseline.siSdrDb} dB</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>STOI:</span>
              <span className="text-slate-900">{metricsBaseline.stoi.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>PESQ:</span>
              <span className="text-slate-900">{metricsBaseline.pesq.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlay('mixed');
            }}
            className="w-full py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-xs transition-colors"
          >
            {isPlaying && playingTrack === 'mixed' ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Mixed Audio</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Listen: Mixed Scene</span>
              </>
            )}
          </button>
        </div>

        {/* Pipeline 2: Audio-Only MVDR */}
        <div
          onClick={() => setSelectedModality('audio_only')}
          className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
            selectedModality === 'audio_only'
              ? 'bg-purple-50/50 border-purple-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-purple-800">Audio-Only MVDR</h4>
            <span className="text-[11px] font-mono text-slate-500">Spatial Filtering</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Minimum Variance Distortionless Response beamforming using acoustic TDOA steering vector.
          </p>

          <div className="space-y-1 font-mono text-xs tabular-nums pt-1 border-t border-slate-200">
            <div className="flex justify-between text-slate-600">
              <span>SI-SDR:</span>
              <span className="text-slate-900 font-bold">+{metricsAudioOnly.siSdrDb} dB</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>STOI:</span>
              <span className="text-slate-900">{metricsAudioOnly.stoi.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>PESQ:</span>
              <span className="text-slate-900">{metricsAudioOnly.pesq.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlay('audio_only');
            }}
            className="w-full py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs transition-colors"
          >
            {isPlaying && playingTrack === 'audio_only' ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Filtered Audio</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Listen: MVDR Separated</span>
              </>
            )}
          </button>
        </div>

        {/* Pipeline 3: Audio-Visual SepFormer */}
        <div
          onClick={() => setSelectedModality('audio_visual')}
          className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
            selectedModality === 'audio_visual'
              ? 'bg-sky-50/60 border-sky-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-sky-800">Audio-Visual Fusion</h4>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">Recommended</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Steered spatial beamforming guided by visual lip optic flow and face spatial direction priors.
          </p>

          <div className="space-y-1 font-mono text-xs tabular-nums pt-1 border-t border-slate-200">
            <div className="flex justify-between text-slate-600">
              <span>SI-SDR:</span>
              <span className="text-emerald-700 font-bold">+{metricsAudioVisual.siSdrDb} dB</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>STOI:</span>
              <span className="text-emerald-700 font-bold">{metricsAudioVisual.stoi.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>PESQ:</span>
              <span className="text-emerald-700 font-bold">{metricsAudioVisual.pesq.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlay('audio_visual');
            }}
            className="w-full py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white cursor-pointer shadow-xs transition-colors"
          >
            {isPlaying && playingTrack === 'audio_visual' ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Target Audio</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Listen: Target Speaker A</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Waveforms & Spectrogram Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 4 Individual Waveforms (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              Real-Time Oscillograms: Extracted Time-Domain Signals
            </h3>
            <span className="font-mono text-slate-500">Amplitude vs Time</span>
          </div>

          <div className="space-y-3">
            {/* Waveform 1: Mixed Audio */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-amber-800 font-bold">Mixed Input Signal (Mic #1 Reference)</span>
                <span className="text-slate-500">Composite Waveform</span>
              </div>
              <div className="h-14 w-full rounded border border-slate-200 overflow-hidden bg-white">
                <canvas ref={mixedCanvasRef} width={680} height={56} className="w-full h-full" />
              </div>
            </div>

            {/* Waveform 2: Speaker A Separated */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-800 font-bold">Speaker A (Dr. Elena Vance) · Extracted Target</span>
                <span className="text-slate-500">Vocal Formants Filtered</span>
              </div>
              <div className="h-14 w-full rounded border border-slate-200 overflow-hidden bg-white">
                <canvas ref={spkACanvasRef} width={680} height={56} className="w-full h-full" />
              </div>
            </div>

            {/* Waveform 3: Speaker B Separated */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-purple-800 font-bold">Speaker B (Prof. Marcus Chen) · Extracted Interferer</span>
                <span className="text-slate-500">Secondary Channel</span>
              </div>
              <div className="h-14 w-full rounded border border-slate-200 overflow-hidden bg-white">
                <canvas ref={spkBCanvasRef} width={680} height={56} className="w-full h-full" />
              </div>
            </div>

            {/* Waveform 4: Residual Background Noise */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-red-800 font-bold">Residual Noise & Acoustic Clutter</span>
                <span className="text-slate-500">{noise.type} noise profile</span>
              </div>
              <div className="h-14 w-full rounded border border-slate-200 overflow-hidden bg-white">
                <canvas ref={noiseCanvasRef} width={680} height={56} className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Spectrogram & Quantitative Separation Metrics (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Spectrogram Waterfall */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <h3 className="font-semibold text-slate-900">Spectrogram Waterfall (0–8 kHz)</h3>
              <span className="font-mono text-sky-700 font-bold uppercase">{selectedModality.replace('_', ' ')}</span>
            </div>
            <div className="aspect-[16/9] w-full rounded-lg border border-slate-300 bg-white overflow-hidden shadow-inner">
              <canvas ref={spectrogramCanvasRef} width={480} height={270} className="w-full h-full" />
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Notice how the target harmonic formant tracks remain sharp in Audio+Visual mode while diffuse background noise is scrubbed.
            </p>
          </div>

          {/* Quantitative Metrics Cards */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-semibold text-slate-900">Objective Quality Metrics</span>
              <span className="text-slate-500">Benchmark Transfer Functions</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 tabular-nums">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">SI-SDR</span>
                <span className="text-sky-700 font-bold text-base">
                  {currentMetrics.siSdrDb > 0 ? `+${currentMetrics.siSdrDb}` : currentMetrics.siSdrDb} dB
                </span>
                <span className="text-[10px] text-slate-500 block">Scale-Invariant SDR</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">SNR Improvement</span>
                <span className="text-emerald-700 font-bold text-base">
                  +{currentMetrics.snrImprovementDb} dB
                </span>
                <span className="text-[10px] text-slate-500 block">Δ Output vs Input</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">STOI Intelligibility</span>
                <span className="text-purple-700 font-bold text-base">
                  {currentMetrics.stoi.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 block">0.00 to 1.00 index</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">PESQ Speech Quality</span>
                <span className="text-amber-700 font-bold text-base">
                  {currentMetrics.pesq.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 block">1.00 to 4.50 MOS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
