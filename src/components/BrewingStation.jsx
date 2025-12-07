export const BrewingVisuals = ({ gameState }) => {
    const { mode, step } = gameState.brewingState;

    // Helper for coffee state class specifically
    const getCoffeeStateClass = () => {
        if (step >= 4) return 'state-plunged';
        if (step >= 3) return 'state-stirred';
        if (step >= 2) return 'state-water';
        if (step >= 1) return 'state-ground';
        return '';
    };

    return (
        <div className="brewing-station">
            {/* Station Visuals */}
            <div className="station-area">
                {mode === 'coffee' && (
                    <div className={`station ${getCoffeeStateClass()}`}>
                        <div className={`hand-grinder ${step === 0 ? 'grinding' : ''}`}>
                            <div className="handle"></div>
                        </div>
                        <div className="aeropress">
                            <div className="chamber">
                                <div className={`contents`}></div>
                            </div>
                            <div className="filter-cap"></div>
                            <div className={`plunger ${step >= 4 ? 'plunged' : ''}`}></div>
                        </div>
                        <div className={`kettle ${step === 1 ? 'pouring' : ''}`}></div>
                        <div className={`cup ${step >= 4 ? 'filled' : ''}`}>
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
    const { mode, step } = gameState.brewingState;

    return (
        <div id="controls-area" className="controls-area">
            {mode === 'coffee' && (
                <div id="coffee-controls" className="control-group">
                    <button className="btn" onClick={() => handleBrewAction('GRIND')} disabled={step > 0}>Grind Beans</button>
                    <div className="arrow">→</div>
                    <button className="btn" onClick={() => handleBrewAction('ADD_WATER')} disabled={step !== 1}>Add Water</button>
                    <div className="arrow">→</div>
                    <button className="btn" onClick={() => handleBrewAction('STIR')} disabled={step > 2}>Stir</button>
                    <div className="arrow">→</div>
                    <button className="btn" onClick={() => handleBrewAction('PLUNGE')} disabled={step > 3}>Plunge</button>
                    <div className="arrow">→</div>
                    <button
                        id="btn-serve-coffee"
                        className={`btn ${step === 4 ? '' : 'disabled'}`}
                        onClick={performServe}
                    >
                        Serve Coffee
                    </button>
                    <button className="btn nav" onClick={() => dialogue.triggerGreeting(gameState.currentCustomer, gameState.weather)} disabled={!gameState.currentCustomer}>Talk</button>
                </div>
            )}

            {mode === 'matcha' && (
                <div id="matcha-controls" className="control-group">
                    <button className="btn" onClick={() => handleBrewAction('SIFT')} disabled={step > 0}>Sift Powder</button>
                    <div className="arrow">→</div>
                    <button className="btn" onClick={() => handleBrewAction('ADD_WATER')} disabled={step !== 1}>Add Water</button>
                    <div className="arrow">→</div>
                    <button className="btn" onClick={() => handleBrewAction('WHISK')} disabled={step !== 2}>Whisk</button>
                    <div className="arrow">→</div>
                    <button
                        id="btn-serve-matcha"
                        className={`btn ${step === 3 ? '' : 'disabled'}`}
                        onClick={performServe}
                    >
                        Serve Matcha
                    </button>
                    <button className="btn nav" onClick={() => dialogue.triggerGreeting(gameState.currentCustomer, gameState.weather)} disabled={!gameState.currentCustomer}>Talk</button>
                </div>
            )}

            {mode === 'espresso' && (
                <div id="espresso-controls" className="control-group">
                    <button className="btn" onClick={() => handleBrewAction('GRIND')} disabled={step > 0}>Grind</button>
                    <div className="arrow">→</div>
                    <button className="btn" onClick={() => handleBrewAction('TAMP')} disabled={step !== 1}>Tamp</button>
                    <div className="arrow">→</div>
                    <button className="btn" onClick={() => handleBrewAction('PULL_SHOT')} disabled={step !== 2}>Pull Shot</button>
                    <div className="arrow">→</div>
                    <button className="btn" onClick={() => handleBrewAction('STEAM_MILK')} disabled={step !== 3}>Steam Milk</button>
                    <div className="arrow">→</div>
                    <button className="btn" onClick={() => handleBrewAction('POUR')} disabled={step !== 4}>Pour Art</button>
                    <div className="arrow">→</div>
                    <button
                        id="btn-serve-espresso"
                        className={`btn ${step === 5 ? '' : 'disabled'}`}
                        onClick={performServe}
                    >
                        Serve Espresso
                    </button>
                    <button className="btn nav" onClick={() => dialogue.triggerGreeting(gameState.currentCustomer, gameState.weather)} disabled={!gameState.currentCustomer}>Talk</button>
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
