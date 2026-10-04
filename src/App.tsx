/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Principal Interactive Application Entry
 */

import React, { useState } from 'react';
import {
  Header,
  TabId
} from './components/Header';
import { ResearchOverview } from './components/ResearchOverview';
import { ThreeSpatialRoomSimulator } from './components/ThreeSpatialRoomSimulator';
import { EnvironmentSimulator } from './components/EnvironmentSimulator';
import { RealSpeechNoiseLab } from './components/RealSpeechNoiseLab';
import { AudioConfigurationPanel } from './components/AudioConfigurationPanel';
import { VisualConfigurationPanel } from './components/VisualConfigurationPanel';
import { SpeakerDetectionPanel } from './components/SpeakerDetectionPanel';
import { SpatialLocalizationPanel } from './components/SpatialLocalizationPanel';
import { SpeechSeparationPanel } from './components/SpeechSeparationPanel';
import { ASRAnalysisPanel } from './components/ASRAnalysisPanel';
import { SpeakerIdentificationPanel } from './components/SpeakerIdentificationPanel';
import { ModelComparisonPanel } from './components/ModelComparisonPanel';
import { AblationStudyPanel } from './components/AblationStudyPanel';
import { ResultsSNRExperimentPanel } from './components/ResultsSNRExperimentPanel';
import { ResearchReportGenerator } from './components/ResearchReportGenerator';

import {
  Speaker,
  MicrophoneArrayConfig,
  CameraConfig,
  RoomAcoustics,
  NoiseSourceConfig
} from './types/research';

