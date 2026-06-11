import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { candidatesApi } from '../api/client';
import { Search, Filter, User, ChevronRight, LogOut, Briefcase } from 'lucide-react';
import CandidateCard from '../components/CandidateCard';
import CustomSelect from '../components/CustomSelect';

const CandidateList = ({ user }) => {
    const [candidates, setCandidates] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        status: '',
        role_applied: '',
        keyword: ''
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDebouncing, setIsDebouncing] = useState(false);
    const navigate = useNavigate();

    const PAGE_SIZE = 10;

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const data = await candidatesApi.list({ ...filters, page, size: PAGE_SIZE });
            setCandidates(data.items);
            setTotal(data.total);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setIsDebouncing(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [page, filters]);

    // Handle search debounce
    useEffect(() => {
        if (!searchQuery) {
            setFilters(prev => ({ ...prev, keyword: '' }));
            setPage(1);
            return;
        }

        setIsDebouncing(true);
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, keyword: searchQuery }));
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.reload();
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Candidates</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage and score recruitment applications</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="glass" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{user?.email}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <section className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Search</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Name, role, email..."
                            style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {(isDebouncing || (loading && searchQuery)) && (
                            <div className="spinner" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                        )}
                    </div>
                </div>
                <CustomSelect
                    label="Status"
                    value={filters.status}
                    onChange={(val) => { setFilters({ ...filters, status: val }); setPage(1); }}
                    options={[
                        { value: '', label: 'All Statuses' },
                        { value: 'new', label: 'New' },
                        { value: 'reviewed', label: 'Reviewed' },
                        { value: 'hired', label: 'Hired' },
                        { value: 'rejected', label: 'Rejected' },
                    ]}
                />
                <CustomSelect
                    label="Role"
                    value={filters.role_applied}
                    onChange={(val) => { setFilters({ ...filters, role_applied: val }); setPage(1); }}
                    options={[
                        { value: '', label: 'All Roles' },
                        { value: 'Full Stack Engineer', label: 'Full Stack Engineer' },
                        { value: 'Backend Engineer', label: 'Backend Engineer' },
                        { value: 'Frontend Engineer', label: 'Frontend Engineer' },
                    ]}
                />
            </section>

            {/* Grid */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div className="skeleton" style={{ width: '140px', height: '14px' }} />
                                        <div className="skeleton" style={{ width: '200px', height: '12px' }} />
                                    </div>
                                </div>
                                <div className="skeleton" style={{ width: '70px', height: '22px', borderRadius: '9999px' }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div className="skeleton" style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
                                <div className="skeleton" style={{ width: '150px', height: '12px' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <div className="skeleton" style={{ width: '120px', height: '12px' }} />
                                <div className="skeleton" style={{ width: '90px', height: '14px' }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {candidates.map(candidate => (
                        <CandidateCard key={candidate.id} candidate={candidate} />
                    ))}
                </div>
            )}

            {/* Pagination - only show if there are more results than one page can hold */}
            {total > PAGE_SIZE && (
                <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', alignItems: 'center' }}>
                    <button
                        className="btn btn-secondary"
                        disabled={page === 1}
                        onClick={() => setPage(prev => prev - 1)}
                        style={{ opacity: page === 1 ? 0.5 : 1 }}
                    >
                        Previous
                    </button>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600', padding: '0 1rem' }}>
                        Page {page} of {Math.ceil(total / PAGE_SIZE)}
                    </span>
                    <button
                        className="btn btn-secondary"
                        disabled={page * PAGE_SIZE >= total}
                        onClick={() => setPage(prev => prev + 1)}
                        style={{ opacity: page * PAGE_SIZE >= total ? 0.5 : 1 }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default CandidateList;
