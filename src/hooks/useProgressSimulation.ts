import { useState, useEffect } from 'react';

interface ProgressStage {
  percentage: number;
  message: string;
  duration: number; // in milliseconds
}

const progressStages: ProgressStage[] = [
  { percentage: 0, message: "Uploading resume...", duration: 1500 },
  { percentage: 15, message: "Extracting text from document...", duration: 2500 },
  { percentage: 30, message: "Analyzing with AI...", duration: 5000 },
  { percentage: 60, message: "Processing recommendations...", duration: 2500 },
  { percentage: 85, message: "Finalizing results...", duration: 1000 },
  { percentage: 100, message: "Analysis complete!", duration: 0 }
];

export function useProgressSimulation() {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(progressStages[0].message);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentStage >= progressStages.length - 1) {
      setIsComplete(true);
      return;
    }

    const stage = progressStages[currentStage];
    const nextStage = progressStages[currentStage + 1];
    
    setMessage(stage.message);

    // Smoothly animate progress from current to next percentage
    const startProgress = stage.percentage;
    const endProgress = nextStage.percentage;
    const progressDiff = endProgress - startProgress;
    const animationDuration = stage.duration;
    const steps = 30; // Number of animation frames
    const stepDuration = animationDuration / steps;
    
    let step = 0;
    const animateProgress = () => {
      if (step <= steps) {
        const easeOutQuart = 1 - Math.pow(1 - step / steps, 4); // Smooth easing
        const currentProgress = startProgress + (progressDiff * easeOutQuart);
        setProgress(Math.round(currentProgress));
        
        step++;
        setTimeout(animateProgress, stepDuration);
      } else {
        // Move to next stage
        setTimeout(() => {
          setCurrentStage(prev => prev + 1);
        }, 100);
      }
    };

    const timer = setTimeout(animateProgress, 100);

    return () => clearTimeout(timer);
  }, [currentStage]);

  const reset = () => {
    setCurrentStage(0);
    setProgress(0);
    setMessage(progressStages[0].message);
    setIsComplete(false);
  };

  return {
    progress,
    message,
    isComplete,
    reset
  };
}