// Configuración de Supabase
const supabaseUrl = 'https://vicmgzclxyfjrlgasqn.supabase.co';
const supabaseKey = 'tu-clave-anonima-de-supabase'; // Reemplaza con tu clave real
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Elementos del DOM
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const authTitle = document.getElementById('auth-title');
const authForm = document.getElementById('auth-form');
const authSubmit = document.getElementById('auth-submit');
const toggleAuth = document.getElementById('toggle-auth');
const userEmail = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');
const postForm = document.getElementById('post-form');
const postContent = document.getElementById('post-content');
const postsList = document.getElementById('posts-list');

// Estado de la aplicación
let isSignUp = false;
let currentUser = null;

// Función para mostrar la sección de autenticación
function showAuthSection() {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
}

// Función para mostrar la sección de la aplicación
function showAppSection() {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
}

// Función para cargar posts
async function loadPosts() {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        postsList.innerHTML = '';
        data.forEach(post => {
            const postElement = document.createElement('article');
            postElement.className = 'post';
            postElement.innerHTML = `
                <div class="post-content">
                    <p>${post.content}</p>
                </div>
                <div class="post-meta">
                    Publicado por ${post.user_email} • ${formatDate(post.created_at)}
                </div>
            `;
            postsList.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error al cargar posts:', error.message);
    }
}

// Función para formatear fecha
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

// Función para manejar el inicio de sesión/registro
async function handleAuth(email, password) {
    try {
        if (isSignUp) {
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });
            
            if (error) throw error;
            
            // Mostrar mensaje de verificación
            authTitle.textContent = 'Verifica tu correo';
            authForm.innerHTML = `
                <p>Te hemos enviado un correo de verificación. Por favor, revisa tu bandeja de entrada y sigue las instrucciones.</p>
                <button type="button" id="back-to-login">Volver al inicio de sesión</button>
            `;
            
            document.getElementById('back-to-login').addEventListener('click', () => {
                isSignUp = false;
                authTitle.textContent = 'Iniciar Sesión';
                authForm.innerHTML = `
                    <input type="email" id="email" placeholder="Email" required>
                    <input type="password" id="password" placeholder="Contraseña" required>
                    <button type="submit" id="auth-submit">Entrar</button>
                `;
                toggleAuth.textContent = '¿No tienes cuenta? Regístrate';
                
                // Volver a añadir los event listeners
                document.getElementById('email').addEventListener('input', updateAuthButton);
                document.getElementById('password').addEventListener('input', updateAuthButton);
                authForm.addEventListener('submit', handleAuthSubmit);
            });
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            currentUser = data.user;
            userEmail.textContent = currentUser.email;
            showAppSection();
            loadPosts();
        }
    } catch (error) {
        alert(error.message);
    }
}

// Función para manejar el envío del formulario de autenticación
async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await handleAuth(email, password);
}

// Función para actualizar el texto del botón de autenticación
function updateAuthButton() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email && password) {
        authSubmit.textContent = isSignUp ? 'Registrarse' : 'Iniciar Sesión';
    } else {
        authSubmit.textContent = 'Completa los campos';
    }
}

// Función para manejar el cierre de sesión
async function handleLogout() {
    await supabase.auth.signOut();
    currentUser = null;
    showAuthSection();
}

// Función para manejar el envío de un post
async function handlePostSubmit(e) {
    e.preventDefault();
    const content = postContent.value.trim();
    
    if (!content) return;
    
    try {
        const { data, error } = await supabase
            .from('posts')
            .insert([
                { 
                    content, 
                    user_email: currentUser.email,
                    user_id: currentUser.id
                }
            ]);
            
        if (error) throw error;
        
        postContent.value = '';
        loadPosts();
    } catch (error) {
        console.error('Error al publicar:', error.message);
        alert('Error al publicar. Inténtalo de nuevo.');
    }
}

// Función para verificar si hay una sesión activa al cargar la página
async function checkSession() {
    try {
        // Verificar si hay parámetros de autenticación en la URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
            // Si hay tokens en la URL, procesarlos
            const { data, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            
            if (data.session) {
                currentUser = data.session.user;
                userEmail.textContent = currentUser.email;
                showAppSection();
                loadPosts();
                
                // Limpiar la URL
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }
        }
        
        // Si no hay tokens en la URL, verificar si hay una sesión activa
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            currentUser = session.user;
            userEmail.textContent = currentUser.email;
            showAppSection();
            loadPosts();
        } else {
            showAuthSection();
        }
    } catch (error) {
        console.error('Error al verificar sesión:', error.message);
        showAuthSection();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión al cargar la página
    checkSession();
    
    // Event listeners para el formulario de autenticación
    authForm.addEventListener('submit', handleAuthSubmit);
    
    // Event listeners para actualizar el botón de autenticación
    document.getElementById('email').addEventListener('input', updateAuthButton);
    document.getElementById('password').addEventListener('input', updateAuthButton);
    
    // Event listener para cambiar entre inicio de sesión y registro
    toggleAuth.addEventListener('click', () => {
        isSignUp = !isSignUp;
        authTitle.textContent = isSignUp ? 'Registrarse' : 'Iniciar Sesión';
        authSubmit.textContent = isSignUp ? 'Registrarse' : 'Iniciar Sesión';
        toggleAuth.textContent = isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate';
    });
    
    // Event listener para cerrar sesión
    logoutButton.addEventListener('click', handleLogout);
    
    // Event listener para enviar posts
    postForm.addEventListener('submit', handlePostSubmit);
});
