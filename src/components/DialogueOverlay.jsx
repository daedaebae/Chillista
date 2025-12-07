import React from 'react';

const DialogueOverlay = ({ dialogueState, onNext, onChoice }) => {
    const { isOpen, text, choices, speaker, isTyping } = dialogueState;

    if (!isOpen) return null;

    return (
        <div className="dialogue-overlay" onClick={onNext} style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '600px',
            background: 'rgba(0, 0, 0, 0.85)',
            color: '#fff',
            border: '2px solid #8b4513',
            borderRadius: '10px',
            padding: '15px',
            zIndex: 1000,
            cursor: 'pointer'
        }}>
            <div className="speaker-name" style={{
                color: '#f9cb28',
                fontWeight: 'bold',
                marginBottom: '5px'
            }}>
                {speaker}
            </div>

            <div className="dialogue-text" style={{
                minHeight: '24px',
                marginBottom: '10px',
                fontFamily: 'monospace',
                fontSize: '1.1rem'
            }}>
                {text}
                <span className={`cursor ${isTyping ? 'blink' : ''}`}>_</span>
            </div>

            {choices && !isTyping && (
                <div className="dialogue-choices" style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginTop: '10px'
                }}>
                    {choices.map((choice, i) => (
                        <button
                            key={i}
                            className="btn choice-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChoice(choice);
                            }}
                            style={{
                                flex: '1 1 40%',
                                fontSize: '0.9rem',
                                padding: '8px'
                            }}
                        >
                            {choice.text}
                        </button>
                    ))}
                </div>
            )}

            {!choices && !isTyping && (
                <div className="continue-hint" style={{ fontSize: '0.8rem', opacity: 0.7, textAlign: 'right' }}>
                    Tap to continue ▼
                </div>
            )}
        </div>
    );
};

export default DialogueOverlay;
