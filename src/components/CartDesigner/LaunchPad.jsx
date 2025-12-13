import React, { useState } from 'react';
import './CartDesigner.css';

const LaunchPad = ({ onComplete }) => {
    const [cartName, setCartName] = useState('My Coffee Cart');

    const handleLaunch = () => {
        if (!cartName.trim()) return;
        onComplete({ name: cartName });
    };

    return (
        <div className="launch-pad">
            <h2>Ready for Business!</h2>
            <p>Name your coffee cart:</p>
            <input
                type="text"
                className="brand-input"
                value={cartName}
                onChange={(e) => setCartName(e.target.value)}
                maxLength={20}
            />

            <button className="action-btn" onClick={handleLaunch}>
                Launch Grand Opening!
            </button>
        </div>
    );
};

export default LaunchPad;
