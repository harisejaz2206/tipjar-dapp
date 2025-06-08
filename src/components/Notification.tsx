'use client';

import { useEffect } from 'react';
import { NotificationProps } from '@/types';

/**
 * Notification Component (Toast System)
 * 
 * This component creates toast-style notifications that:
 * - Slide in from the right side of the screen
 * - Auto-dismiss after 5 seconds
 * - Support different types (success, error, warning, info)
 * - Have appropriate colors and icons for each type
 * - Can be manually closed by clicking the X button
 * 
 * Common use cases:
 * - Transaction success/failure messages
 * - Wallet connection status
 * - Form validation errors
 * - General user feedback
 */
export default function Notification({ 
  type,      // 'success' | 'error' | 'warning' | 'info'
  message,   // The text to display
  isVisible, // Controls whether notification is shown
  onClose    // Callback when notification should be closed
}: NotificationProps) {

  /**
   * AUTO-DISMISS TIMER
   * 
   * Sets up a 5-second timer to automatically close the notification.
   * This improves UX by not requiring manual dismissal for every notification.
   * 
   * The timer is cleaned up if:
   * - Component unmounts
   * - isVisible changes to false
   * - Dependencies change
   */
  useEffect(() => {
    if (isVisible) {
      // Start 5-second countdown
      const timer = setTimeout(() => {
        onClose(); // Call parent's close handler
      }, 5000);

      // Cleanup function: cancel timer if component unmounts or deps change
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]); // Re-run effect if these values change

  /**
   * EARLY RETURN FOR HIDDEN STATE
   * 
   * If notification shouldn't be visible, render nothing.
   * This is more efficient than rendering with display:none.
   */
  if (!isVisible) return null;

  /**
   * DYNAMIC STYLING FUNCTION
   * 
   * Returns different styles and icons based on notification type.
   * This creates a consistent visual language:
   * - Green: Success (checkmark icon)
   * - Red: Error (X icon) 
   * - Yellow: Warning (triangle icon)
   * - Blue: Info (i icon)
   */
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500/20',        // Semi-transparent green background
          border: 'border-green-500/50', // Green border with opacity
          text: 'text-green-300',        // Light green text
          glow: 'glow-green',           // Custom CSS glow effect
          icon: (
            // Checkmark icon for success
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          ),
        };
      case 'error':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          text: 'text-red-300',
          glow: 'glow-red',
          icon: (
            // X icon for errors
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
            </svg>
          ),
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50',
          text: 'text-yellow-300',
          glow: 'glow-yellow',
          icon: (
            // Triangle warning icon
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          ),
        };
      case 'info':
      default: // Default to info if type is unrecognized
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/50',
          text: 'text-blue-300',
          glow: 'glow-blue',
          icon: (
            // Information icon
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          ),
        };
    }
  };

  // Get the styles for the current notification type
  const styles = getTypeStyles();

  /**
   * NOTIFICATION UI STRUCTURE
   * 
   * Layout:
   * - Fixed positioning in top-right corner
   * - Slide-in animation from right
   * - Glass morphism effect with backdrop blur
   * - Three-column layout: icon | message | close button
   */
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`
        glass rounded-xl p-4 border backdrop-blur-xl max-w-sm
        ${styles.bg} ${styles.border} ${styles.glow}
        transform transition-all duration-300 ease-out
        animate-pulse-glow
      `}>
        {/* Three-column flex layout */}
        <div className="flex items-start space-x-3">
          
          {/* LEFT COLUMN: Type-specific icon */}
          <div className={`flex-shrink-0 ${styles.text}`}>
            {styles.icon}
          </div>
          
          {/* MIDDLE COLUMN: Message text */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-rajdhani font-medium ${styles.text}`}>
              {message}
            </p>
          </div>
          
          {/* RIGHT COLUMN: Close button */}
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${styles.text} hover:text-white transition-colors duration-200`}
          >
            {/* Small X icon for closing */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 