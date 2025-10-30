'use client';

import { useState } from 'react';
import HuellaResult from '@/components/HuellaResult';
import type { UserData, SurveyResponse } from '@/app/page';

export default function RegenerarHuella() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [huellaData, setHuellaData] = useState<{
    userData: UserData;
    preSurveyData: SurveyResponse;
    postSurveyData: SurveyResponse;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setHuellaData(null);

    try {
      const scriptURL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
      
      if (!scriptURL) {
        throw new Error('URL de Google Sheets no configurada');
      }

      // Hacer request a Google Sheets para obtener datos del usuario
      const response = await fetch(`${scriptURL}?email=${encodeURIComponent(email)}&action=get`);
      
      if (!response.ok) {
        throw new Error('Error al obtener datos');
      }

      const data = await response.json();

      if (!data.preSurvey || !data.postSurvey) {
        throw new Error('No se encontraron datos completos para este email');
      }

      // Reconstruir los datos en el formato esperado
      setHuellaData({
        userData: {
          nombre: data.nombre || 'Usuario',
          apellido: data.apellido || '',
          email: data.email,
          userId: data.userId || 'regenerated',
        },
        preSurveyData: data.preSurvey,
        postSurveyData: data.postSurvey,
      });
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen neural-bg">
      <div className="container mx-auto px-4 py-8">
        {!huellaData ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                🔄 Regenerar Huella IA
              </h1>
              <p className="text-gray-600 text-center mb-6">
                Ingresá tu email para ver tu huella nuevamente
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Cargando...' : '🔍 Buscar mi huella'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  💡 Tip: Solo podés regenerar tu huella si completaste ambas encuestas
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 text-center">
              <button
                onClick={() => {
                  setHuellaData(null);
                  setEmail('');
                  setError('');
                }}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Buscar otra huella
              </button>
            </div>
            <HuellaResult
              userData={huellaData.userData}
              preSurveyData={huellaData.preSurveyData}
              postSurveyData={huellaData.postSurveyData}
            />
          </div>
        )}
      </div>
    </main>
  );
}
