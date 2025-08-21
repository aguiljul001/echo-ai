import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { GeneratorForm } from './components/TextInputForm';
import { AudioPlayer } from './components/AudioPlayer';
import { Loader } from './components/Loader';
import { Quiz } from './components/Quiz';
import { generateAudioScript } from './services/geminiService';
import type { QuizQuestion } from './types';

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
const URL_REGEX = /^(https?:\/\/)/;

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [summaryText, setSummaryText] = useState<string>('');
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New state for generation options
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [generateQuiz, setGenerateQuiz] = useState<boolean>(false);
  const [inputType, setInputType] = useState<'text' | 'url' | 'youtube'>('text');


  const handleGenerate = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Please paste some text or a valid URL to summarize.');
      return;
    }

    if (YOUTUBE_REGEX.test(inputText)) {
      setInputType('youtube');
    } else if (URL_REGEX.test(inputText)) {
      setInputType('url');
    } else {
      setInputType('text');
    }

    setIsLoading(true);
    setError(null);
    setSummaryText('');
    setQuizData(null);

    try {
      const result = await generateAudioScript(inputText, summaryLength, generateQuiz);
      setSummaryText(result.summary);
      if (result.quiz) {
        setQuizData(result.quiz);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, summaryLength, generateQuiz]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto">
        <Header />
        <main className="mt-8">
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700">
            <GeneratorForm
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onSubmit={handleGenerate}
              isLoading={isLoading}
              summaryLength={summaryLength}
              setSummaryLength={setSummaryLength}
              generateQuiz={generateQuiz}
              setGenerateQuiz={setGenerateQuiz}
            />

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-center">
                {error}
              </div>
            )}
            
            <div className="mt-6 min-h-[16rem] flex flex-col items-center justify-center gap-8">
              {isLoading ? (
                <Loader inputType={inputType} />
              ) : (
                <>
                  {summaryText && <AudioPlayer text={summaryText} />}
                  {quizData && <Quiz questions={quizData} />}
                </>
              )}
            </div>
          </div>
        </main>
        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Powered by Gemini AI. For informational purposes only.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;