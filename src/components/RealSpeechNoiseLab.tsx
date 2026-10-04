/**
 * Multimodal Spatial Speech Intelligence Research Lab
 * Real Human Speech & Acoustic Noise Studio (White Laboratory Theme)
 * 
 * Features:
 * 1. Audition Real Human Speech across speakers (Female & Male voices)
 * 2. Audition 6 Calibrated Acoustic Noise Profiles (Crowd babble, Traffic, Machinery, Restaurant, Vehicle, White)
 * 3. Live Microphone Input: Stream your real human voice with real-time VAD & noise injection test
 */

import React, { useState, useEffect, useRef } from 'react';
import { Speaker, NoiseType, SNRLevel } from '../types/research';
import { audioSynthesizer, drawWaveform } from '../utils/audioSynthesizer';
import {
  Mic,
  Volume2,
  Play,
  Square,
  Radio,
  Sliders,
  Sparkles,
  Users,
  Activity,
  CheckCircle2,
  AlertCircle,
  Headphones
} from 'lucide-react';

interface RealSpeechNoiseLabProps {
  speakers: Speaker[];
  noiseType: NoiseType;
  setNoiseType: (t: NoiseType) => void;
  snrDb: SNRLevel;
  setSnrDb: (s: SNRLevel) => void;
}

