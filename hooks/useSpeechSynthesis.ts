
import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechSynthesis = (text: string) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);


  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const handleVoicesChanged = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (!selectedVoice && availableVoices.length > 0) {
        const defaultVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
        setSelectedVoice(defaultVoice);
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    handleVoicesChanged(); 

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, []); // Run once

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    const words = text.split(/\s+/).length;
    const estimatedDuration = Math.ceil(words / 2.5); // Adjusted WPM for clarity
    setDuration(estimatedDuration);

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setElapsed(0);
      intervalRef.current = window.setInterval(() => {
        setElapsed(prev => {
            if(prev < estimatedDuration) return prev + 1;
            clearInterval(intervalRef.current!);
            return estimatedDuration;
        });
      }, 1000);
    };

    utterance.onpause = () => {
      setIsPlaying(false);
      setIsPaused(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    utterance.onresume = () => {
      setIsPlaying(true);
      setIsPaused(false);
      intervalRef.current = window.setInterval(() => {
        setElapsed(prev => {
            if(prev < estimatedDuration) return prev + 1;
            clearInterval(intervalRef.current!);
            return estimatedDuration;
        });
      }, 1000);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setElapsed(estimatedDuration);
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Reset to beginning
      setTimeout(() => setElapsed(0), 500);
    };

    utteranceRef.current = utterance;

    return () => {
      cleanup();
    };
  }, [text, selectedVoice, cleanup]);

  const play = useCallback(() => {
    if (utteranceRef.current) {
      if (isPaused) {
        window.speechSynthesis.resume();
      } else {
        cleanup(); // Cancel any previous speech
        setElapsed(0);
        window.speechSynthesis.speak(utteranceRef.current);
      }
    }
  }, [isPaused, cleanup]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
  }, []);

  const cancel = useCallback(() => {
    cleanup();
    setIsPlaying(false);
    setIsPaused(false);
    setElapsed(0);
  }, [cleanup]);

  return { isPlaying, isPaused, play, pause, cancel, elapsed, duration, voices, selectedVoice, setSelectedVoice };
};
