class AudioSystem {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = false; // Start muted until interaction
        this.bgm = null;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.1; // 10% volume
        this.playlist = ['assets/music_lofi.mp3', 'assets/synthesis.mp3', 'assets/funkylofi.mp3'];
        this.currentTrackIndex = 0;
        this.trackPlayCount = 0; // Track how many times the current song has played
    }

    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.context.resume();
            this.playMusic();
        } else {
            this.fadeOutAndStop();
        }
        return this.enabled;
    }

    setMusicVolume(val) {
        this.musicVolume = val / 100;
        if (this.bgm) this.bgm.volume = this.musicVolume;
    }

    setSFXVolume(val) {
        this.sfxVolume = val / 100;
    }

    playTone(freq, type, duration) {
        if (!this.enabled) return;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.context.currentTime);

        // Soften the volume based on global SFX volume
        const volume = this.sfxVolume * 0.3; // Reduced base volume for softer clicks

        gain.gain.setValueAtTime(volume, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.context.destination);
        osc.start();
        osc.stop(this.context.currentTime + duration);
    }

    playAction() {
        // Softer, lower pitch for general actions
        this.playTone(300, 'sine', 0.1);
    }
    playSuccess() {
        this.playTone(523.25, 'sine', 0.1);
        setTimeout(() => this.playTone(659.25, 'sine', 0.1), 100);
    }
    playError() {
        console.log("playError called");
        console.trace();
        this.playTone(150, 'sawtooth', 0.3);
    }
    playChime() { this.playTone(880, 'triangle', 0.5); }

    playMusic() {
        if (!this.bgm) {
            this.playNextTrack();
        } else if (this.enabled && this.bgm.paused) {
            this.fadeIn(this.bgm);
        }
    }

    playNextTrack() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.onended = null;
        }

        const track = this.playlist[this.currentTrackIndex];
        this.bgm = new Audio(track);
        this.bgm.volume = 0; // Start at 0 for fade in
        this.bgm.loop = false;

        this.bgm.onended = () => {
            this.trackPlayCount++;
            if (this.trackPlayCount < 3) {
                // Replay same track
                this.bgm.currentTime = 0;
                this.fadeIn(this.bgm);
            } else {
                // Next track
                this.trackPlayCount = 0;
                this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
                this.playNextTrack();
            }
        };

        if (this.enabled) {
            this.fadeIn(this.bgm);
        }
    }

    fadeIn(audio) {
        audio.volume = 0;
        audio.play().catch(e => console.log("Audio play failed:", e));

        const fadeInterval = setInterval(() => {
            if (audio.volume < this.musicVolume) {
                audio.volume = Math.min(audio.volume + 0.05, this.musicVolume);
            } else {
                clearInterval(fadeInterval);
            }
        }, 200); // Fade in over ~1-2 seconds
    }

    fadeOutAndStop() {
        if (!this.bgm) return;

        const fadeInterval = setInterval(() => {
            if (this.bgm.volume > 0.05) {
                this.bgm.volume -= 0.05;
            } else {
                this.bgm.volume = 0;
                this.bgm.pause();
                clearInterval(fadeInterval);
            }
        }, 100);
    }

    stopMusic() {
        this.fadeOutAndStop();
    }

    skipToNextTrack() {
        // Reset play count and move to next track
        this.trackPlayCount = 0;
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;

        // Stop current track and play next
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.onended = null;
        }

        this.playNextTrack();
    }
}

