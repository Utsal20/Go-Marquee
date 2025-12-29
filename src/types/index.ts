import { CSSProperties } from 'react';

// Core type definitions
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large' | 'jumbo';
export type TextStyle = 'simple' | 'bold' | 'neon';
export type Direction = 'left-to-right' | 'right-to-left';
export type AnimationSpeed = 'slow' | 'normal' | 'fast' | 'very-fast';

// App State Interface
export interface AppState {
  text: string;
  fontSize: FontSize;
  textColor: string;
  textStyle: TextStyle;
  direction: Direction;
  animationSpeed: AnimationSpeed;
  isFullscreen: boolean;
}

// Text Configuration Model
export interface TextConfiguration {
  content: string;
  styling: TextStyling;
  animation: AnimationSettings;
}

export interface TextStyling {
  fontSize: FontSize;
  color: string;
  style: TextStyle;
  computedCSS: CSSProperties;
}

export interface AnimationSettings {
  direction: Direction;
  speed: number; // pixels per second
  duration: number; // calculated based on text length and screen width
}

// Component Props Interfaces
export interface TextInputProps {
  value: string;
  onChange: (text: string) => void;
  maxLength: number;
}

export interface StyleControlsProps {
  fontSize: FontSize;
  textColor: string;
  textStyle: TextStyle;
  direction: Direction;
  animationSpeed: AnimationSpeed;
  onFontSizeChange: (size: FontSize) => void;
  onColorChange: (color: string) => void;
  onStyleChange: (style: TextStyle) => void;
  onDirectionChange: (direction: Direction) => void;
  onAnimationSpeedChange: (speed: AnimationSpeed) => void;
}

export interface MarqueeDisplayProps {
  text: string;
  fontSize: FontSize;
  textColor: string;
  textStyle: TextStyle;
  direction: Direction;
  animationSpeed: AnimationSpeed;
  isFullscreen: boolean;
}

export interface FullscreenManagerProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  children: React.ReactNode;
}

export interface MobileOptimizerProps {
  children: React.ReactNode;
  onViewportChange?: (viewport: ViewportInfo) => void;
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
  enableTouchGestures?: boolean;
  onGestureDetected?: (gesture: TouchGesture) => void;
}

export interface TouchGesture {
  type: 'tap' | 'double-tap' | 'swipe' | 'pinch' | 'long-press';
  direction?: 'up' | 'down' | 'left' | 'right';
  position: { x: number; y: number };
  distance?: number;
  duration: number;
  velocity?: number;
  scale?: number;
}

export interface ViewportInfo {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  isMobile: boolean;
  isTablet: boolean;
  devicePixelRatio: number;
}

// Engine Interfaces
export interface StyleEngine {
  generateCSS(styling: TextStyling): CSSProperties;
  applyNeonEffect(baseColor: string): CSSProperties;
  calculateFontSize(size: FontSize, screenWidth: number): string;
}

export interface AnimationController {
  startAnimation(settings: AnimationSettings): void;
  stopAnimation(): void;
  updateDirection(direction: Direction): void;
  calculateDuration(textWidth: number, screenWidth: number): number;
}