document.addEventListener('DOMContentLoaded', () => {
    const config = {
        emojiSize: '4.5rem',
        emojis: ['😀', '😎', '🌟', '🎨', '🚀', '💡', '🌈', '🎉', '🌺', '🍕', '🎮', '🎵', '🌸', '🦄', '🍀', '🌙', '☀️', '⭐', '🌊', '🔥'],
        animationDuration: { min: 40, max: 60 },
        startOpacity: 0.6,
        maxEmojis: 25
    };

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
            font-size: ${config.emojiSize};
            opacity: 0; /* Inicio invisible */
            transition: transform 0.3s ease, filter 0.3s ease;
            will-change: transform, opacity;
        }
        
        .emoji:hover {
            transform: scale(1.2) !important;
            filter: brightness(1.5) drop-shadow(0 0 25px rgba(255, 215, 0, 0.9));
            z-index: 100;
        }
        
        @keyframes emojiFall {
            from {
                transform: translateY(-150px) rotate(0deg);
            }
            to {
                transform: translateY(calc(100vh + 150px)) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);

    const emojiContainer = document.createElement('div');
    emojiContainer.className = 'emoji-container';
    document.body.appendChild(emojiContainer);

    const activeEmojis = new Set();

    function updateEmojiOpacity(emoji) {
        if (!emoji.dataset.falling) return false;
        
        const rect = emoji.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const emojiHeight = rect.height;
        
        // Opacidad basada en posición: 0.6 arriba, 0 abajo
        const relativePos = (rect.top + emojiHeight) / (viewportHeight + emojiHeight);
        const opacity = Math.max(0, config.startOpacity * (1 - relativePos));
        
        emoji.style.opacity = opacity;
        
        // Eliminar cuando es invisible y está fuera
        if (opacity <= 0.01 || rect.top > viewportHeight) {
            emoji.remove();
            activeEmojis.delete(emoji);
            return false;
        }
        
        return true;
    }

    function createEmoji() {
        if (activeEmojis.size >= config.maxEmojis) return;

        const emoji = document.createElement('div');
        emoji.className = 'emoji';
        emoji.textContent = config.emojis[Math.floor(Math.random() * config.emojis.length)];
        emoji.style.left = `${Math.random() * 100}%`;
        
        const duration = Math.random() * (config.animationDuration.max - config.animationDuration.min) + config.animationDuration.min;
        const delay = Math.random() * 3;
        
        setTimeout(() => {
            emoji.style.animation = `emojiFall ${duration}s linear forwards`;
            emoji.dataset.falling = 'true';
            
            function animateOpacity() {
                if (updateEmojiOpacity(emoji)) {
                    requestAnimationFrame(animateOpacity);
                }
            }
            requestAnimationFrame(animateOpacity);
        }, delay * 1000);
        
        emoji.addEventListener('click', function() {
            this.style.animationPlayState = 'paused';
            this.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            this.style.transform = 'scale(1.8) rotate(720deg)';
            this.style.opacity = '0';
            setTimeout(() => {
                this.remove();
                activeEmojis.delete(this);
            }, 500);
        });
        
        emojiContainer.appendChild(emoji);
        activeEmojis.add(emoji);
    }

    for (let i = 0; i < 15; i++) {
        setTimeout(createEmoji, i * 200);
    }

    setInterval(createEmoji, 2500);
});
