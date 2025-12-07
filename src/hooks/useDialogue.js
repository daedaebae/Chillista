import { useState, useCallback, useEffect, useRef } from 'react';
import DIALOGUE_DATA from '../data/dialogueData';

export const useDialogue = (gameAudio) => {
    const [dialogueState, setDialogueState] = useState({
        isOpen: false,
        text: '',
        isTyping: false,
        choices: null, // null or array of choices
        speaker: 'Barista'
    });

    const queueRef = useRef([]);
    const timeoutRef = useRef(null);

    const typeLine = useCallback((fullText, onComplete) => {
        setDialogueState(prev => ({ ...prev, text: '', isTyping: true }));
        let i = 0;

        const typeChar = () => {
            if (i < fullText.length) {
                setDialogueState(prev => ({ ...prev, text: fullText.substring(0, i + 1) }));
                i++;
                // Play typing sound occasionally?
                // if (gameAudio && i % 3 === 0) gameAudio.playSound('blip'); 
                timeoutRef.current = setTimeout(typeChar, 30);
            } else {
                setDialogueState(prev => ({ ...prev, isTyping: false }));
                if (onComplete) onComplete();
            }
        };
        typeChar();
    }, []);

    const showDialogue = useCallback((lines, speaker = 'Customer') => {
        if (!lines) return;
        if (!Array.isArray(lines)) lines = [lines];

        queueRef.current = lines;

        setDialogueState(prev => ({
            ...prev,
            isOpen: true,
            speaker,
            choices: null
        }));

        processQueue();
    }, []);

    const processQueue = useCallback(() => {
        if (queueRef.current.length === 0) {
            // End of dialogue
            // Unless we have choices waiting?
            return;
        }

        const nextLine = queueRef.current.shift();
        typeLine(nextLine);
    }, [typeLine]);

    const showChoices = useCallback((choices) => {
        setDialogueState(prev => ({ ...prev, choices, isOpen: true }));
    }, []);

    const closeDialogue = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setDialogueState(prev => ({ ...prev, isOpen: false, text: '', choices: null }));
    }, []);

    const next = useCallback(() => {
        if (dialogueState.isTyping) {
            // Instant finish
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            // We need to know the full text that was targeted... simpler to just let it finish or use ref?
            // For now, let's just ignore skip or implement proper "show full text" if we had the full text stored.
            // We'll skip complex instant-finish for this MVP step.
            return;
        }

        if (queueRef.current.length > 0) {
            processQueue();
        } else if (!dialogueState.choices) {
            closeDialogue();
        }
    }, [dialogueState.isTyping, dialogueState.choices, processQueue, closeDialogue]);

    // Context-aware triggers
    const triggerGreeting = useCallback((customer, weather) => {
        if (!customer) return;

        const typeData = DIALOGUE_DATA[customer.type] || DIALOGUE_DATA.default;
        // Select greeting based on context?
        // Simple random for now, or match weather if keyword exists
        let greeting = typeData.greeting[Math.floor(Math.random() * typeData.greeting.length)];

        if (weather === 'rainy' && Math.random() < 0.5) {
            // Override with generic rainy greeting if available or just append
            // For now use the random one.
        }

        // Show greeting then choices
        queueRef.current = [greeting];
        setDialogueState(prev => ({ ...prev, isOpen: true, speaker: customer.name, choices: null }));

        typeLine(greeting, () => {
            // After greeting finishes, show choices
            setDialogueState(prev => ({ ...prev, choices: typeData.choices }));
        });

    }, [typeLine]);

    return {
        dialogueState,
        showDialogue,
        closeDialogue,
        next,
        triggerGreeting
    };
};
