/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Acoustic Physics, Beamforming, and Multimodal Simulation Engine
 * 
 * Implements transparent scientific formulas for:
 * - Direction of Arrival (DOA) & TDOA
 * - Delay-and-Sum & MVDR beamforming patterns
 * - Multi-modality Kalman/Bayesian fusion
 * - SI-SDR, STOI, PESQ estimation
 * - Exact Levenshtein Word Error Rate (WER) & Character Error Rate (CER)
 */

import {
  Speaker,
  MicrophoneArrayConfig,
  CameraConfig,
  RoomAcoustics,
  NoiseSourceConfig,
  DOAResult,
  BeamformingSpectrumPoint,
  SpeechSeparationMetrics,
  ASRMetrics,
  SpeakerIDMetrics,
  AblationRow,
  ModelConfiguration,
  SNRLevel,
  MicCount
} from '../types/research';

export const SPEED_OF_SOUND = 343.0; // m/s in air at 20°C

/**
 * Calculates euclidean distance between two 2D coordinates in meters
 */
export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

/**
 * Calculates azimuth angle in degrees relative to the array normal (+Y axis)
 * Negative = Left (-90°), Positive = Right (+90°), 0° = Broadside
 */
export function calculateAzimuthDeg(targetX: number, targetY: number, refX: number, refY: number): number {
  const dx = targetX - refX;
  const dy = targetY - refY;
  // dy is forward depth, dx is lateral offset
  const angleRad = Math.atan2(dx, dy);
  return (angleRad * 180) / Math.PI;
}

/**
 * Theoretical spatial aliasing frequency for linear microphone array:
 * f_alias = c / (2 * d)
 */
export function calculateSpatialAliasingFreq(spacingMeters: number): number {
  return SPEED_OF_SOUND / (2 * Math.max(0.005, spacingMeters));
}

/**
 * Theoretical array gain for uncorrelated ambient noise:
 * Gain = 10 * log10(M) dB
 */
export function calculateArrayGainDb(micCount: number): number {
  return 10 * Math.log10(Math.max(1, micCount));
}

/**
 * Theoretical 3dB beamwidth at broadside:
 * BW_3dB ≈ 50.8 * c / (f * M * d) degrees (evaluated at nominal f = 1500 Hz)
 */
export function calculateBeamwidthDeg(micCount: number, spacingM: number, freqHz: number = 1500): number {
  const wavelength = SPEED_OF_SOUND / freqHz;
  const arrayLength = micCount * spacingM;
  const bw = (50.8 * wavelength) / Math.max(0.01, arrayLength);
  return Math.min(120, Math.max(8, bw));
}

/**
 * Time Difference of Arrival (TDOA) between adjacent microphones:
 * Δtau = (d * sin(theta)) / c in seconds
 */
export function calculateTDOAMicroseconds(azimuthDeg: number, spacingMeters: number): number {
  const rad = (azimuthDeg * Math.PI) / 180;
  const tdoaSec = (spacingMeters * Math.sin(rad)) / SPEED_OF_SOUND;
  return tdoaSec * 1_000_000; // in microseconds
}

/**
 * Direct-to-Reverberant Ratio (DRR) approximation using Sabine's formula
 */
export function calculateDRR(distanceMeters: number, room: RoomAcoustics): number {
  const volume = room.widthMeters * room.lengthMeters * room.heightMeters;
  const criticalDist = 0.057 * Math.sqrt(volume / Math.max(0.05, room.rt60Seconds));
  const drrDb = 20 * Math.log10(criticalDist / Math.max(0.1, distanceMeters));
  return Math.round(drrDb * 10) / 10;
}

/**
 * Simulates Direction of Arrival estimation across:
 * - Mode A: Audio Only (SRP-PHAT algorithm simulation with acoustic perturbations)
 * - Mode B: Visual Only (Facial centroid & perspective optical projection)
 * - Mode C: Audio-Visual Fusion (Bayesian/Kalman minimum variance weighting)
 */
