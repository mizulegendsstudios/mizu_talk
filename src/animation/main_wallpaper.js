document.addEventListener('DOMContentLoaded', () => {
    // Lista de emojis para el fondo animado
    const emojis = ['😀', '😎', '🌟', '🎨', '🚀', '💡', '🌈', '🎉', '🌺', '🍕', '🎮', '🎵', '🌸', '🦄', '🍀', '🌙', '☀️', '⭐', '🌊', '🔥'];
    
    // Crear el contenedor de emojis
    const emojiContainer = document.createElement('div');
    emojiContainer.className = 'emoji-container';
    document.body.appendChild(emojiContainer);
    
    // Función para crear un emoji individual
    function createEmoji() {
        const emoji = document.createElement('div');
        emoji.className = 'emoji';
        
        // Seleccionar un emoji aleatorio
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.textContent = randomEmoji;
        
        // Posición horizontal aleatoria
        const leftPosition = Math.random() * 100;
        emoji.style.left = `${leftPosition}%`;
        
        // Duración de animación aleatoria
        const duration = Math.random() * 20 + 10; // Entre 10 y 30 segundos
        emoji.style.animationDuration = `${duration}s`;
        
        // Tamaño aleatorio
        const size = Math.random() * 1.5 + 1; // Entre 1 y 2.5 rem
        emoji.style.fontSize = `${size}rem`;
        
        // Opacidad aleatoria
        const opacity = Math.random() * 0.3 + 0.1; // Entre 0.1 y 0.4
        emoji.style.opacity = opacity;
        
        // Retraso de animación aleatorio
        const delay = Math.random() * 5; // Entre 0 y 5 segundos
        emoji.style.animationDelay = `${delay}s`;
        
        // Añadir al contenedor
        emojiContainer.appendChild(emoji);
        
        // Eliminar el emoji después de que termine la animación
        setTimeout(() => {
            emoji.remove();
        }, (duration + delay) * 1000);
    }
    
    // Crear emojis iniciales
    for (let i = 0; i < 15; i++) {
        setTimeout(createEmoji, i * 300);
    }
    
    // Continuar creando emojis periódicamente
    setInterval(createEmoji, 2000);
    
    // Detectar tema oscuro para ajustar el color de los emojis
    function adjustEmojiColors() {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const emojiElements = document.querySelectorAll('.emoji');
        
        emojiElements.forEach(emoji => {
            if (isDarkMode) {
                emoji.style.filter = 'blur(0.5px) brightness(0.8)';
            } else {
                emoji.style.filter = 'blur(0.5px)';
            }
        });
    }
    
    // Ajustar colores iniciales y escuchar cambios en el tema
    adjustEmojiColors();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', adjustEmojiColors);
});
