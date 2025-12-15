const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

// Cargar .env solo si existe (para desarrollo local)
try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch (e) {
  // En producción (Railway), las variables están en process.env
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.get('/reset-password', async (req, res) => {
  const code = req.query.code;
  
  console.log('=== /reset-password request ===');
  console.log('Code:', code);
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);
  
  // Si viene el code, intercambiarlo por access_token
  if (code) {
    try {
      console.log('Intentando intercambiar code...');
      const response = await fetch(
        `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=pkce`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            code: code
          })
        }
      );

      console.log('Respuesta de Supabase status:', response.status);
      const data = await response.json();
      console.log('Respuesta de Supabase:', JSON.stringify(data, null, 2));
      
      if (data.access_token) {
        console.log('✅ Access token obtenido, redirigiendo...');
        return res.redirect(`/reset-password#access_token=${data.access_token}`);
      } else {
        console.log('❌ No se obtuvo access_token');
      }
    } catch (error) {
      console.error('❌ Error intercambiando code:', error.message);
      console.error('Stack:', error.stack);
    }
  } else {
    console.log('No hay code en la URL');
  }
  
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
