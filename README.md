# SemanticSphere

> Real-time 3D semantic concept mapping with 3DConnexion SpaceMouse integration and OpenAI-powered dynamic knowledge graphs

![SemanticSphere Logo](https://img.shields.io/badge/SemanticSphere-v1.0.0-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iIzY0YjVmNiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjYiIHN0cm9rZT0iIzY0YjVmNiIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMyIgZmlsbD0iIzY0YjVmNiIvPgo8L3N2Zz4K)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-191970?logo=Electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-black?logo=three.js&logoColor=white)](https://threejs.org/)

## 🌟 Overview

SemanticSphere transforms the way you explore and understand complex knowledge domains through an immersive 3D interface. Navigate through dynamically generated concept networks using intuitive 3DConnexion SpaceMouse controls, discover new connections with AI-powered expansion, and experience knowledge like never before.

### ✨ Key Features

- **🎮 Intuitive 3D Navigation**: Full 6DOF control with 3DConnexion SpaceMouse support
- **🤖 AI-Powered Concept Generation**: Dynamic knowledge expansion using OpenAI GPT models
- **🔍 Intelligent Search**: Semantic search with real-time concept discovery
- **🎵 Audio Feedback**: Immersive two-tone harmonic feedback system
- **💾 Persistent Spaces**: Save and load your knowledge landscapes
- **⚡ Real-time Performance**: Optimized rendering with LOD and culling
- **🎨 Beautiful UI**: Ultra-minimalist futurist design with glass morphism

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **OpenAI API Key** (for concept generation)
- **3DConnexion SpaceMouse** (optional, keyboard fallback available)

### Installation

```bash
# Clone the repository
git clone https://github.com/nicsaiart1/semantic-sphere.git
cd semantic-sphere

# Install dependencies
npm install

# Start development server
npm run dev
```

### First Launch

1. **Configure OpenAI**: Open Settings (Ctrl/Cmd+,) and add your OpenAI API key
2. **Create Your First Concept**: Use the search bar to create your starting concept
3. **Explore**: Click Space or use SpaceMouse to expand concepts and build your knowledge graph

## 🎯 Usage Guide

### Navigation Controls

| Input Method | Action | Control |
|--------------|--------|---------|
| **SpaceMouse** | 6DOF Navigation | Move/rotate device |
| **Mouse** | Orbit Camera | Click + drag |
| **Keyboard** | Translate | WASD + QE |
| **Keyboard** | Rotate | Arrow keys |
| **Scroll** | Zoom | Mouse wheel |

### Concept Management

- **Create**: Type in search bar and press Enter
- **Expand**: Select concept and press Space
- **Navigate**: Click concepts or use search results
- **Explore**: Follow connection lines between related concepts

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + F` | Focus search |
| `Space` | Expand selected concept |
| `Ctrl/Cmd + R` | Reset camera |
| `Ctrl/Cmd + S` | Save semantic space |
| `Ctrl/Cmd + ,` | Open settings |
| `Escape` | Deselect/close dialogs |

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 18 + TypeScript + Three.js
- **Desktop**: Electron 25+ with secure IPC
- **State Management**: Zustand with persistence
- **UI Framework**: Material-UI with custom theming
- **3D Rendering**: Three.js + React Three Fiber
- **AI Integration**: OpenAI GPT-3.5/4 API
- **Audio**: Web Audio API with procedural generation

### Project Structure

```
src/
├── main/                 # Electron main process
│   ├── main.ts          # Application entry point
│   ├── preload.ts       # Secure IPC bridge
│   └── tsconfig.json    # Main process TypeScript config
├── renderer/             # React frontend
│   ├── components/      # UI components
│   │   ├── Scene3D.tsx  # Main 3D scene
│   │   ├── ConceptNode.tsx
│   │   ├── SearchInterface.tsx
│   │   └── ...
│   ├── services/        # Core services
│   │   ├── OpenAIService.ts
│   │   └── AudioManager.ts
│   ├── store/          # State management
│   │   ├── semanticStore.ts
│   │   ├── navigationStore.ts
│   │   └── settingsStore.ts
│   ├── navigation/     # Input handling
│   │   └── SpaceMouseController.ts
│   └── styles/         # Global styles
└── shared/             # Shared types and utilities
```

## ⚙️ Configuration

### OpenAI Settings

```typescript
// Configure in Settings dialog or programmatically
const openaiConfig = {
  apiKey: 'sk-...', // Your OpenAI API key
  model: 'gpt-3.5-turbo', // or 'gpt-4'
  temperature: 0.7, // Creativity level (0-1)
  conceptsPerExpansion: 6, // Number of related concepts
  maxTokens: 1000 // Response length limit
};
```

### SpaceMouse Configuration

```typescript
const spaceMouseConfig = {
  sensitivity: 1.0, // Overall sensitivity
  deadZone: 0.1, // Ignore small movements
  smoothing: 0.8, // Motion smoothing (0-1)
  invertX: false, // Invert X-axis
  // ... other axis inversions
};
```

### Rendering Options

```typescript
const renderConfig = {
  quality: 'high', // 'low' | 'medium' | 'high' | 'ultra'
  antialiasing: true,
  shadows: true,
  bloom: true, // Post-processing bloom effect
  particleEffects: true,
  maxNodes: 1000, // Performance limit
  lodDistance: 50 // Level-of-detail distance
};
```

## 🔧 Development

### Build Commands

```bash
# Development
npm run dev              # Start dev server
npm run dev:main         # Build main process (watch)
npm run dev:renderer     # Start renderer dev server

# Production Build
npm run build            # Build all
npm run build:main       # Build main process
npm run build:renderer   # Build renderer

# Distribution
npm run dist             # Create distributables
npm run build:windows    # Windows installer
npm run build:macos      # macOS DMG
npm run build:linux      # Linux AppImage

# Development Tools
npm run lint             # ESLint check
npm run lint:fix         # Fix linting issues
npm test                 # Run tests
```

### Adding New Concept Categories

```typescript
// In ConceptNode.tsx
const categoryColors = {
  science: '#4fc3f7',
  technology: '#81c784',
  philosophy: '#ba68c8',
  // Add your category here
  mycategory: '#ff6b6b'
};
```

### Custom Audio Events

```typescript
// In AudioManager.ts
export enum AudioEvent {
  ConceptCreated = 'concept-created',
  // Add custom events
  CustomEvent = 'custom-event'
}

// Generate custom audio
private generateCustomTone(sampleRate: number, duration: number): AudioBuffer {
  // Your audio generation logic
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with conventional commits: `git commit -m 'feat: add amazing feature'`
5. Push to your fork: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Write meaningful commit messages
- Add JSDoc comments for public APIs
- Include tests for new features

## 📊 Performance

### Optimization Features

- **Level of Detail (LOD)**: Distant nodes use simplified geometry
- **Frustum Culling**: Off-screen objects aren't rendered
- **Instanced Rendering**: Efficient rendering of similar objects
- **Smart Caching**: API responses cached for 5 minutes
- **Background Processing**: Non-blocking concept generation

### Performance Targets

- **Frame Rate**: 60 FPS on modern hardware
- **Startup Time**: < 2 seconds
- **Memory Usage**: < 100MB baseline
- **API Response**: < 500ms integration time

## 🔒 Security & Privacy

### Data Handling

- **API Keys**: Stored securely in OS keychain (Electron)
- **No Telemetry**: No usage data collected
- **Local Storage**: All semantic spaces stored locally
- **Secure IPC**: Context isolation between main and renderer

### API Key Security

```typescript
// ❌ Never do this
const apiKey = 'sk-hardcoded-key';

// ✅ Proper secure storage
const apiKey = await electronAPI.store.get('openaiApiKey');
```

## 🐛 Troubleshooting

### Common Issues

**SpaceMouse not detected**
- Ensure 3DConnexion drivers are installed
- Check device connection in System Preferences/Device Manager
- Restart application after connecting device

**OpenAI API errors**
- Verify API key is valid and has credits
- Check internet connection
- Try different model (GPT-3.5 vs GPT-4)

**Performance issues**
- Lower render quality in Settings
- Reduce max nodes limit
- Disable particle effects and bloom
- Close other GPU-intensive applications

**Audio not working**
- Check system audio settings
- Enable audio in SemanticSphere settings
- Try refreshing the application

### Debug Mode

```bash
# Enable debug logging
DEBUG=semantic-sphere:* npm run dev

# Open DevTools in production
Ctrl/Cmd + Shift + I
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **3DConnexion** for SpaceMouse SDK and inspiration
- **OpenAI** for powerful language models
- **Three.js Community** for excellent 3D web framework
- **Electron Team** for cross-platform desktop capabilities
- **React Three Fiber** for seamless React/Three.js integration

## 🔗 Links

- [Documentation](https://github.com/nicsaiart1/semantic-sphere/wiki)
- [Issue Tracker](https://github.com/nicsaiart1/semantic-sphere/issues)
- [Discussions](https://github.com/nicsaiart1/semantic-sphere/discussions)
- [Releases](https://github.com/nicsaiart1/semantic-sphere/releases)

---

<p align="center">
  <strong>Built with ❤️ for exploring the infinite landscape of human knowledge</strong>
</p>

<p align="center">
  <a href="https://github.com/nicsaiart1/semantic-sphere/stargazers">⭐ Star this project</a> |
  <a href="https://github.com/nicsaiart1/semantic-sphere/issues/new">🐛 Report Bug</a> |
  <a href="https://github.com/nicsaiart1/semantic-sphere/issues/new">💡 Request Feature</a>
</p>