class DialogueSystem {
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

const DIALOGUE_DATA = {
    student: {
        greeting: ["Hey, I'm in a rush.", "Do you have Wi-Fi?", "I need caffeine, stat.", "Got an exam in an hour!", "Is this place quiet enough to study?"],
        choices: [
            { text: "Study hard!", effect: { type: 'patience', value: 10, satisfaction: 5 }, response: "Thanks, I'm trying!" },
            { text: "Need a snack?", effect: { type: 'upsell', chance: 0.4, value: 3, satisfaction: 3 }, response: "Maybe a muffin..." },
            { text: "Quiet day?", effect: { type: 'reputation', value: 1, satisfaction: 2 }, response: "I hope so." },
            { text: "Free refill?", effect: { type: 'custom', action: 'refill_offer', satisfaction: 10 }, response: "Really? You're a lifesaver!" },
            { text: "Good luck!", effect: { type: 'patience', value: 15, satisfaction: 8 }, response: "Thanks! I'll need it." }
        ]
    },
    hipster: {
        greeting: ["Is this single origin?", "I only drink oat milk.", "Cool vibe here.", "Love the aesthetic.", "Do you roast your own beans?"],
        choices: [
            { text: "It's artisanal.", effect: { type: 'reputation', value: 2, satisfaction: 8 }, response: "Nice, I respect that." },
            { text: "Try the Matcha?", effect: { type: 'upsell', chance: 0.7, value: 5, satisfaction: 5 }, response: "Ooh, matcha sounds good." },
            { text: "Vinyl is better.", effect: { type: 'patience', value: 15, satisfaction: 12 }, response: "Finally, someone gets it." },
            { text: "Check out my playlist.", effect: { type: 'custom', action: 'music_compliment', satisfaction: 10 }, response: "This track is fire." },
            { text: "Locally sourced.", effect: { type: 'reputation', value: 3, satisfaction: 10 }, response: "That's what I like to hear!" }
        ]
    },
    tourist: {
        greeting: ["Wow, so cute!", "Where is the park?", "Can I take a photo?", "This is so charming!", "Is this a local favorite?"],
        choices: [
            { text: "Welcome!", effect: { type: 'tips', value: 2, satisfaction: 8 }, response: "You're so kind! Here's a tip." },
            { text: "Buy a souvenir?", effect: { type: 'upsell', chance: 0.5, value: 10, satisfaction: 4 }, response: "Oh, a mug? Sure!" },
            { text: "Park is nearby.", effect: { type: 'reputation', value: 1, satisfaction: 6 }, response: "Thanks for the info!" },
            { text: "Say cheese!", effect: { type: 'custom', action: 'photo_op', satisfaction: 12 }, response: "*Click* Perfect shot!" },
            { text: "Try our special!", effect: { type: 'upsell', chance: 0.6, value: 4, satisfaction: 5 }, response: "When in Rome, right?" }
        ]
    },
    regular: {
        greeting: ["The usual, please.", "Good to see you.", "How's business?", "Another day, another coffee.", "You know what I like."],
        choices: [
            { text: "On the house.", effect: { type: 'reputation', value: 5, satisfaction: 15 }, response: "You're the best! I'll tell everyone." },
            { text: "Try something new?", effect: { type: 'upsell', chance: 0.3, value: 4, satisfaction: 3 }, response: "I trust you. Surprise me." },
            { text: "Busy day.", effect: { type: 'patience', value: 20, satisfaction: 5 }, response: "Take your time, I'm good." },
            { text: "How's work?", effect: { type: 'patience', value: 10, satisfaction: 7 }, response: "Same old, same old. Thanks for asking!" }
        ]
    },
    critic: {
        greeting: ["Impress me.", "I'm writing a review.", "Is this sanitary?", "I've had better.", "Show me what you've got."],
        choices: [
            { text: "We use best beans.", effect: { type: 'reputation', value: 3, satisfaction: 5 }, response: "We shall see." },
            { text: "Complimentary water?", effect: { type: 'patience', value: 15, satisfaction: 3 }, response: "Hmph. Acceptable." },
            { text: "No photos please.", effect: { type: 'reputation', value: -2, satisfaction: -10 }, response: "Excuse me? I am a journalist!" },
            { text: "Fresh roasted today.", effect: { type: 'reputation', value: 4, satisfaction: 8 }, response: "Interesting. Continue." }
        ]
    },
    default: {
        greeting: ["Hello.", "One coffee.", "Nice weather.", "Good morning!", "Smells great in here."],
        choices: [
            { text: "How are you?", effect: { type: 'reputation', value: 1, satisfaction: 4 }, response: "I'm good, thanks." },
            { text: "Want a pastry?", effect: { type: 'upsell', chance: 0.3, value: 3, satisfaction: 2 }, response: "No thanks." },
            { text: "Nice outfit.", effect: { type: 'patience', value: 5, satisfaction: 6 }, response: "Oh, thank you!" },
            { text: "Beautiful day!", effect: { type: 'patience', value: 8, satisfaction: 5 }, response: "It really is!" }
        ]
    }
};

class Game {
    constructor() {
        this.state = {
            time: '08:00 AM', // Simplified for now, will need minutes
            minutesElapsed: 0, // 0 = 8:00 AM, 540 = 5:00 PM
            cash: 50.00,
            inventory: {
                beans_standard: 500,
                beans_premium: 200,
                matcha_powder: 0, // New ingredient
                water: 1000,
                milk: 500,
                cups: 50, // New Resource
                filters: 50 // New Resource
            },
            currentCustomer: null,
            brewingState: {
                mode: 'coffee', // coffee, matcha
                step: 0, // 0: idle
                beanType: null
            },
            decorations: [],
            stats: {
                customersServed: 0,
                tipsEarned: 0,
                dailyEarnings: 0,
                reputation: 0
            },
            weather: 'sunny', // sunny, rainy
            upgrades: {
                fastGrinder: false,
                espressoMachine: false,
                matchaSet: false // New upgrade
            },
            unlockedLocations: ['cart']
        };

        this.ui = {
            time: document.getElementById('time-display'),
            cash: document.getElementById('cash-display'),
            rep: document.getElementById('rep-display'),
            customer: document.getElementById('customer-display'),
            inventory: document.getElementById('inventory-display'),
            log: document.getElementById('game-log'),
            brewingStation: document.getElementById('brewing-station'),
            parkBrewingStation: document.getElementById('park-brewing-station'),
            decorations: document.getElementById('decorations-area'),
            customerPortrait: document.getElementById('customer-portrait'),
            screens: {
                cart: document.getElementById('screen-cart'),
                map: document.getElementById('screen-map'),
                shop: document.getElementById('screen-shop'),
                summary: document.getElementById('screen-summary'),
                park: document.getElementById('screen-park')
            },
            shopCash: document.getElementById('shop-cash-display'),
            nodes: {
                park: document.getElementById('node-park')
            },
            weatherOverlay: document.getElementById('weather-overlay'),
            summary: {
                earnings: document.getElementById('summary-earnings'),
                customers: document.getElementById('summary-customers'),
                tips: document.getElementById('summary-tips')
            },
            playerName: document.getElementById('player-name-display')
        };

        this.audio = new AudioSystem();
        this.dialogue = new DialogueSystem(this);

        // Expose game instance immediately
        window.game = this;

        this.init();
    }

    saveGame() {
        const saveData = {
            state: this.state,
            timestamp: Date.now()
        };
        localStorage.setItem('chillista_save', JSON.stringify(saveData));
        this.log("Game Saved.", 'system');
    }

    resetGame() {
        if (confirm("Are you sure you want to reset your progress? This cannot be undone.")) {
            localStorage.removeItem('chillista_save');
            location.reload();
        }
    }

    loadGame() {
        const saveString = localStorage.getItem('chillista_save');
        if (saveString) {
            try {
                const saveData = JSON.parse(saveString);
                // Merge saved state with default state to handle new fields
                this.state = { ...this.state, ...saveData.state };

                // Restore complex objects if needed (e.g., Date objects, though we use simple numbers)
                this.log("Welcome back! Game loaded.", 'system');
                return true;
            } catch (e) {
                console.error("Failed to load save:", e);
                return false;
            }
        }
        return false;
    }

    init() {
        // Try to load game first
        if (this.loadGame()) {
            this.startGame(false); // false = loaded game, don't randomize weather
        } else {
            // New game flow
            document.getElementById('name-modal').classList.remove('hidden');
        }

        // Autosave every 30 seconds
        setInterval(() => this.saveGame(), 30000);

        // Bind Name Submit Button explicitly
        const submitBtn = document.getElementById('name-submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitName());
        }
    }

    submitName() {
        try {
            console.log("submitName called");
            const input = document.getElementById('player-name-input');
            if (!input) {
                console.error("Input element not found!");
                return;
            }
            const name = input.value.trim();
            console.log("Name entered:", name);

            if (name) {
                this.state.playerName = name;
                document.getElementById('name-modal').classList.add('hidden');
                this.startGame(true); // true = new game, randomize weather
            } else {
                // Shake effect or error
                input.style.borderColor = 'red';
                setTimeout(() => input.style.borderColor = 'var(--text-color)', 500);
            }
        } catch (e) {
            console.error("Error in submitName:", e);
            alert("Error starting game: " + e.message);
        }
    }

