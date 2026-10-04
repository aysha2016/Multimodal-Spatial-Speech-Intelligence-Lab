/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Research Questions, Hypotheses, Presets, and Ground Truth Data
 */

import {
  Speaker,
  MicrophoneArrayConfig,
  CameraConfig,
  RoomAcoustics,
  NoiseSourceConfig,
  ResearchQuestion,
  ResearchHypothesis,
  ModelConfiguration
} from '../types/research';

export const INITIAL_SPEAKERS: Speaker[] = [
  {
    id: 'spk_a',
    name: 'Dr. Elena Vance',
    label: 'Speaker A',
    color: '#10b981', // emerald
    position: { x: -1.4, y: 2.2 }, // ~ -32.5° azimuth, 2.6m distance
    azimuthDeg: -32.5,
    distanceMeters: 2.6,
    active: true,
    speechActivity: 'ACTIVE',
    visualActivity: 'ACTIVE',
    speechConfidence: 96,
    visualConfidence: 94,
    lipActivity: 'Active',
    lipMotionIndex: 0.88,
    faceDetected: true,
    headYawDeg: 12,
    headPitchDeg: -3,
    gazeVectorDeg: 8,
    voiceProfile: {
      f0Hz: 215,
      gender: 'female',
      embeddingSim: 0.94,
    },
    referenceTranscript: 'Please bring the calibration package from room three.',
    transcripts: {
      audioOnly: 'Please bring package from room tree.',
      spatialOnly: 'Please bring the package from room three.',
      audioVisual: 'Please bring the calibration package from room three.',
    },
  },
  {
    id: 'spk_b',
    name: 'Prof. Marcus Chen',
    label: 'Speaker B',
    color: '#818cf8', // indigo
    position: { x: 1.8, y: 2.5 }, // ~ +35.8° azimuth, 3.1m distance
    azimuthDeg: 35.8,
    distanceMeters: 3.1,
    active: true,
    speechActivity: 'ACTIVE',
    visualActivity: 'ACTIVE',
    speechConfidence: 89,
    visualConfidence: 91,
    lipActivity: 'Active',
    lipMotionIndex: 0.76,
    faceDetected: true,
    headYawDeg: -16,
    headPitchDeg: 2,
    gazeVectorDeg: -10,
    voiceProfile: {
      f0Hz: 135,
      gender: 'male',
      embeddingSim: 0.91,
    },
    referenceTranscript: 'Verify that the microphone array spacing is four centimeters.',
    transcripts: {
      audioOnly: 'Verify that mic array face in four center.',
      spatialOnly: 'Verify that microphone array spacing is four centimeters.',
      audioVisual: 'Verify that the microphone array spacing is four centimeters.',
    },
  },
  {
    id: 'spk_c',
    name: 'Dr. Sarah Lin',
    label: 'Speaker C',
    color: '#f59e0b', // amber
    position: { x: -0.2, y: 3.6 }, // near center, 3.6m distance
    azimuthDeg: -3.2,
    distanceMeters: 3.6,
    active: false,
    speechActivity: 'INACTIVE',
    visualActivity: 'INACTIVE',
    speechConfidence: 24,
    visualConfidence: 88,
    lipActivity: 'Inactive',
    lipMotionIndex: 0.05,
    faceDetected: true,
    headYawDeg: 5,
    headPitchDeg: 0,
    gazeVectorDeg: 2,
    voiceProfile: {
      f0Hz: 230,
      gender: 'female',
      embeddingSim: 0.88,
    },
    referenceTranscript: 'Initiate the acoustic beamforming calibration routine.',
    transcripts: {
      audioOnly: 'Initiate acoustic calibration routine.',
      spatialOnly: 'Initiate acoustic beamforming calibration routine.',
      audioVisual: 'Initiate the acoustic beamforming calibration routine.',
    },
  },
  {
    id: 'spk_d',
    name: 'Tech Specialist Roy',
    label: 'Speaker D',
    color: '#ec4899', // pink
    position: { x: 2.5, y: 1.8 },
    azimuthDeg: 54.2,
    distanceMeters: 3.1,
    active: false,
    speechActivity: 'INACTIVE',
    visualActivity: 'INACTIVE',
    speechConfidence: 18,
    visualConfidence: 85,
    lipActivity: 'Inactive',
    lipMotionIndex: 0.02,
    faceDetected: true,
    headYawDeg: -25,
    headPitchDeg: 4,
    gazeVectorDeg: -20,
    voiceProfile: {
      f0Hz: 120,
      gender: 'male',
      embeddingSim: 0.86,
    },
    referenceTranscript: 'Signal-to-noise ratio is adjusted to negative five decibels.',
    transcripts: {
      audioOnly: 'Signal ratio adjusted negative five.',
      spatialOnly: 'Signal to noise ratio adjusted negative five decibels.',
      audioVisual: 'Signal-to-noise ratio is adjusted to negative five decibels.',
    },
  },
];

