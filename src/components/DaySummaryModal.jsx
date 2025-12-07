import React from 'react';
import Modal from './Modal';

const DaySummaryModal = ({ isOpen, stats, onStartNextDay }) => {
    return (
        <Modal isOpen={isOpen} onClose={() => { }} title="Day Complete!">
            <div className="summary-stats">
                <div className="stat-row">
                    <span>Total Earnings:</span>
                    <span className="hud-value">${stats.dailyEarnings.toFixed(2)}</span>
                </div>
                <div className="stat-row">
                    <span>Customers Served:</span>
                    <span className="hud-value">{stats.customersServed}</span>
                </div>
                <div className="stat-row">
                    <span>Tips Earned:</span>
                    <span className="hud-value">${stats.tipsEarned.toFixed(2)}</span>
                </div>
                <div className="stat-row">
                    <span>Reputation:</span>
                    <span className="hud-value">{stats.reputation} ★</span>
                </div>
            </div>
            <div className="menu-group" style={{ marginTop: '2rem' }}>
                <button className="btn action" style={{ width: '100%' }} onClick={onStartNextDay}>
                    Start Next Day
                </button>
            </div>
        </Modal>
    );
};

export default DaySummaryModal;