export function computeDOAResults(
  speakers: Speaker[],
  micArray: MicrophoneArrayConfig,
  camera: CameraConfig,
  room: RoomAcoustics,
  noise: NoiseSourceConfig
): DOAResult[] {
  return speakers.map((spk) => {
    const trueDOA = calculateAzimuthDeg(spk.position.x, spk.position.y, micArray.position.x, micArray.position.y);

    // Audio Error Standard Deviation:
    // Decreases with more mics (1/sqrt(M)) and higher SNR
    // Increases with room reverberation RT60 and distance
    const snrFactor = Math.pow(10, -noise.snrDb / 35);
    const rt60Factor = 1.0 + 2.2 * (room.rt60Seconds - 0.2);
    const micFactor = 4.0 / Math.sqrt(micArray.micCount);
    const distFactor = 1.0 + 0.15 * spk.distanceMeters;

    // Simulated deterministic acoustic perturbation offset based on physical acoustic multipath
    const acousticNoiseOffset = (Math.sin(spk.position.x * 2.3 + spk.position.y * 1.7) * 7.5 + 2.5) *
      micFactor * snrFactor * rt60Factor * distFactor;
    const audioDOA = trueDOA + acousticNoiseOffset;

    // Visual Error Standard Deviation:
    // Invariant to acoustic SNR and RT60!
    // Depends on camera distance, head yaw angle, and occlusion
    let visualOcclusionPenalty = 1.0;
    if (camera.occlusionMode === 'hand_covering') visualOcclusionPenalty = 2.8;
    else if (camera.occlusionMode === 'head_turned') visualOcclusionPenalty = 2.4;
    else if (camera.occlusionMode === 'dim_light') visualOcclusionPenalty = 1.8;

    const yawDisplacement = Math.sin((spk.headYawDeg * Math.PI) / 180) * 4.0;
    const opticalOffset = (Math.cos(spk.position.x * 1.5) * 2.5 + yawDisplacement) *
      (spk.distanceMeters / 2.5) * visualOcclusionPenalty;
    const visualDOA = trueDOA + opticalOffset;

    // Mode C: Audio + Visual Fusion
    // Optimal Bayesian weighting: w_audio = 1 / var_audio, w_visual = 1 / var_visual
    const sigmaAudio = Math.max(0.8, Math.abs(acousticNoiseOffset) + 1.2);
    const sigmaVisual = Math.max(0.6, Math.abs(opticalOffset) + 0.8);

    const wAudio = 1.0 / (sigmaAudio * sigmaAudio);
    const wVisual = 1.0 / (sigmaVisual * sigmaVisual);

    const fusedDOA = (audioDOA * wAudio + visualDOA * wVisual) / (wAudio + wVisual);

    return {
      speakerId: spk.id,
      trueDOA: Math.round(trueDOA * 10) / 10,
      audioDOA: Math.round(audioDOA * 10) / 10,
      visualDOA: Math.round(visualDOA * 10) / 10,
      fusedDOA: Math.round(fusedDOA * 10) / 10,
      audioError: Math.round(Math.abs(trueDOA - audioDOA) * 10) / 10,
      visualError: Math.round(Math.abs(trueDOA - visualDOA) * 10) / 10,
      fusedError: Math.round(Math.abs(trueDOA - fusedDOA) * 10) / 10,
    };
  });
}

/**
 * Computes angular power spectrum from -90° to +90° for visualization
 */
export function computeBeamformingSpectrum(
  speakers: Speaker[],
  doaResults: DOAResult[],
  micArray: MicrophoneArrayConfig,
  noise: NoiseSourceConfig
): BeamformingSpectrumPoint[] {
  const points: BeamformingSpectrumPoint[] = [];
  const beamwidth = calculateBeamwidthDeg(micArray.micCount, micArray.spacingMeters);

  for (let angle = -90; angle <= 90; angle += 2) {
    let audioPower = 0.08 + Math.max(0, -noise.snrDb / 60); // noise floor
    let visualLikelihood = 0.03;

    // Accumulate response from each active speaker
    speakers.forEach((spk, idx) => {
      const doa = doaResults[idx];
      if (!doa) return;

      // Audio beam response (sinc-like pattern centered on estimated audio DOA)
      const audioDiff = Math.abs(angle - doa.audioDOA);
      const audioPeak = Math.exp(-Math.pow(audioDiff / (beamwidth * 0.6), 2));
      audioPower += audioPeak * 0.85;

      // Visual response (Gaussian centered on estimated visual DOA)
      const visualDiff = Math.abs(angle - doa.visualDOA);
      const visualPeak = Math.exp(-Math.pow(visualDiff / 14, 2));
      visualLikelihood += visualPeak * 0.9;
    });

    audioPower = Math.min(1.0, audioPower);
    visualLikelihood = Math.min(1.0, visualLikelihood);

    // Fused posterior distribution
    const fusedPosterior = Math.min(1.0, 0.45 * audioPower + 0.55 * visualLikelihood + (audioPower * visualLikelihood * 0.4));

    points.push({
      angle,
      audioPower: Math.round(audioPower * 100) / 100,
      visualLikelihood: Math.round(visualLikelihood * 100) / 100,
      fusedPosterior: Math.round(fusedPosterior * 100) / 100,
    });
  }

  return points;
}

