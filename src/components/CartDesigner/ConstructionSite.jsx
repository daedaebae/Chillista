import React, { useState, useEffect } from 'react';
import './CartDesigner.css';

const ConstructionSite = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [energy, setEnergy] = useState(10);

    // Auto-recover energy
    useEffect(() => {
        const timer = setInterval(() => {
            setEnergy(prev => Math.min(prev + 1, 10));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleHammer = () => {
        if (progress >= 100) return;
        if (energy > 0) {
            setEnergy(prev => prev - 1);
            setProgress(prev => Math.min(prev + 10, 100)); // 10 clicks to build
            // Visual effect could happen here
        }
    };

    useEffect(() => {
        if (progress >= 100) {
            setTimeout(() => {
                onComplete({ quality: 'Standard' }); // Pass build stats
            }, 500);
        }
    }, [progress, onComplete]);

    return (
        <div className="construction-site">
            <h2>Under Construction</h2>
            <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>

            <div style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
                Energy: {'⚡'.repeat(energy)}
            </div>

            <button
                className="action-btn"
                onClick={handleHammer}
                disabled={progress >= 100 || energy <= 0}
                style={{ opacity: energy <= 0 ? 0.5 : 1 }}
            >
                {progress >= 100 ? 'Cart Complete!' : 'HAMMER!'}
            </button>
            <p style={{ marginTop: '10px', fontSize: '0.9rem', opacity: 0.8 }}>
                (Click to Build)
            </p>
        </div>
    );
};

export default ConstructionSite;
