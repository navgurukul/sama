import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function EditorialHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState(null); // 'initiatives' | 'giving' | null
  const location = useLocation();
  const currentPath = location.pathname;

  const isHome = currentPath === '/';
  const isInitiatives = currentPath.startsWith('/initiatives') || currentPath.startsWith('/sama-saathi') || currentPath.startsWith('/labs');
  const isGiving = currentPath.startsWith('/giving') || currentPath.startsWith('/first-laptop') || currentPath.startsWith('/bfg');
  const isTeam = currentPath.startsWith('/ourteam') || currentPath.startsWith('/team');
  const isComms = currentPath.startsWith('/comms') || currentPath.startsWith('/blog');
  const isContact = currentPath.startsWith('/contact');

  // Automatically close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
    setExpandedSubmenu(null);
  }, [location.pathname]);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setExpandedSubmenu(null);
  };

  const toggleSubmenu = (menuName, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedSubmenu((prev) => (prev === menuName ? null : menuName));
  };

  return (
    <>
      {menuOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
      <header className={`site-header ${menuOpen ? 'open' : ''}`} id="top">
        <div className="bar">
          <Link className="logo" to="/" aria-label="Sama home" onClick={closeMenu}>
            <img className="logo-img" src="/img/logo.png" alt="Sama Digital Foundation" width="149" height="44" />
          </Link>

          <nav className="nav" aria-label="Main">
            <Link
              to="/"
              data-group="home"
              className={`site-nav-link ${isHome ? 'is-active' : ''}`}
              onClick={closeMenu}
            >
              Who We Are
            </Link>

            {/* Initiatives with accordion for mobile */}
            <div
              className={`has-menu ${isInitiatives ? 'is-active' : ''}`}
              data-group="initiatives"
              tabIndex={0}
            >
              <div className="has-menu-head">
                <Link
                  to="/initiatives"
                  className={isInitiatives ? 'is-active' : ''}
                  onClick={closeMenu}
                >
                  Our Initiatives
                </Link>
                <button
                  type="button"
                  className={`menu-chevron-btn ${expandedSubmenu === 'initiatives' ? 'open' : ''}`}
                  onClick={(e) => toggleSubmenu('initiatives', e)}
                  aria-label="Toggle initiatives submenu"
                  aria-expanded={expandedSubmenu === 'initiatives'}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2.5 4.5l3.5 3.5 3.5-3.5" />
                  </svg>
                </button>
              </div>
              <div className={`menu ${expandedSubmenu === 'initiatives' ? 'expanded' : 'collapsed'}`}>
                <Link to="/sama-saathi" onClick={closeMenu}>Sama Saathi</Link>
                <Link to="/labs" onClick={closeMenu}>Digital Inclusion &amp; AI Literacy</Link>
              </div>
            </div>

            {/* Giving Back with accordion for mobile */}
            <div
              className={`has-menu ${isGiving ? 'is-active' : ''}`}
              data-group="giving"
              tabIndex={0}
            >
              <div className="has-menu-head">
                <Link
                  to="/giving"
                  className={isGiving ? 'is-active' : ''}
                  onClick={closeMenu}
                >
                  Giving Back
                </Link>
                <button
                  type="button"
                  className={`menu-chevron-btn ${expandedSubmenu === 'giving' ? 'open' : ''}`}
                  onClick={(e) => toggleSubmenu('giving', e)}
                  aria-label="Toggle giving back submenu"
                  aria-expanded={expandedSubmenu === 'giving'}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2.5 4.5l3.5 3.5 3.5-3.5" />
                  </svg>
                </button>
              </div>
              <div className={`menu ${expandedSubmenu === 'giving' ? 'expanded' : 'collapsed'}`}>
                <Link to="/giving#employee" onClick={closeMenu}>Employee giving</Link>
                <Link to="/first-laptop" onClick={closeMenu}>First Laptop, Next Builder</Link>
                <Link to="/bfg" onClick={closeMenu}>Build for Good hackathon</Link>
              </div>
            </div>

            <Link
              to="/ourteam"
              data-group="team"
              className={`site-nav-link ${isTeam ? 'is-active' : ''}`}
              onClick={closeMenu}
            >
              Team
            </Link>

            <Link
              to="/comms"
              data-group="comms"
              className={`site-nav-link ${isComms ? 'is-active' : ''}`}
              onClick={closeMenu}
            >
              Communications
            </Link>

            <Link
              to="/contact"
              data-group="contact"
              className={`site-nav-link ${isContact ? 'is-active' : ''}`}
              onClick={closeMenu}
            >
              Contact Us
            </Link>

            <Link
              to="/login"
              className={`portal-link ${currentPath.startsWith('/login') ? 'is-active' : ''}`}
              onClick={closeMenu}
            >
              Login
            </Link>

            {/* Mobile-only Donate button inside navigation drawer */}
            <div className="mobile-donate-row">
              <Link className="bracket bracket--solid" to="/donate" onClick={closeMenu}>
                Donate to Sama{' '}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </nav>

          {/* Desktop Donate button */}
          <Link className="bracket bracket--solid desktop-donate" to="/donate" onClick={closeMenu}>
            Donate{' '}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>

          {/* Mobile hamburger/close button */}
          <button
            className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2C2316" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C2316" strokeWidth="1.8">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </header>
    </>
  );
}
