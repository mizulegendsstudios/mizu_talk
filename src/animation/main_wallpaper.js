document.addEventListener('DOMContentLoaded', () => {
    // ============= CONFIGURACIÓN =============
    const config = {
        // Cobertura horizontal: 'full', 'left', 'right', 'center'
        coverage: 'full',
        
        // Densidad de emojis: 'low', 'medium', 'high'
        density: 'medium',
        
        // Emojis disponibles
        emojis: ['😀', '😎', '🌟', '🎨', '🚀', '💡', '🌈', '🎉', '🌺', '🍕', '🎮', '🎵', '🌸', '🦄', '🍀', '🌙', '☀️', '⭐', '🌊', '🔥'],
        
        // Colores de glow (modo oscuro/claro)
        glowColors: {
            light: 'rgba(255, 255, 150, 0.6)',
            dark: 'rgba(255, 200, 50, 0.8)'
        }
    };
    
    // ============= CONFIGURACIÓN DE DENSIDAD =============
    const densitySettings = {
        low: { initial: 8, interval: 2500, maxEmojis: 20 },
        medium: { initial: 15, interval: 1500, maxEmojis: 35 },
        high: { initial: 25, interval: 800, maxEmojis: 50 }
    };
    
    const settings = densitySettings[config.density];
    
    // ============= ESTILOS CSS =============
    const style = document.createElement('style');
    style.textContent = `
        .emoji-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            pointer-events: none;
            overflow: hidden;
            z-index: -1;
        }
        
        .emoji {
            position: absolute;
            pointer-events: auto;
            user-select: none;
            animation-name: emojiFall;
            animation-timing-function: linear;
            animation-iteration-count: 1;
            will-change: transform, opacity;
            transition: filter 0.3s ease;
        }
        
        .emoji:hover {
            animation-play-state: paused;
            transform: scale(1.3) !important;
            z-index: 1000;
            filter: blur(0px) brightness(1.2) drop-shadow(0 0 20px var(--glow-color)) !important;
        }
        
        /* Animación principal con movimiento horizontal */
        @keyframes emojiFall {
            0% {
                transform: translateY(-100px) translateX(0) rotate(0deg) scale(0.5);
                opacity: 0;
            }
            10% {
                opacity: 1;
                transform: translateY(-50px) translateX(0) rotate(0deg) scale(1);
            }
            25% {
                transform: translateY(25vh) translateX(var(--move-x-1)) rotate(90deg) scale(var(--scale));
            }
            50% {
                transform: translateY(50vh) translateX(var(--move-x-2)) rotate(180deg) scale(var(--scale));
            }
            75% {
                transform: translateY(75vh) translateX(var(--move-x-3)) rotate(270deg) scale(var(--scale));
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(calc(100vh + 100px)) translateX(var(--move-x-4)) rotate(360deg) scale(0.5);
                opacity: 0;
            }
        }
        
        /* Capas de profundidad (parallax) */
        .emoji.layer-back {
            animation-duration: calc(var(--duration) * 1.5) !important;
            filter: blur(1px) brightness(0.6);
        }
        
        .emoji.layer-front {
            animation-duration: calc(var(--duration) * 0.7) !important;
            filter: blur(0px) brightness(1.1);
        }
    `;
    document.head.appendChild(style);
    
    // ============= CONTENEDOR =============
    const emojiContainer = document.createElement('div');
    emojiContainer.className = 'emoji-container';
    document.body.appendChild(emojiContainer);
    
    // ============= FUNCIONES DE UTILIDAD =============
    function getRandomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    function getCoverageRange() {
        switch(config.coverage) {
            case 'left': return { min: 0, max: 50 };
            case 'right': return { min: 50, max: 100 };
            case 'center': return { min: 25, max: 75 };
            default: return { min: 0, max: 100 };
        }
    }
    
    // ============= CREACIÓN DE EMOJI =============
    function createEmoji() {
        // Limite de emojis en pantalla
        if (emojiContainer.children.length >= settings.maxEmojis) {
            return;
        }
        
        const emoji = document.createElement('div');
        emoji.className = 'emoji';
        
        // Seleccionar emoji aleatorio
        emoji.textContent = config.emojis[Math.floor(Math.random() * config.emojis.length)];
        
        // Configuración de animación
        const duration = getRandomInRange(15, 30);
        const delay = getRandomInRange(0, 5);
        
        // Rango de cobertura horizontal
        const range = getCoverageRange();
        const leftPosition = getRandomInRange(range.min, range.max);
        
        // Movimiento horizontal (efecto viento) - valores aleatorios
        const moveX1 = getRandomInRange(-50, 50);
        const moveX2 = getRandomInRange(-100, 100);
        const moveX3 = getRandomInRange(-150, 150);
        const moveX4 = getRandomInRange(-200, 200);
        
        // Tamaño (aumentado para más impacto)
        const size = getRandomInRange(1.5, 3.5);
        
        // Opacidad
        const opacity = getRandomInRange(0.2, 0.6);
        
        // Escala para efecto 3D
        const scale = getRandomInRange(0.6, 1.2);
        
        // Capa de profundidad (parallax)
        const layerChance = Math.random();
        if (layerChance < 0.2) {
            emoji.classList.add('layer-back');
        } else if (layerChance > 0.8) {
            emoji.classList.add('layer-front');
        }
        
        // Aplicar estilos usando CSS variables para mejor rendimiento
        emoji.style.setProperty('--duration', `${duration}s`);
        emoji.style.setProperty('--scale', scale);
        emoji.style.setProperty('--move-x-1', `${moveX1}px`);
        emoji.style.setProperty('--move-x-2', `${moveX2}px`);
        emoji.style.setProperty('--move-x-3', `${moveX3}px`);
        emoji.style.setProperty('--move-x-4', `${moveX4}px`);
        
        // Estilos directos
        emoji.style.left = `${leftPosition}%`;
        emoji.style.fontSize = `${size}rem`;
        emoji.style.opacity = opacity;
        emoji.style.animationDuration = `${duration}s`;
        emoji.style.animationDelay = `${delay}s`;
        
        // Detectar modo oscuro y aplicar glow
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const glowColor = isDarkMode ? config.glowColors.dark : config.glowColors.light;
        emoji.style.setProperty('--glow-color', glowColor);
        emoji.style.filter = `blur(0.5px) drop-shadow(0 0 5px ${glowColor})`;
        
        // Añadir al contenedor
        emojiContainer.appendChild(emoji);
        
        // Eliminar después de la animación
        setTimeout(() => {
            emoji.remove();
        }, (duration + delay + 1) * 1000);
    }
    
    // ============= INICIALIZACIÓN =============
    // Crear emojis iniciales con delay escalonado
    for (let i = 0; i < settings.initial; i++) {
        setTimeout(createEmoji, i * 200);
    }
    
    // Crear emojis continuamente
    setInterval(createEmoji, settings.interval);
    
    // ============= DETECCIÓN DE TEMA =============
    function updateEmojiColors() {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const glowColor = isDarkMode ? config.glowColors.dark : config.glowColors.light;
        
        emojiContainer.style.setProperty('--glow-color', glowColor);
    }
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateEmojiColors);
    updateEmojiColors();
});
