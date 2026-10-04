/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Top Navigation Header adhering to the Universal Top Bar Contract
 */

import React from 'react';
import { Play, RotateCcw, Activity, FileSpreadsheet } from 'lucide-react';

export type TabId =
  | 'overview'
  | 'three_d'
  | 'environment'
  | 'speech_noise'
  | 'audio'
  | 'visual'
  | 'detection'
  | 'localization'
  | 'separation'
  | 'asr'
  | 'speaker_id'
  | 'models'
  | 'ablation'
  | 'results'
  | 'report';

interface HeaderProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  onRunPipeline: () => void;
  onReset: () => void;
  isSimulating: boolean;
  snrDb: number;
  micCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRunPipeline,
  onReset,
  isSimulating,
  snrDb,
  micCount,
}) => {
  const navItems: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'three_d', label: '3D Spatial Room' },
    { id: 'speech_noise', label: 'Speech & Noise Studio' },
    { id: 'environment', label: '2D Room Plan' },
    { id: 'audio', label: 'Audio Config' },
    { id: 'visual', label: 'Visual Config' },
    { id: 'detection', label: 'Detection' },
    { id: 'localization', label: 'Localization' },
    { id: 'separation', label: 'Separation' },
    { id: 'asr', label: 'ASR Analysis' },
    { id: 'speaker_id', label: 'Speaker ID' },
    { id: 'models', label: 'Models' },
    { id: 'ablation', label: 'Ablation' },
    { id: 'results', label: 'Results & SNR' },
    { id: 'report', label: 'Report' },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/95 sticky top-0 z-50 backdrop-blur-md shadow-xs">
      {/* Precision Lab Telemetry Ribbon */}
      <div className="border-b border-slate-200/80 bg-slate-50 px-6 py-1.5 flex items-center justify-between text-xs text-slate-600 font-mono tabular-nums">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-sky-700 font-semibold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse" />
            SIMULATION MODE
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-700 font-medium">
            Research Prototype — Not a Clinical or Production System
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-3 text-slate-500">
          <span>Array: {micCount} Mics</span>
          <span className="text-slate-300">·</span>
          <span>SNR: {snrDb > 0 ? `+${snrDb}` : snrDb} dB</span>
          <span className="text-slate-300">·</span>
          <span>Sampling: 16.0 kHz</span>
          <span className="text-slate-300">·</span>
          <span>Acoustic c: 343.0 m/s</span>
        </div>
      </div>

      {/* Primary Top Bar Contract: 3 zones */}
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-sky-300 bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Multimodal Spatial Speech Intelligence Lab
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Researching the interaction between audio, visual and spatial information
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 overflow-x-auto scrollbar-none py-1 text-xs font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-sky-50 text-sky-800 border border-sky-300 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onReset}
            title="Reset parameters to standard baseline"
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Reset</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden md:inline">Report</span>
          </button>

          <button
            onClick={onRunPipeline}
            disabled={isSimulating}
            className={`px-4 py-2 text-xs font-semibold rounded transition-all flex items-center gap-1.5 cursor-pointer ${
              isSimulating
                ? 'bg-sky-100 text-sky-800 border border-sky-300 animate-pulse'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm shadow-sky-600/20'
            }`}
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Computing...' : 'Run Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Secondary Nav Bar */}
      <div className="xl:hidden px-4 py-1.5 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs bg-slate-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${
              activeTab === item.id
                ? 'bg-sky-100 text-sky-900 border border-sky-300 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
