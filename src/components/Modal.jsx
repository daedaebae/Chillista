import React from 'react';

const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
    if (!isOpen) return null;

    return (
        <div className={`menu-overlay ${isOpen ? '' : 'hidden'}`} onClick={onClose}>
            <div className={`coffee-menu ${className}`} onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={() => onClose()}>×</button>
                {title && <h2>{title}</h2>}
                {children}
            </div>
        </div>
    );
};

export default Modal;
