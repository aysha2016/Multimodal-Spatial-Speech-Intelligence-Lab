/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Section 5: Interactive 2D Environment Simulator (White Laboratory Theme)
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Speaker,
  MicrophoneArrayConfig,
  CameraConfig,
  RoomAcoustics,
  NoiseSourceConfig,
  SNRLevel
} from '../types/research';
import {
  calculateAzimuthDeg,
  calculateDistance,
  calculateDRR
} from '../utils/acousticEngine';
import {
  Move,
  RotateCcw,
  Sliders,
  Users,
  Radio,
  Eye,
  Volume2,
  AlertCircle,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface EnvironmentSimulatorProps {
  speakers: Speaker[];
  setSpeakers: React.Dispatch<React.SetStateAction<Speaker[]>>;
  micArray: MicrophoneArrayConfig;
  setMicArray: React.Dispatch<React.SetStateAction<MicrophoneArrayConfig>>;
  camera: CameraConfig;
  setCamera: React.Dispatch<React.SetStateAction<CameraConfig>>;
  room: RoomAcoustics;
  setRoom: React.Dispatch<React.SetStateAction<RoomAcoustics>>;
  noise: NoiseSourceConfig;
  setNoise: React.Dispatch<React.SetStateAction<NoiseSourceConfig>>;
  onOpen3D?: () => void;
}

export const EnvironmentSimulator: React.FC<EnvironmentSimulatorProps> = ({
  speakers,
  setSpeakers,
  micArray,
  setMicArray,
  camera,
  setCamera,
  room,
  setRoom,
  noise,
  setNoise,
  onOpen3D,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string>('spk_a');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedEntity, setDraggedEntity] = useState<string | null>(null);
  const [activeSpeakerCount, setActiveSpeakerCount] = useState<number>(
    speakers.filter((s) => s.active).length
  );

  // Coordinate scaling: room is 8m x 6m
  // X: -4.0m to +4.0m
  // Y: 0.0m to 6.0m
  const toCanvasCoords = useCallback((mX: number, mY: number, width: number, height: number) => {
    const scaleX = width / room.widthMeters;
    const scaleY = height / room.lengthMeters;
    const cX = (mX + room.widthMeters / 2) * scaleX;
    const cY = height - mY * scaleY; // flip Y so forward is up
    return { cX, cY };
  }, [room.widthMeters, room.lengthMeters]);

  const toMeterCoords = useCallback((cX: number, cY: number, width: number, height: number) => {
    const scaleX = width / room.widthMeters;
    const scaleY = height / room.lengthMeters;
    const mX = cX / scaleX - room.widthMeters / 2;
    const mY = (height - cY) / scaleY;
    return {
      mX: Math.round(Math.max(-3.8, Math.min(3.8, mX)) * 10) / 10,
      mY: Math.round(Math.max(0.2, Math.min(5.8, mY)) * 10) / 10,
    };
  }, [room.widthMeters, room.lengthMeters]);

  // Update speaker active count
  const handleSpeakerCountChange = (count: number) => {
    setActiveSpeakerCount(count);
    setSpeakers((prev) =>
      prev.map((spk, idx) => ({
        ...spk,
        active: idx < count,
        speechActivity: idx < count ? (idx === 0 ? 'ACTIVE' : (idx === 1 ? 'ACTIVE' : 'INACTIVE')) : 'INACTIVE',
      }))
    );
  };

  // Preset scenarios
  const applyPreset = (preset: 'cross_talk' | 'far_field' | 'side_by_side' | 'severe_interference') => {
    if (preset === 'cross_talk') {
      setSpeakers((prev) => [
        { ...prev[0], position: { x: -1.6, y: 2.4 }, active: true },
        { ...prev[1], position: { x: 1.8, y: 2.6 }, active: true },
        { ...prev[2], position: { x: 0.0, y: 4.2 }, active: false },
        { ...prev[3], position: { x: 2.6, y: 3.5 }, active: false },
      ]);
      setNoise((prev) => ({ ...prev, snrDb: 0, position: { x: -3.2, y: 4.0 } }));
      setActiveSpeakerCount(2);
    } else if (preset === 'far_field') {
      setSpeakers((prev) => [
        { ...prev[0], position: { x: -2.2, y: 4.8 }, active: true },
        { ...prev[1], position: { x: 2.0, y: 5.0 }, active: true },
        { ...prev[2], position: { x: 0.0, y: 5.4 }, active: false },
        { ...prev[3], position: { x: 3.0, y: 4.5 }, active: false },
      ]);
      setRoom((prev) => ({ ...prev, rt60Seconds: 0.65 }));
      setNoise((prev) => ({ ...prev, snrDb: -5 }));
      setActiveSpeakerCount(2);
    } else if (preset === 'side_by_side') {
      setSpeakers((prev) => [
        { ...prev[0], position: { x: -0.4, y: 2.5 }, active: true },
        { ...prev[1], position: { x: 0.6, y: 2.6 }, active: true },
        { ...prev[2], position: { x: -2.0, y: 3.8 }, active: false },
        { ...prev[3], position: { x: 2.0, y: 3.8 }, active: false },
      ]);
      setNoise((prev) => ({ ...prev, snrDb: 5 }));
      setActiveSpeakerCount(2);
    } else if (preset === 'severe_interference') {
      setSpeakers((prev) => [
        { ...prev[0], position: { x: -2.0, y: 2.2 }, active: true },
        { ...prev[1], position: { x: 2.0, y: 2.4 }, active: true },
        { ...prev[2], position: { x: -1.2, y: 4.2 }, active: true },
        { ...prev[3], position: { x: 1.4, y: 3.8 }, active: true },
      ]);
      setNoise((prev) => ({ ...prev, snrDb: -10, type: 'crowd', position: { x: 0.0, y: 4.5 } }));
      setRoom((prev) => ({ ...prev, rt60Seconds: 0.75 }));
      setActiveSpeakerCount(4);
    }
  };

  // Draw 2D Room on canvas with pure white/light scientific styling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clean white laboratory floor
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 1. Draw Acoustic Grid (0.5m gridlines)
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let x = -room.widthMeters / 2; x <= room.widthMeters / 2; x += 0.5) {
      const { cX } = toCanvasCoords(x, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(cX, 0);
      ctx.lineTo(cX, height);
      ctx.stroke();
    }
    for (let y = 0; y <= room.lengthMeters; y += 0.5) {
      const { cY } = toCanvasCoords(0, y, width, height);
      ctx.beginPath();
      ctx.moveTo(0, cY);
      ctx.lineTo(width, cY);
      ctx.stroke();
    }

    // Major 1.0m gridlines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let x = -room.widthMeters / 2; x <= room.widthMeters / 2; x += 1.0) {
      const { cX } = toCanvasCoords(x, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(cX, 0);
      ctx.lineTo(cX, height);
      ctx.stroke();
    }
    for (let y = 0; y <= room.lengthMeters; y += 1.0) {
      const { cY } = toCanvasCoords(0, y, width, height);
      ctx.beginPath();
      ctx.moveTo(0, cY);
      ctx.lineTo(width, cY);
      ctx.stroke();
    }

    // Room boundaries
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // Wall absorption acoustic dampening indicators
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(4, 4, width - 8, 12); // North wall

    // 2. Draw Camera FOV cone (Field of View)
    const { cX: camX, cY: camY } = toCanvasCoords(camera.position.x, camera.position.y, width, height);
    const fovHalfRad = (camera.fovDegrees / 2) * (Math.PI / 180);
    const coneLength = height * 0.92;

    ctx.fillStyle = 'rgba(2, 132, 199, 0.05)';
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(camX, camY);
    ctx.lineTo(camX - Math.tan(fovHalfRad) * coneLength, camY - coneLength);
    ctx.lineTo(camX + Math.tan(fovHalfRad) * coneLength, camY - coneLength);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Draw Noise Source acoustic wavefronts
    const { cX: noiseX, cY: noiseY } = toCanvasCoords(noise.position.x, noise.position.y, width, height);
    for (let r = 16; r <= 64; r += 16) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(noiseX, noiseY, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Noise icon marker
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(noiseX, noiseY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText(`Noise (${noise.type})`, noiseX + 12, noiseY + 4);

    // 4. Draw Sound Propagation rays from each active speaker to Microphone Array
    const { cX: micX, cY: micY } = toCanvasCoords(micArray.position.x, micArray.position.y, width, height);

    speakers.forEach((spk) => {
      if (!spk.active) return;
      const { cX: sX, cY: sY } = toCanvasCoords(spk.position.x, spk.position.y, width, height);

      // Direct acoustic ray
      ctx.strokeStyle = spk.color;
      ctx.lineWidth = spk.speechActivity === 'ACTIVE' ? 2.5 : 1.2;
      ctx.setLineDash(spk.speechActivity === 'ACTIVE' ? [] : [4, 4]);
      ctx.beginPath();
      ctx.moveTo(sX, sY);
      ctx.lineTo(micX, micY);
      ctx.stroke();

      // Optical Line-of-sight to Camera
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(sX, sY);
      ctx.lineTo(camX, camY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Room wall bounce reflection line (simulating first-order reflection)
      const wallReflectionX = sX + (width - sX) * 0.5;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(sX, sY);
      ctx.lineTo(width - 4, wallReflectionX * 0.4);
      ctx.lineTo(micX, micY);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // 5. Draw Microphone Array
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 2.5;

    const spacingPx = (micArray.spacingMeters / room.widthMeters) * width;
    const halfWidthPx = ((micArray.micCount - 1) * spacingPx) / 2;

    // Draw Array Bar
    ctx.beginPath();
    ctx.moveTo(micX - halfWidthPx - 8, micY);
    ctx.lineTo(micX + halfWidthPx + 8, micY);
    ctx.stroke();

    // Individual Microphone capsules
    for (let i = 0; i < micArray.micCount; i++) {
      const capsuleX = micX - halfWidthPx + i * spacingPx;
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(capsuleX, micY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Label Microphone Array
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText(`🎙 Mic Array (${micArray.micCount}-ch ULA)`, micX - 58, micY + 20);

    // 6. Draw Camera & Robot Position
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.rect(camX - 8, camY - 6, 16, 12);
    ctx.fill();
    ctx.fillStyle = '#047857';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText('📷 Camera / Robot Base', camX - 58, camY - 12);

    // 7. Draw Speakers
    speakers.forEach((spk) => {
      const { cX: sX, cY: sY } = toCanvasCoords(spk.position.x, spk.position.y, width, height);

      // Acoustic pressure rings when active
      if (spk.active && spk.speechActivity === 'ACTIVE') {
        ctx.strokeStyle = `${spk.color}50`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(sX, sY, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sX, sY, 32, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Speaker body circle
      ctx.fillStyle = spk.active ? spk.color : '#94a3b8';
      ctx.beginPath();
      ctx.arc(sX, sY, 11, 0, Math.PI * 2);
      ctx.fill();

      // Selection ring
      if (selectedEntity === spk.id) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sX, sY, 16, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Speaker Label & Azimuth tag (High-contrast dark text)
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(spk.label, sX - 28, sY - 18);

      const az = calculateAzimuthDeg(spk.position.x, spk.position.y, micArray.position.x, micArray.position.y);
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(`θ: ${az.toFixed(1)}°`, sX - 24, sY + 24);
    });

  }, [speakers, micArray, camera, room, noise, selectedEntity, toCanvasCoords]);

  // Canvas Mouse Interaction for Dragging Entities
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check hit test against speakers
    for (const spk of speakers) {
      const { cX, cY } = toCanvasCoords(spk.position.x, spk.position.y, canvas.width, canvas.height);
      const dist = Math.hypot(clickX - cX, clickY - cY);
      if (dist <= 22) {
        setSelectedEntity(spk.id);
        setDraggedEntity(spk.id);
        setIsDragging(true);
        return;
      }
    }

    // Check hit test against noise source
    const { cX: nX, cY: nY } = toCanvasCoords(noise.position.x, noise.position.y, canvas.width, canvas.height);
    if (Math.hypot(clickX - nX, clickY - nY) <= 20) {
      setSelectedEntity('noise');
      setDraggedEntity('noise');
      setIsDragging(true);
      return;
    }

    // Check hit test against microphone array
    const { cX: mX, cY: mY } = toCanvasCoords(micArray.position.x, micArray.position.y, canvas.width, canvas.height);
    if (Math.hypot(clickX - mX, clickY - mY) <= 24) {
      setSelectedEntity('mic_array');
      setDraggedEntity('mic_array');
      setIsDragging(true);
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedEntity) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const { mX, mY } = toMeterCoords(clickX, clickY, canvas.width, canvas.height);

    if (draggedEntity === 'noise') {
      setNoise((prev) => ({ ...prev, position: { x: mX, y: mY } }));
    } else if (draggedEntity === 'mic_array') {
      // Allow slight repositioning near bottom wall
      const clampedY = Math.max(0.1, Math.min(1.2, mY));
      setMicArray((prev) => ({ ...prev, position: { x: mX, y: clampedY } }));
      setCamera((prev) => ({ ...prev, position: { x: mX, y: Math.max(0.1, clampedY - 0.2) } }));
    } else {
      // It's a speaker
      setSpeakers((prev) =>
        prev.map((s) => {
          if (s.id !== draggedEntity) return s;
          const az = calculateAzimuthDeg(mX, mY, micArray.position.x, micArray.position.y);
          const dist = calculateDistance(mX, mY, micArray.position.x, micArray.position.y);
          return {
            ...s,
            position: { x: mX, y: mY },
            azimuthDeg: Math.round(az * 10) / 10,
            distanceMeters: Math.round(dist * 10) / 10,
          };
        })
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedEntity(null);
  };

  const selectedSpeaker = speakers.find((s) => s.id === selectedEntity);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Move className="w-5 h-5 text-sky-600" />
            2D Acoustic & Visual Room Simulator
          </h2>
          <p className="text-xs text-slate-500">
            Interactive physical simulation space (8.0m × 6.0m). Drag speakers, microphones, or noise sources to evaluate spatial acoustics.
          </p>
        </div>

        {/* Quick Presets & 3D Jump Button */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {onOpen3D && (
            <button
              onClick={onOpen3D}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Switch to 3D Spatial Room View
            </button>
          )}

          <span className="text-slate-400 font-mono pl-1">Presets:</span>
          <button
            onClick={() => applyPreset('cross_talk')}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer shadow-2xs"
          >
            Cross-Talk (2 Spk)
          </button>
          <button
            onClick={() => applyPreset('side_by_side')}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer shadow-2xs"
          >
            Narrow Separation
          </button>
          <button
            onClick={() => applyPreset('far_field')}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer shadow-2xs"
          >
            Reverberant Far-Field
          </button>
          <button
            onClick={() => applyPreset('severe_interference')}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer shadow-2xs"
          >
            4-Speaker Cockpit
          </button>
        </div>
      </div>

      {/* Main Workspace Split Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive 2D Canvas Viewport (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
            <span>Stage Coordinates: [-4.0m, +4.0m] × [0.0m, 6.0m]</span>
            <span className="text-sky-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
              Interactive Drag & Drop
            </span>
          </div>

          <div className="relative aspect-[4/3] w-full rounded-lg border border-slate-300 bg-white overflow-hidden cursor-crosshair shadow-inner">
            <canvas
              ref={canvasRef}
              width={760}
              height={570}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Canvas Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-600 pt-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-medium text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> Spk A
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Spk B
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Mic Array
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Noise Source
              </span>
            </div>
            <span className="text-slate-500">FOV: {camera.fovDegrees}° Optical Cone</span>
          </div>
        </div>

        {/* Right: Parameter Controls & Physical Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Speaker Count & Active Selection Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-600" />
                Speaker Population
              </h3>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                {[1, 2, 3, 4].map((count) => (
                  <button
                    key={count}
                    onClick={() => handleSpeakerCountChange(count)}
                    className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                      activeSpeakerCount === count
                        ? 'bg-sky-600 text-white font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {count} {count === 1 ? 'Spk' : 'Spks'}
                  </button>
                ))}
              </div>
            </div>

            {/* Speaker Coordinate Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono tabular-nums text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                    <th className="py-1.5 font-semibold">Speaker</th>
                    <th className="py-1.5 font-semibold">Pos (x, y)</th>
                    <th className="py-1.5 font-semibold">Azimuth (θ)</th>
                    <th className="py-1.5 font-semibold">Dist</th>
                    <th className="py-1.5 font-semibold">DRR</th>
                    <th className="py-1.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {speakers.slice(0, activeSpeakerCount).map((spk) => {
                    const az = calculateAzimuthDeg(
                      spk.position.x,
                      spk.position.y,
                      micArray.position.x,
                      micArray.position.y
                    );
                    const dist = calculateDistance(
                      spk.position.x,
                      spk.position.y,
                      micArray.position.x,
                      micArray.position.y
                    );
                    const drr = calculateDRR(dist, room);
                    const isSelected = selectedEntity === spk.id;

                    return (
                      <tr
                        key={spk.id}
                        onClick={() => setSelectedEntity(spk.id)}
                        className={`hover:bg-slate-50 cursor-pointer ${
                          isSelected ? 'bg-sky-50 text-sky-900 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <td className="py-2 flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: spk.color }}
                          />
                          {spk.label}
                        </td>
                        <td className="py-2 text-slate-600">
                          [{spk.position.x > 0 ? `+${spk.position.x}` : spk.position.x}, {spk.position.y}]m
                        </td>
                        <td className="py-2 text-slate-900 font-bold">
                          {az > 0 ? `+${az.toFixed(1)}` : az.toFixed(1)}°
                        </td>
                        <td className="py-2 text-slate-600">{dist.toFixed(2)}m</td>
                        <td className="py-2 text-slate-600">{drr > 0 ? `+${drr}` : drr} dB</td>
                        <td className="py-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSpeakers((prev) =>
                                prev.map((s) =>
                                  s.id === spk.id
                                    ? {
                                        ...s,
                                        speechActivity: s.speechActivity === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                                        lipActivity: s.speechActivity === 'ACTIVE' ? 'Inactive' : 'Active',
                                      }
                                    : s
                                )
                              );
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer border ${
                              spk.speechActivity === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-slate-100 text-slate-500 border-slate-300'
                            }`}
                          >
                            {spk.speechActivity}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Entity Fine Coordinate Steppers */}
          {selectedSpeaker && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: selectedSpeaker.color }}
                  />
                  Position Stepper: {selectedSpeaker.label} ({selectedSpeaker.name})
                </span>
                <span className="text-slate-400 font-mono">0.1m step</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <label className="text-slate-500 block mb-1">X Lateral (m)</label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setSpeakers((prev) =>
                          prev.map((s) =>
                            s.id === selectedSpeaker.id
                              ? {
                                  ...s,
                                  position: {
                                    ...s.position,
                                    x: Math.round((s.position.x - 0.2) * 10) / 10,
                                  },
                                }
                              : s
                          )
                        )
                      }
                      className="px-2.5 py-1 bg-slate-100 rounded border border-slate-300 hover:bg-slate-200 text-slate-800 cursor-pointer"
                    >
                      -0.2
                    </button>
                    <span className="flex-1 text-center py-1 bg-slate-50 rounded border border-slate-200 text-slate-900 font-bold">
                      {selectedSpeaker.position.x > 0
                        ? `+${selectedSpeaker.position.x}`
                        : selectedSpeaker.position.x}
                    </span>
                    <button
                      onClick={() =>
                        setSpeakers((prev) =>
                          prev.map((s) =>
                            s.id === selectedSpeaker.id
                              ? {
                                  ...s,
                                  position: {
                                    ...s.position,
                                    x: Math.round((s.position.x + 0.2) * 10) / 10,
                                  },
                                }
                              : s
                          )
                        )
                      }
                      className="px-2.5 py-1 bg-slate-100 rounded border border-slate-300 hover:bg-slate-200 text-slate-800 cursor-pointer"
                    >
                      +0.2
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Y Depth (m)</label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setSpeakers((prev) =>
                          prev.map((s) =>
                            s.id === selectedSpeaker.id
                              ? {
                                  ...s,
                                  position: {
                                    ...s.position,
                                    y: Math.max(0.4, Math.round((s.position.y - 0.2) * 10) / 10),
                                  },
                                }
                              : s
                          )
                        )
                      }
                      className="px-2.5 py-1 bg-slate-100 rounded border border-slate-300 hover:bg-slate-200 text-slate-800 cursor-pointer"
                    >
                      -0.2
                    </button>
                    <span className="flex-1 text-center py-1 bg-slate-50 rounded border border-slate-200 text-slate-900 font-bold">
                      {selectedSpeaker.position.y}
                    </span>
                    <button
                      onClick={() =>
                        setSpeakers((prev) =>
                          prev.map((s) =>
                            s.id === selectedSpeaker.id
                              ? {
                                  ...s,
                                  position: {
                                    ...s.position,
                                    y: Math.min(5.6, Math.round((s.position.y + 0.2) * 10) / 10),
                                  },
                                }
                              : s
                          )
                        )
                      }
                      className="px-2.5 py-1 bg-slate-100 rounded border border-slate-300 hover:bg-slate-200 text-slate-800 cursor-pointer"
                    >
                      +0.2
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Room Reverberation & SNR Quick Sliders */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-sky-600" />
              Room Acoustics & Signal-to-Noise Ratio
            </h3>

            {/* RT60 Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Room Reverberation (RT60)</span>
                <span className="font-mono text-sky-700 font-bold">{room.rt60Seconds.toFixed(2)} s</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.95"
                step="0.05"
                value={room.rt60Seconds}
                onChange={(e) => setRoom((prev) => ({ ...prev, rt60Seconds: parseFloat(e.target.value) }))}
                className="w-full accent-sky-600 bg-slate-200 h-2 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.15s (Anechoic)</span>
                <span>0.35s (Office)</span>
                <span>0.65s (Lecture Hall)</span>
                <span>0.95s (Cathedral)</span>
              </div>
            </div>

            {/* SNR Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Global Signal-to-Noise Ratio (SNR)</span>
                <span className="font-mono text-amber-700 font-bold">{noise.snrDb > 0 ? `+${noise.snrDb}` : noise.snrDb} dB</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {([10, 5, 0, -5, -10] as SNRLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setNoise((prev) => ({ ...prev, snrDb: level }))}
                    className={`py-1 text-xs font-mono rounded cursor-pointer transition-colors ${
                      noise.snrDb === level
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {level > 0 ? `+${level}` : level} dB
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
