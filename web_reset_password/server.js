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
  
  // Si viene code, intercambiarlo por access_token
  if (code) {
    try {
      console.log('Intercambiando code por access_token...');
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

      const data = await response.json();
      console.log('Respuesta:', response.status, JSON.stringify(data));
      
      if (data.access_token) {
        console.log('✅ Token obtenido, redirigiendo...');
        return res.redirect(`/reset-password#access_token=${data.access_token}`);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
