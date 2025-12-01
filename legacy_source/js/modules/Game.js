import { AudioSystem } from './AudioSystem.js';
import { DialogueSystem } from './DialogueSystem.js';
import DIALOGUE_DATA from '../data/dialogueData.js';

export class Game {
    constructor() {
        this.state = {
            time: '05:00 AM', // Simplified for now, will need minutes
            day: 1,
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
                cumulativeEarnings: 0, // Total money earned across all days
                reputation: 0
            },
            purchaseHistory: [], // Track all purchases
            marketTrends: {
                beans_standard: [],
                beans_premium: [],
                milk: [],
                matcha_powder: []
            },
            weather: 'sunny', // sunny, rainy
            upgrades: [], // List of purchased upgrade IDs
            unlockedLocations: ['cart'],
            darkModeUnlocked: false, // Dark mode unlock state
            darkModeEnabled: false, // Dark mode toggle state
            debug: {
                enabled: false,
                weatherDisabled: false,
                customerArrivalDisabled: false,
                timePaused: false,
                infiniteResources: false,
                timeSpeed: 1 // 1x, 2x, 5x, or 10x
            },
            gameStarted: false // Block input until intro is closed
            settings: {
                uiScale: 100,
                musicVolume: 30,
                sfxVolume: 10,
                ambienceVolume: 30
            }
        };

