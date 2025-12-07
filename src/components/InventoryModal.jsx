import React, { useState } from 'react';
import Modal from './Modal';

const ITEM_INFO = {
    beans_standard: { name: 'Standard Beans', icon: '🫘', unit: 'g' },
    beans_premium: { name: 'Premium Beans', icon: '✨', unit: 'g' },
    matcha_powder: { name: 'Matcha Powder', icon: '🍃', unit: 'g' },
    water: { name: 'Water', icon: '💧', unit: 'ml' },
    milk: { name: 'Milk', icon: '🥛', unit: 'ml' },
    cups: { name: 'Cups', icon: '🥤', unit: 'pcs' },
    filters: { name: 'Filters', icon: '📄', unit: 'pcs' }
};

const InventoryModal = ({ isOpen, onClose, gameState }) => {
    const [activeTab, setActiveTab] = useState('items');
    const { inventory, purchaseHistory } = gameState;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Inventory" className="inventory-menu">
            <div className="shop-tabs">
                <button
                    className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
                    onClick={() => setActiveTab('items')}
                >
                    Items
                </button>
                <button
                    className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    Stats
                </button>
            </div>

            <div className="shop-content" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {activeTab === 'items' && (
                    <div className="inventory-grid">
                        {Object.entries(inventory).map(([key, amount]) => {
                            const info = ITEM_INFO[key];
                            if (!info) return null; // Skip unknown items
                            if (amount <= 0 && !['beans_standard', 'water', 'cups'].includes(key)) return null; // Hide some empty items

                            return (
                                <div key={key} className="inventory-item">
                                    <div className="icon" style={{ fontSize: '2rem' }}>{info.icon}</div>
                                    <div className="details" style={{ textAlign: 'center' }}>
                                        <h3 style={{ fontSize: '1rem', margin: '0.5rem 0' }}>{info.name}</h3>
                                        <p style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
                                            {amount}{info.unit}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="inventory-stats">
                        {gameState.resourceUsage && (
                            <div className="usage-stats" style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                <h3>Resources Consumed</h3>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {Object.entries(gameState.resourceUsage).map(([res, data]) => (
                                        <li key={res} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{res.replace('_', ' ')}</span>
                                            <span>{data.used} units</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <h3>Purchase History</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {purchaseHistory && purchaseHistory.length > 0 ? (
                                [...purchaseHistory].reverse().slice(0, 20).map((p, i) => (
                                    <li key={i} style={{ padding: '0.5rem', borderBottom: '1px dashed var(--border-color)' }}>
                                        Day {p.day}: Bought {p.quantity} {p.item} for ${p.cost.toFixed(2)}
                                    </li>
                                ))
                            ) : (
                                <li>No purchases yet.</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default InventoryModal;
