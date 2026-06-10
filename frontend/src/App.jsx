import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CandidateList from './pages/CandidateList';
import CandidateDetail from './pages/CandidateDetail';
import { authApi } from './api/client';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await authApi.getMe();
          setUser(data);
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="btn btn-primary" style={{ cursor: 'default' }}>Loading...</div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <CandidateList user={user} />
            </PrivateRoute>
          }
        />
        <Route
          path="/candidate/:id"
          element={
            <PrivateRoute>
              <CandidateDetail user={user} />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