        this.ui = {
            time: document.getElementById('time-display'),
            cash: document.getElementById('cash-display'),
            rep: document.getElementById('rep-display'),
            customerInfoPanel: document.getElementById('customer-info-panel'),
            customerName: document.getElementById('customer-name'),
            patienceMeter: document.getElementById('patience-meter'),
            satisfactionMeter: document.getElementById('satisfaction-meter'),
            inventory: document.getElementById('inventory-items'),
            log: document.getElementById('game-log'),
            brewingStation: document.getElementById('brewing-station'),
            matchaStation: document.getElementById('matcha-station'),
            espressoStation: document.getElementById('espresso-station'),
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
            weatherIcon: document.getElementById('weather-icon'),
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

        // Initialize UI Scale
        if (this.state.settings && this.state.settings.uiScale) {
            this.setUIScale(this.state.settings.uiScale);
            // Update slider position if it exists
            const slider = document.querySelector('input[oninput="game.setUIScale(this.value)"]');
            if (slider) slider.value = this.state.settings.uiScale;
        }

        // Initialize volumes if settings exist, otherwise defaults are used
        if (this.state.settings) {
             if (this.state.settings.musicVolume !== undefined) this.setMusicVolume(this.state.settings.musicVolume);
             if (this.state.settings.sfxVolume !== undefined) this.setSFXVolume(this.state.settings.sfxVolume);
             if (this.state.settings.ambienceVolume !== undefined) this.setAmbienceVolume(this.state.settings.ambienceVolume);
        }

        // Initialize the game (show name modal or load saved game)
        this.upgradeDefinitions = {
            'grinder_fast': { name: 'Fast Grinder', cost: 50, rep: 0, description: 'Grind beans instantly.', type: 'passive' },
            'mode_matcha': { name: 'Matcha Kit', cost: 100, rep: 10, description: 'Unlock Matcha brewing mode.', type: 'mode', modeId: 'matcha' },
            'mode_espresso': { name: 'Espresso Machine', cost: 250, rep: 25, description: 'Unlock Espresso brewing mode.', type: 'mode', modeId: 'espresso' }
        };

        this.init();

        // Setup customer portrait touch/click handlers
        this.setupCustomerPortraitTouch();

        // Global Key Handlers
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault(); // Prevent focus change
                this.toggleInventory();
            }
        });

        // Initial check
        this.checkModeUnlock();
        this.setupTooltips();
    }

    setupTooltips() {
        const tooltip = document.getElementById('custom-tooltip');
        if (!tooltip) return;

        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                const text = target.getAttribute('data-tooltip');
                tooltip.textContent = text;
                tooltip.classList.remove('hidden');

                // Position initially
                this.updateTooltipPosition(e, tooltip);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!tooltip.classList.contains('hidden')) {
                this.updateTooltipPosition(e, tooltip);
            }
        });

        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                tooltip.classList.add('hidden');
            }
        });
    }

    updateTooltipPosition(e, tooltip) {
        const x = e.clientX;
        const y = e.clientY;

        // Keep within bounds
        const rect = tooltip.getBoundingClientRect();
        let left = x + 15;
        let top = y + 15;

        if (left + rect.width > window.innerWidth) {
            left = x - rect.width - 10;
        }
        if (top + rect.height > window.innerHeight) {
            top = y - rect.height - 10;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    checkModeUnlock() {
        // Show Mode buttons if any mode upgrade is owned
        const hasModes = this.state.upgrades.some(u => u.startsWith('mode_'));
        const modeBtns = document.querySelectorAll('button[onclick="game.handleInput(\'SWITCH_MODE\')"]');

        modeBtns.forEach(btn => {
            if (hasModes) {
                btn.classList.remove('hidden');
            } else {
                btn.classList.add('hidden');
            }
        });
    }

    toggleDarkMode(enabled) {
        this.state.darkModeEnabled = enabled;
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    toggleInventory() {
        const modal = document.getElementById('screen-inventory');
        if (modal) {
            if (modal.classList.contains('hidden')) {
                modal.classList.remove('hidden');
                this.switchInventoryTab('items'); // Default to items
                this.updateInventoryDisplay(); // Ensure fresh data
            } else {
                modal.classList.add('hidden');
            }
        }
    }

    switchInventoryTab(tabName) {
        // Update tab buttons
        const tabs = document.querySelectorAll('#screen-inventory .tab-btn');
        tabs.forEach(btn => {
            if (btn.textContent.toLowerCase() === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const items = document.getElementById('inventory-items');
        const stats = document.getElementById('inventory-stats');

        if (tabName === 'items') {
            items.classList.remove('hidden');
            stats.classList.add('hidden');
        } else {
            items.classList.add('hidden');
            stats.classList.remove('hidden');
            this.renderInventoryStats();
        }
    }

    renderInventoryStats() {
        const historyList = document.getElementById('purchase-history-list');
        if (historyList) {
            historyList.innerHTML = '';
            const recent = this.state.purchaseHistory.slice(-10).reverse(); // Last 10
            if (recent.length === 0) {
                historyList.innerHTML = '<li>No purchases yet.</li>';
            } else {
                recent.forEach(p => {
                    const li = document.createElement('li');
                    li.textContent = `Day ${p.day}: Bought ${p.quantity} ${p.item} for $${p.cost.toFixed(2)}`;
                    historyList.appendChild(li);
                });
            }
        }

        // Market Trends (Placeholder for now)
        const trends = document.getElementById('market-stats-content');
        if (trends) {
            trends.innerHTML = '<p>Market prices are stable.</p>';
        }
    }

    updateInventoryDisplay() {
        const container = document.getElementById('inventory-items');
        if (!container) return;

        container.innerHTML = '';

        const itemNames = {
            beans_standard: 'Standard Beans',
            beans_premium: 'Premium Beans',
            matcha_powder: 'Matcha Powder',
            water: 'Water',
            milk: 'Milk',
            cups: 'Cups',
            filters: 'Filters'
        };

        const itemIcons = {
            beans_standard: '🫘',
            beans_premium: '✨',
            matcha_powder: '🍃',
            water: '💧',
            milk: '🥛',
            cups: '🥤',
            filters: '📄'
        };

        Object.entries(this.state.inventory).forEach(([key, amount]) => {
            if (amount > 0 || ['beans_standard', 'water', 'milk', 'cups', 'filters'].includes(key)) {
                const el = document.createElement('div');
                el.className = 'inventory-item';

                let displayAmount = amount;
                let unit = '';

                if (key.includes('beans') || key === 'matcha_powder') unit = 'g';
                if (key === 'water' || key === 'milk') unit = 'ml';

                el.innerHTML = `
                    <div class="icon">${itemIcons[key] || '📦'}</div>
                    <div class="details">
                        <h3>${itemNames[key] || key}</h3>
                        <p>${displayAmount}${unit}</p>
                    </div>
                `;
                container.appendChild(el);
            }
        });
    }

    handleBuyCommand(args) {
        // Format: BUY [ITEM] [QUANTITY]
        if (args.length < 3) return;

        const itemMap = {
            'BEANS_STD': { key: 'beans_standard', cost: 0.05, name: 'Std Beans' }, // $0.05 per gram
            'BEANS_PRM': { key: 'beans_premium', cost: 0.10, name: 'Prm Beans' }, // $0.10 per gram
            'MILK': { key: 'milk', cost: 0.02, name: 'Milk' }, // $0.02 per ml
            'MILK_OAT': { key: 'milk_oat', cost: 0.06, name: 'Oat-Milk' }, // $0.02 per ml
            'WATER': { key: 'water', cost: 0.004, name: 'Water' }, // $2 for 500ml
            'MATCHA': { key: 'matcha_powder', cost: 0.20, name: 'Matcha' }, // $10 for 50g
            'CUPS': { key: 'cups', cost: 0.10, name: 'Cups' }, // $5 for 50
            'FILTERS': { key: 'filters', cost: 0.05, name: 'Filters' }, // $2.50 for 50
            'PLANT': { key: 'plant', cost: 20.00, name: 'Potted Plant', type: 'decoration' }
        };

        const itemKey = args[1];
        const quantity = parseInt(args[2]);

        if (!itemMap[itemKey]) {
            this.log("Unknown item.", 'error');
            return;
        }

        if (isNaN(quantity) && itemMap[itemKey].type !== 'decoration') {
            this.log("Invalid quantity.", 'error');
            return;
        }

        const item = itemMap[itemKey];
        const totalCost = item.type === 'decoration' ? item.cost : item.cost * quantity;

        if (this.state.cash >= totalCost) {
            this.state.cash -= totalCost;

            if (item.type === 'decoration') {
                this.state.decorations.push(item.key);
                this.renderDecorations();
                this.log(`Bought a ${item.name}! Cozy vibes increased.`, 'success');
            } else {
                this.state.inventory[item.key] += quantity;
                this.log(`Bought ${quantity} ${item.name}`, 'success');

                // Track purchase
                if (!this.state.purchaseHistory) this.state.purchaseHistory = [];
                this.state.purchaseHistory.push({
                    day: this.state.day || 1, // Assuming day is tracked, default to 1
                    item: item.name,
                    quantity: quantity,
                    cost: totalCost,
                    timestamp: Date.now()
                });
            }

            this.audio.playAction();
            this.updateHUD(); // Update cash display in shop
            this.advanceTime(5); // Buying takes 5 minutes
        } else {
            this.log(`Need $${totalCost.toFixed(2)}`, 'error');
            this.audio.playError();
        }
    }

    openModeMenu() {
        const modal = document.getElementById('mode-selection-modal');
        if (!modal) return;

        // Update locked states
        const btnMatcha = document.getElementById('mode-btn-matcha');
        const btnEspresso = document.getElementById('mode-btn-espresso');

        if (btnMatcha) {
            if (this.state.upgrades.includes('mode_matcha')) {
                btnMatcha.classList.remove('locked');
                btnMatcha.querySelector('.mode-desc').textContent = 'Traditional & Zen';
            } else {
                btnMatcha.classList.add('locked');
                btnMatcha.querySelector('.mode-desc').textContent = 'Locked (Buy Kit)';
            }
        }

        if (btnEspresso) {
            if (this.state.upgrades.includes('mode_espresso')) {
                btnEspresso.classList.remove('locked');
                btnEspresso.querySelector('.mode-desc').textContent = 'Rich & Intense';
            } else {
                btnEspresso.classList.add('locked');
                btnEspresso.querySelector('.mode-desc').textContent = 'Locked (Buy Machine)';
            }
        }

        modal.classList.remove('hidden');
    }

    closeModeMenu() {
        const modal = document.getElementById('mode-selection-modal');
        if (modal) modal.classList.add('hidden');
    }

    selectMode(mode) {
        if (this.state.brewingState.step !== 0) {
            this.log("Finish current brew first.", 'error');
            this.closeModeMenu();
            return;
        }

        // Check locks
        if (mode === 'matcha' && !this.state.upgrades.includes('mode_matcha')) {
            this.audio.playError();
            return;
        }
        if (mode === 'espresso' && !this.state.upgrades.includes('mode_espresso')) {
            this.audio.playError();
            return;
        }

        this.state.brewingState.mode = mode;
        let modeName = 'AeroPress';
        if (mode === 'matcha') modeName = 'Matcha Bowl';
        if (mode === 'espresso') modeName = 'Espresso Machine';

        this.log(`Switched to ${modeName}.`, 'system');

        // Update Controls
        const controls = {
            coffee: document.getElementById('coffee-controls'),
            matcha: document.getElementById('matcha-controls'),
            espresso: document.getElementById('espresso-controls')
        };

        // Hide all first
        Object.values(controls).forEach(el => el && el.classList.add('hidden'));

        // Show selected
        if (controls[mode]) controls[mode].classList.remove('hidden');

        // Update Visuals
        this.updateBrewingVisuals();
        this.closeModeMenu();
    }



    switchShopTab(tabName) {
        // Update tab buttons
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(btn => {
            if (btn.textContent.toLowerCase() === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Show/Hide containers
        const supplies = document.getElementById('shop-supplies');
        const upgrades = document.getElementById('shop-upgrades');

        if (tabName === 'supplies') {
            supplies.classList.remove('hidden');
            upgrades.classList.add('hidden');
        } else {
            supplies.classList.add('hidden');
            upgrades.classList.remove('hidden');
            this.renderUpgrades();
        }
    }

    renderUpgrades() {
        const container = document.getElementById('shop-upgrades');
        container.innerHTML = '';

        Object.entries(this.upgradeDefinitions).forEach(([id, upgrade]) => {
            const isOwned = this.state.upgrades.includes(id);
            const canAfford = this.state.cash >= upgrade.cost;
            const hasRep = this.state.stats.reputation >= upgrade.rep;
            const isLocked = !hasRep;

            const el = document.createElement('div');
            el.className = `shop-item ${isOwned ? 'owned' : ''} ${isLocked ? 'locked' : ''}`;

            let icon = '⚙️';
            if (upgrade.type === 'mode') icon = '✨';

            el.innerHTML = `
                <div class="icon">${icon}</div>
                <div class="details">
                    <h3>${upgrade.name}</h3>
                    <p>${upgrade.description}</p>
                    <p class="cost">
                        ${isOwned ? 'Purchased' : `$${upgrade.cost} • ${upgrade.rep} Rep`}
                    </p>
                </div>
                <button class="btn buy" 
                    onclick="game.buyUpgrade('${id}')"
                    ${isOwned || isLocked ? 'disabled' : ''}>
                    ${isOwned ? 'Owned' : (isLocked ? 'Locked' : 'Buy')}
                </button>
            `;
            container.appendChild(el);
        });
    }

    buyUpgrade(id) {
        const upgrade = this.upgradeDefinitions[id];
        if (!upgrade) return;

        if (this.state.upgrades.includes(id)) {
            this.log("You already own this upgrade.", 'neutral');
            return;
        }

        if (this.state.cash < upgrade.cost) {
            this.log(`Need $${upgrade.cost.toFixed(2)}`, 'error');
            this.audio.playError();
            return;
        }

        if (this.state.stats.reputation < upgrade.rep) {
            this.log(`Need ${upgrade.rep} Reputation`, 'error');
            this.audio.playError();
            return;
        }

        // Purchase successful
        this.state.cash -= upgrade.cost;
        this.state.upgrades.push(id);
        this.updateHUD();
        this.audio.playAction();
        this.log(`Purchased ${upgrade.name}!`, 'success');

        // Apply effects
        if (upgrade.type === 'mode') {
            // Unlock mode logic will go here or be checked dynamically
            this.log(`Unlocked ${upgrade.name} mode!`, 'success');
        }
        this.checkModeUnlock(); // Update UI immediately
        this.renderUpgrades(); // Refresh UI
        this.saveGame(); // Save progress
    }

    consumeResource(resource, amount) {
        // Helper function to consume resources, respecting infinite resources debug option
        if (this.state.debug && this.state.debug.infiniteResources) {
            return true; // Always succeed if infinite resources enabled
        }
        if (this.state.inventory[resource] < amount) {
            return false; // Not enough resources
        }
        this.state.inventory[resource] -= amount;
        this.trackResourceUsage(resource, amount); // Track for statistics
        return true; // Successfully consumed
    }

    setupCustomerPortraitTouch() {
        // Add click/touch handler for customer portrait to toggle info panel on mobile
        if (this.ui.customerPortrait && !this.ui.customerPortrait.hasAttribute('data-touch-setup')) {
            this.ui.customerPortrait.setAttribute('data-touch-setup', 'true');

            this.ui.customerPortrait.addEventListener('click', (e) => {
                e.stopPropagation();
                const panel = this.ui.customerInfoPanel;
                if (panel && this.state.currentCustomer) {
                    // MOBILE INTERACTION:
                    // On touch devices (where hover isn't available), clicking the portrait
                    // toggles the customer info panel. On desktop, it shows on hover (handled by CSS).
                    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
                        // Mobile device - toggle panel
                        panel.classList.toggle('show-on-touch');
                    }
                }
            });

            // Also handle touch events for better mobile support
            let touchStartTime = 0;
            this.ui.customerPortrait.addEventListener('touchstart', (e) => {
                touchStartTime = Date.now();
            });

            this.ui.customerPortrait.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const touchDuration = Date.now() - touchStartTime;
                // Only toggle if it was a quick tap (not a long press)
                if (touchDuration < 300) {
                    const panel = this.ui.customerInfoPanel;
                    if (panel && this.state.currentCustomer) {
                        panel.classList.toggle('show-on-touch');
                    }
                }
            });
        }
    }

    setUIScale(value) {
        value = parseInt(value);
        if (isNaN(value)) return;

        // Clamp between 75 and 150
        value = Math.max(75, Math.min(150, value));

        // Update state
        if (!this.state.settings) this.state.settings = {};
        this.state.settings.uiScale = value;

        // Update label
        const label = document.getElementById('ui-scale-value');
        if (label) label.textContent = value + '%';

        // Apply scale (Base font size 16px * scale/100)
        // We now scale the root element so rem units work for everything (icons, etc)
        document.documentElement.style.fontSize = (16 * (value / 100)) + 'px';
    }

    saveGame() {
        const saveData = {
            state: this.state,
            timestamp: Date.now()
        };
        localStorage.setItem('chillista_save', JSON.stringify(saveData));
        // Silent save - no log or audio
        // this.log("Game Saved.", 'system');
        // this.audio.playSuccess();

        // Visual feedback - show a brief success message
        const saveBtn = document.querySelector('button[onclick="game.saveGame()"]');
        if (saveBtn) {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = "✓ Saved!";
            saveBtn.style.backgroundColor = 'var(--success-color)';
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.backgroundColor = '';
            }, 1500);
        }
    }

    resetGame() {
        // Hide main menu if open
        const menu = document.getElementById('menu-overlay');
        if (menu && !menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
        }

        // Show confirmation modal
        const modal = document.getElementById('reset-confirmation-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.audio.playAction();
        }
    }

    confirmReset() {
        localStorage.removeItem('chillista_save');
        location.reload();
    }

    cancelReset() {
        const modal = document.getElementById('reset-confirmation-modal');
        if (modal) {
            modal.classList.add('hidden');
            this.audio.playAction();
        }
        // Re-open main menu
        this.toggleMenu();
    }

    loadGame() {
        const saveString = localStorage.getItem('chillista_save');
        if (saveString) {
            try {
                const saveData = JSON.parse(saveString);
                // Merge saved state with default state to handle new fields
                this.state = { ...this.state, ...saveData.state };

                // Migration: Convert object-based upgrades to array
                if (this.state.upgrades && !Array.isArray(this.state.upgrades)) {

                    const newUpgrades = [];
                    // Map old keys to new keys if necessary, or just use keys
                    // Old keys: fastGrinder, espressoMachine, matchaSet
                    // New keys: grinder_fast, mode_espresso, mode_matcha
                    if (this.state.upgrades.fastGrinder) newUpgrades.push('grinder_fast');
                    if (this.state.upgrades.espressoMachine) newUpgrades.push('mode_espresso');
                    if (this.state.upgrades.matchaSet) newUpgrades.push('mode_matcha');

                    this.state.upgrades = newUpgrades;
                }

                // Restore complex objects if needed (e.g., Date objects, though we use simple numbers)
                this.log("Welcome back! Game loaded.", 'system');
                this.checkModeUnlock(); // Update UI based on upgrades
                return true;
            } catch (e) {
                console.error("Failed to load save:", e);
                return false;
            }
        }
        return false;
    }

    init() {
        // Ensure name modal is hidden initially
        const nameModal = document.getElementById('name-modal');
        if (nameModal) {
            nameModal.classList.add('hidden');
        }

        // Check for existing save
        if (localStorage.getItem('baristaSimSave')) {
            console.log("Found save file, skipping intro...");
            if (this.loadGame()) {
                this.state.gameStarted = true;

                // Show HUD buttons
                const musicToggle = document.getElementById('music-toggle');
                const mapToggle = document.getElementById('map-toggle');
                if (musicToggle) musicToggle.classList.remove('hidden');
                if (mapToggle) mapToggle.classList.remove('hidden');

                this.startGame(false);

                // Ensure intro modal is hidden
                const introModal = document.getElementById('intro-modal');
                if (introModal) introModal.classList.add('hidden');
                return;
            }
        }

        // Show Intro Modal if no save or load failed
        const introModal = document.getElementById('intro-modal');
        if (introModal) {
            introModal.classList.remove('hidden');
        } else {
            // Fallback if modal missing
            this.startFlow();
        }

        // Autosave every 30 seconds (only when menu is closed)
        setInterval(() => {
            const menu = document.getElementById('menu-overlay');
            if (menu && menu.classList.contains('hidden')) {
                this.saveGame();
            }
        }, 30000);

        // Bind Name Submit Button explicitly
        const submitBtn = document.getElementById('name-submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitName());
        }

        // Bind Enter key for name input
        const nameInput = document.getElementById('player-name-input');
        if (nameInput) {
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.submitName();
                }
            });
        }

        // Attempt to play music immediately (may be blocked by browser)
        try {
            this.audio.context.resume().then(() => {
                this.audio.playMusic();
            }).catch(e => console.log("Autoplay blocked, waiting for interaction:", e));
        } catch (e) {
            console.log("Audio init failed:", e);
        }
    }

    startNewGameFlow() {
        // Show intro modal explicitly
        const introModal = document.getElementById('intro-modal');
        if (introModal) {
            introModal.classList.remove('hidden');
        }
    }

    closeIntro() {
        const introModal = document.getElementById('intro-modal');
        if (introModal) {
            introModal.classList.add('hidden');
            this.audio.playAction();

            // Unlock audio context on user interaction
            if (this.audio.context.state === 'suspended') {
                this.audio.context.resume().then(() => {
                    if (!this.audio.bgm || this.audio.bgm.paused) {
                        this.audio.playMusic();
                    }
                });
            } else {
                if (!this.audio.bgm || this.audio.bgm.paused) {
                    this.audio.playMusic();
                }
            }
        }

        // Show HUD buttons
        const musicToggle = document.getElementById('music-toggle');
        const mapToggle = document.getElementById('map-toggle');
        if (musicToggle) musicToggle.classList.remove('hidden');
        if (mapToggle) mapToggle.classList.remove('hidden');

        this.state.gameStarted = true; // Unblock input

        // Show name entry when intro is closed
        this.showNameModal();
    }

    showNameModal() {
        const nameModal = document.getElementById('name-modal');
        if (nameModal) {
            nameModal.classList.remove('hidden');
            // Focus input
            setTimeout(() => {
                const input = document.getElementById('player-name-input');
                if (input) input.focus();
            }, 100);
        }
    }

    submitName() {
        try {

            const input = document.getElementById('player-name-input');
            if (!input) {
                console.error("Input element not found!");
                return;
            }
            const name = input.value.trim();


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

            this.updateHUD();
            // Expose game instance for button clicks
            window.game = this;

            // Intro Dialogue
            setTimeout(() => {
                try {
                    this.dialogue.show([
                        `Welcome back, ${this.state.playerName}.`,
                        "Just you, your tools, and the beans...",
                        "Let's brew some magic."
                    ]);
                } catch (e) {
                    console.error("Error showing dialogue:", e);
                }
            }, 1000);

            // Audio unlock on any user interaction
            const unlockAudio = () => {
                this.audio.context.resume().then(() => {
                    if (!this.audio.bgm || this.audio.bgm.paused) {
                        this.audio.playMusic();
                    }
                    this.audio.playAmbience('assets/ambience_shop.mp3');
                });
                document.removeEventListener('click', unlockAudio);
                document.removeEventListener('keydown', unlockAudio);
            };
            document.addEventListener('click', unlockAudio);
            document.addEventListener('keydown', unlockAudio);

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
                    if (this.ui.weatherIcon) {
                        this.ui.weatherIcon.src = 'assets/weather_rainy.png';
                    }
                } else {
                    this.ui.weatherOverlay.className = 'weather-overlay';
                    this.ui.weatherOverlay.style.opacity = '0';
                    if (this.ui.weatherIcon) {
                        this.ui.weatherIcon.src = 'assets/weather_sunny.png';
                    }
                }
            }

            // Restore dark mode state
            if (this.state.darkModeEnabled) {
                document.body.classList.add('dark-mode');
            }
            this.updateDarkModeToggle();

            // Start Real-time Clock
            this.startClock();

        } catch (e) {
            console.error("Error in startGame:", e);
            alert("Error starting game: " + e.message);
        }
    }

    startClock() {
        if (this.clockInterval) clearInterval(this.clockInterval);
        const speed = this.state.debug.timeSpeed || 1;
        const interval = 1000 / speed; // Faster interval for higher speeds
        this.clockInterval = setInterval(() => {
            this.advanceTime(1);
        }, interval);
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
            this.applyDialogueEffect({ type: 'reputation', value: 1, satisfaction: 5 });

            // Context-aware responses based on game state
            let responses = [];

            if (this.state.weather === 'rainy') {
                responses = [
                    "Lovely to have a warm drink on a rainy day!",
                    "The rain makes coffee taste even better.",
                    "Thanks for brightening up my gloomy day.",
                    "Your coffee warms my soul on days like this."
                ];
            } else {
                responses = [
                    "Lovely weather we're having!",
                    "I really like the vibe here.",
                    "It's been a long week, this helps!",
                    "Your coffee is the best in town.",
                    "Thanks for chatting with me!",
                    "This place is so cozy."
                ];
            }

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
            const success = this.applyDialogueEffect({ type: 'upsell', chance: 0.4, value: 3, satisfaction: 2 });
            if (success) {
                const responses = ["Ooh, that looks delicious! I'll take one.", "Sure, why not?", "You twisted my arm!", "Actually, yes, I'll treat myself!"];
                this.dialogue.show([`${this.state.currentCustomer.name}: "${responses[Math.floor(Math.random() * responses.length)]}"`]);
            } else {
                const responses = ["No thanks, just the drink.", "I'm watching my calories.", "Maybe next time.", "Not today, thanks though!"];
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
        let type = 'default';
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

        const customer = this.state.currentCustomer;
        let feedbackMessages = [];

        // Apply satisfaction change if present
        if (effect.satisfaction && customer) {
            customer.satisfaction += effect.satisfaction;
            // Clamp between 0-100
            customer.satisfaction = Math.max(0, Math.min(100, customer.satisfaction));

            // Show feedback based on satisfaction change
            if (effect.satisfaction > 8) {
                feedbackMessages.push("Customer seems very happy! 😊");
                this.audio.playChime();
            } else if (effect.satisfaction > 0) {
                feedbackMessages.push("Customer is pleased.");
                this.audio.playChime();
            } else if (effect.satisfaction < -5) {
                feedbackMessages.push("Customer looks annoyed... 😞");
                this.audio.playError();
            } else if (effect.satisfaction < 0) {
                feedbackMessages.push("Customer seems a bit put off.");
                this.audio.playError();
            }
        }

        switch (effect.type) {
            case 'reputation':
                this.state.stats.reputation += effect.value;
                feedbackMessages.push(`+${effect.value} Rep (Total: ${this.state.stats.reputation})`);
                break;
            case 'patience':
                if (customer) {
                    customer.patience += effect.value;
                    feedbackMessages.push(`+${effect.value} Patience`);
                }
                break;
            case 'tips':
                this.state.stats.tipsEarned += effect.value;
                this.state.cash += effect.value;
                feedbackMessages.push(`Got a $${effect.value} tip! (Total: $${this.state.cash.toFixed(2)})`);
                this.audio.playChime();
                break;
            case 'upsell':
                if (Math.random() < effect.chance) {
                    this.state.cash += effect.value;
                    this.state.stats.dailyEarnings += effect.value;
                    feedbackMessages.push(`Upsell successful! +$${effect.value}`);
                    this.audio.playChime();
                    return true;
                } else {
                    feedbackMessages.push("Upsell attempt failed - customer not interested");
                    if (customer) {
                        customer.patience -= 10;
                        customer.satisfaction -= 5;
                    }
                    this.audio.playError();
                    return false;
                }
                break;
            case 'custom':
                this.handleCustomDialogueAction(effect.action);
                break;
        }

        // Log all feedback messages
        feedbackMessages.forEach(msg => {
            this.log(msg, effect.satisfaction > 0 ? 'success' : effect.satisfaction < 0 ? 'error' : 'system');
        });

        this.updateHUD();
    }

    handleCustomDialogueAction(action) {
        switch (action) {
            case 'refill_offer':
                this.log("Offered free refill. Customer is happy!", 'success');
                if (this.state.currentCustomer) {
                    this.state.currentCustomer.patience += 30;
                    this.state.currentCustomer.satisfaction += 10;
                }
                break;
            case 'music_compliment':
                this.log("Vibing with the customer. +3 Rep", 'system');
                this.state.stats.reputation += 3;
                this.audio.playSuccess();
                if (this.state.currentCustomer) {
                    this.state.currentCustomer.satisfaction += 5;
                }
                break;
            case 'photo_op':
                this.log("Posed for a photo. +5 Rep!", 'success');
                this.state.stats.reputation += 5;
                this.audio.playChime();
                break;
        }
    }

    onDialogueEnd() {
        // Tutorial or just let them play
    }

    toggleMenu() {
        // Allow settings to be accessed before game starts
        // if (!this.state.gameStarted) return; 
        const menu = document.getElementById('menu-overlay');
        const isOpening = menu.classList.contains('hidden');
        menu.classList.toggle('hidden');

        if (isOpening) {
            // Pause game when menu opens
            if (this.clockInterval) {
                clearInterval(this.clockInterval);
                this.clockInterval = null;
            }
        } else {
            // Resume game when menu closes
            this.startClock();
        }

        this.audio.playAction();
    }

    toggleDebugMenu() {
        if (!this.state.gameStarted) return;
        const debugMenu = document.getElementById('debug-menu-overlay');
        const isOpening = debugMenu.classList.contains('hidden');
        debugMenu.classList.toggle('hidden');

        if (isOpening) {
            // Update checkboxes to match current debug state
            const weatherCheckbox = document.getElementById('debug-weather-disabled');
            const customerCheckbox = document.getElementById('debug-customer-arrival-disabled');
            const timeCheckbox = document.getElementById('debug-time-paused');
            const resourcesCheckbox = document.getElementById('debug-infinite-resources');
            const timeSpeedBtn = document.getElementById('time-speed-btn');

            if (weatherCheckbox) weatherCheckbox.checked = this.state.debug.weatherDisabled;
            if (customerCheckbox) customerCheckbox.checked = this.state.debug.customerArrivalDisabled;
            if (timeCheckbox) timeCheckbox.checked = this.state.debug.timePaused;
            if (resourcesCheckbox) resourcesCheckbox.checked = this.state.debug.infiniteResources;
            if (timeSpeedBtn) timeSpeedBtn.textContent = `⏩ Time Speed: ${this.state.debug.timeSpeed || 1}x`;
        }

        this.audio.playAction();
    }

    setDebugEnabled(enabled) {
        this.state.debug.enabled = enabled;
        if (!enabled) {
            // Disable all debug options when debug mode is turned off
            this.state.debug.weatherDisabled = false;
            this.state.debug.customerArrivalDisabled = false;
            this.state.debug.timePaused = false;
            this.state.debug.infiniteResources = false;

            // Update checkboxes
            const weatherCheckbox = document.getElementById('debug-weather-disabled');
            const customerCheckbox = document.getElementById('debug-customer-arrival-disabled');
            const timeCheckbox = document.getElementById('debug-time-paused');
            const resourcesCheckbox = document.getElementById('debug-infinite-resources');

            if (weatherCheckbox) weatherCheckbox.checked = false;
            if (customerCheckbox) customerCheckbox.checked = false;
            if (timeCheckbox) timeCheckbox.checked = false;
            if (resourcesCheckbox) resourcesCheckbox.checked = false;

            // Restore weather if it was disabled
            if (this.state.weather === 'rainy') {
                this.setWeather('rainy');
            }

            // Resume time if it was paused
            if (this.clockInterval === null && !this.state.debug.timePaused) {
                this.startClock();
            }
        }
        this.saveGame();
        this.log(`Debug mode ${enabled ? 'enabled' : 'disabled'}`, 'system');
    }

    setDebugOption(option, value) {
        this.state.debug[option] = value;

        // Handle specific options
        if (option === 'timePaused') {
            if (value) {
                if (this.clockInterval) {
                    clearInterval(this.clockInterval);
                    this.clockInterval = null;
                }
                this.log("Time paused", 'system');
            } else {
                this.startClock();
                this.log("Time resumed", 'system');
            }
        } else if (option === 'weatherDisabled') {
            if (value) {
                // Force sunny weather
                this.setWeather('sunny');
                this.log("Weather effects disabled", 'system');
            } else {
                // Restore current weather
                this.setWeather(this.state.weather);
                this.log("Weather effects enabled", 'system');
            }
        } else if (option === 'customerArrivalDisabled') {
            this.log(`Customer arrivals ${value ? 'disabled' : 'enabled'}`, 'system');
        } else if (option === 'infiniteResources') {
            this.log(`Infinite resources ${value ? 'enabled' : 'disabled'}`, 'system');
        }

        this.saveGame();
    }

    debugForceWeather(type) {
        this.setWeather(type);
        this.log(`Weather forced to ${type}`, 'system');
    }

    debugSpawnCustomer() {
        if (this.state.currentCustomer) {
            this.log("Customer already present", 'error');
            return;
        }
        this.generateCustomer();
        this.log("Customer spawned", 'success');
    }

    debugAddCash(amount) {
        this.state.cash += amount;
        this.updateHUD();
        this.log(`Added $${amount}`, 'success');
        this.saveGame();
    }

    debugNextDay() {
        this.log("Skipping to next day...", 'system');
        this.endGame();
    }

    debugToggleTimeSpeed() {
        const speeds = [1, 2, 5, 10];
        const currentIndex = speeds.indexOf(this.state.debug.timeSpeed || 1);
        const nextIndex = (currentIndex + 1) % speeds.length;
        this.state.debug.timeSpeed = speeds[nextIndex];

        // Update button text
        const btn = document.getElementById('time-speed-btn');
        if (btn) {
            btn.textContent = `⏩ Time Speed: ${this.state.debug.timeSpeed}x`;
        }

        // Restart clock with new speed
        if (!this.state.debug.timePaused) {
            this.startClock();
        }

        this.log(`Time speed set to ${this.state.debug.timeSpeed}x`, 'system');
        this.saveGame();
    }

    setMusicVolume(val) {
        this.audio.setMusicVolume(val);
        if (!this.state.settings) this.state.settings = {};
        this.state.settings.musicVolume = val;
    }

    setSFXVolume(val) {
        this.audio.setSFXVolume(val);
        if (!this.state.settings) this.state.settings = {};
        this.state.settings.sfxVolume = val;
    }

    setAmbienceVolume(val) {
        this.audio.setAmbienceVolume(val);
        if (!this.state.settings) this.state.settings = {};
        this.state.settings.ambienceVolume = val;
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

    toggleShop() {
        if (!this.state.gameStarted) return;
        const shop = document.getElementById('screen-shop');
        if (!shop) return;

        if (shop.classList.contains('hidden')) {
            shop.classList.remove('hidden');
            this.renderUpgrades();
            this.audio.playAction();
        } else {
            shop.classList.add('hidden');
            this.audio.playAction();
        }
    }

    showHelp() {
        this.toggleMenu(); // Close menu
        this.dialogue.show([
            "How to Play:",
            "1. Grind beans -> Add Water -> Stir -> Plunge -> Serve.",
            "2. Talk to customers to boost patience and tips.",
            "3. Buy upgrades in the Shop to make better drinks.",
            "4. Watch your reputation to unlock new areas!"
        ]);
    }

    toggleDarkMode() {
        if (!this.state.gameStarted) return;
        if (!this.state.darkModeUnlocked) {
            this.log("🔒 Dark mode locked. Serve 3 customers to unlock!", 'error');
            this.audio.playError();
            return;
        }

        this.state.darkModeEnabled = !this.state.darkModeEnabled;

        if (this.state.darkModeEnabled) {
            document.body.classList.add('dark-mode');
            this.log("🌙 Dark mode enabled. Evening vibes activated!", 'success');
        } else {
            document.body.classList.remove('dark-mode');
            this.log("☀️ Light mode enabled. Morning brightness restored!", 'success');
        }

        this.audio.playAction();
        this.updateDarkModeToggle();
        this.saveGame();
    }

    checkDarkModeUnlock() {
        if (!this.state.darkModeUnlocked && this.state.stats.customersServed >= 3) {
            this.state.darkModeUnlocked = true;
            this.log("🌙 Dark Mode Unlocked! Check the HUD to toggle themes.", 'success');
            this.audio.playChime();
            this.updateDarkModeToggle();
            this.saveGame();
        }
    }

    updateDarkModeToggle() {
        const hud = document.getElementById('hud');
        if (!hud) return;

        // Remove existing toggle if present
        const existingToggle = document.getElementById('dark-mode-toggle');
        if (existingToggle) {
            existingToggle.remove();
        }

        // Only create toggle if unlocked
        if (this.state.darkModeUnlocked) {
            const toggle = document.createElement('div');
            toggle.id = 'dark-mode-toggle';
            toggle.className = 'hud-item';
            toggle.title = this.state.darkModeEnabled ? 'Switch to Light Mode' : 'Switch to Dark Mode';
            toggle.onclick = () => this.toggleDarkMode();
            toggle.style.cursor = 'pointer';

            const icon = document.createElement('span');
            icon.className = 'hud-icon';
            icon.textContent = this.state.darkModeEnabled ? '☀️' : '🌙';

            toggle.appendChild(icon);
            hud.appendChild(toggle);
        }
    }



    updateHUD() {
        try {
            // Time Display (12-hour format with AM/PM)
            const totalMinutes = this.state.minutesElapsed || 0; // Use minutesElapsed, default to 0
            let hours = Math.floor(totalMinutes / 60) + 5; // Add 5 for 5:00 AM start
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

            // Customer Display - Panel is always in DOM, shown on hover via CSS
            if (this.ui.customerInfoPanel) {
                if (this.state.currentCustomer) {
                    const c = this.state.currentCustomer;
                    const satisfactionEmoji = this.getSatisfactionEmoji(c.satisfaction);

                    // Panel visibility is controlled by CSS hover, just update content
                    if (this.ui.customerName) this.ui.customerName.textContent = `${c.name} (${c.personality})`;

                    if (this.ui.patienceMeter) {
                        this.ui.patienceMeter.textContent = `Patience: ${Math.round(c.patience)}%`;
                        // Color code patience
                        if (c.patience < 30) this.ui.patienceMeter.style.color = 'var(--error-color)';
                        else if (c.patience < 50) this.ui.patienceMeter.style.color = '#ffa500';
                        else this.ui.patienceMeter.style.color = 'var(--success-color)';
                    }

                    if (this.ui.satisfactionMeter) {
                        this.ui.satisfactionMeter.textContent = `Mood: ${satisfactionEmoji} (${Math.round(c.satisfaction)}%)`;
                    }

                    // Also update the old customer display if it exists (for summary screen or fallback)
                    if (this.ui.customer) {
                        this.ui.customer.innerHTML = `
                            <div>${c.name}</div>
                            <div>Order: ${c.order}</div>
                        `;
                    }
                }
            }

            // Inventory
            if (this.ui.inventory) {
                const inv = this.state.inventory;
                const suggestions = this.getShoppingSuggestions();
                const usage = this.state.resourceUsage || {};

                // Get usage stats for display
                const getUsageDisplay = (resource) => {
                    if (usage[resource]) {
                        return ` (used: ${usage[resource].used})`;
                    }
                    return '';
                };

                // Inventory Grid with enhanced information
                this.ui.inventory.innerHTML = `
                    <div class="inventory-item" id="inv-beans_standard">
                        <span class="inventory-icon">🫘</span>
                        <span class="inventory-name">Standard Beans</span>
                        <span class="inventory-amount">${inv.beans_standard}g${getUsageDisplay('beans_standard')}</span>
                    </div>
                    <div class="inventory-item" id="inv-beans_premium">
                        <span class="inventory-icon">✨</span>
                        <span class="inventory-name">Premium Beans</span>
                        <span class="inventory-amount">${inv.beans_premium}g${getUsageDisplay('beans_premium')}</span>
                    </div>
                    <div class="inventory-item" id="inv-water">
                        <span class="inventory-icon">💧</span>
                        <span class="inventory-name">Water</span>
                        <span class="inventory-amount">${inv.water}ml${getUsageDisplay('water')}</span>
                    </div>
                    <div class="inventory-item" id="inv-milk">
                        <span class="inventory-icon">🥛</span>
                        <span class="inventory-name">Milk</span>
                        <span class="inventory-amount">${inv.milk}ml${getUsageDisplay('milk')}</span>
                    </div>
                    <div class="inventory-item" id="inv-matcha_powder">
                        <span class="inventory-icon">🍵</span>
                        <span class="inventory-name">Matcha</span>
                        <span class="inventory-amount">${inv.matcha_powder}g${getUsageDisplay('matcha_powder')}</span>
                    </div>
                    <div class="inventory-item" id="inv-cups">
                        <span class="inventory-icon">🥤</span>
                        <span class="inventory-name">Cups</span>
                        <span class="inventory-amount">${inv.cups}${getUsageDisplay('cups')}</span>
                    </div>
                    <div class="inventory-item" id="inv-filters">
                        <span class="inventory-icon">📄</span>
                        <span class="inventory-name">Filters</span>
                        <span class="inventory-amount">${inv.filters}${getUsageDisplay('filters')}</span>
                    </div>
                `;

                // Shopping Suggestions
                const suggestionList = document.getElementById('suggestion-list');
                const suggestionContainer = document.getElementById('shopping-suggestions');

                if (suggestionList && suggestionContainer) {
                    if (suggestions.length > 0) {
                        suggestionContainer.classList.remove('hidden');
                        suggestionList.innerHTML = suggestions.map(s => `<li>${s.item}: ${s.reason}</li>`).join('');
                    } else {
                        suggestionContainer.classList.add('hidden');
                    }
                }
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

            // Update dark mode toggle visibility
            this.updateDarkModeToggle();
        } catch (e) {
            console.error("Error in updateHUD:", e);
        }
    }

    switchScreen(screenName, silent = false) {
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

        if (!silent) {
            this.audio.playAction(); // Click sound
        }

        if (screenName === 'shop') {
            this.renderUpgrades();
        }
    }

    getPatienceLevel(p) {
        if (p > 80) return '😊 Chill';
        if (p > 50) return '😐 Okay';
        if (p > 20) return '😠 Annoyed';
        return '🤬 Furious';
    }

    getSatisfactionEmoji(s) {
        if (s >= 80) return '😍';
        if (s >= 60) return '😊';
        if (s >= 40) return '😐';
        if (s >= 20) return '😕';
        return '😞';
    }

    formatTime(minutesElapsed) {
        const startHour = 5;
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
            // Skip time advancement if paused in debug mode
            if (this.state.debug && this.state.debug.timePaused) {
                return;
            }

            this.state.minutesElapsed += minutes;
            this.updateHUD();
            this.checkCustomerPatience(minutes);

            // Skip customer arrival if disabled in debug mode
            if (this.state.debug && this.state.debug.customerArrivalDisabled) {
                // Check for end of day
                if (this.state.minutesElapsed >= 480) { // 1:00 PM
                    this.endGame();
                }
                return;
            }

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
            if (this.state.minutesElapsed >= 480) { // 1:00 PM
                this.endGame();
            }
        } catch (e) {
            console.error("Error in advanceTime:", e);
        }
    }



    handleInput(commandStr) {
        console.log(`handleInput: ${commandStr}, gameStarted: ${this.state.gameStarted}`);
        if (!this.state.gameStarted) return; // Block input

        const cmdParts = commandStr.trim().toUpperCase().split(' ');
        const cmd = cmdParts[0];

        if (!cmd) return;


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
                this.toggleShop();
                return;
            case 'MAP':
                this.switchScreen('map');
                return;
            case 'CART':
                this.switchScreen('cart');
                return;
            case 'PARK':
                this.switchScreen('park');
                return;
            case 'SUMMARY':
                this.switchScreen('summary');
                return;
        }

        // Delegate to specific handlers based on context
        if (this.ui.screens.cart.classList.contains('active') || !this.ui.screens.cart.classList.contains('hidden')) {
            this.handleBrewCommand(cmd, cmdParts);
        } else if (this.ui.screens.shop.classList.contains('active')) {
            // Shop logic handled by BUY command mostly
        }
    }

    handleBrewCommand(cmd, args) {
        console.log(`handleBrewCommand: ${cmd}, mode: ${this.state.brewingState.mode}, step: ${this.state.brewingState.step}`);
        if (!this.state.currentCustomer) {
            this.log("Relax... wait for a guest.", 'error');
            this.audio.playError();
            return;
        }

        const step = this.state.brewingState.step;
        const mode = this.state.brewingState.mode;

        // RNG Event Check (5% chance on any action)
        if (Math.random() < 0.05) {
            this.triggerRandomEvent();
        }

        // Espresso Workflow
        if (mode === 'espresso') {
            switch (cmd) {
                case 'SWITCH_MODE':
                    this.openModeMenu();
                    break;
                case 'GRIND':
                    if (!this.consumeResource('beans_premium', 18)) {
                        this.log("Need Premium Beans!", 'error');
                        return;
                    }
                    this.state.brewingState.step = 1;
                    this.log("Ground 18g for Espresso.", 'success');
                    this.audio.playAction();
                    break;
                case 'TAMP':
                    if (step < 1) {
                        this.log("Grind beans first!", 'error');
                        return;
                    }
                    this.state.brewingState.step = 2;
                    this.log("Tamped the grounds firmly.", 'success');
                    this.audio.playAction();
                    break;
                case 'PULL_SHOT':
                    if (step < 2) {
                        this.log("Tamp grounds first!", 'error');
                        return;
                    }
                    if (!this.consumeResource('water', 50)) {
                        this.log("Need water!", 'error');
                        return;
                    }
                    this.state.brewingState.step = 3;
                    this.log("Pulled a rich shot.", 'success');
                    this.audio.playAction();
                    break;
                case 'STEAM_MILK':
                    if (step < 3) {
                        this.log("Pull shot first!", 'error');
                        return;
                    }
                    if (!this.consumeResource('milk', 100)) {
                        this.log("Need milk!", 'error');
                        return;
                    }
                    this.state.brewingState.step = 4;
                    this.log("Steamed silky milk.", 'success');
                    this.audio.playAction(); // Hiss sound ideally
                    break;
                case 'POUR':
                    if (step < 4) {
                        this.log("Steam milk first!", 'error');
                        return;
                    }
                    this.state.brewingState.step = 5;
                    this.log("Poured latte art.", 'success');
                    this.audio.playAction();
                    break;
                case 'SERVE':
                    if (step !== 5) {
                        this.log("Not ready yet! Finish brewing first.", 'error');
                        this.audio.playError();
                        return;
                    }
                    if (!this.consumeResource('cups', 1)) {
                        this.log("Out of cups!", 'error');
                        return;
                    }
                    this.trackResourceUsage('cups', 1);
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
                case 'SWITCH_MODE':
                    this.openModeMenu();
                    break;
                case 'SIFT':
                    if (!this.consumeResource('matcha_powder', 5)) {
                        this.log("Need Matcha Powder!", 'error');
                        return;
                    }
                    this.trackResourceUsage('matcha_powder', 5);
                    this.state.brewingState.step = 1;
                    this.log("Sifted the matcha powder.", 'success');
                    this.audio.playAction();
                    break;
                case 'ADD_WATER':
                    if (step < 1) {
                        this.log("Sift matcha first!", 'error');
                        return;
                    }
                    if (!this.consumeResource('water', 100)) {
                        this.log("Need water!", 'error');
                        return;
                    }
                    this.trackResourceUsage('water', 100);
                    this.state.brewingState.step = 2;
                    this.log("Added hot water.", 'success');
                    this.audio.playAction();
                    break;
                case 'WHISK':
                    if (step < 2) {
                        this.log("Add water first!", 'error');
                        return;
                    }
                    this.state.brewingState.step = 3;
                    this.log("Whisked to perfection!", 'success');
                    this.audio.playChime();
                    break;
                case 'SERVE':
                    if (step !== 3) {
                        this.log("Not ready yet! Whisk it properly.", 'error');
                        this.audio.playError();
                        return;
                    }
                    if (!this.consumeResource('cups', 1)) {
                        this.log("Out of cups!", 'error');
                        return;
                    }
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
            case 'SWITCH_MODE':
                this.openModeMenu();
                break;
            case 'GRIND':
            case 'GRIND_BEANS':
                // Removed strict step check
                if (!this.consumeResource('beans_standard', 20)) {
                    this.log("Out of beans!", 'error');
                    return;
                }
                this.state.brewingState.step = 1;
                this.log("Beans ground.", 'system');
                this.audio.playGrind();
                break;

            case 'ADD_WATER':
                if (step < 1) {
                    this.log("Grind beans first!", 'error');
                    this.audio.playError();
                    return;
                }
                if (!this.consumeResource('water', 250)) {
                    this.log("Out of water!", 'error');
                    return;
                }
                this.state.brewingState.step = 2;
                this.log("Water added.", 'system');
                this.audio.playPour();
                break;

            case 'STIR':
                if (step < 2) {
                    this.log("Add water first!", 'error');
                    this.audio.playError();
                    return;
                }
                this.state.brewingState.step = 3;
                this.log("Stirred the grounds.", 'system');
                this.audio.playAction();
                break;

            case 'PLUNGE':
                if (step < 3) {
                    this.log("Stir first!", 'error');
                    this.audio.playError();
                    return;
                }
                if (!this.consumeResource('filters', 1)) {
                    this.log("Out of filters!", 'error');
                    return;
                }
                this.state.brewingState.step = 4;
                this.log("Plunged! Coffee is ready.", 'success');
                this.audio.playAction();
                break;

            case 'SERVE':
                if (step !== 4) {
                    this.log("Not ready yet! Finish the brew.", 'error');
                    this.audio.playError();
                    return;
                }
                if (!this.consumeResource('cups', 1)) {
                    this.log("Out of cups!", 'error');
                    return;
                }
                this.serveCustomer();
                break;

            case 'TRASH':
                this.state.brewingState.step = 0;
                this.log("Tossed the brew.", 'neutral');
                this.audio.playTrash();
                break;
        }
        this.updateBrewingVisuals();
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
        this.state.stats.cumulativeEarnings += total; // Track total earnings across all days

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

        // Check for dark mode unlock
        this.checkDarkModeUnlock();

        // Reset
        this.state.currentCustomer = null;
        this.state.brewingState.step = 0;
        this.state.brewingState.beanType = null;
        this.updateBrewingVisuals();

        // Hide portrait
        this.ui.customerPortrait.style.opacity = '0';
    }

    updateBrewingVisuals() {
        const { mode, step } = this.state.brewingState;

        // 1. Station Visibility
        if (this.ui.brewingStation) this.ui.brewingStation.classList.add('hidden');
        if (this.ui.matchaStation) this.ui.matchaStation.classList.add('hidden');
        if (this.ui.espressoStation) this.ui.espressoStation.classList.add('hidden');

        let activeStation;
        if (mode === 'coffee') activeStation = this.ui.brewingStation;
        else if (mode === 'matcha') activeStation = this.ui.matchaStation;
        else if (mode === 'espresso') activeStation = this.ui.espressoStation;

        if (activeStation) activeStation.classList.remove('hidden');

        // 2. Controls Visibility
        const coffeeControls = document.getElementById('coffee-controls');
        const matchaControls = document.getElementById('matcha-controls');
        const espressoControls = document.getElementById('espresso-controls');

        if (coffeeControls) coffeeControls.classList.add('hidden');
        if (matchaControls) matchaControls.classList.add('hidden');
        if (espressoControls) espressoControls.classList.add('hidden');

        if (mode === 'coffee' && coffeeControls) coffeeControls.classList.remove('hidden');
        if (mode === 'matcha' && matchaControls) matchaControls.classList.remove('hidden');
        if (mode === 'espresso' && espressoControls) espressoControls.classList.remove('hidden');

        // 3. Serve Buttons
        const btnServeCoffee = document.getElementById('btn-serve-coffee');
        const btnServeMatcha = document.getElementById('btn-serve-matcha');
        const btnServeEspresso = document.getElementById('btn-serve-espresso');

        const setServeButtonState = (btn, enabled) => {
            if (!btn) return;
            btn.classList.remove('hidden');
            if (enabled) btn.classList.remove('disabled');
            else btn.classList.add('disabled');
        };

        setServeButtonState(btnServeCoffee, mode === 'coffee' && step === 4);
        setServeButtonState(btnServeMatcha, mode === 'matcha' && step === 3);
        setServeButtonState(btnServeEspresso, mode === 'espresso' && step === 5);

        // 4. Animations & Classes
        // Reset animations
        document.querySelectorAll('.pouring, .grinding, .whisking, .filling').forEach(el => {
            el.classList.remove('pouring', 'grinding', 'whisking', 'filling');
        });

        // Reset hidden states for items
        if (activeStation) {
            activeStation.querySelectorAll('div').forEach(el => {
                if (!el.classList.contains('contents') && !el.classList.contains('chamber') && !el.classList.contains('plunger') && !el.classList.contains('bowl') && !el.classList.contains('espresso-machine')) {
                    el.classList.remove('hidden');
                }
            });
        }

        if (mode === 'coffee') {
            // Aeropress
            if (step === 1) { // Grind
                const grinder = activeStation.querySelector('.hand-grinder');
                if (grinder) grinder.classList.add('grinding');
            }
            if (step === 2) { // Add Water
                const kettle = activeStation.querySelector('.kettle');
                if (kettle) kettle.classList.add('pouring');
            }
        } else if (mode === 'matcha') {
            if (step === 1) { // Sift
                const powder = activeStation.querySelector('.tea-powder');
                if (powder) powder.classList.add('grinding');
            }
            if (step === 2) { // Add Water
                const kettle = activeStation.querySelector('.kettle');
                if (kettle) kettle.classList.add('pouring');
            }
            if (step === 3) { // Whisk
                const whisk = activeStation.querySelector('.whisk');
                if (whisk) whisk.classList.add('whisking');
            }
        } else if (mode === 'espresso') {
            if (step === 1) { // Grind
                const grinder = activeStation.querySelector('.electric-grinder');
                if (grinder) grinder.classList.add('grinding');
            }
            if (step === 3) { // Pull Shot
                const cup = activeStation.querySelector('.cup');
                if (cup) cup.classList.add('filling');
            }
        }
    }
    handleBuyCommand(args) {
        // Format: BUY [ITEM] [QUANTITY]
        if (args.length < 3) return;

        const itemMap = {
            'BEANS_STD': { key: 'beans_standard', cost: 0.05, name: 'Std Beans' }, // $0.05 per gram
            'BEANS_PRM': { key: 'beans_premium', cost: 0.10, name: 'Prm Beans' }, // $0.10 per gram
            'MILK': { key: 'milk', cost: 0.02, name: 'Milk' }, // $0.02 per ml
            'MILK_OAT': { key: 'milk_oat', cost: 0.06, name: 'Oat-Milk' }, // $0.02 per ml
            'WATER': { key: 'water', cost: 0.004, name: 'Water' }, // $2 for 500ml
            'MATCHA_STD': { key: 'matcha_powder', cost: 0.20, name: 'Matcha Powder' }, // $0.20 per gram,
            'MATCHA_PRM': { key: 'matcha_powder', cost: 0.35, name: 'Matcha Powder' }, // $0.35 per gram
            'CUPS': { key: 'cups', cost: 1.50, name: 'Paper Cups' }, // $1.50 per cup
            'FILTERS': { key: 'filters', cost: 0.05, name: 'Paper Filters' }, // $0.05 per filter
            'PLANT': { key: 'plant', cost: 20.00, name: 'Potted Plant', type: 'decoration' }
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

        // Show summary screen
        this.ui.summary.earnings.textContent = `$${this.state.stats.dailyEarnings.toFixed(2)}`;
        this.ui.summary.customers.textContent = this.state.stats.customersServed;
        this.ui.summary.tips.textContent = `$${this.state.stats.tipsEarned.toFixed(2)}`;

        this.switchScreen('summary', true); // Silent switch to avoid "beep"
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
        // Check if weather is disabled in debug mode
        if (this.state.debug && this.state.debug.weatherDisabled) {
            type = 'sunny'; // Force sunny if weather is disabled
        }

        this.state.weather = type;
        if (this.ui.weatherOverlay) {
            if (type === 'rainy') {
                this.ui.weatherOverlay.className = 'weather-overlay weather-rain';
                this.ui.weatherOverlay.style.opacity = '1';
                if (!this.state.debug || !this.state.debug.weatherDisabled) {
                    this.log("It's a rainy day... Fewer customers, but cozy vibes.", 'system');
                    this.log("Customers seem less patient in the rain.", 'system');
                }
            } else if (type === 'sunny') {
                this.ui.weatherOverlay.className = 'weather-overlay';
                this.ui.weatherOverlay.style.opacity = '0';
                if (!this.state.debug || !this.state.debug.weatherDisabled) {
                    this.log("It's a sunny day! Perfect weather for coffee.", 'system');
                    this.log("Customers are in a great mood today!", 'success');
                }
            }
        }
        // Update weather icon
        if (this.ui.weatherIcon) {
            if (type === 'rainy') {
                this.ui.weatherIcon.src = 'assets/weather_rainy.png';
                this.ui.weatherIcon.classList.remove('sunny');
                this.ui.weatherIcon.classList.add('rainy');
            } else if (type === 'sunny') {
                this.ui.weatherIcon.src = 'assets/weather_sunny.png';
                this.ui.weatherIcon.classList.remove('rainy');
                this.ui.weatherIcon.classList.add('sunny');
            }
        }
    }
    startNewDay() {
        this.state.day = (this.state.day || 1) + 1;
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
        this.log(`Day ${this.state.day} started!`, 'system');
        // Random Weather
        const weather = Math.random() > 0.7 ? 'rainy' : 'sunny';
        this.setWeather(weather);

        this.switchScreen('cart');
        this.saveGame();
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

            // Avatar Logic
            let avatarIndex = 0; // Default
            if (specialType === 'student') avatarIndex = 1;
            else if (specialType === 'hipster') avatarIndex = 2;
            else if (specialType === 'tourist') avatarIndex = 3;
            else if (specialType === 'regular') avatarIndex = 4;
            else if (specialType === 'critic') avatarIndex = 5;

            // Weather affects customer patience
            if (this.state.weather === 'rainy') {
                patience = Math.floor(patience * 0.8); // Rainy: customers are 20% less patient
            } else if (this.state.weather === 'sunny') {
                patience = Math.floor(patience * 1.2); // Sunny: customers are 20% more patient
            }

            let order = 'Coffee';
            // Order Logic
            // STRICT CHECK: Only allow Matcha if unlocked
            if (this.state.upgrades.includes('mode_matcha') && (specialType === 'hipster' || Math.random() < 0.3)) {
                order = 'Matcha Latte';
            } else if (this.state.upgrades.includes('mode_espresso') && Math.random() < 0.3) {
                order = 'Espresso'; // Simplification, could be Latte/Cappuccino
            }

            this.state.currentCustomer = {
                name: name,
                type: specialType || 'default',
                personality: specialType ? specialType.charAt(0).toUpperCase() + specialType.slice(1) : 'Normal',
                order: order,
                patience: patience,
                maxPatience: patience,
                decay: isPark ? 0.8 : 0.5,
                avatarIndex: avatarIndex,
                specialType: specialType,
                arrivalTime: this.state.minutesElapsed,
                satisfaction: 50, // Start at neutral (0-100 scale)
                conversationCount: 0
            };

            this.audio.playChime();

            // Log customer arrival
            const personalityText = specialType ? ` (${specialType.charAt(0).toUpperCase() + specialType.slice(1)})` : '';
            this.log(`☕ ${name}${personalityText} arrived and ordered ${order}`, 'success');

            // Update both portraits (Cart and Park)
            // Remove old sprite classes
            this.ui.customerPortrait.className = 'avatar customer';
            this.ui.customerPortrait.classList.add(`customer-${avatarIndex}`);

            this.ui.customerPortrait.setAttribute('data-mood', this.state.currentCustomer.getStatusText());
            this.ui.customerPortrait.style.opacity = '1';

            // Add touch support for mobile to show customer info
            this.setupCustomerPortraitTouch();

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
                parkPortrait.className = 'avatar customer';
                parkPortrait.classList.add(`customer-${avatarIndex}`);
                parkPortrait.style.opacity = '1';
            }

            // Trigger animation
            this.ui.customerPortrait.classList.remove('customer-arrive');
            void this.ui.customerPortrait.offsetWidth;
            this.ui.customerPortrait.classList.add('customer-arrive');

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
                this.log(`${customer.name} left in anger! -5 Rep`, 'error');
                this.state.stats.reputation = Math.max(0, this.state.stats.reputation - 5);
                this.audio.playError();

                this.state.currentCustomer = null;
                this.ui.customerPortrait.style.opacity = '0';
                this.updateHUD();
            }
        } catch (e) {
            console.error("Error in checkCustomerPatience:", e);
        }
    }
    trackResourceUsage(resource, amount) {
        if (!this.state.resourceUsage) {
            this.state.resourceUsage = {
                coffee_beans: { used: 0, lastRestockDay: 1 },
                milk: { used: 0, lastRestockDay: 1 },
                sugar: { used: 0, lastRestockDay: 1 },
                cups: { used: 0, lastRestockDay: 1 }
            };
        }
        if (!this.state.resourceUsage[resource]) {
            this.state.resourceUsage[resource] = { used: 0, lastRestockDay: this.state.day };
        }
        this.state.resourceUsage[resource].used += amount;
        this.checkLowStock();
    }

    checkLowStock() {
        // Enhanced thresholds with multiple warning levels
        const criticalThresholds = {
            beans_standard: 30,
            beans_premium: 20,
            water: 150,
            milk: 20,
            matcha_powder: 10,
            cups: 15,
            filters: 15
        };

        const warningThresholds = {
            beans_standard: 80,
            beans_premium: 50,
            water: 300,
            milk: 60,
            matcha_powder: 30,
            cups: 40,
            filters: 30
        };

        const outOfStockResources = [];
        const criticalResources = [];

        for (const [resource, amount] of Object.entries(this.state.inventory)) {
            const el = document.getElementById(`inv-${resource}`);
            if (!el) continue;

            // Remove all old status classes
            el.classList.remove('resource-low', 'resource-critical', 'resource-warning');

            // Skip checks for locked items
            if (resource === 'matcha_powder' && !this.state.upgrades.includes('matcha_kit')) continue;
            if (resource === 'beans_premium' && !this.state.upgrades.includes('espresso_kit')) continue;

            if (amount === 0) {
                el.classList.add('resource-critical');
                outOfStockResources.push(resource);
            } else if (criticalThresholds[resource] && amount <= criticalThresholds[resource]) {
                el.classList.add('resource-critical');
                criticalResources.push(resource);
            } else if (warningThresholds[resource] && amount <= warningThresholds[resource]) {
                el.classList.add('resource-warning');
            } else {
                el.classList.remove('resource-critical', 'resource-warning');
            }
        }

        // Log warnings for critical issues (not too spammy)
        if (outOfStockResources.length > 0 && !this.state.lastStockWarning) {
            const names = outOfStockResources.map(r => r.replace(/_/g, ' ')).join(', ');
            this.log(`⚠️ OUT OF STOCK: ${names}!`, 'error');
            this.state.lastStockWarning = { resources: outOfStockResources, time: Date.now() };
        }
    }

    getShoppingSuggestions() {
        const suggestions = [];
        const inventory = this.state.inventory;

        // Enhanced logic based on resource criticality and usage patterns
        const criticalThresholds = {
            beans_standard: 40,
            beans_premium: 30,
            water: 200,
            milk: 30,
            matcha_powder: 15,
            cups: 25,
            filters: 20
        };

        const warningThresholds = {
            beans_standard: 100,
            beans_premium: 60,
            water: 400,
            milk: 80,
            matcha_powder: 40,
            cups: 60,
            filters: 40
        };

        // Check for critical levels first (high priority)
        for (const [resource, criticalLevel] of Object.entries(criticalThresholds)) {
            if (inventory[resource] <= criticalLevel) {
                const name = resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                suggestions.push({
                    item: name,
                    reason: '🔴 CRITICAL - Buy Now!',
                    priority: 'critical'
                });
            }
        }

        // Check for warning levels (medium priority)
        if (suggestions.length < 3) {
            for (const [resource, warningLevel] of Object.entries(warningThresholds)) {
                if (inventory[resource] <= warningLevel && inventory[resource] > criticalThresholds[resource]) {
                    const name = resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    suggestions.push({
                        item: name,
                        reason: '🟡 Low Stock',
                        priority: 'warning'
                    });
                }
            }
        }

        // Sort by priority
        suggestions.sort((a, b) => {
            const priorityOrder = { critical: 0, warning: 1 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        return suggestions;
    }
}