    startGame(isNewGame = true) {
        try {
            console.log("startGame called", isNewGame ? "(new game)" : "(loaded game)");
            this.updateHUD();
            // Expose game instance for button clicks
            window.game = this;

            // Intro Dialogue
            setTimeout(() => {
                try {
                    this.dialogue.show([
                        `Welcome back, ${this.state.playerName}.`,
                        "Just you, the cart, and the beans.",
                        "Let's brew some magic."
                    ]);
                } catch (e) {
                    console.error("Error showing dialogue:", e);
                }
            }, 1000);

            // Global click listener for audio auto-start
            const unlockAudio = () => {
                if (!this.audio.enabled) {
                    this.audio.enabled = true;
                    this.audio.context.resume().then(() => {
                        this.audio.playMusic();
                    });
                    // Remove listener after first success
                    document.removeEventListener('click', unlockAudio);
                }
            };
            document.addEventListener('click', unlockAudio);

            // Initialize weather only for new games (not when loading a saved game)
            if (isNewGame) {
                const weather = Math.random() > 0.7 ? 'rainy' : 'sunny';
                this.setWeather(weather);
            } else {
                // Restore saved weather without logging (already set from loadGame)
                // Just ensure visual state matches
                if (this.state.weather === 'rainy') {
                    this.ui.weatherOverlay.className = 'weather-overlay weather-rain';
                    this.ui.weatherOverlay.style.opacity = '1';
                } else {
                    this.ui.weatherOverlay.style.opacity = '0';
                }
            }

            // Start Real-time Clock
            this.startClock();
            console.log("startGame completed successfully");
        } catch (e) {
            console.error("Error in startGame:", e);
            alert("Error starting game: " + e.message);
        }
    }

    startClock() {
        if (this.clockInterval) clearInterval(this.clockInterval);
        this.clockInterval = setInterval(() => {
            this.advanceTime(1);
        }, 1000); // 1 real second = 1 game minute
    }

    handleDialogueCommand(cmd) {
        if (cmd === 'TALK') {
            if (!this.state.currentCustomer) {
                this.log("No one to talk to.", 'error');
                return;
            }
            this.showDialogueChoices();
            return;
        }

        if (cmd === 'DIALOGUE_SMALL_TALK') {
            if (!this.state.currentCustomer) {
                this.log("No one to talk to.", 'error');
                return;
            }
            this.applyDialogueEffect({ type: 'reputation', value: 1 });
            // Customer responses to small talk
            const responses = [
                "Lovely weather we're having!",
                "I really like the vibe here.",
                "It's been a long week.",
                "Your coffee is the best in town.",
                "Thanks for chatting with me!",
                "This place is so cozy."
            ];
            const response = responses[Math.floor(Math.random() * responses.length)];
            this.dialogue.show([`${this.state.currentCustomer.name}: "${response}"`]);
            this.hideDialogueChoices();
            return;
        }

        if (cmd === 'DIALOGUE_UPSELL') {
            if (!this.state.currentCustomer) {
                this.log("No one to talk to.", 'error');
                return;
            }
            const success = this.applyDialogueEffect({ type: 'upsell', chance: 0.4, value: 3 });
            if (success) {
                const responses = ["Ooh, that looks delicious! I'll take one.", "Sure, why not?", "You twisted my arm!"];
                this.dialogue.show([`${this.state.currentCustomer.name}: "${responses[Math.floor(Math.random() * responses.length)]}"`]);
            } else {
                const responses = ["No thanks, just the drink.", "I'm watching my calories.", "Maybe next time."];
                this.dialogue.show([`${this.state.currentCustomer.name}: "${responses[Math.floor(Math.random() * responses.length)]}"`]);
            }
            this.hideDialogueChoices();
            return;
        }

        if (cmd.startsWith('CHOICE_')) {
            const index = parseInt(cmd.split('_')[1]);
            this.handleDialogueChoice(index);
            return;
        }

        if (cmd === 'DIALOGUE_END') {
            this.hideDialogueChoices();
            return;
        }
    }

    showDialogueChoices() {
        const customer = this.state.currentCustomer;
        if (!customer) return;

        // Determine customer type (fallback to default)
        // In generateCustomer, we set specialType, but we might need to store it on the customer object explicitly if not already
        // Let's assume customer.type exists or we infer it. 
        // Currently generateCustomer sets personality/name but maybe not a raw 'type' string for lookup.
        // Let's check generateCustomer... it sets 'personality' which is like 'Impatient', 'Rich', etc.
        // We need to map or ensure we save the type key.

        // FIX: Let's use a simple mapping or fallback based on personality if type isn't saved.
        // Ideally, we update generateCustomer to save the type key (student, hipster, etc.)
        // For now, let's try to match or default.

        let type = 'default';
        if (customer.name === 'Critic') type = 'critic'; // Example if we had specific names
        // Better: let's assume we will update generateCustomer to add a 'type' property.
        if (customer.type && DIALOGUE_DATA[customer.type]) {
            type = customer.type;
        }

        const data = DIALOGUE_DATA[type];
        const greeting = data.greeting[Math.floor(Math.random() * data.greeting.length)];

        // Show greeting first
        this.dialogue.show(greeting);

        // Render choices in the DOM
        const choicesContainer = document.getElementById('dialogue-choices');
        if (choicesContainer) {
            choicesContainer.innerHTML = '';
            data.choices.forEach((choice, index) => {
                const btn = document.createElement('button');
                btn.className = 'btn dialogue-btn';
                btn.textContent = choice.text;
                btn.onclick = (e) => {
                    e.stopPropagation(); // Prevent clicking the box to advance
                    this.handleInput(`CHOICE_${index}`);
                };
                choicesContainer.appendChild(btn);
            });
            choicesContainer.classList.remove('hidden');

            // Ensure the main box is visible
            if (this.dialogue.box) {
                this.dialogue.box.classList.remove('hidden');
                // Set a prompt text if empty
                if (!this.dialogue.textEl.textContent) {
                    this.dialogue.textEl.textContent = "What would you like to say?";
                }
            }

            // Also show the static controls if needed, or keep them hidden if we prefer dynamic only
            const controlsContainer = document.getElementById('dialogue-controls');
            if (controlsContainer) controlsContainer.classList.remove('hidden');
        }
    }

    handleDialogueChoice(index) {
        const customer = this.state.currentCustomer;
        let type = 'default';
        if (customer && customer.type && DIALOGUE_DATA[customer.type]) {
            type = customer.type;
        }
        const data = DIALOGUE_DATA[type];
        const choice = data.choices[index];

        if (!choice) return;

        // Apply Effect
        this.applyDialogueEffect(choice.effect);

        // Show Response with customer name
        const responseText = customer ? `${customer.name}: "${choice.response}"` : choice.response;
        this.dialogue.show(responseText);

        // Hide choices
        this.hideDialogueChoices();
    }

