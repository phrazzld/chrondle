'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GAME_CONFIG } from '@/lib/constants';

interface TimelineSliderProps {
  /** Current year value */
  value: number;
  /** Callback when year changes */
  onChange: (year: number) => void;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

interface CenturyMarker {
  year: number;
  label: string;
  position: number; // 0-100 percentage
}

// Generate century markers dynamically based on the game's year range
function generateCenturyMarkers(): CenturyMarker[] {
  const markers: CenturyMarker[] = [];
  const minYear = GAME_CONFIG.MIN_YEAR;
  const maxYear = GAME_CONFIG.MAX_YEAR;
  const totalRange = maxYear - minYear;
  
  // Start from the nearest century below MIN_YEAR
  const startCentury = Math.floor(minYear / 100) * 100;
  
  // Generate markers for every 500 years before 0, every 100 years after
  for (let year = startCentury; year <= maxYear; year += (year < 0 ? 500 : 100)) {
    if (year >= minYear && year <= maxYear) {
      const position = ((year - minYear) / totalRange) * 100;
      const label = year === 0 ? 'CE' : 
                    year < 0 ? `${Math.abs(year)} BCE` : 
                    `${year}`;
      markers.push({ year, label, position });
    }
  }
  
  return markers;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({
  value,
  onChange,
  disabled = false,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCenter, setZoomCenter] = useState(value);
  const sliderRef = useRef<HTMLInputElement>(null);
  
  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Calculate zoom range (±50 years from center)
  const zoomRange = 50;
  const zoomMin = Math.max(GAME_CONFIG.MIN_YEAR, zoomCenter - zoomRange);
  const zoomMax = Math.min(GAME_CONFIG.MAX_YEAR, zoomCenter + zoomRange);
  
  // Use zoomed or full range
  const currentMin = isZoomed ? zoomMin : GAME_CONFIG.MIN_YEAR;
  const currentMax = isZoomed ? zoomMax : GAME_CONFIG.MAX_YEAR;
  
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    setLocalValue(newValue);
    
    if (!isDragging) {
      onChange(newValue);
    }
  }, [onChange, isDragging]);
  
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
    // Enable zoom on interaction
    if (!isZoomed) {
      setIsZoomed(true);
      setZoomCenter(localValue);
    }
  }, [isZoomed, localValue]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    onChange(localValue);
    
    // Keep zoom active for a moment, then zoom out
    setTimeout(() => {
      setIsZoomed(false);
    }, 1500);
  }, [localValue, onChange]);
  
  // Touch events for mobile
  const handleTouchStart = useCallback(() => {
    handleMouseDown();
  }, [handleMouseDown]);
  
  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);
  
  // Generate markers for current range
  const markers = generateCenturyMarkers().filter(
    marker => marker.year >= currentMin && marker.year <= currentMax
  );
  
  // Calculate position of current value
  const valuePosition = ((localValue - currentMin) / (currentMax - currentMin)) * 100;
  
  return (
    <div className={`timeline-slider-container ${className}`}>
      {/* Value Display */}
      <div className="timeline-value-display">
        <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
          {localValue < 0 ? `${Math.abs(localValue)} BCE` : localValue}
        </span>
        {isZoomed && (
          <span className="text-xs ml-2" style={{ color: 'var(--muted-foreground)' }}>
            (zoomed view)
          </span>
        )}
      </div>
      
      {/* Timeline Slider */}
      <div className="timeline-slider-wrapper">
        {/* Century Markers */}
        <div className="timeline-markers" aria-hidden="true">
          {markers.map((marker) => (
            <div
              key={marker.year}
              className="timeline-marker"
              style={{ left: `${marker.position}%` }}
            >
              <div className="marker-tick" />
              <div className="marker-label">
                {marker.label}
              </div>
            </div>
          ))}
        </div>
        
        {/* Value Indicator */}
        <div 
          className="timeline-value-indicator"
          style={{ left: `${valuePosition}%` }}
          aria-hidden="true"
        >
          <div className="value-indicator-line" />
          <div className="value-indicator-dot" />
        </div>
        
        {/* Range Input */}
        <input
          ref={sliderRef}
          type="range"
          min={currentMin}
          max={currentMax}
          value={localValue}
          onChange={handleSliderChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          disabled={disabled}
          className="timeline-slider"
          aria-label={`Year selector. Current value: ${localValue}`}
          aria-valuemin={currentMin}
          aria-valuemax={currentMax}
          aria-valuenow={localValue}
        />
      </div>
      
      {/* Helper Text */}
      <div className="timeline-helper-text">
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Drag to select year • Zooms to decade on interaction
        </span>
      </div>
    </div>
  );
};