// 1. Inicializar Supabase
// Reemplaza con tu URL y tu clave anónima de Supabase
const SUPABASE_URL = 'https://vicmgzclxyfjrlzgasqn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpY21nemNseHlmanJsemdhc3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDA5ODAsImV4cCI6MjA3ODM3Njk4MH0.CuCN5Zd-tGlSlMN0amFN4hh_LwCioVrL0RGse7r0oCo';

// --- ÚNICA Y CORRECTA DECLARACIÓN DEL CLIENTE DE SUPABASE ---
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Referencias a elementos del DOM
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

// 3. Función para procesar tokens en la URL
async function processUrlTokens() {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');
    
    if (accessToken && refreshToken) {
        try {
            const { data, error } = await supabaseClient.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });
            
            if (error) throw error;
            
            // Limpiar la URL para remover los tokens
            window.history.replaceState({}, document.title, window.location.pathname);
            
            return data.session;
        } catch (error) {
            console.error('Error procesando tokens:', error);
            return null;
        }
    }
    return null;
}

// 4. Manejo de Autenticación
async function handleAuth(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (isSignUpMode) {
        const { data, error } = await supabaseClient.auth.signUp({ 
            email, 
            password,
            options: {
                emailRedirectTo: window.location.origin
            }
        });
        
        if (error) {
            alert(error.message);
        } else {
            // Mostrar mensaje de verificación
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
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
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
    const { error } = await supabaseClient.auth.signOut();
    if (error) alert(error.message);
}

// 5. Manejo de Posts
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
                <p class="post-content">${post.content}</p>
                <p class="post-meta">Por: ${post.user_id} | ${formatDate(post.created_at)}</p>
            `;
            postsList.appendChild(postElement);
        });
    }
}

// Función para formatear fecha de manera más amigable
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

// 6. Lógica de UI
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

// 7. Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    // Primero procesar tokens en la URL
    const sessionFromUrl = await processUrlTokens();
    
    // Si hay una sesión desde la URL, actualizar la UI
    if (sessionFromUrl) {
        updateUI(sessionFromUrl.user);
        return;
    }
    
    // Si no, verificar si hay una sesión activa
    const { data: { session } } = await supabaseClient.auth.getSession();
    updateUI(session?.user ?? null);
});

// 8. Event Listeners
authForm.addEventListener('submit', handleAuth);
toggleAuth.addEventListener('click', toggleAuthMode);
postForm.addEventListener('submit', createPost);
logoutButton.addEventListener('click', handleLogout);

// 9. Escuchar cambios en el estado de autenticación
supabaseClient.auth.onAuthStateChange((event, session) => {
    updateUI(session?.user ?? null);
});
