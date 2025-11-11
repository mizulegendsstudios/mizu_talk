document.addEventListener('DOMContentLoaded', () => {
    // Configuración simple y limpia
    const config = {
        emojiSize: '4.5rem', // Tamaño fijo grande
        emojis: ['😀', '😎', '🌟', '🎨', '🚀', '💡', '🌈', '🎉', '🌺', '🍕', '🎮', '🎵', '🌸', '🦄', '🍀', '🌙', '☀️', '⭐', '🌊', '🔥'],
        animationDuration: { min: 40, max: 60 }, // Caída muy lenta
        opacity: 0.25 // Opacidad constante
    };

    // Estilos CSS mínimos
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
            cursor: pointer;
            animation: emojiFall linear forwards;
            font-size: ${config.emojiSize};
            opacity: ${config.opacity};
            transition: all 0.4s ease;
        }
        
        .emoji:hover {
            animation-play-state: paused;
            transform: scale(1.2) !important;
            filter: brightness(1.5) drop-shadow(0 0 25px rgba(255, 215, 0, 0.9)) !important;
            opacity: 0.9 !important;
        }
        
        @keyframes emojiFall {
            0% {
                transform: translateY(-150px) rotate(0deg);
            }
            100% {
                transform: translateY(calc(100vh + 150px)) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);

    // Contenedor
    const emojiContainer = document.createElement('div');
    emojiContainer.className = 'emoji-container';
    document.body.appendChild(emojiContainer);

    // Crear un emoji
    function createEmoji() {
        const emoji = document.createElement('div');
        emoji.className = 'emoji';
        emoji.textContent = config.emojis[Math.floor(Math.random() * config.emojis.length)];

        // Duración lenta aleatoria
        const duration = Math.random() * (config.animationDuration.max - config.animationDuration.min) + config.animationDuration.min;
        emoji.style.animationDuration = `${duration}s`;

        // Posición horizontal aleatoria (toda la pantalla)
        emoji.style.left = `${Math.random() * 100}%`;

        // Delay escalonado
        emoji.style.animationDelay = `${Math.random() * 5}s`;

        // Efecto clic: desaparece
        emoji.addEventListener('click', function() {
            this.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            this.style.transform = 'scale(1.8) rotate(720deg)';
            this.style.opacity = '0';
            setTimeout(() => this.remove(), 500);
        });

        emojiContainer.appendChild(emoji);

        // Auto-limpiar
        setTimeout(() => emoji.remove(), (duration + 5) * 1000);
    }

    // Inicializar
    for (let i = 0; i < 20; i++) {
        setTimeout(createEmoji, i * 250);
    }

    // Continuar creando emojis
    setInterval(createEmoji, 3000);
});
