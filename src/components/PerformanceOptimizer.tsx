import React, { useState, useEffect, useCallback } from 'react';
import { PerformanceMetrics, performanceMonitor } from '../utils/PerformanceMonitor';
import { errorHandler } from '../utils/ErrorHandler';
import { FontSize, TextStyle } from '../types';

export interface PerformanceOptimizerProps {
  children: React.ReactNode;
  onOptimizationChange?: (optimizations: OptimizationSettings) => void;
  enableAutoOptimization?: boolean;
}

export interface OptimizationSettings {
  reduceAnimations: boolean;
  simplifyEffects: boolean;
  lowerQuality: boolean;
  reduceFontSize: boolean;
  disableNeon: boolean;
  useJavaScriptAnimation: boolean;
  recommendedFontSize?: FontSize;
  recommendedTextStyle?: TextStyle;
}

/**
 * PerformanceOptimizer monitors device performance and automatically applies
 * optimizations for slower devices to maintain smooth user experience
 */
const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  children,
  onOptimizationChange,
  enableAutoOptimization = true,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [optimizations, setOptimizations] = useState<OptimizationSettings>({
    reduceAnimations: false,
    simplifyEffects: false,
    lowerQuality: false,
    reduceFontSize: false,
    disableNeon: false,
    useJavaScriptAnimation: false,
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showOptimizationNotice, setShowOptimizationNotice] = useState(false);

  // Start performance monitoring on mount
  useEffect(() => {
    performanceMonitor.startMonitoring();

    const handleMetricsUpdate = (newMetrics: PerformanceMetrics) => {
      setMetrics(newMetrics);
      
      if (enableAutoOptimization) {
        checkAndApplyOptimizations(newMetrics);
      }
    };

    performanceMonitor.addPerformanceListener(handleMetricsUpdate);

    return () => {
      performanceMonitor.removePerformanceListener(handleMetricsUpdate);
      performanceMonitor.stopMonitoring();
    };
  }, [enableAutoOptimization]);

  const checkAndApplyOptimizations = useCallback((currentMetrics: PerformanceMetrics) => {
    const newOptimizations: OptimizationSettings = {
      reduceAnimations: false,
      simplifyEffects: false,
      lowerQuality: false,
      reduceFontSize: false,
      disableNeon: false,
      useJavaScriptAnimation: false,
    };

    let needsOptimization = false;

    // Check FPS performance
    if (currentMetrics.fps < 30) {
      newOptimizations.reduceAnimations = true;
      newOptimizations.simplifyEffects = true;
      needsOptimization = true;
      
      errorHandler.handlePerformanceError(
        'low-fps',
        currentMetrics.fps,
        30,
        { optimization: 'reducing animations and effects' }
      );
    }

    // Check for low-end device
    if (currentMetrics.isLowEndDevice) {
      newOptimizations.lowerQuality = true;
      newOptimizations.reduceFontSize = true;
      newOptimizations.disableNeon = true;
      newOptimizations.recommendedFontSize = 'medium';
      newOptimizations.recommendedTextStyle = 'simple';
      needsOptimization = true;

      errorHandler.handlePerformanceError(
        'slow-device',
        currentMetrics.deviceScore,
        50,
        { optimization: 'enabling low-end device mode' }
      );
    }

    // Check memory usage
    if (currentMetrics.memoryUsage > 100) {
      newOptimizations.simplifyEffects = true;
      newOptimizations.lowerQuality = true;
      needsOptimization = true;

      errorHandler.handlePerformanceError(
        'high-memory',
        currentMetrics.memoryUsage,
        100,
        { optimization: 'reducing memory usage' }
      );
    }

    // Check for missing CSS animation support
    if (!currentMetrics.supportedFeatures.cssAnimations) {
      newOptimizations.useJavaScriptAnimation = true;
      needsOptimization = true;

      errorHandler.handleBrowserError(
        'CSS Animations',
        'JavaScript-based animations',
        { optimization: 'fallback to JavaScript animations' }
      );
    }

    // Check for missing 3D transform support
    if (!currentMetrics.supportedFeatures.transforms3d) {
      newOptimizations.lowerQuality = true;
      needsOptimization = true;

      errorHandler.handleBrowserError(
        '3D Transforms',
        '2D transforms',
        { optimization: 'using 2D transforms only' }
      );
    }

    // Apply optimizations if needed
    if (needsOptimization) {
      setOptimizations(newOptimizations);
      setIsOptimizing(true);
      setShowOptimizationNotice(true);

      // Notify parent component
      if (onOptimizationChange) {
        onOptimizationChange(newOptimizations);
      }

      // Hide notice after 5 seconds
      setTimeout(() => {
        setShowOptimizationNotice(false);
      }, 5000);
    }
  }, [onOptimizationChange]);

  const manualOptimize = useCallback(() => {
    if (!metrics) return;

    setIsOptimizing(true);
    
    // Apply aggressive optimizations manually
    const aggressiveOptimizations: OptimizationSettings = {
      reduceAnimations: true,
      simplifyEffects: true,
      lowerQuality: true,
      reduceFontSize: true,
      disableNeon: true,
      useJavaScriptAnimation: !metrics.supportedFeatures.cssAnimations,
      recommendedFontSize: 'small',
      recommendedTextStyle: 'simple',
    };

    setOptimizations(aggressiveOptimizations);
    setShowOptimizationNotice(true);

    if (onOptimizationChange) {
      onOptimizationChange(aggressiveOptimizations);
    }

    errorHandler.handleError(
      'MANUAL_OPTIMIZATION',
      'User manually enabled performance optimizations',
      'Performance mode enabled for better experience',
      'low',
      'performance',
      { optimizations: aggressiveOptimizations }
    );

    setTimeout(() => {
      setShowOptimizationNotice(false);
    }, 3000);
  }, [metrics, onOptimizationChange]);

  const resetOptimizations = useCallback(() => {
    const defaultOptimizations: OptimizationSettings = {
      reduceAnimations: false,
      simplifyEffects: false,
      lowerQuality: false,
      reduceFontSize: false,
      disableNeon: false,
      useJavaScriptAnimation: false,
    };

    setOptimizations(defaultOptimizations);
    setIsOptimizing(false);

    if (onOptimizationChange) {
      onOptimizationChange(defaultOptimizations);
    }
  }, [onOptimizationChange]);

  const getPerformanceStatus = (): 'good' | 'fair' | 'poor' => {
    if (!metrics) return 'good';
    
    if (metrics.fps >= 50 && !metrics.isLowEndDevice) return 'good';
    if (metrics.fps >= 30) return 'fair';
    return 'poor';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'good': return '#4caf50';
      case 'fair': return '#ff9800';
      case 'poor': return '#f44336';
      default: return '#888';
    }
  };

  return (
    <div className="performance-optimizer">
      {/* Performance Status Indicator */}
      {metrics && (
        <div className="performance-status" style={{ 
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(getPerformanceStatus())
          }} />
          <span>FPS: {metrics.fps}</span>
          {metrics.memoryUsage > 0 && (
            <span>Mem: {metrics.memoryUsage}MB</span>
          )}
          {isOptimizing && (
            <span style={{ color: '#ff9800' }}>⚡ Optimized</span>
          )}
        </div>
      )}

      {/* Optimization Notice */}
      {showOptimizationNotice && (
        <div style={{
          position: 'fixed',
          top: '50px',
          right: '10px',
          background: 'rgba(255, 152, 0, 0.9)',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: '4px',
          fontSize: '14px',
          zIndex: 998,
          maxWidth: '300px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            ⚡ Performance Optimized
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>
            Settings adjusted for better performance on this device
          </div>
        </div>
      )}

      {/* Manual Optimization Controls */}
      {metrics && getPerformanceStatus() !== 'good' && !isOptimizing && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 997
        }}>
          <button
            onClick={manualOptimize}
            style={{
              background: '#ff9800',
              color: '#fff',
              border: 'none',
              padding: '12px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}
          >
            ⚡ Optimize Performance
          </button>
        </div>
      )}

      {/* Reset Optimizations Button */}
      {isOptimizing && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 997
        }}>
          <button
            onClick={resetOptimizations}
            style={{
              background: '#4caf50',
              color: '#fff',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Reset Optimizations
          </button>
        </div>
      )}

      {/* Apply CSS class based on optimizations */}
      <div className={`performance-content ${isOptimizing ? 'performance-optimized' : ''}`}>
        {children}
      </div>

      {/* Inject optimization styles */}
      <style>{`
        .performance-optimized .marquee-text {
          ${optimizations.reduceAnimations ? 'animation-duration: 20s !important;' : ''}
          ${optimizations.disableNeon ? 'text-shadow: none !important; filter: none !important;' : ''}
          ${optimizations.lowerQuality ? 'will-change: auto !important;' : ''}
        }
        
        .performance-optimized .marquee-container {
          ${optimizations.useJavaScriptAnimation ? 'animation: none !important;' : ''}
          ${optimizations.lowerQuality ? 'transform: translateZ(0) !important;' : ''}
        }
        
        .performance-optimized * {
          ${optimizations.simplifyEffects ? 'box-shadow: none !important; filter: none !important;' : ''}
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default PerformanceOptimizer;