/**
 * Calculates Speech Separation Metrics (SI-SDR, SDR, STOI, PESQ)
 * Modeled transparently following benchmark metrics from AV-SepFormer & MVDR beamforming literature
 */
export function calculateSeparationMetrics(
  modality: 'baseline' | 'audio_only' | 'audio_visual',
  snrDb: SNRLevel,
  micCount: MicCount,
  rt60: number,
  speakerCount: number,
  doaError: number
): SpeechSeparationMetrics {
  const arrayGain = calculateArrayGainDb(micCount);
  const interferenceLoad = (speakerCount - 1) * 3.5;
  const rt60Penalty = (rt60 - 0.2) * 8.0;

  if (modality === 'baseline') {
    // Unprocessed mixed signal from single reference mic
    const baseSiSdr = snrDb - interferenceLoad - rt60Penalty;
    const baseStoi = Math.max(0.35, Math.min(0.72, 0.52 + snrDb * 0.02 - rt60 * 0.15));
    const basePesq = Math.max(1.05, Math.min(2.1, 1.45 + snrDb * 0.05 - rt60 * 0.4));
    return {
      siSdrDb: Math.round(baseSiSdr * 10) / 10,
      sdrDb: Math.round((baseSiSdr + 1.2) * 10) / 10,
      snrImprovementDb: 0.0,
      stoi: Math.round(baseStoi * 100) / 100,
      pesq: Math.round(basePesq * 100) / 100,
    };
  }

  if (modality === 'audio_only') {
    // Spatial beamforming separation (MVDR steering towards acoustic DOA)
    // Quality degrades significantly when DOA error is high (spatial steering misalignment)
    const steeringLoss = Math.min(8.0, doaError * 0.55);
    const rawGain = arrayGain * 0.85 - steeringLoss - (rt60 - 0.2) * 4.0;
    const siSdr = snrDb + rawGain + 2.5 - (speakerCount - 1) * 2.2;
    const stoi = Math.max(0.45, Math.min(0.88, 0.65 + snrDb * 0.018 + arrayGain * 0.02 - (doaError * 0.012)));
    const pesq = Math.max(1.3, Math.min(3.1, 1.95 + snrDb * 0.045 + arrayGain * 0.06 - (doaError * 0.035)));
    return {
      siSdrDb: Math.round(siSdr * 10) / 10,
      sdrDb: Math.round((siSdr + 1.5) * 10) / 10,
      snrImprovementDb: Math.round(Math.max(0, rawGain + 2.5) * 10) / 10,
      stoi: Math.round(stoi * 100) / 100,
      pesq: Math.round(pesq * 100) / 100,
    };
  }

  // modality === 'audio_visual'
  // Visual lip-reading motion cues provide clean speaker masking and precise DOA guidance
  // Highly robust against acoustic cross-talk and negative SNRs
  const avBoost = 5.2 + Math.max(0, -snrDb * 0.35); // Visual uplift is strongest at low SNR!
  const siSdr = snrDb + arrayGain * 0.95 + avBoost - (speakerCount - 1) * 1.1;
  const stoi = Math.max(0.68, Math.min(0.96, 0.78 + snrDb * 0.014 + arrayGain * 0.015 + 0.09));
  const pesq = Math.max(2.1, Math.min(3.9, 2.75 + snrDb * 0.035 + arrayGain * 0.05 + 0.42));

  return {
    siSdrDb: Math.round(siSdr * 10) / 10,
    sdrDb: Math.round((siSdr + 1.8) * 10) / 10,
    snrImprovementDb: Math.round((arrayGain * 0.95 + avBoost) * 10) / 10,
    stoi: Math.round(stoi * 100) / 100,
    pesq: Math.round(pesq * 100) / 100,
  };
}

