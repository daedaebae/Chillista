import { useState, useCallback, useMemo } from 'react';

export const useInventory = (initialState) => {
    const [inventoryState, setInventoryState] = useState(initialState || {
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
        resourceUsage: { // Track consumption
            beans_standard: { used: 0, lastRestock: 1 },
            beans_premium: { used: 0, lastRestock: 1 },
            milk: { used: 0, lastRestock: 1 },
            water: { used: 0, lastRestock: 1 },
            cups: { used: 0, lastRestock: 1 },
            filters: { used: 0, lastRestock: 1 },
            matcha_powder: { used: 0, lastRestock: 1 }
        },
        decorations: [],
        upgrades: [],
        purchaseHistory: []
    });

    // Helper to calculate suggestions
    const getShoppingSuggestions = useCallback(() => {
        const suggestions = [];
        const { inventory, upgrades, cash } = inventoryState;

        const thresholds = {
            beans_standard: 150,
            beans_premium: 100,
            milk: 500,
            cups: 20,
            filters: 20,
            matcha_powder: 50
        };

        for (const [key, amount] of Object.entries(inventory)) {
            if (thresholds[key] && amount < thresholds[key]) {
                if (key === 'matcha_powder' && !upgrades.includes('mode_matcha')) continue;
                if (key === 'beans_premium' && !upgrades.includes('mode_espresso')) continue;
                suggestions.push({
                    type: 'restock',
                    message: `Low on ${key.replace('_', ' ')}. (${amount}/${thresholds[key]})`,
                    itemKey: key.toUpperCase()
                });
            }
        }
        if (cash > 100 && Math.random() < 0.3) {
            suggestions.push({ type: 'fun', message: "Treat yourself to a plant!", itemKey: 'PLANT' });
        }
        return suggestions;
    }, [inventoryState]);



    const handleBuy = useCallback((itemKey, amount) => {
        const itemMap = {
            'BEANS_STD': { key: 'beans_standard', cost: 5.00, name: 'Standard Beans' },
            'BEANS_PRM': { key: 'beans_premium', cost: 10.00, name: 'Premium Beans' },
            'MILK': { key: 'milk', cost: 4.00, name: 'Fresh Milk' },
            'WATER': { key: 'water', cost: 2.00, name: 'Fresh Water' },
            'PLANT': { key: 'plant', cost: 20.00, name: 'Potted Plant', type: 'decoration' },
            'MATCHA': { key: 'matcha_powder', cost: 10.00, name: 'Matcha Powder' },
            'CUPS': { key: 'cups', cost: 5.00, name: 'Paper Cups' },
            'FILTERS': { key: 'filters', cost: 2.50, name: 'Filters' }
        };

        const item = itemMap[itemKey];
        if (!item) return { success: false, reason: 'invalid_item' };

        // This function will need to be capable of returning a result we can act on.
        // We'll calculate the new state and return the result object.
        let result = { success: false, item };

        setInventoryState(prev => {
            if (prev.cash >= item.cost) {
                if (item.type === 'decoration' && prev.decorations.includes(item.key)) {
                    result = { success: false, reason: 'already_owned', item };
                    return prev;
                }

                const newInventory = { ...prev.inventory };
                const newDecorations = [...prev.decorations];

                if (item.type === 'decoration') {
                    newDecorations.push(item.key);
                } else {
                    newInventory[item.key] += amount;
                }

                result = { success: true, item };

                return {
                    ...prev,
                    cash: prev.cash - item.cost,
                    inventory: newInventory,
                    decorations: newDecorations,
                    purchaseHistory: [
                        ...prev.purchaseHistory,
                        { item: item.name, quantity: amount || 1, cost: item.cost, timestamp: Date.now() } // day is missing here, add later
                    ]
                };
            } else {
                result = { success: false, reason: 'insufficient_funds', item };
                return prev;
            }
        });
        return result;
    }, []);

    const buyUpgrade = useCallback((upgradeId, reputation) => {
        const UPGRADES = {
            'grinder_fast': { cost: 50, rep: 0, name: 'Fast Grinder' },
            'mode_matcha': { cost: 100, rep: 10, name: 'Matcha Kit' },
            'mode_espresso': { cost: 250, rep: 25, name: 'Espresso Machine' }
        };
        const upgrade = UPGRADES[upgradeId];
        let result = { success: false };

        setInventoryState(prev => {
            if (prev.cash >= upgrade.cost && reputation >= upgrade.rep) {
                result = { success: true, upgrade };
                return {
                    ...prev,
                    cash: prev.cash - upgrade.cost,
                    upgrades: [...prev.upgrades, upgradeId]
                };
            }
            return prev;
        });
        return result;
    }, []);

    // Manual cash add (for service)
    const addCash = useCallback((amount) => {
        setInventoryState(prev => ({ ...prev, cash: prev.cash + amount }));
    }, []);

    // Manual inventory deduct (for brewing/service)
    const deductResources = useCallback((deductions) => {
        // deductions = { beans_standard: 20, water: 250 }
        let success = true;
        setInventoryState(prev => {
            // Verify first (optional, or assume caller checked)
            // We'll assume strict check
            for (const [key, val] of Object.entries(deductions)) {
                if ((prev.inventory[key] || 0) < val) success = false;
            }

            if (!success) return prev;

            const newInv = { ...prev.inventory };
            const newUsage = { ...prev.resourceUsage };
            for (const [key, val] of Object.entries(deductions)) {
                newInv[key] -= val;

                // Track Usage
                if (!newUsage[key]) newUsage[key] = { used: 0, lastRestock: 1 };
                newUsage[key] = {
                    ...newUsage[key],
                    used: newUsage[key].used + val
                };
            }

            return {
                ...prev,
                inventory: newInv,
                resourceUsage: newUsage
            };
        });
        return true;
    }, []);

    const syncInventoryState = useCallback((saved) => {
        setInventoryState(prev => ({
            ...prev,
            cash: saved.cash,
            inventory: saved.inventory,
            decorations: saved.decorations,
            upgrades: saved.upgrades,
            purchaseHistory: saved.purchaseHistory
        }));
    }, []);

    return useMemo(() => ({
        inventoryState,
        handleBuy,
        buyUpgrade,
        addCash,
        deductResources,
        syncInventoryState,
        getShoppingSuggestions
    }), [inventoryState, handleBuy, buyUpgrade, addCash, deductResources, syncInventoryState, getShoppingSuggestions]);
};
