export class DialogueSystem {
    constructor(game) {
        this.game = game;
        this.box = document.getElementById('dialogue-box');
        this.textEl = document.getElementById('dialogue-text');
        this.queue = [];
        this.isTyping = false;
        this.active = false;

        // Simple click to continue
        this.box.addEventListener('click', () => this.next());
    }

    show(lines) {
        if (!Array.isArray(lines)) lines = [lines];
        this.queue = lines;
        this.active = true;
        this.box.classList.remove('hidden');
        this.next();
    }

    next() {
        if (this.isTyping) {
            // Instant finish
            this.isTyping = false;
            this.textEl.textContent = this.currentLine;
            return;
        }

        if (this.queue.length === 0) {
            this.close();
            return;
        }

        this.currentLine = this.queue.shift();
        this.typeLine(this.currentLine);
    }

    typeLine(line) {
        this.isTyping = true;
        this.textEl.textContent = '';
        let i = 0;
        const speed = 30; // ms per char

        const type = () => {
            if (!this.isTyping) return; // Stopped or finished
            if (i < line.length) {
                this.textEl.textContent += line.charAt(i);
                i++;
                // Play little blip sound?
                // this.game.audio.playTone(800, 'square', 0.05); 
                setTimeout(type, speed);
            } else {
                this.isTyping = false;
            }
        };
        type();
    }

    close() {
        this.active = false;
        this.box.classList.add('hidden');
        this.game.onDialogueEnd();
    }
}