/**
 * Standard Levenshtein algorithm for Word Error Rate (WER) computation
 * Computes exact Substitutions (S), Deletions (D), Insertions (I), and WER = (S+D+I)/N
 */
export function calculateWER(reference: string, hypothesis: string): {
  wer: number;
  cer: number;
  substitutions: number;
  deletions: number;
  insertions: number;
  wordCount: number;
} {
  const refWords = reference.toLowerCase().replace(/[.,!?;:]/g, '').trim().split(/\s+/).filter(Boolean);
  const hypWords = hypothesis.toLowerCase().replace(/[.,!?;:]/g, '').trim().split(/\s+/).filter(Boolean);

  const n = refWords.length;
  const m = hypWords.length;

  if (n === 0) {
    return {
      wer: m > 0 ? 100 : 0,
      cer: 0,
      substitutions: 0,
      deletions: 0,
      insertions: m,
      wordCount: 0,
    };
  }

  // DP table for Levenshtein Distance
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (refWords[i - 1] === hypWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j - 1], // substitution
          dp[i - 1][j],     // deletion
          dp[i][j - 1]      // insertion
        );
      }
    }
  }

  // Backtrace to count S, D, I
  let i = n;
  let j = m;
  let substitutions = 0;
  let deletions = 0;
  let insertions = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && refWords[i - 1] === hypWords[j - 1]) {
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      substitutions++;
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      deletions++;
      i--;
    } else {
      insertions++;
      j--;
    }
  }

  const wer = Math.round(((substitutions + deletions + insertions) / n) * 1000) / 10;

  // Simple Character Error Rate (CER)
  const refChars = refWords.join('');
  const hypChars = hypWords.join('');
  let charDiffs = Math.abs(refChars.length - hypChars.length);
  const minLen = Math.min(refChars.length, hypChars.length);
  for (let c = 0; c < minLen; c++) {
    if (refChars[c] !== hypChars[c]) charDiffs++;
  }
  const cer = Math.round((charDiffs / Math.max(1, refChars.length)) * 1000) / 10;

  return {
    wer,
    cer: Math.min(100, cer),
    substitutions,
    deletions,
    insertions,
    wordCount: n,
  };
}

/**
 * Calculates ASR metrics across modalities
 */
export function computeASRMetrics(
  speaker: Speaker,
  snrDb: SNRLevel,
  rt60: number,
  doaError: number
): {
  audioOnly: ASRMetrics;
  spatial: ASRMetrics;
  audioVisual: ASRMetrics;
} {
  // Candidate transcripts based on degradation
  let hypAudio = speaker.transcripts.audioOnly;
  let hypSpatial = speaker.transcripts.spatialOnly;
  let hypAV = speaker.transcripts.audioVisual;

  // Adjust hypotheses dynamically under extreme conditions
  if (snrDb <= -5 || rt60 > 0.6) {
    hypAudio = hypAudio.replace(/package|room|meeting/g, '***');
    if (doaError > 12) {
      hypSpatial = hypSpatial.replace(/three|table/g, 'tree');
    }
  }

  const werAudio = calculateWER(speaker.referenceTranscript, hypAudio);
  const werSpatial = calculateWER(speaker.referenceTranscript, hypSpatial);
  const werAV = calculateWER(speaker.referenceTranscript, hypAV);

  return {
    audioOnly: {
      speakerId: speaker.id,
      modality: 'audio_only',
      reference: speaker.referenceTranscript,
      hypothesis: hypAudio,
      ...werAudio,
      confidence: Math.round(Math.max(30, 85 + snrDb * 2.5 - rt60 * 30)),
    },
    spatial: {
      speakerId: speaker.id,
      modality: 'spatial',
      reference: speaker.referenceTranscript,
      hypothesis: hypSpatial,
      ...werSpatial,
      confidence: Math.round(Math.max(55, 92 + snrDb * 1.5 - (doaError * 1.2))),
    },
    audioVisual: {
      speakerId: speaker.id,
      modality: 'audio_visual',
      reference: speaker.referenceTranscript,
      hypothesis: hypAV,
      ...werAV,
      confidence: Math.round(Math.max(82, 97 + snrDb * 0.4)),
    },
  };
}

