import React from 'react';
import { Mic, MicOff, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceInputButtonProps {
  isListening: boolean;
  isSupported: boolean;
  audioLevel: number;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
  error?: string | null;
  permissionStatus?: string;
}

export function VoiceInputButton({
  isListening,
  isSupported,
  audioLevel,
  onStart,
  onStop,
  disabled = false,
  error,
  permissionStatus = 'unknown',
}: VoiceInputButtonProps) {
  // Log button state for debugging
  React.useEffect(() => {
    console.log('🎛️ VoiceInputButton: State update:', {
      isSupported,
      isListening,
      disabled,
      permissionStatus,
      hasError: !!error,
      audioLevel: audioLevel.toFixed(2)
    });
  }, [isSupported, isListening, disabled, error, permissionStatus, audioLevel]);

  // Handle unsupported browsers
  if (!isSupported) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          disabled={true}
          className="flex-shrink-0 h-12 w-12 rounded-full border-2 border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed transition-all duration-300"
          title="Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari."
        >
          <MicOff className="h-5 w-5 text-gray-500" />
        </Button>
      </div>
    );
  }

  // Handle permission denied
  if (permissionStatus === 'denied') {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={onStart} // Allow retry
          disabled={disabled}
          className="flex-shrink-0 h-12 w-12 rounded-full border-2 border-red-300 bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-600 hover:text-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          title="Microphone access denied. Click to retry and allow microphone permissions in your browser."
        >
          <Lock className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  // Handle errors
  if (error && !isListening) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={onStart} // Allow retry
          disabled={disabled}
          className="flex-shrink-0 h-12 w-12 rounded-full border-2 border-orange-300 bg-gradient-to-br from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 text-orange-600 hover:text-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          title={`Error: ${error}. Click to retry.`}
        >
          <AlertCircle className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  const handleClick = () => {
    console.log('🎤 VoiceInputButton: Button clicked, current state:', { isListening });
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  // Calculate dynamic scales based on audio level
  const baseScale = isListening ? 1.05 : 1;
  const pulseScale = baseScale + (audioLevel * 0.15); // Subtle scaling based on audio
  const ringScale1 = 1 + (audioLevel * 0.4); // First ring
  const ringScale2 = 1 + (audioLevel * 0.6); // Second ring
  const ringScale3 = 1 + (audioLevel * 0.8); // Third ring

  // Determine button title based on state
  const getButtonTitle = () => {
    if (error) return error;
    if (isListening) return "Click to stop recording";
    if (permissionStatus === 'prompt') return "Click to start voice input (microphone permission will be requested)";
    return "Click to start voice input";
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Animated Rings - Multiple layers for depth */}
      {isListening && (
        <>
          {/* Outermost Ring */}
          <div
            className="absolute inset-0 rounded-full bg-red-500/15 animate-ping"
            style={{
              transform: `scale(${ringScale3})`,
              transition: 'transform 0.1s ease-out',
              animationDuration: '2s',
            }}
          />
          
          {/* Middle Ring */}
          <div
            className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse"
            style={{
              transform: `scale(${ringScale2})`,
              transition: 'transform 0.1s ease-out',
              animationDuration: '1.5s',
            }}
          />
          
          {/* Inner Ring */}
          <div
            className="absolute inset-0 rounded-full bg-red-500/25"
            style={{
              transform: `scale(${ringScale1})`,
              transition: 'transform 0.1s ease-out',
            }}
          />
        </>
      )}

      {/* Main Button */}
      <Button
        size="sm"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "flex-shrink-0 h-11 w-11 rounded-full border-0 transition-all duration-300 ease-out shadow-lg hover:shadow-2xl relative z-10 overflow-hidden",
          // Default state - Beautiful blue gradient
          !isListening && "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white",
          // Recording state - Vibrant red gradient (no pulse animation)
          isListening && "bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white",
          // Error states
          error && !isListening && "from-red-400 to-red-600",
          permissionStatus === 'denied' && "from-red-400 to-red-600"
        )}
        style={{
          transform: `scale(${pulseScale})`,
          transition: isListening 
            ? 'transform 0.1s ease-out, box-shadow 0.3s ease-out' 
            : 'all 0.3s ease-out',
          boxShadow: isListening 
            ? `0 0 30px rgba(239, 68, 68, 0.4), 0 0 60px rgba(239, 68, 68, 0.2)` 
            : '0 4px 20px rgba(59, 130, 246, 0.3)',
        }}
        title={getButtonTitle()}
      >
        {/* Background shimmer effect - removed for cleaner look */}
        
        {/* Icon */}
        <Mic 
          className="h-11 w-11 relative z-10 transition-all duration-200" 
        />
      </Button>

      {/* Audio Level Bars - Enhanced with gradient */}
      {isListening && (
        <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex items-end space-x-1 h-8">
          {[...Array(5)].map((_, i) => {
            const barHeight = Math.max(6, (audioLevel > (i + 1) * 0.2 ? (i + 1) * 6 + 8 : 6));
            const isActive = audioLevel > (i + 1) * 0.2;
            
            return (
              <div
                key={i}
                className={cn(
                  "w-1.5 rounded-full transition-all duration-150 ease-out",
                  isActive 
                    ? "bg-gradient-to-t from-red-600 to-red-400 opacity-100 shadow-sm" 
                    : "bg-red-300 opacity-40"
                )}
                style={{
                  height: `${barHeight}px`,
                  animation: isActive ? 'pulse 0.5s infinite alternate' : 'none'
                }}
              />
            );
          })}
        </div>
      )}

      {/* Status Indicators */}
      {isListening && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full animate-pulse border-2 border-white shadow-lg">
          <div className="w-full h-full bg-red-500 rounded-full animate-ping opacity-75" />
        </div>
      )}

      {/* Permission/Error Status Dots */}
      {permissionStatus === 'denied' && !isListening && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full border-2 border-white shadow-lg" />
      )}
      
      {error && !isListening && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-2 border-white shadow-lg animate-bounce" />
      )}
    </div>
  );
} 