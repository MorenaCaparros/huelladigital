# Envío de Huellas por Email

Este documento explica cómo usar las imágenes de las Huellas IA guardadas en Google Sheets para enviarlas por email a los participantes.

## Estructura de datos en Google Sheets

Cada usuario tendrá **3 filas** en el sheet:

1. **Fila Pre-Survey** (`type = "pre-survey"`):
   - Respuestas antes del evento
   - Textos de esperanza y preocupación inicial

2. **Fila Post-Survey** (`type = "post-survey"`):
   - Respuestas después del evento
   - Textos de esperanza y preocupación final

3. **Fila Huella Image** (`type = "huella-image"`):
   - Columna `huella_image` con la imagen en formato **base64 (data:image/png;base64,...)**
   - Esta imagen contiene la visualización completa de la huella con el radar chart

## Cómo identificar las imágenes de cada usuario

Todas las filas del mismo usuario tienen el **mismo `userId`**. Para obtener la imagen de un usuario:

```javascript
// En Google Apps Script
function buscarHuellaPorEmail(email) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Buscar el userId del email
  for (let i = 1; i < data.length; i++) {
    if (data[i][4] === email && data[i][5] === 'huella-image') {
      return {
        userId: data[i][1],
        nombre: data[i][2],
        apellido: data[i][3],
        email: data[i][4],
        huellaImage: data[i][14] // columna huella_image
      };
    }
  }
  return null;
}
```

## Opción 1: Enviar email con Google Apps Script

Puedes agregar esta función a tu script de Google Sheets:

```javascript
function enviarHuellaPorEmail(email) {
  const huella = buscarHuellaPorEmail(email);
  
  if (!huella) {
    Logger.log('No se encontró huella para: ' + email);
    return;
  }
  
  // Convertir base64 a blob
  const base64Image = huella.huellaImage.split(',')[1];
  const blob = Utilities.newBlob(
    Utilities.base64Decode(base64Image), 
    'image/png', 
    'mi-huella-ia.png'
  );
  
  // Enviar email
  MailApp.sendEmail({
    to: email,
    subject: '✨ Tu Huella IA del evento #IAxMDP2025',
    htmlBody: `
      <h2>¡Hola ${huella.nombre}!</h2>
      <p>Gracias por participar en el evento de Global.IA 🤖</p>
      <p>Acá está tu Huella IA personalizada que muestra cómo evolucionó tu percepción sobre la Inteligencia Artificial durante el evento.</p>
      <p>Te invitamos a compartirla en tus redes con <strong>#IAxMDP2025</strong> y <strong>@globaliaok</strong></p>
      <br>
      <p>¡Esperamos verte en próximos eventos!</p>
      <p>Equipo Global.IA</p>
      <p><a href="https://www.globalia.org">www.globalia.org</a></p>
    `,
    attachments: [blob]
  });
  
  Logger.log('Email enviado a: ' + email);
}

// Enviar a todos los participantes
function enviarTodasLasHuellas() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const enviados = {};
  
  for (let i = 1; i < data.length; i++) {
    const email = data[i][4];
    const type = data[i][5];
    
    // Solo procesar filas de huella-image y evitar duplicados
    if (type === 'huella-image' && email && !enviados[email]) {
      try {
        enviarHuellaPorEmail(email);
        enviados[email] = true;
        Utilities.sleep(1000); // Esperar 1 segundo entre envíos
      } catch (error) {
        Logger.log('Error enviando a ' + email + ': ' + error);
      }
    }
  }
  
  Logger.log('Proceso completado. Emails enviados: ' + Object.keys(enviados).length);
}
```

**Importante:** Google Apps Script tiene límites de envío:
- Cuentas gratuitas: 100 emails/día
- Google Workspace: 1500 emails/día

## Opción 2: Exportar a CSV y usar servicio de email marketing

1. **Exportar los datos:**
   - En Google Sheets: Archivo → Descargar → CSV
   - O usa Google Apps Script para exportar solo las filas de huellas

