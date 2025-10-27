# Configuración de Google Sheets

Este documento explica cómo conectar la aplicación con Google Sheets para almacenar los datos de las encuestas de forma anónima.

## Paso 1: Crear una copia de la plantilla de Google Sheets

1. Abre Google Sheets
2. Crea una nueva hoja de cálculo o usa la existente con ID: `1eyR1dLxQ6Y5YOS41z8ckaCJ6yvIgB5nB1t6ypwz5QDs`
3. Asegúrate de tener las siguientes columnas en la primera fila:
   - timestamp
   - userId
   - type (pre-survey o post-survey)
   - confianza_ia
   - impacto_laboral
   - regulacion
   - privacidad
   - innovacion
   - esperanza_text
   - preocupacion_text
   - emocion

## Paso 2: Crear el Google Apps Script

1. En tu hoja de cálculo, ve a **Extensiones → Apps Script**
2. Borra el código por defecto y pega el siguiente código:

```javascript
function doPost(e) {
  try {
    // Obtener la hoja activa
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parsear los datos recibidos
    const data = JSON.parse(e.postData.contents);
    
    // Crear array con los valores en el orden de las columnas
    const row = [
      data.timestamp || new Date().toISOString(),
      data.userId || '',
      data.type || '',
      data.confianza_ia || '',
      data.impacto_laboral || '',
      data.regulacion || '',
      data.privacidad || '',
      data.innovacion || '',
      data.esperanza_text || '',
      data.preocupacion_text || '',
      data.emocion || ''
    ];
    
    // Agregar fila a la hoja
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Google Sheets API está funcionando')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

3. Guarda el script con un nombre descriptivo (ej: "HuellaIA-DataCollector")

## Paso 3: Implementar el script

1. Haz clic en **Implementar → Nueva implementación**
2. Selecciona el tipo: **Aplicación web**
3. Configura:
   - **Descripción**: "API para recolección de datos Huella IA"
   - **Ejecutar como**: Yo (tu email)
   - **Quién tiene acceso**: Cualquier persona
4. Haz clic en **Implementar**
5. Autoriza la aplicación (puede requerir verificación)
6. **Copia la URL de implementación** que aparece (algo como: `https://script.google.com/macros/s/AKfycby.../exec`)

## Paso 4: Configurar variables de entorno

1. En tu proyecto, abre o crea el archivo `.env.local`
2. Agrega la URL copiada:

```env
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/TU_SCRIPT_ID_AQUI/exec
```

3. Guarda el archivo
4. **Importante**: Si estás usando Vercel, también debes agregar esta variable en:
   - Ir a tu proyecto en Vercel
   - Settings → Environment Variables
   - Agregar `NEXT_PUBLIC_GOOGLE_SCRIPT_URL` con el valor de la URL
   - Redeployar la aplicación

## Paso 5: Verificar la integración

1. Reinicia el servidor de desarrollo si está corriendo
2. Completa una encuesta de prueba
3. Verifica que los datos aparezcan en tu Google Sheet
4. Los datos deberían aparecer como nuevas filas con:
   - Timestamp automático
   - userId único generado por la app
   - type: "pre-survey" o "post-survey"
   - Todas las respuestas de la encuesta

## Notas importantes

- Los datos son completamente anónimos (solo se guarda un userId generado aleatoriamente)
- No se guarda nombre, apellido, email ni ningún dato personal identificable en Google Sheets
- Si la URL no está configurada, la app seguirá funcionando sin problemas, solo no guardará en Sheets
- Puedes cambiar el orden de las columnas en el script si necesitas otro formato

## Solución de problemas

### Los datos no llegan a Google Sheets

1. Verifica que la URL en `.env.local` sea correcta y termine en `/exec`
2. Asegúrate de haber autorizado el script correctamente
3. Verifica que el script tenga acceso "Cualquier persona"
4. Revisa la consola del navegador (F12) para ver errores

### Error de CORS

- Es normal ver advertencias de CORS en la consola
- El modo `no-cors` está configurado correctamente
- Los datos se envían exitosamente aunque aparezca el warning

### Necesito actualizar el script después de implementar

1. Haz los cambios en el código del script
2. Ve a **Implementar → Administrar implementaciones**
3. Haz clic en el ícono de lápiz junto a tu implementación
4. Cambia a **Nueva versión**
5. Guarda
