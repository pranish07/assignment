import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { candidatesApi } from '../api/client';
import { ArrowLeft, Star, Sparkles, Send, Shield, Info, Clock, Trash2 } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import ConfirmationModal from '../components/ConfirmationModal';

const CandidateDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scoreForm, setScoreForm] = useState({ category: 'Technical', score: 5, note: '' });
    const [submitting, setSubmitting] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [internalNotes, setInternalNotes] = useState('');
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

    const fetchCandidate = async () => {
        try {
            const data = await candidatesApi.get(id);
            setCandidate(data);
            setInternalNotes(data.internal_notes || '');
        } catch (err) {
            console.error(err);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidate();
    }, [id]);

    const handleScoreSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await candidatesApi.addScore(id, scoreForm);
            setScoreForm({ category: 'Technical', score: 5, note: '' });
            fetchCandidate();
        } catch (err) {
            alert('Error submitting score');
        } finally {
            setSubmitting(false);
        }
    };

    const handleTriggerSummary = async () => {
        setGenerating(true);
        try {
            await candidatesApi.triggerSummary(id);
            // Poll or just wait a bit for the mock
            setTimeout(async () => {
                await fetchCandidate();
                setGenerating(false);
            }, 3000);
        } catch (err) {
            alert('Error triggering summary');
            setGenerating(false);
        }
    };

    const handleSaveInternalNotes = async () => {
        try {
            await candidatesApi.update(id, { internal_notes: internalNotes });
            alert('Notes saved successfully');
        } catch (err) {
            alert('Error saving notes');
        }
    };

    const handleArchive = async () => {
        try {
            await candidatesApi.delete(id);
            navigate('/');
        } catch (err) {
            alert('Error archiving candidate');
        }
    };

    if (loading) return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="skeleton" style={{ width: '160px', height: '20px', marginBottom: '2rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '24px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                            <div className="skeleton" style={{ width: '200px', height: '24px' }} />
                            <div className="skeleton" style={{ width: '280px', height: '14px' }} />
                        </div>
                    </div>
                    <div className="card" style={{ minHeight: '120px' }}>
                        <div className="skeleton" style={{ width: '140px', height: '20px', marginBottom: '1rem' }} />
                        <div className="skeleton" style={{ width: '100%', height: '12px', marginBottom: '0.5rem' }} />
                        <div className="skeleton" style={{ width: '80%', height: '12px', marginBottom: '0.5rem' }} />
                        <div className="skeleton" style={{ width: '60%', height: '12px' }} />
                    </div>
                    <div className="card" style={{ minHeight: '200px' }}>
                        <div className="skeleton" style={{ width: '160px', height: '20px', marginBottom: '1rem' }} />
                        <div className="skeleton" style={{ width: '100%', height: '60px', borderRadius: '8px', marginBottom: '0.75rem' }} />
                        <div className="skeleton" style={{ width: '100%', height: '60px', borderRadius: '8px' }} />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card" style={{ minHeight: '300px' }}>
                        <div className="skeleton" style={{ width: '140px', height: '20px', marginBottom: '1.5rem' }} />
                        <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: '8px', marginBottom: '1rem' }} />
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            {[1, 2, 3, 4, 5].map(n => (
                                <div key={n} className="skeleton" style={{ flex: 1, height: '36px', borderRadius: '6px' }} />
                            ))}
                        </div>
                        <div className="skeleton" style={{ width: '100%', height: '80px', borderRadius: '8px', marginBottom: '1.5rem' }} />
                        <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: '8px' }} />
                    </div>
                    <div className="card" style={{ minHeight: '200px' }}>
                        <div className="skeleton" style={{ width: '120px', height: '20px', marginBottom: '1rem' }} />
                        <div className="skeleton" style={{ width: '100%', height: '80px', borderRadius: '8px', marginBottom: '1rem' }} />
                        <div className="skeleton" style={{ width: '100%', height: '36px', borderRadius: '8px', marginBottom: '0.75rem' }} />
                        <div className="skeleton" style={{ width: '100%', height: '36px', borderRadius: '8px' }} />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '2rem', fontWeight: '500' }}>
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Left Column: Info & Scores */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Header Card */}
                    <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>{candidate.name[0]}</span>
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>{candidate.name}</h1>
                                <span className={`badge badge-${candidate.status}`}>{candidate.status}</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)' }}>{candidate.role_applied} • {candidate.email}</p>
                        </div>
                    </div>

                    {/* AI Summary Section */}
                    <div className="card" style={{ border: '1px solid rgba(99, 102, 241, 0.3)', background: 'rgba(99, 102, 241, 0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: '700' }}>
                                <Sparkles size={20} color="#6366f1" /> AI Insights
                            </h2>
                            {!candidate.summary && (
                                <button className="btn btn-primary" onClick={handleTriggerSummary} disabled={generating}>
                                    {generating ? 'Analyzing...' : 'Generate Summary'}
                                </button>
                            )}
                        </div>
                        {candidate.summary ? (
                            <p style={{ lineHeight: '1.6', color: 'var(--text-main)' }}>{candidate.summary}</p>
                        ) : (
                            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                                {generating ? 'Wait a moment, AI is reading the profile...' : 'Click above to generate an AI summary based on candidate profile and scores.'}
                            </div>
                        )}
                    </div>

                    {/* Scores List */}
                    <div className="card">
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700' }}>
                            <Star size={20} color="#f59e0b" /> Assessment Scores
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {candidate.scores.length > 0 ? candidate.scores.map(score => (
                                <div key={score.id} style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: '600' }}>{score.category}</span>
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < score.score ? "#f59e0b" : "none"} color={i < score.score ? "#f59e0b" : "var(--border)"} />
                                            ))}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{score.note || 'No notes provided.'}</p>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No scores submitted yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Scoring Form */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: '700' }}>Add Assessment</h3>
                        <form onSubmit={handleScoreSubmit}>
                            <CustomSelect
                                label="Category"
                                value={scoreForm.category}
                                onChange={(val) => setScoreForm({ ...scoreForm, category: val })}
                                options={[
                                    { value: 'Technical', label: 'Technical' },
                                    { value: 'Communication', label: 'Communication' },
                                    { value: 'Cultural Fit', label: 'Cultural Fit' },
                                    { value: 'Problem Solving', label: 'Problem Solving' },
                                ]}
                            />
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Rating (1-5)</label>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setScoreForm({ ...scoreForm, score: num })}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                borderRadius: '6px',
                                                background: scoreForm.score === num ? 'var(--primary)' : 'var(--bg-dark)',
                                                color: scoreForm.score === num ? 'white' : 'var(--text-main)',
                                                border: '1px solid var(--border)'
                                            }}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Notes</label>
                                <textarea className="input" rows="4" style={{ resize: 'none' }} value={scoreForm.note} onChange={e => setScoreForm({ ...scoreForm, note: e.target.value })} placeholder="Specific examples or feedback..." />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                                <Send size={18} /> {submitting ? 'Submitting...' : 'Submit Score'}
                            </button>
                        </form>
                    </div>

                    {/* Admin Panel */}
                    {user?.role === 'admin' && (
                        <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '700', color: 'var(--danger)' }}>
                                <Shield size={18} /> Admin Panel
                            </h3>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Internal Notes</label>
                                <textarea
                                    className="input"
                                    rows="4"
                                    style={{ resize: 'none' }}
                                    value={internalNotes}
                                    onChange={e => setInternalNotes(e.target.value)}
                                    placeholder="Private documentation for admins..."
                                />
                            </div>
                            <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '1rem' }} onClick={handleSaveInternalNotes}>
                                Update Internal Notes
                            </button>
                            <button className="btn btn-secondary" style={{ width: '100%', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => setIsArchiveModalOpen(true)}>
                                <Trash2 size={18} /> Archive Candidate
                            </button>
                        </div>
                    )}

                    {/* Profile Details */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '700' }}>Profile Details</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                            {candidate.skills.map(skill => (
                                <span key={skill} className="badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>{skill}</span>
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Applied Date</span>
                                <span>{new Date(candidate.created_at).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Email</span>
                                <span>{candidate.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmationModal
                isOpen={isArchiveModalOpen}
                onClose={() => setIsArchiveModalOpen(false)}
                onConfirm={handleArchive}
                title="Archive Candidate"
                message={`Are you sure you want to archive ${candidate.name}? They will be removed from the active recruitment list.`}
                confirmText="Archive"
                type="danger"
            />
        </div>
    );
};

export default CandidateDetail;
