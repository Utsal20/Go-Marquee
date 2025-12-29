/**
 * Centralized error handling utilities for GoMarquee application
 * Provides consistent error management, logging, and user-friendly error messages
 */

export interface ErrorInfo {
  code: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'input' | 'animation' | 'fullscreen' | 'performance' | 'browser' | 'general';
  timestamp: number;
  context?: Record<string, any>;
}

export interface ErrorHandlerOptions {
  enableLogging?: boolean;
  enableUserNotifications?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: ErrorInfo[] = [];
  private options: ErrorHandlerOptions;
  private errorListeners: ((error: ErrorInfo) => void)[] = [];

  private constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      enableLogging: true,
      enableUserNotifications: true,
      maxRetries: 3,
      retryDelay: 1000,
      ...options,
    };
  }

  static getInstance(options?: ErrorHandlerOptions): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(options);
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle an error with appropriate logging and user notification
   */
  handleError(
    code: string,
    message: string,
    userMessage: string,
    severity: ErrorInfo['severity'] = 'medium',
    category: ErrorInfo['category'] = 'general',
    context?: Record<string, any>
  ): ErrorInfo {
    const errorInfo: ErrorInfo = {
      code,
      message,
      userMessage,
      severity,
      category,
      timestamp: Date.now(),
      context,
    };

    // Store error for tracking
    this.errors.push(errorInfo);

    // Log error if enabled
    if (this.options.enableLogging) {
      this.logError(errorInfo);
    }

    // Notify listeners
    this.notifyListeners(errorInfo);

    return errorInfo;
  }

  /**
   * Handle input validation errors
   */
  handleInputError(input: string, reason: string, context?: Record<string, any>): ErrorInfo {
    const errorMessages = {
      'invalid-characters': 'Text contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed.',
      'too-long': 'Text is too long. Please keep it under 500 characters.',
      'empty-required': 'Text is required for this operation.',
      'sanitization-failed': 'Unable to process the text. Please try with different content.',
    };

    return this.handleError(
      `INPUT_${reason.toUpperCase().replace('-', '_')}`,
      `Input validation failed: ${reason}`,
      errorMessages[reason as keyof typeof errorMessages] || 'Invalid input provided.',
      'medium',
      'input',
      { input: input.substring(0, 100), reason, ...context }
    );
  }

  /**
   * Handle animation-related errors
   */
  handleAnimationError(operation: string, error: Error, context?: Record<string, any>): ErrorInfo {
    const userMessages = {
      'css-animation-failed': 'Animation temporarily unavailable. Using fallback display.',
      'performance-degraded': 'Animation reduced for better performance on this device.',
      'direction-change-failed': 'Unable to change animation direction. Please try again.',
      'duration-calculation-failed': 'Animation timing issue detected. Using default settings.',
    };

    const code = operation.toUpperCase().replace('-', '_');
    const userMessage = userMessages[operation as keyof typeof userMessages] || 
      'Animation issue detected. Functionality may be limited.';

    return this.handleError(
      `ANIMATION_${code}`,
      `Animation error in ${operation}: ${error.message}`,
      userMessage,
      'medium',
      'animation',
      { operation, errorMessage: error.message, ...context }
    );
  }

  /**
   * Handle fullscreen API errors
   */
  handleFullscreenError(operation: string, error?: Error, context?: Record<string, any>): ErrorInfo {
    const userMessages = {
      'not-supported': 'Fullscreen mode is not supported in this browser. Try using F11 instead.',
      'permission-denied': 'Fullscreen access was denied. Please allow fullscreen permissions.',
      'enter-failed': 'Unable to enter fullscreen mode. Please try again or use F11.',
      'exit-failed': 'Unable to exit fullscreen mode. Press ESC or F11 to exit.',
      'api-unavailable': 'Fullscreen feature is not available. Using maximized view instead.',
    };

    const code = operation.toUpperCase().replace('-', '_');
    const userMessage = userMessages[operation as keyof typeof userMessages] || 
      'Fullscreen operation failed. Please try again.';

    return this.handleError(
      `FULLSCREEN_${code}`,
      `Fullscreen error in ${operation}: ${error?.message || 'Unknown error'}`,
      userMessage,
      'medium',
      'fullscreen',
      { operation, errorMessage: error?.message, ...context }
    );
  }

  /**
   * Handle performance-related errors and degradation
   */
  handlePerformanceError(metric: string, value: number, threshold: number, context?: Record<string, any>): ErrorInfo {
    const userMessages = {
      'low-fps': 'Animation performance is low. Reducing effects for smoother experience.',
      'high-memory': 'High memory usage detected. Optimizing for better performance.',
      'slow-device': 'Device performance is limited. Using simplified animations.',
      'render-lag': 'Display lag detected. Switching to performance mode.',
    };

    const severity: ErrorInfo['severity'] = value > threshold * 2 ? 'high' : 'medium';
    const userMessage = userMessages[metric as keyof typeof userMessages] || 
      'Performance issue detected. Optimizing for better experience.';

    return this.handleError(
      `PERFORMANCE_${metric.toUpperCase().replace('-', '_')}`,
      `Performance threshold exceeded for ${metric}: ${value} > ${threshold}`,
      userMessage,
      severity,
      'performance',
      { metric, value, threshold, ...context }
    );
  }

  /**
   * Handle browser compatibility errors
   */
  handleBrowserError(feature: string, fallback?: string, context?: Record<string, any>): ErrorInfo {
    const userMessage = fallback 
      ? `${feature} is not supported in this browser. Using ${fallback} instead.`
      : `${feature} is not supported in this browser. Some features may be limited.`;

    return this.handleError(
      `BROWSER_${feature.toUpperCase().replace(/\s+/g, '_')}_UNSUPPORTED`,
      `Browser feature not supported: ${feature}`,
      userMessage,
      'low',
      'browser',
      { feature, fallback, userAgent: navigator.userAgent, ...context }
    );
  }

  /**
   * Add error listener for real-time error handling
   */
  addErrorListener(listener: (error: ErrorInfo) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * Remove error listener
   */
  removeErrorListener(listener: (error: ErrorInfo) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  /**
   * Get recent errors by category
   */
  getRecentErrors(category?: ErrorInfo['category'], limit: number = 10): ErrorInfo[] {
    let filteredErrors = this.errors;
    
    if (category) {
      filteredErrors = this.errors.filter(error => error.category === category);
    }

    return filteredErrors
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Clear error history
   */
  clearErrors(category?: ErrorInfo['category']): void {
    if (category) {
      this.errors = this.errors.filter(error => error.category !== category);
    } else {
      this.errors = [];
    }
  }

  /**
   * Check if there are critical errors
   */
  hasCriticalErrors(): boolean {
    return this.errors.some(error => error.severity === 'critical');
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    this.errors.forEach(error => {
      const key = `${error.category}_${error.severity}`;
      stats[key] = (stats[key] || 0) + 1;
    });

    return stats;
  }

  private logError(error: ErrorInfo): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.category.toUpperCase()}] ${error.code}: ${error.message}`;
    
    switch (logLevel) {
      case 'error':
        console.error(logMessage, error.context);
        break;
      case 'warn':
        console.warn(logMessage, error.context);
        break;
      case 'info':
        console.info(logMessage, error.context);
        break;
      default:
        console.log(logMessage, error.context);
    }
  }

  private getLogLevel(severity: ErrorInfo['severity']): 'error' | 'warn' | 'info' | 'log' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      case 'low':
        return 'info';
      default:
        return 'log';
    }
  }

  private notifyListeners(error: ErrorInfo): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Export utility functions for common error scenarios
export const handleInputValidationError = (input: string, reason: string, context?: Record<string, any>) =>
  errorHandler.handleInputError(input, reason, context);

export const handleAnimationFailure = (operation: string, error: Error, context?: Record<string, any>) =>
  errorHandler.handleAnimationError(operation, error, context);

export const handleFullscreenFailure = (operation: string, error?: Error, context?: Record<string, any>) =>
  errorHandler.handleFullscreenError(operation, error, context);

export const handlePerformanceIssue = (metric: string, value: number, threshold: number, context?: Record<string, any>) =>
  errorHandler.handlePerformanceError(metric, value, threshold, context);

export const handleBrowserCompatibility = (feature: string, fallback?: string, context?: Record<string, any>) =>
  errorHandler.handleBrowserError(feature, fallback, context);