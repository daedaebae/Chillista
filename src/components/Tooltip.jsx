import React, { useState } from 'react';
import '../styles/modules/tooltip.css';

const Tooltip = ({ text, children, placement = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="tooltip-container"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className={`tooltip-bubble ${placement}`}>
                    {text}
                </div>
            )}
        </div>
    );
};

export default Tooltip;
