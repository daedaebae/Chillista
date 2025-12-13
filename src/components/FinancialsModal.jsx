import React from 'react';
import '../styles/modules/menus.css';
import Modal from './Modal';

const FinancialsModal = ({ gameState, close }) => {
    // Helpers
    const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

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
        <Modal isOpen={true} onClose={close} title="Financial Report" className="stats-modal">
            <div className="stats-body">
                <div className="stats-section">
                    <div className="stat-card" style={{ marginBottom: '1rem' }}>
                        <h3>Current Funds: {formatCurrency(gameState.cash)}</h3>
                    </div>

                    <h3>Funds History</h3>
                    {renderGraph('cash', '#8bc34a')}

                    <h3>Recent Purchases</h3>
                    <ul className="history-list">
                        {gameState.purchaseHistory && gameState.purchaseHistory.length > 0 ? (
                            gameState.purchaseHistory.slice().reverse().slice(0, 10).map((p, i) => (
                                <li key={i}>Bought {p.item} for {formatCurrency(p.cost)}</li>
                            ))
                        ) : (
                            <li>No purchases yet.</li>
                        )}
                    </ul>
                </div>
            </div>
        </Modal>
    );
};

export default FinancialsModal;
