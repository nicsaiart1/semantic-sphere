import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface SpaceMouseSettings {
  sensitivity: number;
  invertX: boolean;
  invertY: boolean;
  invertZ: boolean;
  invertRX: boolean;
  invertRY: boolean;
  invertRZ: boolean;
  deadZone: number;
  smoothing: number;
}

export interface AudioSettings {
  enabled: boolean;
  masterVolume: number;
  conceptCreatedVolume: number;
  conceptExpandedVolume: number;
  conceptSelectedVolume: number;
  conceptHoveredVolume: number;
  navigationVolume: number;
}

export interface RenderSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  antialiasing: boolean;
  shadows: boolean;
  bloom: boolean;
  particleEffects: boolean;
  maxNodes: number;
  lodDistance: number;
  animationSpeed: number;
}

export interface OpenAISettings {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  conceptsPerExpansion: number;
  cacheTimeout: number;
}

export interface UISettings {
  theme: 'dark' | 'light' | 'auto';
  fontSize: number;
  showFPS: boolean;
  showNodeCount: boolean;
  showConnectionStrength: boolean;
  searchHistorySize: number;
  autoSaveInterval: number;
}

export interface AppSettings {
  spaceMouse: SpaceMouseSettings;
  audio: AudioSettings;
  render: RenderSettings;
  openai: OpenAISettings;
  ui: UISettings;
}

interface SettingsState extends AppSettings {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  resetSettings: () => void;
  updateSpaceMouseSettings: (settings: Partial<SpaceMouseSettings>) => void;
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;
  updateRenderSettings: (settings: Partial<RenderSettings>) => void;
  updateOpenAISettings: (settings: Partial<OpenAISettings>) => void;
  updateUISettings: (settings: Partial<UISettings>) => void;
  validateOpenAIKey: (apiKey: string) => Promise<boolean>;
}

const defaultSettings: AppSettings = {
  spaceMouse: {
    sensitivity: 1.0,
    invertX: false,
    invertY: false,
    invertZ: false,
    invertRX: false,
    invertRY: false,
    invertRZ: false,
    deadZone: 0.1,
    smoothing: 0.8,
  },
  audio: {
    enabled: true,
    masterVolume: 0.7,
    conceptCreatedVolume: 0.8,
    conceptExpandedVolume: 0.6,
    conceptSelectedVolume: 0.5,
    conceptHoveredVolume: 0.3,
    navigationVolume: 0.4,
  },
  render: {
    quality: 'high',
    antialiasing: true,
    shadows: true,
    bloom: true,
    particleEffects: true,
    maxNodes: 1000,
    lodDistance: 50,
    animationSpeed: 1.0,
  },
  openai: {
    apiKey: '',
    model: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7,
    conceptsPerExpansion: 6,
    cacheTimeout: 300000, // 5 minutes
  },
  ui: {
    theme: 'dark',
    fontSize: 14,
    showFPS: false,
    showNodeCount: true,
    showConnectionStrength: true,
    searchHistorySize: 50,
    autoSaveInterval: 300000, // 5 minutes
  },
};

export const useSettingsStore = create<SettingsState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    ...defaultSettings,
    isLoading: false,
    error: null,

    // Load settings from storage
    loadSettings: async () => {
      set({ isLoading: true, error: null });
      
      try {
        if (window.electronAPI) {
          // Load from Electron store
          const storedSettings = await window.electronAPI.store.get('settings');
          
          if (storedSettings) {
            set({
              ...defaultSettings,
              ...storedSettings,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } else {
          // Load from localStorage (fallback)
          const storedSettings = localStorage.getItem('semantic-sphere-settings');
          
          if (storedSettings) {
            const parsedSettings = JSON.parse(storedSettings);
            set({
              ...defaultSettings,
              ...parsedSettings,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load settings',
        });
      }
    },

    // Save settings to storage
    saveSettings: async () => {
      try {
        const { isLoading, error, ...settings } = get();
        
        if (window.electronAPI) {
          // Save to Electron store
          await window.electronAPI.store.set('settings', settings);
        } else {
          // Save to localStorage (fallback)
          localStorage.setItem('semantic-sphere-settings', JSON.stringify(settings));
        }
      } catch (error) {
        console.error('Failed to save settings:', error);
        set({
          error: error instanceof Error ? error.message : 'Failed to save settings',
        });
      }
    },

    // Reset all settings to defaults
    resetSettings: () => {
      set({ ...defaultSettings });
      get().saveSettings();
    },

    // Update SpaceMouse settings
    updateSpaceMouseSettings: (newSettings: Partial<SpaceMouseSettings>) => {
      set((state) => ({
        spaceMouse: { ...state.spaceMouse, ...newSettings },
      }));
      get().saveSettings();
    },

    // Update audio settings
    updateAudioSettings: (newSettings: Partial<AudioSettings>) => {
      set((state) => ({
        audio: { ...state.audio, ...newSettings },
      }));
      get().saveSettings();
    },

    // Update render settings
    updateRenderSettings: (newSettings: Partial<RenderSettings>) => {
      set((state) => ({
        render: { ...state.render, ...newSettings },
      }));
      get().saveSettings();
    },

    // Update OpenAI settings
    updateOpenAISettings: (newSettings: Partial<OpenAISettings>) => {
      set((state) => ({
        openai: { ...state.openai, ...newSettings },
      }));
      get().saveSettings();
    },

    // Update UI settings
    updateUISettings: (newSettings: Partial<UISettings>) => {
      set((state) => ({
        ui: { ...state.ui, ...newSettings },
      }));
      get().saveSettings();
    },

    // Validate OpenAI API key
    validateOpenAIKey: async (apiKey: string): Promise<boolean> => {
      try {
        // This would make a test request to OpenAI API
        // For now, just check if it's not empty and has proper format
        const isValid = apiKey.length > 0 && apiKey.startsWith('sk-');
        
        if (isValid) {
          set((state) => ({
            openai: { ...state.openai, apiKey },
          }));
          await get().saveSettings();
        }
        
        return isValid;
      } catch (error) {
        console.error('API key validation failed:', error);
        return false;
      }
    },
  }))
);