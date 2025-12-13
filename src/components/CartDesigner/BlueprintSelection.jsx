import React from 'react';
import './CartDesigner.css';

const BlueprintSelection = ({ onSelect }) => {
    const options = [
        {
            id: 'velo',
            title: 'The Velo-Barista',
            subtitle: 'Eco-Friendly Cargo Bike',
            desc: 'Agile, green, and sweat-powered. Great for dodging traffic and winning hearts.',
            stats: { mobility: 'High', capacity: 'Low', cost: 200, baseCost: 200 },
            perk: 'Eco-Hype: Faster crowd growth',
            color: '#81c784'
        },
        {
            id: 'hacker',
            title: 'The Sidewalk Hacker',
            subtitle: 'Upcycled Street Cart',
            desc: 'Built from scrap, held together by dreams and duct tape. Tough as nails.',
            stats: { mobility: 'Med', capacity: 'High', cost: 100, baseCost: 100 },
            perk: 'Street Cred: Cheaper supplies',
            color: '#ffb74d'
        },
        {
            id: 'luxe',
            title: 'The Micro-Luxe',
            subtitle: 'Converted Vintage Trailer',
            desc: 'A tiny palace on wheels. High maintenance, but customers pay for the view.',
            stats: { mobility: 'Low', capacity: 'Med', cost: 800, baseCost: 800 },
            perk: 'Premium: Higher tip chance',
            color: '#ba68c8'
        }
    ];

    return (
        <div className="blueprint-selection" style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem',
            padding: '2rem'
        }}>
            {options.map(opt => (
                <div key={opt.id} className="blueprint-card" style={{
                    background: '#fff',
                    color: '#333',
                    borderRadius: '12px',
                    width: '300px',
                    padding: '1.5rem',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                    border: `4px solid ${opt.color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div className="card-header" style={{ borderBottom: `2px solid ${opt.color}`, paddingBottom: '0.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{opt.title}</h2>
                        <span style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>{opt.subtitle}</span>
                    </div>

                    <div className="card-visual" style={{
                        height: '150px', background: '#eee',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '8px', border: '1px dashed #ccc'
                    }}>
                        [Visual Mockup: {opt.id}]
                    </div>

                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>{opt.desc}</p>

                    <div className="stats-grid" style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem', background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px'
                    }}>
                        <div style={{ fontSize: '0.8rem' }}><strong>Mobility:</strong> {opt.stats.mobility}</div>
                        <div style={{ fontSize: '0.8rem' }}><strong>Capacity:</strong> {opt.stats.capacity}</div>
                        <div style={{ fontSize: '0.8rem', gridColumn: 'span 2' }}><strong>Start Cost:</strong> ${opt.stats.cost}</div>
                    </div>

                    <div className="perk-badge" style={{
                        background: opt.color, color: '#fff',
                        padding: '4px 8px', borderRadius: '4px',
                        textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold'
                    }}>
                        ★ {opt.perk}
                    </div>

                    <button className="btn" style={{
                        marginTop: 'auto',
                        background: '#333', color: '#fff',
                        padding: '10px', fontSize: '1.1rem', cursor: 'pointer'
                    }} onClick={() => onSelect(opt.id, opt.stats)}>
                        Select Design
                    </button>
                </div>
            ))}
        </div>
    );
};

export default BlueprintSelection;
