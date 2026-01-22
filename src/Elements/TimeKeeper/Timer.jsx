import { useState, useEffect, useRef } from "react";

const Timer = ({ isRunning, reset, startTime }) => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  // Calculate and set initial elapsed time when startTime is provided
  useEffect(() => {
    if (startTime && isRunning) {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const startTimeInSeconds = Math.floor(
        new Date(startTime).getTime() / 1000,
      );
      const elapsedSeconds = nowInSeconds - startTimeInSeconds;
      setSeconds(elapsedSeconds);
    }
  }, [startTime, isRunning]);

  // Handle start/stop based on isRunning prop
  useEffect(() => {
    if (isRunning) {
      // Start the timer
      if (intervalRef.current === null) {
        intervalRef.current = setInterval(() => {
          setSeconds((prevSeconds) => prevSeconds + 1);
        }, 1000);
      }
    } else {
      // Stop the timer
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Handle reset
  useEffect(() => {
    if (reset) {
      setSeconds(0);
    }
  }, [reset]);

  // Format time for display (e.g., MM:SS or HH:MM:SS)
  const formatTime = (secs) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const remainingSeconds = secs % 60;

    if (hours > 0) {
      return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
    }
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div>
      <p>{formatTime(seconds)}</p>
    </div>
  );
};

export default Timer;
