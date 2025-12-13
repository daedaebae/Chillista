import React from 'react';
import '../styles/modules/menus.css';
import Modal from './Modal';
import { CHARACTER_ROSTER } from '../data/characters';

const CustomersModal = ({ gameState, close }) => {
    return (
        <Modal isOpen={true} onClose={close} title="Customer Roster" className="stats-modal">
            <div className="stats-body">
                <div className="stats-section">
                    <h3>Regulars</h3>
                    <div className="roster-grid">
                        {CHARACTER_ROSTER.map(char => (
                            <div key={char.id} className="roster-card">
                                <div className="roster-name">{char.name}</div>
                                <div className="roster-info">{char.age} • {char.traits.join(', ')}</div>
                                <div className="roster-fav">❤️ {char.preferences.type}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default CustomersModal;
