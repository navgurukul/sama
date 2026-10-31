import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

export default function Communications() {
  useReveal();

  useEffect(() => {
    document.title = "Communications | Sama";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="editorial-page page" id="page-comms">
<section className="page-hero">
  <div className="wrap reveal">
    <div className="crumbs"><Link to="/">Home</Link> / <b>Communications</b></div>
    <span className="eyebrow">Communications</span>
    <h1 className="display h1 mt-s">Reports, news <em>and stories.</em></h1>
    <p className="lede mt-m">Our annual and impact reports, and stories from the people and partners behind Sama’s work.</p>
  </div>
</section>

<section className="sec" id="reports">
  <div className="wrap">
    <div className="reveal"><span className="eyebrow">Our reports</span><h2 className="display h2 mt-s">Our work, <em>year by year.</em></h2></div>
    <div className="reports mt-l">
      <article className="report reveal"><div className="report__cover"><span>Annual Report</span><b>2025–26</b><img className="report__logo" src="/img/logo-light.png" alt="Sama" /></div><div className="report__body"><h3>Annual Report FY 2025–26</h3><p>Our programmes, partners and impact for the year.</p><a className="bracket bracket--solid" href="/docs/annual-report-2025-26.pdf" download="Sama_Annual_Report_2025-26.pdf">Download PDF <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div></article>
      <article className="report reveal"><div className="report__cover report__cover--alt"><span>Impact Report</span><b>2024–25</b><img className="report__logo" src="/img/logo-light.png" alt="Sama" /></div><div className="report__body"><h3>Impact Report FY 2024–25</h3><p>Our programmes, partners and impact for the year.</p><a className="bracket bracket--solid" href="/docs/impact-report-2024-25.pdf" download="Sama_Impact_Report_2024-25.pdf">Download PDF <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div></article>
    </div>
  </div>
</section>

<section className="sec bg-stone" id="blog">
  <div className="wrap">
    <div className="reveal"><span className="eyebrow">Blog</span><h2 className="display h2 mt-s">Stories from <em>the field.</em></h2>
      <p className="lede mt-m">Write-ups from the Sama team on digital inclusion, e-waste and the women running Sama Saathi centres.</p></div>
    <div className="cards3 mt-l"><article className="card blog-card reveal"><Link className="blog-card__link" to="/blog/beyond-connectivity"><div className="img"><img src="/img/students-lab.jpg" alt="" /></div><div className="body"><span className="eyebrow">Digital inclusion</span><h3>Beyond Connectivity: Why Digital Inclusion in India Must Begin with Access to Technology</h3><p>Why access to a working computer, not just connectivity, decides who gets to take part in India’s digital economy.</p><span className="blog-card__by">By Aritra Ghosh</span><span className="blog-card__more">Read the story <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div></Link></article><article className="card blog-card reveal"><Link className="blog-card__link" to="/blog/from-e-waste-to-new-beginnings"><div className="img"><img src="/img/bfg-g09.jpg" alt="" /></div><div className="body"><span className="eyebrow">E-waste and the environment</span><h3>From E-Waste to New Beginnings: How India Can Repurpose, Not Just Reduce</h3><p>India is the world’s third-largest producer of e-waste. The greenest laptop is often the one that already exists.</p><span className="blog-card__by">By Bhavik Kumar</span><span className="blog-card__more">Read the story <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div></Link></article><article className="card blog-card reveal"><Link className="blog-card__link" to="/blog/rethinking-digital-inclusion"><div className="img"><img src="/img/saathi-kendra.jpg" alt="" /></div><div className="body"><span className="eyebrow">Sama Saathi</span><h3>Rethinking Digital Inclusion Through Sama Saathi</h3><p>What it takes to make technology useful in someone’s life, from the women running Sama Saathi centres.</p><span className="blog-card__by">By Chelsy Pareek</span><span className="blog-card__more">Read the story <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div></Link></article></div>
  </div>
</section>
    </div>
  );
}
