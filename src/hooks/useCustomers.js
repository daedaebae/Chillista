import { useState, useCallback, useMemo } from 'react';
import pixelCustomer1 from '../assets/characters/pixel_customer_1.png';

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
            const names = ['Alice', 'Bob', 'Charlie', 'Dana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Igor', 'Jasmine', 'Ken', 'Liam', 'Mia', 'Noah', 'Olivia'];
            const name = names[Math.floor(Math.random() * names.length)];
            const avatar = pixelCustomer1;

            let specialType = null;
            const rand = Math.random();
            if (rand < 0.05) specialType = 'critic';
            else if (rand < 0.2) specialType = 'regular';
            else if (rand < 0.3) specialType = 'hipster';
            else if (rand < 0.4) specialType = 'student';
            else if (rand < 0.5) specialType = 'tourist';

            // Patience in Minutes
            let basePatience = 20; // Standard
            if (specialType === 'critic') basePatience = 15;
            if (specialType === 'regular') basePatience = 30; // Loyal
            if (specialType === 'student') basePatience = 18;
            if (specialType === 'tourist') basePatience = 25;
            if (specialType === 'hipster') basePatience = 15; // Impatient

            // Weather Modifier
            if (customerState.weather === 'rainy') basePatience *= 0.9; // Grumpy
            else if (customerState.weather === 'sunny') basePatience *= 1.1;

            // Difficulty Modifier
            if (difficulty === 'cozy') basePatience += 10; // More patience in cozy
            if (difficulty === 'extreme') basePatience -= 5; // Less patience in extreme

            basePatience = Math.max(5, Math.floor(basePatience));

            let order = 'Coffee';
            if (upgrades.includes('mode_matcha') && (specialType === 'hipster' || Math.random() < 0.3)) {
                order = 'Matcha Latte';
            } else if (upgrades.includes('mode_espresso') && Math.random() < 0.3) {
                order = 'Espresso';
            }

            newCustomer = {
                name,
                type: specialType || 'default',
                order,
                patience: basePatience,
                maxPatience: basePatience,
                decay: difficulty === 'extreme' ? 1.2 : 1.0, // Faster decay in extreme
                satisfaction: 50,
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
        clearEvent
    }), [customerState, setWeather, updatePatience, generateCustomer, clearCustomer, updateStats, resetDailyStats, syncCustomerState, clearEvent]);
};
