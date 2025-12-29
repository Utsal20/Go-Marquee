/**
 * Performance optimization utilities for client-side operation
 * Provides methods to optimize bundle size, loading, and runtime performance
 */

import { performanceMonitor } from './PerformanceMonitor';
import { errorHandler } from './ErrorHandler';

export interface OptimizationConfig {
  enableBundleOptimization: boolean;
  enableRuntimeOptimization: boolean;
  enableMemoryOptimization: boolean;
  enableAnimationOptimization: boolean;
  aggressiveMode: boolean;
}

export interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  memoryUsage: number;
  fps: number;
  isOptimized: boolean;
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private config: OptimizationConfig;
  private optimizationStyles: HTMLStyleElement | null = null;

  private constructor() {
    this.config = {
      enableBundleOptimization: true,
      enableRuntimeOptimization: true,
      enableMemoryOptimization: true,
      enableAnimationOptimization: true,
      aggressiveMode: false,
    };
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Initialize performance optimization
   */
  initialize(config?: Partial<OptimizationConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Start monitoring
    performanceMonitor.startMonitoring();

    // Apply initial optimizations
    this.applyInitialOptimizations();
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const monitorMetrics = performanceMonitor.getMetrics();
    const performanceReport = performanceMonitor.generatePerformanceReport();

    return {
      bundleSize: performanceReport.bundleSize,
      loadTime: performanceReport.loadTime,
      memoryUsage: monitorMetrics.memoryUsage,
      fps: monitorMetrics.fps,
      isOptimized: performanceReport.isOptimized && monitorMetrics.fps >= 30,
    };
  }

  /**
   * Optimize for client-side operation
   */
  optimizeClientSide(): void {
    // Apply client-side optimizations
    this.applyClientSideOptimizations();
  }

  /**
   * Optimize bundle size and loading performance
   */
  optimizeBundleSize(): void {
    if (!this.config.enableBundleOptimization) return;

    // Remove unused CSS
    this.removeUnusedCSS();

    // Optimize images and assets
    this.optimizeAssets();

    // Enable compression hints
    this.enableCompressionHints();
  }

  /**
   * Optimize runtime performance
   */
  optimizeRuntime(): void {
    if (!this.config.enableRuntimeOptimization) return;

    const metrics = performanceMonitor.getMetrics();

    // Apply optimizations based on performance metrics
    if (metrics.fps < 30) {
      this.applyLowFPSOptimizations();
    }

    if (metrics.memoryUsage > 100) {
      this.applyMemoryOptimizations();
    }

    if (metrics.isLowEndDevice) {
      this.applyLowEndDeviceOptimizations();
    }
  }

  /**
   * Optimize animations for better performance
   */
  optimizeAnimations(): void {
    if (!this.config.enableAnimationOptimization) return;

    const optimizationCSS = `
      /* Performance-optimized animations */
      .marquee-container {
        will-change: transform;
        transform: translateZ(0);
        backface-visibility: hidden;
      }
      
      .marquee-text {
        will-change: transform;
        transform: translateZ(0);
        text-rendering: optimizeSpeed;
      }
      
      /* Reduce animation complexity on low-end devices */
      @media (max-width: 480px) {
        .marquee-text {
          animation-duration: 20s !important;
        }
      }
      
      /* Disable animations for users who prefer reduced motion */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;

    this.injectOptimizationCSS(optimizationCSS);
  }

  /**
   * Enable aggressive optimization mode
   */
  enableAggressiveMode(): void {
    this.config.aggressiveMode = true;

    const aggressiveCSS = `
      /* Aggressive performance optimizations */
      * {
        text-shadow: none !important;
        box-shadow: none !important;
        filter: none !important;
        backdrop-filter: none !important;
      }
      
      .marquee-text {
        animation-duration: 30s !important;
        font-weight: normal !important;
      }
      
      /* Disable expensive effects */
      .neon-effect {
        text-shadow: none !important;
      }
      
      /* Simplify transforms */
      .performance-optimized * {
        will-change: auto !important;
      }
    `;

    this.injectOptimizationCSS(aggressiveCSS);
    
    errorHandler.handleError(
      'AGGRESSIVE_OPTIMIZATION',
      'Aggressive performance mode enabled',
      'Performance optimizations applied for better experience',
      'low',
      'performance',
      { mode: 'aggressive' }
    );
  }

  /**
   * Disable aggressive optimization mode
   */
  disableAggressiveMode(): void {
    this.config.aggressiveMode = false;
    
    if (this.optimizationStyles) {
      this.optimizationStyles.remove();
      this.optimizationStyles = null;
    }
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    metrics: PerformanceMetrics;
    recommendations: string[];
  } {
    const metrics = this.getMetrics();
    const recommendations = performanceMonitor.getOptimizationRecommendations();

    return {
      metrics,
      recommendations,
    };
  }

  private applyInitialOptimizations(): void {
    // Apply basic performance optimizations
    const basicCSS = `
      /* Basic performance optimizations */
      * {
        box-sizing: border-box;
      }
      
      body {
        contain: layout style paint;
      }
      
      .app {
        contain: layout style;
      }
    `;

    this.injectOptimizationCSS(basicCSS);
  }

  private applyClientSideOptimizations(): void {
    // Ensure no server-side dependencies
    if (typeof window !== 'undefined') {
      // Client-side specific optimizations
      this.optimizeLocalStorage();
      this.optimizeEventListeners();
    }
  }

  private applyLowFPSOptimizations(): void {
    const lowFPSCSS = `
      /* Low FPS optimizations */
      .marquee-text {
        animation-duration: 25s !important;
        text-shadow: none !important;
      }
      
      * {
        transition-duration: 0.1s !important;
      }
    `;

    this.injectOptimizationCSS(lowFPSCSS);
  }

  private applyMemoryOptimizations(): void {
    // Clean up unused resources
    this.cleanupUnusedResources();
    
    // Reduce memory usage
    const memoryCSS = `
      /* Memory optimizations */
      * {
        will-change: auto !important;
      }
    `;

    this.injectOptimizationCSS(memoryCSS);
  }

  private applyLowEndDeviceOptimizations(): void {
    const lowEndCSS = `
      /* Low-end device optimizations */
      .marquee-text {
        font-size: 24px !important;
        animation-duration: 30s !important;
        text-shadow: none !important;
        font-weight: normal !important;
      }
      
      * {
        box-shadow: none !important;
        filter: none !important;
      }
    `;

    this.injectOptimizationCSS(lowEndCSS);
  }

  private removeUnusedCSS(): void {
    // This would typically be done at build time
    // For runtime, we can remove unused style elements
    const unusedStyles = document.querySelectorAll('style:empty, link[rel="stylesheet"]:not([href*="index"])');
    unusedStyles.forEach(style => style.remove());
  }

  private optimizeAssets(): void {
    // Optimize images by adding loading="lazy" to images
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
  }

  private enableCompressionHints(): void {
    // Add compression hints to the document
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Encoding';
    meta.content = 'gzip, deflate, br';
    document.head.appendChild(meta);
  }

  private optimizeLocalStorage(): void {
    try {
      // Clean up old localStorage entries
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('old-') || key.includes('temp-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      // Silent failure for localStorage optimization
    }
  }

  private optimizeEventListeners(): void {
    // Use passive event listeners for better performance
    const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel'];
    
    passiveEvents.forEach(() => {
      const originalAddEventListener = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (passiveEvents.includes(type) && typeof options !== 'object') {
          options = { passive: true };
        }
        return originalAddEventListener.call(this, type, listener, options);
      };
    });
  }

  private cleanupUnusedResources(): void {
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }

    // Clean up unused DOM elements
    const unusedElements = document.querySelectorAll('[data-unused="true"]');
    unusedElements.forEach(element => element.remove());
  }

  private injectOptimizationCSS(css: string): void {
    if (!this.optimizationStyles) {
      this.optimizationStyles = document.createElement('style');
      this.optimizationStyles.id = 'performance-optimizations';
      document.head.appendChild(this.optimizationStyles);
    }

    this.optimizationStyles.textContent += css;
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();