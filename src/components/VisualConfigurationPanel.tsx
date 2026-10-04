/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Section 7: Camera / Visual Information Configuration (White Laboratory Theme)
 * Simulated Computer Vision Viewport with Face, Lip & Gaze Tracking
 */

import React, { useRef, useEffect } from 'react';
import { Speaker, CameraConfig } from '../types/research';
import {
  Video,
  Eye,
  Smile,
  Compass,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

interface VisualConfigurationPanelProps {
  speakers: Speaker[];
  setSpeakers: React.Dispatch<React.SetStateAction<Speaker[]>>;
  camera: CameraConfig;
  setCamera: React.Dispatch<React.SetStateAction<CameraConfig>>;
  onOpen3D?: () => void;
}

export const VisualConfigurationPanel: React.FC<VisualConfigurationPanelProps> = ({
  speakers,
  camera,
  setCamera,
  onOpen3D,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw simulated camera view with bounding boxes and lip motion overlays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Simulated indoor lab room video frame - clean light clinical studio
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    // Subtle clinical room horizon & wall perspective lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.42);
    ctx.lineTo(w, h * 0.42);
    ctx.stroke();

    // Grid lines for camera sensor reticle
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Camera timestamp and optical sensor HUD
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText(`CAM_SENSOR: 1080p @ 30fps · FOV ${camera.fovDegrees}°`, 14, 22);
    ctx.fillText(`OCCLUSION_MODE: ${camera.occlusionMode.toUpperCase()}`, 14, 38);

    // Render each active speaker in camera FOV
    const activeSpeakers = speakers.filter((s) => s.active);

    activeSpeakers.forEach((spk, idx) => {
      // Perspective projection mapping based on speaker X (-4 to +4) and Y (distance 1m to 6m)
      const screenX = w / 2 + (spk.position.x / (spk.position.y * Math.tan((camera.fovDegrees / 2) * (Math.PI / 180)))) * (w / 2);
      const scale = Math.max(0.45, Math.min(1.3, 2.6 / spk.position.y));
      const boxW = 110 * scale;
      const boxH = 150 * scale;
      const screenY = h * 0.52 - boxH / 2;

      // Draw Speaker Head / Silhouette Outline
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.ellipse(screenX, screenY + boxH * 0.35, boxW * 0.38, boxH * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Facial Centroid Bounding Box
      let boxColor = spk.color;
      if (camera.occlusionMode === 'hand_covering' && idx === 0) {
        boxColor = '#d97706'; // warning amber
      }

      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 2.2;
      ctx.strokeRect(screenX - boxW / 2, screenY, boxW, boxH);

      // Corner reticles
      const cLen = 12;
      ctx.lineWidth = 3;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(screenX - boxW / 2, screenY + cLen);
      ctx.lineTo(screenX - boxW / 2, screenY);
      ctx.lineTo(screenX - boxW / 2 + cLen, screenY);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(screenX + boxW / 2 - cLen, screenY);
      ctx.lineTo(screenX + boxW / 2, screenY);
      ctx.lineTo(screenX + boxW / 2, screenY + cLen);
      ctx.stroke();

      // Facial Landmarking: Eyes
      const eyeY = screenY + boxH * 0.32;
      const eyeSpacing = boxW * 0.22;
      const eyeGazeOffset = Math.sin((spk.gazeVectorDeg * Math.PI) / 180) * 4;

      ctx.fillStyle = '#475569';
      // Left eye
      ctx.beginPath();
      ctx.arc(screenX - eyeSpacing + eyeGazeOffset, eyeY, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Right eye
      ctx.beginPath();
      ctx.arc(screenX + eyeSpacing + eyeGazeOffset, eyeY, 4 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Gaze vector arrow
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(screenX, eyeY);
      ctx.lineTo(screenX + eyeGazeOffset * 4, eyeY - 14 * scale);
      ctx.stroke();

      // Mouth / Lip Region Bounding Box
      const mouthY = screenY + boxH * 0.65;
      const mouthW = boxW * 0.42;
      const mouthH = boxH * 0.18;

      ctx.strokeStyle = spk.lipActivity === 'Active' ? '#059669' : '#94a3b8';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(screenX - mouthW / 2, mouthY, mouthW, mouthH);

      // Lip Activity Dynamic optic flow bars
      if (spk.lipActivity === 'Active') {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.fillRect(screenX - mouthW / 2, mouthY, mouthW, mouthH);

        // Optic flow motion particles
        ctx.fillStyle = '#059669';
        for (let p = 0; p < 4; p++) {
          const px = screenX - mouthW / 2 + (p + 1) * (mouthW / 5);
          ctx.beginPath();
          ctx.arc(px, mouthY + mouthH / 2, 2.2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Occlusion artifact simulation
      if (camera.occlusionMode === 'hand_covering' && idx === 0) {
        ctx.fillStyle = 'rgba(217, 119, 6, 0.65)';
        ctx.fillRect(screenX - mouthW * 0.7, mouthY - 10, mouthW * 1.4, mouthH * 1.6);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillText('OCCLUDED', screenX - 22, mouthY + mouthH / 2 + 3);
      }

      // HUD Label above box (dark high-contrast)
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(`${spk.label}: ${spk.name}`, screenX - boxW / 2, screenY - 18);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(
        `Conf: ${spk.visualConfidence}% · Lip: ${spk.lipActivity.toUpperCase()}`,
        screenX - boxW / 2,
        screenY - 6
      );
    });
  }, [speakers, camera]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-sky-600" />
            Camera Sensor & Visual Speech Perception
          </h2>
          <p className="text-xs text-slate-500">
            Simulated optical camera sensor with real-time facial landmarking, lip-motion optic flow, and gaze direction estimation.
          </p>
        </div>

        {onOpen3D && (
          <button
            onClick={onOpen3D}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold flex items-center gap-1.5 text-xs shadow-sm cursor-pointer transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Inspect in 3D Visual Coding Mode
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Simulated Camera Viewport (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Simulated Optical Stream: Multi-Person Face & Lip Tracker
            </span>
            <span className="text-slate-500 font-mono">Res: {camera.resolution}</span>
          </div>

          <div className="relative aspect-video w-full rounded-lg border border-slate-300 bg-slate-50 overflow-hidden shadow-inner">
            <canvas ref={canvasRef} width={720} height={405} className="w-full h-full object-contain" />
          </div>

          {/* Occlusion Mode Simulation Selector */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Optical Occlusion Robustness Stress-Test
              </span>
              <span className="text-slate-500 font-mono text-[11px]">Simulates visual degradation</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              {[
                { id: 'none', label: 'Nominal (Clean)' },
                { id: 'hand_covering', label: 'Hand Over Mouth' },
                { id: 'head_turned', label: 'Turned Head (60°)' },
                { id: 'dim_light', label: 'Adverse Low-Light' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() =>
                    setCamera((prev) => ({
                      ...prev,
                      occlusionMode: mode.id as CameraConfig['occlusionMode'],
                    }))
                  }
                  className={`p-2 rounded-lg text-left transition-colors cursor-pointer border ${
                    camera.occlusionMode === mode.id
                      ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-[11px]">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Visual Telemetry Cards for Detected Speakers (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-600" />
                Visual Speaker Detections
              </h3>
              <span className="text-xs font-mono text-sky-700 font-bold">
                {speakers.filter((s) => s.active).length} Tracked
              </span>
            </div>

            {/* Individual Speaker Visual Cards */}
            <div className="space-y-3">
              {speakers.filter((s) => s.active).map((spk) => {
                const isOccluded = camera.occlusionMode !== 'none';
                const effectiveConf = isOccluded ? Math.max(45, spk.visualConfidence - 28) : spk.visualConfidence;

                return (
                  <div
                    key={spk.id}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: spk.color }} />
                        <span className="font-bold text-slate-900">{spk.label}</span>
                        <span className="text-slate-500">({spk.name})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200 font-semibold">
                        Visual Conf: {effectiveConf}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Spatial Pos (x, y):</span>
                        <span className="text-slate-900 font-semibold">[{spk.position.x > 0 ? `+${spk.position.x}` : spk.position.x}, {spk.position.y}] m</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Face Detected:</span>
                        <span className="text-emerald-700 font-semibold">YES (Centroid tracked)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Lip Activity Status:</span>
                        <span className={spk.lipActivity === 'Active' ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                          {spk.lipActivity.toUpperCase()} (Motion: {(spk.lipMotionIndex * 100).toFixed(0)}%)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Head Yaw / Gaze:</span>
                        <span className="text-purple-700 font-semibold">
                          {spk.headYawDeg > 0 ? `+${spk.headYawDeg}` : spk.headYawDeg}° / {spk.gazeVectorDeg}°
                        </span>
                      </div>
                    </div>

                    {/* Visual Speech Synchrony Status */}
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">AV Sync Correlation:</span>
                      <span className="text-emerald-700 font-semibold">
                        r = {spk.lipActivity === 'Active' ? '0.84 (High Sync)' : '0.12 (Idle)'}
                      </span>
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
              Role of Visual Lip Activity in Audio Separation
            </h4>
            <p className="text-sky-800 leading-relaxed">
              When acoustic SNR drops below 0 dB or competing speakers cross-talk, acoustic-only voice activity detectors (VAD) suffer severe false-alarm rates. Optical lip motion tracking provides a strictly noise-invariant gating prior that isolates target vocal tract modulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
