/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Section 8: Speaker Detection (White Laboratory Theme)
 * Dual-Stream Voice Activity Detection (Acoustic VAD + Visual VAD + Fused Activity)
 */

import React from 'react';
import { Speaker, SNRLevel } from '../types/research';
import {
  Users,
  Activity,
  Mic,
  Video,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers
} from 'lucide-react';

interface SpeakerDetectionPanelProps {
  speakers: Speaker[];
  setSpeakers: React.Dispatch<React.SetStateAction<Speaker[]>>;
  snrDb: SNRLevel;
}

export const SpeakerDetectionPanel: React.FC<SpeakerDetectionPanelProps> = ({
  speakers,
  setSpeakers,
  snrDb,
}) => {
  const activeSpeakers = speakers.filter((s) => s.active);
  const simultaneousSpeaking = activeSpeakers.filter((s) => s.speechActivity === 'ACTIVE').length > 1;

  const toggleSpeechActivity = (id: string) => {
    setSpeakers((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              speechActivity: s.speechActivity === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
              lipActivity: s.speechActivity === 'ACTIVE' ? 'Inactive' : 'Active',
            }
          : s
      )
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-600" />
          Speaker Detection & Multimodal Voice Activity (VAD)
        </h2>
        <p className="text-xs text-slate-500">
          Evaluates multi-speaker detection through synchronous acoustic energy estimation and visual optical flow lip movements.
        </p>
      </div>

      {/* Global Detection Status Ribbon */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500">Detected Speakers: </span>
            <span className="text-sky-700 font-bold text-sm">{activeSpeakers.length}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div>
            <span className="text-slate-500">Active Simultaneous Talkers: </span>
            <span className="text-emerald-700 font-bold text-sm">
              {activeSpeakers.filter((s) => s.speechActivity === 'ACTIVE').length}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div>
            <span className="text-slate-500">Acoustic Overlap State: </span>
            <span className={`font-bold ${simultaneousSpeaking ? 'text-amber-700' : 'text-slate-600'}`}>
              {simultaneousSpeaking ? 'DOUBLE-TALK DETECTED' : 'SINGLE-SPEAKER'}
            </span>
          </div>
        </div>

        {simultaneousSpeaking && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 text-xs font-mono font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Cross-talk detected: Spatial & visual separation required</span>
          </div>
        )}
      </div>

      {/* Speaker Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeSpeakers.map((spk) => {
          const isSpeechActive = spk.speechActivity === 'ACTIVE';
          const isVisualActive = spk.lipActivity === 'Active';

          // Degradation of acoustic VAD confidence under negative SNR
          const acousticVadScore = Math.max(30, Math.min(99, spk.speechConfidence + (snrDb < 0 ? snrDb * 3 : 0)));
          const visualVadScore = spk.visualConfidence;
          const fusedConfidence = Math.round(acousticVadScore * 0.45 + visualVadScore * 0.55);

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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSpeechActivity(spk.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors shadow-2xs border ${
                      isSpeechActive
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-300'
                    }`}
                  >
                    {isSpeechActive ? 'TALKING' : 'SILENT'}
                  </button>
                </div>
              </div>

              {/* Exact Metrics from Prompt Requirement */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block">Speech Activity</span>
                  <span className={`font-bold text-sm ${isSpeechActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {spk.speechActivity}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Acoustic Conf: {acousticVadScore}%
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block">Visual Activity</span>
                  <span className={`font-bold text-sm ${isVisualActive ? 'text-sky-700' : 'text-slate-500'}`}>
                    {isVisualActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Optical Conf: {visualVadScore}%
                  </span>
                </div>
              </div>

              {/* Estimated Location & Fused Confidence */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Fused Detection Confidence:</span>
                  <span className="text-emerald-700 font-bold text-sm">{fusedConfidence}%</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Estimated Spatial Location:</span>
                  <span className="text-slate-900 font-semibold">
                    [{spk.position.x > 0 ? `+${spk.position.x}` : spk.position.x}, {spk.position.y}] m (θ = {spk.azimuthDeg > 0 ? `+${spk.azimuthDeg}` : spk.azimuthDeg}°)
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Voice Fundamental Freq (F0):</span>
                  <span className="text-purple-700 font-bold">{spk.voiceProfile.f0Hz} Hz ({spk.voiceProfile.gender})</span>
                </div>
              </div>

              {/* Dual-Modality VAD Tracker Visualizer */}
              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
                  <span>Acoustic Energy:</span>
                  <span className="text-slate-900 font-bold">{isSpeechActive ? '0.78 RMS' : '0.04 RMS'}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-300">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300"
                    style={{ width: isSpeechActive ? `${acousticVadScore}%` : '8%' }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono pt-1">
                  <span>Visual Lip Optic Flow:</span>
                  <span className="text-slate-900 font-bold">{(spk.lipMotionIndex * 100).toFixed(0)}% Flow</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-300">
                  <div
                    className="bg-sky-600 h-full transition-all duration-300"
                    style={{ width: isVisualActive ? `${visualVadScore}%` : '5%' }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
