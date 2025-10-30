import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Esta ruta genera el HTML para capturar con Puppeteer
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Extraer datos de query params
  const userData = {
    nombre: searchParams.get('nombre') || '',
    apellido: searchParams.get('apellido') || '',
    email: searchParams.get('email') || '',
    userId: searchParams.get('userId') || '',
  };
  
  const preSurveyData = {
    q1: Number(searchParams.get('pre_q1')) || 0,
    q2: Number(searchParams.get('pre_q2')) || 0,
    q3: Number(searchParams.get('pre_q3')) || 0,
    q4: Number(searchParams.get('pre_q4')) || 0,
    q5: Number(searchParams.get('pre_q5')) || 0,
    esperanza_text: searchParams.get('pre_esperanza') || '',
    preocupacion_text: searchParams.get('pre_preocupacion') || '',
    emocion: searchParams.get('pre_emocion') || '',
  };
  
  const postSurveyData = {
    q1: Number(searchParams.get('post_q1')) || 0,
    q2: Number(searchParams.get('post_q2')) || 0,
    q3: Number(searchParams.get('post_q3')) || 0,
    q4: Number(searchParams.get('post_q4')) || 0,
    q5: Number(searchParams.get('post_q5')) || 0,
    esperanza_text: searchParams.get('post_esperanza') || '',
    preocupacion_text: searchParams.get('post_preocupacion') || '',
    emocion: searchParams.get('post_emocion') || '',
  };

  // Generar HTML completo con los datos
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Huella IA - ${userData.nombre} ${userData.apellido}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #ffffff;
      padding: 40px;
    }
    #huella-container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    h1 { 
      font-size: 32px; 
      color: #1a1a1a; 
      margin-bottom: 20px;
      text-align: center;
    }
    .user-info {
      text-align: center;
      margin-bottom: 40px;
      color: #666;
    }
    .section {
      margin-bottom: 40px;
    }
    .section h2 {
      font-size: 24px;
      color: #333;
      margin-bottom: 20px;
    }
    .radar-chart {
      width: 100%;
      height: 400px;
      margin: 20px 0;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .stat {
      text-align: center;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 10px;
    }
    .stat-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    .stat-change {
      font-size: 14px;
      margin-top: 5px;
    }
    .stat-change.positive { color: #10b981; }
    .stat-change.negative { color: #ef4444; }
    .stat-change.neutral { color: #6b7280; }
    .text-analysis {
      background: #f9fafb;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    .text-analysis h3 {
      font-size: 18px;
      margin-bottom: 10px;
      color: #333;
    }
    .text-content {
      color: #666;
      line-height: 1.6;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div id="huella-container">
    <h1>🤖 Tu Huella IA</h1>
    <div class="user-info">
      <p><strong>${userData.nombre} ${userData.apellido}</strong></p>
      <p>${userData.email}</p>
    </div>

    <div class="section">
      <h2>📊 Evolución de Percepciones</h2>
      <canvas id="radarChart" class="radar-chart"></canvas>
    </div>

    <div class="section">
      <h2>📈 Cambios por Área</h2>
      <div class="stats">
        ${generateStatHTML('Productividad IA', preSurveyData.q1, postSurveyData.q1)}
        ${generateStatHTML('Preparación Social', preSurveyData.q2, postSurveyData.q2)}
        ${generateStatHTML('Confianza en IA Médica', preSurveyData.q3, postSurveyData.q3)}
        ${generateStatHTML('Accesibilidad Educativa', preSurveyData.q4, postSurveyData.q4)}
        ${generateStatHTML('Creatividad IA', preSurveyData.q5, postSurveyData.q5)}
      </div>
    </div>

    ${preSurveyData.esperanza_text ? `
    <div class="section">
      <h2>✨ Esperanza sobre la IA</h2>
      <div class="text-analysis">
        <h3>Antes del evento:</h3>
        <p class="text-content">${preSurveyData.esperanza_text}</p>
      </div>
      <div class="text-analysis">
        <h3>Después del evento:</h3>
        <p class="text-content">${postSurveyData.esperanza_text}</p>
      </div>
    </div>
    ` : ''}

    ${preSurveyData.preocupacion_text ? `
    <div class="section">
      <h2>⚠️ Preocupación sobre la IA</h2>
      <div class="text-analysis">
        <h3>Antes del evento:</h3>
        <p class="text-content">${preSurveyData.preocupacion_text}</p>
      </div>
      <div class="text-analysis">
        <h3>Después del evento:</h3>
        <p class="text-content">${postSurveyData.preocupacion_text}</p>
      </div>
    </div>
    ` : ''}
  </div>

  <script>
    const ctx = document.getElementById('radarChart');
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: [
          'Productividad IA',
          'Preparación Social',
          'Confianza en IA Médica',
          'Accesibilidad Educativa',
          'Creatividad IA'
        ],
        datasets: [
          {
            label: 'Antes',
            data: [${preSurveyData.q1}, ${preSurveyData.q2}, ${preSurveyData.q3}, ${preSurveyData.q4}, ${preSurveyData.q5}],
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgb(59, 130, 246)',
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(59, 130, 246)'
          },
          {
            label: 'Después',
            data: [${postSurveyData.q1}, ${postSurveyData.q2}, ${postSurveyData.q3}, ${postSurveyData.q4}, ${postSurveyData.q5}],
            fill: true,
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: 'rgb(16, 185, 129)',
            pointBackgroundColor: 'rgb(16, 185, 129)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(16, 185, 129)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 5,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

function generateStatHTML(label: string, before: number, after: number): string {
  const change = after - before;
  const changeClass = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
  const changeSymbol = change > 0 ? '+' : '';
  
  return `
    <div class="stat">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${after}</div>
      <div class="stat-change ${changeClass}">${changeSymbol}${change}</div>
    </div>
  `;
}
