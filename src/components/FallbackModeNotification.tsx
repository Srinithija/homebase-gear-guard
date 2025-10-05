import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, RefreshCw, AlertTriangle } from "lucide-react";

interface FallbackModeNotificationProps {
  show?: boolean;
  onDismiss?: () => void;
}

export const FallbackModeNotification: React.FC<FallbackModeNotificationProps> = ({ 
  show = true, 
  onDismiss 
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const handleRetry = async () => {
    setIsRetrying(true);
    // Wait a moment and reload the page to retry API connection
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4">
      <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between w-full">
          <div className="flex-1">
            <p className="font-medium">📱 Offline Mode Active</p>
            <p className="text-sm mt-1">
              Using local storage. Data will sync when connection is restored.
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isRetrying}
              className="text-xs"
            >
              {isRetrying ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Retry
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-xs p-1 h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Hook to detect if we're in fallback mode
export const useFallbackMode = () => {
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  useEffect(() => {
    // Check if we're using localhost API in production (indicates fallback mode)
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiUrl = import.meta.env.VITE_API_URL || 
      (isDev ? 'http://localhost:3001/api' : 'https://homebase-gear-guard.onrender.com/api');
    
    const isInFallbackMode = !isDev && apiUrl.includes('localhost');
    setIsFallbackMode(isInFallbackMode);

    // Also listen for API errors that might indicate fallback mode
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('Content Security Policy') || 
          event.message.includes('Failed to fetch')) {
        setIsFallbackMode(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return isFallbackMode;
};