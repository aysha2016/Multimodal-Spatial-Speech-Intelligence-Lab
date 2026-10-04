/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * 3D Interactive Spatial Acoustic & Visual Room Simulator (Three.js WebGL)
 * 
 * Features:
 * - 3D Laboratory Room (8m x 6m x 3m) with precision metric coordinate grid
 * - 3D Multi-capsule Microphone Array with real-time steered 3D beamforming lobe
 * - 3D Camera sensor with pyramidal optical field-of-view (FOV) frustum cone & gaze tracking
 * - 3D Speakers positioned with acoustic wavefront ripples and multipath wall reflection rays
 * - Orbit controls (rotate, zoom, pan) + Quick camera presets (Iso 3D, Top-Down, Front, Listener POV)
 * - Interactive 3D Raycaster for selecting and inspecting sound sources
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Speaker,
  MicrophoneArrayConfig,
  CameraConfig,
  RoomAcoustics,
  NoiseSourceConfig
} from '../types/research';
import {
  calculateAzimuthDeg,
  calculateDistance,
  calculateDRR
} from '../utils/acousticEngine';
import {
  RotateCcw,
  Eye,
  Camera,
  Maximize2,
  Sliders,
  Layers,
  Sparkles,
  Info,
  Radio,
  CheckCircle2
} from 'lucide-react';

interface ThreeSpatialRoomSimulatorProps {
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
}

