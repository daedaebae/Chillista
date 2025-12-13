import React, { useState } from 'react';
import BlueprintSelection from './BlueprintSelection';
import ConstructionSite from './ConstructionSite';
import LaunchPad from './LaunchPad';
import './CartDesigner.css';

/**
 * CartDesigner Component
 * 
 * A mini-game that acts as the prequel to the main Chillista experience.
 * Players design their starting cart, build it via a clicker game,
 * and establish their brand.
 * 
 * Phases:
 * 1. Blueprint: Select archetype (Stats/Visuals).
 * 2. Build: Clicker mechanic to construct the cart.
 * 3. Launch: Finalize name and transition to main game.
 * 
 * @param {Function} onGameStart - Callback to start the main game with design stats.
 */
const CartDesigner = ({ onGameStart }) => {
    const [phase, setPhase] = useState('blueprint'); // blueprint, build, launch
    const [designState, setDesignState] = useState({
        cartType: null, // 'velo', 'hacker', 'luxe'
        cartStats: {},
        funds: 1000,
        debt: 0
    });

    const handleBlueprintSelect = (type, stats) => {
        setDesignState(prev => ({
            ...prev,
            cartType: type,
            cartStats: stats,
            funds: prev.funds - (stats.baseCost || 0)
        }));
        setPhase('build');
    };

    const handleBuildComplete = (buildData) => {
        // Integrate build results
        setPhase('launch');
    };

    const handleLaunch = (launchData) => {
        // Finalize everything and start main game
        const finalData = {
            ...designState,
            ...launchData
        };
        onGameStart(finalData);
    };

    return (
        <div className="cart-designer-container" style={{
            width: '100%', height: '100%',
            background: '#3e2723', color: '#fffaf0',
            display: 'flex', flexDirection: 'column'
        }}>
            <header style={{ padding: '1rem', borderBottom: '2px solid #8b5a2b', textAlign: 'center' }}>
                <h1 style={{ margin: 0 }}>Cart Designer</h1>
                <p style={{ margin: 0, opacity: 0.8 }}>Design & Build Your Station</p>
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                    <span>Funds: ${designState.funds}</span>
                    <span>Debt: ${designState.debt}</span>
                </div>
            </header>

            <div className="designer-content" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {phase === 'blueprint' && <BlueprintSelection onSelect={handleBlueprintSelect} />}
                {phase === 'build' && <ConstructionSite onComplete={handleBuildComplete} />}
                {phase === 'launch' && <LaunchPad onComplete={handleLaunch} />}
            </div>
        </div>
    );
};

export default CartDesigner;
