import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
const URL_REGEX = /^(https?:\/\/)/;


export interface GenerationResult {
  summary: string;
  quiz?: QuizQuestion[];
}

export async function generateAudioScript(
  text: string,
  length: 'short' | 'medium' | 'long',
  generateQuiz: boolean
): Promise<GenerationResult> {
  const lengthInstruction = {
    short: 'a concise, 2-minute audio script',
    medium: 'a detailed, 5-minute audio script',
    long: 'an in-depth, 10+ minute audio script',
  };

  const isYoutubeVideo = YOUTUBE_REGEX.test(text);
  const isUrl = !isYoutubeVideo && URL_REGEX.test(text);

  try {
    if (isYoutubeVideo || isUrl) {
      const contentType = isYoutubeVideo ? "YouTube video" : "web page";
      let prompt = `You are an expert in synthesizing information. Your task is to analyze the content of the ${contentType} at the following URL and transform it into ${lengthInstruction[length]}.
The script should be structured as an informative audio clip, like a mini-podcast segment, focusing on the most crucial points and key takeaways.
URL: ${text}

Your entire response MUST be structured with the following markers. Do not include any other text outside these markers.
SUMMARY_START
[The generated audio script text, in a conversational podcast style.]
SUMMARY_END`;

      if (generateQuiz) {
        prompt += `
QUIZ_START
[A valid JSON array of 3-5 multiple-choice quiz questions based on the summary. Each object in the array must have keys "question" (string), "options" (array of strings), and "correctAnswer" (a string that exactly matches one of the items in 'options').]
QUIZ_END`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const responseText = response.text;
      
      const summaryMatch = responseText.match(/SUMMARY_START([\s\S]*?)SUMMARY_END/);
      const summary = summaryMatch ? summaryMatch[1].trim() : '';
      
      if (!summary) {
        console.error("Could not parse summary from AI response:", responseText);
        throw new Error("Could not find a summary in the AI's response.");
      }

      let quiz: QuizQuestion[] | undefined = undefined;
      if (generateQuiz) {
        const quizMatch = responseText.match(/QUIZ_START([\s\S]*?)QUIZ_END/);
        if (quizMatch && quizMatch[1]) {
          try {
            quiz = JSON.parse(quizMatch[1].trim());
          } catch(e) {
            console.error("Failed to parse quiz JSON:", quizMatch[1].trim());
            // Don't throw error, just proceed without quiz
          }
        }
      }
      return { summary, quiz };
      
    } else {
      // Existing logic for text input
      let prompt = `You are an expert in synthesizing information. Your task is to transform the following text into ${lengthInstruction[length]}.
The script should be structured as an informative audio clip, like a mini-podcast segment.
Focus on the most crucial points, key takeaways, and present them in a clear, narrative, and easily understandable format.
The output should be ready for a text-to-speech engine.

Here is the text to process:
---
${text}
---
`;
      if (generateQuiz) {
        prompt += `\nAdditionally, create a short quiz with 3-5 multiple-choice questions based on the summary to help with memory retention. For each question, provide a few options and indicate the correct answer.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: {
                  type: Type.STRING,
                  description: "The generated audio script text, in a conversational podcast style."
                },
                quiz: {
                  type: Type.ARRAY,
                  description: "An array of 3-5 quiz questions based on the summary.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      correctAnswer: { type: Type.STRING, description: "One of the strings from the 'options' array." }
                    },
                    required: ["question", "options", "correctAnswer"]
                  }
                }
              },
              required: ["summary", "quiz"]
            }
          }
        });
        
        const jsonString = response.text.trim();
        const result: GenerationResult = JSON.parse(jsonString);
        return result;

      } else {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        return { summary: response.text };
      }
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Could not get a response from the AI model.");
  }
}