export const RealSpeechNoiseLab: React.FC<RealSpeechNoiseLabProps> = ({
  speakers,
  noiseType,
  setNoiseType,
  snrDb,
  setSnrDb,
}) => {
  const [playingItem, setPlayingItem] = useState<string | null>(null);
  const [isLiveMicActive, setIsLiveMicActive] = useState<boolean>(false);
  const [liveMicError, setLiveMicError] = useState<string | null>(null);
  const [liveRms, setLiveRms] = useState<number>(0);
  const [liveVad, setLiveVad] = useState<boolean>(false);

  const liveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stop playback on unmount
  useEffect(() => {
    return () => {
      audioSynthesizer.stop();
      audioSynthesizer.stopLiveMicrophone();
    };
  }, []);

  // Update live waveform animation
  useEffect(() => {
    let animId: number;
    const renderLive = () => {
      if (liveCanvasRef.current && isLiveMicActive) {
        drawWaveform(
          liveCanvasRef.current,
          'live_mic',
          snrDb,
          0,
          audioSynthesizer.getLiveAnalyser()
        );
      }
      animId = requestAnimationFrame(renderLive);
    };
    if (isLiveMicActive) {
      renderLive();
    }
    return () => cancelAnimationFrame(animId);
  }, [isLiveMicActive, snrDb]);

  // Play individual speaker speech
  const handlePlaySpeaker = async (spk: Speaker) => {
    if (playingItem === spk.id) {
      audioSynthesizer.stop();
      setPlayingItem(null);
      return;
    }

    setPlayingItem(spk.id);
    const voiceName = spk.voiceProfile.gender === 'female' ? 'Kore' : 'Fenrir';
    await audioSynthesizer.playSoloSpeaker(
      spk.referenceTranscript,
      voiceName,
      spk.voiceProfile.f0Hz,
      () => setPlayingItem(null)
    );
  };

  // Play individual noise profile
  const handlePlayNoise = (type: NoiseType) => {
    if (playingItem === `noise_${type}`) {
      audioSynthesizer.stop();
      setPlayingItem(null);
      return;
    }

    setPlayingItem(`noise_${type}`);
    audioSynthesizer.playSoloNoise(type, snrDb, () => setPlayingItem(null));
  };

  // Toggle Live Real Microphone
  const handleToggleLiveMic = async () => {
    if (isLiveMicActive) {
      audioSynthesizer.stopLiveMicrophone();
      setIsLiveMicActive(false);
      setLiveRms(0);
      setLiveVad(false);
    } else {
      setLiveMicError(null);
      const success = await audioSynthesizer.startLiveMicrophone((rms, vad) => {
        setLiveRms(rms);
        setLiveVad(vad);
      });
      if (success) {
        setIsLiveMicActive(true);
      } else {
        setLiveMicError('Could not access microphone. Please allow microphone permissions in your browser.');
      }
    }
  };

  const noiseProfiles: { type: NoiseType; label: string; desc: string; band: string }[] = [
    {
      type: 'crowd',
      label: 'Multi-Speaker Crowd Babble',
      desc: 'Overlapping asynchronous speech formants (cocktail party). Strongest acoustic interference for ASR.',
      band: '300 Hz – 4.5 kHz',
    },
    {
      type: 'white',
      label: 'Gaussian White Noise',
      desc: 'Uniform power spectral density across all frequencies. Standard mathematical baseline for beamforming.',
      band: '0 Hz – 12 kHz',
    },
    {
      type: 'restaurant',
      label: 'Restaurant Clatter & Chatter',
      desc: 'Transient acoustic clicks from ceramic/cutlery collisions mixed with diffuse room reverberation.',
      band: '200 Hz – 6.5 kHz',
    },
    {
      type: 'traffic',
      label: 'Urban Traffic & Vehicles',
      desc: 'High acoustic energy concentrated below 500 Hz (combustion rumble, heavy trucks, tire friction).',
      band: '50 Hz – 1.2 kHz',
    },
    {
      type: 'machinery',
      label: 'Industrial Machinery Drone',
      desc: 'Mechanical line hum at 60 Hz, 120 Hz, 240 Hz plus high-frequency cooling fan whir.',
      band: '60 Hz – 3.2 kHz',
    },
    {
      type: 'vehicle',
      label: 'Vehicle In-Cabin Drone',
      desc: 'Sub-bass chassis resonance (35 Hz) coupled with aerodynamic wind turbulence over windshield.',
      band: '35 Hz – 2.0 kHz',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-sky-600" />
            Real Human Speech & Acoustic Noise Studio
          </h2>
          <p className="text-xs text-slate-500">
            Audition real human speech clips, calibrated acoustic noise profiles, or test with your own real voice live via microphone.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">Audio Engine:</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
            Real Speech & Noise Active
          </span>
        </div>
      </div>

      {/* Grid: Real Human Speech (Left) & Real Acoustic Noise (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Real Human Speech Library */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Real Human Speech Library (Female & Male Speakers)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">4 Reference Utterances</span>
          </div>

          <div className="space-y-3">
            {speakers.map((spk) => {
              const isPlayingThis = playingItem === spk.id;
              return (
                <div
                  key={spk.id}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 transition-colors hover:border-slate-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: spk.color }} />
                      <span className="font-mono font-bold text-xs text-slate-900">{spk.label}</span>
                      <span className="text-xs text-slate-500">({spk.name})</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                      <span className="text-purple-700 font-bold">
                        F0: {spk.voiceProfile.f0Hz} Hz ({spk.voiceProfile.gender})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-mono text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed italic shadow-2xs">
                    "{spk.referenceTranscript}"
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono text-slate-500">
                      Voice: {spk.voiceProfile.gender === 'female' ? 'Kore (Female)' : 'Fenrir (Male)'}
                    </span>

                    <button
                      onClick={() => handlePlaySpeaker(spk)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        isPlayingThis
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs'
                      }`}
                    >
                      {isPlayingThis ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Play Real Voice</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: Real Acoustic Noise Studio */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Acoustic Noise Generator Studio
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-500">Current SNR:</span>
              <span className="text-amber-700 font-bold">{snrDb > 0 ? `+${snrDb}` : snrDb} dB</span>
            </div>
          </div>

          {/* SNR Quick Switcher */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold">Calibrated Signal-to-Noise Ratio (SNR)</span>
              <span className="font-mono text-amber-700 font-bold">{snrDb > 0 ? `+${snrDb}` : snrDb} dB</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {([10, 5, 0, -5, -10] as SNRLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setSnrDb(level)}
                  className={`py-1 text-xs font-mono rounded-lg cursor-pointer transition-colors ${
                    snrDb === level
                      ? 'bg-amber-500 text-white font-bold shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                  }`}
                >
                  {level > 0 ? `+${level}` : level} dB
                </button>
              ))}
            </div>
          </div>

          {/* Noise Profiles List */}
          <div className="space-y-2.5">
            {noiseProfiles.map((np) => {
              const isSelected = noiseType === np.type;
              const isPlayingThis = playingItem === `noise_${np.type}`;

              return (
                <div
                  key={np.type}
                  onClick={() => setNoiseType(np.type)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-amber-50/50 border-amber-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-amber-500' : 'bg-slate-400'}`} />
                      <span className={`font-semibold ${isSelected ? 'text-amber-900 font-bold' : 'text-slate-800'}`}>
                        {np.label}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayNoise(np.type);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        isPlayingThis
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                      }`}
                    >
                      {isPlayingThis ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>Stop Noise</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Audition Solo</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-snug">
                    {np.desc}
                  </p>

                  <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-0.5 border-t border-slate-100">
                    <span>Acoustic Frequency Band: {np.band}</span>
                    {isSelected && <span className="text-amber-700 font-bold">Active In Lab Simulation</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Section 3: Live Real Human Microphone Testing with Noise Injection */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-sky-600" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Live Microphone Mode (Test with Your Own Voice)
              </h3>
              <p className="text-xs text-slate-500">
                Speak into your device's physical microphone. View your live speech waveform and evaluate real-time Voice Activity Detection (VAD).
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleLiveMic}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
              isLiveMicActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-sky-600 hover:bg-sky-700 text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{isLiveMicActive ? 'Stop Live Microphone' : 'Enable Real Microphone'}</span>
          </button>
        </div>

        {liveMicError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{liveMicError}</span>
          </div>
        )}

        {/* Live Audio Visualizer Stage */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Waveform Canvas (8 cols) */}
          <div className="md:col-span-8 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isLiveMicActive ? 'bg-sky-500 animate-pulse' : 'bg-slate-400'}`} />
                Live Real-Time Microphone Oscilloscope
              </span>
              <span className="text-slate-500">
                {isLiveMicActive ? 'Streaming 48 kHz / 16-bit' : 'Microphone Inactive'}
              </span>
            </div>

            <div className="h-28 w-full bg-white rounded-lg border border-slate-200 overflow-hidden shadow-inner">
              <canvas ref={liveCanvasRef} width={720} height={112} className="w-full h-full" />
            </div>
          </div>

          {/* Live Telemetry Meters (4 cols) */}
          <div className="md:col-span-4 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-600 font-medium">Live Acoustic VAD:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] border ${
                  liveVad
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-200 text-slate-600 border-slate-300'
                }`}
              >
                {liveVad ? 'VOICE ACTIVE' : 'SILENT'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Microphone Energy (RMS):</span>
                <span className="text-sky-700 font-bold">{liveRms.toFixed(3)}</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                <div
                  className="bg-sky-600 h-full rounded-full transition-all duration-75"
                  style={{ width: `${Math.min(100, liveRms * 350)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 leading-snug">
              Speak into your microphone to verify that acoustic energy crosses the detection threshold (0.035 RMS).
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
