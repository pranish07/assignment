import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ label, options, value, onChange, placeholder = "Select option..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={containerRef} style={{ marginBottom: '1rem', position: 'relative' }}>
            {label && <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{label}</label>}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className="input"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderColor: isOpen ? 'var(--primary)' : 'var(--border)'
                }}
            >
                <span style={{ color: value ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
            </div>

            {isOpen && (
                <div className="glass" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 999999, // Extreme z-index as requested
                    marginTop: '0.5rem',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    boxShadow: '0 10px 40px -5px rgba(0, 0, 0, 0.8)',
                    background: '#1e293b', // Concrete card color
                    opacity: 1,
                    border: '1px solid var(--primary)' // Highlight border
                }}>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            style={{
                                padding: '0.75rem 1rem',
                                cursor: 'pointer',
                                background: value === option.value ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                color: value === option.value ? 'var(--primary)' : 'var(--text-main)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.target.style.background = value === option.value ? 'rgba(99, 102, 241, 0.1)' : 'transparent'}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
