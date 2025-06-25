import React, { useState, useEffect } from 'react';
import NutritionLoadingAnimation from './NutritionLoadingAnimation';

interface LoadingStep {
  id: string;
  label: string;
  duration: number;
}

const LOADING_STEPS: LoadingStep[] = [
  { id: 'auth', label: 'Authenticating user...', duration: 800 },
  { id: 'profile', label: 'Loading profile data...', duration: 600 },
  { id: 'nutrition', label: 'Fetching nutrition goals...', duration: 700 },
  { id: 'intakes', label: 'Loading today\'s intakes...', duration: 900 },
  { id: 'stats', label: 'Calculating statistics...', duration: 500 },
  { id: 'dashboard', label: 'Preparing dashboard...', duration: 400 },
];

interface ProgressiveLoadingAnimationProps {
  message?: string;
  onComplete?: () => void;
  autoStart?: boolean;
}

const ProgressiveLoadingAnimation: React.FC<ProgressiveLoadingAnimationProps> = ({
  message,
  onComplete,
  autoStart = true,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(message || LOADING_STEPS[0].label);

  useEffect(() => {
    if (!autoStart) return;

    let stepIndex = 0;
    let progressValue = 0;
    const totalSteps = LOADING_STEPS.length;

    const processStep = () => {
      if (stepIndex >= totalSteps) {
        setProgress(100);
        setTimeout(() => {
          onComplete?.();
        }, 300);
        return;
      }

      const step = LOADING_STEPS[stepIndex];
      setCurrentMessage(step.label);
      setCurrentStep(stepIndex);

      const stepProgress = (stepIndex / totalSteps) * 100;
      const nextStepProgress = ((stepIndex + 1) / totalSteps) * 100;

      // Animate progress for this step
      const startProgress = stepProgress;
      const endProgress = nextStepProgress;
      const duration = step.duration;
      const startTime = Date.now();

      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);
        
        // Use easing function for smooth animation
        const easedProgress = 0.5 * (1 - Math.cos(progressRatio * Math.PI));
        const currentProgress = startProgress + (endProgress - startProgress) * easedProgress;
        
        setProgress(currentProgress);

        if (progressRatio < 1) {
          requestAnimationFrame(animateProgress);
        } else {
          stepIndex++;
          setTimeout(processStep, 100);
        }
      };

      animateProgress();
    };

    const timer = setTimeout(processStep, 100);
    return () => clearTimeout(timer);
  }, [autoStart, onComplete]);

  return (
    <NutritionLoadingAnimation
      message={currentMessage}
      progress={progress}
      showProgress={true}
    />
  );
};

export default ProgressiveLoadingAnimation; 