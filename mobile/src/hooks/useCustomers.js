import { useState, useCallback } from 'react';

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
        marketTrends: { // Keeping these here as they relate to demand
            beans_standard: [],
            beans_premium: [],
            milk: [],
            beans_premium: [],
            milk: [],
            matcha_powder: []
        },
        customerHistory: {}, // { 'Alice': { visits: 0, totalSpent: 0 } }
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
                // The caller needs to know this happened to log it.
                // We can handle the effects here:
                const newStats = { ...prev.stats, reputation: Math.max(0, prev.stats.reputation - 5) };
                return { ...prev, currentCustomer: null, stats: newStats, lastEvent: 'patience_zero' };
            }

            return { ...prev, currentCustomer: newCustomer };
        });
    }, []);

    const generateCustomer = useCallback((minutesElapsed, upgrades, arrivalDisabled) => {
        // Return info about generation?
        let generated = false;

        setCustomerState(prev => {
            if (prev.currentCustomer || arrivalDisabled) return prev;

            let arrivalChance = 0.2;
            if (prev.weather === 'rainy') arrivalChance = 0.1;
            else if (prev.weather === 'sunny') arrivalChance = 0.25;

            if (Math.random() > (1 - arrivalChance)) {
                const names = ['Alice', 'Bob', 'Charlie', 'Dana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Igor', 'Jasmine', 'Ken', 'Liam', 'Mia', 'Noah', 'Olivia'];
                const name = names[Math.floor(Math.random() * names.length)];

                let specialType = null;
                const rand = Math.random();
                if (rand < 0.05) specialType = 'critic';
                else if (rand < 0.2) specialType = 'regular';
                else if (rand < 0.3) specialType = 'hipster';
                else if (rand < 0.4) specialType = 'student';
                else if (rand < 0.5) specialType = 'tourist';

                let patience = 100;
                if (specialType === 'critic') patience = 50;
                if (specialType === 'regular') patience = 150;
                if (specialType === 'student') patience = 70;
                if (specialType === 'tourist') patience = 120;

                if (prev.weather === 'rainy') patience = Math.floor(patience * 0.8);
                else if (prev.weather === 'sunny') patience = Math.floor(patience * 1.2);

                let order = 'Coffee';
                if (upgrades.includes('mode_matcha') && (specialType === 'hipster' || Math.random() < 0.3)) {
                    order = 'Matcha Latte';
                } else if (upgrades.includes('mode_espresso') && Math.random() < 0.3) {
                    order = 'Espresso';
                }

                const newCustomer = {
                    name,
                    type: specialType || 'default',
                    order,
                    patience,
                    maxPatience: patience,
                    decay: 0.5,
                    satisfaction: 50,
                    arrivalTime: minutesElapsed
                };
                generated = newCustomer;
                return { ...prev, currentCustomer: newCustomer };
            }
            return prev;
        });

        return generated; // This might be tricky with setter async.
        // We'll need the caller to check generic state updates.
    }, []);

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

    const syncCustomerState = useCallback((saved) => {
        setCustomerState(prev => ({
            ...prev,
            currentCustomer: saved.currentCustomer,
            stats: saved.stats,
            marketTrends: saved.marketTrends,
            weather: saved.weather
        }));
    }, []);

    return {
        customerState,
        setWeather,
        updatePatience,
        generateCustomer,
        clearCustomer,
        updateStats,
        resetDailyStats,
        syncCustomerState
    };
};
