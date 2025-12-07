import Tooltip from './Tooltip';
import weatherSunny from '../assets/weather_sunny.png';
import weatherRainy from '../assets/weather_rainy.png';

const HUD = ({ gameState, toggleModal }) => {
    const { time, cash, stats, weather, minutesElapsed } = gameState;

    // Calculate display time
    const totalMinutes = minutesElapsed || 0;
    let hours = Math.floor(totalMinutes / 60) + 5;
    const minutes = totalMinutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;
    const timeString = `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;

    // Icon style for weather only
    const iconStyle = { width: '32px', height: '32px', marginRight: '5px' };

    return (
        <div id="hud" className="hud-horizontal" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tooltip text="View Pantry" placement="bottom">
                <div className="hud-item" onClick={() => toggleModal('inventory')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <span className="hud-icon" style={{ fontSize: '24px', marginRight: '5px' }}>🎒</span>
                    <span className="hud-value">Pantry</span>
                </div>
            </Tooltip>

            <Tooltip text="Open Supplier" placement="bottom">
                <div className="hud-item" onClick={() => toggleModal('shop')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <span className="hud-icon" style={{ fontSize: '24px', marginRight: '5px' }}>🛒</span>
                    <span className="hud-value">Supplier</span>
                </div>
            </Tooltip>

            <Tooltip text="Current Time" placement="bottom">
                <div className="hud-item" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="hud-icon" style={{ fontSize: '24px', marginRight: '5px' }}>⏰</span>
                    <span id="time-display">{timeString}</span>
                </div>
            </Tooltip>

            <Tooltip text="Current Funds" placement="bottom">
                <div className="hud-item" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="hud-icon" style={{ fontSize: '24px', marginRight: '5px' }}>💵</span>
                    <span id="cash-display">${cash.toFixed(2)}</span>
                </div>
            </Tooltip>

            <Tooltip text="Reputation Level" placement="bottom">
                <div className="hud-item" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="hud-icon" style={{ fontSize: '24px', marginRight: '5px' }}>⭐</span>
                    <span id="rep-display">{stats.reputation} ★</span>
                </div>
            </Tooltip>

            <Tooltip text="Customer Satisfaction" placement="bottom">
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

            <Tooltip text="Current Weather" placement="bottom">
                <div className="hud-item" style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={weather === 'rainy' ? weatherRainy : weatherSunny}
                        alt={weather}
                        style={iconStyle}
                    />
                </div>
            </Tooltip>
        </div>
    );
};

export default HUD;
