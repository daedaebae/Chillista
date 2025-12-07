import React from 'react';
import Modal from './Modal';

const ModeSelectionModal = ({ isOpen, onClose, onSelectMode, unlockedModes }) => {
    const modes = [
        {
            id: 'coffee',
            name: 'AeroPress',
            desc: 'Classic & Reliable',
            icon: '☕',
            locked: false
        },
        {
            id: 'matcha',
            name: 'Matcha Bowl',
            desc: 'Locked (Buy Kit)',
            icon: '🍵',
            locked: !unlockedModes.includes('mode_matcha')
        },
        {
            id: 'espresso',
            name: 'Espresso',
            desc: 'Locked (Buy Machine)',
            icon: '⚡',
            locked: !unlockedModes.includes('mode_espresso')
        }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Select Brewing Mode">
            <div className="mode-grid">
                {modes.map(mode => (
                    <button
                        key={mode.id}
                        className={`mode-btn ${mode.locked ? 'locked' : ''}`}
                        onClick={() => !mode.locked && onSelectMode(mode.id)}
                        disabled={mode.locked}
                    >
                        <span className="mode-icon">{mode.icon}</span>
                        <div>
                            <span className="mode-name">{mode.name}</span>
                            <span className="mode-desc">{mode.desc}</span>
                        </div>
                    </button>
                ))}
            </div>
        </Modal>
    );
};

export default ModeSelectionModal;
