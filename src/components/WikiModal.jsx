import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Modal from './Modal';

const PAGES = [
    { id: 'Home', title: '🏠 Home' },
    { id: 'Game_Mechanics', title: '☕ Mechanics' },
    { id: 'Development', title: '🛠️ Development' },
    { id: 'Architecture', title: '🏗️ Architecture' },
    { id: 'Roadmap', title: '🗺️ Roadmap' },
    { id: 'Mobile_Strategy', title: '📱 Mobile Strategy' },
    { id: 'Reputation_System', title: '⭐ Reputation' }
];

const WikiModal = ({ isOpen, onClose }) => {
    const [activePage, setActivePage] = useState('Home');
    const [content, setContent] = useState('Loading...');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        const fetchDoc = async () => {
            setError(null);
            try {
                // Use BASE_URL to handle deployment subpaths
                const basePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;
                // remove trailing slash if present to avoid double slash
                const cleanBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;

                const response = await fetch(`${cleanBase}/docs/${activePage}.md`);
                if (!response.ok) throw new Error(`Failed to load ${activePage}`);
                const text = await response.text();
                setContent(text);
            } catch (err) {
                console.error("Wiki Fetch Error:", err);
                setContent("# Error\nCould not load documentation. Please check if `docs/` is in `public/`.");
                setError(err.message);
            }
        };

        fetchDoc();
    }, [activePage, isOpen]);

    // Handle internal wiki links [Like This](DocName.md)
    const transformLink = (href) => {
        // If it's a relative md file, switch page
        if (href && !href.startsWith('http') && href.endsWith('.md')) {
            const pageId = href.replace('.md', '').replace('docs/', '');
            return {
                onClick: (e) => {
                    e.preventDefault();
                    // Find if it's a valid page
                    const exists = PAGES.find(p => p.id === pageId || p.id === pageId.split('/').pop());
                    if (exists) setActivePage(exists.id);
                    else console.warn(`Wiki link to unknown page: ${pageId}`);
                },
                href: '#'
            };
        }
        return { href, target: '_blank' };
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chillista Wiki" className="wiki-modal">
            <div className="wiki-layout">
                <div className="wiki-sidebar">
                    {PAGES.map(page => (
                        <button
                            key={page.id}
                            className={`wiki-nav-btn ${activePage === page.id ? 'active' : ''}`}
                            onClick={() => setActivePage(page.id)}
                        >
                            {page.title}
                        </button>
                    ))}
                </div>
                <div className="wiki-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: ({ href, children }) => {
                                const { onClick, href: newHref, target } = transformLink(href);
                                return <a href={newHref} onClick={onClick} target={target}>{children}</a>;
                            }
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </Modal>
    );
};

export default WikiModal;
