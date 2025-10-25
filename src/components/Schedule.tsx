'use client';

import { motion } from 'framer-motion';

interface ScheduleProps {
  onNext: () => void;
}

const schedule = [
  {
    time: '11:50 AM',
    title: 'Apertura',
    icon: '🎯',
    color: 'from-primary-500 to-primary-600'
  },
  {
    time: '12:00 - 13:45',
    title: 'Cápsula 1 – IAxSociedad',
    speakers: ['Jose Montes Mónaco', 'Javier Mateos y María Gisele Cano', 'Bruno Constanzo'],
    icon: '🏛️',
    color: 'from-primary-400 to-accent-500'
  },
  {
    time: '14:00 - 15:15',
    title: 'Cápsula 2 – IAxEducación',
    speakers: ['María Felicitas Lértora', 'Ariel Vercelli', 'Federico Alvarez Larrondo'],
    icon: '📚',
    color: 'from-accent-500 to-primary-500'
  },
  {
    time: '15:30 - 16:45',
    title: 'Cápsula 3 – IAxSalud',
    speakers: ['Mariela Pérez Lalli', 'Diego Sebastián Comas', 'Gustavo Meschino'],
    icon: '🏥',
    color: 'from-primary-500 to-accent-400'
  },
  {
    time: '17:00 - 17:40',
    title: 'Cápsula 4 – IAxArte&Cultura',
    speakers: ['Julio Lascano'],
    icon: '🎨',
    color: 'from-accent-400 to-primary-600'
  }
];

export default function Schedule({ onNext }: ScheduleProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">
            Programa del Evento
          </h1>
          <p className="text-gray-600">
            30 de Octubre, 2025 | MAR - Museo Provincial de Arte Contemporáneo
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Av. Félix U. Camet y López de Gomara
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-4 mb-8 max-h-[60vh] overflow-y-auto pr-2">
          {schedule.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className={`bg-gradient-to-r ${item.color} p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow`}>
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 text-4xl">
                    {item.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                        {item.time}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">
                      {item.title}
                    </h3>
                    {item.speakers && (
                      <div className="space-y-1">
                        {item.speakers.map((speaker, idx) => (
                          <p key={idx} className="text-sm text-white/90">
                            • {speaker}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-4 rounded-xl mb-6">
          <p className="text-sm text-gray-700 text-center">
            <strong>🎯 Tu Huella IA</strong> capturará tus percepciones antes y después de estas charlas
          </p>
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Continuar →
        </motion.button>
      </motion.div>
    </div>
  );
}
