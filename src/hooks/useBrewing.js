import { useState, useCallback, useMemo } from 'react';

export const useBrewing = () => {
    const [brewingState, setBrewingState] = useState({
        mode: 'coffee',
        step: 0,
        beanType: null,
        isBoiling: false // New state
    });

    const setMode = useCallback((mode) => {
        setBrewingState(prev => ({ ...prev, mode, step: 0, beanType: null, isBoiling: false }));
    }, []);

    const advanceStep = useCallback((beanType = null) => {
        setBrewingState(prev => ({
            ...prev,
            step: prev.step + 1,
            beanType: beanType || prev.beanType
        }));
    }, []);

    const setBoiling = useCallback((isBoiling) => {
        setBrewingState(prev => ({ ...prev, isBoiling }));
    }, []);

    const setStrictStep = useCallback((step) => {
        setBrewingState(prev => ({ ...prev, step }));
    }, []);

    const resetBrewing = useCallback(() => {
        setBrewingState(prev => ({ ...prev, step: 0, beanType: null, isBoiling: false }));
    }, []);

    const syncBrewingState = useCallback((savedState) => {
        setBrewingState({ ...savedState, isBoiling: false }); // Always reset boiling on load
    }, []);

    return useMemo(() => ({
        brewingState,
        setMode,
        advanceStep,
        setBoiling, // Export
        resetBrewing,
        syncBrewingState,
        setStrictStep
    }), [brewingState, setMode, advanceStep, setBoiling, resetBrewing, syncBrewingState, setStrictStep]);
};
