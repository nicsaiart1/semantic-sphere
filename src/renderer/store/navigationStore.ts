import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as THREE from 'three';

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
  fov: number;
}

export interface NavigationState {
  // Camera state
  camera: CameraState;
  defaultCamera: CameraState;
  
  // Navigation history
  history: CameraState[];
  currentHistoryIndex: number;
  
  // Animation state
  isAnimating: boolean;
  animationDuration: number;
  
  // Input state
  isDragging: boolean;
  isSpaceMouseActive: boolean;
  
  // Actions
  setCameraPosition: (position: [number, number, number]) => void;
  setCameraTarget: (target: [number, number, number]) => void;
  setZoom: (zoom: number) => void;
  resetCamera: () => void;
  animateToPosition: (position: [number, number, number], target?: [number, number, number]) => void;
  navigateBack: () => void;
  navigateForward: () => void;
  addToHistory: () => void;
  setDragging: (isDragging: boolean) => void;
  setSpaceMouseActive: (isActive: boolean) => void;
  updateFromThreeCamera: (camera: THREE.Camera) => void;
}

const defaultCameraState: CameraState = {
  position: [0, 0, 10],
  target: [0, 0, 0],
  zoom: 1,
  fov: 75,
};

export const useNavigationStore = create<NavigationState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    camera: { ...defaultCameraState },
    defaultCamera: { ...defaultCameraState },
    history: [],
    currentHistoryIndex: -1,
    isAnimating: false,
    animationDuration: 1000,
    isDragging: false,
    isSpaceMouseActive: false,

    // Set camera position
    setCameraPosition: (position: [number, number, number]) => {
      set((state) => ({
        camera: { ...state.camera, position },
      }));
    },

    // Set camera target
    setCameraTarget: (target: [number, number, number]) => {
      set((state) => ({
        camera: { ...state.camera, target },
      }));
    },

    // Set zoom level
    setZoom: (zoom: number) => {
      set((state) => ({
        camera: { ...state.camera, zoom: Math.max(0.1, Math.min(10, zoom)) },
      }));
    },

    // Reset camera to default position
    resetCamera: () => {
      const { defaultCamera } = get();
      set({
        camera: { ...defaultCamera },
        isAnimating: true,
      });

      // Clear animation flag after duration
      setTimeout(() => {
        set({ isAnimating: false });
      }, get().animationDuration);
    },

    // Animate camera to specific position
    animateToPosition: (position: [number, number, number], target?: [number, number, number]) => {
      const currentCamera = get().camera;
      const newTarget = target || currentCamera.target;
      
      set({
        camera: {
          ...currentCamera,
          position,
          target: newTarget,
        },
        isAnimating: true,
      });

      // Add to history
      get().addToHistory();

      // Clear animation flag after duration
      setTimeout(() => {
        set({ isAnimating: false });
      }, get().animationDuration);
    },

    // Navigate back in history
    navigateBack: () => {
      const { history, currentHistoryIndex } = get();
      
      if (currentHistoryIndex > 0) {
        const previousState = history[currentHistoryIndex - 1];
        set({
          camera: { ...previousState },
          currentHistoryIndex: currentHistoryIndex - 1,
          isAnimating: true,
        });

        setTimeout(() => {
          set({ isAnimating: false });
        }, get().animationDuration);
      }
    },

    // Navigate forward in history
    navigateForward: () => {
      const { history, currentHistoryIndex } = get();
      
      if (currentHistoryIndex < history.length - 1) {
        const nextState = history[currentHistoryIndex + 1];
        set({
          camera: { ...nextState },
          currentHistoryIndex: currentHistoryIndex + 1,
          isAnimating: true,
        });

        setTimeout(() => {
          set({ isAnimating: false });
        }, get().animationDuration);
      }
    },

    // Add current camera state to history
    addToHistory: () => {
      const { camera, history, currentHistoryIndex } = get();
      
      // Remove any forward history
      const newHistory = history.slice(0, currentHistoryIndex + 1);
      newHistory.push({ ...camera });
      
      // Limit history size
      const maxHistorySize = 50;
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }
      
      set({
        history: newHistory,
        currentHistoryIndex: newHistory.length - 1,
      });
    },

    // Set dragging state
    setDragging: (isDragging: boolean) => {
      set({ isDragging });
    },

    // Set SpaceMouse active state
    setSpaceMouseActive: (isActive: boolean) => {
      set({ isSpaceMouseActive: isActive });
    },

    // Update from Three.js camera
    updateFromThreeCamera: (camera: THREE.Camera) => {
      if (camera instanceof THREE.PerspectiveCamera) {
        const position: [number, number, number] = [
          camera.position.x,
          camera.position.y,
          camera.position.z,
        ];
        
        // Calculate target from camera's look direction
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        const target: [number, number, number] = [
          camera.position.x + direction.x * 10,
          camera.position.y + direction.y * 10,
          camera.position.z + direction.z * 10,
        ];

        set((state) => ({
          camera: {
            ...state.camera,
            position,
            target,
            zoom: camera.zoom,
            fov: camera.fov,
          },
        }));
      }
    },
  }))
);