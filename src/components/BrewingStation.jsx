import Tooltip from './Tooltip';

export const BrewingVisuals = ({ gameState }) => {
    // ... (unchanged)
    const { mode, step, isBoiling } = gameState.brewingState;
    // Extract activeSkin from inventoryState (flat in gameState)
    const activeSkin = gameState.activeSkin || 'skin-default';

    // Helper for coffee state class specifically
    const getCoffeeStateClass = () => {
        if (step >= 5) return 'state-plunged';
        if (step >= 4) return 'state-stirred';
        if (step >= 3) return 'state-water';
        if (step >= 2) return 'state-ground';
        return '';
    };

    return (
        <div className={`brewing-station ${activeSkin}`}>
            {/* Station Visuals */}
            <div className="station-area">
                {mode === 'coffee' && (
                    <div className={`station ${getCoffeeStateClass()}`}>
                        <div className={`hand-grinder ${step === 1 ? 'grinding' : ''}`}>
                            <div className="handle"></div>
                        </div>
                        <div className="aeropress">
                            <div className="chamber">
                                <div className={`contents`}></div>
                                <div className="filter-cap"></div> {/* Real Filter Cap */}
                            </div>
                            <div className={`plunger ${step >= 5 ? 'plunged' : ''}`}>
                                <div className="rubber-seal"></div> {/* Seal attached to plunger */}
                            </div>
                        </div>
                        <div className={`kettle ${isBoiling ? 'boiling' : (step === 2 ? 'pouring' : '')}`}></div>
                        <div className={`cup ${step >= 5 ? 'filled' : ''}`}>
                            <div className="steam-container">
                                <div className="steam-puff"></div>
                                <div className="steam-puff delay-1"></div>
                                <div className="steam-puff delay-2"></div>
                            </div>
                        </div>
                    </div>
                )}

                {mode === 'matcha' && (
                    <div id="matcha-station" className="station">
                        <div className={`tea-powder ${step === 1 ? 'grinding' : ''}`}></div>
                        <div className="bowl">
                            <div className={`matcha-mix ${step >= 2 ? '' : 'hidden'} ${step === 3 ? 'frothy' : ''}`}></div>
                        </div>
                        <div className={`whisk ${step === 3 ? 'whisking' : ''}`}></div>
                        <div className={`kettle ${step === 2 ? 'pouring' : ''}`}></div>
                        <div className={`cup ${step >= 3 ? 'filled' : ''}`}></div>
                    </div>
                )}

                {mode === 'espresso' && (
                    <div id="espresso-station" className="station">
                        <div className={`electric-grinder ${step === 1 ? 'grinding' : ''}`}></div>
                        <div className="portafilter">
                            <div className={`coffee-puck ${step >= 1 ? '' : 'hidden'} ${step >= 2 ? 'tamped' : ''}`}></div>
                        </div>
                        <div className="espresso-machine">
                            <div className="group-head"></div>
                        </div>
                        <div className={`milk-jug ${step === 4 ? 'steaming' : ''}`}></div>
                        <div className={`cup ${step >= 3 ? 'filling' : ''} ${step >= 5 ? 'latte-art' : ''}`}></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const BrewingControls = ({ gameState, handleBrewAction, performServe, toggleModal, dialogue }) => {
    const { mode, step, isBoiling } = gameState.brewingState;

    return (
        <div id="controls-area" className="controls-area">
            {mode === 'coffee' && (
                <div id="coffee-controls" className="control-group">
                    <Tooltip text="Heat water to 200°F">
                        <button className="btn" onClick={() => handleBrewAction('BOIL')}>
                            {isBoiling ? 'Boiling...' : 'Boil Water'}
                        </button>
                    </Tooltip>
                    <Tooltip text="Coarsely grind fresh beans">
                        <button className="btn" onClick={() => handleBrewAction('GRIND')}>Grind Beans</button>
                    </Tooltip>
                    <Tooltip text="Pour hot water">
                        <button className="btn" onClick={() => handleBrewAction('ADD_WATER')}>Add Water</button>
                    </Tooltip>
                    <Tooltip text="Agitate grounds">
                        <button className="btn" onClick={() => handleBrewAction('STIR')}>Stir</button>
                    </Tooltip>
                    <Tooltip text="Press coffee">
                        <button className="btn" onClick={() => handleBrewAction('PLUNGE')}>Plunge</button>
                    </Tooltip>
                    <Tooltip text="Serve to customer">
                        <button
                            id="btn-serve-coffee"
                            className="btn action"
                            onClick={performServe}
                        >
                            Serve Coffee
                        </button>
                    </Tooltip>
                    <Tooltip text="Chat with customer">
                        <button className="btn nav" onClick={() => dialogue.triggerGreeting(gameState.currentCustomer, gameState.weather)} disabled={!gameState.currentCustomer}>Talk</button>
                    </Tooltip>
                </div>
            )}

            {mode === 'matcha' && (
                <div id="matcha-controls" className="control-group">
                    <Tooltip text="Prepare matcha powder">
                        <button className="btn" onClick={() => handleBrewAction('SIFT')}>Sift Powder</button>
                    </Tooltip>
                    <Tooltip text="Add hot water">
                        <button className="btn" onClick={() => handleBrewAction('ADD_WATER')}>Add Water</button>
                    </Tooltip>
                    <Tooltip text="Froth the matcha">
                        <button className="btn" onClick={() => handleBrewAction('WHISK')}>Whisk</button>
                    </Tooltip>
                    <Tooltip text="Serve to customer">
                        <button
                            id="btn-serve-matcha"
                            className="btn action"
                            onClick={performServe}
                        >
                            Serve Matcha
                        </button>
                    </Tooltip>
                    <Tooltip text="Chat with customer">
                        <button className="btn nav" onClick={() => dialogue.triggerGreeting(gameState.currentCustomer, gameState.weather)} disabled={!gameState.currentCustomer}>Talk</button>
                    </Tooltip>
                </div>
            )}

            {mode === 'espresso' && (
                <div id="espresso-controls" className="control-group">
                    <Tooltip text="Grind coffee beans">
                        <button className="btn" onClick={() => handleBrewAction('GRIND')}>Grind</button>
                    </Tooltip>
                    <Tooltip text="Compress coffee bed">
                        <button className="btn" onClick={() => handleBrewAction('TAMP')}>Tamp</button>
                    </Tooltip>
                    <Tooltip text="Extract espresso shot">
                        <button className="btn" onClick={() => handleBrewAction('PULL_SHOT')}>Pull Shot</button>
                    </Tooltip>
                    <Tooltip text="Texture the milk">
                        <button className="btn" onClick={() => handleBrewAction('STEAM_MILK')}>Steam Milk</button>
                    </Tooltip>
                    <Tooltip text="Create latte art">
                        <button className="btn" onClick={() => handleBrewAction('POUR')}>Pour Art</button>
                    </Tooltip>
                    <Tooltip text="Serve to customer">
                        <button
                            id="btn-serve-espresso"
                            className="btn action"
                            onClick={performServe}
                        >
                            Serve Espresso
                        </button>
                    </Tooltip>
                    <Tooltip text="Chat with customer">
                        <button className="btn nav" onClick={() => dialogue.triggerGreeting(gameState.currentCustomer, gameState.weather)} disabled={!gameState.currentCustomer}>Talk</button>
                    </Tooltip>
                </div>
            )}

            {/* Mode Switcher - Only if upgrades are unlocked */}
            {gameState.upgrades && gameState.upgrades.some(u => u.startsWith('mode_')) && (
                <div style={{ marginTop: '10px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Tooltip text="Change station">
                        <button className="btn nav" onClick={() => toggleModal('mode')}>Switch Mode</button>
                    </Tooltip>
                </div>
            )}
        </div>
    );
};

// Default export for backward compatibility if needed, but we'll switch to named
const BrewingStation = (props) => (
    <>
        <BrewingVisuals {...props} />
        <BrewingControls {...props} />
    </>
);
export default BrewingStation;
