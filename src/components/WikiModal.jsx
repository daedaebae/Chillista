import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Modal from './Modal';

const WikiModal = ({ isOpen, onClose }) => {
    const [content, setContent] = useState('');
    const [currentPath, setCurrentPath] = useState('Home.md');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchPage(currentPath);
        }
    }, [isOpen, currentPath]);

    const fetchPage = async (path) => {
        setLoading(true);
        try {
            // Clean up path to ensure we're fetching relative to Wiki root
            const cleanPath = path.replace(/^\.\//, ''); // Remove leading ./
            const response = await fetch(`/Wiki/${cleanPath}`);

            if (!response.ok) throw new Error('Failed to load page');

            const text = await response.text();
            setContent(text);
        } catch (error) {
            setContent('# Error\nCould not load the requested Wiki page.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLinkClick = (href) => {
        if (href.endsWith('.md')) {
            // Internal Wiki Link
            setHistory([...history, currentPath]);

            // Handle relative paths like ../Design/Doc.md - simplified for now to flat structure or direct mapping
            // For now, let's assume flat or direct children for the demo, or just handle filename
            const filename = href.split('/').pop();
            setCurrentPath(filename);

        } else {
            // External Link
            window.open(href, '_blank');
        }
    };

    const handleBack = () => {
        if (history.length > 0) {
            const previous = history[history.length - 1];
            setHistory(history.slice(0, -1));
            setCurrentPath(previous);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Project Wiki" className="wiki-modal">
            <div className="wiki-controls" style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                <button
                    className="btn nav"
                    onClick={handleBack}
                    disabled={history.length === 0}
                    style={{ opacity: history.length === 0 ? 0.5 : 1 }}
                >
                    ⬅ Back
                </button>
                <button
                    className="btn nav"
                    onClick={() => {
                        setHistory([]);
                        setCurrentPath('Home.md');
                    }}
                >
                    🏠 Home
                </button>
            </div>

            <div className="wiki-content" style={{ maxHeight: '60vw', overflowY: 'auto', textAlign: 'left', padding: '0 10px' }}>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: ({ node, ...props }) => (
                                <a
                                    {...props}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleLinkClick(props.href);
                                    }}
                                    style={{ color: 'var(--accent-color)', cursor: 'pointer', textDecoration: 'underline' }}
                                />
                            ),
                            h1: ({ node, ...props }) => <h1 style={{ borderBottom: '2px solid #5d4037', paddingBottom: '0.5rem', marginTop: '0' }} {...props} />,
                            h2: ({ node, ...props }) => <h2 style={{ color: '#5d4037', marginTop: '1.5rem' }} {...props} />,
                            ul: ({ node, ...props }) => <ul style={{ paddingLeft: '1.5rem' }} {...props} />,
                            details: ({ node, ...props }) => <details style={{ backgroundColor: '#f0e6d2', padding: '0.5rem', borderRadius: '4px', margin: '0.5rem 0' }} {...props} />,
                            summary: ({ node, ...props }) => <summary style={{ cursor: 'pointer', fontWeight: 'bold' }} {...props} />,
                            code: ({ node, inline, className, children, ...props }) => {
                                return !inline ? (
                                    <pre style={{ background: '#333', color: '#eee', padding: '1rem', borderRadius: '4px', overflowX: 'auto' }}>
                                        <code {...props} className={className}>
                                            {children}
                                        </code>
                                    </pre>
                                ) : (
                                    <code style={{ background: '#e0e0e0', padding: '0.2rem 0.4rem', borderRadius: '3px', fontFamily: 'monospace' }} {...props}>
                                        {children}
                                    </code>
                                )
                            }
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                )}
            </div>
        </Modal>
    );
};

export default WikiModal;
