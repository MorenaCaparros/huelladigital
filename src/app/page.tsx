'use client';

import { useState, useEffect } from 'react';
import Welcome from '@/components/Welcome';
import Schedule from '@/components/Schedule';
import Register from '@/components/Register';
import PreSurvey from '@/components/PreSurvey';
import PostSurvey from '@/components/PostSurvey';
import HuellaResult from '@/components/HuellaResult';

export type Step = 'welcome' | 'schedule' | 'register' | 'pre-survey' | 'waiting' | 'post-survey' | 'result';

export interface UserData {
  nombre: string;
  apellido: string;
  email?: string;
  userId: string; // ID único para identificar al usuario
}

export interface SurveyResponse {
  [key: string]: number | string;
}

// Hora de finalización del evento (30 de octubre 2025, 18:00)
// DEBUG MODE: Agrega ?debug=true en la URL para habilitar post-encuesta inmediatamente
const DEBUG_MODE = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === 'true';
const EVENT_END_TIME = new Date('2025-10-30T18:00:00');

export default function Home() {
  const [step, setStep] = useState<Step>('welcome');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [preSurveyData, setPreSurveyData] = useState<SurveyResponse | null>(null);
  const [postSurveyData, setPostSurveyData] = useState<SurveyResponse | null>(null);
  const [isEventEnded, setIsEventEnded] = useState(false);

  // Verificar si el evento ya terminó y si el usuario ya participó
  useEffect(() => {
    // Verificar hora del evento (o modo debug)
    const checkEventTime = () => {
      const now = new Date();
      setIsEventEnded(DEBUG_MODE || now >= EVENT_END_TIME);
    };
    
    checkEventTime();
    const interval = setInterval(checkEventTime, 60000); // Verificar cada minuto

    // Verificar si el usuario ya completó la pre-encuesta
    const savedUserId = localStorage.getItem('huellaIA_userId');
    const savedStep = localStorage.getItem('huellaIA_step');
    const savedUserData = localStorage.getItem('huellaIA_userData');
    const savedPreSurvey = localStorage.getItem('huellaIA_preSurvey');

    if (savedUserId && savedStep) {
      if (savedStep === 'waiting') {
        setStep('waiting');
        if (savedUserData) setUserData(JSON.parse(savedUserData));
        if (savedPreSurvey) setPreSurveyData(JSON.parse(savedPreSurvey));
      }
    }

    return () => clearInterval(interval);
  }, []);

  // Guardar en LocalStorage cuando cambia el estado
  const saveToLocalStorage = (newStep: Step, data?: any) => {
    if (newStep === 'waiting') {
      localStorage.setItem('huellaIA_step', newStep);
      if (userData) {
        localStorage.setItem('huellaIA_userId', userData.userId);
        localStorage.setItem('huellaIA_userData', JSON.stringify(userData));
      }
      if (preSurveyData) {
        localStorage.setItem('huellaIA_preSurvey', JSON.stringify(preSurveyData));
      }
    } else if (newStep === 'result') {
      // Limpiar localStorage al completar
      localStorage.removeItem('huellaIA_userId');
      localStorage.removeItem('huellaIA_step');
      localStorage.removeItem('huellaIA_userData');
      localStorage.removeItem('huellaIA_preSurvey');
    }
  };

  // Enviar datos a Google Sheets
  const sendToGoogleSheets = async (data: any) => {
    try {
      // Esta URL será del Google Apps Script (lo configuramos después)
      const scriptURL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
      
      if (!scriptURL) {
        console.warn('Google Sheets URL not configured');
        return;
      }

      await fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error sending to Google Sheets:', error);
    }
  };

  const handleNext = (data?: any) => {
    switch (step) {
      case 'welcome':
        setStep('schedule');
        break;
      case 'schedule':
        setStep('register');
        break;
      case 'register':
        // Generar ID único para el usuario
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const userDataWithId = { ...data, userId };
        setUserData(userDataWithId);
        setStep('pre-survey');
        break;
      case 'pre-survey':
        setPreSurveyData(data);
        
        // Enviar datos pre-encuesta a Google Sheets (anónimos)
        sendToGoogleSheets({
          timestamp: new Date().toISOString(),
          userId: userData?.userId,
          type: 'pre-survey',
          ...data,
        });
        
        setStep('waiting');
        saveToLocalStorage('waiting');
        break;
      case 'waiting':
        // Solo permitir continuar si el evento ya terminó
        if (isEventEnded) {
          setStep('post-survey');
        }
        break;
      case 'post-survey':
        setPostSurveyData(data);
        
        // Enviar datos post-encuesta a Google Sheets
        sendToGoogleSheets({
          timestamp: new Date().toISOString(),
          userId: userData?.userId,
          type: 'post-survey',
          preSurvey: preSurveyData,
          postSurvey: data,
          hasEmail: !!userData?.email,
        });
        
        setStep('result');
        saveToLocalStorage('result');
        break;
    }
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro? Esto borrará todos los datos guardados y volverás al inicio.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <main className="min-h-screen neural-bg">
      {DEBUG_MODE && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-black py-2 px-4 z-50 flex items-center justify-between">
          <span className="text-xs font-bold">🐛 DEBUG MODE ACTIVO - Post-encuesta habilitada</span>
          <button
            onClick={handleReset}
            className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1 rounded transition-colors"
          >
            🔄 Reset
          </button>
        </div>
      )}
      <div className={DEBUG_MODE ? 'pt-10' : ''}>
        {step === 'welcome' && <Welcome onNext={() => handleNext()} />}
        {step === 'schedule' && <Schedule onNext={() => handleNext()} />}
        {step === 'register' && <Register onNext={handleNext} />}
        {step === 'pre-survey' && <PreSurvey onNext={handleNext} />}
      {step === 'waiting' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-primary-600 mb-4">
              ¡Gracias por tu participación!
            </h2>
            <p className="text-gray-600 mb-6">
              Disfruta de las charlas del evento. Al finalizar (18:00 hs), volvé a escanear el QR o ingresá nuevamente para completar tu experiencia y descubrir tu Huella IA.
            </p>
            
            {isEventEnded ? (
              <button
                onClick={() => handleNext()}
                className="w-full bg-gradient-to-r from-accent-500 to-primary-500 text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all"
              >
                ✨ Completar mi Huella IA →
              </button>
            ) : (
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>⏰ El evento aún está en curso</strong>
                  <br />
                  Podrás completar tu Huella IA después de las 18:00 hs
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Guardá este link o escaneá el QR nuevamente al finalizar
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {step === 'post-survey' && <PostSurvey onNext={handleNext} preSurveyData={preSurveyData} />}
      {step === 'result' && (
        <HuellaResult
          userData={userData!}
          preSurveyData={preSurveyData!}
          postSurveyData={postSurveyData!}
        />
      )}
      </div>
    </main>
  );
}
