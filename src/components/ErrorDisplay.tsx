import React, { useState, useEffect, useCallback } from 'react';
import { ErrorInfo, errorHandler } from '../utils/ErrorHandler';
import './ErrorDisplay.css';

export interface ErrorDisplayProps {
  maxErrors?: number;
  autoHide?: boolean;
  autoHideDelay?: number;
  showRetryButton?: boolean;
  onRetry?: (error: ErrorInfo) => void;
  position?: 'top' | 'bottom' | 'center';
}

/**
 * ErrorDisplay component provides user-friendly error messages with retry functionality
 * Automatically manages error display lifecycle and provides visual feedback
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  maxErrors = 3,
  autoHide = true,
  autoHideDelay = 5000,
  showRetryButton = false,
  onRetry,
  position = 'top',
}) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [dismissedErrors, setDismissedErrors] = useState<Set<string>>(new Set());

  // Listen for new errors
  useEffect(() => {
    const handleNewError = (error: ErrorInfo) => {
      // Don't show already dismissed errors
      if (dismissedErrors.has(error.code)) return;

      setErrors(prevErrors => {
        // Remove duplicate errors
        const filteredErrors = prevErrors.filter(e => e.code !== error.code);
        
        // Add new error and limit to maxErrors
        const newErrors = [error, ...filteredErrors].slice(0, maxErrors);
        
        return newErrors;
      });

      // Auto-hide error if enabled
      if (autoHide) {
        setTimeout(() => {
          dismissError(error.code);
        }, autoHideDelay);
      }
    };

    errorHandler.addErrorListener(handleNewError);

    return () => {
      errorHandler.removeErrorListener(handleNewError);
    };
  }, [maxErrors, autoHide, autoHideDelay, dismissedErrors]);

  const dismissError = useCallback((errorCode: string) => {
    setErrors(prevErrors => prevErrors.filter(error => error.code !== errorCode));
    setDismissedErrors(prev => new Set(prev).add(errorCode));
  }, []);

  const handleRetry = useCallback((error: ErrorInfo) => {
    if (onRetry) {
      onRetry(error);
    }
    dismissError(error.code);
  }, [onRetry, dismissError]);

  const getErrorIcon = (severity: ErrorInfo['severity']): string => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
      default:
        return '📝';
    }
  };

  const getErrorClass = (error: ErrorInfo): string => {
    const baseClass = 'error-item';
    const severityClass = `error-${error.severity}`;
    const categoryClass = `error-${error.category}`;
    
    return `${baseClass} ${severityClass} ${categoryClass}`;
  };

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className={`error-display error-display-${position}`}>
      {errors.map((error) => (
        <div key={`${error.code}-${error.timestamp}`} className={getErrorClass(error)}>
          <div className="error-content">
            <div className="error-header">
              <span className="error-icon">{getErrorIcon(error.severity)}</span>
              <span className="error-category">{error.category.toUpperCase()}</span>
              <button
                className="error-dismiss"
                onClick={() => dismissError(error.code)}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
            
            <div className="error-message">
              {error.userMessage}
            </div>
            
            {error.severity === 'critical' && (
              <div className="error-details">
                <small>Error Code: {error.code}</small>
              </div>
            )}
            
            <div className="error-actions">
              {showRetryButton && onRetry && (
                <button
                  className="error-retry-btn"
                  onClick={() => handleRetry(error)}
                >
                  Retry
                </button>
              )}
              
              <button
                className="error-dismiss-btn"
                onClick={() => dismissError(error.code)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ErrorDisplay;