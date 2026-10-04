/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Section 11: Automatic Speech Recognition (ASR) Analysis Panel (White Laboratory Theme)
 * Reference vs Hypothesis Transcript with Levenshtein Alignment & WER/CER
 */

import React, { useState } from 'react';
import {
  Speaker,
  RoomAcoustics,
  NoiseSourceConfig
} from '../types/research';
import { computeASRMetrics } from '../utils/acousticEngine';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';

interface ASRAnalysisPanelProps {
  speakers: Speaker[];
  noise: NoiseSourceConfig;
  room: RoomAcoustics;
}

export const ASRAnalysisPanel: React.FC<ASRAnalysisPanelProps> = ({
  speakers,
  noise,
  room,
}) => {
  const activeSpeakers = speakers.filter((s) => s.active);
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>(activeSpeakers[0]?.id || 'spk_a');

  const selectedSpeaker = speakers.find((s) => s.id === selectedSpeakerId) || activeSpeakers[0];
  const asrResults = selectedSpeaker
    ? computeASRMetrics(selectedSpeaker, noise.snrDb, room.rt60Seconds, 5.0)
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            Automatic Speech Recognition (ASR) Evaluation
          </h2>
          <p className="text-xs text-slate-500">
            Downstream acoustic model transcript decoding. Compares Word Error Rate (WER) across Audio-Only, Spatial MVDR, and Audio-Visual SepFormer pipelines.
          </p>
        </div>

        {/* Speaker Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Evaluate Speaker:</span>
          <div className="flex items-center gap-1 bg-white border border-slate-300 p-1 rounded-xl shadow-xs">
            {activeSpeakers.map((spk) => (
              <button
                key={spk.id}
                onClick={() => setSelectedSpeakerId(spk.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-colors ${
                  selectedSpeakerId === spk.id
                    ? 'bg-sky-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {spk.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedSpeaker && asrResults && (
        <div className="space-y-6">
          {/* Ground Truth Reference Transcript Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedSpeaker.color }} />
                Ground Truth Reference Transcript ({selectedSpeaker.label} · {selectedSpeaker.name}):
              </span>
              <span className="text-slate-500">{asrResults.audioVisual.wordCount} Words</span>
            </div>
            <p className="text-base font-mono font-bold text-slate-900 bg-slate-50 p-3.5 rounded-lg border border-slate-200 shadow-inner">
              "{selectedSpeaker.referenceTranscript}"
            </p>
          </div>

          {/* 3 Pipeline Comparison Columns: Audio-Only vs Spatial Separation vs Audio-Visual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pipeline 1: Audio-Only */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 flex flex-col justify-between shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-amber-800">Audio-Only Processing</h4>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 font-bold">
                    WER: {asrResults.audioOnly.wer}%
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Hypothesis Transcript:</span>
                  <p className="text-xs font-mono text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 min-h-[64px] leading-relaxed shadow-2xs">
                    "{asrResults.audioOnly.hypothesis}"
                  </p>
                </div>

                {/* Word Error Breakdown */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-mono tabular-nums">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Substitutions</span>
                    <span className="text-amber-700 font-bold">{asrResults.audioOnly.substitutions}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Deletions</span>
                    <span className="text-red-700 font-bold">{asrResults.audioOnly.deletions}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Insertions</span>
                    <span className="text-purple-700 font-bold">{asrResults.audioOnly.insertions}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                <span>Confidence: {asrResults.audioOnly.confidence}%</span>
                <span>CER: {asrResults.audioOnly.cer}%</span>
              </div>
            </div>

            {/* Pipeline 2: Spatial Separation */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 flex flex-col justify-between shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-purple-800">Spatial Separation (MVDR)</h4>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-300 text-purple-800 font-bold">
                    WER: {asrResults.spatial.wer}%
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Hypothesis Transcript:</span>
                  <p className="text-xs font-mono text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 min-h-[64px] leading-relaxed shadow-2xs">
                    "{asrResults.spatial.hypothesis}"
                  </p>
                </div>

                {/* Word Error Breakdown */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-mono tabular-nums">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Substitutions</span>
                    <span className="text-amber-700 font-bold">{asrResults.spatial.substitutions}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Deletions</span>
                    <span className="text-red-700 font-bold">{asrResults.spatial.deletions}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Insertions</span>
                    <span className="text-purple-700 font-bold">{asrResults.spatial.insertions}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                <span>Confidence: {asrResults.spatial.confidence}%</span>
                <span>CER: {asrResults.spatial.cer}%</span>
              </div>
            </div>

            {/* Pipeline 3: Audio + Visual Separation */}
            <div className="bg-white border-2 border-sky-400 rounded-xl p-5 space-y-4 flex flex-col justify-between shadow-md">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-sky-900">Audio + Visual Separation</h4>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold">
                    WER: {asrResults.audioVisual.wer}%
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Hypothesis Transcript:</span>
                  <p className="text-xs font-mono text-emerald-950 font-semibold bg-emerald-50/50 p-3 rounded-lg border border-emerald-200 min-h-[64px] leading-relaxed">
                    "{asrResults.audioVisual.hypothesis}"
                  </p>
                </div>

                {/* Word Error Breakdown */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-mono tabular-nums">
                  <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200">
                    <span className="text-slate-600 text-[10px] block">Substitutions</span>
                    <span className="text-emerald-700 font-bold">{asrResults.audioVisual.substitutions}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200">
                    <span className="text-slate-600 text-[10px] block">Deletions</span>
                    <span className="text-emerald-700 font-bold">{asrResults.audioVisual.deletions}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200">
                    <span className="text-slate-600 text-[10px] block">Insertions</span>
                    <span className="text-emerald-700 font-bold">{asrResults.audioVisual.insertions}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-600 flex items-center justify-between">
                <span className="text-emerald-700 font-bold">Confidence: {asrResults.audioVisual.confidence}%</span>
                <span>CER: {asrResults.audioVisual.cer}%</span>
              </div>
            </div>
          </div>

          {/* Research Hypothesis H3 Confirmation Box */}
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2 text-xs">
            <h4 className="font-semibold text-sky-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
              Hypothesis H3 Empirical Evidence
            </h4>
            <p className="text-sky-800 leading-relaxed">
              When acoustic-only beamforming steers with an angular error, it introduces spectral notch attenuation on unvoiced fricatives and stop bursts (e.g. /p/, /t/, /k/). Optical lip reading constrains the phonetic search space, reducing WER to {asrResults.audioVisual.wer}%.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
