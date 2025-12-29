/**
 * Performance monitoring utilities for detecting and handling performance issues
 * Monitors FPS, memory usage, and device capabilities for graceful degradation
 */

import { errorHandler } from './ErrorHandler';

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  deviceScore: number;
  isLowEndDevice: boolean;
  supportedFeatures: {
    cssAnimations: boolean;
    transforms3d: boolean;
    webgl: boolean;
    fullscreen: boolean;
  };
}

export interface PerformanceThresholds {
  minFps: number;
  maxMemoryMB: number;
  maxRenderTime: number;
  deviceScoreThreshold: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private frameCount = 0;
  private lastFrameTime = 0;
  private fpsHistory: number[] = [];
  private isMonitoring = false;
  private performanceListeners: ((metrics: PerformanceMetrics) => void)[] = [];

  private constructor() {
    this.thresholds = {
      minFps: 30,
      maxMemoryMB: 100,
      maxRenderTime: 16.67, // 60fps = 16.67ms per frame
      deviceScoreThreshold: 50,
    };

    this.metrics = {
      fps: 60,
      memoryUsage: 0,
      renderTime: 0,
      deviceScore: 100,
      isLowEndDevice: false,
      supportedFeatures: {
        cssAnimations: false,
        transforms3d: false,
        webgl: false,
        fullscreen: false,
      },
    };

    this.detectDeviceCapabilities();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.fpsHistory = [];

    // Start FPS monitoring
    this.monitorFPS();

    // Monitor memory usage periodically
    this.monitorMemory();
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if device is considered low-end
   */
  isLowEndDevice(): boolean {
    return this.metrics.isLowEndDevice;
  }

  /**
   * Get performance optimization recommendations
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.fps < this.thresholds.minFps) {
      recommendations.push('Reduce animation complexity');
      recommendations.push('Disable visual effects');
    }

    if (this.metrics.memoryUsage > this.thresholds.maxMemoryMB) {
      recommendations.push('Reduce text length');
      recommendations.push('Simplify styling');
    }

    if (this.metrics.isLowEndDevice) {
      recommendations.push('Use simplified animations');
      recommendations.push('Reduce font sizes');
      recommendations.push('Disable neon effects');
    }

    if (!this.metrics.supportedFeatures.cssAnimations) {
      recommendations.push('Use JavaScript-based animations');
    }

    if (!this.metrics.supportedFeatures.transforms3d) {
      recommendations.push('Use 2D transforms only');
    }

    return recommendations;
  }

  /**
   * Add performance listener
   */
  addPerformanceListener(listener: (metrics: PerformanceMetrics) => void): void {
    this.performanceListeners.push(listener);
  }

  /**
   * Remove performance listener
   */
  removePerformanceListener(listener: (metrics: PerformanceMetrics) => void): void {
    const index = this.performanceListeners.indexOf(listener);
    if (index > -1) {
      this.performanceListeners.splice(index, 1);
    }
  }

  /**
   * Update performance thresholds
   */
  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  /**
   * Optimize performance based on current metrics
   */
  optimizePerformance(): void {
    // Apply automatic optimizations if performance is poor
    if (this.metrics.fps < 20) {
      this.applyEmergencyOptimizations();
    }
  }

  /**
   * Apply emergency optimizations for very poor performance
   */
  private applyEmergencyOptimizations(): void {
    // Disable expensive CSS effects
    const style = document.createElement('style');
    style.textContent = `
      * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
        text-shadow: none !important;
        box-shadow: none !important;
        filter: none !important;
      }
    `;
    document.head.appendChild(style);

    errorHandler.handlePerformanceError(
      'emergency-optimization',
      this.metrics.fps,
      20,
      { message: 'Emergency performance optimizations applied' }
    );
  }

  /**
   * Generate performance report for client-side operation
   */
  generatePerformanceReport(): {
    bundleSize: number;
    loadTime: number;
    isOptimized: boolean;
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let isOptimized = true;

    // Estimate bundle size from performance entries
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const bundleSize = navigationEntry?.transferSize || 0;

    // Calculate load time
    const loadTime = navigationEntry?.loadEventEnd - navigationEntry?.fetchStart || 0;

    // Check bundle size (should be under 200KB for fast loading)
    if (bundleSize > 200 * 1024) {
      isOptimized = false;
      suggestions.push('Bundle size is large - consider code splitting');
      suggestions.push('Enable gzip compression on server');
      suggestions.push('Remove unused dependencies');
    }

    // Check load time (should be under 3 seconds)
    if (loadTime > 3000) {
      isOptimized = false;
      suggestions.push('Load time is slow - optimize critical rendering path');
      suggestions.push('Preload critical resources');
      suggestions.push('Use CDN for faster asset delivery');
    }

    return {
      bundleSize,
      loadTime,
      isOptimized,
      suggestions,
    };
  }

  private detectDeviceCapabilities(): void {
    // Detect CSS animation support
    this.metrics.supportedFeatures.cssAnimations = this.supportsCSSAnimations();

    // Detect 3D transform support
    this.metrics.supportedFeatures.transforms3d = this.supports3DTransforms();

    // Detect WebGL support
    this.metrics.supportedFeatures.webgl = this.supportsWebGL();

    // Detect fullscreen support
    this.metrics.supportedFeatures.fullscreen = this.supportsFullscreen();

    // Calculate device score based on capabilities
    this.calculateDeviceScore();
  }

  private supportsCSSAnimations(): boolean {
    const element = document.createElement('div');
    const properties = ['animation', 'webkitAnimation', 'mozAnimation', 'msAnimation'];
    
    return properties.some(property => property in element.style);
  }

  private supports3DTransforms(): boolean {
    const element = document.createElement('div');
    element.style.transform = 'translate3d(0, 0, 0)';
    return element.style.transform !== '';
  }

  private supportsWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!context;
    } catch {
      return false;
    }
  }

  private supportsFullscreen(): boolean {
    return !!(
      document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).msFullscreenEnabled
    );
  }

  private calculateDeviceScore(): void {
    let score = 100;

    // Reduce score based on missing features
    if (!this.metrics.supportedFeatures.cssAnimations) score -= 20;
    if (!this.metrics.supportedFeatures.transforms3d) score -= 15;
    if (!this.metrics.supportedFeatures.webgl) score -= 10;
    if (!this.metrics.supportedFeatures.fullscreen) score -= 5;

    // Reduce score based on device characteristics
    const memory = (navigator as any).deviceMemory;
    if (memory && memory < 4) score -= 20;

    const cores = navigator.hardwareConcurrency;
    if (cores && cores < 4) score -= 15;

    // Check for mobile device
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) score -= 10;

    this.metrics.deviceScore = Math.max(0, score);
    this.metrics.isLowEndDevice = score < this.thresholds.deviceScoreThreshold;

    if (this.metrics.isLowEndDevice) {
      errorHandler.handlePerformanceError(
        'low-end-device',
        score,
        this.thresholds.deviceScoreThreshold,
        { deviceScore: score, features: this.metrics.supportedFeatures }
      );
    }
  }

  private monitorFPS(): void {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    this.frameCount++;

    if (this.lastFrameTime > 0) {
      const deltaTime = currentTime - this.lastFrameTime;
      const currentFPS = 1000 / deltaTime;
      
      this.fpsHistory.push(currentFPS);
      
      // Keep only last 60 frames for average calculation
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }

      // Calculate average FPS
      const avgFPS = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
      this.metrics.fps = Math.round(avgFPS);
      this.metrics.renderTime = deltaTime;

      // Check for performance issues
      if (this.metrics.fps < this.thresholds.minFps) {
        errorHandler.handlePerformanceError(
          'low-fps',
          this.metrics.fps,
          this.thresholds.minFps,
          { renderTime: deltaTime, frameCount: this.frameCount }
        );
      }

      if (deltaTime > this.thresholds.maxRenderTime) {
        errorHandler.handlePerformanceError(
          'render-lag',
          deltaTime,
          this.thresholds.maxRenderTime,
          { fps: this.metrics.fps, frameCount: this.frameCount }
        );
      }
    }

    this.lastFrameTime = currentTime;

    // Notify listeners
    this.notifyListeners();

    // Continue monitoring
    requestAnimationFrame(() => this.monitorFPS());
  }

  private monitorMemory(): void {
    if (!this.isMonitoring) return;

    // Check memory usage if available
    const memoryInfo = (performance as any).memory;
    if (memoryInfo) {
      const usedMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
      this.metrics.memoryUsage = Math.round(usedMB);

      if (usedMB > this.thresholds.maxMemoryMB) {
        errorHandler.handlePerformanceError(
          'high-memory',
          usedMB,
          this.thresholds.maxMemoryMB,
          { totalHeapSize: memoryInfo.totalJSHeapSize / (1024 * 1024) }
        );
      }
    }

    // Schedule next memory check
    setTimeout(() => this.monitorMemory(), 5000); // Check every 5 seconds
  }

  private notifyListeners(): void {
    this.performanceListeners.forEach(listener => {
      try {
        listener(this.metrics);
      } catch (error) {
        // Silent error handling for performance listener
      }
    });
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();