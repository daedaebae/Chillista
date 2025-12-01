import React from 'react';
import { useGame } from '../hooks/useGame';

const HUD = () => {
    const { gameState } = useGame();
    const { time, cash, stats, weather, minutesElapsed } = gameState;

    // Calculate display time
    const totalMinutes = minutesElapsed || 0;
    let hours = Math.floor(totalMinutes / 60) + 5;
    const minutes = totalMinutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;
    const timeString = `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;

    return (
        <div id="hud" className="hud">
            <div className="hud-item">
                <span className="hud-icon">⏰</span>
                <span id="time-display">{timeString}</span>
            </div>
            <div className="hud-item">
                <span className="hud-icon">💵</span>
                <span id="cash-display">${cash.toFixed(2)}</span>
            </div>
            <div className="hud-item">
                <span className="hud-icon">⭐</span>
                <span id="rep-display">{stats.reputation} ★</span>
            </div>
            <div className="hud-item">
                <span className="hud-icon">
                    {weather === 'rainy' ? '🌧️' : '☀️'}
                </span>
            </div>
        </div>
    );
};

export default HUD;