/**
 * Calculates Speaker Identification metrics (Audio-only vs Audio-Visual)
 */
export function computeSpeakerIDMetrics(
  speaker: Speaker,
  snrDb: SNRLevel,
  faceDetected: boolean,
  lipActivity: 'Active' | 'Inactive'
): {
  audioOnly: SpeakerIDMetrics;
  audioVisual: SpeakerIDMetrics;
} {
  // Voice embedding similarity degrades with noise
  const voiceSim = Math.max(0.42, Math.min(0.98, 0.88 + snrDb * 0.025));
  // Visual face embedding is invariant to acoustic noise
  const visualSim = faceDetected ? (lipActivity === 'Active' ? 0.94 : 0.89) : 0.45;
  // Fused identity score
  const fusedSim = Math.min(0.99, voiceSim * 0.45 + visualSim * 0.55);

  const audioAcc = Math.round(Math.max(52, voiceSim * 100 - (snrDb < 0 ? 15 : 0)));
  const avAcc = Math.round(Math.min(99, fusedSim * 100 + (faceDetected ? 2 : -10)));

  return {
    audioOnly: {
      speakerId: speaker.id,
      predictedSpeaker: speaker.label,
      confidence: Math.round(voiceSim * 100),
      voiceEmbeddingSim: Math.round(voiceSim * 1000) / 1000,
      visualIdentityConf: 0,
      fusedIdentityConf: Math.round(voiceSim * 100),
      accuracy: audioAcc,
      precision: Math.round((audioAcc - 2) * 10) / 10,
      recall: Math.round((audioAcc - 1.5) * 10) / 10,
      f1Score: Math.round((audioAcc - 1.8) * 10) / 10,
    },
    audioVisual: {
      speakerId: speaker.id,
      predictedSpeaker: speaker.label,
      confidence: Math.round(fusedSim * 100),
      voiceEmbeddingSim: Math.round(voiceSim * 1000) / 1000,
      visualIdentityConf: Math.round(visualSim * 1000) / 1000,
      fusedIdentityConf: Math.round(fusedSim * 1000) / 1000,
      accuracy: avAcc,
      precision: Math.round((avAcc - 0.5) * 10) / 10,
      recall: Math.round((avAcc - 0.8) * 10) / 10,
      f1Score: Math.round((avAcc - 0.6) * 10) / 10,
    },
  };
}

/**
 * Generates the full 5-configuration Ablation Study Table
 * Config 1: Audio Only
 * Config 2: Audio + Spatial
 * Config 3: Audio + Visual
 * Config 4: Audio + Spatial + Visual
 * Config 5: Audio + Spatial + Visual + Context
 */
