/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Types and Interfaces for Experimental Acoustic, Visual, and Spatial Processing
 */

export type MicCount = 2 | 4 | 6 | 8;
export type ArrayGeometry = 'linear' | 'circular';
export type NoiseType = 'white' | 'traffic' | 'machinery' | 'crowd' | 'restaurant' | 'vehicle';
export type SNRLevel = 10 | 5 | 0 | -5 | -10;
export type ProcessingMode = 'audio_only' | 'visual_only' | 'audio_visual';

export interface SpatialCoordinates {
  x: number; // in meters (-4 to +4)
  y: number; // in meters (0 to 6)
  z?: number; // in meters (height, default ~1.6m)
}

export interface Speaker {
  id: string;
  name: string;
  label: string; // "Speaker A", "Speaker B", etc.
  color: string;
  position: SpatialCoordinates;
  azimuthDeg: number; // relative to microphone array normal
  distanceMeters: number;
  active: boolean;
  speechActivity: 'ACTIVE' | 'INACTIVE';
  visualActivity: 'ACTIVE' | 'INACTIVE';
  speechConfidence: number; // 0 - 100%
  visualConfidence: number; // 0 - 100%
  lipActivity: 'Active' | 'Inactive';
  lipMotionIndex: number; // 0.00 to 1.00
  faceDetected: boolean;
  headYawDeg: number; // -90 to +90
  headPitchDeg: number;
  gazeVectorDeg: number; // gaze direction
  voiceProfile: {
    f0Hz: number;
    gender: 'female' | 'male';
    embeddingSim: number;
  };
  referenceTranscript: string;
  transcripts: {
    audioOnly: string;
    spatialOnly: string;
    audioVisual: string;
  };
}

export interface MicrophoneArrayConfig {
  micCount: MicCount;
  geometry: ArrayGeometry;
  spacingMeters: number; // e.g. 0.04m (4cm)
  samplingRateHz: number; // 16000 or 48000
  position: SpatialCoordinates;
}

export interface CameraConfig {
  position: SpatialCoordinates;
  fovDegrees: number;
  yawDegrees: number;
  resolution: string;
  occlusionMode: 'none' | 'hand_covering' | 'head_turned' | 'dim_light';
}

export interface RoomAcoustics {
  widthMeters: number; // 8.0
  lengthMeters: number; // 6.0
  heightMeters: number; // 3.0
  rt60Seconds: number; // 0.15 to 0.95
  speedOfSound: number; // 343 m/s
  ambientTempC: number;
}

export interface NoiseSourceConfig {
  type: NoiseType;
  snrDb: SNRLevel;
  position: SpatialCoordinates;
}

export interface DOAResult {
  speakerId: string;
  trueDOA: number; // degrees (-90 to +90)
  audioDOA: number;
  visualDOA: number;
  fusedDOA: number;
  audioError: number; // |true - audio|
  visualError: number; // |true - visual|
  fusedError: number; // |true - fused|
}

export interface BeamformingSpectrumPoint {
  angle: number; // -90 to +90
  audioPower: number; // 0 to 1
  visualLikelihood: number; // 0 to 1
  fusedPosterior: number; // 0 to 1
}

export interface SpeechSeparationMetrics {
  siSdrDb: number;
  sdrDb: number;
  snrImprovementDb: number;
  stoi: number; // 0.00 to 1.00
  pesq: number; // 1.00 to 4.50
}

export interface ASRMetrics {
  speakerId: string;
  modality: 'audio_only' | 'spatial' | 'audio_visual';
  reference: string;
  hypothesis: string;
  wer: number; // percentage (0 - 100%)
  cer: number; // percentage (0 - 100%)
  confidence: number; // percentage
  substitutions: number;
  deletions: number;
  insertions: number;
  wordCount: number;
}

export interface SpeakerIDMetrics {
  speakerId: string;
  predictedSpeaker: string;
  confidence: number;
  voiceEmbeddingSim: number;
  visualIdentityConf: number;
  fusedIdentityConf: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface SystemPerformanceMetrics {
  inferenceLatencyMs: number;
  processingTimeMs: number;
  realTimeFactor: number;
  modelFlopsG: number;
}

export interface ModelConfiguration {
  id: 'model_a' | 'model_b' | 'model_c' | 'model_d' | 'model_e';
  code: string;
  name: string;
  description: string;
  modalities: {
    audio: boolean;
    spatial: boolean;
    visual: boolean;
    context: boolean;
  };
  metrics: {
    doaError: number;
    siSdr: number;
    stoi: number;
    wer: number;
    speakerAccuracy: number;
    latencyMs: number;
    gflops: number;
  };
}

export interface AblationRow {
  configId: string;
  name: string;
  modalities: string;
  doaError: number;
  siSdr: number;
  stoi: number;
  wer: number;
  speakerAccuracy: number;
  latencyMs: number;
}

export interface ExperimentRecord {
  id: string;
  timestamp: string;
  name: string;
  speakerCount: number;
  snrDb: SNRLevel;
  rt60Seconds: number;
  micCount: MicCount;
  micSpacingM: number;
  noiseType: NoiseType;
  occlusionMode: string;
  results: {
    avgDoaError: number;
    avgSiSdr: number;
    avgStoi: number;
    avgWer: number;
    avgF1: number;
    totalLatencyMs: number;
  };
  source: 'simulated' | 'measured';
}

export interface ResearchQuestion {
  id: 'RQ1' | 'RQ2' | 'RQ3' | 'RQ4' | 'RQ5';
  title: string;
  question: string;
  hypothesisId: 'H1' | 'H2' | 'H3' | 'H4' | 'H5';
  status: 'Validated' | 'Supported' | 'Strong Trade-Off Observed';
  findings: string;
  empiricalEvidence: string;
}

export interface ResearchHypothesis {
  id: 'H1' | 'H2' | 'H3' | 'H4' | 'H5';
  title: string;
  statement: string;
  formalCondition: string;
  validationStatus: 'Supported' | 'Partially Supported' | 'Under Evaluation';
  confidenceInterval: string;
  pValEstimated: string;
}
