import { Direction, AnimationSettings, AnimationSpeed } from '../types';

/**
 * DirectionController manages animation direction changes and ensures
 * consistent animation speed regardless of direction.
 * 
 * Implements requirements:
 * - 3.1: Left-to-right and right-to-left animation control
 * - 3.2: Direction change application to running animations  
 * - 3.3: Consistent animation speed regardless of direction
 * - 3.4: Immediate direction change application
 */
export class DirectionController {
  private currentDirection: Direction = 'left-to-right';
  private currentSpeed: AnimationSpeed = 'fast';
  
  // Speed mapping: pixels per second
  private speedMap: Record<AnimationSpeed, number> = {
    'slow': 150,
    'normal': 250,
    'fast': 400,      // Default - much faster
    'very-fast': 600,
  };

  /**
   * Update the animation direction and return new animation settings
   * @param newDirection - The new direction to apply
   * @param textWidth - Width of the text element in pixels
   * @param containerWidth - Width of the container in pixels
   * @returns Updated animation settings with consistent speed
   */
  updateDirection(
    newDirection: Direction, 
    textWidth: number, 
    containerWidth: number
  ): AnimationSettings {
    this.currentDirection = newDirection;
    
    // Calculate duration to maintain consistent speed regardless of direction
    const duration = this.calculateDuration(textWidth, containerWidth);
    
    return {
      direction: newDirection,
      speed: this.speedMap[this.currentSpeed],
      duration: duration,
    };
  }

  /**
   * Update the animation speed
   * @param newSpeed - The new speed setting to apply
   * @param textWidth - Width of the text element in pixels
   * @param containerWidth - Width of the container in pixels
   * @returns Updated animation settings with new speed
   */
  updateSpeed(
    newSpeed: AnimationSpeed,
    textWidth: number,
    containerWidth: number
  ): AnimationSettings {
    this.currentSpeed = newSpeed;
    
    const duration = this.calculateDuration(textWidth, containerWidth);
    
    return {
      direction: this.currentDirection,
      speed: this.speedMap[this.currentSpeed],
      duration: duration,
    };
  }

  /**
   * Calculate animation duration to ensure consistent speed across directions
   * @param textWidth - Width of the text element in pixels
   * @param containerWidth - Width of the container in pixels
   * @returns Duration in seconds for consistent animation speed
   */
  calculateDuration(textWidth: number, containerWidth: number): number {
    if (textWidth === 0 || containerWidth === 0) return 5;
    
    // Total distance for simple calculation (matching test expectations)
    const totalDistance = textWidth + containerWidth;
    
    // Calculate duration based on current speed setting
    const pixelsPerSecond = this.speedMap[this.currentSpeed];
    const duration = totalDistance / pixelsPerSecond;
    
    // Ensure reasonable bounds: minimum 1 second, maximum 15 seconds
    return Math.max(1, Math.min(15, duration));
  }

  /**
   * Get the current direction
   * @returns Current animation direction
   */
  getCurrentDirection(): Direction {
    return this.currentDirection;
  }

  /**
   * Get the current speed setting
   * @returns Current animation speed setting
   */
  getCurrentSpeed(): AnimationSpeed {
    return this.currentSpeed;
  }

  /**
   * Set the animation speed using speed setting
   * @param speed - New animation speed setting
   */
  setAnimationSpeed(speed: AnimationSpeed): void {
    this.currentSpeed = speed;
  }

  /**
   * Get the current animation speed in pixels per second
   * @returns Current animation speed in pixels per second
   */
  getAnimationSpeed(): number {
    return this.speedMap[this.currentSpeed];
  }

  /**
   * Generate CSS animation properties for the given direction and dimensions.
   * For seamless loop, uses track positions: a track with two text copies is animated
   * so when one copy exits, the other is in the same visual position.
   * @param textWidth - Width of the text element in pixels
   * @param containerWidth - Width of the container in pixels
   * @returns CSS properties object for animation
   */
  generateAnimationCSS(textWidth: number, containerWidth: number): Record<string, string> {
    const duration = this.calculateDuration(textWidth, containerWidth);
    
    let startPosition: string;
    let endPosition: string;
    let trackStart: string;
    let trackEnd: string;
    
    if (this.currentDirection === 'left-to-right') {
      // LTR: text moves right to left. Track starts with first copy on right, ends when second copy is in same place.
      startPosition = '100%';
      endPosition = `-${textWidth}px`;
      trackStart = `${containerWidth - textWidth}px`;
      trackEnd = `-${textWidth}px`;
    } else {
      // RTL: text moves left to right.
      startPosition = `-${textWidth}px`;
      endPosition = '100%';
      trackStart = `-${textWidth}px`;
      trackEnd = `${containerWidth - textWidth}px`;
    }
    
    return {
      '--start-position': startPosition,
      '--end-position': endPosition,
      '--track-start': trackStart,
      '--track-end': trackEnd,
      '--animation-duration': `${duration}s`,
      '--container-width': `${containerWidth}px`,
      '--text-width': `${textWidth}px`,
      '--marquee-text-width': `${textWidth}px`,
    };
  }

  /**
   * Check if direction change requires animation restart
   * @param newDirection - The direction to check against current
   * @returns True if animation should restart for immediate application
   */
  requiresAnimationRestart(newDirection: Direction): boolean {
    return this.currentDirection !== newDirection;
  }

  /**
   * Check if speed change requires animation restart
   * @param newSpeed - The speed to check against current
   * @returns True if animation should restart for immediate application
   */
  requiresSpeedRestart(newSpeed: AnimationSpeed): boolean {
    return this.currentSpeed !== newSpeed;
  }
}

// Export singleton instance for consistent state management
export const directionController = new DirectionController();