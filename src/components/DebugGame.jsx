import React from 'react';
import { useGame } from '../hooks/useGame';

const DebugGame = () => {
    const { gameState, startGame, advanceTime } = useGame();

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>Debug Game</h1>
            <button onClick={() => startGame('DebugPlayer')}>Start Game</button>
            <button onClick={() => advanceTime(10)}>Advance 10m</button>

            <hr />

            <div>
                <strong>Time:</strong> {gameState.minutesElapsed}m ({Math.floor(gameState.minutesElapsed / 60) + 5}:{gameState.minutesElapsed % 60})
            </div>
            <div>
                <strong>Game Started:</strong> {gameState.gameStarted ? 'Yes' : 'No'}
            </div>
            <div>
                <strong>Customer:</strong> {gameState.currentCustomer ? gameState.currentCustomer.name : 'None'}
            </div>
            {gameState.currentCustomer && (
                <div>
                    <strong>Patience:</strong> {gameState.currentCustomer.patience.toFixed(1)}
                </div>
            )}

            <hr />
            <pre>{JSON.stringify(gameState, null, 2)}</pre>
        </div>
    );
};

export default DebugGame;
