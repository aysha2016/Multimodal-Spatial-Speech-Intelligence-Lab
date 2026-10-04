/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Section 16: Model Comparison (Models A through E) (White Laboratory Theme)
 * Objective scientific evaluation without declaring arbitrary "winners"
 */

import React, { useState } from 'react';
import { BENCHMARK_MODELS } from '../utils/researchData';
import { ModelConfiguration } from '../types/research';
import {
  Layers,
  BarChart3,
  Cpu,
  Clock,
  CheckCircle2,
  Info,
  Scale
} from 'lucide-react';

export const ModelComparisonPanel: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState<string>('model_d');
  const selectedModel = BENCHMARK_MODELS.find((m) => m.id === selectedModelId) || BENCHMARK_MODELS[3];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Scale className="w-5 h-5 text-sky-600" />
          Comparative Architecture Evaluation (Models A – E)
        </h2>
        <p className="text-xs text-slate-500">
          Empirical comparison across five architectural paradigms. We present measured/simulated evidence to allow researchers to interpret accuracy vs. computational efficiency trade-offs.
        </p>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {BENCHMARK_MODELS.map((m) => {
          const isSelected = selectedModelId === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setSelectedModelId(m.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                isSelected
                  ? 'bg-sky-50/70 border-sky-500 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-sky-700">{m.code}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-1">{m.name}</h4>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-snug">
                  {m.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 font-mono text-[11px] tabular-nums space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>WER:</span>
                  <span className="text-slate-900 font-bold">{m.metrics.wer}%</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Latency:</span>
                  <span className="text-purple-700 font-bold">{m.metrics.latencyMs} ms</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Side-by-Side Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-600" />
            Empirical Benchmark Performance Matrix
          </h3>
          <span className="text-xs font-mono text-slate-500">Documented Simulation Baselines</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono tabular-nums text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 text-[11px]">
                <th className="py-2.5 px-3 font-semibold">Model</th>
                <th className="py-2.5 px-3 font-semibold">Active Modalities</th>
                <th className="py-2.5 px-3 font-semibold">DOA Error (°)</th>
                <th className="py-2.5 px-3 font-semibold">SI-SDR (dB)</th>
                <th className="py-2.5 px-3 font-semibold">STOI</th>
                <th className="py-2.5 px-3 font-semibold">WER (%)</th>
                <th className="py-2.5 px-3 font-semibold">Spk Acc (%)</th>
                <th className="py-2.5 px-3 font-semibold">Latency (ms)</th>
                <th className="py-2.5 px-3 font-semibold">GFLOPs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {BENCHMARK_MODELS.map((m) => {
                const isSelected = selectedModelId === m.id;
                const activeMods = [
                  m.modalities.audio && 'Audio',
                  m.modalities.spatial && 'Spatial',
                  m.modalities.visual && 'Visual',
                  m.modalities.context && 'Context',
                ]
                  .filter(Boolean)
                  .join(' + ');

                return (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedModelId(m.id)}
                    className={`hover:bg-slate-50 cursor-pointer ${
                      isSelected ? 'bg-sky-50/80 text-sky-950 font-bold' : 'text-slate-800'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900">{m.code}: {m.name}</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px] font-sans">{activeMods}</td>
                    <td className="py-2.5 px-3 text-slate-700">{m.metrics.doaError.toFixed(1)}°</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {m.metrics.siSdr > 0 ? `+${m.metrics.siSdr}` : m.metrics.siSdr} dB
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{m.metrics.stoi.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{m.metrics.wer.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-slate-700">{m.metrics.speakerAccuracy.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-purple-700 font-bold">{m.metrics.latencyMs} ms</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.metrics.gflops.toFixed(1)} G</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade-Off Analysis Card (RQ5 & H5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-sky-600" />
            Accuracy vs. Latency Pareto Frontier
          </h4>
          <p className="text-slate-600 leading-relaxed">
            While <span className="text-slate-900 font-semibold">Model E</span> delivers the highest overall acoustic separation (+13.1 dB SI-SDR) and lowest WER (3.8%), its 84 ms inference pipeline requires 32.5 GFLOPs, making it impractical for resource-constrained edge robotics without neural pruning.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-sky-50 border border-sky-200 space-y-2 text-xs">
          <h4 className="font-semibold text-sky-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-sky-600" />
            Sweet Spot for Physical Systems (Model D)
          </h4>
          <p className="text-sky-800 leading-relaxed">
            <span className="text-sky-950 font-bold">Model D (Audio + Spatial + Visual)</span> achieves near-ceiling performance (6.4% WER, 12.4 dB SI-SDR) at 62 ms latency. When coupled with INT8 hardware acceleration, it satisfies real-time robotics interactive constraints (&lt;50 ms).
          </p>
        </div>
      </div>
    </div>
  );
};
