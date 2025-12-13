import Tooltip from './Tooltip';
import weatherSunny from '../assets/icons-weather/weather_sunny.png';
import weatherRainy from '../assets/icons-weather/weather_rainy.png';
import weatherCloudy from '../assets/icons-weather/weather_cloudy.png';

const HUD = ({ gameState, toggleModal }) => {
    const { time, cash, stats, weather, minutesElapsed } = gameState;

    // Use time string from game state (already formatted in useTime)
    const timeString = time;

    // Weather Icons
    const weatherIcons = {
        sunny: weatherSunny,
        rainy: weatherRainy,
        cloudy: weatherCloudy
    };

    return (
        <div id="hud" className="hud-horizontal">
            <Tooltip text="Pantry: View your ingredients and inventory" placement="bottom">
                <div className="hud-item" onClick={() => toggleModal('inventory')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <span className="hud-icon" style={{ fontSize: '24px', marginRight: '5px' }}>🎒</span>
                    <span className="hud-value">Pantry</span>
                </div>
            </Tooltip>

            <Tooltip text="Supplier: Buy ingredients and upgrades" placement="bottom">
                <div className="hud-item" onClick={() => toggleModal('shop')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <span className="hud-icon" style={{ fontSize: '24px', marginRight: '5px' }}>🛒</span>
                    <span className="hud-value">Supplier</span>
                </div>
            </Tooltip>

            <Tooltip text="Calendar: View game calendar" placement="bottom">
                <div className="hud-item" onClick={() => toggleModal('calendar')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <span className="hud-icon" style={{ fontSize: '24px', marginRight: '5px' }}>🗓️</span>
                    <span className="hud-value">Calendar</span>
                </div>
            </Tooltip>

            <Tooltip text="Current in-game time" placement="bottom">
                <div className="hud-item" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="hud-icon" style={{ fontSize: '24px', marginRight: '5px' }}>⏰</span>
                    <span id="time-display">{timeString}</span>
                </div>
            </Tooltip>

            <Tooltip text="Funds: Current money available (Click for Financials)" placement="bottom">
                <div className="hud-item" onClick={() => toggleModal('financials')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <span className="hud-icon" style={{ fontSize: '24px', marginRight: '5px' }}>💵</span>
                    <span id="cash-display">${cash.toFixed(2)}</span>
                </div>
            </Tooltip>

            <Tooltip text="Reputation: Your current fame (Click for Unlocks)" placement="bottom">
                <div className="hud-item" onClick={() => toggleModal('reputation')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <span className="hud-icon" style={{ fontSize: '24px', marginRight: '5px' }}>⭐</span>
                    <span id="rep-display">{stats.reputation} ★</span>
                </div>
            </Tooltip>

            <Tooltip text="Customers: View customer roster and satisfaction" placement="bottom">
                <div className="hud-item" onClick={() => toggleModal('customers')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <span className="hud-icon" style={{ fontSize: '24px', marginRight: '5px' }}>😊</span>
                    <span className="hud-value">Customers</span>
                </div>
            </Tooltip>

            {/* Weather */}
            <Tooltip text={`Weather: ${weather.charAt(0).toUpperCase() + weather.slice(1)}`} placement="bottom">
                <div className="hud-item" onClick={() => toggleModal('calendar')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <img
                        src={weatherIcons[weather] || weatherIcons.sunny}
                        alt={weather}
                        style={{ width: '32px', height: '32px', marginRight: '5px', imageRendering: 'pixelated' }}
                    />
                    <span id="weather-display" style={{ textTransform: 'capitalize' }}>{weather}</span>
                </div>
            </Tooltip>
        </div>
    );
};

export default HUD;
