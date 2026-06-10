import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { candidatesApi } from '../api/client';
import { Search, Filter, User, ChevronRight, LogOut, Briefcase } from 'lucide-react';
import CandidateCard from '../components/CandidateCard';

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
    const navigate = useNavigate();

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const data = await candidatesApi.list({ ...filters, page, size: 20 });
            setCandidates(data.items);
            setTotal(data.total);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [page, filters]);

    const handleLogout = () => {
        localStorage.removeItem('token');
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

            {/* Filters */}
            <section className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Search</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Name, role, email..."
                            style={{ paddingLeft: '2.5rem' }}
                            value={filters.keyword}
                            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                        />
                    </div>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Status</label>
                    <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                        <option value="">All Statuses</option>
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Role</label>
                    <select className="input" value={filters.role_applied} onChange={(e) => setFilters({ ...filters, role_applied: e.target.value })}>
                        <option value="">All Roles</option>
                        <option value="Full Stack Engineer">Full Stack Engineer</option>
                        <option value="Backend Engineer">Backend Engineer</option>
                        <option value="Frontend Engineer">Frontend Engineer</option>
                    </select>
                </div>
            </section>

            {/* Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>Loading candidates...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {candidates.map(candidate => (
                        <CandidateCard key={candidate.id} candidate={candidate} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <button
                    className="btn btn-secondary"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Previous
                </button>
                <button
                    className="btn btn-secondary"
                    disabled={candidates.length < 20}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default CandidateList;
