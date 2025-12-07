import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AudioSystem } from '../logic/AudioSystem.js';

export const useAudio = (initialSettings) => {
    const audioRef = useRef(null);
    const [settings, setSettings] = useState(initialSettings || {
        musicVolume: 30,
        sfxVolume: 10,
        ambienceVolume: 30,
        musicEnabled: true,
        muteAll: false
    });

    // Initialize Audio System
    useEffect(() => {
        audioRef.current = new AudioSystem();
        return () => {
            if (audioRef.current) {
                audioRef.current.stopMusic();
                audioRef.current.stopAmbience();
            }
        };
    }, []);

    const playMusic = useCallback(() => {
        if (audioRef.current && !settings.muteAll && settings.musicEnabled) {
            audioRef.current.context.resume().then(() => {
                audioRef.current.playMusic();
            });
        }
    }, [settings.muteAll, settings.musicEnabled]);

    const playAmbience = useCallback((path) => {
        if (audioRef.current && !settings.muteAll) {
            audioRef.current.playAmbience(path);
        }
    }, [settings.muteAll]);

    // Play SFX helpers
    const playSound = useCallback((type) => {
        if (!audioRef.current || settings.muteAll) return;

        const actions = {
            'success': () => audioRef.current.playSuccess(),
            'error': () => audioRef.current.playError(),
            'action': () => audioRef.current.playAction(),
            'grind': () => audioRef.current.playGrind(),
            'pour': () => audioRef.current.playPour(),
            'chime': () => audioRef.current.playChime()
        };

        if (actions[type]) actions[type]();
    }, [settings.muteAll]);


    // Settings Setters
    const setMusicVolume = useCallback((val) => {
        if (audioRef.current) audioRef.current.setMusicVolume(val);
        setSettings(prev => ({ ...prev, musicVolume: val }));
    }, []);

    const setSFXVolume = useCallback((val) => {
        if (audioRef.current) audioRef.current.setSFXVolume(val);
        setSettings(prev => ({ ...prev, sfxVolume: val }));
    }, []);

    const setAmbienceVolume = useCallback((val) => {
        if (audioRef.current) audioRef.current.setAmbienceVolume(val);
        setSettings(prev => ({ ...prev, ambienceVolume: val }));
    }, []);

    const toggleMusic = useCallback((enabled) => {
        setSettings(prev => ({ ...prev, musicEnabled: enabled }));
        if (audioRef.current) {
            if (enabled && !settings.muteAll) audioRef.current.playMusic();
            else audioRef.current.stopMusic();
        }
    }, [settings.muteAll]);

    const skipTrack = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.skipToNextTrack();
            return true; // Return true to signal a log needs to be added by parent
        }
        return false;
    }, []);

    const toggleMuteAll = useCallback((enabled) => {
        const mute = !enabled; // "Enabled" comes from checkbox "Master Mute" ?? No, standard toggle

        // Correct logic based on useGame:
        // Input `enabled` meant "Sound is Enabled" (so mute = !enabled)
        // Checkbox is "Mute All" so passing !checked means enable=true if unchecked.

        setSettings(prev => {
            if (audioRef.current) {
                if (mute) {
                    audioRef.current.setMusicVolume(0);
                    audioRef.current.setSFXVolume(0);
                    audioRef.current.setAmbienceVolume(0);
                } else {
                    audioRef.current.setMusicVolume(prev.musicVolume || 30);
                    audioRef.current.setSFXVolume(prev.sfxVolume || 10);
                    audioRef.current.setAmbienceVolume(prev.ambienceVolume || 30);
                }
            }
            return { ...prev, muteAll: mute };
        });
    }, []);

    // Sync settings from save
    const syncAudioSettings = useCallback((loadedSettings) => {
        setSettings(loadedSettings);
        if (audioRef.current) {
            if (loadedSettings.muteAll) {
                audioRef.current.setMusicVolume(0);
                audioRef.current.setSFXVolume(0);
                audioRef.current.setAmbienceVolume(0);
            } else {
                audioRef.current.setMusicVolume(loadedSettings.musicVolume);
                audioRef.current.setSFXVolume(loadedSettings.sfxVolume);
                audioRef.current.setAmbienceVolume(loadedSettings.ambienceVolume);
            }
        }
    }, []);

    return useMemo(() => ({
        audioRef,
        settings,
        playMusic,
        playAmbience,
        playSound,
        setMusicVolume,
        setSFXVolume,
        setAmbienceVolume,
        toggleMusic,
        skipTrack,
        toggleMuteAll,
        syncAudioSettings
    }), [settings, playMusic, playAmbience, playSound, setMusicVolume, setSFXVolume, setAmbienceVolume, toggleMusic, skipTrack, toggleMuteAll, syncAudioSettings]);
};
