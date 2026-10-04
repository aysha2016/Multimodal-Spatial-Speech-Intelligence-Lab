/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Section 12: Speaker Identification Experiment (White Laboratory Theme)
 * Audio-Only vs Audio + Visual Speaker Identification
 */

import React from 'react';
import { Speaker, SNRLevel } from '../types/research';
import { computeSpeakerIDMetrics } from '../utils/acousticEngine';
import {
  UserCheck,
  Fingerprint,
  Eye,
  Sparkles,
  CheckCircle2,
  BarChart3
} from 'lucide-react';

interface SpeakerIdentificationPanelProps {
  speakers: Speaker[];
  snrDb: SNRLevel;
}

export const SpeakerIdentificationPanel: React.FC<SpeakerIdentificationPanelProps> = ({
  speakers,
  snrDb,
}) => {
  const activeSpeakers = speakers.filter((s) => s.active);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-sky-600" />
          Multimodal Speaker Identification (ID) & Verification
        </h2>
        <p className="text-xs text-slate-500">
          Combines acoustic speaker embeddings (ECAPA-TDNN / x-vector) with facial biometric embeddings (ArcFace) for robust identity verification in noise.
        </p>
      </div>

      {/* Speaker ID Experiment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeSpeakers.map((spk) => {
          const metrics = computeSpeakerIDMetrics(spk, snrDb, spk.faceDetected, spk.lipActivity);

          return (
            <div
              key={spk.id}
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 hover:border-slate-300 shadow-sm transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: spk.color }} />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{spk.label}</h3>
                    <p className="text-xs text-slate-500">{spk.name}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-xs font-mono font-bold">
                  Fused Conf: {metrics.audioVisual.confidence}%
                </span>
              </div>

              {/* Exact Metrics Specified in Prompt Section 12 */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block">Voice Embedding Sim</span>
                  <span className="text-purple-700 font-bold text-sm">
                    {metrics.audioVisual.voiceEmbeddingSim}
                  </span>
                  <span className="text-[10px] text-slate-500 block">ECAPA-TDNN Cosine</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block">Visual Identity Conf</span>
                  <span className="text-sky-700 font-bold text-sm">
                    {metrics.audioVisual.visualIdentityConf}
                  </span>
                  <span className="text-[10px] text-slate-500 block">ArcFace Euclidean</span>
                </div>
              </div>

              {/* Side-by-Side Comparison: Audio-Only vs Audio + Visual */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono tabular-nums">
                <div className="flex items-center justify-between text-slate-500 border-b border-slate-200 pb-1.5 font-sans font-semibold">
                  <span>Metric (Validation Set)</span>
                  <div className="flex gap-4">
                    <span className="text-amber-700">Audio-Only</span>
                    <span className="text-sky-800 font-bold">Audio + Visual</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Accuracy:</span>
                  <div className="flex gap-8">
                    <span className="text-slate-700">{metrics.audioOnly.accuracy}%</span>
                    <span className="text-emerald-700 font-bold">{metrics.audioVisual.accuracy}%</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Precision:</span>
                  <div className="flex gap-8">
                    <span className="text-slate-700">{metrics.audioOnly.precision}%</span>
                    <span className="text-emerald-700 font-bold">{metrics.audioVisual.precision}%</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Recall:</span>
                  <div className="flex gap-8">
                    <span className="text-slate-700">{metrics.audioOnly.recall}%</span>
                    <span className="text-emerald-700 font-bold">{metrics.audioVisual.recall}%</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">F1-Score:</span>
                  <div className="flex gap-8">
                    <span className="text-slate-700">{metrics.audioOnly.f1Score}%</span>
                    <span className="text-emerald-700 font-bold">{metrics.audioVisual.f1Score}%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
