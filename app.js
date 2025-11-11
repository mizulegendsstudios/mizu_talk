// 1. Configuración e inicialización (UNA sola instancia)
const SUPABASE_URL = 'https://vicmgzclxyfjrlzgasqn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpY21nemNseHlmanJsemdhc3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDA5ODAsImV4cCI6MjA3ODM3Njk4MH0.CuCN5Zd-tGlSlMN0amFN4hh_LwCioVrL0RGse7r0oCo';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Referencias DOM
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubmit = document.getElementById('auth-submit');
const toggleAuth = document.getElementById('toggle-auth');
const postForm = document.getElementById('post-form');
const postContent = document.getElementById('post-content');
const postsList = document.getElementById('posts-list');
const userEmailSpan = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');

let isSignUpMode = false;
let currentUser = null;

// 3. Procesar tokens del hash al inicio (robusto)
(async function processAuthHashAtStartup() {
  try {
    const hash = window.location.hash || '';
    if (hash.includes('access_token=')) {
      // Intento 1: usar getSessionFromUrl (v1 SDK)
      if (supabase && supabase.auth && typeof supabase.auth.getSessionFromUrl === 'function') {
        try {
          const result = await supabase.auth.getSessionFromUrl({ storeSession: true });
          if (result?.error) {
            console.warn('getSessionFromUrl error:', result.error);
          } else {
            console.info('Session from getSessionFromUrl:', result.data?.session);
          }
        } catch (err) {
          console.warn('getSessionFromUrl threw:', err);
        }
      }

      // Intento 2: fallback manual parse + setSession
      try {
        const params = new URLSearchParams(hash.substring(1));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });
          if (error) console.warn('setSession error:', error);
          else console.info('Session set via setSession:', data?.session);
        }
      } catch (err) {
        console.warn('Fallback setSession threw:', err);
      }

      // Limpiar la URL siempre (replaceState; si falla, replace para forzar recarga)
      try {
        const cleanUrl = window.location.pathname + window.location.search;
        history.replaceState(null, '', cleanUrl);
        if (window.location.hash) {
          // Último recurso: recargar sin hash
          window.location.replace(cleanUrl);
        }
      } catch (err) {
        console.warn('Error limpiando URL:', err);
      }
    }
  } catch (e) {
    console.error('processAuthHashAtStartup error:', e);
  }
})();

// 4. Manejo de autenticación
async function handleAuth(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (isSignUpMode) {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { emailRedirectTo: window.location.origin }
    });
    
    if (error) {
      alert(error.message);
    } else {
      authTitle.textContent = 'Verifica tu correo';
      authForm.innerHTML = `
        <p>Te hemos enviado un correo de verificación. Por favor, revisa tu bandeja de entrada y sigue las instrucciones.</p>
        <button type="button" id="back-to-login">Volver al inicio de sesión</button>
      `;
      
      document.getElementById('back-to-login').addEventListener('click', () => {
        isSignUpMode = false;
        authTitle.textContent = 'Iniciar Sesión';
        authForm.innerHTML = `
          <input type="email" id="email" placeholder="Email" required>
          <input type="password" id="password" placeholder="Contraseña" required>
          <button type="submit" id="auth-submit">Entrar</button>
        `;
        toggleAuth.textContent = '¿No tienes cuenta? Regístrate';
        
        // Volver a añadir los event listeners
        document.getElementById('auth-submit').addEventListener('click', handleAuth);
        authForm.addEventListener('submit', handleAuth);
      });
    }
  } else {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  }
}

function toggleAuthMode() {
  isSignUpMode = !isSignUpMode;
  authTitle.textContent = isSignUpMode ? 'Registrarse' : 'Iniciar Sesión';
  authSubmit.textContent = isSignUpMode ? 'Crear Cuenta' : 'Entrar';
  toggleAuth.textContent = isSignUpMode ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate';
}

async function handleLogout() {
  const { error } = await supabase.auth.signOut();
  if (error) alert(error.message);
}

// 5. Manejo de posts
async function createPost(event) {
  event.preventDefault();
  const content = postContent.value;

  if (!content.trim()) return;

  const { error } = await supabase
      .from('posts')
      .insert({ content, user_id: currentUser.id });

  if (error) {
      console.error('Error al crear post:', error);
      alert('No se pudo publicar.');
  } else {
      postContent.value = '';
      fetchPosts();
  }
}

async function fetchPosts() {
  const { data, error } = await supabase
      .from('posts')
      .select('content, created_at, user_id')
      .order('created_at', { ascending: false });

  if (error) {
      console.error('Error al obtener posts:', error);
  } else {
      postsList.innerHTML = '';
      data.forEach(post => {
          const postElement = document.createElement('div');
          postElement.classList.add('post');
          postElement.innerHTML = `
              <p class="post-content">${escapeHtml(post.content)}</p>
              <p class="post-meta">Por: ${post.user_id} | ${formatDate(post.created_at)}</p>
          `;
          postsList.appendChild(postElement);
      });
  }
}

// Pequeña función para evitar XSS al insertar texto
function escapeHtml(unsafe) {
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// 6. Formato de fechas
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'hace un momento';
  if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
}

// 7. UI update
function updateUI(user) {
  currentUser = user;
  if (user) {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    userEmailSpan.textContent = user.email;
    fetchPosts();
  } else {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
  }
}

// 8. Inicialización al cargar DOM
document.addEventListener('DOMContentLoaded', async () => {
  // Ya hemos intentado procesar el hash en processAuthHashAtStartup()
  // Ahora verificar sesión actual desde el storage
  try {
    const { data: { session } } = await supabase.auth.getSession();
    updateUI(session?.user ?? null);
  } catch (err) {
    console.warn('Error obteniendo sesión al iniciar:', err);
    updateUI(null);
  }
});

// 9. Event listeners
authForm.addEventListener('submit', handleAuth);
toggleAuth.addEventListener('click', toggleAuthMode);
postForm.addEventListener('submit', createPost);
logoutButton.addEventListener('click', handleLogout);

// 10. Escuchar cambios de auth (mantener UI sincronizada)
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session);
  updateUI(session?.user ?? null);
});
