// 1. Inicializar Supabase
// Reemplaza con tu URL y tu clave anónima de Supabase
const SUPABASE_URL = 'https://vicmgzclxyfjrlzgasqn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpY21nemNseHlmanJsemdhc3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDA5ODAsImV4cCI6MjA3ODM3Njk4MH0.CuCN5Zd-tGlSlMN0amFN4hh_LwCioVrL0RGse7r0oCo';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// 3. Manejo de Autenticación
async function handleAuth(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (isSignUpMode) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) alert(error.message);
        else alert('Registro exitoso! Revisa tu email para confirmar.');
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

// 4. Manejo de Posts
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
        fetchPosts(); // Recargar los posts
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
        postsList.innerHTML = ''; // Limpiar la lista
        data.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <p class="post-content">${post.content}</p>
                <p class="post-meta">Por: ${post.user_id} | ${new Date(post.created_at).toLocaleString()}</p>
            `;
            postsList.appendChild(postElement);
        });
    }
}

// 5. Lógica de UI (mostrar/ocultar secciones)
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

// 6. Event Listeners
authForm.addEventListener('submit', handleAuth);
toggleAuth.addEventListener('click', toggleAuthMode);
postForm.addEventListener('submit', createPost);
logoutButton.addEventListener('click', handleLogout);

// 7. Comprobar el estado de la autenticación al cargar la página
supabase.auth.onAuthStateChange((event, session) => {
    updateUI(session?.user ?? null);
});
