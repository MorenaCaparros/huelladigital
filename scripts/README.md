# 🚀 Generador Masivo de Huellas IA

Script para generar todas las huellas de una vez desde el CSV de Google Sheets.

## 📋 Requisitos Previos

1. Node.js instalado (v16 o superior)
2. La aplicación corriendo localmente en `http://localhost:3000`
   - O ajustar `BASE_URL` en `generate-huellas.js` para usar Vercel

## 🔧 Instalación

```bash
cd scripts
npm install
```

Esto instalará:
- `puppeteer` (navegador headless para capturar las huellas)
- `csv-parse` (para leer el CSV)

## 📥 Paso 1: Exportar datos de Google Sheets

1. Abre tu Google Sheet con los datos
2. Ve a **Archivo → Descargar → Valores separados por comas (.csv)**
3. Guarda el archivo como: `scripts/data.csv`

El CSV debe tener estas columnas:
```
timestamp,userId,nombre,apellido,email,type,sociedad,preparacion,salud,educacion,arte,esperanza_text,preocupacion_text,emocion
```

## ▶️ Paso 2: Ejecutar el generador

### Opción A: Con servidor local (RECOMENDADO)

```bash
# Terminal 1: Inicia la app Next.js
npm run dev

# Terminal 2: Ejecuta el generador
cd scripts
npm run generate
```

### Opción B: Con Vercel en producción

1. Edita `generate-huellas.js` línea 14:
   ```javascript
   const BASE_URL = 'https://huelladigital-gamma.vercel.app';
   ```

2. Ejecuta:
   ```bash
   cd scripts
   npm run generate
   ```

## 📤 Paso 3: Resultados

El script generará:

### 📁 Carpeta `output/` con:
- `huella-usuario1_example_com.png`
- `huella-usuario2_example_com.png`
- ... (una imagen PNG por cada usuario)

### 📄 CSV de resultados: `output/emails-con-imagenes.csv`
```csv
email,nombre,apellido,imagen,error
usuario1@example.com,"Juan","Pérez",huella-usuario1_example_com.png,
usuario2@example.com,"María","González",huella-usuario2_example_com.png,
```

## 📧 Paso 4: Enviar emails masivos

### Opción 1: Gmail + Mail Merge
1. Instala la extensión [Yet Another Mail Merge](https://workspace.google.com/marketplace/app/yet_another_mail_merge/153974686046)
2. Sube las imágenes a Google Drive
3. Agrega columna "link_imagen" al CSV con los links de Drive
4. Usa YAMM para enviar emails personalizados

### Opción 2: SendGrid + Script
```javascript
// Ejemplo básico (requiere cuenta SendGrid)
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Leer CSV y enviar emails...
```

### Opción 3: Subir a Cloudinary
```bash
# Instalar CLI de Cloudinary
npm install -g cloudinary-cli

# Subir todas las imágenes
cloudinary upload_dir output/ --folder huellas-ia
```

## 🎯 Ejemplo de Email

```html
Hola {{nombre}},

¡Gracias por participar en el evento Global.IA! 🤖✨

Te compartimos tu Huella IA personalizada que muestra cómo evolucionó 
tu percepción sobre la Inteligencia Artificial durante el evento.

[Ver imagen adjunta o link]

¡Esperamos que hayas disfrutado la experiencia!

Equipo Global.IA
```

## 🐛 Solución de Problemas

### Error: "Cannot find module 'puppeteer'"
```bash
cd scripts
npm install
```

### Error: "data.csv not found"
Verifica que el CSV esté en: `scripts/data.csv`

### Error: "Failed to launch chrome"
Puppeteer necesita dependencias del sistema (en Linux):
```bash
sudo apt-get install -y libgbm-dev libxshmfence-dev
```

### Las imágenes salen en blanco
- Asegúrate que la app esté corriendo (`npm run dev`)
- Verifica que `BASE_URL` sea correcto
- Aumenta el timeout en línea 109: `await page.waitForTimeout(5000);`

### Proceso muy lento
- Ajusta el delay entre capturas (línea 140)
- Reduce a menos de 1000ms si tu conexión es buena
- O procesa por lotes (ejecuta varias veces con diferentes CSVs)

## ⚙️ Configuración Avanzada

### Cambiar calidad de imagen
Edita línea 113 en `generate-huellas.js`:
```javascript
await element.screenshot({ 
  path: filepath,
  type: 'png',
  quality: 100, // Solo para JPG
  fullPage: true, // Captura completa
});
```

### Cambiar tamaño
Edita línea 77:
```javascript
await page.setViewport({ width: 1600, height: 4000 });
```

### Modo debug (ver navegador)
Edita línea 162:
```javascript
const browser = await puppeteer.launch({
  headless: false, // Cambia a false para ver el navegador
  args: ['--no-sandbox'],
});
```

## 📊 Rendimiento Estimado

- **Velocidad**: ~10-15 huellas por minuto
- **100 usuarios**: ~7-10 minutos
- **500 usuarios**: ~35-50 minutos

Depende de:
- Velocidad del servidor
- Complejidad de las huellas
- Potencia de tu máquina

## 🎉 ¡Listo!

Ahora tienes todas las huellas generadas y listas para enviar por email.

¿Dudas? Revisa los logs de la consola, el script es verboso y te dirá exactamente qué está pasando.
