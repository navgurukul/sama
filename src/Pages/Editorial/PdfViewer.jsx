import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

export default function PdfViewer() {
  useReveal();
  const { filename } = useParams();

  const safeFilename = filename || 'document.pdf';
  const cleanName = safeFilename.replace(/\.pdf$/i, '');
  const isDirectorsReport = cleanName.toLowerCase().includes('director') || cleanName.toLowerCase().includes('board');
  
  const displayName = isDirectorsReport
    ? 'Boards’ Report FY 2025–26'
    : cleanName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  // Direct static path and API download fallback
  const pdfUrl = `/docs/${safeFilename}`;
  const apiDownloadUrl = `https://sama-api.thesama.in/api/public/download-report?report=${encodeURIComponent(cleanName)}`;

  useEffect(() => {
    document.title = `${displayName} | Sama Digital Foundation`;
    window.scrollTo(0, 0);
  }, [displayName]);

  return (
    <div className="editorial-page page" id="page-pdf-viewer">
      <section className="page-hero" style={{ paddingBottom: '32px' }}>
        <div className="wrap reveal">
          <div className="crumbs">
            <Link to="/">Home</Link> / <Link to="/ngo-information">NGO Information</Link> / <b>{displayName}</b>
          </div>
          <span className="eyebrow">Statutory Document · PDF</span>
          <h1 className="display h1 mt-s" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
            {displayName}
          </h1>
          <p className="lede mt-m">
            Official statutory publication of S.A.M.A. Digital Foundation (CIN: U85500PN2024NPL233531).
          </p>

          <div className="btn-row mt-m" style={{ gap: '14px', flexWrap: 'wrap' }}>
            <a
              className="bracket bracket--solid"
              href={apiDownloadUrl}
              download={safeFilename}
            >
              Download PDF <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
            <a
              className="bracket"
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ border: '1px solid #ccc', color: 'inherit' }}
            >
              Open Fullscreen Viewer
            </a>
            <Link className="bracket" to="/ngo-information" style={{ border: '1px solid #ccc', color: 'inherit' }}>
              Back to Disclosures
            </Link>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: '10px', paddingBottom: '80px' }}>
        <div className="wrap reveal">
          <div style={{
            width: '100%',
            height: '80vh',
            minHeight: '650px',
            background: '#faf9f6',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #e0ded8',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
          }}>
            <object
              data={pdfUrl}
              type="application/pdf"
              width="100%"
              height="100%"
              style={{ display: 'block' }}
            >
              <iframe
                src={pdfUrl}
                width="100%"
                height="100%"
                title={displayName}
                style={{ border: 'none' }}
              >
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <p>Your browser does not support inline PDF viewing.</p>
                  <a className="bracket bracket--solid" href={apiDownloadUrl} download={safeFilename}>
                    Click here to download {displayName} (PDF)
                  </a>
                </div>
              </iframe>
            </object>
          </div>
        </div>
      </section>
    </div>
  );
}
