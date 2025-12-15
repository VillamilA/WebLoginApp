const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config(path.join(__dirname, '../.env'));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.get('/reset-password', async (req, res) => {
  const code = req.query.code;
  
  // Si viene el code, intercambiarlo por access_token
  if (code) {
    try {
      const response = await fetch(
        `${process.env.SUPABASE_URL}/auth/v1/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            token: code,
            type: 'recovery'
          })
        }
      );

      const data = await response.json();
      
      if (data.access_token) {
        // Redirigir con el access_token en el hash
        return res.redirect(`/reset-password#access_token=${data.access_token}`);
      }
    } catch (error) {
      console.error('Error intercambiando code:', error);
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
