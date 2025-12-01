import { Game } from './modules/Game.js';

window.addEventListener('load', () => {
    try {
        window.game = new Game();
    } catch (e) {
        console.error("Failed to initialize game:", e);
    }
});
