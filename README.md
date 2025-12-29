# GoMarquee

A client-side React web application for creating and displaying customizable scrolling marquee text, optimized for mobile devices.

## Project Structure

```
gomarquee/
├── src/
│   ├── components/     # React components
│   ├── types/          # TypeScript type definitions
│   ├── styles/         # CSS and styling files
│   ├── test/           # Test setup and utilities
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── package.json        # Project dependencies and scripts
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── index.html          # HTML template
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```
   ```bash
   npm run build && npm test
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Features

- **Customizable scrolling marquee text** with real-time preview
- **Mobile-optimized responsive design** with touch gesture support
- **Fullscreen display mode** with keyboard shortcuts (ESC to exit)
- **Real-time text and styling customization** including:
  - 5 font sizes (small, medium, large, extra-large, jumbo)
  - 8+ color options with visual color picker
  - 3 text styles (simple, bold, neon glow effects)
  - Animation direction control (left-to-right, right-to-left)
  - 4 animation speeds (slow, normal, fast, very-fast)
- **URL parameter sharing** - share your marquee configurations via compact URLs
- **Session persistence** - settings automatically saved during your session
- **Touch gesture support** - double-tap for fullscreen, swipe gestures for controls
- **Comprehensive error handling** with graceful fallbacks
- **Client-side only operation** (no backend required)
- **Performance optimized** for 60fps animations and mobile devices

## Technology Stack

- React 18 with TypeScript
- Vite for build tooling
- Vitest for testing with comprehensive test coverage (169 tests)
- CSS Modules for styling
- fast-check for property-based testing
- Hardware-accelerated CSS animations for smooth performance

## URL Parameter Sharing

GoMarquee supports shareable URLs with compact parameter encoding:

- `t` - text content (URL encoded)
- `s` - font size (s=small, m=medium, l=large, x=extra-large, j=jumbo)
- `c` - text color (hex color values)
- `y` - text style (s=simple, b=bold, n=neon)
- `d` - direction (l=left-to-right, r=right-to-left)
- `a` - animation speed (s=slow, n=normal, f=fast, v=very-fast)

Example: `?t=Hello%20World&s=l&c=%23ff0000&y=b&d=r&a=f`

## Keyboard Shortcuts

- **ESC** - Exit fullscreen mode
- **Double-tap** (mobile) - Toggle fullscreen
- **Swipe up/down** (mobile) - Enter/exit fullscreen
- **Swipe left/right** (mobile) - Change animation direction