export const INITIAL_MIC_ARRAY: MicrophoneArrayConfig = {
  micCount: 4,
  geometry: 'linear',
  spacingMeters: 0.04, // 4 cm
  samplingRateHz: 16000,
  position: { x: 0.0, y: 0.4 },
};

export const INITIAL_CAMERA: CameraConfig = {
  position: { x: 0.0, y: 0.2 },
  fovDegrees: 90,
  yawDegrees: 0,
  resolution: '1920x1080 @ 30fps',
  occlusionMode: 'none',
};

export const INITIAL_ROOM: RoomAcoustics = {
  widthMeters: 8.0,
  lengthMeters: 6.0,
  heightMeters: 3.0,
  rt60Seconds: 0.35, // typical office/conference room
  speedOfSound: 343.0,
  ambientTempC: 20.0,
};

export const INITIAL_NOISE: NoiseSourceConfig = {
  type: 'crowd',
  snrDb: 0,
  position: { x: -3.0, y: 3.8 },
};

export const RESEARCH_QUESTIONS: ResearchQuestion[] = [
  {
    id: 'RQ1',
    title: 'Visual Speaker Localization',
    question: 'Can visual information improve speaker localization in complex reverberant environments?',
    hypothesisId: 'H1',
    status: 'Validated',
    findings: 'Visual bounding-box guidance reduces median DOA error from 9.4° (audio-only) to 2.1° (audio+visual fusion) under RT60 = 0.45s.',
    empiricalEvidence: 'Acoustic multipath reflections corrupt phase arrival delays (TDOA), whereas optical line-of-sight remains unaffected by acoustic reverberation.',
  },
  {
    id: 'RQ2',
    title: 'Spatial Speech Separation',
    question: 'Can spatial information improve speech separation in multi-speaker conditions?',
    hypothesisId: 'H2',
    status: 'Validated',
    findings: 'Multi-microphone spatial beamforming provides a +7.3 dB SI-SDR boost over single-channel baseline when angular separation Δθ ≥ 25°.',
    empiricalEvidence: 'Spatial null-steering attenuates competing talkers proportionally to array aperture length M·d.',
  },
  {
    id: 'RQ3',
    title: 'Localization Impact on ASR',
    question: 'Does improved speaker localization improve ASR performance in multi-speaker environments?',
    hypothesisId: 'H3',
    status: 'Supported',
    findings: 'Every 3° reduction in beamformer steering error correlates with an average 4.2% absolute reduction in Word Error Rate (WER).',
    empiricalEvidence: 'Misaligned beamforming clips high-frequency target consonants; tight localization preserves acoustic phonetic energy for transformer decoders.',
  },
  {
    id: 'RQ4',
    title: 'Multimodal Robustness at Low SNR',
    question: 'Does multimodal fusion outperform audio-only processing under adverse noisy conditions (SNR ≤ 0 dB)?',
    hypothesisId: 'H4',
    status: 'Validated',
    findings: 'At SNR = -10 dB, audio-only ASR collapses to 58.4% WER, while Audio+Spatial+Visual maintains 14.2% WER with STOI = 0.88.',
    empiricalEvidence: 'Visual lip optic flow provides noise-immune voice activity gating, preventing background noise from triggering false phonetic insertions.',
  },
  {
    id: 'RQ5',
    title: 'Accuracy vs. Latency Trade-Off',
    question: 'What is the trade-off between accuracy, speech quality and computational latency across model configurations?',
    hypothesisId: 'H5',
    status: 'Strong Trade-Off Observed',
    findings: 'Full multimodal fusion yields lowest WER (3.8%) but incurs 84 ms latency (32 GFLOPs), compared to Audio-Only baseline (14 ms, 3.2 GFLOPs).',
    empiricalEvidence: 'Real-time robotics edge deployment mandates lightweight visual frontends (e.g. MobileNet-V3 lip embedding) to satisfy ≤50ms interactive budgets.',
  },
];

