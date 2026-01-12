import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (url: string, volume?: number) => void;
  playNotificationSound: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within SoundProvider');
  }
  return context;
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(() => {
    // Load mute preference from localStorage
    const saved = localStorage.getItem('hollywoodtycoon_muted');
    return saved === 'true';
  });

  // Audio context for generating sounds
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newValue = !prev;
      localStorage.setItem('hollywoodtycoon_muted', String(newValue));
      return newValue;
    });
  }, []);

  const playSound = useCallback((url: string, volume: number = 0.3) => {
    if (isMuted) return;

    try {
      const audio = new Audio(url);
      audio.volume = volume;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (err) {
      console.log('Audio creation failed:', err);
    }
  }, [isMuted]);

  // Play a Windows XP-style notification chime using Web Audio API
  const playNotificationSound = useCallback(() => {
    if (isMuted) return;

    try {
      const ctx = getAudioContext();

      // Resume context if suspended (required for user gesture)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Create gain node for volume control
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      // Play two quick ascending tones (Windows XP notification style)
      const frequencies = [523.25, 659.25]; // C5, E5

      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        osc.connect(gainNode);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.15);
      });
    } catch (err) {
      console.log('Notification sound failed:', err);
    }
  }, [isMuted, getAudioContext]);

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, playSound, playNotificationSound }}>
      {children}
    </SoundContext.Provider>
  );
};
