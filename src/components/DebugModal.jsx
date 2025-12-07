import React, { useState } from 'react';
import Modal from './Modal';

const DebugModal = ({ gameState, startGame, advanceTime, isOpen, onClose }) => {
    // Local state for collapsed sections to manage vertical space
    const [showLogs, setShowLogs] = useState(false);
    const [showState, setShowState] = useState(false);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Debug Controls">
            <div style={{ padding: '0 10px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                    <button className="btn nav" onClick={() => startGame('DebugPlayer')}>Start Game</button>
                    <button className="btn nav" onClick={() => advanceTime(10)}>+10m</button>
                    <button className="btn nav" onClick={() => advanceTime(60)}>+1h</button>
                </div>

                <div className="menu-group" style={{ background: '#eee', padding: '10px', borderRadius: '4px' }}>
                    <div><strong>Time:</strong> {Math.floor(gameState.minutesElapsed / 60) + 5}:{String(gameState.minutesElapsed % 60).padStart(2, '0')}</div>
                    <div><strong>Started:</strong> {gameState.gameStarted ? 'Yes' : 'No'}</div>
                    <div><strong>Customer:</strong> {gameState.currentCustomer ? gameState.currentCustomer.name : 'None'}</div>
                    {gameState.currentCustomer && (
                        <div><strong>Patience:</strong> {gameState.currentCustomer.patience.toFixed(1)}</div>
                    )}
                </div>

                <div className="menu-group">
                    <button
                        className="btn"
                        style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}
                        onClick={() => setShowLogs(!showLogs)}
                    >
                        {showLogs ? 'Hide Logs' : 'Show Logs'}
                    </button>

                    {showLogs && (
                        <div style={{ maxHeight: '200px', overflowY: 'auto', background: '#f5f5f5', padding: '5px', borderRadius: '4px', marginTop: '5px', border: '1px solid #ccc' }}>
                            {gameState.logs && gameState.logs.map((log, i) => (
                                <div key={i} style={{
                                    color: log.type === 'error' ? 'red' : log.type === 'success' ? 'green' : 'black',
                                    borderBottom: '1px solid #ddd',
                                    fontSize: '0.8rem',
                                    padding: '2px 0'
                                }}>
                                    <span style={{ color: '#888' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="menu-group">
                    <button
                        className="btn"
                        style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}
                        onClick={() => setShowState(!showState)}
                    >
                        {showState ? 'Hide Full State' : 'Show Full State'}
                    </button>

                    {showState && (
                        <pre style={{
                            maxHeight: '300px',
                            overflow: 'auto',
                            background: '#333',
                            color: '#0f0',
                            padding: '10px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            marginTop: '5px'
                        }}>
                            {JSON.stringify(gameState, null, 2)}
                        </pre>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default DebugModal;
