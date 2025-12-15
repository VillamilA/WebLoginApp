// IMPORTANTE: Reemplaza estos valores con tus credenciales de Supabase
const SUPABASE_URL = 'https://qbkluvtdstlrobipdgau.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFia2x1dnRkc3Rscm9iaXBkZ2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMTU4MTgsImV4cCI6MjA4MDg5MTgxOH0.j-rEroX8egqEizCZ1aFJVC96u8olwU6U_hdOfdcGczU';

// Elementos del DOM
const resetForm = document.getElementById('resetForm');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const errorDiv = document.getElementById('error');
const successDiv = document.getElementById('success');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');

// Función para mostrar errores
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  successDiv.style.display = 'none';
}

// Función para mostrar éxito
function showSuccess(message) {
  successDiv.textContent = message;
  successDiv.style.display = 'block';
  errorDiv.style.display = 'none';
}

// Función para ocultar mensajes
function hideMessages() {
  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';
}

// Función para mostrar/ocultar loader
function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  btnText.style.display = isLoading ? 'none' : 'inline';
  btnLoader.style.display = isLoading ? 'inline-block' : 'none';
}

// Validar formato de email (opcional, por si quieres agregar validación)
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Obtener el access token de la URL
function getAccessTokenFromUrl() {
  // El token viene en el hash (#) de la URL
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get('access_token');
}

// Verificar si hay un token en la URL al cargar
window.addEventListener('DOMContentLoaded', () => {
  const token = getAccessTokenFromUrl();
  
  if (!token) {
    showError('Token inválido o expirado. Por favor solicita un nuevo enlace de recuperación.');
    submitBtn.disabled = true;
    return;
  }

  // Verificar que las credenciales de Supabase estén configuradas
  if (SUPABASE_URL === 'https://qbkluvtdstlrobipdgau.supabase.co' || 
      SUPABASE_KEY === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFia2x1dnRkc3Rscm9iaXBkZ2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMTU4MTgsImV4cCI6MjA4MDg5MTgxOH0.j-rEroX8egqEizCZ1aFJVC96u8olwU6U_hdOfdcGczU') {
    showError('Error de configuración: Por favor configura las credenciales de Supabase en app.js');
    submitBtn.disabled = true;
    return;
  }

  console.log('Token encontrado, formulario listo');
});

// Manejar el envío del formulario
resetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessages();

  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Validaciones
  if (!password || !confirmPassword) {
    showError('Por favor completa todos los campos');
    return;
  }

  if (password !== confirmPassword) {
    showError('Las contraseñas no coinciden');
    confirmPasswordInput.focus();
    return;
  }

  if (password.length < 6) {
    showError('La contraseña debe tener al menos 6 caracteres');
    passwordInput.focus();
    return;
  }

  // Obtener access token de la URL
  const accessToken = getAccessTokenFromUrl();

  if (!accessToken) {
    showError('Token inválido o expirado. Por favor solicita un nuevo enlace.');
    return;
  }

  // Mostrar loading
  setLoading(true);

  try {
    // Llamar a la API de Supabase para actualizar la contraseña
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ password })
    });

    const data = await response.json();

    if (response.ok) {
      // Éxito
      showSuccess('¡Contraseña actualizada exitosamente! Puedes cerrar esta ventana.');
      resetForm.reset();

      // Opcional: Cerrar la ventana después de 3 segundos
      setTimeout(() => {
        window.close();
      }, 3000);
    } else {
      // Error de la API
      const errorMessage = data.message || data.error_description || 'Error al actualizar contraseña';
      
      if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        showError('El enlace ha expirado. Por favor solicita un nuevo enlace de recuperación.');
      } else {
        showError(errorMessage);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    showError('Error de conexión. Por favor verifica tu internet e intenta nuevamente.');
  } finally {
    setLoading(false);
  }
});

// Validación en tiempo real de coincidencia de contraseñas
confirmPasswordInput.addEventListener('input', () => {
  if (confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
    confirmPasswordInput.setCustomValidity('Las contraseñas no coinciden');
  } else {
    confirmPasswordInput.setCustomValidity('');
  }
});

// Mostrar/ocultar contraseña (opcional - puedes agregar botones)
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
  } else {
    input.type = 'password';
  }
}

// Log para debugging (puedes comentar en producción)
console.log('Reset Password Page Loaded');
console.log('Supabase URL configured:', SUPABASE_URL !== 'https://qbkluvtdstlrobipdgau.supabase.co');
console.log('Supabase Key configured:', SUPABASE_KEY !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFia2x1dnRkc3Rscm9iaXBkZ2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMTU4MTgsImV4cCI6MjA4MDg5MTgxOH0.j-rEroX8egqEizCZ1aFJVC96u8olwU6U_hdOfdcGczU');