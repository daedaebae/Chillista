import pixelBarista from '../assets/characters/pixel_barista.png';

export default function CharacterArea({ currentCustomer, minutesElapsed }) {
    // Current Barista Avatar (can be dynamic later)
    const baristaAvatar = pixelBarista;

    // Calculate wait time
    const waitTime = currentCustomer ? (minutesElapsed - currentCustomer.arrivalTime) : 0;

    return (
        <div className="character-area">
            <img src={baristaAvatar} id="barista-avatar" className="avatar barista" alt="Barista" />

            {currentCustomer && (
                <div className="customer-wrapper">
                    <img
                        src={currentCustomer.avatar}
                        id="customer-portrait"
                        className="avatar customer"
                        alt={currentCustomer.name}
                        style={{ opacity: 1 }} // Legacy had 0->1 fade, we'll start visible or add transition class
                    />

                    {/* Wait Timer Overlay */}
                    <div className={`wait-timer ${currentCustomer.patience < 2 ? 'blink-urgent' : ''}`} style={{
                        position: 'absolute',
                        bottom: '80px',
                        right: '-10px',
                        background: '#fff',
                        border: currentCustomer.patience < 5 ? '2px solid red' : (currentCustomer.patience < 10 ? '2px solid orange' : '2px solid #5d4037'),
                        borderRadius: '12px',
                        padding: '2px 8px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        color: currentCustomer.patience < 5 ? '#d32f2f' : (currentCustomer.patience < 10 ? '#f57f17' : '#3e2723'),
                        color: currentCustomer.patience < 5 ? '#d32f2f' : (currentCustomer.patience < 10 ? '#f57f17' : '#3e2723'),
                        zIndex: 100, /* Ensure it is above Brewing Station (22) and Avatars (30) */
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                        <span style={{ color: '#5d4037' }}>{currentCustomer.name}</span>
                        <span>|</span>
                        <span>⏱ {Math.floor(currentCustomer.patience)}m</span>
                    </div>

                    <div id="customer-info-panel" className="customer-info-panel" style={{
                        position: 'absolute',
                        bottom: '120%', // Approximate, adjust as needed based on CSS
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        border: '2px solid #5d4037',
                        textAlign: 'center',
                        minWidth: '150px'
                    }}>
                        <h2 id="customer-name" style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#5d4037' }}>{currentCustomer.name}</h2>
                        <div className="stats-row">
                            <div id="customer-order" style={{ fontStyle: 'italic' }}>"{currentCustomer.order}"</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


