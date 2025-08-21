
import React from 'react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { StopIcon } from './icons/StopIcon';

interface AudioPlayerProps {
  text: string;
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ text }) => {
  const {
    isPlaying,
    isPaused,
    play,
    pause,
    cancel,
    elapsed,
    duration,
    voices,
    selectedVoice,
    setSelectedVoice,
  } = useSpeechSynthesis(text);

  const progressPercentage = duration > 0 ? (elapsed / duration) * 100 : 0;

  return (
    <div className="w-full bg-slate-700/50 rounded-xl p-6 border border-slate-600 shadow-lg animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-4">
            <button
            onClick={cancel}
            className="p-3 rounded-full bg-slate-600/50 hover:bg-slate-600 transition-colors text-slate-300 hover:text-white disabled:opacity-50"
            aria-label="Stop"
            disabled={!isPlaying && !isPaused}
            >
            <StopIcon className="w-6 h-6" />
            </button>

            <button
            onClick={isPlaying ? pause : play}
            className="p-4 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-lg transform hover:scale-110 transition-transform"
            aria-label={isPlaying ? "Pause" : "Play"}
            >
            {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
            </button>
        </div>

        <div className="flex-grow flex flex-col justify-center w-full">
            <div className="w-full bg-slate-600 rounded-full h-2.5">
                <div 
                    className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-2.5 rounded-full transition-all duration-100 ease-linear" 
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-xs font-mono text-slate-400 mt-2">
                <span>{formatTime(elapsed)}</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>
      </div>
       <div className="mt-4">
            <label htmlFor="voice-select" className="text-xs text-slate-400 mr-2">Voice:</label>
            <select
                id="voice-select"
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                    const voice = voices.find(v => v.name === e.target.value);
                    if (voice) setSelectedVoice(voice);
                }}
                className="bg-slate-800 border border-slate-600 text-slate-300 text-xs rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-1"
            >
                {voices.map(voice => (
                    <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                    </option>
                ))}
            </select>
       </div>
       <div className="mt-4 max-h-40 overflow-y-auto p-4 bg-slate-800/50 rounded-lg text-slate-300 text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
        <h3 className="text-base font-semibold mb-2 text-slate-200">AI Generated Audio Script:</h3>
        <p>{text}</p>
      </div>
    </div>
  );
};
