// Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  // Close collapse when route changes (so it closes after navigation)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggle = () => setIsOpen(prev => !prev);

  return (
    <nav className="navbar navbar-expand-lg navbar-black px-3 py-2">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/" onClick={() => setIsOpen(false)}>
          <svg className="brand-icon" width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <circle cx="12" cy="12" r="11" fill="#0b0b0b" stroke="#2b2b2b" strokeWidth="0.6" />
            <path d="M10 8v8l6-4z" fill="#ffffff"/>
          </svg>
          <span className="brand-text">FlipTok</span>
        </Link>

        {/* Controlled toggler (no data-bs attributes) */}
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarContent"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          onClick={toggle}
        >
          <span className="navbar-toggler-icon"><div></div><div></div><div></div></span>
        </button>

        {/* Controlled collapse: we add 'show' class when isOpen */}
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarContent">
          <div className="ms-auto d-flex align-items-center gap-2">
            {user ? (
              <>
                <span className="navbar-text me-2 small text-white">
                  Hi, {user.email} <span className="muted-role">({user.role})</span>
                </span>

                {user.role === 'creator' && (
                  <Link className="btn btn-outline-light btn-black" to="/upload" onClick={() => setIsOpen(false)}>Upload</Link>
                )}

                <button onClick={handleLogout} className="btn btn-outline-dark btn-black">Logout</button>
              </>
            ) : (
              <Link className="btn btn-light btn-black" to="/login" onClick={() => setIsOpen(false)}>Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}