import {
  INITIAL_SPEAKERS,
  INITIAL_MIC_ARRAY,
  INITIAL_CAMERA,
  INITIAL_ROOM,
  INITIAL_NOISE
} from './utils/researchData';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Core Simulation State
  const [speakers, setSpeakers] = useState<Speaker[]>(INITIAL_SPEAKERS);
  const [micArray, setMicArray] = useState<MicrophoneArrayConfig>(INITIAL_MIC_ARRAY);
  const [camera, setCamera] = useState<CameraConfig>(INITIAL_CAMERA);
  const [room, setRoom] = useState<RoomAcoustics>(INITIAL_ROOM);
  const [noise, setNoise] = useState<NoiseSourceConfig>(INITIAL_NOISE);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<string | null>(null);

  // Trigger End-to-End Pipeline Execution
  const handleRunPipeline = () => {
    setIsSimulating(true);
    setSimulationStep('Capturing Transducer Array & Camera Video...');

    setTimeout(() => {
      setSimulationStep('Detecting Speakers & Multimodal Voice Activity...');
    }, 400);

    setTimeout(() => {
      setSimulationStep('Estimating Direction of Arrival (DOA) via TDOA + Visual MAP...');
    }, 800);

    setTimeout(() => {
      setSimulationStep('Computing MVDR Spatial Beamforming & AV-SepFormer Masks...');
    }, 1200);

    setTimeout(() => {
      setSimulationStep('Decoding ASR Hypothesis Transcripts & Word Error Rate...');
    }, 1600);

    setTimeout(() => {
      setIsSimulating(false);
      setSimulationStep(null);
      // If currently on overview, advance to separation or results
      if (activeTab === 'overview') {
        setActiveTab('separation');
      }
    }, 2000);
  };

  // Reset to Baseline
  const handleReset = () => {
    setSpeakers(INITIAL_SPEAKERS);
    setMicArray(INITIAL_MIC_ARRAY);
    setCamera(INITIAL_CAMERA);
    setRoom(INITIAL_ROOM);
    setNoise(INITIAL_NOISE);
    setIsSimulating(false);
    setSimulationStep(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Universal Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunPipeline={handleRunPipeline}
        onReset={handleReset}
        isSimulating={isSimulating}
        snrDb={noise.snrDb}
        micCount={micArray.micCount}
      />

      {/* Pipeline Execution HUD Modal / Toast */}
      {isSimulating && simulationStep && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-sky-400 p-4 rounded-xl shadow-2xl max-w-md animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <div>
              <span className="font-bold text-sky-800 block">PIPELINE EXECUTION IN PROGRESS</span>
              <span className="text-slate-600">{simulationStep}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Viewport Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <ResearchOverview onNavigateTab={(tab) => setActiveTab(tab as TabId)} />
        )}

        {activeTab === 'three_d' && (
          <ThreeSpatialRoomSimulator
            speakers={speakers}
            setSpeakers={setSpeakers}
            micArray={micArray}
            setMicArray={setMicArray}
            camera={camera}
            setCamera={setCamera}
            room={room}
            setRoom={setRoom}
            noise={noise}
            setNoise={setNoise}
          />
        )}

        {activeTab === 'environment' && (
          <EnvironmentSimulator
            speakers={speakers}
            setSpeakers={setSpeakers}
            micArray={micArray}
            setMicArray={setMicArray}
            camera={camera}
            setCamera={setCamera}
            room={room}
            setRoom={setRoom}
            noise={noise}
            setNoise={setNoise}
            onOpen3D={() => setActiveTab('three_d')}
          />
        )}

        {activeTab === 'speech_noise' && (
          <RealSpeechNoiseLab
            speakers={speakers}
            noiseType={noise.type}
            setNoiseType={(t) => setNoise((prev) => ({ ...prev, type: t }))}
            snrDb={noise.snrDb}
            setSnrDb={(s) => setNoise((prev) => ({ ...prev, snrDb: s }))}
          />
        )}

        {activeTab === 'audio' && (
          <AudioConfigurationPanel
            micArray={micArray}
            setMicArray={setMicArray}
            noise={noise}
            setNoise={setNoise}
            room={room}
            setRoom={setRoom}
          />
        )}

        {activeTab === 'visual' && (
          <VisualConfigurationPanel
            speakers={speakers}
            setSpeakers={setSpeakers}
            camera={camera}
            setCamera={setCamera}
            onOpen3D={() => setActiveTab('three_d')}
          />
        )}

        {activeTab === 'detection' && (
          <SpeakerDetectionPanel
            speakers={speakers}
            setSpeakers={setSpeakers}
            snrDb={noise.snrDb}
          />
        )}

        {activeTab === 'localization' && (
          <SpatialLocalizationPanel
            speakers={speakers}
            micArray={micArray}
            camera={camera}
            room={room}
            noise={noise}
          />
        )}

        {activeTab === 'separation' && (
          <SpeechSeparationPanel
            speakers={speakers}
            micArray={micArray}
            room={room}
            noise={noise}
          />
        )}

        {activeTab === 'asr' && (
          <ASRAnalysisPanel
            speakers={speakers}
            noise={noise}
            room={room}
          />
        )}

        {activeTab === 'speaker_id' && (
          <SpeakerIdentificationPanel
            speakers={speakers}
            snrDb={noise.snrDb}
          />
        )}

        {activeTab === 'models' && <ModelComparisonPanel />}

        {activeTab === 'ablation' && (
          <AblationStudyPanel
            micCount={micArray.micCount}
            rt60={room.rt60Seconds}
          />
        )}

        {activeTab === 'results' && (
          <ResultsSNRExperimentPanel
            micCount={micArray.micCount}
            rt60={room.rt60Seconds}
            snrDb={noise.snrDb}
            noiseType={noise.type}
            speakerCount={speakers.filter((s) => s.active).length}
          />
        )}

        {activeTab === 'report' && (
          <ResearchReportGenerator
            speakers={speakers}
            micArray={micArray}
            camera={camera}
            room={room}
            noise={noise}
          />
        )}
      </main>

      {/* Institutional Scientific Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-xs font-mono text-slate-500 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">Multimodal Spatial Speech Intelligence Lab</span>
          <span className="text-slate-300">·</span>
          <span>Simulation Model v2026.1</span>
          <span className="text-slate-300">·</span>
          <span>Physics-Grounded Benchmark Engine</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <span>Speed of Sound: 343 m/s</span>
          <span className="text-slate-300">·</span>
          <span>Microphone Geometry: Linear ULA</span>
          <span className="text-slate-300">·</span>
          <span className="text-sky-700 font-medium">Research Prototype — Not a Clinical or Production System</span>
        </div>
      </footer>
    </div>
  );
}
