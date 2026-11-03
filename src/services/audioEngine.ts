import { EqualizerState } from '../types/media';
import { logger } from './logger';

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQ_PRESETS: Record<string, { name: string; bands: number[]; preamp: number; bassBoost: number; treble: number }> = {
  flat: {
    name: 'Flat',
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    preamp: 0,
    bassBoost: 0,
    treble: 0,
  },
  rock: {
    name: 'Rock',
    bands: [4.5, 3.5, 1.5, -0.5, -1.5, 1.0, 3.0, 4.0, 4.5, 5.0],
    preamp: -1.5,
    bassBoost: 3,
    treble: 2,
  },
  pop: {
    name: 'Pop',
    bands: [-1.5, 1.0, 3.0, 3.5, 2.0, -0.5, -1.0, -1.0, 1.5, 2.5],
    preamp: 0,
    bassBoost: 2,
    treble: 1,
  },
  jazz: {
    name: 'Jazz',
    bands: [3.5, 2.5, 0.5, 1.5, -1.5, -1.5, 0, 1.5, 3.0, 3.5],
    preamp: 0,
    bassBoost: 1,
    treble: 2,
  },
  classical: {
    name: 'Classical',
    bands: [4.0, 3.0, 2.0, 1.5, -1.0, -1.0, 0, 2.0, 3.0, 3.5],
    preamp: 0,
    bassBoost: 1,
    treble: 2,
  },
  electronic: {
    name: 'Electronic',
    bands: [5.0, 4.5, 2.0, 0, -2.0, 1.5, 1.0, 2.0, 4.0, 4.5],
    preamp: -1.0,
    bassBoost: 4,
    treble: 3,
  },
  bass_boost: {
    name: 'Bass Boost',
    bands: [6.0, 5.5, 4.0, 2.0, 0.5, 0, 0, 0, 0, 0],
    preamp: -2.0,
    bassBoost: 6,
    treble: 0,
  },
  vocal: {
    name: 'Vocal',
    bands: [-2.0, -1.0, 0, 2.5, 4.5, 4.0, 3.0, 1.5, 0, -1.5],
    preamp: 0,
    bassBoost: 0,
    treble: 1,
  },
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;
  private currentElement: HTMLMediaElement | null = null;

  // Nodes
  private preampNode: GainNode | null = null;
  private bassBoostNode: BiquadFilterNode | null = null;
  private trebleNode: BiquadFilterNode | null = null;
  private bandFilters: BiquadFilterNode[] = [];
  public analyserNode: AnalyserNode | null = null;

  // Procedural synth node for rich demo playback
  private synthGainNode: GainNode | null = null;
  private synthInterval: number | null = null;
  private isSynthPlaying: boolean = false;

  private connected: boolean = false;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      logger.info('AUDIO', `Web Audio Context initialized @ ${this.ctx.sampleRate} Hz`);

      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.82;

      // Create preamp
      this.preampNode = this.ctx.createGain();

      // Create Bass Boost (lowshelf @ 80Hz)
      this.bassBoostNode = this.ctx.createBiquadFilter();
      this.bassBoostNode.type = 'lowshelf';
      this.bassBoostNode.frequency.value = 80;
      this.bassBoostNode.gain.value = 0;

      // Create Treble (highshelf @ 10kHz)
      this.trebleNode = this.ctx.createBiquadFilter();
      this.trebleNode.type = 'highshelf';
      this.trebleNode.frequency.value = 10000;
      this.trebleNode.gain.value = 0;

      // Create 10 EQ Bands
      this.bandFilters = EQ_FREQUENCIES.map((freq) => {
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.4; // 1-octave bandwidth
        filter.gain.value = 0;
        return filter;
      });

      // Chain: Preamp -> BassBoost -> Bands[0..9] -> Treble -> Analyser -> Destination
      let prevNode: AudioNode = this.preampNode;
      prevNode.connect(this.bassBoostNode);
      prevNode = this.bassBoostNode;

      for (const filter of this.bandFilters) {
        prevNode.connect(filter);
        prevNode = filter;
      }

      prevNode.connect(this.trebleNode);
      this.trebleNode.connect(this.analyserNode);
      this.analyserNode.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public connectMediaElement(element: HTMLMediaElement) {
    this.init();
    if (!this.ctx || !this.preampNode) return;

    if (this.currentElement === element && this.connected) {
      return;
    }

    try {
      this.currentElement = element;
      if (!this.mediaSourceNode) {
        this.mediaSourceNode = this.ctx.createMediaElementSource(element);
        this.mediaSourceNode.connect(this.preampNode);
        this.connected = true;
        logger.info('AUDIO', 'HTML5 Media Element successfully linked to 10-Band Equalizer & Visualizer');
      }
    } catch (err) {
      // Element may already be linked
      logger.debug('AUDIO', 'Media element already bound or handled by audio pipeline: ' + String(err));
    }
  }

  public applyEqualizer(eq: EqualizerState) {
    if (!this.ctx || !this.preampNode) return;

    if (!eq.enabled) {
      // Bypass: zero out all gains
      this.preampNode.gain.setTargetAtTime(1.0, this.ctx.currentTime, 0.05);
      if (this.bassBoostNode) this.bassBoostNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      if (this.trebleNode) this.trebleNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      this.bandFilters.forEach((f) => {
        f.gain.setTargetAtTime(0, this.ctx!.currentTime, 0.05);
      });
      return;
    }

    // Apply preamp gain (dB to linear)
    const preampLinear = Math.pow(10, eq.preamp / 20);
    this.preampNode.gain.setTargetAtTime(preampLinear, this.ctx.currentTime, 0.05);

    // Apply bass boost
    if (this.bassBoostNode) {
      this.bassBoostNode.gain.setTargetAtTime(eq.bassBoost, this.ctx.currentTime, 0.05);
    }

    // Apply treble
    if (this.trebleNode) {
      this.trebleNode.gain.setTargetAtTime(eq.treble, this.ctx.currentTime, 0.05);
    }

    // Apply 10 bands
    this.bandFilters.forEach((filter, idx) => {
      const gainVal = eq.bands[idx] ?? 0;
      filter.gain.setTargetAtTime(gainVal, this.ctx!.currentTime, 0.05);
    });
  }

  /**
   * Procedural Audio Synthesizer:
   * Generates lush ambient violet chords and basslines so demo playback has real audio,
   * without needing external CDN mp3s that might fail in sandboxes.
   */
  public startProceduralSynth(volume: number = 0.6) {
    this.init();
    if (!this.ctx || !this.preampNode || this.isSynthPlaying) return;

    this.isSynthPlaying = true;
    if (!this.synthGainNode) {
      this.synthGainNode = this.ctx.createGain();
      this.synthGainNode.connect(this.preampNode);
    }

    this.synthGainNode.gain.setValueAtTime(volume * 0.35, this.ctx.currentTime);

    // Minor pentatonic progression in C# / E / G# (Violet moody vibe)
    const chords = [
      [138.59, 164.81, 207.65, 277.18], // C#m7
      [110.00, 164.81, 220.00, 261.63], // Aadd9
      [146.83, 185.00, 220.00, 293.66], // Dmaj7
      [123.47, 164.81, 196.00, 246.94], // Bsus4
    ];

    let chordIdx = 0;

    const playNextChord = () => {
      if (!this.ctx || !this.isSynthPlaying || !this.synthGainNode) return;
      const now = this.ctx.currentTime;
      const freqs = chords[chordIdx % chords.length];
      chordIdx++;

      freqs.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();

        // Warm triangle and sine waves
        osc.type = i === 0 ? 'sine' : i === 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Soft attack, warm decay
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.08, now + 0.6);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

        osc.connect(noteGain);
        noteGain.connect(this.synthGainNode!);

        osc.start(now);
        osc.stop(now + 4.0);
      });
    };

    playNextChord();
    this.synthInterval = window.setInterval(playNextChord, 3800);
    logger.info('AUDIO', 'Procedural lo-fi synthesizer active');
  }

  public stopProceduralSynth() {
    this.isSynthPlaying = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  public setSynthVolume(vol: number) {
    if (this.synthGainNode && this.ctx) {
      this.synthGainNode.gain.setTargetAtTime(vol * 0.35, this.ctx.currentTime, 0.05);
    }
  }

  public async setAudioOutputDevice(element: HTMLMediaElement, deviceId: string) {
    if ('setSinkId' in element) {
      try {
        await (element as unknown as { setSinkId: (id: string) => Promise<void> }).setSinkId(deviceId);
        logger.info('AUDIO', `Audio output device routed to ${deviceId}`);
        return true;
      } catch (err) {
        logger.warn('AUDIO', `Failed to set audio output device: ${String(err)}`);
        return false;
      }
    }
    return false;
  }
}

export const audioEngine = new AudioEngine();
