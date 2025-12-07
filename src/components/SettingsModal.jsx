import React, { useState } from 'react';
import Modal from './Modal';

const SettingsModal = ({ isOpen, onClose, gameState, actions }) => {
    const { settings, debug, darkModeEnabled } = gameState;
    const {
        setMusicVolume,
        setSFXVolume,
        setAmbienceVolume,
        setUIScale,
        toggleDarkMode,
        toggleMusic,
        saveGame,
        resetGame,
        toggleDebugMenu
    } = actions;

    const [confirmReset, setConfirmReset] = useState(false);

    const handleResetClick = () => {
        if (confirmReset) {
            resetGame();
            setConfirmReset(false);
        } else {
            setConfirmReset(true);
            setTimeout(() => setConfirmReset(false), 3000);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Settings">
            <div className="menu-group">
                <label>
                    <input
                        type="checkbox"
                        checked={darkModeEnabled || false}
                        onChange={(e) => toggleDarkMode(e.target.checked)}
                    />
                    Dark Mode
                </label>
            </div>

            <div className="menu-group">
                <label>
                    <input
                        type="checkbox"
                        checked={settings.musicEnabled !== false}
                        onChange={(e) => toggleMusic(e.target.checked)}
                    />
                    Music Enabled
                </label>
            </div>

            <div className="menu-group">
                <label>
                    <input
                        type="checkbox"
                        checked={settings.muteAll || false}
                        onChange={(e) => actions.toggleMuteAll(!e.target.checked)}
                    />
                    Mute All Sounds
                </label>
            </div>

            <div className="menu-group">
                <label>Ambience Volume</label>
                <input
                    type="range" min="0" max="100"
                    value={settings.ambienceVolume}
                    className="slider"
                    onChange={(e) => setAmbienceVolume(parseInt(e.target.value))}
                />
            </div>

            <div className="menu-group">
                <label>Music Volume</label>
                <input
                    type="range" min="0" max="100"
                    value={settings.musicVolume}
                    className="slider"
                    onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                />
            </div>

            <div className="menu-group">
                <label>SFX Volume</label>
                <input
                    type="range" min="0" max="100"
                    value={settings.sfxVolume}
                    className="slider"
                    onChange={(e) => setSFXVolume(parseInt(e.target.value))}
                />
            </div>

            <div className="menu-group">
                <label>UI Scale: {settings.uiScale}%</label>
                <input
                    type="range" min="75" max="150"
                    value={settings.uiScale}
                    className="slider"
                    onChange={(e) => setUIScale(parseInt(e.target.value))}
                />
            </div>

            <div className="menu-group">
                <button
                    className="btn action"
                    style={{
                        width: '100%',
                        backgroundColor: confirmReset ? 'var(--error-color)' : '#5d4037',
                        border: confirmReset ? '2px solid red' : '2px solid #3e2723',
                        color: 'white'
                    }}
                    onClick={handleResetClick}
                >
                    {confirmReset ? "Are you sure? (Click again)" : "Reset Progress"}
                </button>
            </div>

            <div className="menu-group">
                <button
                    className="btn nav"
                    style={{ width: '100%', marginBottom: '0.5rem' }}
                    onClick={actions.openWiki}
                >
                    📚 View Project Wiki
                </button>
                <button
                    className="btn nav"
                    style={{ width: '100%', filter: 'grayscale(1)' }}
                    onClick={toggleDebugMenu}
                >
                    {actions.uiState.showDebug ? 'Hide Debug Menu' : 'Show Debug Menu'}
                </button>
            </div>
        </Modal>
    );
};

export default SettingsModal;
