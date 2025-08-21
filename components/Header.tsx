
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
        Info-to-Audio AI
      </h1>
      <p className="mt-3 text-lg text-slate-400 max-w-xl mx-auto">
        Paste any article or text below and our AI will transform it into a learnable audio summary.
      </p>
    </header>
  );
};
