/**
 * Script para generar huellas masivamente desde CSV de Google Sheets
 * 
 * USO:
 * 1. Exporta tu Google Sheet como CSV
 * 2. Coloca el archivo en: scripts/data.csv
 * 3. Ejecuta: node scripts/generate-huellas.js
 * 4. Las imágenes se guardarán en: scripts/output/
 * 5. Se generará un CSV final: scripts/output/emails-con-imagenes.csv
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const puppeteer = require('puppeteer');

// Configuración
const CSV_INPUT = path.join(__dirname, 'data.csv');
const OUTPUT_DIR = path.join(__dirname, 'output');
const OUTPUT_CSV = path.join(OUTPUT_DIR, 'emails-con-imagenes.csv');
const BASE_URL = 'http://localhost:3000'; // Cambia a tu URL de Vercel si prefieres

// Crear directorio de salida
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Función para parsear CSV
function parseCSV(csvPath) {
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });
  return records;
}

// Función para agrupar pre y post survey por email
function groupSurveysByEmail(records) {
  const grouped = {};
  
  records.forEach(row => {
    const email = row.email?.trim();
    if (!email) return;
    
    if (!grouped[email]) {
      grouped[email] = {
        nombre: row.nombre,
        apellido: row.apellido,
        email: email,
        userId: row.userId,
        preSurvey: null,
        postSurvey: null,
      };
    }
    
    const surveyData = {
      q1: parseInt(row.sociedad) || 0,
      q2: parseInt(row.preparacion) || 0,
      q3: parseInt(row.salud) || 0,
      q4: parseInt(row.educacion) || 0,
      q5: parseInt(row.arte) || 0,
      esperanza_text: row.esperanza_text || '',
      preocupacion_text: row.preocupacion_text || '',
      emocion: row.emocion || '',
    };
    
    if (row.type === 'pre-survey') {
      grouped[email].preSurvey = surveyData;
    } else if (row.type === 'post-survey') {
      grouped[email].postSurvey = surveyData;
    }
  });
  
  // Filtrar solo los que tienen ambas encuestas
  return Object.values(grouped).filter(
    user => user.preSurvey && user.postSurvey
  );
}

// Función para generar huella usando Puppeteer
async function generateHuella(browser, userData, index, total) {
  console.log(`[${index + 1}/${total}] Generando huella para: ${userData.nombre} ${userData.apellido} (${userData.email})`);
  
  const page = await browser.newPage();
  
  try {
    // Configurar viewport grande para captura de calidad
    await page.setViewport({ width: 1200, height: 3000 });
    
    // Crear URL con datos como query params (codificados)
    const params = new URLSearchParams({
      nombre: userData.nombre,
      apellido: userData.apellido,
      email: userData.email,
      userId: userData.userId,
      // Pre-survey
      pre_q1: userData.preSurvey.q1,
      pre_q2: userData.preSurvey.q2,
      pre_q3: userData.preSurvey.q3,
      pre_q4: userData.preSurvey.q4,
      pre_q5: userData.preSurvey.q5,
      pre_esperanza: userData.preSurvey.esperanza_text,
      pre_preocupacion: userData.preSurvey.preocupacion_text,
      pre_emocion: userData.preSurvey.emocion,
      // Post-survey
      post_q1: userData.postSurvey.q1,
      post_q2: userData.postSurvey.q2,
      post_q3: userData.postSurvey.q3,
      post_q4: userData.postSurvey.q4,
      post_q5: userData.postSurvey.q5,
      post_esperanza: userData.postSurvey.esperanza_text,
      post_preocupacion: userData.postSurvey.preocupacion_text,
      post_emocion: userData.postSurvey.emocion,
    });
    
    const url = `${BASE_URL}/api/generate-huella?${params.toString()}`;
    
    // Navegar a la página
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });
    
    // Esperar a que el componente cargue
    await page.waitForSelector('#huella-container', { timeout: 30000 });
    
    // Esperar un poco más para asegurar que todo esté renderizado
    await page.waitForTimeout(3000);
    
    // Tomar screenshot del contenedor específico
    const element = await page.$('#huella-container');
    const filename = `huella-${userData.email.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    await element.screenshot({ 
      path: filepath,
      type: 'png'
    });
    
    console.log(`  ✅ Guardada: ${filename}`);
    
    return {
      email: userData.email,
      nombre: userData.nombre,
      apellido: userData.apellido,
      imagen: filename,
      filepath: filepath,
    };
    
  } catch (error) {
    console.error(`  ❌ Error generando huella para ${userData.email}:`, error.message);
    return {
      email: userData.email,
      nombre: userData.nombre,
      apellido: userData.apellido,
      imagen: 'ERROR',
      error: error.message,
    };
  } finally {
    await page.close();
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando generación masiva de huellas...\n');
  
  // 1. Leer CSV
  console.log('📄 Leyendo CSV...');
  if (!fs.existsSync(CSV_INPUT)) {
    console.error(`❌ Error: No se encontró el archivo ${CSV_INPUT}`);
    console.log('\n📝 Por favor:');
    console.log('1. Exporta tu Google Sheet como CSV');
    console.log('2. Guárdalo como: scripts/data.csv');
    process.exit(1);
  }
  
  const records = parseCSV(CSV_INPUT);
  console.log(`  ✅ ${records.length} registros encontrados\n`);
  
  // 2. Agrupar por email
  console.log('🔄 Agrupando encuestas por email...');
  const users = groupSurveysByEmail(records);
  console.log(`  ✅ ${users.length} usuarios con encuestas completas\n`);
  
  if (users.length === 0) {
    console.log('❌ No hay usuarios con pre y post encuesta completas');
    process.exit(1);
  }
  
  // 3. Iniciar navegador
  console.log('🌐 Iniciando navegador...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  console.log('  ✅ Navegador listo\n');
  
  // 4. Generar huellas
  console.log(`📸 Generando ${users.length} huellas...\n`);
  const results = [];
  
  for (let i = 0; i < users.length; i++) {
    const result = await generateHuella(browser, users[i], i, users.length);
    results.push(result);
    
    // Pequeña pausa entre generaciones
    if (i < users.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // 5. Cerrar navegador
  await browser.close();
  console.log('\n✅ Navegador cerrado');
  
  // 6. Generar CSV de salida
  console.log('\n📊 Generando CSV de resultados...');
  const csvContent = [
    'email,nombre,apellido,imagen,error',
    ...results.map(r => 
      `${r.email},"${r.nombre}","${r.apellido}",${r.imagen},${r.error || ''}`
    )
  ].join('\n');
  
  fs.writeFileSync(OUTPUT_CSV, csvContent, 'utf-8');
  console.log(`  ✅ CSV guardado: ${OUTPUT_CSV}`);
  
  // 7. Resumen
  const successful = results.filter(r => r.imagen !== 'ERROR').length;
  const failed = results.length - successful;
  
  console.log('\n📈 RESUMEN:');
  console.log(`  ✅ Exitosas: ${successful}`);
  console.log(`  ❌ Fallidas: ${failed}`);
  console.log(`  📁 Imágenes en: ${OUTPUT_DIR}`);
  console.log(`  📄 CSV resultado: ${OUTPUT_CSV}`);
  console.log('\n✨ ¡Proceso completado!');
}

// Ejecutar
main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
