import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

export default function EditorialNotFound() {
  useReveal();

  useEffect(() => {
    document.title = "Page Not Found | Sama Digital Foundation";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="editorial-page page" id="page-notfound" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center' }}>
      <section className="sec" style={{ width: '100%', padding: '90px 0' }}>
        <div className="wrap reveal" style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
          <span className="eyebrow" style={{ color: 'var(--green, #5C785A)', letterSpacing: '0.12em' }}>
            404 Error
          </span>
          <h1 className="display h1 mt-s" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
            Page <em>not found.</em>
          </h1>
          <p className="lede mt-m" style={{ color: 'var(--muted, #666)', lineHeight: 1.6 }}>
            The link you clicked may be broken, or the page may have been moved or updated.
          </p>
          <div className="btn-row mt-l" style={{ justifyContent: 'center', gap: '16px' }}>
            <Link className="bracket bracket--solid" to="/">
              Back to Home <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </Link>
            <Link className="bracket" to="/contact" style={{ border: '1px solid #ccc', color: 'inherit' }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