2. **Usar servicios como:**
   - Mailchimp (gratis hasta 500 contactos)
   - SendGrid (gratis hasta 100 emails/día)
   - Brevo (ex Sendinblue, gratis hasta 300 emails/día)

3. **Template del email:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tu Huella IA</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #6366f1;">✨ Tu Huella IA</h1>
  <p>¡Hola {{nombre}}!</p>
  <p>Gracias por participar en el evento <strong>#IAxMDP2025</strong> de Global.IA 🤖</p>
  <p>Acá está tu Huella IA personalizada:</p>
  <img src="{{huella_image_url}}" alt="Mi Huella IA" style="width: 100%; max-width: 500px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  <p>Esta visualización muestra cómo evolucionó tu percepción sobre la Inteligencia Artificial durante el evento.</p>
  <p style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
    💡 <strong>¿Te gustó tu Huella IA?</strong><br>
    Compartila en tus redes con <strong>#IAxMDP2025</strong> y etiquetanos <strong>@globaliaok</strong>
  </p>
  <p>¡Esperamos verte en próximos eventos!</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  <p style="color: #6b7280; font-size: 14px;">
    <strong>Global.IA</strong><br>
    🌐 <a href="https://www.globalia.org" style="color: #6366f1;">www.globalia.org</a><br>
    📱 <a href="https://wa.me/5491156449265" style="color: #6366f1;">WhatsApp</a> | 
    📷 <a href="https://instagram.com/globaliaok" style="color: #6366f1;">@globaliaok</a>
  </p>
</body>
</html>
```

## Opción 3: Convertir base64 a archivos PNG

Si querés descargar todas las imágenes como archivos PNG:

```javascript
// En Google Apps Script
function exportarTodasLasHuellas() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const folder = DriveApp.createFolder('Huellas IA - ' + new Date().toISOString());
  
  for (let i = 1; i < data.length; i++) {
    const type = data[i][5];
    if (type === 'huella-image') {
      const nombre = data[i][2];
      const apellido = data[i][3];
      const imageData = data[i][14];
      
      if (imageData && imageData.startsWith('data:image/png;base64,')) {
        const base64 = imageData.split(',')[1];
        const blob = Utilities.newBlob(
          Utilities.base64Decode(base64), 
          'image/png', 
          `${nombre}-${apellido}.png`
        );
        folder.createFile(blob);
        Logger.log('Exportada huella de: ' + nombre + ' ' + apellido);
      }
    }
  }
  
  Logger.log('Carpeta creada: ' + folder.getUrl());
}
```

## Consejos

1. **Privacidad:** Las imágenes base64 pueden ser muy largas. Si el sheet se pone muy pesado, considera guardar las imágenes en Google Drive y en el sheet solo guardar la URL.

2. **Personalización:** Podés personalizar el email según las respuestas del usuario (por ejemplo, mencionar sus áreas de mayor interés).

3. **Timing:** Es mejor enviar los emails 1-2 días después del evento para darles tiempo de procesar la experiencia.

4. **Testing:** Antes de enviar masivamente, probá con tu propio email para verificar que todo se vea bien.

## Límites y consideraciones

- **Tamaño de la celda:** Google Sheets tiene un límite de ~50,000 caracteres por celda. Una imagen base64 PNG puede ocupar 100-500 KB (aproximadamente 130,000-650,000 caracteres). Si es demasiado grande, considera reducir la calidad de la imagen o guardarla en Drive.

- **Performance:** Con muchas imágenes, el sheet puede volverse lento. Considera crear una hoja separada solo para las imágenes.

- **Alternativa recomendada:** Guardar las imágenes en Google Drive y en el sheet solo guardar la URL:

```javascript
function guardarImagenEnDrive(base64Image, nombre, apellido, userId) {
  const folder = DriveApp.getFolderById('ID_DE_TU_CARPETA');
  const base64 = base64Image.split(',')[1];
  const blob = Utilities.newBlob(
    Utilities.base64Decode(base64), 
    'image/png', 
    `huella-${userId}.png`
  );
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return file.getUrl();
}
```

Luego guarda esta URL en el sheet en lugar del base64 completo.