export const RESEARCH_HYPOTHESES: ResearchHypothesis[] = [
  {
    id: 'H1',
    title: 'Acoustic-Visual Localization Synergy',
    statement: 'Audio + visual information will produce lower speaker localization error than audio-only processing.',
    formalCondition: 'Mean |θ_true - θ_fused| < Mean |θ_true - θ_audio| (p < 0.001)',
    validationStatus: 'Supported',
    confidenceInterval: 'Δ_error = -6.8° [95% CI: -7.4°, -6.2°]',
    pValEstimated: 'p < 0.0001',
  },
  {
    id: 'H2',
    title: 'Spatial Beamforming Separation Uplift',
    statement: 'Spatial information will improve speech separation quality in multi-speaker environments.',
    formalCondition: 'SI-SDR(Spatial) > SI-SDR(SingleChannel) for N ≥ 2 speakers',
    validationStatus: 'Supported',
    confidenceInterval: 'Δ_SI-SDR = +7.3 dB [95% CI: +6.6 dB, +8.0 dB]',
    pValEstimated: 'p < 0.0001',
  },
  {
    id: 'H3',
    title: 'Downstream ASR Transmission Efficiency',
    statement: 'Improved localization and separation will reduce ASR Word Error Rate (WER).',
    formalCondition: 'WER(AV-Separated) < WER(Audio-Only) across all SNR regimes',
    validationStatus: 'Supported',
    confidenceInterval: 'Δ_WER = -18.6% [95% CI: -21.2%, -16.0%]',
    pValEstimated: 'p < 0.001',
  },
  {
    id: 'H4',
    title: 'Low-SNR Multimodal Invariance',
    statement: 'Multimodal fusion will be significantly more robust than audio-only processing at low SNR levels.',
    formalCondition: 'd(WER)/d(SNR) is significantly smaller in magnitude for AV than Audio-Only',
    validationStatus: 'Supported',
    confidenceInterval: 'Slope_AV = -0.42 %/dB vs Slope_Audio = -2.85 %/dB',
    pValEstimated: 'p < 0.0001',
  },
  {
    id: 'H5',
    title: 'Model Complexity & Latency Penalty',
    statement: 'Model complexity will improve performance but increase latency and computational cost.',
    formalCondition: 'Latency(AV+Context) > 4 × Latency(AudioOnly), FLOPs > 10 × FLOPs(AudioOnly)',
    validationStatus: 'Supported',
    confidenceInterval: 'Latency ratio = 6.0x [84ms vs 14ms]',
    pValEstimated: 'Empirical Benchmark',
  },
];

export const BENCHMARK_MODELS: ModelConfiguration[] = [
  {
    id: 'model_a',
    code: 'Model A',
    name: 'Audio-Only Baseline',
    description: 'Single-channel acoustic front-end with standard Conformer ASR.',
    modalities: { audio: true, spatial: false, visual: false, context: false },
    metrics: {
      doaError: 14.8,
      siSdr: -2.5,
      stoi: 0.62,
      wer: 28.5,
      speakerAccuracy: 78.5,
      latencyMs: 14,
      gflops: 3.2,
    },
  },
  {
    id: 'model_b',
    code: 'Model B',
    name: 'Audio + Spatial',
    description: 'Multi-channel MVDR beamforming steered by acoustic SRP-PHAT DOA.',
    modalities: { audio: true, spatial: true, visual: false, context: false },
    metrics: {
      doaError: 8.2,
      siSdr: 4.8,
      stoi: 0.76,
      wer: 18.2,
      speakerAccuracy: 86.4,
      latencyMs: 28,
      gflops: 8.5,
    },
  },
  {
    id: 'model_c',
    code: 'Model C',
    name: 'Audio + Visual',
    description: 'Single-channel audio conditioned on visual lip-motion embeddings (AV-TasNet style).',
    modalities: { audio: true, spatial: false, visual: true, context: false },
    metrics: {
      doaError: 5.6,
      siSdr: 7.9,
      stoi: 0.83,
      wer: 12.8,
      speakerAccuracy: 92.5,
      latencyMs: 46,
      gflops: 16.4,
    },
  },
  {
    id: 'model_d',
    code: 'Model D',
    name: 'Audio + Spatial + Visual',
    description: 'AV-SepFormer with visual-guided spatial null-steering beamformer.',
    modalities: { audio: true, spatial: true, visual: true, context: false },
    metrics: {
      doaError: 2.4,
      siSdr: 12.4,
      stoi: 0.91,
      wer: 6.4,
      speakerAccuracy: 97.2,
      latencyMs: 62,
      gflops: 24.8,
    },
  },
  {
    id: 'model_e',
    code: 'Model E',
    name: 'Audio + Spatial + Visual + Context',
    description: 'Unified multimodal spatial pipeline integrated with conversational topic & room state prior.',
    modalities: { audio: true, spatial: true, visual: true, context: true },
    metrics: {
      doaError: 2.1,
      siSdr: 13.1,
      stoi: 0.93,
      wer: 3.8,
      speakerAccuracy: 98.8,
      latencyMs: 84,
      gflops: 32.5,
    },
  },
];
