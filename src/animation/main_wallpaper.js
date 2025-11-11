document.addEventListener('DOMContentLoaded', () => {
    // ============= CONFIGURACIÓN ÚNICA =============
    const config = {
        emojiSize: '4.5rem', // Tamaño fijo grande para todos
        emojis: ['😀', '😎', '🌟', '🎨', '🚀', '💡', '🌈', '🎉', '🌺', '🍕', '🎮', '🎵', '🌸', '🦄', '🍀', '🌙', '☀️', '⭐', '🌊', '🔥'],
        animationDuration: { min: 35, max: 50 }, // Movimientos muy lentos
        opacity: 0.25, // Opacidad fija baja para no distraer
        glowColor: 'rgba(255, 215, 0, 0.9)' // Color dorado para glow
    };

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
            cursor: pointer;
            animation: emojiFall linear forwards;
            will-change: transform;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: ${config.emojiSize};
            opacity: ${config.opacity};
        }
        
        .emoji:hover {
            animation-play-state: paused;
            transform: scale(1.15) !important;
            filter: brightness(1.4) drop-shadow(0 0 20px ${config.glowColor}) !important;
            opacity: 0.8 !important;
            z-index: 100;
        }
        
        @keyframes emojiFall {
            0% {
                transform: translateY(-150px) translateX(0) rotate(0deg);
            }
            100% {
                transform: translateY(calc(100vh + 150px)) translateX(var(--drift)) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);

    // ============= CONTENEDOR =============
    const emojiContainer = document.createElement('div');
    emojiContainer.className = 'emoji-container';
    document.body.appendChild(emojiContainer);

    // ============= CREAR EMOJI =============
    function createEmoji() {
        const emoji = document.createElement('div');
        emoji.className = 'emoji';
        emoji.textContent = config.emojis[Math.floor(Math.random() * config.emojis.length)];

        // Duración lenta y constante
        const duration = Math.random() * (config.animationDuration.max - config.animationDuration.min) + config.animationDuration.min;
        emoji.style.animationDuration = `${duration}s`;

        // Posición horizontal aleatoria (full width)
        emoji.style.left = `${Math.random() * 100}%`;

        // Desplazamiento lateral sutil
        const drift = (Math.random() - 0.5) * 80; // -40px a 40px máximo
        emoji.style.setProperty('--drift', `${drift}px`);

        // Delay aleatorio para aparición escalonada
        emoji.style.animationDelay = `${Math.random() * 5}s`;

        // Efecto clic
        emoji.addEventListener('click', function() {
            this.style.animation = 'none';
            this.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            this.style.transform = 'scale(1.8) rotate(720deg)';
            this.style.opacity = '0';
            setTimeout(() => this.remove(), 600);
        });

        emojiContainer.appendChild(emoji);

        // Auto-limpieza
        setTimeout(() => emoji.remove(), (duration + 5) * 1000);
    }

    // ============= INICIALIZAR =============
    // 25 emojis iniciales con delay escalonado
    for (let i = 0; i < 25; i++) {
        setTimeout(createEmoji, i * 300);
    }

    // Nuevo emoji cada 3 segundos
    setInterval(createEmoji, 3000);
});
