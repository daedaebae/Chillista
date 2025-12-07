import React, { useState } from 'react';
import Modal from './Modal';

const SHOP_ITEMS = [
    { key: 'BEANS_STD', name: 'Standard Beans', icon: '🫘', desc: '100g for $5', cost: 5.00, amount: 100, unit: 'g' },
    { key: 'BEANS_PRM', name: 'Premium Beans', icon: '✨', desc: '100g for $10', cost: 10.00, amount: 100, unit: 'g' },
    { key: 'MILK', name: 'Fresh Milk', icon: '🥛', desc: '200ml for $4', cost: 4.00, amount: 200, unit: 'ml' },
    { key: 'WATER', name: 'Fresh Water', icon: '💧', desc: '500ml for $2', cost: 2.00, amount: 500, unit: 'ml' },
    { key: 'PLANT', name: 'Potted Plant', icon: '🪴', desc: 'Cozy vibes. $20', cost: 20.00, amount: 1, type: 'decoration' },
    { key: 'MATCHA', name: 'Matcha Powder', icon: '🍃', desc: '50g for $10', cost: 10.00, amount: 50, unit: 'g' },
    { key: 'CUPS', name: 'Paper Cups', icon: '🥤', desc: '50 Pack. $5.00', cost: 5.00, amount: 50, unit: 'pcs' },
    { key: 'FILTERS', name: 'Filters', icon: '📄', desc: '50 Pack. $2.50', cost: 2.50, amount: 50, unit: 'pcs' }
];

const UPGRADES = [
    { id: 'grinder_fast', name: 'Fast Grinder', icon: '⚙️', desc: 'Grind beans instantly.', cost: 50, rep: 0 },
    { id: 'mode_matcha', name: 'Matcha Kit', icon: '✨', desc: 'Unlock Matcha brewing mode.', cost: 100, rep: 10, type: 'mode' },
    { id: 'mode_espresso', name: 'Espresso Machine', icon: '✨', desc: 'Unlock Espresso brewing mode.', cost: 250, rep: 25, type: 'mode' }
];

const ShopModal = ({ isOpen, onClose, gameState, handleBuy, buyUpgrade }) => {
    const [activeTab, setActiveTab] = useState('supplies');
    const { cash, stats, upgrades } = gameState;

    // Get suggestions from game logic if available, or calculate locally (fallback)
    const suggestions = gameState.getShoppingSuggestions ? gameState.getShoppingSuggestions() : [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Supply Shop" className="shop-menu">
            <div className="shop-header">
                <div className="shop-cash">Funds: <span id="shop-cash-display">${cash.toFixed(2)}</span></div>
            </div>

            <div className="shop-tabs">
                <button
                    className={`tab-btn ${activeTab === 'supplies' ? 'active' : ''}`}
                    onClick={() => setActiveTab('supplies')}
                >
                    Supplies
                </button>
                <button
                    className={`tab-btn ${activeTab === 'upgrades' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upgrades')}
                >
                    Upgrades
                </button>
            </div>

            <div className="shop-content" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {activeTab === 'supplies' && (
                    <div className="shop-items">
                        {/* Smart Suggestions */}
                        {suggestions.length > 0 && (
                            <div className="shop-suggestions" style={{ marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255, 215, 0, 0.1)', border: '1px dashed gold', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: 'gold' }}>💡 Suggestions</h4>
                                {suggestions.map((s, i) => (
                                    <div key={i} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                        {s.message}
                                    </div>
                                ))}
                            </div>
                        )}

                        {SHOP_ITEMS.map(item => (
                            <div key={item.key} className="shop-item">
                                <div className="icon">{item.icon}</div>
                                <div className="details">
                                    <h3>{item.name}</h3>
                                    <p>{item.desc}</p>
                                </div>
                                <button
                                    className="btn buy"
                                    onClick={() => handleBuy(item.key, item.amount)}
                                    disabled={cash < item.cost}
                                >
                                    Buy
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'upgrades' && (
                    <div className="shop-items">
                        {UPGRADES.map(upgrade => {
                            const isOwned = upgrades.includes(upgrade.id);
                            const isLocked = stats.reputation < upgrade.rep;
                            const canAfford = cash >= upgrade.cost;

                            return (
                                <div key={upgrade.id} className={`shop-item ${isOwned ? 'owned' : ''} ${isLocked ? 'locked' : ''}`}>
                                    <div className="icon">{upgrade.icon}</div>
                                    <div className="details">
                                        <h3>{upgrade.name}</h3>
                                        <p>{upgrade.desc}</p>
                                        <p className="cost">
                                            {isOwned ? 'Purchased' : `$${upgrade.cost} • ${upgrade.rep} Rep`}
                                        </p>
                                    </div>
                                    <button
                                        className="btn buy"
                                        onClick={() => buyUpgrade(upgrade.id)}
                                        disabled={isOwned || isLocked || !canAfford}
                                    >
                                        {isOwned ? 'Owned' : (isLocked ? 'Locked' : 'Buy')}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ShopModal;
