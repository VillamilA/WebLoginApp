const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch (e) {
  // En producción (Railway)
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.get('/reset-password', async (req, res) => {
  const code = req.query.code;
  
  console.log('\n========== /reset-password ==========');
  console.log('Code recibido:', code);
  
  // Si viene code, intercambiarlo por access_token
  if (code) {
    try {
      console.log('Step 1: Intercambiando code por access_token...');
      console.log('URL:', `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=recovery`);
      
      const response = await fetch(
        `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=recovery`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: code
          })
        }
      );

      console.log('Step 2: Respuesta status:', response.status);
      const data = await response.json();
      console.log('Step 3: Respuesta completa:', JSON.stringify(data, null, 2));
      
      if (data.access_token) {
        console.log('✅ Step 4: Access token obtenido:', data.access_token.substring(0, 30) + '...');
        console.log('✅ Step 5: Redirigiendo a /reset-password#access_token=...');
        return res.redirect(`/reset-password#access_token=${data.access_token}`);
      } else {
        console.log('❌ Step 4: NO se obtuvo access_token');
        console.log('Error:', data.error, data.error_description);
      }
    } catch (error) {
      console.error('❌ Error en intercambio:', error.message);
      console.error('Stack:', error.stack);
    }
  } else {
    console.log('No hay code en la URL, sirviendo página normal');
  }
  
  console.log('Sirviendo reset-password.html\n');
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
