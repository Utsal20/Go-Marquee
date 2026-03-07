import { useState, useCallback, useEffect } from 'react';
import { TextInputProps } from '../types';
import { handleInputValidationError } from '../utils/ErrorHandler';
import './TextInputComponent.css';

const TextInputComponent: React.FC<TextInputProps> = ({
  value,
  onChange,
  maxLength
}) => {
  const [isWarning, setIsWarning] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [lastValidInput, setLastValidInput] = useState<string>('');

  // Update warning state when value changes
  useEffect(() => {
    const warningThreshold = Math.floor(maxLength * 0.9);
    setIsWarning(value.length >= warningThreshold && value.length < maxLength);
    
    // Clear validation error when input becomes valid
    if (validationError && value.length <= maxLength) {
      setValidationError('');
    }
  }, [value, maxLength, validationError]);

  // Sanitize input to allow only alphanumeric characters, spaces, and common punctuation
  const sanitizeInput = useCallback((input: string): string => {
    try {
      // Allow alphanumeric characters, spaces, and common punctuation
      // Common punctuation includes: . , ! ? ; : ' " - _ ( ) [ ] { } @ # $ % & * + = / \ | ~ ` ^ < >
      const allowedPattern = /[a-zA-Z0-9\s.,!?;:'"_\-()[\]{}@#$%&*+=\/\\|~`^<>]/g;
      const matches = input.match(allowedPattern);
      const sanitized = matches ? matches.join('') : '';
      
      // Check if sanitization removed characters
      if (sanitized !== input && input.length > 0) {
        const removedChars = input.length - sanitized.length;
        handleInputValidationError(
          input,
          'invalid-characters',
          { removedCharacters: removedChars, originalLength: input.length }
        );
        setValidationError(`${removedChars} invalid character(s) removed`);
        
        // Clear error after 3 seconds
        setTimeout(() => setValidationError(''), 3000);
      }
      
      return sanitized;
    } catch (error) {
      handleInputValidationError(
        input,
        'sanitization-failed',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      setValidationError('Unable to process input');
      
      // Return last valid input as fallback
      return lastValidInput;
    }
  }, [lastValidInput]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawInput = event.target.value;
    
    try {
      const sanitizedInput = sanitizeInput(rawInput);
      
      // Check length limit
      if (sanitizedInput.length > maxLength) {
        handleInputValidationError(
          sanitizedInput,
          'too-long',
          { length: sanitizedInput.length, maxLength }
        );
        setValidationError(`Text too long (${sanitizedInput.length}/${maxLength} characters)`);
        
        // Don't update if exceeds limit
        return;
      }
      
      // Update last valid input for fallback
      setLastValidInput(sanitizedInput);
      
      // Clear any existing validation error
      if (validationError) {
        setValidationError('');
      }
      
      onChange(sanitizedInput);
    } catch (error) {
      handleInputValidationError(
        rawInput,
        'sanitization-failed',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      setValidationError('Unable to process input');
    }
  }, [sanitizeInput, onChange, maxLength, validationError, lastValidInput]);

  const remainingChars = maxLength - value.length;
  const isAtLimit = value.length >= maxLength;

  return (
    <div className="text-input-container">
      <textarea
        id="marquee-text"
        className={`text-input ${isWarning ? 'warning' : ''} ${isAtLimit ? 'at-limit' : ''} ${validationError ? 'error' : ''}`}
        value={value}
        onChange={handleInputChange}
        placeholder="Type your message here... (up to 500 characters)"
        rows={4}
        maxLength={maxLength}
        aria-describedby={validationError ? 'input-error' : undefined}
        aria-invalid={!!validationError}
      />
      
      {/* Validation Error Display */}
      {validationError && (
        <div id="input-error" className="validation-error" role="alert">
          ⚠️ {validationError}
        </div>
      )}
      
      <div className="character-counter">
        <span className={`counter-text ${isWarning ? 'warning' : ''} ${isAtLimit ? 'at-limit' : ''}`}>
          {value.length} / {maxLength} characters
        </span>
        
        {isWarning && !isAtLimit && (
          <span className="warning-message">
            Approaching character limit
          </span>
        )}
        
        {isAtLimit && (
          <span className="limit-message">
            Character limit reached
          </span>
        )}
      </div>
      
      {remainingChars <= 10 && remainingChars > 0 && (
        <div className="remaining-chars">
          {remainingChars} characters remaining
        </div>
      )}
    </div>
  );
};

export default TextInputComponent;