/**
 * Sistema de cola para envío de datos a Google Sheets
 * Maneja reintentos automáticos y evita pérdida de datos por rate limits
 */

interface QueueItem {
  id: string;
  data: any;
  timestamp: number;
  retries: number;
}

const QUEUE_KEY = 'huellaIA_dataQueue';
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 segundos entre reintentos
const BATCH_SIZE = 1; // Enviar de a uno para evitar rate limits
const BATCH_INTERVAL = 1500; // 1.5 segundos entre envíos

class DataQueue {
  private queue: QueueItem[] = [];
  private processing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadQueue();
    this.startProcessing();
  }

  /**
   * Cargar cola desde localStorage
   */
  private loadQueue() {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem(QUEUE_KEY);
      if (saved) {
        this.queue = JSON.parse(saved);
        console.log(`📦 Cola cargada: ${this.queue.length} items pendientes`);
      }
    } catch (error) {
      console.error('Error cargando cola:', error);
      this.queue = [];
    }
  }

  /**
   * Guardar cola en localStorage
   */
  private saveQueue() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error guardando cola:', error);
    }
  }

  /**
   * Agregar datos a la cola
   */
  add(data: any) {
    const item: QueueItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    this.queue.push(item);
    this.saveQueue();
    console.log(`✅ Datos agregados a la cola (${this.queue.length} items)`);
  }

  /**
   * Iniciar procesamiento automático de la cola
   */
  private startProcessing() {
    if (this.processingInterval) return;

    // Procesar cada 1.5 segundos
    this.processingInterval = setInterval(() => {
      this.processNext();
    }, BATCH_INTERVAL);
  }

  /**
   * Procesar siguiente item de la cola
   */
  private async processNext() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    const item = this.queue[0];
    const scriptURL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

    if (!scriptURL) {
      console.warn('⚠️ Google Sheets URL no configurada, limpiando cola');
      this.queue = [];
      this.saveQueue();
      this.processing = false;
      return;
    }

    try {
      console.log(`📤 Enviando a Google Sheets (${this.queue.length} items en cola)...`);
      
      const response = await fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item.data),
      });

      // Con mode: 'no-cors' no podemos verificar el status, asumimos éxito
      console.log(`✅ Datos enviados correctamente (${this.queue.length - 1} restantes)`);
      
      // Remover de la cola
      this.queue.shift();
      this.saveQueue();

    } catch (error: any) {
      console.error('❌ Error enviando datos:', error);

      // Incrementar reintentos
      item.retries++;

      if (item.retries >= MAX_RETRIES) {
        console.error(`💀 Item descartado después de ${MAX_RETRIES} reintentos:`, item.id);
        this.queue.shift(); // Remover item fallido
      } else {
        console.log(`🔄 Reintentando (${item.retries}/${MAX_RETRIES})...`);
        // Mover al final de la cola para dar oportunidad a otros
        this.queue.shift();
        this.queue.push(item);
      }

      this.saveQueue();
    }

    this.processing = false;
  }

  /**
   * Obtener tamaño de la cola
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Limpiar cola (usar con cuidado)
   */
  clear() {
    this.queue = [];
    this.saveQueue();
    console.log('🧹 Cola limpiada');
  }

  /**
   * Detener procesamiento (cleanup)
   */
  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }
}

// Singleton global
let globalQueue: DataQueue | null = null;

export function getDataQueue(): DataQueue {
  if (typeof window === 'undefined') {
    // Server-side rendering - retornar mock
    return {
      add: () => {},
      size: () => 0,
      clear: () => {},
      stop: () => {}
    } as any;
  }

  if (!globalQueue) {
    globalQueue = new DataQueue();
  }

  return globalQueue;
}

export function addToQueue(data: any) {
  getDataQueue().add(data);
}

export function getQueueSize(): number {
  return getDataQueue().size();
}
