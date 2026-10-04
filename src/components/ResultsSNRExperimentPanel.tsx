/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Sections 13, 15, 17: Evaluation Metrics Dashboard, SNR Parametric Curves & Experiment Runner (White Laboratory Theme)
 */

import React, { useState } from 'react';
import {
  MicCount,
  NoiseType,
  SNRLevel,
  ExperimentRecord
} from '../types/research';
import { generateSNRSweepData } from '../utils/acousticEngine';
import {
  TrendingDown,
  TrendingUp,
  BarChart3,
  Play,
  Download,
  Trash2,
  Sparkles,
  Layers,
  Activity,
  History,
  CheckCircle2,
  Info
} from 'lucide-react';

interface ResultsSNRExperimentPanelProps {
  micCount: MicCount;
  rt60: number;
  snrDb: SNRLevel;
  noiseType: NoiseType;
  speakerCount: number;
}

export const ResultsSNRExperimentPanel: React.FC<ResultsSNRExperimentPanelProps> = ({
  micCount,
  rt60,
  snrDb,
  noiseType,
  speakerCount,
}) => {
  const [activeCurveTab, setActiveCurveTab] = useState<'wer' | 'stoi' | 'siSdr' | 'doa'>('wer');
  const [experimentHistory, setExperimentHistory] = useState<ExperimentRecord[]>([
    {
      id: 'EXP-1041-A',
      timestamp: '2026-10-03 08:30:12',
      name: 'Baseline 2-Spk Acoustic Only',
      speakerCount: 2,
      snrDb: 0,
      rt60Seconds: 0.35,
      micCount: 4,
      micSpacingM: 0.04,
      noiseType: 'crowd',
      occlusionMode: 'none',
      results: {
        avgDoaError: 8.4,
        avgSiSdr: 4.8,
        avgStoi: 0.76,
        avgWer: 18.2,
        avgF1: 86.4,
        totalLatencyMs: 28,
      },
      source: 'simulated',
    },
    {
      id: 'EXP-1042-B',
      timestamp: '2026-10-03 08:45:00',
      name: 'Full AV-SepFormer + 4-Mic ULA',
      speakerCount: 2,
      snrDb: 0,
      rt60Seconds: 0.35,
      micCount: 4,
      micSpacingM: 0.04,
      noiseType: 'crowd',
      occlusionMode: 'none',
      results: {
        avgDoaError: 2.3,
        avgSiSdr: 12.4,
        avgStoi: 0.91,
        avgWer: 6.4,
        avgF1: 97.2,
        totalLatencyMs: 62,
      },
      source: 'simulated',
    },
  ]);

  // Sweep data across +10 dB to -10 dB
  const sweepData = generateSNRSweepData(micCount, rt60);

  // Custom Experiment Runner state
  const [expName, setExpName] = useState<string>('Trial Multi-Modal Evaluation');
  const [expSpkCount, setExpSpkCount] = useState<number>(speakerCount);
  const [expSnr, setExpSnr] = useState<SNRLevel>(snrDb);
  const [expMics, setExpMics] = useState<MicCount>(micCount);
  const [expSpatialEnabled, setExpSpatialEnabled] = useState<boolean>(true);
  const [expVisualEnabled, setExpVisualEnabled] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRunCustomExperiment = () => {
    setIsRunning(true);
    setTimeout(() => {
      // Calculate realistic metrics
      const baselineWer = expSnr === 10 ? 9.2 : expSnr === 5 ? 13.8 : expSnr === 0 ? 19.5 : expSnr === -5 ? 28.4 : 42.0;
      const werPenalty = (expSpkCount - 1) * 3.5;
      const spatialBonus = expSpatialEnabled ? (expMics === 8 ? 9.5 : expMics === 6 ? 8.2 : expMics === 4 ? 6.5 : 4.0) : 0;
      const visualBonus = expVisualEnabled ? 7.2 : 0;

      const finalWer = Math.max(3.2, Math.round((baselineWer + werPenalty - spatialBonus - visualBonus) * 10) / 10);
      const finalSiSdr = Math.round((14.0 - finalWer * 0.28 + (expSpatialEnabled ? 4.5 : 0)) * 10) / 10;
      const finalStoi = Math.round(Math.min(0.98, Math.max(0.45, 1.0 - finalWer / 80)) * 100) / 100;
      const finalDoa = expSpatialEnabled ? (expVisualEnabled ? 1.8 : 4.5) : 14.2;

      const newRecord: ExperimentRecord = {
        id: `EXP-${Math.floor(1000 + Math.random() * 9000)}-${expVisualEnabled ? 'AV' : 'A'}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        name: expName,
        speakerCount: expSpkCount,
        snrDb: expSnr,
        rt60Seconds: rt60,
        micCount: expMics,
        micSpacingM: 0.04,
        noiseType,
        occlusionMode: 'none',
        results: {
          avgDoaError: finalDoa,
          avgSiSdr: finalSiSdr,
          avgStoi: finalStoi,
          avgWer: finalWer,
          avgF1: Math.round(Math.min(99, 99.5 - finalWer * 0.4) * 10) / 10,
          totalLatencyMs: 24 + (expSpatialEnabled ? 14 : 0) + (expVisualEnabled ? 28 : 0),
        },
        source: 'simulated',
      };

      setExperimentHistory((prev) => [newRecord, ...prev]);
      setIsRunning(false);
    }, 700);
  };

  const exportHistoryCsv = () => {
    const headers = 'Experiment_ID,Timestamp,Name,Speakers,SNR_dB,RT60_s,Mics,DOA_Error,SI_SDR,STOI,WER,F1,Latency_ms\n';
    const rows = experimentHistory
      .map(
        (e) =>
          `${e.id},"${e.timestamp}","${e.name}",${e.speakerCount},${e.snrDb},${e.rt60Seconds},${e.micCount},${e.results.avgDoaError},${e.results.avgSiSdr},${e.results.avgStoi},${e.results.avgWer},${e.results.avgF1},${e.results.totalLatencyMs}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speech_intelligence_experiments_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-600" />
          Evaluation Dashboard & SNR Parametric Robustness
        </h2>
        <p className="text-xs text-slate-500">
          Evaluates speech separation resilience across signal-to-noise ratios (+10 dB down to -10 dB) and maintains trial records.
        </p>
      </div>

      {/* Section 15: SNR Experiment Curves (WER, STOI, SI-SDR, DOA Error) */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-sky-600" />
              Parametric Acoustic Curves (SNR +10 dB to -10 dB)
            </h3>
            <span className="text-xs font-mono text-slate-500">
              Demonstrates modality degradation under increasingly hostile acoustic noise
            </span>
          </div>

          {/* Curve Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono">
            <button
              onClick={() => setActiveCurveTab('wer')}
              className={`px-3 py-1 rounded-md cursor-pointer transition-colors ${
                activeCurveTab === 'wer'
                  ? 'bg-sky-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SNR vs WER (%)
            </button>
            <button
              onClick={() => setActiveCurveTab('stoi')}
              className={`px-3 py-1 rounded-md cursor-pointer transition-colors ${
                activeCurveTab === 'stoi'
                  ? 'bg-sky-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SNR vs STOI
            </button>
            <button
              onClick={() => setActiveCurveTab('siSdr')}
              className={`px-3 py-1 rounded-md cursor-pointer transition-colors ${
                activeCurveTab === 'siSdr'
                  ? 'bg-sky-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SNR vs SI-SDR
            </button>
            <button
              onClick={() => setActiveCurveTab('doa')}
              className={`px-3 py-1 rounded-md cursor-pointer transition-colors ${
                activeCurveTab === 'doa'
                  ? 'bg-sky-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SNR vs DOA Error
            </button>
          </div>
        </div>

        {/* SVG Multi-Line Chart on White Background */}
        <div className="relative aspect-[21/9] w-full bg-slate-50/50 rounded-lg border border-slate-300 p-4 shadow-inner">
          <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
            {/* Grid Horizontal */}
            {[0, 50, 100, 150].map((y) => (
              <line
                key={y}
                x1="40"
                y1={y}
                x2="480"
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            ))}

            {/* X Axis ticks: +10, +5, 0, -5, -10 dB */}
            {[
              { snr: '+10', x: 60 },
              { snr: '+5', x: 160 },
              { snr: '0', x: 260 },
              { snr: '-5', x: 360 },
              { snr: '-10', x: 460 },
            ].map((t) => (
              <g key={t.snr}>
                <line x1={t.x} y1="0" x2={t.x} y2="160" stroke="#cbd5e1" strokeWidth="1" />
                <text
                  x={t.x}
                  y="180"
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {t.snr} dB
                </text>
              </g>
            ))}

            {/* Render Curves Based on Selected Metric */}
            {activeCurveTab === 'wer' && (
              <>
                {/* Audio Only (Amber) */}
                <polyline
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2.5"
                  points={sweepData.map((d, i) => `${60 + i * 100},${160 - (d.wer.audioOnly / 70) * 140}`).join(' ')}
                />
                {/* Audio + Spatial (Purple) */}
                <polyline
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="2.2"
                  strokeDasharray="4,2"
                  points={sweepData.map((d, i) => `${60 + i * 100},${160 - (d.wer.audioSpatial / 70) * 140}`).join(' ')}
                />
                {/* Audio + Spatial + Visual (Sky Blue) */}
                <polyline
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3.2"
                  points={sweepData.map((d, i) => `${60 + i * 100},${160 - (d.wer.multimodal / 70) * 140}`).join(' ')}
                />
              </>
            )}

            {activeCurveTab === 'stoi' && (
              <>
                <polyline
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2.2"
                  points={sweepData.map((d, i) => `${60 + i * 100},${160 - d.stoi.audioOnly * 140}`).join(' ')}
                />
                <polyline
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3.2"
                  points={sweepData.map((d, i) => `${60 + i * 100},${160 - d.stoi.multimodal * 140}`).join(' ')}
                />
              </>
            )}

            {activeCurveTab === 'siSdr' && (
              <>
                <polyline
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2.2"
                  points={sweepData.map((d, i) => `${60 + i * 100},${160 - ((d.siSdr.audioOnly + 15) / 30) * 140}`).join(' ')}
                />
                <polyline
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3.2"
                  points={sweepData.map((d, i) => `${60 + i * 100},${160 - ((d.siSdr.multimodal + 15) / 30) * 140}`).join(' ')}
                />
              </>
            )}

            {activeCurveTab === 'doa' && (
              <>
                <polyline
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2.2"
                  points={sweepData.map((d, i) => `${60 + i * 100},${160 - (d.doaError.audioOnly / 25) * 140}`).join(' ')}
                />
                <polyline
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3.2"
                  points={sweepData.map((d, i) => `${60 + i * 100},${160 - (d.doaError.multimodal / 25) * 140}`).join(' ')}
                />
              </>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-1 bg-amber-500 inline-block rounded" /> Audio-Only Baseline
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-1 bg-purple-600 inline-block rounded" /> Audio + Spatial
            </span>
            <span className="flex items-center gap-1.5 font-bold text-sky-800">
              <span className="w-3 h-1.5 bg-sky-600 inline-block rounded" /> Audio + Spatial + Visual (Multimodal)
            </span>
          </div>
          <span className="text-slate-500 font-semibold">Notice the flat resilience of Multimodal at negative SNR</span>
        </div>
      </section>

      {/* Section 17: Research Experiment Builder */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Play className="w-4 h-4 text-sky-600" />
            Research Experiment Builder & Runner
          </h3>
          <span className="text-xs font-mono text-slate-500">Custom Parametric Trial Execution</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <label className="text-slate-600 block mb-1 font-semibold">Experiment Name</label>
            <input
              type="text"
              value={expName}
              onChange={(e) => setExpName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-semibold">Speaker Count</label>
            <select
              value={expSpkCount}
              onChange={(e) => setExpSpkCount(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
            >
              <option value={1}>1 Speaker</option>
              <option value={2}>2 Speakers (Cross-Talk)</option>
              <option value={3}>3 Speakers</option>
              <option value={4}>4 Speakers</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-semibold">Acoustic SNR (dB)</label>
            <select
              value={expSnr}
              onChange={(e) => setExpSnr(parseInt(e.target.value, 10) as SNRLevel)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
            >
              <option value={10}>+10 dB (Favorable)</option>
              <option value={5}>+5 dB</option>
              <option value={0}>0 dB (Moderate)</option>
              <option value={-5}>-5 dB (Severe)</option>
              <option value={-10}>-10 dB (Extreme)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-semibold">Microphone Array</label>
            <select
              value={expMics}
              onChange={(e) => setExpMics(parseInt(e.target.value, 10) as MicCount)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
            >
              <option value={2}>2 Mics</option>
              <option value={4}>4 Mics</option>
              <option value={6}>6 Mics</option>
              <option value={8}>8 Mics</option>
            </select>
          </div>
        </div>

        {/* Modality Toggles & Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-4 text-xs font-mono">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={expSpatialEnabled}
                onChange={(e) => setExpSpatialEnabled(e.target.checked)}
                className="accent-sky-600 rounded"
              />
              Spatial MVDR Enabled
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={expVisualEnabled}
                onChange={(e) => setExpVisualEnabled(e.target.checked)}
                className="accent-sky-600 rounded"
              />
              Camera Visual Lip Tracking Enabled
            </label>
          </div>

          <button
            onClick={handleRunCustomExperiment}
            disabled={isRunning}
            className={`px-5 py-2 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
              isRunning
                ? 'bg-sky-100 text-sky-800 animate-pulse'
                : 'bg-sky-600 text-white hover:bg-sky-700'
            }`}
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Executing Trial Simulation...' : 'Run Experiment'}</span>
          </button>
        </div>
      </section>

      {/* Trial Experiment History Log */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Experiment Execution History ({experimentHistory.length} Trials Recorded)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportHistoryCsv}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs text-slate-700 flex items-center gap-1 font-mono cursor-pointer transition-colors shadow-2xs font-semibold"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setExperimentHistory([])}
              className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-red-300 hover:text-red-600 rounded-lg text-xs text-slate-400 cursor-pointer transition-colors shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono tabular-nums text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 text-[11px]">
                <th className="py-2.5 px-3 font-semibold">Trial ID</th>
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Name</th>
                <th className="py-2.5 px-3 font-semibold">Spks</th>
                <th className="py-2.5 px-3 font-semibold">SNR</th>
                <th className="py-2.5 px-3 font-semibold">Mics</th>
                <th className="py-2.5 px-3 font-semibold">DOA Err</th>
                <th className="py-2.5 px-3 font-semibold">SI-SDR</th>
                <th className="py-2.5 px-3 font-semibold">WER</th>
                <th className="py-2.5 px-3 font-semibold">F1</th>
                <th className="py-2.5 px-3 font-semibold">Latency</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {experimentHistory.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 text-slate-700">
                  <td className="py-2.5 px-3 font-bold text-sky-700">{rec.id}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[10px]">{rec.timestamp}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{rec.name}</td>
                  <td className="py-2.5 px-3">{rec.speakerCount}</td>
                  <td className="py-2.5 px-3">{rec.snrDb > 0 ? `+${rec.snrDb}` : rec.snrDb} dB</td>
                  <td className="py-2.5 px-3">{rec.micCount}</td>
                  <td className="py-2.5 px-3">{rec.results.avgDoaError}°</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {rec.results.avgSiSdr > 0 ? `+${rec.results.avgSiSdr}` : rec.results.avgSiSdr} dB
                  </td>
                  <td className="py-2.5 px-3 font-bold text-emerald-700">{rec.results.avgWer}%</td>
                  <td className="py-2.5 px-3">{rec.results.avgF1}%</td>
                  <td className="py-2.5 px-3 text-purple-700 font-bold">{rec.results.totalLatencyMs} ms</td>
                  <td className="py-2.5 px-3 text-[10px] text-sky-700 font-bold uppercase">{rec.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
