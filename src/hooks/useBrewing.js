import { useState, useCallback, useMemo } from 'react';

export const useBrewing = () => {
    const [brewingState, setBrewingState] = useState({
        mode: 'coffee',
        step: 0,
        beanType: null
    });

    const setMode = useCallback((mode) => {
        setBrewingState(prev => ({ ...prev, mode, step: 0, beanType: null }));
    }, []);

    const advanceStep = useCallback((beanType = null) => {
        setBrewingState(prev => ({
            ...prev,
            step: prev.step + 1,
            beanType: beanType || prev.beanType
        }));
    }, []);

    const resetBrewing = useCallback(() => {
        setBrewingState(prev => ({ ...prev, step: 0, beanType: null }));
    }, []);

    const syncBrewingState = useCallback((savedState) => {
        // brewingState might not need saving if we don't save mid-brew?
        // Actually we do save entire state.
        setBrewingState(savedState);
    }, []);

    return useMemo(() => ({
        brewingState,
        setMode,
        advanceStep,
        resetBrewing,
        syncBrewingState
    }), [brewingState, setMode, advanceStep, resetBrewing, syncBrewingState]);
};
