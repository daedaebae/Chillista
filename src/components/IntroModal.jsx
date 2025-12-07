import React, { useState } from 'react';
import Modal from './Modal';

const IntroModal = ({ isOpen, onStart }) => {
    const [step, setStep] = useState('intro'); // 'intro', 'name'
    const [name, setName] = useState('');

    if (!isOpen) return null;

    const handleNext = () => {
        setStep('name');
    };

    const handleSubmit = () => {
        if (name.trim()) {
            localStorage.setItem('introSeen', 'true');
            onStart(name);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="menu-overlay">
            <div className="coffee-menu intro-menu" style={{ maxWidth: '600px' }}>
                {step === 'intro' ? (
                    <>
                        <h2>Chillista (Demo)</h2>
                        <p className="intro-subtitle" style={{ textAlign: 'center', fontSize: '1.2rem', margin: '0 0 1rem 0', fontStyle: 'italic', color: '#8d6e63' }}>
                            A cozy barista simulator.
                        </p>

                        <div className="menu-content">
                            <p>
                                Hating your job isn't uncommon, but you never <strong>hated</strong> it, you just never...
                                <strong> loved </strong> it!
                            </p>
                            <p>
                                You <strong>love</strong> drinking <em style={{ color: '#5d4037' }}>coffee</em>.
                                You <strong>love</strong> making <em style={{ color: '#5d4037' }}> coffee</em>.
                            </p>
                            <p>
                                You saw a bicycle cart for sale and daydreamed of filling it with all you need to brew coffee in the open air.
                                On a whim, you bought it, filled it with tools and beans, and rode to your favorite corner.
                            </p>
                            <p>
                                Tomorrow, you plan to go back to work, but maybe, if this works out, one day you won't have to.
                                It's a small cart, but it's yours.
                            </p>
                            <p className="menu-highlight">
                                Brew delicious drinks, charm customers, and build your reputation!
                            </p>
                        </div>

                        <div className="menu-group">
                            <button className="btn nav" style={{ width: '100%', fontSize: '1.5rem', padding: '1rem' }} onClick={handleNext}>
                                Start New Game ☕
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2>Welcome Barista!</h2>
                        <p style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '2rem', fontSize: '1.1rem' }}>
                            What should we call you?
                        </p>
                        <div className="menu-group">
                            <input
                                type="text"
                                placeholder="Enter your name"
                                maxLength="32"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyPress={handleKeyPress}
                                autoFocus
                                style={{
                                    fontFamily: 'var(--font-ui)',
                                    fontSize: '1.5rem',
                                    padding: '0.8rem',
                                    width: '100%',
                                    textAlign: 'center',
                                    border: '2px solid var(--border-color)',
                                    backgroundColor: 'var(--input-bg)',
                                    color: 'var(--text-color)',
                                    borderRadius: '8px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div className="menu-group" style={{ marginTop: '1rem' }}>
                            <button className="btn action" style={{ width: '100%', fontSize: '1.5rem', padding: '1rem' }} onClick={handleSubmit}>
                                Open for Business! 🚲
                            </button>
                        </div>
                    </>
                )}

                <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid #d7ccc8', paddingTop: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: 0 }}>Developed by <span style={{ color: 'var(--accent-color)' }}>Durf</span></p>
                    <a href="https://github.com/daedaebae" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontSize: '0.9rem' }}>
                        ❤️ Support on GitHub
                    </a>
                </div>
            </div>
        </div >
    );
};

export default IntroModal;
