'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Sparkles, TrendingUp, Download, FileText, Share2, Globe, MessageCircle } from 'lucide-react';
import type { UserData, SurveyResponse } from '@/app/page';
import { questionLabels, questionLabelsMobile, emotions as emotionData } from '@/utils/questions';
import { compareSentiments, type SentimentAnalysis } from '@/utils/sentimentAnalysis';

interface HuellaResultProps {
  userData: UserData;
  preSurveyData: SurveyResponse;
  postSurveyData: SurveyResponse;
  onHuellaGenerated?: (imageDataUrl: string) => void;
}

const emotionLabels: { [key: string]: { label: string; emoji: string } } = 
  emotionData.reduce((acc, emotion) => {
    acc[emotion.value] = { label: emotion.label, emoji: emotion.emoji };
    return acc;
  }, {} as { [key: string]: { label: string; emoji: string } });

export default function HuellaResult({ userData, preSurveyData, postSurveyData, onHuellaGenerated }: HuellaResultProps) {
  const huellaRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<{
    esperanza?: { before: SentimentAnalysis; after: SentimentAnalysis; change: number };
    preocupacion?: { before: SentimentAnalysis; after: SentimentAnalysis; change: number };
  }>({});
  const [analyzing, setAnalyzing] = useState(true);
  const [huellaGenerated, setHuellaGenerated] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Analizar sentimientos al montar el componente
  useEffect(() => {
    async function analyzeSentiments() {
      if (!preSurveyData || !postSurveyData) return;
      
      try {
        const results: any = {};
        
        // Analizar esperanza
        if (preSurveyData.esperanza_text && postSurveyData.esperanza_text) {
          results.esperanza = await compareSentiments(
            preSurveyData.esperanza_text as string,
            postSurveyData.esperanza_text as string
          );
        }
        
        // Analizar preocupación
        if (preSurveyData.preocupacion_text && postSurveyData.preocupacion_text) {
          results.preocupacion = await compareSentiments(
            preSurveyData.preocupacion_text as string,
            postSurveyData.preocupacion_text as string
          );
        }
        
        setSentimentAnalysis(results);
      } catch (error) {
        console.error('Error analizando sentimientos:', error);
      } finally {
        setAnalyzing(false);
      }
    }
    
    analyzeSentiments();
  }, [preSurveyData, postSurveyData]);

  // Generar imagen de la huella automáticamente cuando termine de cargar
  useEffect(() => {
    async function generateHuella() {
      if (!huellaRef.current || analyzing || huellaGenerated || !onHuellaGenerated) return;
      
      try {
        // Esperar un poco para que todo se renderice
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const canvas = await html2canvas(huellaRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
        });
        
        const imageDataUrl = canvas.toDataURL('image/png');
        onHuellaGenerated(imageDataUrl);
        setHuellaGenerated(true);
        console.log('✅ Huella generada y guardada');
      } catch (error) {
        console.error('Error generando huella:', error);
      }
    }
    
    if (!analyzing) {
      generateHuella();
    }
  }, [analyzing, huellaGenerated, onHuellaGenerated]);

  // Validación de datos - DESPUÉS de los hooks
  if (!preSurveyData || !postSurveyData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Datos incompletos
          </h2>
          <p className="text-gray-600 mb-6">
            Hubo un problema al cargar tus respuestas. Por favor, intentá completar la encuesta nuevamente.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-accent-500 to-primary-500 text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Prepare data for radar chart
  const radarData = Object.keys(questionLabels).map(key => ({
    subject: isMobile ? questionLabelsMobile[key] : questionLabels[key],
    antes: Number(preSurveyData[key]) || 0,
    despues: Number(postSurveyData[key]) || 0,
  }));

  // Calculate changes
  const getChange = (key: string) => {
    const pre = Number(preSurveyData[key]) || 0;
    const post = Number(postSurveyData[key]) || 0;
    return post - pre;
  };

  const getTotalChange = () => {
    return Object.keys(questionLabels).reduce((acc, key) => {
      return acc + Math.abs(getChange(key));
    }, 0);
  };

  const emotionBefore = preSurveyData.emocion as string;
  const emotionAfter = postSurveyData.emocion as string;
  const emotionChanged = emotionBefore !== emotionAfter;

  const downloadPDF = async () => {
    if (!huellaRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(huellaRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Create PDF with proper aspect ratio
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imgWidth, imgHeight]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`huella-ia-${userData.nombre}-${userData.apellido}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, intentá nuevamente.');
    } finally {
      setDownloading(false);
    }
  };

  const downloadImage = async () => {
    if (!huellaRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(huellaRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `huella-ia-${userData.nombre}-${userData.apellido}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Hubo un error al generar la imagen. Por favor, intentá nuevamente.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareText = `Acabo de descubrir mi Huella IA en el evento #IAxMDP2025 de @Global.IA 🤖✨

¡Mirá cómo evolucionó mi percepción sobre la Inteligencia Artificial!`;
    const shareUrl = 'https://www.globalia.org/';

    // Intentar usar Web Share API nativo (funciona en móviles y algunos navegadores modernos)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Huella IA',
          text: shareText,
          url: shareUrl,
        });
        console.log('Compartido exitosamente');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.log('Error al compartir:', error);
        }
      }
    } else {
      // Fallback: copiar al portapapeles si no hay Web Share API
      const textToCopy = `${shareText}\n\n${shareUrl}`;
      try {
        await navigator.clipboard.writeText(textToCopy);
        alert('¡Texto copiado al portapapeles! Ahora podés pegarlo donde quieras compartirlo.');
      } catch (error) {
        console.error('Error al copiar:', error);
        alert('No se pudo copiar automáticamente. Por favor, copiá manualmente el link: ' + shareUrl);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 max-w-4xl w-full"
      >
        {/* Confetti effect could be added here */}
        
        {/* Downloadable Section */}
        <div ref={huellaRef} className="bg-white p-4 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block mb-4"
            >
              <Image 
                src="/logo-blanco.jpeg" 
                alt="Tu Huella IA" 
                width={120} 
                height={120}
                className="rounded-xl shadow-lg"
              />
            </motion.div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-dark-500 to-primary-600 bg-clip-text text-transparent mb-2">
              Tu Huella IA
            </h1>
            <p className="text-xl text-gray-700 mb-1">
              {userData.nombre} {userData.apellido}
            </p>
            <p className="text-sm text-gray-500">
              IAx Mar Del Plata · 30.10.25
            </p>
          </div>

          {/* Emotion Change */}
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-6 rounded-xl mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Tu Evolución Emocional
            </h2>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-5xl mb-2">{emotionLabels[emotionBefore]?.emoji}</div>
                <p className="text-sm text-gray-600 font-medium">Antes</p>
                <p className="text-xs text-gray-500">{emotionLabels[emotionBefore]?.label}</p>
              </div>
              
              <div className="text-4xl text-primary-500">
                {emotionChanged ? '→' : '='}
              </div>
              
              <div className="text-center">
                <div className="text-5xl mb-2">{emotionLabels[emotionAfter]?.emoji}</div>
                <p className="text-sm text-gray-600 font-medium">Después</p>
                <p className="text-xs text-gray-500">{emotionLabels[emotionAfter]?.label}</p>
              </div>
            </div>
            
            {emotionChanged ? (
              <p className="text-center mt-4 text-sm text-primary-600 font-semibold flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Tu perspectiva emocional evolucionó
              </p>
            ) : (
              <p className="text-center mt-4 text-sm text-gray-600">
                Tu perspectiva emocional se mantuvo constante
              </p>
            )}
          </div>

          {/* Sentiment Analysis Section */}
          {!analyzing && (sentimentAnalysis.esperanza || sentimentAnalysis.preocupacion) && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Análisis de Sentimientos con Gemini AI
              </h2>
              
              <div className="space-y-4">
                {sentimentAnalysis.esperanza && (
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Esperanza
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Antes:</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            sentimentAnalysis.esperanza.before.sentiment === 'positivo' ? 'bg-green-500' :
                            sentimentAnalysis.esperanza.before.sentiment === 'negativo' ? 'bg-red-500' :
                            'bg-gray-400'
                          }`}></div>
                          <span className="capitalize">{sentimentAnalysis.esperanza.before.sentiment}</span>
                        </div>
                        {sentimentAnalysis.esperanza.before.emotions.length > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            {sentimentAnalysis.esperanza.before.emotions.join(', ')}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Después:</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            sentimentAnalysis.esperanza.after.sentiment === 'positivo' ? 'bg-green-500' :
                            sentimentAnalysis.esperanza.after.sentiment === 'negativo' ? 'bg-red-500' :
                            'bg-gray-400'
                          }`}></div>
                          <span className="capitalize">{sentimentAnalysis.esperanza.after.sentiment}</span>
                        </div>
                        {sentimentAnalysis.esperanza.after.emotions.length > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            {sentimentAnalysis.esperanza.after.emotions.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    {sentimentAnalysis.esperanza.change !== 0 && (
                      <div className="mt-2 text-center">
                        <span className={`text-xs font-semibold ${
                          sentimentAnalysis.esperanza.change > 0 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {sentimentAnalysis.esperanza.change > 0 ? 'Más optimista' : 'Cambio de tono'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {sentimentAnalysis.preocupacion && (
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Preocupación
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Antes:</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            sentimentAnalysis.preocupacion.before.sentiment === 'positivo' ? 'bg-green-500' :
                            sentimentAnalysis.preocupacion.before.sentiment === 'negativo' ? 'bg-red-500' :
                            'bg-gray-400'
                          }`}></div>
                          <span className="capitalize">{sentimentAnalysis.preocupacion.before.sentiment}</span>
                        </div>
                        {sentimentAnalysis.preocupacion.before.emotions.length > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            {sentimentAnalysis.preocupacion.before.emotions.join(', ')}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Después:</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            sentimentAnalysis.preocupacion.after.sentiment === 'positivo' ? 'bg-green-500' :
                            sentimentAnalysis.preocupacion.after.sentiment === 'negativo' ? 'bg-red-500' :
                            'bg-gray-400'
                          }`}></div>
                          <span className="capitalize">{sentimentAnalysis.preocupacion.after.sentiment}</span>
                        </div>
                        {sentimentAnalysis.preocupacion.after.emotions.length > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            {sentimentAnalysis.preocupacion.after.emotions.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    {sentimentAnalysis.preocupacion.change !== 0 && (
                      <div className="mt-2 text-center">
                        <span className={`text-xs font-semibold ${
                          sentimentAnalysis.preocupacion.change > 0 ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {sentimentAnalysis.preocupacion.change > 0 ? 'Preocupación más constructiva' : 'Tono más reflexivo'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-center text-xs text-gray-500 mt-4">
                Analizado con Google Gemini AI
              </p>
            </div>
          )}

          {analyzing && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl mb-8 text-center">
              <div className="animate-pulse flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <p className="text-gray-600">Analizando tus respuestas con IA...</p>
              </div>
            </div>
          )}

          {/* Radar Chart */}
          <div className="mb-8 -mx-4 sm:mx-0">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center px-4 sm:px-0">
              Evolución de Percepciones
            </h2>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={400} minWidth={320}>
                <RadarChart data={radarData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#4b5563', fontSize: 9 }}
                    tickLine={false}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <Radar
                    name="Antes del evento"
                    dataKey="antes"
                    stroke="#0066cc"
                    fill="#0066cc"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Después del evento"
                    dataKey="despues"
                    stroke="#00a2e8"
                    fill="#00a2e8"
                    fillOpacity={0.5}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary-500"></div>
                <span className="text-sm text-gray-600">Antes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-accent-500"></div>
                <span className="text-sm text-gray-600">Después</span>
              </div>
            </div>
          </div>

          {/* Changes Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {Object.keys(questionLabels).map(key => {
              const change = getChange(key);
              return (
                <div key={key} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 text-sm mb-2">
                    {questionLabels[key]}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary-600">
                      {preSurveyData[key]}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="text-2xl font-bold text-accent-600">
                      {postSurveyData[key]}
                    </span>
                    {change !== 0 && (
                      <span className={`ml-auto text-sm font-semibold ${change > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        {change > 0 ? '+' : ''}{change}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Insight */}
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-6 rounded-xl text-center">
            <p className="text-lg font-semibold mb-2">
              Tu Índice de Transformación
            </p>
            <p className="text-4xl font-bold mb-2">
              {getTotalChange().toFixed(1)} puntos
            </p>
            <p className="text-sm opacity-90">
              {getTotalChange() > 5
                ? '¡Las charlas generaron un cambio significativo en tu visión!'
                : getTotalChange() > 2
                ? 'Tu perspectiva evolucionó gracias al evento'
                : 'Mantuviste una visión consistente sobre la IA'}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center border-t pt-6">
            <p className="text-sm text-gray-600 mb-2">
              Inteligencia Artificial pensada en clave local
            </p>
            <p className="text-xs text-gray-500">
              Global.IA · #IAxMDP2025
            </p>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="space-y-4 mt-8">
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadImage}
              disabled={downloading}
              className="flex-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              {downloading ? 'Generando...' : 'Descargar Imagen'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadPDF}
              disabled={downloading}
              className="flex-1 bg-white border-2 border-primary-500 text-primary-600 font-semibold py-4 px-6 rounded-xl hover:bg-primary-50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              {downloading ? 'Generando...' : 'Descargar PDF'}
            </motion.button>
          </div>

          {/* Share Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Compartir en Redes Sociales
            </motion.button>
            <p className="text-xs text-gray-500 text-center mt-2">
              No olvides etiquetarnos: <strong>@GlobalIA</strong> · <strong>#IAxMDP2025</strong>
            </p>
          </motion.div>

          {/* Social Media Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="border-t pt-6 mt-6"
          >
            <p className="text-sm font-semibold text-gray-700 mb-4 text-center">
              Seguinos en nuestras redes:
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://www.globalia.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="p-2 bg-gray-600 text-white rounded-full group-hover:bg-gray-700 transition-colors">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Sitio Web</p>
                  <p className="text-xs text-gray-500">www.globalia.org</p>
                </div>
              </a>

              <a
                href="https://wa.me/5491156449265"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
              >
                <div className="p-2 bg-green-500 text-white rounded-full group-hover:bg-green-600 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">WhatsApp</p>
                  <p className="text-xs text-gray-500">+54 9 11 5644-9265</p>
                </div>
              </a>

              <a
                href="https://www.instagram.com/globaliaok/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-colors group"
              >
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full group-hover:from-purple-600 group-hover:to-pink-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Instagram</p>
                  <p className="text-xs text-gray-500">@globaliaok</p>
                </div>
              </a>
            </div>
          </motion.div>
        </div>

        {userData.email && (
          <p className="text-center text-sm text-gray-500 mt-4">
            También te enviaremos una copia a <strong>{userData.email}</strong>
          </p>
        )}
      </motion.div>
    </div>
  );
}
