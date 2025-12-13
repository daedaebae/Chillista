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
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '-20px' }}>
                        <img
                            src={currentCustomer.avatar}
                            id="customer-portrait"
                            className="avatar customer"
                            alt={currentCustomer.name}
                            style={{ opacity: 1, marginLeft: 0 }}
                        />

                        {/* Wait Timer & Satisfaction Bubble */}
                        <div className={`wait-timer ${currentCustomer.patience < 2 ? 'blink-urgent' : ''}`} style={{
                            position: 'absolute',
                            top: '5px', // Sit slightly down over the top frame edge "covering" it
                            left: '50%',
                            transform: 'translate(-50%, -100%)', // Centered and sitting above/on top
                            background: '#fff',
                            border: currentCustomer.patience < 5 ? '2px solid red' : (currentCustomer.patience < 10 ? '2px solid orange' : '2px solid #5d4037'),
                            borderRadius: '16px',
                            padding: '4px 12px',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            color: '#3e2723',
                            zIndex: 100,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease'
                        }}>
                            {/* Satisfaction Emoji Meter */}
                            <span className="satisfaction-emoji" role="img" aria-label="satisfaction" style={{ fontSize: '1.2rem' }}>
                                {currentCustomer.satisfaction >= 80 ? '🤩' :
                                    (currentCustomer.satisfaction >= 50 ? '😊' :
                                        (currentCustomer.satisfaction >= 25 ? '😐' : '😡'))}
                            </span>

                            <span style={{ color: '#5d4037' }}>{currentCustomer.name}</span>
                            <div style={{ width: '1px', height: '14px', background: '#ccc' }}></div>
                            <span className={currentCustomer.patience < 5 ? 'text-danger' : ''}>
                                ⏱ {Math.floor(currentCustomer.patience)}m
                            </span>
                        </div>
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


