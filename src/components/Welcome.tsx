'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface WelcomeProps {
  onNext: () => void;
}

export default function Welcome({ onNext }: WelcomeProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
      >
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <Image 
              src="/logo.jpeg" 
              alt="Tu Huella IA Logo" 
              width={200} 
              height={200}
              className="rounded-2xl shadow-2xl"
              priority
            />
          </motion.div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-dark-500 to-primary-600 bg-clip-text text-transparent mb-2">
            Tu Huella IA
          </h1>
          <p className="text-lg text-accent-600 font-semibold mb-2">
            IAx Mar Del Plata 2025
          </p>
          <p className="text-sm text-gray-500">
            30.10.25 | Global.IA
          </p>
        </div>

        {/* Contenido principal */}
        <div className="space-y-6 mb-8">
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-primary-700 mb-3">
              ¿Qué es Tu Huella IA? 🧠
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Una experiencia interactiva que captura cómo tus percepciones sobre la Inteligencia Artificial 
              evolucionan a lo largo del evento. Responderás algunas preguntas antes y después de las charlas, 
              y al final recibirás tu <strong>Huella IA personal</strong> para descubrir cómo cambió tu visión.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                ⏱️
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">7-8 minutos</h3>
                <p className="text-sm text-gray-600">de encuesta antes del evento</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center text-accent-600">
                🎯
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">7 preguntas (5 + 2 abiertas)</h3>
                <p className="text-sm text-gray-600">analizadas con IA</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                📊
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Resultados visuales</h3>
                <p className="text-sm text-gray-600">descarga tu huella al finalizar</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center text-accent-600">
                🔒
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">100% anónimo</h3>
                <p className="text-sm text-gray-600">tus datos están protegidos</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Comenzar experiencia →
        </motion.button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Una iniciativa de <strong>Global.IA</strong>
        </p>
      </motion.div>
    </div>
  );
}
