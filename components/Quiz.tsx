
import React, { useState } from 'react';
import type { QuizQuestion } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';

interface QuizProps {
  questions: QuizQuestion[];
}

export const Quiz: React.FC<QuizProps> = ({ questions }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectAnswer = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
  }

  const allAnswered = Object.keys(selectedAnswers).length === questions.length;

  return (
    <div className="w-full bg-slate-700/50 rounded-xl p-6 border border-slate-600 shadow-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-4">
        Test Your Knowledge
      </h2>
      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={index}>
            <p className="font-semibold text-slate-200">{index + 1}. {q.question}</p>
            <div className="mt-3 space-y-2">
              {q.options.map(option => {
                const isSelected = selectedAnswers[index] === option;
                const isCorrect = q.correctAnswer === option;
                
                let optionClass = "border-slate-600 bg-slate-800/60 hover:bg-slate-700/80";
                if (showResults) {
                  if (isCorrect) {
                    optionClass = "border-green-500/50 bg-green-500/20 text-green-300";
                  } else if (isSelected && !isCorrect) {
                    optionClass = "border-red-500/50 bg-red-500/20 text-red-400";
                  }
                } else if (isSelected) {
                    optionClass = "border-indigo-500 bg-indigo-500/30";
                }

                return (
                  <label key={option} className={`flex items-center w-full p-3 rounded-lg border transition-all duration-200 cursor-pointer ${optionClass}`}>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={isSelected}
                      onChange={() => handleSelectAnswer(index, option)}
                      disabled={showResults}
                      className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-600 ring-offset-gray-800 focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-slate-300">{option}</span>
                    {showResults && (
                        <div className="ml-auto">
                            {isCorrect && <CheckIcon className="w-5 h-5 text-green-400" />}
                            {isSelected && !isCorrect && <XIcon className="w-5 h-5 text-red-400" />}
                        </div>
                    )}
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        {showResults ? (
             <button
                onClick={handleReset}
                className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Try Again
            </button>
        ) : (
            <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Check Answers
            </button>
        )}
      </div>
    </div>
  );
};
