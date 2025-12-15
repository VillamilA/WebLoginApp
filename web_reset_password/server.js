const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

// Cargar .env - En Railway las variables ya están en process.env
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {}

const app = express();
const PORT = process.env.PORT || 3000;

// Log para verificar variables al iniciar
console.log('=== Variables de entorno ===');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Cargada' : '❌ NO cargada');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Cargada' : '❌ NO cargada');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.get('/reset-password', async (req, res) => {
  const code = req.query.code;
  
  console.log('\n========== /reset-password ==========');
  console.log('Code recibido:', code ? code.substring(0, 20) + '...' : 'ninguno');
  
  if (code) {
    // Verificar que tenemos las credenciales
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('❌ Variables de entorno NO configuradas');
      return res.send(`
        <html><body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>Error de configuración</h1>
          <p>Las variables de entorno no están configuradas en el servidor.</p>
        </body></html>
      `);
    }

    try {
      console.log('Intercambiando code por access_token...');
      
      // Intentar con verify endpoint (correcto para recovery)
      const response = await fetch(
        `${process.env.SUPABASE_URL}/auth/v1/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            type: 'recovery',
            token: code
          })
        }
      );

      console.log('Respuesta status:', response.status);
      const data = await response.json();
      console.log('Respuesta:', JSON.stringify(data, null, 2));
      
      if (data.access_token) {
        console.log('✅ Access token obtenido!');
        return res.redirect(`/reset-password#access_token=${data.access_token}`);
      }
      
      // Si no funcionó, intentar con /token endpoint
      console.log('Intentando con /token endpoint...');
      const response2 = await fetch(
        `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=id_token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            id_token: code
          })
        }
      );

      const data2 = await response2.json();
      console.log('Respuesta /token:', response2.status, JSON.stringify(data2, null, 2));
      
      if (data2.access_token) {
        console.log('✅ Access token obtenido con /token!');
        return res.redirect(`/reset-password#access_token=${data2.access_token}`);
      }
      
      console.log('❌ No se pudo obtener access_token');
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  } else {
    console.log('No hay code, sirviendo página normal');
  }
  
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    env_loaded: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
