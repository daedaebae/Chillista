import React from 'react';
import '../styles/modules/menus.css';
import Modal from './Modal';

// Define holidays and game events relative to the game start day (day 1)
const CALENDAR_EVENTS = {
    5: { name: 'Local Farmers Market', type: 'event' },
    10: { name: 'Town Festival', type: 'event', description: 'Increased customer traffic!' },
    15: { name: 'National Coffee Day', type: 'holiday', description: 'Special discounts on coffee beans!' },
    22: { name: 'Summer Solstice Celebration', type: 'event' },
    30: { name: 'New Menu Item Launch', type: 'event', description: 'Unlock new recipes!' },
};

const CalendarModal = ({ gameState, close }) => {
    return (
        <Modal isOpen={true} onClose={close} title="Calendar & Weather" className="stats-modal">
            <div className="stats-body">
                <div className="stats-section">
                    <div className="stat-card" style={{ marginBottom: '1rem' }}>
                        <h3>Day {gameState.day}</h3>
                        <p>Weather: {gameState.weather.charAt(0).toUpperCase() + gameState.weather.slice(1)}</p>
                    </div>

                    <h3>Upcoming Events</h3>
                    <div className="unlock-list">
                        {Object.entries(CALENDAR_EVENTS).map(([day, event]) => {
                            const dayNum = parseInt(day);
                            // detailed logic to show past/future events could go here
                            const isPast = gameState.day > dayNum;
                            const isToday = gameState.day === dayNum;

                            return (
                                <div key={day} className={`unlock-item ${isPast ? 'locked' : (isToday ? 'unlocked' : '')}`} style={{ opacity: isPast ? 0.6 : 1 }}>
                                    <span>Day {day}: {event.name}</span>
                                    <span>{isToday ? 'TODAY!' : (isPast ? 'Passed' : 'Upcoming')}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default CalendarModal;
