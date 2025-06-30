'use client';

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Animated theme toggle button with smooth transitions
 * Switches between light and dark mode with delightful animations
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Icon size based on the size prop
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  
  // Button size based on the size prop
  const buttonSize = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';

  // Handle click: toggle theme and remove focus
  const handleClick = () => {
    toggleDarkMode();
    buttonRef.current?.blur(); // Remove focus ring after click
  };

  return (
    <motion.button
      ref={buttonRef}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={cn(
        // Base button styles - fully rounded ghost button
        buttonSize,
        "rounded-full",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "transition-colors duration-200",
        "flex items-center justify-center",
        "group relative",
        className
      )}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: darkMode ? 0 : 45,
          scale: darkMode ? 0.9 : 1 
        }}
        transition={{ 
          duration: 0.3, 
          ease: "easeInOut",
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        className="flex items-center justify-center"
      >
        {darkMode ? (
          <Moon className={cn(iconSize, "text-foreground")} />
        ) : (
          <Sun className={cn(iconSize, "text-foreground")} />
        )}
      </motion.div>
      
      {/* Subtle hover effect overlay - perfect circle */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/10 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        aria-hidden="true"
      />
    </motion.button>
  );
};