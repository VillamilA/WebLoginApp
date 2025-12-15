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

  // Obtener access token de la URL
  const hash = window.location.hash.substring(1);
  const search = window.location.search.substring(1);
  const hashParams = new URLSearchParams(hash);
  const searchParams = new URLSearchParams(search);
  
  // Primero verificar si hay errores en la URL
  const error = hashParams.get('error') || searchParams.get('error');
  const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');
  
  if (error) {
    errorDiv.textContent = `Error de Supabase: ${errorDescription || error}`;
    errorDiv.style.display = 'block';
    console.error('Supabase error:', error, errorDescription);
    return;
  }
  
  const accessToken = hashParams.get('access_token');

  if (!accessToken) {
    errorDiv.textContent = 'Token inválido o expirado. Revisa que el link sea correcto y no haya sido usado antes.';
    errorDiv.style.display = 'block';
    console.error('No access_token in URL. Hash:', hash, 'Search:', search);
    return;
  }

  submitBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline-block';

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
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