export const ThreeSpatialRoomSimulator: React.FC<ThreeSpatialRoomSimulatorProps> = ({
  speakers,
  setSpeakers,
  micArray,
  camera,
  room,
  noise,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Layer toggles
  const [showBeamLobe, setShowBeamLobe] = useState<boolean>(true);
  const [showRays, setShowRays] = useState<boolean>(true);
  const [showWavefronts, setShowWavefronts] = useState<boolean>(true);
  const [showCameraFrustum, setShowCameraFrustum] = useState<boolean>(true);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('spk_a');

  // Mouse orbit state
  const isDraggingRef = useRef<boolean>(false);
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const orbitAnglesRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    radius: 9.5,
  });

  const activeSpeakers = speakers.filter((s) => s.active);

  // Camera presets
  const setCameraPreset = (preset: 'iso' | 'top' | 'front' | 'listener') => {
    if (!cameraRef.current) return;
    if (preset === 'iso') {
      orbitAnglesRef.current = { theta: Math.PI / 4, phi: Math.PI / 3.2, radius: 9.5 };
    } else if (preset === 'top') {
      orbitAnglesRef.current = { theta: 0, phi: 0.05, radius: 9.0 };
    } else if (preset === 'front') {
      orbitAnglesRef.current = { theta: 0, phi: Math.PI / 2.1, radius: 8.5 };
    } else if (preset === 'listener') {
      orbitAnglesRef.current = { theta: 0, phi: Math.PI / 2.3, radius: 4.8 };
    }
    updateCameraPosition();
  };

  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = orbitAnglesRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, Math.max(0.5, y + 1.2), z);
    cameraRef.current.lookAt(0, 1.2, 2.5); // Center of the laboratory room
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // 1. Scene - Pure clean white clinical laboratory background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.Fog(0xffffff, 14, 30);
    sceneRef.current = scene;

    // 2. Camera
    const cameraObj = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = cameraObj;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 12, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.4);
    fillLight.position.set(-6, 8, -4);
    scene.add(fillLight);

    // 5. Floor & Grid (8m x 6m scaled room)
    const floorGeo = new THREE.PlaneGeometry(room.widthMeters, room.lengthMeters);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0, room.lengthMeters / 2);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Grid Helper
    const gridHelper = new THREE.GridHelper(Math.max(room.widthMeters, room.lengthMeters), 16, 0x0284c7, 0xe2e8f0);
    gridHelper.position.set(0, 0.002, room.lengthMeters / 2);
    scene.add(gridHelper);

    // Room Wireframe Boundary Box
    const roomBoxGeo = new THREE.BoxGeometry(room.widthMeters, room.heightMeters, room.lengthMeters);
    const roomBoxEdges = new THREE.EdgesGeometry(roomBoxGeo);
    const roomBoxLine = new THREE.LineSegments(
      roomBoxEdges,
      new THREE.LineBasicMaterial({ color: 0xcbd5e1, linewidth: 1 })
    );
    roomBoxLine.position.set(0, room.heightMeters / 2, room.lengthMeters / 2);
    scene.add(roomBoxLine);

    // Mouse / Touch Event Handlers for Orbiting
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      orbitAnglesRef.current.theta -= deltaX * 0.008;
      orbitAnglesRef.current.phi = Math.max(
        0.05,
        Math.min(Math.PI / 2.05, orbitAnglesRef.current.phi - deltaY * 0.008)
      );
      updateCameraPosition();
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitAnglesRef.current.radius = Math.max(
        3.5,
        Math.min(18.0, orbitAnglesRef.current.radius + e.deltaY * 0.008)
      );
      updateCameraPosition();
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domEl.addEventListener('wheel', handleWheel, { passive: false });

    // Window Resize Handler
    const handleResize = () => {
      if (!mount || !renderer || !cameraObj) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      cameraObj.aspect = newW / newH;
      cameraObj.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      domEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domEl.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      mount.innerHTML = '';
    };
  }, [room, updateCameraPosition]);

  // Update Dynamic Scene Entities (Speakers, Mics, Camera, Waves, Beamforming Lobe)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old dynamic group if exists
    const existingGroup = scene.getObjectByName('dynamic_group');
    if (existingGroup) {
      scene.remove(existingGroup);
    }

    const dynamicGroup = new THREE.Group();
    dynamicGroup.name = 'dynamic_group';

    // 1. Microphone Array (Pedestal + Horizontal Bar + Capsules)
    const micX = micArray.position.x;
    const micY = 1.0; // 1m height table/stand
    const micZ = micArray.position.y;

    const micPedestalGeo = new THREE.CylinderGeometry(0.04, 0.06, micY, 16);
    const micPedestalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 });
    const micPedestal = new THREE.Mesh(micPedestalGeo, micPedestalMat);
    micPedestal.position.set(micX, micY / 2, micZ);
    micPedestal.castShadow = true;
    dynamicGroup.add(micPedestal);

    // Array Bar
    const totalAperture = (micArray.micCount - 1) * micArray.spacingMeters;
    const barGeo = new THREE.BoxGeometry(totalAperture + 0.08, 0.03, 0.04);
    const barMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 });
    const barMesh = new THREE.Mesh(barGeo, barMat);
    barMesh.position.set(micX, micY, micZ);
    dynamicGroup.add(barMesh);

    // Capsules
    for (let i = 0; i < micArray.micCount; i++) {
      const capOffset = -totalAperture / 2 + i * micArray.spacingMeters;
      const capGeo = new THREE.SphereGeometry(0.02, 12, 12);
      const capMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.6,
      });
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.set(micX + capOffset, micY + 0.02, micZ);
      dynamicGroup.add(capMesh);
    }

    // 3D Steered Beamforming Directivity Lobe
    if (showBeamLobe) {
      const activeTarget = activeSpeakers[0];
      const targetAzimuth = activeTarget
        ? calculateAzimuthDeg(activeTarget.position.x, activeTarget.position.y, micX, micZ)
        : 0;
      const targetRad = (targetAzimuth * Math.PI) / 180;

      const lobeGeo = new THREE.ConeGeometry(0.45, 1.8, 24, 1, true);
      const lobeMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        wireframe: true,
      });
      const lobeMesh = new THREE.Mesh(lobeGeo, lobeMat);
      lobeMesh.position.set(micX, micY, micZ);
      lobeMesh.rotation.x = Math.PI / 2; // point forward (+Z)
      lobeMesh.rotation.z = -targetRad; // steer towards target azimuth
      dynamicGroup.add(lobeMesh);
    }

    // 2. 3D Camera Sensor with Pyramidal Frustum
    const camX = camera.position.x;
    const camY = 1.25; // 1.25m height
    const camZ = camera.position.y;

    const camBodyGeo = new THREE.BoxGeometry(0.16, 0.12, 0.18);
    const camBodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 });
    const camBody = new THREE.Mesh(camBodyGeo, camBodyMat);
    camBody.position.set(camX, camY, camZ);
    dynamicGroup.add(camBody);

    // Lens
    const lensGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.06, 16);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.9, roughness: 0.1 });
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.rotation.x = Math.PI / 2;
    lensMesh.position.set(camX, camY, camZ + 0.11);
    dynamicGroup.add(lensMesh);

    // Camera 3D Frustum Wireframe
    if (showCameraFrustum) {
      const fovRad = (camera.fovDegrees / 2) * (Math.PI / 180);
      const frustumDepth = 4.2;
      const fWidth = Math.tan(fovRad) * frustumDepth;
      const fHeight = fWidth * 0.56; // 16:9 aspect

      const frustumGeo = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        // Ray to top-left
        0, 0, 0, -fWidth, fHeight, frustumDepth,
        // Ray to top-right
        0, 0, 0, fWidth, fHeight, frustumDepth,
        // Ray to bottom-right
        0, 0, 0, fWidth, -fHeight, frustumDepth,
        // Ray to bottom-left
        0, 0, 0, -fWidth, -fHeight, frustumDepth,
        // Far rectangle perimeter
        -fWidth, fHeight, frustumDepth, fWidth, fHeight, frustumDepth,
        fWidth, fHeight, frustumDepth, fWidth, -fHeight, frustumDepth,
        fWidth, -fHeight, frustumDepth, -fWidth, -fHeight, frustumDepth,
        -fWidth, -fHeight, frustumDepth, -fWidth, fHeight, frustumDepth,
      ]);
      frustumGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const frustumLine = new THREE.LineSegments(
        frustumGeo,
        new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.45 })
      );
      frustumLine.position.set(camX, camY, camZ);
      dynamicGroup.add(frustumLine);
    }

    // 3. 3D Speakers
    speakers.forEach((spk) => {
      if (!spk.active) return;
      const spkGroup = new THREE.Group();
      const sX = spk.position.x;
      const sZ = spk.position.y;
      const sY = 1.45; // head height (1.45m)

      // Base Pedestal
      const baseGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.06, 24);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.set(sX, 0.03, sZ);
      baseMesh.receiveShadow = true;
      spkGroup.add(baseMesh);

      // Torso / Stand
      const torsoGeo = new THREE.CylinderGeometry(0.08, 0.12, sY - 0.35, 16);
      const torsoMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(spk.color),
        roughness: 0.3,
      });
      const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
      torsoMesh.position.set(sX, (sY - 0.35) / 2 + 0.06, sZ);
      torsoMesh.castShadow = true;
      spkGroup.add(torsoMesh);

      // Head / Mannequin sphere
      const headGeo = new THREE.SphereGeometry(0.15, 24, 24);
      const headMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(spk.color),
        roughness: 0.2,
      });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      headMesh.position.set(sX, sY, sZ);
      headMesh.castShadow = true;
      spkGroup.add(headMesh);

      // Selection Marker
      if (selectedEntityId === spk.id) {
        const selGeo = new THREE.RingGeometry(0.24, 0.28, 32);
        const selMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide });
        const selMesh = new THREE.Mesh(selGeo, selMat);
        selMesh.rotation.x = -Math.PI / 2;
        selMesh.position.set(sX, 0.06, sZ);
        spkGroup.add(selMesh);
      }

      // 3D Direct Acoustic Sound Ray
      if (showRays) {
        const rayGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(sX, sY, sZ),
          new THREE.Vector3(micX, micY, micZ),
        ]);
        const rayLine = new THREE.Line(
          rayGeo,
          new THREE.LineBasicMaterial({
            color: new THREE.Color(spk.color),
            linewidth: spk.speechActivity === 'ACTIVE' ? 2 : 1,
            transparent: true,
            opacity: spk.speechActivity === 'ACTIVE' ? 0.9 : 0.3,
          })
        );
        spkGroup.add(rayLine);

        // First-order wall reflection ray (simulating acoustic multipath)
        const wallReflectionX = sX > 0 ? room.widthMeters / 2 : -room.widthMeters / 2;
        const bounceGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(sX, sY, sZ),
          new THREE.Vector3(wallReflectionX, sY * 0.9, (sZ + micZ) / 2),
          new THREE.Vector3(micX, micY, micZ),
        ]);
        const bounceLine = new THREE.Line(
          bounceGeo,
          new THREE.LineDashedMaterial({
            color: 0x94a3b8,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: true,
            opacity: 0.4,
          })
        );
        bounceLine.computeLineDistances();
        spkGroup.add(bounceLine);
      }

      dynamicGroup.add(spkGroup);
    });

    // 4. 3D Noise Source
    const noiseMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x991b1b, emissiveIntensity: 0.4 })
    );
    noiseMesh.position.set(noise.position.x, 1.1, noise.position.y);
    noiseMesh.castShadow = true;
    dynamicGroup.add(noiseMesh);

    scene.add(dynamicGroup);

    // 5. Animation Loop for Pulsating Wavefronts
    let clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getElapsedTime();

      // Pulsate acoustic spherical wavefronts
      if (showWavefronts) {
        activeSpeakers.forEach((spk, idx) => {
          if (spk.speechActivity !== 'ACTIVE') return;
          const waveObj = dynamicGroup.getObjectByName(`wave_${spk.id}`);
          if (waveObj) {
            dynamicGroup.remove(waveObj);
          }

          const radius = ((delta * 1.5 + idx * 0.8) % 2.5) + 0.3;
          const waveGeo = new THREE.RingGeometry(radius - 0.04, radius, 32);
          const waveMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(spk.color),
            transparent: true,
            opacity: Math.max(0, 1.0 - radius / 2.5) * 0.5,
            side: THREE.DoubleSide,
          });
          const waveMesh = new THREE.Mesh(waveGeo, waveMat);
          waveMesh.name = `wave_${spk.id}`;
          waveMesh.rotation.x = -Math.PI / 2;
          waveMesh.position.set(spk.position.x, 0.05, spk.position.y);
          dynamicGroup.add(waveMesh);
        });
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    speakers,
    micArray,
    camera,
    room,
    noise,
    showBeamLobe,
    showRays,
    showWavefronts,
    showCameraFrustum,
    selectedEntityId,
    activeSpeakers,
  ]);

  const selectedSpeaker = speakers.find((s) => s.id === selectedEntityId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header & 3D Viewport Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Radio className="w-5 h-5 text-sky-600" />
            3D Spatial Acoustic & Visual Room Simulator (WebGL)
          </h2>
          <p className="text-xs text-slate-500">
            Full 3D physical modeling: microphone beamforming directivity lobe, optical camera FOV frustum, and acoustic multipath wall reflections.
          </p>
        </div>

        {/* Camera Preset Quick Buttons */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg text-xs font-mono shadow-sm">
          <span className="text-slate-400 px-1">Camera Views:</span>
          <button
            onClick={() => setCameraPreset('iso')}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
          >
            Perspective 3D
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
          >
            Top-Down 2D
          </button>
          <button
            onClick={() => setCameraPreset('front')}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
          >
            Elevation Front
          </button>
          <button
            onClick={() => setCameraPreset('listener')}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
          >
            Robot Eye POV
          </button>
        </div>
      </div>

      {/* Main 3D Stage (Split Console) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D WebGL Canvas Viewport (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1.5 text-sky-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
              Three.js Spatial Engine Active
            </span>
            <span>Room: {room.widthMeters}m × {room.lengthMeters}m × {room.heightMeters}m · Drag to Orbit / Wheel to Zoom</span>
          </div>

          <div
            ref={mountRef}
            className="relative aspect-[16/10] w-full rounded-lg border border-slate-200 bg-slate-50 overflow-hidden cursor-grab active:cursor-grabbing shadow-inner"
          />

          {/* 3D Visual Layer Toggles Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs font-mono text-slate-600">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBeamLobe}
                  onChange={(e) => setShowBeamLobe(e.target.checked)}
                  className="accent-sky-600 rounded"
                />
                <span>3D Beamforming Lobe</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCameraFrustum}
                  onChange={(e) => setShowCameraFrustum(e.target.checked)}
                  className="accent-sky-600 rounded"
                />
                <span>Camera FOV Frustum</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRays}
                  onChange={(e) => setShowRays(e.target.checked)}
                  className="accent-sky-600 rounded"
                />
                <span>Multipath Reflection Rays</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWavefronts}
                  onChange={(e) => setShowWavefronts(e.target.checked)}
                  className="accent-sky-600 rounded"
                />
                <span>Acoustic Wavefronts</span>
              </label>
            </div>

            <button
              onClick={() => setCameraPreset('iso')}
              className="text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset 3D Angle</span>
            </button>
          </div>
        </div>

        {/* Right: 3D Spatial Geometry & Coordinate Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Spatial Coordinates Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-600" />
                3D Spatial Coordinates
              </h3>
              <span className="text-xs font-mono text-slate-500">{activeSpeakers.length} Active</span>
            </div>

            <div className="space-y-2">
              {activeSpeakers.map((spk) => {
                const az = calculateAzimuthDeg(spk.position.x, spk.position.y, micArray.position.x, micArray.position.y);
                const dist = calculateDistance(spk.position.x, spk.position.y, micArray.position.x, micArray.position.y);
                const drr = calculateDRR(dist, room);
                const isSelected = selectedEntityId === spk.id;

                return (
                  <div
                    key={spk.id}
                    onClick={() => setSelectedEntityId(spk.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer space-y-2 text-xs font-mono ${
                      isSelected
                        ? 'bg-sky-50/70 border-sky-400 shadow-sm'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: spk.color }} />
                        <span className="font-bold text-slate-900">{spk.label}</span>
                        <span className="text-slate-500 font-sans">({spk.name})</span>
                      </div>
                      <span className="text-sky-700 font-bold">θ = {az > 0 ? `+${az.toFixed(1)}` : az.toFixed(1)}°</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-[11px] tabular-nums text-slate-600">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Coordinates:</span>
                        <span>[{spk.position.x > 0 ? `+${spk.position.x}` : spk.position.x}, {spk.position.y}]m</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Distance:</span>
                        <span>{dist.toFixed(2)}m</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">DRR Ratio:</span>
                        <span>{drr > 0 ? `+${drr}` : drr} dB</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Speaker 3D Position Stepper */}
          {selectedSpeaker && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedSpeaker.color }} />
                  Fine 3D Position: {selectedSpeaker.label}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">0.2m increments</span>
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
                              ? { ...s, position: { ...s.position, x: Math.round((s.position.x - 0.2) * 10) / 10 } }
                              : s
                          )
                        )
                      }
                      className="px-2.5 py-1 bg-slate-100 rounded border border-slate-200 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center py-1 bg-slate-50 rounded border border-slate-200 text-sky-700 font-bold">
                      {selectedSpeaker.position.x > 0 ? `+${selectedSpeaker.position.x}` : selectedSpeaker.position.x}
                    </span>
                    <button
                      onClick={() =>
                        setSpeakers((prev) =>
                          prev.map((s) =>
                            s.id === selectedSpeaker.id
                              ? { ...s, position: { ...s.position, x: Math.round((s.position.x + 0.2) * 10) / 10 } }
                              : s
                          )
                        )
                      }
                      className="px-2.5 py-1 bg-slate-100 rounded border border-slate-200 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Z Depth (m)</label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setSpeakers((prev) =>
                          prev.map((s) =>
                            s.id === selectedSpeaker.id
                              ? { ...s, position: { ...s.position, y: Math.max(0.4, Math.round((s.position.y - 0.2) * 10) / 10) } }
                              : s
                          )
                        )
                      }
                      className="px-2.5 py-1 bg-slate-100 rounded border border-slate-200 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center py-1 bg-slate-50 rounded border border-slate-200 text-sky-700 font-bold">
                      {selectedSpeaker.position.y}
                    </span>
                    <button
                      onClick={() =>
                        setSpeakers((prev) =>
                          prev.map((s) =>
                            s.id === selectedSpeaker.id
                              ? { ...s, position: { ...s.position, y: Math.min(5.6, Math.round((s.position.y + 0.2) * 10) / 10) } }
                              : s
                          )
                        )
                      }
                      className="px-2.5 py-1 bg-slate-100 rounded border border-slate-200 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3D Beamforming Directivity Explanation */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2 text-xs">
            <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
              Physical 3D Spatial Beamforming Lobe
            </h4>
            <p className="text-slate-600 leading-relaxed">
              The 3D conical lobe shown in the WebGL viewport models the Delay-and-Sum / MVDR directivity mainlobe (3 dB beamwidth approximately 50.8 * lambda / (M * d)). Notice how it dynamically steers towards the target speaker to attenuate competing acoustic sound sources off-axis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
