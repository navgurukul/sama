import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function EditorialHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const isHome = currentPath === '/';
  const isInitiatives = currentPath.startsWith('/initiatives') || currentPath.startsWith('/sama-saathi') || currentPath.startsWith('/labs');
  const isGiving = currentPath.startsWith('/giving') || currentPath.startsWith('/first-laptop') || currentPath.startsWith('/bfg');
  const isTeam = currentPath.startsWith('/ourteam') || currentPath.startsWith('/team');
  const isComms = currentPath.startsWith('/comms') || currentPath.startsWith('/blog');
  const isContact = currentPath.startsWith('/contact');

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header ${menuOpen ? 'open' : ''}`} id="top">
      <div className="bar">
        <Link className="logo" to="/" aria-label="Sama home" onClick={closeMenu}>
          <img className="logo-img" src="/img/logo.png" alt="Sama Digital Foundation" width="149" height="44" />
        </Link>

        <nav className="nav" aria-label="Main">
          <Link
            to="/"
            data-group="home"
            className={isHome ? 'is-active' : ''}
            onClick={closeMenu}
          >
            Who We Are
          </Link>

          <div
            className="has-menu"
            data-group="initiatives"
            tabIndex={0}
          >
            <Link
              to="/initiatives"
              className={isInitiatives ? 'is-active' : ''}
              onClick={closeMenu}
            >
              Our Initiatives
            </Link>{' '}
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 4.5l3 3 3-3" />
            </svg>
            <div className="menu">
              <Link to="/sama-saathi" onClick={closeMenu}>Sama Saathi</Link>
              <Link to="/labs" onClick={closeMenu}>Digital Inclusion &amp; AI Literacy</Link>
            </div>
          </div>

          <div
            className="has-menu"
            data-group="giving"
            tabIndex={0}
          >
            <Link
              to="/giving"
              className={isGiving ? 'is-active' : ''}
              onClick={closeMenu}
            >
              Giving Back
            </Link>{' '}
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 4.5l3 3 3-3" />
            </svg>
            <div className="menu">
              <Link to="/giving#employee" onClick={closeMenu}>Employee giving</Link>
              <Link to="/first-laptop" onClick={closeMenu}>First Laptop, Next Builder</Link>
              <Link to="/bfg" onClick={closeMenu}>Build for Good hackathon</Link>
            </div>
          </div>

          <Link
            to="/ourteam"
            data-group="team"
            className={isTeam ? 'is-active' : ''}
            onClick={closeMenu}
          >
            Team
          </Link>

          <Link
            to="/comms"
            data-group="comms"
            className={isComms ? 'is-active' : ''}
            onClick={closeMenu}
          >
            Communications
          </Link>

          <Link
            to="/contact"
            data-group="contact"
            className={isContact ? 'is-active' : ''}
            onClick={closeMenu}
          >
            Contact Us
          </Link>

          <Link
            to="/login"
            className="portal-link"
            style={{ fontSize: '13px', opacity: 0.75, fontFamily: 'var(--sans)', letterSpacing: '0.04em' }}
            onClick={closeMenu}
          >
            Portal Login
          </Link>
        </nav>

        <Link className="bracket bracket--solid" to="/donate" onClick={closeMenu}>
          Donate{' '}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>

        <button
          className="menu-toggle"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#453722" strokeWidth="1.6">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
