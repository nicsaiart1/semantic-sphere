import { useSettingsStore } from '../store/settingsStore';

export enum AudioEvent {
  ConceptCreated = 'concept-created',
  ConceptExpanded = 'concept-expanded',
  ConceptSelected = 'concept-selected',
  ConceptHovered = 'concept-hovered',
  NavigationMove = 'navigation-move',
  ConnectionFormed = 'connection-formed',
  SearchResult = 'search-result',
  Error = 'error',
  Success = 'success',
}

interface AudioClip {
  buffer: AudioBuffer | null;
  url: string;
  volume: number;
}

class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private clips: Map<AudioEvent, AudioClip> = new Map();
  private isInitialized = false;
  private masterGain: GainNode | null = null;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      
      // Update master volume from settings
      this.updateMasterVolume();
      
      // Generate audio clips
      await this.generateAudioClips();
      
      this.isInitialized = true;
      console.log('Audio manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio manager:', error);
      throw error;
    }
  }

  private async generateAudioClips(): Promise<void> {
    if (!this.audioContext) return;

    // Generate procedural audio clips using Web Audio API
    const sampleRate = this.audioContext.sampleRate;
    
    // Concept created - ascending harmonic chime
    this.clips.set(AudioEvent.ConceptCreated, {
      buffer: this.generateHarmonicChime(sampleRate, 0.3, [440, 554.37, 659.25]),
      url: '',
      volume: 0.8,
    });

    // Concept expanded - rich chord progression
    this.clips.set(AudioEvent.ConceptExpanded, {
      buffer: this.generateChordProgression(sampleRate, 0.5, [
        [440, 554.37, 659.25], // A major
        [493.88, 622.25, 739.99], // B major
      ]),
      url: '',
      volume: 0.6,
    });

    // Concept selected - single pure tone
    this.clips.set(AudioEvent.ConceptSelected, {
      buffer: this.generatePureTone(sampleRate, 0.2, 880),
      url: '',
      volume: 0.5,
    });

    // Concept hovered - soft whisper tone
    this.clips.set(AudioEvent.ConceptHovered, {
      buffer: this.generateSoftTone(sampleRate, 0.1, 1108.73),
      url: '',
      volume: 0.3,
    });

    // Navigation move - subtle whoosh
    this.clips.set(AudioEvent.NavigationMove, {
      buffer: this.generateWhoosh(sampleRate, 0.2),
      url: '',
      volume: 0.4,
    });

    // Connection formed - connecting beep
    this.clips.set(AudioEvent.ConnectionFormed, {
      buffer: this.generateConnectionTone(sampleRate, 0.25, [220, 440]),
      url: '',
      volume: 0.6,
    });

    // Search result - discovery chime
    this.clips.set(AudioEvent.SearchResult, {
      buffer: this.generateDiscoveryChime(sampleRate, 0.3),
      url: '',
      volume: 0.5,
    });

    // Error - dissonant tone
    this.clips.set(AudioEvent.Error, {
      buffer: this.generateErrorTone(sampleRate, 0.4),
      url: '',
      volume: 0.7,
    });

    // Success - triumphant chord
    this.clips.set(AudioEvent.Success, {
      buffer: this.generateSuccessChord(sampleRate, 0.6),
      url: '',
      volume: 0.8,
    });
  }

  private generateHarmonicChime(sampleRate: number, duration: number, frequencies: number[]): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate;
      let sample = 0;

      frequencies.forEach((freq, index) => {
        const envelope = Math.exp(-time * 3) * (1 - index * 0.2);
        sample += Math.sin(2 * Math.PI * freq * time) * envelope * 0.3;
      });

      data[i] = sample;
    }

    return buffer;
  }

  private generateChordProgression(sampleRate: number, duration: number, chords: number[][]): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    const chordDuration = duration / chords.length;

    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate;
      const chordIndex = Math.floor(time / chordDuration);
      const chordTime = time % chordDuration;
      
      if (chordIndex < chords.length) {
        const chord = chords[chordIndex];
        let sample = 0;

        chord.forEach(freq => {
          const envelope = Math.exp(-chordTime * 2);
          sample += Math.sin(2 * Math.PI * freq * time) * envelope * 0.2;
        });

        data[i] = sample;
      }
    }

    return buffer;
  }

  private generatePureTone(sampleRate: number, duration: number, frequency: number): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate;
      const envelope = Math.exp(-time * 5);
      data[i] = Math.sin(2 * Math.PI * frequency * time) * envelope * 0.3;
    }

    return buffer;
  }

  private generateSoftTone(sampleRate: number, duration: number, frequency: number): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate;
      const envelope = Math.sin(Math.PI * time / duration) * 0.5;
      data[i] = Math.sin(2 * Math.PI * frequency * time) * envelope * 0.2;
    }

    return buffer;
  }

  private generateWhoosh(sampleRate: number, duration: number): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate;
      const frequency = 200 + time * 400; // Sweep from 200Hz to 600Hz
      const envelope = Math.sin(Math.PI * time / duration) * 0.3;
      const noise = (Math.random() - 0.5) * 0.1;
      
      data[i] = (Math.sin(2 * Math.PI * frequency * time) + noise) * envelope;
    }

    return buffer;
  }

  private generateConnectionTone(sampleRate: number, duration: number, frequencies: number[]): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate;
      const progress = time / duration;
      
      // Interpolate between frequencies
      const freq = frequencies[0] + (frequencies[1] - frequencies[0]) * progress;
      const envelope = Math.sin(Math.PI * time / duration) * 0.4;
      
      data[i] = Math.sin(2 * Math.PI * freq * time) * envelope;
    }

    return buffer;
  }

  private generateDiscoveryChime(sampleRate: number, duration: number): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    const frequencies = [523.25, 659.25, 783.99]; // C, E, G

    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate;
      let sample = 0;

      frequencies.forEach((freq, index) => {
        const delay = index * 0.05;
        if (time > delay) {
          const adjustedTime = time - delay;
          const envelope = Math.exp(-adjustedTime * 4);
          sample += Math.sin(2 * Math.PI * freq * adjustedTime) * envelope * 0.25;
        }
      });

      data[i] = sample;
    }

    return buffer;
  }

  private generateErrorTone(sampleRate: number, duration: number): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate;
      const envelope = Math.exp(-time * 2);
      
      // Dissonant frequencies
      const sample1 = Math.sin(2 * Math.PI * 200 * time) * envelope * 0.3;
      const sample2 = Math.sin(2 * Math.PI * 207 * time) * envelope * 0.3; // Slightly off for dissonance
      
      data[i] = sample1 + sample2;
    }

    return buffer;
  }

  private generateSuccessChord(sampleRate: number, duration: number): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    const frequencies = [261.63, 329.63, 392.00, 523.25]; // C major chord

    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate;
      let sample = 0;

      frequencies.forEach(freq => {
        const envelope = Math.exp(-time * 1.5);
        sample += Math.sin(2 * Math.PI * freq * time) * envelope * 0.2;
      });

      data[i] = sample;
    }

    return buffer;
  }

  public playSound(event: AudioEvent): void {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) {
      return;
    }

    const settings = useSettingsStore.getState().audio;
    if (!settings.enabled) {
      return;
    }

    const clip = this.clips.get(event);
    if (!clip || !clip.buffer) {
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = clip.buffer;
      
      // Set volume based on event type and settings
      let volume = clip.volume * settings.masterVolume;
      
      switch (event) {
        case AudioEvent.ConceptCreated:
          volume *= settings.conceptCreatedVolume;
          break;
        case AudioEvent.ConceptExpanded:
          volume *= settings.conceptExpandedVolume;
          break;
        case AudioEvent.ConceptSelected:
          volume *= settings.conceptSelectedVolume;
          break;
        case AudioEvent.ConceptHovered:
          volume *= settings.conceptHoveredVolume;
          break;
        case AudioEvent.NavigationMove:
          volume *= settings.navigationVolume;
          break;
      }
      
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      source.start();
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  }

  // Convenience methods for common events
  public playConceptCreated(): void {
    this.playSound(AudioEvent.ConceptCreated);
  }

  public playConceptExpanded(): void {
    this.playSound(AudioEvent.ConceptExpanded);
  }

  public playConceptSelected(): void {
    this.playSound(AudioEvent.ConceptSelected);
  }

  public playConceptHovered(): void {
    this.playSound(AudioEvent.ConceptHovered);
  }

  public playNavigationMove(): void {
    this.playSound(AudioEvent.NavigationMove);
  }

  public playConnectionFormed(): void {
    this.playSound(AudioEvent.ConnectionFormed);
  }

  public playSearchResult(): void {
    this.playSound(AudioEvent.SearchResult);
  }

  public playError(): void {
    this.playSound(AudioEvent.Error);
  }

  public playSuccess(): void {
    this.playSound(AudioEvent.Success);
  }

  public updateMasterVolume(): void {
    if (this.masterGain) {
      const settings = useSettingsStore.getState().audio;
      this.masterGain.gain.value = settings.masterVolume;
    }
  }

  public setEnabled(enabled: boolean): void {
    if (this.masterGain) {
      this.masterGain.gain.value = enabled ? useSettingsStore.getState().audio.masterVolume : 0;
    }
  }

  public suspend(): void {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }

  public resume(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public isReady(): boolean {
    return this.isInitialized && this.audioContext !== null;
  }
}

export { AudioManager };