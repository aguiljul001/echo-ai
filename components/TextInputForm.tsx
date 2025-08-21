import React from 'react';
import { PlayIcon } from './icons/PlayIcon';

type SummaryLength = 'short' | 'medium' | 'long';

interface GeneratorFormProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  summaryLength: SummaryLength;
  setSummaryLength: (length: SummaryLength) => void;
  generateQuiz: boolean;
  setGenerateQuiz: (generate: boolean) => void;
}

const LengthOption: React.FC<{
    length: SummaryLength,
    current: SummaryLength,
    setLength: (length: SummaryLength) => void,
    children: React.ReactNode,
    disabled: boolean,
}> = ({ length, current, setLength, children, disabled }) => (
    <button
        onClick={() => setLength(length)}
        disabled={disabled}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 ${
            current === length 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
        }`}
    >
        {children}
    </button>
);


export const GeneratorForm: React.FC<GeneratorFormProps> = ({ 
    value, 
    onChange, 
    onSubmit, 
    isLoading,
    summaryLength,
    setSummaryLength,
    generateQuiz,
    setGenerateQuiz
}) => {
  return (
    <div>
      <label htmlFor="article-text" className="block text-sm font-medium text-slate-400 mb-2">
        Paste your content here
      </label>
      <textarea
        id="article-text"
        rows={8}
        className="w-full bg-slate-900/70 border border-slate-700 rounded-lg p-4 text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none placeholder-slate-500"
        placeholder="Paste text, an article URL, or a YouTube link..."
        value={value}
        onChange={onChange}
        disabled={isLoading}
        aria-label="Content input"
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Summary Length
          </label>
          <div className="flex space-x-2 bg-slate-800/70 p-1 rounded-lg">
            <LengthOption length="short" current={summaryLength} setLength={setSummaryLength} disabled={isLoading}>Short</LengthOption>
            <LengthOption length="medium" current={summaryLength} setLength={setSummaryLength} disabled={isLoading}>Medium</LengthOption>
            <LengthOption length="long" current={summaryLength} setLength={setSummaryLength} disabled={isLoading}>Long</LengthOption>
          </div>
        </div>
        <div className="flex items-center justify-start md:justify-end h-full">
            <label htmlFor="generate-quiz" className="flex items-center cursor-pointer select-none">
                <input
                    type="checkbox"
                    id="generate-quiz"
                    checked={generateQuiz}
                    onChange={(e) => setGenerateQuiz(e.target.checked)}
                    disabled={isLoading}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="ml-3 text-sm font-medium text-slate-300">
                    Generate Quiz
                </span>
            </label>
        </div>
      </div>


      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="mt-6 w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        aria-live="polite"
      >
        <PlayIcon className="w-6 h-6" />
        {isLoading ? 'Generating Summary...' : 'Generate Audio'}
      </button>
    </div>
  );
};