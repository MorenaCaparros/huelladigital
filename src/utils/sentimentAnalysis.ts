import { GoogleGenerativeAI } from '@google/generative-ai';
import Sentiment from 'sentiment';

const sentiment = new Sentiment();

// Configuración de Google Gemini AI
const genAI = process.env.NEXT_PUBLIC_GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
  : null;

export interface SentimentAnalysis {
  score: number; // -1 a 1 (negativo a positivo)
  sentiment: 'positivo' | 'neutral' | 'negativo';
  emotions: string[];
  method: 'gemini' | 'fallback';
}

/**
 * Analiza el sentimiento de un texto usando Google Gemini AI
 * Si falla o no hay API key, usa librería de fallback
 */
export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  // Si no hay texto, retornar neutral
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      sentiment: 'neutral',
      emotions: [],
      method: 'fallback'
    };
  }

  // Intentar con Google Gemini AI primero
  if (genAI) {
    try {
      const result = await analyzeSentimentWithGemini(text);
      return { ...result, method: 'gemini' };
    } catch (error) {
      console.warn('Gemini AI falló, usando fallback:', error);
      return analyzeSentimentWithFallback(text);
    }
  }

  // Si no hay API key, usar fallback directamente
  return analyzeSentimentWithFallback(text);
}

/**
 * Análisis con Google Gemini AI
 */
async function analyzeSentimentWithGemini(text: string): Promise<Omit<SentimentAnalysis, 'method'>> {
  const model = genAI!.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Analiza el sentimiento del siguiente texto en español sobre Inteligencia Artificial.
Responde SOLO con un objeto JSON válido (sin markdown, sin explicaciones adicionales) con esta estructura exacta:
{
  "score": número entre -1 y 1 (-1 muy negativo, 0 neutral, 1 muy positivo),
  "sentiment": "positivo" | "neutral" | "negativo",
  "emotions": ["emoción1", "emoción2"] (máximo 3 emociones detectadas como: esperanza, miedo, curiosidad, preocupación, entusiasmo, ansiedad)
}

Texto a analizar: "${text}"`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const responseText = response.text();
  
  // Limpiar respuesta (quitar markdown si viene)
  const cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  const analysis = JSON.parse(cleanText);
  
  return {
    score: Math.max(-1, Math.min(1, analysis.score)), // Asegurar rango -1 a 1
    sentiment: analysis.sentiment,
    emotions: analysis.emotions || []
  };
}

/**
 * Análisis con librería de fallback (sentiment)
 */
function analyzeSentimentWithFallback(text: string): SentimentAnalysis {
  const result = sentiment.analyze(text);
  
  // Normalizar score a rango -1 a 1
  const normalizedScore = Math.max(-1, Math.min(1, result.score / 10));
  
  // Determinar sentimiento
  let sentimentLabel: 'positivo' | 'neutral' | 'negativo';
  if (normalizedScore > 0.2) sentimentLabel = 'positivo';
  else if (normalizedScore < -0.2) sentimentLabel = 'negativo';
  else sentimentLabel = 'neutral';
  
  // Detectar emociones básicas por palabras clave en español
  const emotions: string[] = [];
  const lowerText = text.toLowerCase();
  
  if (lowerText.match(/esper|optimis|positiv|bien|bueno|mejor/)) emotions.push('esperanza');
  if (lowerText.match(/mied|temor|terror|asust|preocup/)) emotions.push('preocupación');
  if (lowerText.match(/curios|interes|aprend|descubr/)) emotions.push('curiosidad');
  if (lowerText.match(/entusias|emocion|feliz|alegr/)) emotions.push('entusiasmo');
  if (lowerText.match(/ansied|nervios|inquiet/)) emotions.push('ansiedad');
  if (lowerText.match(/frustrac|enojo|molest/)) emotions.push('frustración');
  
  return {
    score: normalizedScore,
    sentiment: sentimentLabel,
    emotions: emotions.slice(0, 3), // Máximo 3 emociones
    method: 'fallback'
  };
}

/**
 * Genera un resumen de cambio de sentimiento entre dos textos
 */
export async function compareSentiments(
  textBefore: string, 
  textAfter: string
): Promise<{
  before: SentimentAnalysis;
  after: SentimentAnalysis;
  change: number;
  improved: boolean;
}> {
  const [before, after] = await Promise.all([
    analyzeSentiment(textBefore),
    analyzeSentiment(textAfter)
  ]);

  const change = after.score - before.score;

  return {
    before,
    after,
    change,
    improved: change > 0.1 // Mejoró si aumentó más de 0.1
  };
}
