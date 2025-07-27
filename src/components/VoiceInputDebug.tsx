import React from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { VoiceInputButton } from '@/components/ui/VoiceInputButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function VoiceInputDebug() {
  const {
    transcript,
    isListening,
    isSupported,
    audioLevel,
    error,
    permissionStatus,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const handleStart = () => {
    console.log('🎤 Debug: Starting voice input...');
    startListening();
  };

  const handleStop = () => {
    console.log('🛑 Debug: Stopping voice input...');
    stopListening();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Voice Input Debug
          <VoiceInputButton
            isListening={isListening}
            isSupported={isSupported}
            audioLevel={audioLevel}
            onStart={handleStart}
            onStop={handleStop}
            error={error}
            permissionStatus={permissionStatus}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Supported:</span>
            <Badge variant={isSupported ? "default" : "destructive"}>
              {isSupported ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Listening:</span>
            <Badge variant={isListening ? "default" : "secondary"}>
              {isListening ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Permission:</span>
            <Badge variant={
              permissionStatus === 'granted' ? "default" :
              permissionStatus === 'denied' ? "destructive" : "secondary"
            }>
              {permissionStatus}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Audio Level:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                style={{ width: `${audioLevel * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {(audioLevel * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {transcript && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-800 mb-1">Transcript:</p>
            <p className="text-sm text-blue-700">{transcript}</p>
            <button
              onClick={resetTranscript}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Clear transcript
            </button>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Check browser console for detailed logs</p>
          <p>• Requires HTTPS or localhost</p>
          <p>• Works best in Chrome, Edge, or Safari</p>
        </div>
      </CardContent>
    </Card>
  );
} 