    hideDialogueChoices() {
        const choicesContainer = document.getElementById('dialogue-choices');
        const controlsContainer = document.getElementById('dialogue-controls');
        if (choicesContainer) choicesContainer.classList.add('hidden');
        if (controlsContainer) controlsContainer.classList.add('hidden');
    }

    applyDialogueEffect(effect) {
        if (!effect) return;

        // Apply satisfaction change if present
        if (effect.satisfaction && this.state.currentCustomer) {
            this.state.currentCustomer.satisfaction += effect.satisfaction;
            // Clamp between 0-100
            this.state.currentCustomer.satisfaction = Math.max(0, Math.min(100, this.state.currentCustomer.satisfaction));

            // Show feedback based on satisfaction change
            if (effect.satisfaction > 8) {
                this.log("Customer seems very happy! 😊", 'success');
            } else if (effect.satisfaction > 0) {
                this.log("Customer is pleased.", 'success');
            } else if (effect.satisfaction < -5) {
                this.log("Customer looks annoyed... 😞", 'error');
            }
        }

        switch (effect.type) {
            case 'reputation':
                this.state.stats.reputation += effect.value;
                this.log(`${effect.value > 0 ? '+' : ''}${effect.value} Rep`, 'success');
                break;
            case 'patience':
                if (this.state.currentCustomer) {
                    this.state.currentCustomer.patience += effect.value;
                    this.log(`${effect.value > 0 ? '+' : ''}${effect.value} Patience`, 'success');
                }
                break;
            case 'tips':
                this.state.stats.tipsEarned += effect.value;
                this.state.cash += effect.value;
                this.log(`Got a $${effect.value} tip!`, 'success');
                this.audio.playChime();
                break;
            case 'upsell':
                if (Math.random() < effect.chance) {
                    this.state.cash += effect.value;
                    this.state.stats.dailyEarnings += effect.value;
                    this.log(`Upsell successful! +$${effect.value}`, 'success');
                    this.audio.playChime();
                    return true;
                } else {
                    this.log("Upsell failed.", 'error');
                    if (this.state.currentCustomer) {
                        this.state.currentCustomer.patience -= 10;
                        this.state.currentCustomer.satisfaction -= 5; // Failed upsell hurts satisfaction
                    }
                    return false;
                }
                break;
            case 'custom':
                this.handleCustomDialogueAction(effect.action);
                break;
        }
        this.updateHUD();
    }

    handleCustomDialogueAction(action) {
        switch (action) {
            case 'refill_offer':
                this.log("Offered free refill. Customer is happy!", 'success');
                if (this.state.currentCustomer) this.state.currentCustomer.patience += 30;
                break;
            case 'music_compliment':
                this.log("Vibing with the customer.", 'system');
                this.state.stats.reputation += 3;
                this.audio.playSuccess();
                break;
            case 'photo_op':
                this.log("Posed for a photo. +5 Rep!", 'success');
                this.state.stats.reputation += 5;
                this.audio.playChime();
                break;
        }
    }

    hideDialogueChoices() {
        const choicesContainer = document.getElementById('dialogue-choices');
        if (choicesContainer) choicesContainer.classList.add('hidden');
    }

    onDialogueEnd() {
        // Tutorial or just let them play
    }

    toggleMenu() {
        const menu = document.getElementById('menu-overlay');
        menu.classList.toggle('hidden');
        this.audio.playAction();
    }

    setMusicVolume(val) {
        this.audio.setMusicVolume(val);
    }

    setSFXVolume(val) {
        this.audio.setSFXVolume(val);
    }

    toggleMusic(enabled) {
        if (enabled) {
            this.audio.playMusic();
        } else {
            this.audio.stopMusic();
        }
    }

