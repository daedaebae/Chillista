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

            <Tooltip text="Time: Current in-game time" placement="bottom">
                <div className="hud-item" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="hud-icon" style={{ fontSize: '24px', marginRight: '5px' }}>⏰</span>
                    <span id="time-display">{timeString}</span>
                </div>
            </Tooltip>

            <Tooltip text="Funds: Current money available" placement="bottom">
                <div className="hud-item" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="hud-icon" style={{ fontSize: '24px', marginRight: '5px' }}>💵</span>
                    <span id="cash-display">${cash.toFixed(2)}</span>
                </div>
            </Tooltip>

            <Tooltip text="Reputation: Your current fame" placement="bottom">
                <div className="hud-item" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="hud-icon" style={{ fontSize: '24px', marginRight: '5px' }}>⭐</span>
                    <span id="rep-display">{stats.reputation} ★</span>
                </div>
            </Tooltip>

            <Tooltip text="Satisfaction: Current customer mood" placement="bottom">
                <div className="hud-item" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="hud-icon">😊</span>
                    <div className="satisfaction-bar-container" style={{ width: '60px', height: '10px', background: '#333', borderRadius: '5px', marginLeft: '5px', overflow: 'hidden' }}>
                        <div
                            className="satisfaction-bar"
                            style={{
                                width: `${gameState.currentCustomer ? gameState.currentCustomer.satisfaction : 50}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #ff4d4d, #f9cb28, #4dff4d)',
                                transition: 'width 0.3s ease'
                            }}
                        ></div>
                    </div>
                </div>
            </Tooltip>

            {/* Weather */}
            <Tooltip text={`Weather: ${weather.charAt(0).toUpperCase() + weather.slice(1)}`} placement="bottom">
                <div className="hud-item" style={{ display: 'flex', alignItems: 'center' }}>
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
