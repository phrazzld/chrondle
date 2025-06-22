'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  children,
  className = ''
}) => {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle show/hide animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to trigger the show animation
      const timer = setTimeout(() => {
        const content = document.querySelector('.modal-content.show-prep');
        if (content) {
          content.classList.add('show');
        }
      }, 10);
      return () => clearTimeout(timer);
    } else {
      // Remove show class first, then hide after transition
      const content = document.querySelector('.modal-content.show');
      if (content) {
        content.classList.remove('show');
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 300);
        return () => clearTimeout(timer);
      } else {
        setIsVisible(false);
      }
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!mounted || !isVisible) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 modal-content show-prep transition-all duration-300 transform scale-95 opacity-0 ${className}`}>
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};