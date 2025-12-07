import { useState, useCallback, useMemo } from 'react';

export const useTime = (initialState) => {
    const [timeState, setTimeState] = useState(initialState || {
        time: '05:00 AM',
        day: 1,
        minutesElapsed: 0,
        gameStarted: false,
        paused: false,
        speed: 1
    });

    const advanceTime = useCallback((minutes) => {
        return new Promise((resolve) => {
            setTimeState(prev => {
                if (prev.paused || !prev.gameStarted) {
                    resolve(prev);
                    return prev;
                }
                if (prev.minutesElapsed >= 480) { // 5:00 AM + 480 mins = 1:00 PM
                    resolve(prev);
                    return prev;
                }

                const newMinutes = prev.minutesElapsed + minutes;

                // Time formatting
                const hour = Math.floor(newMinutes / 60) + 5; // Start at 5 AM
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour > 12 ? hour - 12 : hour;
                const displayMinute = newMinutes % 60;
                const timeString = `${displayHour}:${displayMinute.toString().padStart(2, '0')} ${ampm}`;

                const newState = {
                    ...prev,
                    minutesElapsed: newMinutes,
                    time: timeString
                };

                resolve(newState);
                return newState;
            });
        });
    }, []);

    const startNewDay = useCallback(() => {
        setTimeState(prev => ({
            ...prev,
            day: prev.day + 1,
            minutesElapsed: 0,
            time: '05:00 AM'
        }));
    }, []);

    const setGameStarted = useCallback((started) => {
        setTimeState(prev => ({ ...prev, gameStarted: started }));
    }, []);

    const setDebugTime = useCallback((paused, speed) => {
        setTimeState(prev => ({ ...prev, paused, speed }));
    }, []);

    // Sync from save
    const syncTimeState = useCallback((savedState) => {
        setTimeState(prev => ({
            ...prev,
            time: savedState.time,
            day: savedState.day,
            minutesElapsed: savedState.minutesElapsed,
            gameStarted: savedState.gameStarted
        }));
    }, []);

    return useMemo(() => ({
        timeState,
        advanceTime,
        startNewDay,
        setGameStarted,
        setDebugTime,
        syncTimeState
    }), [timeState, advanceTime, startNewDay, setGameStarted, setDebugTime, syncTimeState]);
};
