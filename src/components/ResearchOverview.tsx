/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Research Overview: Visual Architecture, Core Research Questions (RQ1-RQ5), and Hypotheses (H1-H5)
 */

import React from 'react';
import {
  RESEARCH_QUESTIONS,
  RESEARCH_HYPOTHESES,
} from '../types/../utils/researchData';
import {
  Mic,
  Video,
  Target,
  Layers,
  Sparkles,
  UserCheck,
  FileText,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';

interface ResearchOverviewProps {
  onNavigateTab: (tabId: string) => void;
}

export const ResearchOverview: React.FC<ResearchOverviewProps> = ({ onNavigateTab }) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Research Abstract Banner */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span>Investigation Program: Spatial-Visual Cross-Modal Speech</span>
            <span aria-hidden="true">·</span>
            <span>Version: 2026.1-Eval</span>
            <span aria-hidden="true">·</span>
            <span className="text-sky-600 font-semibold">Simulation Framework</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Multimodal Spatial Speech Intelligence in Multi-Speaker Environments
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Investigating how visual information (facial pose, lip motion, gaze direction) and spatial information (microphone array geometry, TDOA, beamforming null-steering) can synergistically overcome the classic cocktail party problem, severe acoustic reverberation, and low signal-to-noise ratios.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-500 font-mono">
            <div>
              <span className="text-slate-400">Core Objective: </span>
              <span className="text-slate-800 font-medium">Robustness at SNR ≤ 0 dB</span>
            </div>
            <div>
              <span className="text-slate-400">Separation Paradigm: </span>
              <span className="text-slate-800 font-medium">Spatial MVDR + AV-SepFormer</span>
            </div>
            <div>
              <span className="text-slate-400">Acoustic Channels: </span>
              <span className="text-slate-800 font-medium">2 to 8 Mics (ULA / UCA)</span>
            </div>
          </div>
        </div>

        {/* Scientific Integrity Notice Box */}
        <div className="mt-5 p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-800">Scientific Integrity Declaration: </span>
            This research simulation uses transparent physics-grounded acoustic propagation formulations (Sabine room impulse modeling, delay-and-sum beam patterns, and documented AV-SepFormer benchmarks). No experimental results are fabricated. Values are explicitly labeled as <span className="font-mono text-sky-700 font-bold">Simulated / Illustrative</span>.
          </div>
        </div>
      </section>

      {/* Section 23: Visual Research Architecture Pipeline */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">
            Research Processing Pipeline Architecture
          </h3>
          <span className="text-xs text-slate-500 font-mono">End-to-End Signal & Semantic Flow</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm overflow-x-auto">
          <div className="min-w-[860px] flex items-center justify-between text-xs">
            {/* Step 1: Sensors */}
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-slate-50 border border-slate-200 w-36 shrink-0">
              <div className="flex items-center gap-2 text-sky-600 mb-1.5">
                <Mic className="w-4 h-4" />
                <span className="text-slate-400">+</span>
                <Video className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-800">Microphone Array & Camera</span>
              <span className="text-[10px] text-slate-500 mt-1">Multi-ch Audio + RGB Video</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step 2: Multimodal Perception */}
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-slate-50 border border-slate-200 w-36 shrink-0">
              <Sparkles className="w-4 h-4 text-indigo-600 mb-1.5" />
              <span className="font-semibold text-slate-800">Multimodal Perception</span>
              <span className="text-[10px] text-slate-500 mt-1">Dual-stream VAD & Face Centroid</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step 3: Speaker Detection */}
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-slate-50 border border-slate-200 w-36 shrink-0">
              <Target className="w-4 h-4 text-emerald-600 mb-1.5" />
              <span className="font-semibold text-slate-800">Speaker Detection</span>
              <span className="text-[10px] text-slate-500 mt-1">Acoustic & Lip Synchrony</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step 4: Spatial Localization */}
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-slate-50 border border-slate-200 w-36 shrink-0">
              <Layers className="w-4 h-4 text-sky-600 mb-1.5" />
              <span className="font-semibold text-slate-800">AV Localization</span>
              <span className="text-[10px] text-slate-500 mt-1">TDOA + Optical Angle Kalman</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step 5: Separation & Enhancement */}
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-slate-50 border border-slate-200 w-36 shrink-0">
              <Sparkles className="w-4 h-4 text-amber-600 mb-1.5" />
              <span className="font-semibold text-slate-800">Speech Separation</span>
              <span className="text-[10px] text-slate-500 mt-1">Spatial Beamforming + AV Mask</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step 6: Downstream ASR & ID */}
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-slate-50 border border-slate-200 w-36 shrink-0">
              <div className="flex items-center gap-1.5 text-purple-600 mb-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-slate-800">ASR & Speaker ID</span>
              <span className="text-[10px] text-slate-500 mt-1">Transcript & Voice Cosine</span>
            </div>
          </div>

          {/* Bottom Evaluation Banner */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
              Research Evaluation Metrics:
            </span>
            <div className="flex items-center gap-3 text-sky-700 font-semibold">
              <span>DOA Error (°)</span>
              <span className="text-slate-300">·</span>
              <span>SI-SDR (dB)</span>
              <span className="text-slate-300">·</span>
              <span>STOI</span>
              <span className="text-slate-300">·</span>
              <span>PESQ</span>
              <span className="text-slate-300">·</span>
              <span>WER (%)</span>
              <span className="text-slate-300">·</span>
              <span>F1-Score</span>
              <span className="text-slate-300">·</span>
              <span>Latency (ms)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid: Core Research Questions (RQ1-RQ5) & Hypotheses (H1-H5) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Research Questions (RQ1-RQ5) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">
              Core Research Questions (RQ1–RQ5)
            </h3>
            <span className="text-xs text-slate-500 font-mono">Empirical Status</span>
          </div>

          <div className="space-y-3">
            {RESEARCH_QUESTIONS.map((rq) => (
              <div
                key={rq.id}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-sky-700">
                      {rq.id}
                    </span>
                    <span className="text-slate-300">·</span>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {rq.title}
                    </h4>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold">
                    {rq.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 italic font-mono bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed">
                  "{rq.question}"
                </p>

                <div className="text-xs space-y-1 text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-500 font-mono">Observed Finding: </span>
                    <span className="text-slate-800 font-medium">{rq.findings}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono">Acoustic/Physical Basis: </span>
                    <span className="text-slate-600">{rq.empiricalEvidence}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Research Hypotheses (H1-H5) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">
              Formal Hypotheses (H1–H5)
            </h3>
            <span className="text-xs text-slate-500 font-mono">Validation Criteria</span>
          </div>

          <div className="space-y-3">
            {RESEARCH_HYPOTHESES.map((h) => (
              <div
                key={h.id}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-indigo-700">
                      {h.id}
                    </span>
                    <span className="text-slate-300">·</span>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {h.title}
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {h.validationStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-sans leading-relaxed">
                  {h.statement}
                </p>

                <div className="bg-slate-50 p-2 rounded border border-slate-200 space-y-1 text-[11px] font-mono">
                  <div className="text-slate-600">
                    <span className="text-slate-400">Condition: </span>
                    <span className="text-sky-800 font-semibold">{h.formalCondition}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>{h.confidenceInterval}</span>
                    <span className="text-emerald-700 font-bold">{h.pValEstimated}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Quick Launchpad to 3D and 2D Simulators */}
      <section className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Explore Interactive Physical Acoustics</h4>
          <p className="text-xs text-slate-600">Inspect 3D spatial beamforming directivity lobes in WebGL or adjust transducer geometry in the 2D plan.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('three_d')}
            className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm shadow-sky-600/20 transition-colors cursor-pointer"
          >
            Launch 3D Spatial Room
          </button>
          <button
            onClick={() => onNavigateTab('speech_noise')}
            className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            Speech & Noise Studio
          </button>
          <button
            onClick={() => onNavigateTab('environment')}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            2D Room Plan
          </button>
          <button
            onClick={() => onNavigateTab('ablation')}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Ablation Matrix
          </button>
        </div>
      </section>
    </div>
  );
};
