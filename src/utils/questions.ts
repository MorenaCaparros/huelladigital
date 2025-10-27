// Definición de preguntas compartidas entre Pre y Post Survey

export interface Question {
  id: string;
  category: string;
  question: string;
  type: 'scale' | 'emotion' | 'text';
  labels?: {
    min: string;
    max: string;
  };
  placeholder?: string;
  maxLength?: number;
}

export const surveyQuestions: Question[] = [
  {
    id: 'sociedad',
    category: '🏛️ Sociedad',
    question: '¿Creés que la IA mejorará la productividad laboral más de lo que afectará empleos?',
    type: 'scale',
    labels: { min: 'Afectará empleos', max: 'Mejorará productividad' }
  },
  {
    id: 'preparacion',
    category: '🏛️ Sociedad',
    question: '¿Qué tan preparada creés que estará la sociedad para un mundo automatizado?',
    type: 'scale',
    labels: { min: 'Nada preparada', max: 'Muy preparada' }
  },
  {
    id: 'salud',
    category: '🏥 Salud',
    question: '¿Confiarías en un diagnóstico médico asistido por IA?',
    type: 'scale',
    labels: { min: 'No confiaría', max: 'Confiaría totalmente' }
  },
  {
    id: 'educacion',
    category: '📚 Educación',
    question: '¿Qué impacto creés que tendrá la IA en la accesibilidad de la educación?',
    type: 'scale',
    labels: { min: 'Muy desigual', max: 'Muy accesible' }
  },
  {
    id: 'arte',
    category: '🎨 Arte y Cultura',
    question: '¿Creés que la IA podrá crear arte verdaderamente original?',
    type: 'scale',
    labels: { min: 'No podrá', max: 'Totalmente original' }
  },
  {
    id: 'esperanza_text',
    category: '💭 Reflexión Personal',
    question: '¿Qué te genera mayor esperanza sobre la IA?',
    type: 'text',
    placeholder: 'Escribí tu respuesta aquí para que la IA pueda analizarla...',
    maxLength: 200
  },
  {
    id: 'preocupacion_text',
    category: '💭 Reflexión Personal',
    question: '¿Qué te preocupa más sobre la IA?',
    type: 'text',
    placeholder: 'Escribí tu respuesta aquí para que la IA pueda analizarla...',
    maxLength: 200
  },
  {
    id: 'emocion',
    category: '💭 General',
    question: '¿Qué emoción predomina en vos al pensar en el futuro con IA?',
    type: 'emotion',
  },
];

export const emotions = [
  { value: 'esperanza', label: 'Esperanza', emoji: '🌟' },
  { value: 'curiosidad', label: 'Curiosidad', emoji: '🔍' },
  { value: 'preocupacion', label: 'Preocupación', emoji: '😟' },
  { value: 'miedo', label: 'Miedo', emoji: '😰' },
];

export const questionLabels: { [key: string]: string } = {
  sociedad: 'Productividad IA',
  preparacion: 'Preparación Social',
  salud: 'Confianza en IA Médica',
  educacion: 'Accesibilidad Educativa',
  arte: 'Creatividad IA',
};

// Versión corta para móviles
export const questionLabelsMobile: { [key: string]: string } = {
  sociedad: 'Productividad',
  preparacion: 'Preparación',
  salud: 'IA Médica',
  educacion: 'Educación',
  arte: 'Creatividad',
};
