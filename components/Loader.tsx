import React from 'react';

interface LoaderProps {
  inputType?: 'text' | 'url' | 'youtube';
}

const messages = {
  text: 'AI is crafting your summary...',
  url: 'AI is reading the article...',
  youtube: 'AI is analyzing your video...',
};

export const Loader: React.FC<LoaderProps> = ({ inputType = 'text' }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4" aria-label="Loading content">
      <div className="w-16 h-16 border-4 border-t-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin"></div>
      <p className="text-slate-400">{messages[inputType]}</p>
    </div>
  );
};
