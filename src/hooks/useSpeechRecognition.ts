import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  audioLevel: number;
  error: string | null;
  permissionStatus: 'unknown' | 'granted' | 'denied' | 'prompt';
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Extend the Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
    webkitAudioContext: typeof AudioContext;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Store the accumulated final transcript separately
  const finalTranscriptRef = useRef<string>('');

  // Enhanced browser support detection with detailed logging
  const detectSpeechSupport = useCallback(() => {
    console.log('🎤 Voice Input: Detecting browser support...');
    
    if (typeof window === 'undefined') {
      console.log('❌ Voice Input: Window is undefined (SSR environment)');
      return false;
    }

    const hasSpeechRecognition = 'SpeechRecognition' in window;
    const hasWebkitSpeechRecognition = 'webkitSpeechRecognition' in window;
    
    console.log('🔍 Voice Input: Browser capabilities:', {
      SpeechRecognition: hasSpeechRecognition,
      webkitSpeechRecognition: hasWebkitSpeechRecognition,
      userAgent: navigator.userAgent,
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol
    });

    if (!hasSpeechRecognition && !hasWebkitSpeechRecognition) {
      console.log('❌ Voice Input: Speech Recognition API not available in this browser');
      console.log('💡 Voice Input: Try using Chrome, Edge, or Safari for voice input support');
      return false;
    }

    if (!window.isSecureContext) {
      console.log('❌ Voice Input: Not in secure context (HTTPS required)');
      console.log('💡 Voice Input: Voice input requires HTTPS or localhost');
      return false;
    }

    console.log('✅ Voice Input: Browser supports Speech Recognition API');
    return true;
  }, []);

  const isSupported = detectSpeechSupport();

  // Check microphone permissions
  const checkMicrophonePermissions = useCallback(async () => {
    console.log('🎤 Voice Input: Checking microphone permissions...');
    
    try {
      if (!navigator.permissions) {
        console.log('⚠️ Voice Input: Permissions API not available');
        setPermissionStatus('unknown');
        return;
      }

      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      console.log('🔐 Voice Input: Microphone permission status:', permission.state);
      setPermissionStatus(permission.state as 'unknown' | 'granted' | 'denied' | 'prompt');

      permission.addEventListener('change', () => {
        console.log('🔄 Voice Input: Permission status changed to:', permission.state);
        setPermissionStatus(permission.state as 'unknown' | 'granted' | 'denied' | 'prompt');
      });
    } catch (err) {
      console.log('⚠️ Voice Input: Could not check microphone permissions:', err);
      setPermissionStatus('unknown');
    }
  }, []);

  useEffect(() => {
    if (isSupported) {
      checkMicrophonePermissions();
    }
  }, [isSupported, checkMicrophonePermissions]);

  const initializeAudioContext = useCallback(async () => {
    console.log('🎵 Voice Input: Initializing audio context...');
    
    try {
      console.log('📱 Voice Input: Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Voice Input: Microphone access granted');
      
      // Use proper typing for WebKit audio context
      const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContextConstructor();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      microphoneRef.current.connect(analyserRef.current);
      
      console.log('🎵 Voice Input: Audio context initialized successfully');
      setPermissionStatus('granted');
      
      const updateAudioLevel = () => {
        if (analyserRef.current && dataArrayRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          
          // Calculate average audio level
          const average = dataArrayRef.current.reduce((sum, value) => sum + value, 0) / dataArrayRef.current.length;
          const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1
          
          setAudioLevel(normalizedLevel);
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (err: unknown) {
      console.error('❌ Voice Input: Error accessing microphone:', err);
      
      const error = err as { name?: string; message?: string };
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setError('Microphone access denied. Please allow microphone permissions and try again.');
        setPermissionStatus('denied');
        console.log('🚫 Voice Input: User denied microphone permission');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
        console.log('🎤 Voice Input: No microphone device found');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setError('Microphone is already in use by another application.');
        console.log('🔒 Voice Input: Microphone already in use');
      } else {
        setError(`Microphone error: ${error.message || 'Unknown error'}`);
        console.log('❌ Voice Input: Unknown microphone error:', err);
      }
    }
  }, [isListening]);

  const startListening = useCallback(() => {
    console.log('🎤 Voice Input: Starting speech recognition...');
    
    if (!isSupported) {
      const errorMsg = 'Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.';
      setError(errorMsg);
      console.log('❌ Voice Input:', errorMsg);
      return;
    }

    setError(null);
    setIsListening(true);
    
    // Reset transcript state when starting
    finalTranscriptRef.current = '';
    setTranscript('');

    try {
      // Initialize speech recognition
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionConstructor();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      console.log('🔧 Voice Input: Speech recognition configured:', {
        continuous: recognitionRef.current.continuous,
        interimResults: recognitionRef.current.interimResults,
        lang: recognitionRef.current.lang
      });

      recognitionRef.current.onstart = () => {
        console.log('✅ Voice Input: Speech recognition started');
        setIsListening(true);
        initializeAudioContext();
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        console.log('📝 Voice Input: Speech recognition result received');
        
        // Build complete transcript from all results
        let fullFinalTranscript = '';
        let fullInterimTranscript = '';

        // Process all results from the beginning
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const resultTranscript = result[0].transcript;
          
          if (result.isFinal) {
            fullFinalTranscript += resultTranscript;
            console.log('✅ Voice Input: Final result:', resultTranscript);
          } else {
            fullInterimTranscript += resultTranscript;
            console.log('⏳ Voice Input: Interim result:', resultTranscript);
          }
        }

        // Update the final transcript ref if we have new final results
        if (fullFinalTranscript !== finalTranscriptRef.current) {
          finalTranscriptRef.current = fullFinalTranscript;
          console.log('💾 Voice Input: Updated final transcript:', fullFinalTranscript);
        }

        // Set the display transcript (final + interim)
        const displayTranscript = finalTranscriptRef.current + fullInterimTranscript;
        setTranscript(displayTranscript);
        
        console.log('📄 Voice Input: Display transcript:', {
          final: finalTranscriptRef.current,
          interim: fullInterimTranscript,
          display: displayTranscript
        });
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('❌ Voice Input: Speech recognition error:', event.error, event.message);
        
        let userFriendlyError = '';
        switch (event.error) {
          case 'no-speech':
            userFriendlyError = 'No speech detected. Please try speaking closer to the microphone.';
            break;
          case 'audio-capture':
            userFriendlyError = 'Microphone not accessible. Please check your microphone connection.';
            break;
          case 'not-allowed':
            userFriendlyError = 'Microphone access denied. Please allow microphone permissions in your browser settings.';
            setPermissionStatus('denied');
            break;
          case 'network':
            userFriendlyError = 'Network error occurred. Please check your internet connection.';
            break;
          case 'service-not-allowed':
            userFriendlyError = 'Speech recognition service not allowed. Please try again.';
            break;
          default:
            userFriendlyError = `Speech recognition error: ${event.error}`;
        }
        
        setError(userFriendlyError);
        setIsListening(false);
        setAudioLevel(0);
      };

      recognitionRef.current.onend = () => {
        console.log('🔚 Voice Input: Speech recognition ended');
        setIsListening(false);
        setAudioLevel(0);
        
        // Cleanup audio context
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      console.log('🚀 Voice Input: Starting speech recognition...');
      recognitionRef.current.start();
    } catch (err: unknown) {
      console.error('❌ Voice Input: Failed to start speech recognition:', err);
      const error = err as { message?: string };
      setError(`Failed to start voice input: ${error.message || 'Unknown error'}`);
      setIsListening(false);
    }
  }, [isSupported, initializeAudioContext]);

  const stopListening = useCallback(() => {
    console.log('⏹️ Voice Input: Stopping speech recognition...');
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setAudioLevel(0);
    
    // Cleanup
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    console.log('✅ Voice Input: Speech recognition stopped');
  }, []);

  const resetTranscript = useCallback(() => {
    console.log('🔄 Voice Input: Resetting transcript');
    setTranscript('');
    finalTranscriptRef.current = '';
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Voice Input: Cleaning up on unmount');
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Log current state on changes
  useEffect(() => {
    console.log('📊 Voice Input: State update:', {
      isSupported,
      isListening,
      permissionStatus,
      hasError: !!error,
      transcriptLength: transcript.length,
      audioLevel: audioLevel.toFixed(2),
      finalTranscriptLength: finalTranscriptRef.current.length
    });
  }, [isSupported, isListening, permissionStatus, error, transcript.length, audioLevel]);

  return {
    transcript,
    isListening,
    isSupported,
    audioLevel,
    error,
    permissionStatus,
    startListening,
    stopListening,
    resetTranscript,
  };
}; 