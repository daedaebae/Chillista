import { useState, useEffect, useCallback } from 'react';
import DIALOGUE_DATA from '../data/dialogueData.js';

export const useGame = () => {
    const [gameState, setGameState] = useState({
        time: '05:00 AM',
        day: 1,
        minutesElapsed: 0,
        cash: 50.00,
        inventory: {
            beans_standard: 500,
            beans_premium: 200,
            matcha_powder: 0,
            water: 1000,
            milk: 500,
            cups: 50,
            filters: 50
        },
        currentCustomer: null,
        brewingState: {
            mode: 'coffee',
            step: 0,
            beanType: null
        },
        decorations: [],
        stats: {
            customersServed: 0,
            tipsEarned: 0,
            dailyEarnings: 0,
            cumulativeEarnings: 0,
            reputation: 0
        },
        purchaseHistory: [],
        marketTrends: {
            beans_standard: [],
            beans_premium: [],
            milk: [],
            matcha_powder: []
        },
        weather: 'sunny',
        upgrades: [],
        unlockedLocations: ['cart'],
        darkModeUnlocked: false,
        darkModeEnabled: false,
        debug: {
            enabled: false,
            weatherDisabled: false,
            customerArrivalDisabled: false,
            timePaused: false,
            infiniteResources: false,
            timeSpeed: 1
        },
        gameStarted: false,
        settings: {
            uiScale: 100,
            musicVolume: 30,
            sfxVolume: 10,
            ambienceVolume: 30
        }
    });

    const [uiState, setUiState] = useState({
        activeModal: 'intro', // intro, name, settings, inventory, shop, etc.
        activeScreen: 'cart', // cart, map, park
        notifications: []
    });

    // Actions
    const startGame = useCallback((playerName) => {
        setGameState(prev => ({ ...prev, gameStarted: true }));
        setUiState(prev => ({ ...prev, activeModal: null }));
        // Logic to start day, play music, etc.
    }, []);

    const toggleModal = useCallback((modalName) => {
        setUiState(prev => ({
            ...prev,
            activeModal: prev.activeModal === modalName ? null : modalName
        }));
    }, []);

    // Helper to add log
    const addLog = useCallback((message, type = 'neutral') => {
        // In a real app, we might want to persist this or show it in a UI component
        console.log(`[${type}] ${message}`);
        // We could add it to a log state if needed for the UI
    }, []);

    // Game Logic Methods
    const advanceTime = useCallback((minutes) => {
        setGameState(prev => {
            if (prev.debug.timePaused) return prev;

            const newMinutes = prev.minutesElapsed + minutes;
            let newCustomer = prev.currentCustomer;
            let newStats = { ...prev.stats };
            let newWeather = prev.weather;

            // Check Customer Patience
            if (newCustomer) {
                let decayModifier = 1.0;
                if (prev.decorations.includes('plant')) decayModifier *= 0.8;

                newCustomer = { ...newCustomer }; // Copy
                newCustomer.patience -= (newCustomer.decay * minutes * decayModifier);

                if (newCustomer.patience <= 0) {
                    addLog(`${newCustomer.name} left in anger! -5 Rep`, 'error');
                    newStats.reputation = Math.max(0, newStats.reputation - 5);
                    newCustomer = null;
                }
            }

            // Customer Arrival
            if (!prev.debug.customerArrivalDisabled && !newCustomer) {
                let arrivalChance = 0.4;
                if (prev.weather === 'rainy') arrivalChance = 0.25;
                else if (prev.weather === 'sunny') arrivalChance = 0.5;

                if (Math.random() > (1 - arrivalChance)) {
                    // Generate Customer Logic (Simplified for now)
                    const names = ['Alice', 'Bob', 'Charlie', 'Dana', 'Eve'];
                    const name = names[Math.floor(Math.random() * names.length)];
                    newCustomer = {
                        name,
                        patience: 100,
                        decay: 0.5,
                        order: 'Coffee',
                        satisfaction: 50,
                        arrivalTime: newMinutes
                    };
                    addLog(`☕ ${name} arrived!`, 'success');
                }
            }

            // End of Day Check
            if (newMinutes >= 480) { // 1:00 PM
                // End Game Logic
                addLog("Day ended!", 'system');
            }

            return {
                ...prev,
                minutesElapsed: newMinutes,
                currentCustomer: newCustomer,
                stats: newStats
            };
        });
    }, [addLog]);

    // Game Loop
    useEffect(() => {
        let interval;
        if (gameState.gameStarted && !gameState.debug.timePaused) {
            const speed = gameState.debug.timeSpeed || 1;
            interval = setInterval(() => {
                advanceTime(1);
            }, 1000 / speed);
        }
        return () => clearInterval(interval);
    }, [gameState.gameStarted, gameState.debug.timePaused, gameState.debug.timeSpeed, advanceTime]);

    return {
        gameState,
        uiState,
        startGame,
        toggleModal,
        advanceTime
    };
};

