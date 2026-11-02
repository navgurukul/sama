import React from 'react';
import { Link } from 'react-router-dom';

const PARTNERS = [
  { name: 'Amazon', img: '/img/p-amazon.png' },
  { name: 'Microsoft', img: '/img/p-microsoft.png' },
  { name: 'Accenture', img: '/img/p-accenture.png' },
  { name: 'Capgemini', img: '/img/p-capgemini.svg' },
  { name: 'Eaton', img: '/img/p-eaton.png' },
  { name: 'S&P Global', img: '/img/p-sp-global.png' },
  { name: 'Tiger Analytics', img: '/img/p-tiger-analytics.png' },
  { name: 'Macquarie', img: '/img/p-macquarie.png' },
  { name: 'DXC Technology', img: '/img/p-dxc.png' },
  { name: 'Apexon', img: '/img/p-apexon.png' },
  { name: 'Avid Learning', img: '/img/p-avid.png' },
  { name: 'Fossil', img: '/img/p-fossil.svg' },
  { name: 'SG Analytics', img: '/img/p-sga.svg' },
];

export default function EditorialFooter() {
  return (
    <footer className="site-footer">
      <div className="foot-partners">
        <div className="wrap">
          <span className="eyebrow">Our corporate partners</span>
          <div className="marquee" aria-label="Our corporate partners (footer)">
            <ul className="marquee__track">
              {PARTNERS.map((p, idx) => (
                <li key={idx}>
                  <img src={p.img} alt={p.name} loading="lazy" />
                </li>
              ))}
              {/* Duplicated for infinite marquee loop */}
              {PARTNERS.map((p, idx) => (
                <li key={`dup-${idx}`} aria-hidden="true">
                  <img src={p.img} alt="" loading="lazy" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="wrap foot-main">
        <h2>
          Not Charity. <em>Capability</em>.
        </h2>

        <div className="foot-row">
          <Link className="logo foot-logo" to="/" aria-label="Sama home">
            <img className="logo-img" src="/img/logo.png" alt="Sama" width="149" height="44" />
          </Link>
          <nav className="foot-nav" aria-label="Footer">
            <Link to="/">Who We Are</Link>
            <Link to="/sama-saathi">Sama Saathi</Link>
            <Link to="/labs">Digital Inclusion &amp; AI Literacy</Link>
            <Link to="/giving">Giving Back</Link>
            <Link to="/bfg">Build for Good</Link>
            <Link to="/ourteam">Team</Link>
            <Link to="/communications">Communications</Link>
            <Link to="/donate">Donate</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/corporatepartner">NGO Information</Link>
          </nav>
        </div>

        <div className="foot-legal">
          <div className="foot-legal-row" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px 12px', fontSize: '13.5px' }}>
            <span>© 2026 S.A.M.A. Digital Foundation</span>
            <span>·</span>
            <span>CIN U85500PN2024NPL233531</span>
            <span>·</span>
            <span style={{ whiteSpace: 'nowrap' }}>CSR-1 Reg. with Ministry of Corporate Affairs</span>
            <span style={{ color: 'var(--sage)' }}>•</span>
            <a className="foot-mail" href="mailto:operations@thesama.in">operations@thesama.in</a>
            <span>·</span>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <span>·</span>
            <a href="https://www.linkedin.com/company/thesama/posts/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>LinkedIn</a>
            <span>·</span>
            <a href="https://www.instagram.com/samadigitalfoundation/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>Instagram</a>
          </div>
          <div className="foot-compliance mt-xs" style={{ marginTop: '8px', fontSize: '12px', opacity: 0.75 }}>
            <span>Designated Grievance Officer: Sama Operations (<a href="mailto:operations@thesama.in" style={{ textDecoration: 'underline' }}>operations@thesama.in</a>) · Registered Office: Pune, Maharashtra, India.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
