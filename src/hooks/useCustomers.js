
import { useState, useCallback, useMemo } from 'react';
import pixelCustomer1 from '../assets/characters/pixel_customer_1.png';
import { CHARACTER_ROSTER } from '../data/characters';

export const useCustomers = () => {
    const [customerState, setCustomerState] = useState({
        currentCustomer: null,
        stats: {
            customersServed: 0,
            tipsEarned: 0,
            dailyEarnings: 0,
            cumulativeEarnings: 0,
            reputation: 0
        },
        marketTrends: {
            beans_standard: [],
            beans_premium: [],
            milk: [],
            matcha_powder: []
        },
        customerHistory: {},
        weather: 'sunny'
    });

    const setWeather = useCallback((weather) => {
        setCustomerState(prev => ({ ...prev, weather }));
    }, []);

    const updatePatience = useCallback((minutes, hasPlant) => {
        setCustomerState(prev => {
            if (!prev.currentCustomer) return prev;

            let decayModifier = 1.0;
            if (hasPlant) decayModifier *= 0.8;

            const newCustomer = { ...prev.currentCustomer };
            newCustomer.patience -= (newCustomer.decay * minutes * decayModifier);

            if (newCustomer.patience <= 0) {
                // Return state with null customer (left)
                const newStats = { ...prev.stats, reputation: Math.max(0, prev.stats.reputation - 5) };
                return { ...prev, currentCustomer: null, stats: newStats, lastEvent: 'patience_zero' };
            }

            return { ...prev, currentCustomer: newCustomer };
        });
    }, []);

    const generateCustomer = useCallback((minutesElapsed, upgrades, arrivalDisabled, difficulty = 'cozy') => {
        let newCustomer = null;

        setCustomerState(prev => {
            if (prev.currentCustomer || arrivalDisabled) return prev;
            // ... (keeping existing early return logic checks if needed, but we do main logic below)
            return prev;
        });

        // Logic outside setter
        if (customerState.currentCustomer || arrivalDisabled) return false;

        let arrivalChance = 0.2;
        if (customerState.weather === 'rainy') arrivalChance = 0.1;
        else if (customerState.weather === 'sunny') arrivalChance = 0.25;

        // Difficulty affects arrival chance?
        if (difficulty === 'cozy') arrivalChance *= 0.8;
        if (difficulty === 'extreme') arrivalChance *= 1.2;

        if (Math.random() > (1 - arrivalChance)) {
            // Pick a random specific character definition
            const characterTemplate = CHARACTER_ROSTER[Math.floor(Math.random() * CHARACTER_ROSTER.length)];

            const name = characterTemplate.name; // Use roster name
            const avatar = pixelCustomer1; // Still using placeholder avatar for now

            // Determine type based on traits for legacy logic, or map traits to type
            let specialType = 'default';
            if (characterTemplate.traits.includes('Trendy')) specialType = 'hipster';
            if (characterTemplate.traits.includes('Creative')) specialType = 'student'; // approximate
            if (characterTemplate.traits.includes('Loyal')) specialType = 'regular';

            // Patience Logic based on Character Data
            let basePatience = characterTemplate.basePatience || 20;

            // Weather Modifier
            if (customerState.weather === 'rainy') basePatience *= 0.9;
            else if (customerState.weather === 'sunny') basePatience *= 1.1;

            // Difficulty Modifier
            if (difficulty === 'cozy') basePatience += 10;
            if (difficulty === 'extreme') basePatience -= 5;

            basePatience = Math.max(5, Math.floor(basePatience));

            // Preference Logic
            let order = characterTemplate.preferences.drink;
            // Override strictly if upgrades missing?
            if (order === 'Matcha Latte' && !upgrades.includes('mode_matcha')) order = 'Coffee';
            if (order === 'Espresso' && !upgrades.includes('mode_espresso')) order = 'Coffee';

            const newCustomer = {
                ...characterTemplate, // Spread static data (bio, age, traits)
                type: specialType, // Keep type for now for compatibility
                order,
                patience: basePatience * 1.2,
                maxPatience: basePatience * 1.2,
                decay: difficulty === 'extreme' ? 1.2 : 0.7,
                satisfaction: 50, // Initial mood
                arrivalTime: minutesElapsed,
                avatar
            };

            setCustomerState(prev => ({ ...prev, currentCustomer: newCustomer }));
            return newCustomer;
        }

        return false;
    }, [customerState]);



    const clearCustomer = useCallback(() => {
        setCustomerState(prev => ({ ...prev, currentCustomer: null }));
    }, []);

    const updateStats = useCallback((earnings, tip, repChange, customerName) => {
        setCustomerState(prev => {
            const newHistory = { ...prev.customerHistory };
            if (customerName) {
                if (!newHistory[customerName]) {
                    newHistory[customerName] = { visits: 0, totalSpent: 0 };
                }
                newHistory[customerName] = {
                    ...newHistory[customerName],
                    visits: newHistory[customerName].visits + 1,
                    totalSpent: newHistory[customerName].totalSpent + earnings + tip
                };
            }

            return {
                ...prev,
                customerHistory: newHistory,
                stats: {
                    ...prev.stats,
                    customersServed: prev.stats.customersServed + 1,
                    tipsEarned: prev.stats.tipsEarned + tip,
                    dailyEarnings: prev.stats.dailyEarnings + earnings,
                    reputation: Math.max(0, prev.stats.reputation + repChange)
                }
            };
        });
    }, []);

    const resetDailyStats = useCallback(() => {
        setCustomerState(prev => ({
            ...prev,
            stats: {
                ...prev.stats,
                customersServed: 0,
                tipsEarned: 0,
                dailyEarnings: 0
            }
        }));
    }, []);

    const clearEvent = useCallback(() => {
        setCustomerState(prev => ({ ...prev, lastEvent: null }));
    }, []);

    const resetAllCustomers = useCallback(() => {
        setCustomerState({
            currentCustomer: null,
            stats: {
                customersServed: 0,
                tipsEarned: 0,
                dailyEarnings: 0,
                cumulativeEarnings: 0,
                reputation: 0
            },
            marketTrends: {
                beans_standard: [],
                beans_premium: [],
                milk: [],
                matcha_powder: []
            },
            customerHistory: {},
            weather: 'sunny',
            lastEvent: null
        });
    }, []);

    const syncCustomerState = useCallback((saved) => {
        setCustomerState(prev => ({
            ...prev,
            currentCustomer: saved.currentCustomer,
            stats: saved.stats,
            marketTrends: saved.marketTrends,
            weather: saved.weather
        }));
    }, []);

    return useMemo(() => ({
        customerState,
        setWeather,
        updatePatience,
        generateCustomer,
        clearCustomer,
        updateStats,
        resetDailyStats,

        syncCustomerState,
        clearEvent,
        resetAllCustomers
    }), [customerState, setWeather, updatePatience, generateCustomer, clearCustomer, updateStats, resetDailyStats, syncCustomerState, clearEvent, resetAllCustomers]);
};
