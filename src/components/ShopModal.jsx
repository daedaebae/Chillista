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

const SKINS = [
    { key: 'SKIN_WOOD', name: 'Rustic Wood Skin', icon: '🪵', desc: 'A warm, natural look.', cost: 50.00 },
    { key: 'SKIN_METAL', name: 'Industrial Metal Skin', icon: '⚙️', desc: 'Sleek and modern.', cost: 150.00 },
    { key: 'SKIN_MARBLE', name: 'Luxury Marble Skin', icon: '🏛️', desc: 'Premium elegance.', cost: 200.00 }
];

const COUNTERS = [
    { key: 'COUNTER_WOOD', name: 'Wooden Counter', icon: '🪑', desc: 'Dark wood grain.', cost: 100.00 },
    { key: 'COUNTER_MARBLE', name: 'Marble Counter', icon: '🏛️', desc: 'Clean white marble.', cost: 500.00 }
];

const ShopModal = ({ isOpen, onClose, gameState, handleBuy, buyUpgrade }) => {
    const [activeTab, setActiveTab] = useState('supplies');
    const { cash, stats, upgrades, decorations, activeSkin, activeCounter } = gameState; // Added activeCounter

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
                <button
                    className={`tab-btn ${activeTab === 'decors' ? 'active' : ''}`}
                    onClick={() => setActiveTab('decors')}
                >
                    Decorations
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

                        {SHOP_ITEMS.map(item => {
                            const canAfford = cash >= item.cost;
                            return (
                                <div key={item.key} className={`shop-item ${canAfford ? '' : 'disabled'}`}>
                                    <div className="icon">{item.icon}</div>
                                    <div className="details">
                                        <h3>{item.name}</h3>
                                        <p>{item.desc}</p>
                                    </div>
                                    <button
                                        className="btn buy"
                                        onClick={() => handleBuy(item.key, item.amount)}
                                        disabled={!canAfford}
                                        style={!canAfford ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                    >
                                        Buy
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'upgrades' && (
                    <div className="shop-items">
                        {UPGRADES.map(upgrade => {
                            const isOwned = upgrades.includes(upgrade.id);
                            const isLocked = stats.reputation < upgrade.rep;
                            const canAfford = cash >= upgrade.cost;

                            return (
                                <div key={upgrade.id} className={`shop-item ${isOwned ? 'owned' : ''} ${isLocked ? 'locked' : ''} ${!canAfford && !isOwned ? 'disabled' : ''}`}>
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
                                        {isOwned ? 'Owned' : (isLocked ? 'Locked' : (!canAfford ? 'Too Expensive' : 'Buy'))}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'decors' && (
                    <div className="shop-items">
                        <div style={{ padding: '0.5rem', fontStyle: 'italic', textAlign: 'center', opacity: 0.8 }}>
                            Customize your cart & workspace!
                        </div>

                        <h4 style={{ margin: '10px 0 5px', borderBottom: '1px solid #ccc' }}>Cart Skins</h4>
                        {SKINS.map(skin => {
                            const skinId = skin.key.toLowerCase().replace('_', '-');
                            const isEquipped = activeSkin === skinId;
                            const isOwned = decorations.includes(skinId);
                            const canAfford = cash >= skin.cost;

                            return (
                                <div key={skin.key} className={`shop-item ${isEquipped ? 'equipped' : ''} ${isOwned ? 'owned' : ''} ${!canAfford && !isOwned ? 'disabled' : ''}`}>
                                    <div className="icon">{skin.icon}</div>
                                    <div className="details">
                                        <h3>{skin.name}</h3>
                                        <p>{skin.desc}</p>
                                        {isOwned ? null : <p className="cost">${skin.cost.toFixed(2)}</p>}
                                    </div>
                                    <button
                                        className="btn buy"
                                        onClick={() => handleBuy(skin.key, 1)}
                                        disabled={isEquipped || (isOwned ? false : !canAfford)}
                                        style={isEquipped ? { background: '#8d6e63', borderColor: '#5d4037' } : (!isOwned && !canAfford ? { opacity: 0.5, cursor: 'not-allowed' } : {})}
                                    >
                                        {isEquipped ? 'Equipped' : (isOwned ? 'Equip' : 'Buy')}
                                    </button>
                                </div>
                            );
                        })}

                        <h4 style={{ margin: '15px 0 5px', borderBottom: '1px solid #ccc' }}>Workspace Upgrades</h4>
                        {COUNTERS.map(item => {
                            const itemId = item.key.toLowerCase();
                            const isEquipped = activeCounter === itemId;
                            const isOwned = decorations.includes(itemId);
                            const canAfford = cash >= item.cost;

                            return (
                                <div key={item.key} className={`shop-item ${isEquipped ? 'equipped' : ''} ${isOwned ? 'owned' : ''} ${!canAfford && !isOwned ? 'disabled' : ''}`}>
                                    <div className="icon">{item.icon}</div>
                                    <div className="details">
                                        <h3>{item.name}</h3>
                                        <p>{item.desc}</p>
                                        {isOwned ? null : <p className="cost">${item.cost.toFixed(2)}</p>}
                                    </div>
                                    <button
                                        className="btn buy"
                                        onClick={() => handleBuy(item.key, 1)}
                                        disabled={isEquipped || (isOwned ? false : !canAfford)}
                                        style={isEquipped ? { background: '#8d6e63', borderColor: '#5d4037' } : (!isOwned && !canAfford ? { opacity: 0.5, cursor: 'not-allowed' } : {})}
                                    >
                                        {isEquipped ? 'Equipped' : (isOwned ? 'Equip' : 'Buy')}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Modal >
    );
};

export default ShopModal;
