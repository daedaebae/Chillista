import React from 'react';
import '../styles/modules/menus.css';
import Modal from './Modal';

const ReputationModal = ({ gameState, close }) => {
    // History Graph Helper
    const renderGraph = (dataKey, color) => {
        const history = gameState.statsHistory || [];
        if (history.length < 2) return <p className="no-data">Not enough data for history graph.</p>;

        const maxVal = Math.max(...history.map(h => h[dataKey]));
        return (
            <div className="stat-graph">
                {history.map((entry, i) => {
                    const height = (entry[dataKey] / (maxVal || 1)) * 100;
                    return (
                        <div key={i} className="graph-bar-container" title={`Day ${entry.day}: ${entry[dataKey]}`}>
                            <div className="graph-bar" style={{ height: `${height}%`, backgroundColor: color }}></div>
                            <span className="graph-label">{entry.day}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Modal isOpen={true} onClose={close} title="Reputation & Unlocks" className="stats-modal">
            <div className="stats-body">
                <div className="stats-section">
                    <div className="stat-card" style={{ marginBottom: '1rem' }}>
                        <h3>Current Reputation: {gameState.stats.reputation} Stars</h3>
                    </div>

                    <h3>Reputation History</h3>
                    {renderGraph('reputation', '#ff9800')}

                    <h3>Unlock Progress</h3>
                    <div className="unlock-list">
                        <div className={`unlock-item ${gameState.stats.reputation >= 10 ? 'unlocked' : 'locked'}`}>
                            <span>Matcha Mode</span>
                            <span>{gameState.stats.reputation >= 10 ? 'Unlocked' : 'Requires 10 Rep'}</span>
                        </div>
                        <div className={`unlock-item ${gameState.stats.reputation >= 25 ? 'unlocked' : 'locked'}`}>
                            <span>Espresso Mode</span>
                            <span>{gameState.stats.reputation >= 25 ? 'Unlocked' : 'Requires 25 Rep'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ReputationModal;
