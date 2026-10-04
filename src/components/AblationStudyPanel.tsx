/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Section 14: Interactive Ablation Study (White Laboratory Theme)
 * Rigorous evaluation of marginal modality uplift across SNR levels
 */

import React, { useState } from 'react';
import { SNRLevel, MicCount } from '../types/research';
import { generateAblationTable } from '../utils/acousticEngine';
import {
  Layers,
  BarChart3,
  Sliders,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  Info
} from 'lucide-react';

interface AblationStudyPanelProps {
  micCount: MicCount;
  rt60: number;
}

export const AblationStudyPanel: React.FC<AblationStudyPanelProps> = ({
  micCount,
  rt60,
}) => {
  const [selectedSnr, setSelectedSnr] = useState<SNRLevel>(0);
  const ablationRows = generateAblationTable(selectedSnr, rt60, micCount);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600" />
            Systematic Modality Ablation Study
          </h2>
          <p className="text-xs text-slate-500">
            Measures the marginal contribution of spatial microphone beamforming, visual lip readings, and conversational context priors.
          </p>
        </div>

        {/* Interactive SNR Selector to observe changes in ablation deltas */}
        <div className="flex items-center gap-2 bg-white border border-slate-300 p-1.5 rounded-xl text-xs font-mono shadow-xs">
          <span className="text-slate-500 font-semibold">Ablation SNR Regime:</span>
          {([10, 5, 0, -5, -10] as SNRLevel[]).map((snr) => (
            <button
              key={snr}
              onClick={() => setSelectedSnr(snr)}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors font-bold ${
                selectedSnr === snr
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {snr > 0 ? `+${snr}` : snr} dB
            </button>
          ))}
        </div>
      </div>

      {/* Main Ablation Comparison Table required by Section 14 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-600" />
            Ablation Matrix: Configurations 1 – 5
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Aperture: {micCount} Mics · RT60: {rt60.toFixed(2)}s · SNR: {selectedSnr > 0 ? `+${selectedSnr}` : selectedSnr} dB
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono tabular-nums text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 text-[11px]">
                <th className="py-2.5 px-3 font-semibold">Configuration</th>
                <th className="py-2.5 px-3 font-semibold">Included Modalities</th>
                <th className="py-2.5 px-3 font-semibold">DOA Error</th>
                <th className="py-2.5 px-3 font-semibold">SI-SDR</th>
                <th className="py-2.5 px-3 font-semibold">STOI</th>
                <th className="py-2.5 px-3 font-semibold">WER</th>
                <th className="py-2.5 px-3 font-semibold">Speaker Accuracy</th>
                <th className="py-2.5 px-3 font-semibold">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ablationRows.map((row, idx) => {
                const isFull = idx === 3;
                return (
                  <tr
                    key={row.configId}
                    className={`hover:bg-slate-50 ${
                      isFull ? 'bg-sky-50/80 text-sky-950 font-bold' : 'text-slate-800'
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-slate-900">{row.name}</td>
                    <td className="py-3 px-3 font-sans text-[11px] text-slate-600">{row.modalities}</td>
                    <td className="py-3 px-3 text-slate-700">{row.doaError.toFixed(1)}°</td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {row.siSdr > 0 ? `+${row.siSdr.toFixed(1)}` : row.siSdr.toFixed(1)} dB
                    </td>
                    <td className="py-3 px-3 text-slate-700">{row.stoi.toFixed(2)}</td>
                    <td className="py-3 px-3 font-bold text-emerald-700">{row.wer.toFixed(1)}%</td>
                    <td className="py-3 px-3 text-slate-700">{row.speakerAccuracy.toFixed(1)}%</td>
                    <td className="py-3 px-3 text-purple-700 font-bold">{row.latencyMs} ms</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Modality Marginal Gain Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Word Error Rate (WER %) Reduction */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs">
            <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              WER Reduction across Additional Modalities (Lower is Better)
            </h4>
            <span className="font-mono text-slate-500">Target: &lt;10%</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {ablationRows.map((row) => {
              const werWidth = Math.min(100, Math.max(5, (row.wer / 60) * 100));
              return (
                <div key={row.configId} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-700 font-medium">{row.modalities}</span>
                    <span className="font-bold text-emerald-700">{row.wer}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${werWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: SI-SDR Separation Quality Uplift (Higher is Better) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs">
            <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-sky-600" />
              SI-SDR Separation Improvement (dB)
            </h4>
            <span className="font-mono text-slate-500">Higher is Better</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {ablationRows.map((row) => {
              const sdrWidth = Math.min(100, Math.max(8, ((row.siSdr + 4) / 18) * 100));
              return (
                <div key={row.configId} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-700 font-medium">{row.modalities}</span>
                    <span className="font-bold text-sky-700">
                      {row.siSdr > 0 ? `+${row.siSdr.toFixed(1)}` : row.siSdr.toFixed(1)} dB
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="bg-sky-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${sdrWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
