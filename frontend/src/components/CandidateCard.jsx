import React from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase, ChevronRight } from 'lucide-react';

const CandidateCard = ({ candidate }) => {
    return (
        <Link to={`/candidate/${candidate.id}`} className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User color="#6366f1" />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: '700' }}>{candidate.name}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{candidate.email}</p>
                    </div>
                </div>
                <span className={`badge badge-${candidate.status}`}>{candidate.status}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <Briefcase size={16} />
                {candidate.role_applied}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Applied {new Date(candidate.created_at).toLocaleDateString()}</span>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: '600', fontSize: '0.875rem' }}>
                    View Details <ChevronRight size={16} />
                </div>
            </div>
        </Link>
    );
};

export default CandidateCard;
