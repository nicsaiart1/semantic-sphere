import { useNavigationStore } from '../store/navigationStore';
import { useSettingsStore } from '../store/settingsStore';
import { AudioManager } from '../services/AudioManager';

export interface SpaceMouseMotion {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  timestamp: number;
}

export interface SpaceMouseButton {
  button: number;
  pressed: boolean;
  timestamp: number;
}

class SpaceMouseController {
  private static instance: SpaceMouseController;
  private isInitialized = false;
  private isConnected = false;
  private deviceInfo: any = null;
  private motionBuffer: SpaceMouseMotion[] = [];
  private lastMotion: SpaceMouseMotion | null = null;
  private smoothingBuffer: { [key: string]: number[] } = {
    x: [], y: [], z: [], rx: [], ry: [], rz: []
  };
  private animationFrameId: number | null = null;

  private constructor() {}

  public static getInstance(): SpaceMouseController {
    if (!SpaceMouseController.instance) {
      SpaceMouseController.instance = new SpaceMouseController();
    }
    return SpaceMouseController.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Check if we're in Electron environment
      if (window.electronAPI && window.electronAPI.spaceMouse) {
        await this.initializeElectronSpaceMouse();
      } else {
        // Fallback to web-based SpaceMouse detection
        await this.initializeWebSpaceMouse();
      }

      this.startMotionProcessing();
      this.isInitialized = true;
      
      console.log('SpaceMouse controller initialized successfully');
    } catch (error) {
      console.warn('SpaceMouse initialization failed:', error);
      // Continue without SpaceMouse - not a critical error
    }
  }

  private async initializeElectronSpaceMouse(): Promise<void> {
    const { spaceMouse } = window.electronAPI;
    
    // Check if device is connected
    this.isConnected = await spaceMouse.isConnected();
    
    if (this.isConnected) {
      this.deviceInfo = await spaceMouse.getDeviceInfo();
      console.log('SpaceMouse device detected:', this.deviceInfo);
      
      // Set up motion listener
      spaceMouse.onMotion((motion: SpaceMouseMotion) => {
        this.handleMotion(motion);
      });
      
      // Set up button listener
      spaceMouse.onButton((button: SpaceMouseButton) => {
        this.handleButton(button);
      });
    }
  }

  private async initializeWebSpaceMouse(): Promise<void> {
    // Check for Web HID API support (for future SpaceMouse web integration)
    if ('hid' in navigator) {
      try {
        // This is a placeholder for future Web HID SpaceMouse support
        // Currently, 3DConnexion devices require native drivers
        console.log('Web HID API available, but SpaceMouse web support not implemented');
      } catch (error) {
        console.log('Web HID not available or permission denied');
      }
    }
    
    // For now, we'll simulate SpaceMouse with keyboard controls
    this.setupKeyboardFallback();
  }

  private setupKeyboardFallback(): void {
    // Map keyboard keys to SpaceMouse-like controls
    const keyState: { [key: string]: boolean } = {};
    
    const handleKeyDown = (event: KeyboardEvent) => {
      keyState[event.code] = true;
      this.processKeyboardInput(keyState);
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      keyState[event.code] = false;
      this.processKeyboardInput(keyState);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }

  private processKeyboardInput(keyState: { [key: string]: boolean }): void {
    const settings = useSettingsStore.getState().spaceMouse;
    const sensitivity = settings.sensitivity * 0.1;
    
    let x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0;
    
    // Translation controls (WASD + QE)
    if (keyState['KeyA']) x -= sensitivity;
    if (keyState['KeyD']) x += sensitivity;
    if (keyState['KeyW']) z -= sensitivity;
    if (keyState['KeyS']) z += sensitivity;
    if (keyState['KeyQ']) y += sensitivity;
    if (keyState['KeyE']) y -= sensitivity;
    
    // Rotation controls (Arrow keys + Shift/Ctrl)
    if (keyState['ArrowLeft']) ry -= sensitivity;
    if (keyState['ArrowRight']) ry += sensitivity;
    if (keyState['ArrowUp']) rx -= sensitivity;
    if (keyState['ArrowDown']) rx += sensitivity;
    if (keyState['ShiftLeft'] || keyState['ShiftRight']) rz -= sensitivity;
    if (keyState['ControlLeft'] || keyState['ControlRight']) rz += sensitivity;
    
    // Only send motion if there's actual input
    if (x !== 0 || y !== 0 || z !== 0 || rx !== 0 || ry !== 0 || rz !== 0) {
      const motion: SpaceMouseMotion = {
        x, y, z, rx, ry, rz,
        timestamp: Date.now()
      };
      
      this.handleMotion(motion);
    }
  }

  private handleMotion(motion: SpaceMouseMotion): void {
    const settings = useSettingsStore.getState().spaceMouse;
    
    // Apply dead zone
    const processedMotion = this.applyDeadZone(motion, settings.deadZone);
    
    // Apply inversion settings
    if (settings.invertX) processedMotion.x *= -1;
    if (settings.invertY) processedMotion.y *= -1;
    if (settings.invertZ) processedMotion.z *= -1;
    if (settings.invertRX) processedMotion.rx *= -1;
    if (settings.invertRY) processedMotion.ry *= -1;
    if (settings.invertRZ) processedMotion.rz *= -1;
    
    // Apply sensitivity
    processedMotion.x *= settings.sensitivity;
    processedMotion.y *= settings.sensitivity;
    processedMotion.z *= settings.sensitivity;
    processedMotion.rx *= settings.sensitivity;
    processedMotion.ry *= settings.sensitivity;
    processedMotion.rz *= settings.sensitivity;
    
    // Add to motion buffer for smoothing
    this.motionBuffer.push(processedMotion);
    
    // Limit buffer size
    if (this.motionBuffer.length > 10) {
      this.motionBuffer.shift();
    }
    
    this.lastMotion = processedMotion;
    
    // Update navigation store
    useNavigationStore.getState().setSpaceMouseActive(true);
    
    // Play navigation sound
    if (this.hasSignificantMotion(processedMotion)) {
      AudioManager.getInstance().playNavigationMove();
    }
  }

  private handleButton(button: SpaceMouseButton): void {
    console.log('SpaceMouse button event:', button);
    
    // Handle button actions
    switch (button.button) {
      case 0: // Main button - usually for selection
        if (button.pressed) {
          // Trigger concept selection or exploration
          const selectedConcept = useSemanticStore.getState().selectedConcept;
          if (selectedConcept) {
            useSemanticStore.getState().expandConcept(selectedConcept.id);
          }
        }
        break;
        
      case 1: // Secondary button - usually for reset
        if (button.pressed) {
          useNavigationStore.getState().resetCamera();
        }
        break;
        
      default:
        // Handle other buttons as needed
        break;
    }
  }

  private applyDeadZone(motion: SpaceMouseMotion, deadZone: number): SpaceMouseMotion {
    const applyDeadZoneToValue = (value: number): number => {
      const absValue = Math.abs(value);
      if (absValue < deadZone) return 0;
      
      // Scale the remaining range
      const sign = Math.sign(value);
      const scaledValue = (absValue - deadZone) / (1 - deadZone);
      return sign * scaledValue;
    };
    
    return {
      x: applyDeadZoneToValue(motion.x),
      y: applyDeadZoneToValue(motion.y),
      z: applyDeadZoneToValue(motion.z),
      rx: applyDeadZoneToValue(motion.rx),
      ry: applyDeadZoneToValue(motion.ry),
      rz: applyDeadZoneToValue(motion.rz),
      timestamp: motion.timestamp,
    };
  }

  private hasSignificantMotion(motion: SpaceMouseMotion): boolean {
    const threshold = 0.01;
    return Math.abs(motion.x) > threshold ||
           Math.abs(motion.y) > threshold ||
           Math.abs(motion.z) > threshold ||
           Math.abs(motion.rx) > threshold ||
           Math.abs(motion.ry) > threshold ||
           Math.abs(motion.rz) > threshold;
  }

  private startMotionProcessing(): void {
    const processMotion = () => {
      if (this.motionBuffer.length > 0) {
        const settings = useSettingsStore.getState().spaceMouse;
        const smoothedMotion = this.applySmoothingFilter(settings.smoothing);
        
        if (smoothedMotion) {
          this.applyMotionToCamera(smoothedMotion);
        }
      }
      
      this.animationFrameId = requestAnimationFrame(processMotion);
    };
    
    processMotion();
  }

  private applySmoothingFilter(smoothingFactor: number): SpaceMouseMotion | null {
    if (this.motionBuffer.length === 0) return null;
    
    const latest = this.motionBuffer[this.motionBuffer.length - 1];
    
    // Add to smoothing buffers
    Object.keys(this.smoothingBuffer).forEach(axis => {
      const value = latest[axis as keyof SpaceMouseMotion] as number;
      this.smoothingBuffer[axis].push(value);
      
      // Limit buffer size
      if (this.smoothingBuffer[axis].length > 5) {
        this.smoothingBuffer[axis].shift();
      }
    });
    
    // Calculate smoothed values
    const smoothed: SpaceMouseMotion = {
      x: this.calculateSmoothedValue('x', smoothingFactor),
      y: this.calculateSmoothedValue('y', smoothingFactor),
      z: this.calculateSmoothedValue('z', smoothingFactor),
      rx: this.calculateSmoothedValue('rx', smoothingFactor),
      ry: this.calculateSmoothedValue('ry', smoothingFactor),
      rz: this.calculateSmoothedValue('rz', smoothingFactor),
      timestamp: latest.timestamp,
    };
    
    return smoothed;
  }

  private calculateSmoothedValue(axis: string, smoothingFactor: number): number {
    const buffer = this.smoothingBuffer[axis];
    if (buffer.length === 0) return 0;
    
    if (smoothingFactor === 0) {
      return buffer[buffer.length - 1];
    }
    
    // Exponential moving average
    let smoothed = buffer[0];
    for (let i = 1; i < buffer.length; i++) {
      smoothed = smoothingFactor * smoothed + (1 - smoothingFactor) * buffer[i];
    }
    
    return smoothed;
  }

  private applyMotionToCamera(motion: SpaceMouseMotion): void {
    const navigationStore = useNavigationStore.getState();
    const currentCamera = navigationStore.camera;
    
    // Calculate new camera position and target
    const deltaTime = 0.016; // Assume 60fps
    const translationSpeed = 5.0;
    const rotationSpeed = 1.0;
    
    // Apply translation
    const newPosition: [number, number, number] = [
      currentCamera.position[0] + motion.x * translationSpeed * deltaTime,
      currentCamera.position[1] + motion.y * translationSpeed * deltaTime,
      currentCamera.position[2] + motion.z * translationSpeed * deltaTime,
    ];
    
    // Apply rotation (simplified - in a real implementation, this would be more complex)
    const newTarget: [number, number, number] = [
      currentCamera.target[0] + motion.rx * rotationSpeed * deltaTime,
      currentCamera.target[1] + motion.ry * rotationSpeed * deltaTime,
      currentCamera.target[2] + motion.rz * rotationSpeed * deltaTime,
    ];
    
    // Update navigation store
    navigationStore.setCameraPosition(newPosition);
    navigationStore.setCameraTarget(newTarget);
  }

  public getMotionData(): SpaceMouseMotion | null {
    return this.lastMotion;
  }

  public isDeviceConnected(): boolean {
    return this.isConnected;
  }

  public getDeviceInfo(): any {
    return this.deviceInfo;
  }

  public cleanup(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    if (window.electronAPI && window.electronAPI.spaceMouse) {
      window.electronAPI.spaceMouse.removeAllListeners();
    }
    
    this.motionBuffer = [];
    this.smoothingBuffer = { x: [], y: [], z: [], rx: [], ry: [], rz: [] };
    this.lastMotion = null;
  }

  public isReady(): boolean {
    return this.isInitialized;
  }
}

export { SpaceMouseController };