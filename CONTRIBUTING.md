# Contributing to SemanticSphere

We love your input! We want to make contributing to SemanticSphere as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Local Development

```bash
# Clone your fork
git clone https://github.com/yourusername/semantic-sphere.git
cd semantic-sphere

# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, start the Electron app
npm start
```

### Project Structure

```
src/
├── main/                 # Electron main process
├── renderer/             # React frontend
│   ├── components/       # UI components
│   ├── services/         # Core services
│   ├── store/           # State management
│   └── navigation/      # Input handling
└── shared/              # Shared utilities
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Prefer interfaces over types for object shapes
- Use strict mode settings
- Add JSDoc comments for public APIs

```typescript
/**
 * Represents a concept node in the semantic space
 */
export interface ConceptNode {
  id: string;
  label: string;
  // ...
}
```

### React Components

- Use functional components with hooks
- Prefer named exports
- Use proper TypeScript props interfaces
- Follow the component structure:

```typescript
import React from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  // Component logic
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Naming Conventions

- **Files**: PascalCase for components, camelCase for utilities
- **Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces**: PascalCase with descriptive names

### ESLint Rules

We use ESLint with TypeScript support. Run linting with:

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Examples

```
feat(spacemouse): add sensitivity configuration
fix(audio): resolve crackling in concept creation sound
docs(readme): update installation instructions
refactor(store): simplify semantic state management
```

## Testing

### Unit Tests

We use Jest for unit testing. Write tests for:

- Utility functions
- Store logic
- Component behavior
- Service classes

```typescript
// Example test
import { calculateDistance } from '../utils/math';

describe('calculateDistance', () => {
  it('should calculate correct distance between two points', () => {
    const result = calculateDistance([0, 0, 0], [3, 4, 0]);
    expect(result).toBe(5);
  });
});
```

### Integration Tests

Test component interactions and data flow:

```typescript
import { render, fireEvent, screen } from '@testing-library/react';
import { SearchInterface } from '../components/SearchInterface';

test('should filter results when typing in search', () => {
  render(<SearchInterface />);
  const input = screen.getByPlaceholderText(/search concepts/i);
  
  fireEvent.change(input, { target: { value: 'test' } });
  
  expect(screen.getByText(/searching/i)).toBeInTheDocument();
});
```

### Running Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Run in watch mode
npm test -- --coverage # Run with coverage
```

## Performance Guidelines

### React Performance

- Use `React.memo()` for expensive components
- Optimize re-renders with `useMemo()` and `useCallback()`
- Avoid creating objects in render methods
- Use proper dependency arrays in hooks

### Three.js Performance

- Implement Level of Detail (LOD) for distant objects
- Use instanced rendering for similar objects
- Dispose of geometries and materials properly
- Limit the number of lights and shadows

### Memory Management

- Clean up event listeners in `useEffect` cleanup
- Dispose of Three.js objects when components unmount
- Avoid memory leaks in stores and services

## Adding New Features

### Concept Categories

To add a new concept category:

1. Update the color mapping in `ConceptNode.tsx`:

```typescript
const categoryColors = {
  // existing categories...
  newcategory: '#ff6b6b',
};
```

2. Update the OpenAI prompt in `OpenAIService.ts` to include the new category

### Audio Events

To add new audio feedback:

1. Add the event to `AudioManager.ts`:

```typescript
export enum AudioEvent {
  // existing events...
  NewEvent = 'new-event',
}
```

2. Generate the audio clip in `generateAudioClips()`
3. Add a convenience method for playing the sound

### Settings

To add new settings:

1. Update the settings interface in `settingsStore.ts`
2. Add the UI controls in `SettingsDialog.tsx`
3. Use the setting in the relevant component/service

## Bug Reports

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/nicsaiart1/semantic-sphere/issues/new).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 10, macOS 12.0]
 - Node.js version: [e.g. 18.17.0]
 - SemanticSphere version: [e.g. 1.0.0]
 - SpaceMouse model: [if applicable]

**Additional context**
Add any other context about the problem here.
```

## Feature Requests

We welcome feature requests! Please provide:

- **Use case**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives**: What other solutions did you consider?
- **Additional context**: Screenshots, mockups, etc.

## Documentation

### Code Documentation

- Add JSDoc comments for all public APIs
- Include examples in documentation
- Document complex algorithms and business logic
- Keep README.md up to date

### API Documentation

```typescript
/**
 * Generates related concepts for a given concept using OpenAI
 * @param concept - The source concept label
 * @param description - Detailed description of the concept
 * @param context - Array of existing concept labels for context
 * @returns Promise resolving to array of related concepts
 * @throws {Error} When API key is invalid or request fails
 * 
 * @example
 * ```typescript
 * const related = await generateRelatedConcepts(
 *   'Machine Learning',
 *   'A subset of artificial intelligence',
 *   ['AI', 'Data Science']
 * );
 * ```
 */
public async generateRelatedConcepts(
  concept: string,
  description: string,
  context: string[] = []
): Promise<RelatedConcept[]>
```

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Incompatible API changes
- **MINOR**: Backwards-compatible functionality additions
- **PATCH**: Backwards-compatible bug fixes

### Release Checklist

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release branch: `git checkout -b release/v1.x.x`
4. Run full test suite
5. Build and test distributables
6. Create GitHub release with release notes
7. Merge to main and tag

## Community

### Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code.

### Getting Help

- **Documentation**: Check the README and wiki
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Discord**: Join our community Discord (link in README)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes for significant contributions
- About dialog in the application

Thank you for contributing to SemanticSphere! 🚀