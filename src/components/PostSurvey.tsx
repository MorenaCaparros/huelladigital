'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SurveyResponse } from '@/app/page';
import { surveyQuestions, emotions } from '@/utils/questions';

interface PostSurveyProps {
  onNext: (data: SurveyResponse) => void;
  preSurveyData: SurveyResponse | null;
}

export default function PostSurvey({ onNext, preSurveyData }: PostSurveyProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<SurveyResponse>({});
  const [direction, setDirection] = useState(0);

  const question = surveyQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / surveyQuestions.length) * 100;

  // Scroll to top cuando cambia la pregunta
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuestion]);

  const handleAnswer = (value: number | string) => {
    setAnswers({ ...answers, [question.id]: value });
  };

  const handleNext = () => {
    if (currentQuestion < surveyQuestions.length - 1) {
      setDirection(1);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onNext(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setDirection(-1);
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const canProceed = (() => {
    const answer = answers[question.id];
    if (answer === undefined) return false;
    // Para inputs de texto, validar contenido significativo
    if (question.type === 'text') {
      if (typeof answer !== 'string') return false;
      const text = answer.trim();
      if (text.length < 10) return false; // Mínimo 10 caracteres
      // Debe tener al menos 5 letras (no solo números/símbolos)
      const letterCount = (text.match(/[a-záéíóúñA-ZÁÉÍÓÚÑ]/g) || []).length;
      return letterCount >= 5;
    }
    return true;
  })();

  const getValidationMessage = () => {
    if (question.type !== 'text') return null;
    const answer = answers[question.id];
    if (!answer || typeof answer !== 'string') return null;
    const text = answer.trim();
    if (text.length === 0) return null;
    if (text.length < 10) return 'Escribí al menos 10 caracteres';
    const letterCount = (text.match(/[a-záéíóúñA-ZÁÉÍÓÚÑ]/g) || []).length;
    if (letterCount < 5) return 'Tu respuesta debe contener palabras, no solo números o símbolos';
    return null;
  };

  const getChangeIndicator = () => {
    if (!preSurveyData) return null;
    const preValue = preSurveyData[question.id];
    const postValue = answers[question.id];
    
    if (preValue === undefined || postValue === undefined) return null;
    if (question.type === 'emotion') return null;
    
    const diff = Number(postValue) - Number(preValue);
    if (diff === 0) return null;
    
    return (
      <div className={`text-sm font-semibold ${diff > 0 ? 'text-green-600' : 'text-orange-600'}`}>
        {diff > 0 ? '↑' : '↓'} {Math.abs(diff)} {diff > 0 ? 'más positivo' : 'cambio de visión'}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-accent-600">
              Percepción Post-Evento
            </h2>
            <span className="text-sm text-gray-500">
              {currentQuestion + 1} / {surveyQuestions.length}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-accent-500 to-primary-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="mt-4 bg-accent-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>✨ Momento de reflexión:</strong> Después de las charlas, ¿cambió tu percepción?
            </p>
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-accent-50 to-primary-50 p-6 rounded-xl mb-6">
              <p className="text-sm text-accent-600 font-semibold mb-2">
                {question.category}
              </p>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {question.question}
              </h3>
              {/* Puntaje previo oculto para evitar sesgo */}
            </div>

            {/* Answer Options */}
            {question.type === 'scale' ? (
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-gray-500 mb-2 px-2">
                  <span>{question.labels?.min || 'Totalmente en desacuerdo'}</span>
                  <span>{question.labels?.max || 'Totalmente de acuerdo'}</span>
                </div>
                <div className="flex gap-2 justify-between">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <motion.button
                      key={value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAnswer(value)}
                      className={`flex-1 h-16 rounded-xl font-semibold text-lg transition-all ${
                        answers[question.id] === value
                          ? 'bg-gradient-to-r from-accent-500 to-primary-500 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {value}
                    </motion.button>
                  ))}
                </div>
                {getChangeIndicator()}
              </div>
            ) : question.type === 'text' ? (
              <div>
                <textarea
                  value={(answers[question.id] as string) || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  maxLength={question.maxLength}
                  placeholder={question.placeholder}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                />
                <div className="mt-2">
                  <div className="flex justify-between">
                    <p className="text-xs text-gray-500">
                      🤖 Analizaremos cómo cambió tu percepción
                    </p>
                    <p className="text-xs text-gray-500">
                      {((answers[question.id] as string) || '').length} / {question.maxLength}
                    </p>
                  </div>
                  {getValidationMessage() && (
                    <p className="text-xs text-red-500 mt-1">
                      ⚠️ {getValidationMessage()}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {emotions.map((emotion) => (
                  <motion.button
                    key={emotion.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(emotion.value)}
                    className={`p-6 rounded-xl font-semibold transition-all ${
                      answers[question.id] === emotion.value
                        ? 'bg-gradient-to-r from-accent-500 to-primary-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-4xl mb-2">{emotion.emoji}</div>
                    <div>{emotion.label}</div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-4">
          {currentQuestion > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrevious}
              className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
            >
              ← Anterior
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: canProceed ? 1.02 : 1 }}
            whileTap={{ scale: canProceed ? 0.98 : 1 }}
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              canProceed
                ? 'bg-gradient-to-r from-accent-500 to-primary-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentQuestion === surveyQuestions.length - 1 ? 'Ver mi Huella IA' : 'Siguiente'} →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