    nextTrack() {
        this.audio.skipToNextTrack();
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => {
                console.log(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    toggleInventory() {
        const panel = document.getElementById('inventory-panel');
        const toggle = document.querySelector('.hud-inventory-toggle');

        if (panel && toggle) {
            panel.classList.toggle('hidden');
            toggle.classList.toggle('active');
            this.audio.playAction();
        }
    }

    updateHUD() {
        try {
            // Time Display (12-hour format with AM/PM)
            const totalMinutes = this.state.minutesElapsed || 0; // Use minutesElapsed, default to 0
            let hours = Math.floor(totalMinutes / 60) + 8; // Add 8 for 8:00 AM start
            const minutes = totalMinutes % 60;
            const period = hours >= 12 ? 'PM' : 'AM';

            // Convert to 12-hour format
            if (hours === 0) hours = 12;
            else if (hours > 12) hours -= 12;

            const timeString = `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
            if (this.ui.time) this.ui.time.textContent = timeString;

            // Player Name
            if (this.state.playerName && this.ui.playerName) {
                this.ui.playerName.textContent = this.state.playerName;
            }

            // Cash
            if (this.ui.cash) this.ui.cash.textContent = `$${this.state.cash.toFixed(2)}`;

            // Rep
            if (this.ui.rep) this.ui.rep.textContent = this.state.stats.reputation;

            // Customer Display
            if (this.ui.customer) {
                if (this.state.currentCustomer) {
                    const c = this.state.currentCustomer;
                    const satisfactionEmoji = this.getSatisfactionEmoji(c.satisfaction);
                    this.ui.customer.innerHTML = `
                        <div>${c.name} (${c.personality})</div>
                        <div>Order: ${c.order}</div>
                        <div>Mood: ${this.getPatienceLevel(c.patience)}</div>
                        <div>Satisfaction: ${satisfactionEmoji} ${Math.round(c.satisfaction)}%</div>
                    `;
                } else {
                    this.ui.customer.textContent = "Waiting for a guest...";
                }
            }

            // Inventory
            if (this.ui.inventory) {
                const inv = this.state.inventory;
                this.ui.inventory.innerHTML = `
                    <div>Std Beans: ${inv.beans_standard}g</div>
                    <div>Prm Beans: ${inv.beans_premium}g</div>
                    <div>Matcha: ${inv.matcha_powder}g</div>
                    <div>Water: ${inv.water}ml</div>
                    <div>Milk: ${inv.milk}ml</div>
                    <div>Cups: ${inv.cups}</div>
                    <div>Filters: ${inv.filters}</div>
                `;
            }

            if (this.ui.shopCash) {
                this.ui.shopCash.textContent = `$${this.state.cash.toFixed(2)}`;
            }

            if (this.ui.rep) {
                this.ui.rep.textContent = `${this.state.stats.reputation} ★`;
            }

            // Update Map Locks
            if (this.state.stats.reputation >= 20) {
                if (!this.state.unlockedLocations.includes('park')) {
                    this.state.unlockedLocations.push('park');
                    this.log("New Location Unlocked: City Park!", 'success');
                }
            }

            if (this.state.unlockedLocations.includes('park')) {
                if (this.ui.nodes && this.ui.nodes.park) { // Added null check for this.ui.nodes.park
                    this.ui.nodes.park.classList.remove('disabled');
                }
            }

            // Sync Park HUD if active
            const parkCashDisplay = document.getElementById('park-cash-display');
            const parkTimeDisplay = document.getElementById('park-time-display');
            const parkRepDisplay = document.getElementById('park-rep-display');

            if (parkCashDisplay && this.ui.cash) { // Added null check for this.ui.cash
                parkCashDisplay.textContent = this.ui.cash.textContent;
            }
            if (parkTimeDisplay && this.ui.time) { // Added null check for this.ui.time
                parkTimeDisplay.textContent = this.ui.time.textContent;
            }
            if (parkRepDisplay && this.ui.rep) { // Added null check for this.ui.rep
                parkRepDisplay.textContent = this.ui.rep.textContent;
            }
        } catch (e) {
            console.error("Error in updateHUD:", e);
        }
    }

    switchScreen(screenName) {
        if (screenName === 'park' && !this.state.unlockedLocations.includes('park')) {
            this.audio.playError();
            return;
        }

        // Hide all screens
        Object.values(this.ui.screens).forEach(el => {
            el.classList.remove('active');
            el.classList.add('hidden');
        });

        // Show target screen
        const target = this.ui.screens[screenName];
        if (target) {
            target.classList.remove('hidden');
            // Small delay to allow display:block to apply before opacity transition
            setTimeout(() => target.classList.add('active'), 10);
        }

        this.audio.playAction(); // Click sound
    }

    getPatienceLevel(p) {
        if (p > 50) return "Happy 😊";
        if (p > 20) return "Okay 😐";
        return "Anxious 😓";
    }

    formatTime(minutesElapsed) {
        const startHour = 8;
        const totalMinutes = (startHour * 60) + minutesElapsed;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHour = hours > 12 ? hours - 12 : hours;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHour}:${displayMinutes} ${period}`;
    }

    log(message, type = 'neutral') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;
        this.ui.log.appendChild(entry);
        this.ui.log.scrollTop = this.ui.log.scrollHeight;
    }

    advanceTime(minutes) {
        try {
            this.state.minutesElapsed += minutes;
            this.updateHUD();
            this.checkCustomerPatience(minutes);

            // Weather affects customer arrival rate
            let arrivalChance = 0.4; // Base chance (40% per minute)
            if (this.state.weather === 'rainy') {
                arrivalChance = 0.25; // Rainy days: fewer customers (25%)
            } else if (this.state.weather === 'sunny') {
                arrivalChance = 0.5; // Sunny days: more customers (50%)
            }

            // Chance for new customer if none exists
            if (!this.state.currentCustomer && Math.random() > (1 - arrivalChance)) {
                this.generateCustomer();
            }

            // Check for end of day
            if (this.state.minutesElapsed >= 540) { // 5:00 PM
                this.endGame();
            }
        } catch (e) {
            console.error("Error in advanceTime:", e);
        }
    }

    handleInput(commandStr) {
        const cmdParts = commandStr.trim().toUpperCase().split(' ');
        const cmd = cmdParts[0];

        if (!cmd) return;
        console.log("handleInput:", cmd);

        // Global/Menu commands
        switch (cmd) {
            case 'BUY':
                this.handleBuyCommand(cmdParts);
                return;
            case 'SWITCH_MODE':
                this.handleBrewCommand(cmd, cmdParts);
                return;
            case 'TALK':
            case 'DIALOGUE_SMALL_TALK':
            case 'DIALOGUE_UPSELL':
            case 'DIALOGUE_END':
                this.handleDialogueCommand(cmd);
                return;
            case 'SHOP':
                this.switchScreen('shop');
                return;
            case 'MAP':
                this.switchScreen('map');
                return;
            case 'RELAX':
                this.handleRelax();
                return;
        }

        // If not a global command, pass to brewing logic
        this.handleBrewCommand(cmd, cmdParts);
    }

    handleBrewCommand(cmd, args) {
        if (!this.state.currentCustomer) {
            this.log("Relax... wait for a guest.", 'error');
            this.audio.playError();
            return;
        }

        const step = this.state.brewingState.step;
        const mode = this.state.brewingState.mode;

        // Mode Switching
        if (cmd === 'SWITCH_MODE') {
            const modes = ['coffee', 'matcha'];
            if (this.state.upgrades.espressoMachine) modes.push('espresso');

            let currentIdx = modes.indexOf(mode);
            let nextMode = modes[(currentIdx + 1) % modes.length];

            if (step !== 0) {
                this.log("Finish current brew first.", 'error');
                return;
            }
            this.state.brewingState.mode = nextMode;
            let modeName = 'AeroPress';
            if (nextMode === 'matcha') modeName = 'Matcha Bowl';
            if (nextMode === 'espresso') modeName = 'Espresso Machine';

            this.log(`Switched to ${modeName}.`, 'system');
            this.updateBrewingVisuals();
            return;
        }

        // RNG Event Check (5% chance on any action)
        if (Math.random() < 0.05) {
            this.triggerRandomEvent();
        }

        // Espresso Workflow
        if (mode === 'espresso') {
            switch (cmd) {
                case 'GRIND':
                    if (step !== 0) return;
                    if (this.state.inventory.beans_premium < 18) {
                        this.log("Need Premium Beans!", 'error');
                        return;
                    }
                    this.state.inventory.beans_premium -= 18;
                    this.state.brewingState.step = 1;
                    this.log("Ground 18g for Espresso.", 'success');
                    this.audio.playAction();
                    break;
                case 'TAMP':
                    if (step !== 1) return;
                    this.state.brewingState.step = 2;
                    this.log("Tamped the grounds firmly.", 'success');
                    this.audio.playAction();
                    break;
                case 'PULL_SHOT':
                    if (step !== 2) return;
                    if (this.state.inventory.water < 50) {
                        this.log("Need water!", 'error');
                        return;
                    }
                    this.state.inventory.water -= 50;
                    this.state.brewingState.step = 3;
                    this.log("Pulled a rich shot.", 'success');
                    this.audio.playAction();
                    break;
                case 'STEAM_MILK':
                    if (step !== 3) return;
                    if (this.state.inventory.milk < 100) {
                        this.log("Need milk!", 'error');
                        return;
                    }
                    this.state.inventory.milk -= 100;
                    this.state.brewingState.step = 4;
                    this.log("Steamed silky milk.", 'success');
                    this.audio.playAction(); // Hiss sound ideally
                    break;
                case 'POUR':
                    if (step !== 4) return;
                    this.state.brewingState.step = 5;
                    this.log("Poured latte art.", 'success');
                    this.audio.playAction();
                    break;
                case 'SERVE':
                    if (step !== 5) return;
                    if (this.state.inventory.cups < 1) {
                        this.log("Out of cups!", 'error');
                        return;
                    }
                    this.state.inventory.cups--;
                    this.serveCustomer();
                    break;
                default:
                    this.log("Invalid action for Espresso.", 'error');
            }
            this.updateBrewingVisuals();
            return;
        }

        // Matcha Workflow
        if (mode === 'matcha') {
            switch (cmd) {
                case 'SIFT':
                    if (step !== 0) return;
                    if (this.state.inventory.matcha_powder < 5) {
                        this.log("Need Matcha Powder!", 'error');
                        return;
                    }
                    this.state.inventory.matcha_powder -= 5;
                    this.state.brewingState.step = 1;
                    this.log("Sifted the matcha powder.", 'success');
                    this.audio.playAction();
                    break;
                case 'ADD_WATER':
                    if (step !== 1) return;
                    if (this.state.inventory.water < 100) {
                        this.log("Need water!", 'error');
                        return;
                    }
                    this.state.inventory.water -= 100;
                    this.state.brewingState.step = 2;
                    this.log("Added hot water.", 'success');
                    this.audio.playAction();
                    break;
                case 'WHISK':
                    if (step !== 2) return;
                    this.state.brewingState.step = 3;
                    this.log("Whisked to perfection!", 'success');
                    this.audio.playChime();
                    break;
                case 'SERVE':
                    if (step !== 3) return;
                    if (this.state.inventory.cups < 1) {
                        this.log("Out of cups!", 'error');
                        return;
                    }
                    this.state.inventory.cups--;
                    this.serveCustomer();
                    break;
                default:
                    this.log("Invalid action for Matcha.", 'error');
            }
            this.updateBrewingVisuals();
            return;
        }

        // Coffee Workflow (Standard)
        switch (cmd) {
            case 'GRIND':
                if (step !== 0) {
                    this.log("Already ground the beans.", 'error');
                    this.audio.playError();
                    return;
                }
                const type = args[1] ? args[1].toUpperCase() : 'STD';
                const beanKey = type === 'PRM' ? 'beans_premium' : 'beans_standard';

                if (this.state.inventory[beanKey] < 20) {
                    this.log("Out of beans!", 'error');
                    this.audio.playError();
                    return;
                }

                this.state.inventory[beanKey] -= 20;
                this.state.brewingState.step = 1;
                this.state.brewingState.beanType = type;
                this.log(`Ground 20g of ${type === 'PRM' ? 'Premium' : 'Standard'} beans.`, 'success');
                this.audio.playAction();
                this.updateBrewingVisuals();

                // Fast grinder upgrade check
                if (this.state.upgrades.fastGrinder) this.log("Fast grinder goes brrr!", 'system');
                break;

            case 'ADD_WATER':
                if (step !== 1) {
                    this.log("Grind beans first.", 'error');
                    this.audio.playError();
                    return;
                }
                if (this.state.inventory.water < 200) {
                    this.log("Need water!", 'error');
                    this.audio.playError();
                    return;
                }
                this.state.inventory.water -= 200;
                this.state.brewingState.step = 2;
                this.log("Added hot water.", 'success');
                this.audio.playAction();
                this.updateBrewingVisuals();
                break;

            case 'STIR':
                if (step !== 2) {
                    this.log("Add water first.", 'error');
                    this.audio.playError();
                    return;
                }
                this.state.brewingState.step = 3;
                this.log("Gently stirred.", 'success');
                this.audio.playAction();
                this.updateBrewingVisuals();
                break;

            case 'TALK':
                this.handleDialogueCommand('TALK');
                break;

            case 'SHOP':
                this.switchScreen('shop');
                break;

            case 'MAP':
                this.switchScreen('map');
                break;

            case 'PLUNGE':
                if (step !== 3) {
                    this.log("Stir first.", 'error');
                    this.audio.playError();
                    return;
                }
                if (this.state.inventory.filters < 1) {
                    this.log("Out of filters!", 'error');
                    return;
                }
                this.state.inventory.filters--;
                this.state.brewingState.step = 4;
                this.log("Pressed the coffee.", 'success');
                this.audio.playAction();
                this.updateBrewingVisuals();
                break;

            case 'SERVE':
                if (step !== 4) {
                    this.log("Not ready yet.", 'error');
                    this.audio.playError();
                    return;
                }
                if (this.state.inventory.cups < 1) {
                    this.log("Out of cups!", 'error');
                    return;
                }
                this.state.inventory.cups--;
                this.serveCustomer();
                break;
        }
    }

    serveCustomer() {
        const customer = this.state.currentCustomer;
        let quality = 1.0;

        // Quality Check
        if (this.state.brewingState.mode === 'coffee') {
            if (customer.order === 'Matcha Latte') quality = 0.1; // Wrong drink
            else if (this.state.brewingState.beanType === 'PRM') quality = 1.5;
        } else if (this.state.brewingState.mode === 'matcha') {
            if (customer.order !== 'Matcha Latte') quality = 0.5; // Served tea to coffee drinker
            else quality = 2.0; // Premium Matcha
        }

        const patienceBonus = customer.patience > 20 ? 1.2 : 1.0;

        const basePrice = 4.00;
        const tip = (customer.patience / 10) * 0.5; // Max $3.00 tip usually
        const total = (basePrice * quality * patienceBonus) + tip;

        this.state.cash += total;

        // Update daily stats
        this.state.stats.customersServed++;
        this.state.stats.tipsEarned += tip;
        this.state.stats.dailyEarnings += total;

        // Reputation logic
        let repChange = 0;
        if (quality >= 1.0 && patienceBonus > 1.0) {
            repChange = 1; // Perfect brew + fast service
            this.log("Perfect service! +1 Rep", 'success');

            if (customer.specialType === 'critic') {
                repChange = 5;
                this.log("The Critic wrote a glowing review! +5 Rep", 'success');
            }
        } else if (quality < 0.5) {
            repChange = -1; // Bad brew
            this.log("Customer wasn't impressed. -1 Rep", 'error');

            if (customer.specialType === 'critic') {
                repChange = -5;
                this.log("The Critic wrote a scathing review! -5 Rep", 'error');
            }
        }

        if (customer.specialType === 'regular') {
            this.log("Jenkins: 'Just like the old days.'", 'system');
        }

        this.state.stats.reputation = Math.max(0, this.state.stats.reputation + repChange);

        this.log(`Served ${customer.name}! +$${total.toFixed(2)}`, 'success');
        this.audio.playSuccess();

        // Reset
        this.state.currentCustomer = null;
        this.state.brewingState.step = 0;
        this.state.brewingState.beanType = null;
        this.updateBrewingVisuals();

        // Hide portrait
        this.ui.customerPortrait.style.opacity = '0';
    }

    updateBrewingVisuals() {
        const step = this.state.brewingState.step;
        const mode = this.state.brewingState.mode;
        const classes = ['state-empty', 'state-ground', 'state-water', 'state-stirred', 'state-plunged'];

        // Toggle Controls
        const coffeeControls = document.getElementById('coffee-controls');
        const matchaControls = document.getElementById('matcha-controls');
        const espressoControls = document.getElementById('espresso-controls');

        coffeeControls.classList.add('hidden');
        matchaControls.classList.add('hidden');
        espressoControls.classList.add('hidden');

        if (mode === 'matcha') {
            matchaControls.classList.remove('hidden');
            this.ui.brewingStation.className = `brewing-station matcha-mode step-${step}`;
        } else if (mode === 'espresso') {
            espressoControls.classList.remove('hidden');
            this.ui.brewingStation.className = `brewing-station espresso-mode step-${step}`;
        } else {
            coffeeControls.classList.remove('hidden');
            this.ui.brewingStation.className = `brewing-station ${classes[step]}`;
        }

        // Update park station if it exists
        if (this.ui.parkBrewingStation) {
            this.ui.parkBrewingStation.className = this.ui.brewingStation.className;
        }
    }
    handleBuyCommand(args) {
        // Format: BUY [ITEM] [QUANTITY]
        if (args.length < 3) return;

        const itemMap = {
            'BEANS_STD': { key: 'beans_standard', cost: 0.05, name: 'Std Beans' }, // $0.05 per gram
            'BEANS_PRM': { key: 'beans_premium', cost: 0.10, name: 'Prm Beans' }, // $0.10 per gram
            'MILK': { key: 'milk', cost: 0.02, name: 'Milk' }, // $0.02 per ml
            'MATCHA': { key: 'matcha_powder', cost: 0.20, name: 'Matcha Powder' }, // $0.20 per gram
            'CUPS': { key: 'cups', cost: 0.10, name: 'Paper Cups' }, // $0.10 per cup
            'FILTERS': { key: 'filters', cost: 0.05, name: 'Paper Filters' }, // $0.05 per filter
            'PLANT': { key: 'plant', cost: 20.00, name: 'Potted Plant', type: 'decoration' },
            'UPGRADE_GRINDER': { key: 'fastGrinder', cost: 50.00, name: 'Fast Grinder', type: 'upgrade' },
            'UPGRADE_MATCHA': { key: 'matchaSet', cost: 100.00, name: 'Matcha Set', type: 'upgrade' },
            'UPGRADE_ESPRESSO': { key: 'espressoMachine', cost: 250.00, name: 'Espresso Machine', type: 'upgrade' }
        };

        const itemKey = args[1];
        const quantity = parseInt(args[2]) || 1; // Default to 1 if not specified (like for decorations)

        if (!itemMap[itemKey]) return;

        const item = itemMap[itemKey];
        const totalCost = item.cost * quantity;

        if (this.state.cash >= totalCost) {
            this.state.cash -= totalCost;

            if (item.type === 'decoration') {
                this.state.decorations.push(item.key);
                this.renderDecorations();
                this.log(`Bought a ${item.name}! Cozy vibes increased.`, 'success');
            } else if (item.type === 'upgrade') {
                this.state.upgrades[item.key] = true;
                this.log(`Upgraded to ${item.name}!`, 'success');
            } else {
                this.state.inventory[item.key] += quantity;
                this.log(`Bought ${quantity} ${item.name}`, 'success');
            }

            this.audio.playAction();
            this.updateHUD(); // Update cash display in shop
            this.advanceTime(5); // Buying takes 5 minutes
        } else {
            this.log(`Need $${totalCost.toFixed(2)}`, 'error');
            this.audio.playError();
        }
    }

    renderDecorations() {
        this.ui.decorations.innerHTML = '';
        this.state.decorations.forEach((type, index) => {
            const el = document.createElement('div');
            el.className = 'decoration';
            // Random position for "cozy clutter" feel
            const left = 10 + (index * 20);
            el.style.left = `${left}%`;
            el.style.bottom = '20px';
            el.style.position = 'absolute';

            if (type === 'plant') {
                el.textContent = '🪴';
                el.style.fontSize = '2rem';
            }
            this.ui.decorations.appendChild(el);
        });
    }

    endGame() {
        this.log("========================================", 'system');
        this.log(`Day ends. You made $${this.state.stats.dailyEarnings.toFixed(2)}`, 'success');
        this.audio.playSuccess();

        // Show summary screen
        this.ui.summary.earnings.textContent = `$${this.state.stats.dailyEarnings.toFixed(2)}`;
        this.ui.summary.customers.textContent = this.state.stats.customersServed;
        this.ui.summary.tips.textContent = `$${this.state.stats.tipsEarned.toFixed(2)}`;

        this.switchScreen('summary');
    }

    handleRelax() {
        if (this.state.currentCustomer) {
            this.log("Can't relax now, customer waiting!", 'error');
            return;
        }
        this.log("You take a sip of coffee... warm and cozy.", 'success');
        this.audio.playChime();
        this.advanceTime(15); // Relaxing takes time

        // Maybe small heal or bonus?
    }

    setWeather(type) {
        this.state.weather = type;
        if (type === 'rainy') {
            this.ui.weatherOverlay.className = 'weather-overlay weather-rain';
            this.ui.weatherOverlay.style.opacity = '1';
            this.log("It's a rainy day. Fewer customers, but cozy vibes.", 'system');
            this.log("Customers seem less patient in the rain...", 'system');
        } else {
            this.ui.weatherOverlay.style.opacity = '0';
            this.log("It's a sunny day. Perfect weather for coffee!", 'system');
            this.log("Customers are in a great mood today!", 'system');
        }
    }

    startNewDay() {
        this.state.minutesElapsed = 0;
        this.state.stats.dailyEarnings = 0;
        this.state.stats.customersServed = 0;
        this.state.stats.tipsEarned = 0;
        this.state.currentCustomer = null;
        this.state.brewingState.step = 0;

        this.updateHUD();
        this.updateBrewingVisuals();
        this.ui.customerPortrait.style.opacity = '0';
        this.ui.log.innerHTML = ''; // Clear log

        // Random Weather
        const weather = Math.random() > 0.7 ? 'rainy' : 'sunny';
        this.setWeather(weather);

        this.switchScreen('cart');
    }
    triggerRandomEvent() {
        const events = [
            {
                name: "Butterfingers",
                msg: "Oops! You dropped a cup.",
                effect: () => {
                    if (this.state.inventory.cups > 0) {
                        this.state.inventory.cups--;
                        this.log("💥 CRASH! Dropped a cup. -1 Cup", 'error');
                    }
                }
            },
            {
                name: "Spill",
                msg: "Spilled some milk!",
                effect: () => {
                    if (this.state.inventory.milk > 50) {
                        this.state.inventory.milk -= 50;
                        this.log("💦 SPLASH! Spilled milk. -50ml", 'error');
                    }
                }
            },
            {
                name: "Grinder Jam",
                msg: "Grinder is jammed!",
                effect: () => {
                    this.log("⚙️ GRIND! Grinder jammed. Paying $5 fix.", 'error');
                    if (this.state.cash >= 5) {
                        this.state.cash -= 5;
                    } else {
                        this.log("Can't afford fix! Wasted time.", 'error');
                        this.advanceTime(10);
                    }
                }
            }
        ];

        const event = events[Math.floor(Math.random() * events.length)];
        event.effect();
        this.audio.playError();
    }
    generateCustomer() {
        try {
            if (this.state.currentCustomer) return;

            const names = ['Alice', 'Bob', 'Charlie', 'Dana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Igor', 'Jasmine', 'Ken', 'Liam', 'Mia', 'Noah', 'Olivia'];
            const name = names[Math.floor(Math.random() * names.length)];

            let specialType = null;
            const rand = Math.random();
            if (rand < 0.05) specialType = 'critic';
            else if (rand < 0.2) specialType = 'regular';
            else if (rand < 0.3) specialType = 'hipster'; // Likes Matcha
            else if (rand < 0.4) specialType = 'student'; // Impatient but simple
            else if (rand < 0.5) specialType = 'tourist'; // Patient, tips well

            // Park customers are impatient
            const parkEl = document.getElementById('screen-park');
            const isPark = parkEl && parkEl.classList.contains('active');
            let patience = isPark ? 60 : 100;

            if (specialType === 'critic') patience = 50;
            if (specialType === 'regular') patience = 150;
            if (specialType === 'student') patience = 70;
            if (specialType === 'tourist') patience = 120;

            // Weather affects customer patience
            if (this.state.weather === 'rainy') {
                patience = Math.floor(patience * 0.8); // Rainy: customers are 20% less patient
            } else if (this.state.weather === 'sunny') {
                patience = Math.floor(patience * 1.2); // Sunny: customers are 20% more patient
            }

            let order = 'Coffee';
            // Order Logic
            if (this.state.upgrades.matchaSet && (specialType === 'hipster' || Math.random() < 0.3)) {
                order = 'Matcha Latte';
                patience += 20;
            } else if (this.state.upgrades.espressoMachine && Math.random() < 0.3) {
                order = 'Espresso'; // Simplification, could be Latte/Cappuccino
            }

            // Portrait Logic
            let portrait = 'assets/pixel_customer_1.png';
            // if (Math.random() > 0.5) portrait = 'assets/pixel_customer_2.png';

            this.state.currentCustomer = {
                name: name,
                type: specialType || 'default',
                personality: specialType ? specialType.charAt(0).toUpperCase() + specialType.slice(1) : 'Normal',
                order: order,
                patience: patience,
                maxPatience: patience,
                decay: isPark ? 0.8 : 0.5,
                portrait: portrait,
                specialType: specialType,
                arrivalTime: this.state.minutesElapsed,
                satisfaction: 50, // Start at neutral (0-100 scale)
                conversationCount: 0
            };

            this.audio.playChime();

            // Update both portraits (Cart and Park)
            this.ui.customerPortrait.src = this.state.currentCustomer.portrait;
            this.ui.customerPortrait.style.opacity = '1';

            // Special Dialogue
            if (specialType === 'critic') {
                this.dialogue.show([
                    "I'm here to inspect your establishment.",
                    "Don't disappoint me."
                ]);
            } else if (specialType === 'regular') {
                this.dialogue.show([
                    "Morning! The usual, please.",
                    "My joints are aching today..."
                ]);
            }

            const parkPortrait = document.getElementById('park-customer-portrait');
            if (parkPortrait) {
                parkPortrait.src = this.state.currentCustomer.portrait;
                parkPortrait.style.opacity = '1';
            }

            // Trigger animation
            this.ui.customer.classList.remove('customer-arrive');
            void this.ui.customer.offsetWidth;
            this.ui.customer.classList.add('customer-arrive');

            this.updateHUD();
        } catch (e) {
            console.error("Error in generateCustomer:", e);
        }
    }

    checkCustomerPatience(minutesPassed) {
        try {
            if (!this.state.currentCustomer) return;

            const customer = this.state.currentCustomer;

            // Patience decay modifier based on decorations
            let decayModifier = 1.0;
            if (this.state.decorations.includes('plant')) decayModifier *= 0.8; // 20% slower decay per plant type (simplified)

            customer.patience -= (customer.decay * minutesPassed * decayModifier);

            if (customer.patience <= 0) {
                this.log(`${customer.name} left quietly.`, 'error');
                this.state.currentCustomer = null;
                this.ui.customerPortrait.style.opacity = '0';
                // Penalty?
            }
        } catch (e) {
            console.error("Error in checkCustomerPatience:", e);
        }
    }
}

window.onload = () => {
    new Game();
};
