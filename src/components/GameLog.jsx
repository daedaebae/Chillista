import React, { useEffect, useRef } from 'react';

const GameLog = ({ logs }) => {
    const logRef = useRef(null);

    // Auto-scroll to bottom when logs change
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <main className="game-log" id="game-log" ref={logRef}>
            {logs.length === 0 && (
                <>
                    <div className="log-entry system">Welcome to your cozy coffee cart.</div>
                    <div className="log-entry system">Relax and brew some coffee.</div>
                </>
            )}
            {logs.map((log) => (
                <div key={log.id || Math.random()} className={`log-entry ${log.type}`}>
                    {log.message}
                </div>
            ))}
        </main>
    );
};

export default GameLog;
