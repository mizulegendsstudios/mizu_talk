# Mizu Talk

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-222222?style=for-the-badge&logo=github&logoColor=white)](https://mizulegendsstudies.github.io/mizu_talk/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![License: AGPL](https://img.shields.io/badge/License-AGPL-green?style=for-the-badge)](https://opensource.org/licenses/AGPL)

Una aplicación de micro-mensajes (estilo "mini-Twitter") construida 100% con tecnologías frontend. Demuestra cómo es posible crear una aplicación web full-stack funcional, con autenticación de usuarios y base de datos, sin escribir una sola línea de código de backend tradicional, gracias a Supabase.

## ✨ Características

- ✅ **Autenticación de Usuarios**: Registro, inicio de sesión y cierre de sesión seguros.
- ✅ **Creación de Posts**: Publica mensajes de texto de forma rápida y sencilla.
- ✅ **Feed Global**: Visualiza todos los posts de todos los usuarios en orden cronológico inverso.
- ✅ **Base de Datos Segura**: Utiliza Supabase con PostgreSQL y Row Level Security (RLS) para proteger los datos.
- ✅ **Diseño Responsivo**: Se adapta a diferentes tamaños de pantalla (escritorio, tablet, móvil).
- ✅ **Despliegue Sencillo**: Alojado de forma estática en GitHub Pages.

## 🛠️ Stack Tecnológico

-   **Frontend**:
    -   `HTML5` (Semántico)
    -   `CSS3` (Flexbox, Grid)
    -   `JavaScript` (ES6+, Vanilla JS)
-   **Backend (BaaS)**:
    -   `Supabase` (Autenticación, Base de Datos PostgreSQL)
-   **Despliegue**:
    -   `GitHub Pages`

## 🚀 Demo en Vivo

Puedes probar la aplicación directamente aquí: **[https://mizulegendsstudies.github.io/mizu_talk/](https://mizulegendsstudies.github.io/mizu_talk/)**

## 📋 Requisitos Previos

Para ejecutar este proyecto localmente, necesitarás:

-   Una cuenta en [Supabase](https://supabase.com).
-   Tener instalado [Git](https://git-scm.com/).
-   Un editor de código como [VS Code](https://code.visualstudio.com/) (recomendado).

## ⚙️ Configuración y Ejecución Local

Sigue estos pasos para tener una copia del proyecto funcionando en tu máquina.

### 1. Clonar el Repositorio

Clona este repositorio en tu computadora usando el siguiente comando:

```bash
git clone https://github.com/mizulegendsstudies/mizu_talk.git
```

### 2. Configurar Supabase

Este proyecto necesita un backend para funcionar. Sigue estos pasos en tu panel de Supabase:

1.  **Crea un nuevo proyecto** en [supabase.com](https://supabase.com).
2.  **Obtén tus claves API**:
    -   Ve a `Settings` > `API`.
    -   Copia la **Project URL** y la **`anon` public API Key**.
3.  **Crea la tabla de la base de datos**:
    -   Ve a `Table Editor` y haz click en "Create a new table".
    -   **Name:** `posts`
    -   Activa **Enable Row Level Security (RLS)**.
    -   Añade las siguientes columnas:
        | Column name | Type | Default value | Primary Key |
        | :--- | :--- | :--- | :--- |
        | `id` | `int8` | - | ✅ |
        | `content` | `text` | - | - |
        | `user_id` | `uuid` | - | - |
        | `created_at` | `timestamptz` | `now()` | - |
4.  **Configura las Políticas de Seguridad (RLS)**:
    -   Ve a `Authentication` > `Policies`.
    -   Crea una política para `posts` que permita a **todos leer** (`SELECT` para roles `anon, authenticated`).
    -   Crea otra política para que **solo usuarios autenticados puedan insertar** (`INSERT` para rol `authenticated` con la condición `auth.uid() = user_id`).
5.  **Configura las URLs de Redirección**:
    -   Ve a `Authentication` > `URL Configuration`.
    -   En `Site URL` y `Redirect URLs`, añade la URL donde lo ejecutarás localmente, por ejemplo: `http://127.0.0.1:5500/`.

### 3. Configurar las Variables de Entorno

Para no exponer tus claves API, es buena práctica manejarlas en un archivo separado.

1.  En la raíz del proyecto, crea un archivo llamado `config.js`.
2.  Añade tus credenciales de Supabase de la siguiente manera:

    ```javascript
    // config.js
    const SUPABASE_URL = 'https://TU_PROYECTO_ID.supabase.co';
    const SUPABASE_ANON_KEY = 'TU_CLAVE_ANONIMA';
    ```
3.  Abre `index.html` y añade una referencia a este archivo **antes** de `app.js`:

    ```html
    <!-- SDK de Supabase -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
    <!-- Tu archivo de configuración -->
    <script src="config.js"></script>
    <!-- Tu lógica principal -->
    <script src="app.js" defer></script>
    ```
4.  Crea un archivo `.gitignore` y añade `config.js` para que no se suba a GitHub.

    ```
    # .gitignore
    config.js
    ```

### 4. Ejecutar el Proyecto

La forma más sencilla es usar una extensión de servidor local como **Live Server** en VS Code.

1.  Abre la carpeta del proyecto en VS Code.
2.  Instala la extensión "Live Server".
3.  Haz clic derecho en el archivo `index.html` y selecciona "Open with Live Server".

Tu aplicación se abrirá en tu navegador, por ejemplo en `http://127.0.0.1:5500/`.

## 📁 Estructura del Proyecto

```
mizu_talk/
├── index.html          # Estructura principal de la aplicación
├── style.css           # Estilos y diseño visual
├── app.js              # Lógica principal de la aplicación (frontend)
├── config.js           # Archivo para claves de API (no subido a git)
├── .gitignore          # Archivos y carpetas a ignorar por Git
└── README.md           # Este archivo
```

## 🤔 ¿Cómo Funciona?

Mizu Talk es una arquitectura **JAMstack** (JavaScript, APIs, Markup).

1.  El **Frontend** (HTML, CSS, JS) se ejecuta enteramente en el navegador del usuario.
2.  Cuando necesita realizar una acción que requiere persistencia (como registrar un usuario o guardar un post), realiza una llamada directa a la **API de Supabase**.
3.  **Supabase** actúa como el backend: maneja la autenticación, almacena los datos en su base de datos PostgreSQL y se los devuelve al frontend.
4.  No hay un servidor intermedio programado por nosotros, lo que simplifica enormemente el desarrollo y el despliegue.

## 🚀 Mejoras a Futuro

-   [ ] Mostrar el email del autor o nombre de usuario de cada post.
-   [ ] Permitir que los usuarios eliminen o editen sus propios posts.
-   [ ] Actualizar el feed en tiempo real usando las suscripciones de Supabase.
-   [ ] Añadir un contador de caracteres al textarea.
-   [ ] Crear perfiles de usuario.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Si tienes una idea para mejorar el proyecto, por favor:

1.  Haz un `fork` del repositorio.
2.  Crea una nueva rama (`git checkout -b feature/nueva-caracteristica`).
3.  Haz `commit` de tus cambios (`git commit -am 'Añadir nueva característica'`).
4.  Haz `push` a la rama (`git push origin feature/nueva-caracteristica`).
5.  Abre un `Pull Request`.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

Creado por **[Moises Núñez]**.

[![GitHub](https://img.shields.io/badge/GitHub-mizulegendsstudies-181717?style=for-the-badge&logo=github)](https://github.com/mizulegendsstudies)
