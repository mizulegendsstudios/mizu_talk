// Configuración e inicialización
const SUPABASE_URL = 'https://vicmgzclxyfjrlzgasqn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpY21nemNseHlmanJsemdhc3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDA5ODAsImV4cCI6MjA3ODM3Njk4MH0.CuCN5Zd-tGlSlMN0amFN4hh_LwCioVrL0RGse7r0oCo';

if (!window.supabase) {
  console.error('El SDK de Supabase no está cargado. Incluye el script CDN antes de app.js');
}
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM
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

// URL de redirect exacta que debe coincidir con Redirect URLs en Supabase
const EMAIL_REDIRECT_TO = 'https://mizulegendsstudios.github.io/mizu_talk';

// Procesar tokens en el hash al inicio (intenta setSession y limpia la URL)
(async function processAuthHashAtStartup() {
  try {
    const hash = window.location.hash || '';
    if (hash.includes('access_token=')) {
      // Intento con getSessionFromUrl si está disponible
      if (supabaseClient.auth && typeof supabaseClient.auth.getSessionFromUrl === 'function') {
        try {
          const result = await supabaseClient.auth.getSessionFromUrl({ storeSession: true });
          if (result?.error) console.warn('getSessionFromUrl error:', result.error);
        } catch (err) {
          console.warn('getSessionFromUrl threw:', err);
        }
      }

      // Fallback manual: parsear tokens y setSession
      try {
        const params = new URLSearchParams(hash.substring(1));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token && supabaseClient.auth && typeof supabaseClient.auth.setSession === 'function') {
          const { data, error } = await supabaseClient.auth.setSession({
            access_token,
            refresh_token
          });
          if (error) console.warn('setSession error:', error);
          else console.info('Session set via setSession:', data?.session);
        }
      } catch (err) {
        console.warn('Fallback setSession threw:', err);
      }

      // Limpiar URL
      try {
        const cleanUrl = window.location.pathname + window.location.search;
        history.replaceState(null, '', cleanUrl);
        if (window.location.hash) {
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

// Manejo de autenticación (registro / login)
async function handleAuth(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (isSignUpMode) {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: EMAIL_REDIRECT_TO }
    });

    if (error) {
      alert(error.message);
    } else {
      authTitle.textContent = 'Verifica tu correo';
      authForm.innerHTML = `
        <p>Te hemos enviado un correo de verificación a <strong>${escapeHtml(email)}</strong>. Revisa tu bandeja y la carpeta de spam.</p>
        <button type="button" id="back-to-login">Volver al inicio de sesión</button>
      `;
      document.getElementById('back-to-login').addEventListener('click', () => {
        isSignUpMode = false;
        renderAuthForm();
      });
    }
  } else {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    // onAuthStateChange actualizará la UI cuando la sesión cambie
  }
}

function toggleAuthMode() {
  isSignUpMode = !isSignUpMode;
  renderAuthForm();
}

function renderAuthForm() {
  authTitle.textContent = isSignUpMode ? 'Registrarse' : 'Iniciar Sesión';
  authSubmit.textContent = isSignUpMode ? 'Crear Cuenta' : 'Entrar';
  toggleAuth.textContent = isSignUpMode ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate';
  authForm.innerHTML = `
    <input type="email" id="email" placeholder="Email" required>
    <input type="password" id="password" placeholder="Contraseña" required>
    <button type="submit" id="auth-submit">${isSignUpMode ? 'Crear Cuenta' : 'Entrar'}</button>
  `;
  document.getElementById('auth-submit').addEventListener('click', handleAuth);
}

async function handleLogout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) alert(error.message);
}

// Posts
async function createPost(event) {
  event.preventDefault();
  const content = postContent.value;
  if (!content.trim()) return;

  const { error } = await supabaseClient
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
  const { data, error } = await supabaseClient
    .from('posts')
    .select('id, content, created_at, user_id')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener posts:', error);
  } else {
    postsList.innerHTML = '';
    data.forEach(post => {
      const postElement = document.createElement('div');
      postElement.classList.add('post');
      // Aseguramos data-id y data-type (post)
      postElement.setAttribute('data-id', post.id);
      postElement.setAttribute('data-type', 'post');

      postElement.innerHTML = `
        <p class="post-content">${escapeHtml(post.content)}</p>
        <p class="post-meta">Por: ${post.user_id} | ${formatDate(post.created_at)}</p>
        <div class="acl-controls">
          <input class="acl-target" placeholder="Target user UUID" />
          <button class="acl-add">Agregar ACL</button>
          <button class="acl-remove">Remover ACL</button>
          <div class="acl-msg" aria-live="polite"></div>
        </div>
      `;
      postsList.appendChild(postElement);
    });
  }
}

// Utilidades
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

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

// UI update
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

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  renderAuthForm();

  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    updateUI(session?.user ?? null);
  } catch (err) {
    console.warn('Error obteniendo sesión al iniciar:', err);
    updateUI(null);
  }
});

// Listeners
authForm.addEventListener('submit', handleAuth);
toggleAuth.addEventListener('click', toggleAuthMode);
postForm.addEventListener('submit', createPost);
logoutButton.addEventListener('click', handleLogout);

// Escuchar cambios de auth
if (supabaseClient.auth && typeof supabaseClient.auth.onAuthStateChange === 'function') {
  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event, session);
    updateUI(session?.user ?? null);
  });
} else {
  console.warn('onAuthStateChange no disponible en esta versión del SDK.');
}

// Delegación para botones ACL (usa window.__acl.manageAcl expuesto desde index.html)
document.addEventListener('click', async (e) => {
  if (e.target.matches('.acl-add') || e.target.matches('.acl-remove')) {
    const isAdd = e.target.matches('.acl-add');
    const container = e.target.closest('.post');
    if (!container) return;
    const id = container.dataset.id;
    const target = container.dataset.type || 'post';
    const input = container.querySelector('.acl-target');
    const user_id = input?.value?.trim();
    const msgEl = container.querySelector('.acl-msg');

    if (!user_id) { 
      if (msgEl) msgEl.textContent = 'Ingrese user UUID'; 
      return; 
    }

    if (!window.__acl || typeof window.__acl.manageAcl !== 'function') {
      if (msgEl) msgEl.textContent = 'Función ACL no disponible';
      console.error('window.__acl.manageAcl no está disponible. ¿Cargaste src/logic/acl.js o el script inline en index.html?');
      return;
    }

    try {
      if (msgEl) msgEl.textContent = 'Procesando...';
      const result = await window.__acl.manageAcl({ action: isAdd ? 'add' : 'remove', target, id, user_id });
      if (msgEl) msgEl.textContent = 'OK';
      console.log('manageAcl result', result);
    } catch (err) {
      console.error('manageAcl error', err);
      if (err && err.status === 403) {
        if (msgEl) msgEl.textContent = 'Solo el propietario puede modificar ACLs';
      } else if (err && err.status === 401) {
        if (msgEl) msgEl.textContent = 'No autenticado';
      } else {
        if (msgEl) msgEl.textContent = err?.message || 'Error';
      }
    }
  }
});
