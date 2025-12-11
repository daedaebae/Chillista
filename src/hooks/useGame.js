import { useState, useEffect, useCallback, useRef } from 'react';
import { useAudio } from './useAudio.js';
import { useTime } from './useTime.js';
import { useInventory } from './useInventory.js';
import { useCustomers } from './useCustomers.js';
import { useBrewing } from './useBrewing.js';
import { useDialogue } from './useDialogue.js';

export const useGame = () => {
    // Load save synchronously for initial state to prevent flash
    const savedString = localStorage.getItem('baristaSimSave');
    const savedGame = savedString ? JSON.parse(savedString) : null;

    // UI State
    const [uiState, setUiState] = useState({
        activeModal: savedGame ? null : 'intro', // Skip intro if save exists
        activeScreen: 'cart',
        notifications: [],
        showDebug: false
    });

    const [settings, setSettings] = useState(savedGame ? savedGame.settings : {
        musicEnabled: true,
        musicVolume: 50,
        sfxVolume: 50,
        ambienceVolume: 40,
        uiScale: 100,
        muteAll: false,
        difficulty: 'cozy'
    });

    const [gameMeta, setGameMeta] = useState({
        gameStarted: savedGame ? savedGame.gameStarted : false,
        playerName: savedGame ? savedGame.playerName : 'Barista',
        weather: savedGame ? savedGame.weather : 'sunny',
        unlockedLocations: savedGame ? savedGame.unlockedLocations : ['cart'],
        darkModeUnlocked: savedGame ? savedGame.darkModeUnlocked : false,
        darkModeEnabled: savedGame ? savedGame.darkModeEnabled : false,
        logs: savedGame ? (savedGame.logs || []) : [],
        debug: {
            enabled: false,
            weatherDisabled: false,
            customerArrivalDisabled: false,
            timePaused: false,
            infiniteResources: false,
            timeSpeed: 1
        }
    });

    // --- SUB-HOOKS ---
    const audio = useAudio(savedGame?.settings);
    const time = useTime();
    const inventory = useInventory();
    const customers = useCustomers();
    const brewing = useBrewing();
    const dialogue = useDialogue(audio);

    // --- HELPERS ---
    const addLog = useCallback((message, type = 'neutral') => {
        console.log(`[${type}] ${message}`);
        setGameMeta(prev => ({
            ...prev,
            logs: [...prev.logs, {
                id: Date.now() + Math.random(),
                message,
                type,
                timestamp: Date.now()
            }].slice(-50)
        }));
    }, []);

    // --- ACTIONS ---

    // SAVE SYSTEM (Hoisted for dependency)
    const saveGame = useCallback((silent = false) => {
        const fullState = {
            ...gameMeta,
            time: time.timeState.time,
            day: time.timeState.day,
            minutesElapsed: time.timeState.minutesElapsed,
            gameStarted: time.timeState.gameStarted,

            cash: inventory.inventoryState.cash,
            inventory: inventory.inventoryState.inventory,
            decorations: inventory.inventoryState.decorations,
            upgrades: inventory.inventoryState.upgrades,
            purchaseHistory: inventory.inventoryState.purchaseHistory,

            currentCustomer: customers.customerState.currentCustomer,
            stats: customers.customerState.stats,
            marketTrends: customers.customerState.marketTrends,
            weather: customers.customerState.weather,

            brewingState: brewing.brewingState,

            settings: audio.settings // Includes volumes
        };

        localStorage.setItem('baristaSimSave', JSON.stringify(fullState));
        if (!silent) {
            addLog("Game Saved!", 'success');
            audio.playSound('success');
        }
    }, [gameMeta, time.timeState, inventory.inventoryState, customers.customerState, brewing.brewingState, audio.settings, addLog, audio.playSound]);



    const toggleMuteAll = useCallback((muted) => {
        setSettings(prev => ({ ...prev, muteAll: muted }));
    }, []);

    const setDifficulty = useCallback((difficulty) => {
        setSettings(prev => ({ ...prev, difficulty }));
    }, []);
    const startGame = useCallback((playerName) => {
        try {
            setGameMeta(prev => ({
                ...prev,
                gameStarted: true,
                playerName: playerName || prev.playerName || 'Barista'
            }));
            time.setGameStarted(true);
            setUiState(prev => ({ ...prev, activeModal: null }));

            // Start Audio
            if (settings && settings.musicEnabled) {
                if (audio.context && audio.context.state === 'suspended') {
                    audio.context.resume().catch(e => console.error("Audio resume failed", e));
                }
                audio.playMusic();
                audio.playAmbience(`${import.meta.env.BASE_URL}assets/ambience/ambience_shop.mp3`);
            } else {
                audio.stopMusic();
                audio.stopAmbience();
            }

            // Initial Save to lock in "Game Started" state
            setTimeout(() => saveGame(true), 100);

        } catch (e) {
            console.error("startGame error:", e);
        }
    }, [audio, time, settings, saveGame]);

    const toggleModal = useCallback((modalName) => {
        if (!audio.settings.muteAll) audio.playSound('action');
        setUiState(prev => ({
            ...prev,
            activeModal: prev.activeModal === modalName ? null : modalName
        }));
    }, [audio.settings.muteAll, audio.playSound]);

    const advanceTimeWrapper = useCallback((minutes) => {
        if (gameMeta.debug.timePaused) return;

        time.advanceTime(minutes).then(newTimeState => {
            // 1. Check Patience
            customers.updatePatience(minutes, inventory.inventoryState.decorations.includes('plant'));

            // 2. Customer Arrival
            if (!gameMeta.debug.customerArrivalDisabled) {
                const newCust = customers.generateCustomer(
                    newTimeState.minutesElapsed,
                    inventory.inventoryState.upgrades,
                    !!customers.customerState.currentCustomer, // disable if full
                    settings.difficulty || 'cozy'
                );
                if (newCust && newCust.name) { // verify valid customer obj returned
                    addLog(`☕ ${newCust.name} arrived! Ordered: ${newCust.order}`, 'success');
                    if (!audio.settings.muteAll) audio.playSound('chime');


                }
            }

            // 3. End of Day Check
            if (newTimeState.minutesElapsed >= 480 && uiState.activeModal !== 'summary') {
                setUiState(prev => ({ ...prev, activeModal: 'summary' }));
                if (!audio.settings.muteAll) audio.playSound('success');
            }
        });
    }, [gameMeta.debug, time, customers, inventory.inventoryState, addLog, audio.settings.muteAll, audio.playSound, uiState.activeModal]);

    // Handle Customer Events (e.g. Leaving)
    useEffect(() => {
        if (customers.customerState.lastEvent === 'patience_zero') {
            addLog("😞 Customer left in frustration! (-5 Reputation)", 'error');
            if (!audio.settings.muteAll) audio.playSound('error');
            customers.clearEvent();
        }
    }, [customers.customerState.lastEvent, addLog, audio.playSound, audio.settings.muteAll, customers]); // checking customers dependency stability

    const handleBrewAction = useCallback((action) => {
        const { mode, step } = brewing.brewingState;

        if (mode === 'coffee') {
            if (action === 'BOIL' && step === 0) {
                brewing.setBoiling(true);
                addLog("Heating water...", 'neutral');
                audio.playSteam();

                setTimeout(() => {
                    brewing.setBoiling(false);
                    brewing.advanceStep();
                    addLog("Water hot!", 'success');
                    // audio.playSound('boil_finish'); // Optional: distinct sound
                }, 3000);
            } else if (action === 'GRIND' && step === 1) {
                if (inventory.deductResources({ 'beans_standard': 20 })) {
                    brewing.advanceStep();
                    addLog("Beans ground.", 'success');
                    audio.playSound('grind');
                } else {
                    addLog("Not enough beans!", 'error');
                    audio.playSound('error');
                }
            } else if (action === 'ADD_WATER' && step === 2) {
                if (inventory.deductResources({ 'water': 250 })) {
                    brewing.advanceStep();
                    addLog("Hot water added.", 'success');
                    audio.playSound('pour');
                } else {
                    addLog("Not enough water!", 'error');
                    audio.playSound('error');
                }
            } else if (action === 'STIR') {
                if (step === 3) {
                    brewing.advanceStep();
                    addLog("Stirred.", 'success');
                    audio.playSound('action');
                } else if (step < 3) {
                    addLog("You practice dry stirring...you feel more confident!", 'neutral');
                    audio.playSound('action');
                }
            } else if (action === 'PLUNGE') {
                if (step === 4) {
                    if (inventory.deductResources({ 'filters': 1 })) {
                        brewing.advanceStep();
                        addLog("Plunged!", 'success');
                        audio.playSound('action'); // Maybe steam sound here too?
                    } else {
                        addLog("Not enough filters!", 'error');
                        audio.playSound('error');
                    }
                } else if (step < 4) {
                    addLog("You practice plunging...resistance is futile without liquid!", 'neutral');
                    audio.playSound('action');
                }
            }
        } else if (mode === 'matcha') {
            if (action === 'SIFT' && step === 0) {
                if (inventory.deductResources({ 'matcha_powder': 10 })) {
                    brewing.advanceStep();
                    addLog("Matcha sifted.", 'success');
                    audio.playSound('action');
                } else {
                    addLog("Not enough matcha powder!", 'error');
                    audio.playSound('error');
                }
            } else if (action === 'ADD_WATER' && step === 1) {
                if (inventory.deductResources({ 'water': 100 })) {
                    brewing.advanceStep();
                    addLog("Hot water added.", 'success');
                    audio.playSound('pour');
                } else {
                    addLog("Not enough water!", 'error');
                    audio.playSound('error');
                }
            } else if (action === 'WHISK' && step === 2) {
                brewing.advanceStep();
                addLog("Whisked to froth.", 'success');
                audio.playSound('action');
            }
        } else if (mode === 'espresso') {
            if (action === 'GRIND' && step === 0) {
                if (inventory.deductResources({ 'beans_premium': 18 })) {
                    brewing.advanceStep();
                    addLog("Espresso beans ground.", 'success');
                    audio.playSound('grind');
                } else {
                    addLog("Not enough premium beans!", 'error');
                    audio.playSound('error');
                }
            } else if (action === 'TAMP' && step === 1) {
                brewing.advanceStep();
                addLog("Puck tamped.", 'success');
                audio.playSound('action');
            } else if (action === 'PULL_SHOT' && step === 2) {
                if (inventory.deductResources({ 'water': 50 })) {
                    brewing.advanceStep();
                    addLog("Shot pulled.", 'success');
                    audio.playSound('pour');
                } else {
                    addLog("Not enough water!", 'error');
                    audio.playSound('error');
                }
            } else if (action === 'STEAM_MILK' && step === 3) {
                if (inventory.deductResources({ 'milk': 150 })) {
                    brewing.advanceStep();
                    addLog("Milk steamed.", 'success');
                    audio.playSound('steam');
                } else {
                    addLog("Not enough milk!", 'error');
                    audio.playSound('error');
                }
            } else if (action === 'POUR' && step === 4) {
                brewing.advanceStep();
                addLog("Latte art poured.", 'success');
                audio.playSound('pour');
            }
        }

    }, [brewing, inventory, addLog, audio]);

    const performServe = useCallback(() => {
        const { mode, step } = brewing.brewingState;
        const ready = (mode === 'coffee' && step === 5) || (mode === 'matcha' && step === 3) || (mode === 'espresso' && step === 5); // Updated Coffee step

        if (!ready) {
            addLog("Drink not ready!", 'error');
            audio.playSound('error');
            return;
        }
        if (inventory.inventoryState.inventory.cups < 1) {
            addLog("Out of cups!", 'error');
            audio.playSound('error');
            return;
        }
        if (!customers.customerState.currentCustomer) {
            addLog("No customer to serve!", 'error');
            audio.playSound('error');
            return;
        }

        // Logic
        const customer = customers.customerState.currentCustomer;
        let quality = 1.0;
        if (mode === 'coffee') {
            if (customer.order === 'Matcha Latte') quality = 0.1;
            else if (brewing.brewingState.beanType === 'PRM') quality = 1.5;
        } else if (mode === 'matcha') {
            if (customer.order !== 'Matcha Latte') quality = 0.5;
            else quality = 2.0;
        }

        const patienceBonus = customer.patience > 20 ? 1.2 : 1.0;
        const basePrice = 4.00;
        const tip = (customer.patience / 10) * 0.5;
        const total = (basePrice * quality * patienceBonus) + tip;

        let repChange = 0;
        if (quality >= 1.0 && patienceBonus > 1.0) repChange = 1;
        else if (quality < 0.5) repChange = -1;

        // Effects
        inventory.addCash(total);
        inventory.deductResources({ 'cups': 1 }); // We checked before, so this should pass.
        customers.updateStats(total, tip, repChange, customer.name);
        customers.clearCustomer();
        brewing.resetBrewing();

        addLog(`Served ${customer.name}! +$${total.toFixed(2)}`, 'success');
        audio.playSound('success');
        saveGame(true); // Auto-save on serve

    }, [brewing, inventory, customers, addLog, audio, saveGame]);

    // Shop Wrapper
    const handleBuyWrapper = useCallback((itemKey, amount) => {
        const result = inventory.handleBuy(itemKey, amount);
        if (result.success) {
            const label = result.item.type === 'decoration' ? `a ${result.item.name}` : `${amount} ${result.item.name}`;
            addLog(`Bought ${label}!`, 'success');
            audio.playSound('success');
        } else {
            if (result.reason === 'already_owned') addLog("Already own this!", 'neutral');
            else if (result.reason === 'insufficient_funds') addLog("Not enough cash!", 'error');
            audio.playSound('error');
        }
        if (result.success) saveGame(true); // Auto-save on purchase
    }, [inventory, addLog, audio, saveGame]);

    // Upgrade Wrapper
    const buyUpgradeWrapper = useCallback((upgradeId) => {
        const result = inventory.buyUpgrade(upgradeId, customers.customerState.stats.reputation);
        if (result.success) {
            addLog(`Purchased ${result.upgrade.name}!`, 'success');
            audio.playSound('success');
        } else {
            addLog("Cannot purchase upgrade (Cost/Rep too low)", 'error');
            audio.playSound('error');
        }
        if (result.success) saveGame(true); // Auto-save
    }, [inventory, customers, addLog, audio, saveGame]);

    // Dialogue Choice Handler
    const handleDialogueChoice = useCallback((choice) => {
        // Apply Effects
        const { effect, response } = choice;

        if (effect) {
            if (effect.type === 'reputation') {
                customers.updateStats(0, 0, effect.value, customers.customerState.currentCustomer?.name);
                addLog(`Reputation ${effect.value > 0 ? '+' : ''}${effect.value}`, effect.value > 0 ? 'success' : 'error');
            } else if (effect.type === 'patience') {
                // We don't have direct 'addPatience' method exposed in useCustomers yet, assuming updatePatience can handle negative (add)?
                // actually updatePatience subtracts. So negative minutes adds patience?
                // Let's just manually hack it via a new method or assume simplified for now.
                // For v1.2, let's skip complex patience mod or add it if easy.
                // We'll log it.
            } else if (effect.type === 'tips') {
                inventory.addCash(effect.value);
                addLog(`Got a tip: $${effect.value}`, 'success');
            }

            // Satisfaction
            if (effect.satisfaction && customers.customerState.currentCustomer) {
                // Need method to update satisfaction.
                // We'll trust it works or add it later. For now, log response.
            }
        }

        // Show Response
        dialogue.showDialogue(response, customers.customerState.currentCustomer?.name || 'Customer');

    }, [customers, inventory, addLog, dialogue]);


    // Global Actions
    // Global Actions
    const setUIScale = useCallback((val) => {
        // audio.settings.uiScale = val; // DO NOT mutate.
        // We track UI scale in gameMeta or just apply it.
        // For now, applying to DOM is enough as we don't persist it in audio settings state within this hook purely.
        // If we want to persist, we should update gameMeta settings or call a setter if exposed.
        // Since we don't have a setter for settings exposed from audio hook, we'll just rely on the side effect.
        document.documentElement.style.fontSize = `${val}%`;
    }, []);

    // START NEW DAY
    const startNewDayWrapper = useCallback(() => {
        time.startNewDay();
        customers.resetDailyStats();
        // Clear logs or add new day log
        addLog(`Day ${time.timeState.day + 1} Started!`, 'system'); // Day state hasn't updated yet in this tick?
        // time.timeState.day is the old day.

        setUiState(prev => ({ ...prev, activeModal: null }));
        audio.playSound('success');
    }, [time, customers, addLog, audio]);




    // Destructure stable sync functions to avoid circular dependencies in loadGame
    const { syncTimeState } = time;
    const { syncInventoryState } = inventory;
    const { syncCustomerState } = customers;
    const { syncBrewingState } = brewing;
    const { syncAudioSettings } = audio;

    const loadGame = useCallback(() => {
        const saved = localStorage.getItem('baristaSimSave');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);

                // Distribute data to hooks
                setGameMeta(prev => ({
                    ...prev,
                    gameStarted: parsed.gameStarted,
                    playerName: parsed.playerName,
                    weather: parsed.weather,
                    unlockedLocations: parsed.unlockedLocations,
                    darkModeUnlocked: parsed.darkModeUnlocked,
                    darkModeEnabled: parsed.darkModeEnabled,
                    logs: parsed.logs || []
                }));

                syncTimeState(parsed);
                syncInventoryState(parsed);
                syncCustomerState(parsed);
                syncBrewingState(parsed.brewingState);
                syncAudioSettings(parsed.settings);

                addLog("Game Loaded!", 'success');


                // Clear any blocking modals
                setUiState(prev => ({ ...prev, activeModal: null }));
                return true;
            } catch (e) {
                console.error("Failed to load save", e);
                addLog("Failed to load save", 'error');
                return false;
            }
        }
        // No save found - new game
        return false;
    }, [addLog, syncTimeState, syncInventoryState, syncCustomerState, syncBrewingState, syncAudioSettings]);

    // Auto-Save Effect (Recreated)
    // We need a ref to the LATEST combined state. 
    // This is tricky with separate hooks.
    // Instead, let's just use the saveGame function in the event listener?
    // No, event listeners need fresh closures or refs.
    // simpler: Save triggers on explicit actions or intervals?
    // The previous implementation used visibilityChange which is good.
    // Auto-Save Interval (30s)
    useEffect(() => {
        const interval = setInterval(() => {
            if (time.timeState.gameStarted) {
                saveGame(true);
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [saveGame, time.timeState.gameStarted]);

    // For now, let's omit the complex background auto-save in this exact refactor step 
    // to ensure we don't introduce bugs with stale closures across 5 hooks.
    // We will re-add it in the next step once basic hook connection is verified.

    // Game Loop
    useEffect(() => {
        let interval;
        if (time.timeState.gameStarted && !gameMeta.debug.timePaused) {
            let intervalTime = 100; // Base 100ms

            // Difficulty Modifier for Speed
            const difficulty = settings.difficulty || 'cozy';
            if (difficulty === 'cozy') intervalTime = 125; // Slower (0.8x)
            else if (difficulty === 'extreme') intervalTime = 66; // Faster (1.5x)

            interval = setInterval(() => {
                advanceTimeWrapper(0.1); // Smaller tick
            }, intervalTime);
        }
        return () => clearInterval(interval);
    }, [time.timeState.gameStarted, gameMeta.debug.timePaused, gameMeta.debug.timeSpeed, advanceTimeWrapper, settings.difficulty]);

    // Initial Load
    useEffect(() => {
        loadGame();
    }, [loadGame]);


    // COMPATIBILITY API (Must match original useGame return)
    return {
        gameState: {
            ...gameMeta,
            ...time.timeState, // time, day, minutesElapsed
            ...inventory.inventoryState, // cash, inventory, stats (stats in cust), etc...
            // Wait, standard gameState had `stats` in it. 
            stats: customers.customerState.stats,
            currentCustomer: customers.customerState.currentCustomer,
            inventory: inventory.inventoryState.inventory,
            cash: inventory.inventoryState.cash,
            brewingState: brewing.brewingState,
            settings: audio.settings,
            purchaseHistory: inventory.inventoryState.purchaseHistory,
            upgrades: inventory.inventoryState.upgrades,
            weather: customers.customerState.weather
        },
        uiState,
        startGame,
        toggleModal,
        advanceTime: advanceTimeWrapper,
        handleBrewAction,
        performServe,
        handleBuy: handleBuyWrapper,
        buyUpgrade: buyUpgradeWrapper,
        setMusicVolume: audio.setMusicVolume,
        setSFXVolume: audio.setSFXVolume,
        setAmbienceVolume: audio.setAmbienceVolume,
        setUIScale,
        setDifficulty,
        toggleDarkMode: (val) => setGameMeta(prev => ({ ...prev, darkModeEnabled: val })),
        toggleMuteAll: audio.toggleMuteAll,
        toggleMusic: audio.toggleMusic,
        skipTrack: () => { if (audio.skipTrack()) addLog("Skipped track >>"); },
        saveGame,
        loadGame,
        resetGame: () => {
            localStorage.removeItem('baristaSimSave');
            window.location.reload();
        },
        toggleDebugMenu: () => setUiState(prev => ({ ...prev, showDebug: !prev.showDebug })),
        selectMode: (m) => { brewing.setMode(m); setUiState(prev => ({ ...prev, activeModal: null })); audio.playSound('action'); },
        startNewDay: startNewDayWrapper,
        getShoppingSuggestions: inventory.getShoppingSuggestions,
        dialogue: {
            state: dialogue.dialogueState,
            next: dialogue.next,
            choice: handleDialogueChoice,
            triggerGreeting: dialogue.triggerGreeting
        }
    };
};