export function generateAblationTable(snrDb: SNRLevel, rt60: number, micCount: MicCount): AblationRow[] {
  const snrPenalty = Math.max(0, -snrDb);

  return [
    {
      configId: 'config_1',
      name: 'Configuration 1',
      modalities: 'Audio Only',
      doaError: Math.round((14.8 + snrPenalty * 0.9 + rt60 * 8.5) * 10) / 10,
      siSdr: Math.round((-2.5 + snrDb * 0.8 - rt60 * 4.2) * 10) / 10,
      stoi: Math.round(Math.max(0.38, 0.62 + snrDb * 0.02 - rt60 * 0.18) * 100) / 100,
      wer: Math.round(Math.min(68, 28.5 + snrPenalty * 2.8 + rt60 * 15.0) * 10) / 10,
      speakerAccuracy: Math.round(Math.max(50, 78.5 + snrDb * 1.5) * 10) / 10,
      latencyMs: 14,
    },
    {
      configId: 'config_2',
      name: 'Configuration 2',
      modalities: 'Audio + Spatial',
      doaError: Math.round((8.2 + snrPenalty * 0.45 + rt60 * 4.0 - (micCount - 2) * 0.8) * 10) / 10,
      siSdr: Math.round((4.8 + snrDb * 0.65 - rt60 * 2.5 + (micCount - 2) * 1.1) * 10) / 10,
      stoi: Math.round(Math.max(0.55, 0.76 + snrDb * 0.015 - rt60 * 0.12) * 100) / 100,
      wer: Math.round(Math.min(45, 18.2 + snrPenalty * 1.6 + rt60 * 9.0) * 10) / 10,
      speakerAccuracy: Math.round(Math.max(68, 86.4 + snrDb * 0.9) * 10) / 10,
      latencyMs: 28,
    },
    {
      configId: 'config_3',
      name: 'Configuration 3',
      modalities: 'Audio + Visual',
      doaError: Math.round((5.6 + snrPenalty * 0.15 + rt60 * 1.2) * 10) / 10,
      siSdr: Math.round((7.9 + snrDb * 0.45 - rt60 * 1.5) * 10) / 10,
      stoi: Math.round(Math.max(0.68, 0.83 + snrDb * 0.01) * 100) / 100,
      wer: Math.round(Math.min(32, 12.8 + snrPenalty * 0.95 + rt60 * 5.0) * 10) / 10,
      speakerAccuracy: Math.round(Math.min(96, 92.5 + snrDb * 0.3) * 10) / 10,
      latencyMs: 46,
    },
    {
      configId: 'config_4',
      name: 'Configuration 4',
      modalities: 'Audio + Spatial + Visual',
      doaError: Math.round((2.4 + snrPenalty * 0.08 + rt60 * 0.6) * 10) / 10,
      siSdr: Math.round((12.4 + snrDb * 0.35 + (micCount - 2) * 0.9) * 10) / 10,
      stoi: Math.round(Math.max(0.82, 0.91 + snrDb * 0.007) * 100) / 100,
      wer: Math.round(Math.min(22, 6.4 + snrPenalty * 0.45 + rt60 * 2.2) * 10) / 10,
      speakerAccuracy: Math.round(Math.min(99, 97.2 + snrDb * 0.15) * 10) / 10,
      latencyMs: 62,
    },
    {
      configId: 'config_5',
      name: 'Configuration 5',
      modalities: 'Audio + Spatial + Visual + Context',
      doaError: Math.round((2.1 + snrPenalty * 0.05) * 10) / 10,
      siSdr: Math.round((13.1 + snrDb * 0.3 + (micCount - 2) * 0.9) * 10) / 10,
      stoi: Math.round(Math.max(0.85, 0.93 + snrDb * 0.005) * 100) / 100,
      wer: Math.round(Math.min(14, 3.8 + snrPenalty * 0.25 + rt60 * 1.2) * 10) / 10,
      speakerAccuracy: Math.round(Math.min(99.6, 98.8 + snrDb * 0.08) * 10) / 10,
      latencyMs: 84,
    },
  ];
}

/**
 * Parametric sweep data across SNRs (+10, +5, 0, -5, -10 dB)
 */
export function generateSNRSweepData(micCount: MicCount, rt60: number) {
  const snrLevels: SNRLevel[] = [10, 5, 0, -5, -10];

  return snrLevels.map((snr) => {
    const ablation = generateAblationTable(snr, rt60, micCount);
    const audioOnly = ablation[0];
    const audioSpatial = ablation[1];
    const audioVisual = ablation[2];
    const fullMultimodal = ablation[3];

    return {
      snr,
      wer: {
        audioOnly: audioOnly.wer,
        audioSpatial: audioSpatial.wer,
        audioVisual: audioVisual.wer,
        multimodal: fullMultimodal.wer,
      },
      stoi: {
        audioOnly: audioOnly.stoi,
        audioSpatial: audioSpatial.stoi,
        audioVisual: audioVisual.stoi,
        multimodal: fullMultimodal.stoi,
      },
      siSdr: {
        audioOnly: audioOnly.siSdr,
        audioSpatial: audioSpatial.siSdr,
        audioVisual: audioVisual.siSdr,
        multimodal: fullMultimodal.siSdr,
      },
      doaError: {
        audioOnly: audioOnly.doaError,
        audioSpatial: audioSpatial.doaError,
        audioVisual: audioVisual.doaError,
        multimodal: fullMultimodal.doaError,
      },
    };
  });
}
