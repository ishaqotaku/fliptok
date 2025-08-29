import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, signup as apiSignup } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './css/Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', role: 'consumer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { data } = await apiLogin({ email: form.email, password: form.password });
        login(data.token);
      } else {
        await apiSignup(form);
        const { data } = await apiLogin({ email: form.email, password: form.password });
        login(data.token);
      }
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="row justify-content-center align-items-center login-row">
          {/* Form Column */}
          <div className="col-md-8 col-lg-5">
            <div className="card shadow-lg p-4 border-0 login-card">
              <div className="card-body">
                <h2 className="card-title text-center mb-4 fw-light">
                  {mode === 'login' ? 'Login' : 'Sign Up'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Email address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {mode === 'signup' && (
                    <div className="mb-3">
                      <label className="form-label">I am a...</label>
                      <select
                        name="role"
                        className="form-select"
                        value={form.role}
                        onChange={handleChange}
                      >
                        <option style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} value="consumer">Consumer</option>
                        <option style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} value="creator">Creator</option>
                      </select>
                    </div>
                  )}
                  <button type="submit" disabled={loading} className="btn btn-primary w-100 mt-3">
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span className="ms-2">Please wait...</span>
                      </>
                    ) : mode === 'login' ? 'Login' : 'Create Account'}
                  </button>
                </form>
                <div className="text-center mt-3">
                  {mode === 'login' ? (
                    <button className="btn btn-link text-secondary text-decoration-none" onClick={() => setMode('signup')}>
                      Need an account? Sign up
                    </button>
                  ) : (
                    <button className="btn btn-link text-secondary text-decoration-none" onClick={() => setMode('login')}>
                      Have an account? Log in
                    </button>
                  )}
                </div>
                {error && <div className="alert alert-danger mt-3 small p-2">{error}</div>}
              </div>
            </div>
          </div>

          {/* Branding Column */}
          <div className="col-lg-5 d-none d-lg-flex flex-column align-items-center justify-content-center branding-col">
            <h1 className="display-3 fw-bold text-gradient">FlipTok</h1>
            <p className="lead text-light text-center">Share your moments, one flip at a time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}