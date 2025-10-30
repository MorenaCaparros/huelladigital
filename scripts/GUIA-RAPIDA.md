# ⚡ GUÍA RÁPIDA - Generar Huellas Masivamente

## 🎯 Pasos Simples

### 1️⃣ Exporta tu Google Sheet
```
Archivo → Descargar → CSV
Guarda como: scripts/data.csv
```

### 2️⃣ Instala dependencias (solo la primera vez)
```powershell
cd scripts
npm install
```

### 3️⃣ Inicia la app Next.js
```powershell
# En una terminal separada, desde la raíz del proyecto:
npm run dev
```

### 4️⃣ Genera las huellas
```powershell
# Desde la carpeta scripts:
npm run generate
```

### 5️⃣ Encuentra los resultados
```
📁 scripts/output/
   ├── huella-usuario1_example_com.png
   ├── huella-usuario2_example_com.png
   └── emails-con-imagenes.csv
```

## 📧 Enviar por Email

### Opción 1: Gmail (Simple)
1. Abre Gmail
2. Adjunta la imagen correspondiente
3. Copia/pega el email personalizado

### Opción 2: Mail Merge (Automático)
1. Sube imágenes a Google Drive
2. Usa [Yet Another Mail Merge](https://workspace.google.com/marketplace/app/yet_another_mail_merge/153974686046)
3. Crea plantilla con placeholders: `{{nombre}}`, `{{imagen}}`

### Opción 3: SendGrid (Profesional)
- Requiere cuenta SendGrid
- Script personalizado (contáctame si necesitas ayuda)

## 🐛 Problemas Comunes

**"Cannot find module"**
→ Ejecuta `npm install` en la carpeta scripts

**"data.csv not found"**
→ Verifica que el CSV esté en `scripts/data.csv`

**App no corre en localhost:3000**
→ Ejecuta `npm run dev` desde la raíz del proyecto

**Imágenes salen en blanco**
→ Espera que la app termine de cargar en localhost:3000

## ⏱️ Tiempo Estimado

- **10 usuarios**: ~1 minuto
- **100 usuarios**: ~8 minutos
- **500 usuarios**: ~40 minutos

## 💡 Ejemplo de Email

```
Asunto: Tu Huella IA - Evento Global.IA 2025

Hola {{nombre}},

¡Gracias por participar! 🎉

Aquí está tu Huella IA personalizada que muestra cómo evolucionó tu 
percepción sobre la IA durante el evento.

[Imagen adjunta]

Saludos,
Equipo Global.IA
```

## ✅ ¡Eso es todo!

Simple, rápido y automático. 🚀
