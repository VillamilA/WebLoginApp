const SUPABASE_URL = 'https://qbkluvtdstlrobipdgau.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFia2x1dnRkc3Rscm9iaXBkZ2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMTU4MTgsImV4cCI6MjA4MDg5MTgxOH0.j-rEroX8egqEizCZ1aFJVC96u8olwU6U_hdOfdcGczU';

document.getElementById('resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorDiv = document.getElementById('error');
  const successDiv = document.getElementById('success');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnLoader = document.getElementById('btnLoader');

  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';

  if (password !== confirmPassword) {
    errorDiv.textContent = 'Las contraseñas no coinciden';
    errorDiv.style.display = 'block';
    return;
  }

  if (password.length < 6) {
    errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
    errorDiv.style.display = 'block';
    return;
  }

  // Obtener code de la URL (parámetro de query)
  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get('code');

  if (!code) {
    errorDiv.textContent = 'Token inválido o expirado';
    errorDiv.style.display = 'block';
    return;
  }

  submitBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline-block';

  try {
    // Primero, intercambiar el code por un access_token
    const tokenResponse = await fetch(`${SUPABASE_URL}/auth/v1/oauth/code/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        code: code,
        grant_type: 'recovery'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('No se pudo validar el token de recuperación');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Ahora cambiar la contraseña con el access_token
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ password })
    });

    if (response.ok) {
      successDiv.textContent = '¡Contraseña actualizada exitosamente!';
      successDiv.style.display = 'block';
      document.getElementById('resetForm').reset();

      setTimeout(() => {
        window.close();
      }, 3000);
    } else {
      const error = await response.json();
      errorDiv.textContent = error.message || 'Error al actualizar contraseña';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    errorDiv.textContent = 'Error de conexión. Intenta nuevamente.';
    errorDiv.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
  }
});
