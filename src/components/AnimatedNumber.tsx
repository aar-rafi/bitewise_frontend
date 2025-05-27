import { useEffect, useState, useRef } from "react";

interface AnimatedNumberProps {
  value: string | number | undefined;
  suffix?: string;
  className?: string;
  duration?: number;
}

export default function AnimatedNumber({
  value,
  suffix = "",
  className = "",
  duration = 500,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number>();
  const lastValueRef = useRef<number>(0);

  const numericValue =
    typeof value === "string" ? parseFloat(value) || 0 : value || 0;

  useEffect(() => {
    // Don't animate if the value hasn't actually changed
    if (numericValue === lastValueRef.current) return;

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setIsAnimating(true);
    const startValue = displayValue;
    const endValue = numericValue;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeProgress = progress * (2 - progress); // Ease out

      const currentValue = startValue + (endValue - startValue) * easeProgress;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        lastValueRef.current = numericValue;
        animationRef.current = undefined;
      }
    };

    lastValueRef.current = numericValue;
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [numericValue, duration]); // Removed displayValue from dependencies

  // Initialize display value on first render
  useEffect(() => {
    if (lastValueRef.current === 0 && numericValue > 0) {
      setDisplayValue(numericValue);
      lastValueRef.current = numericValue;
    }
  }, [numericValue]);

  const formatValue = (val: number) => {
    // Round to appropriate decimal places
    if (val >= 1000) {
      return Math.round(val).toLocaleString();
    } else if (val >= 10) {
      return Math.round(val * 10) / 10;
    } else {
      return Math.round(val * 100) / 100;
    }
  };

  return (
    <span
      className={`${className} ${
        isAnimating ? "transition-all duration-300" : ""
      }`}
    >
      {formatValue(displayValue)}
      {suffix}
    </span>
  );
}
