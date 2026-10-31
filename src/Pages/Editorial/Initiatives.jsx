import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

export default function Initiatives() {
  useReveal();

  useEffect(() => {
    document.title = "Our Initiatives | Sama";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="editorial-page page" id="page-initiatives">
<section className="page-hero">
  <div className="wrap reveal">
    <div className="crumbs"><Link to="/">Home</Link> / <b>Our Initiatives</b></div>
    <h1 className="display h1">Our <em>initiatives.</em></h1>
    <p className="lede mt-m">Two programmes that put retired corporate laptops to work: with women running their own digital centres, and with students in schools, colleges and skilling centres.</p>
  </div>
</section>
<section className="sec">
  <div className="wrap cards2">
    <article className="card reveal">
      <div className="img"><img src="/img/saathi-kendra.jpg" alt="A Sama Digi Kendra at work" /></div>
      <div className="body"><h3>Sama Saathi Programme</h3>
        <p>A rural, women-led digital inclusion and livelihood initiative. Local women run community Sama Digi Kendras on refurbished laptops, earning a sustainable income while delivering essential digital services to their villages.</p>
        <Link className="bracket bracket--solid" to="/sama-saathi">Explore Sama Saathi <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link></div>
    </article>
    <article className="card reveal">
      <div className="img"><img src="/img/students-lab.jpg" alt="Students in a Sama digital lab" /></div>
      <div className="body"><h3>Digital Inclusion &amp; AI Literacy Labs</h3>
        <p>Transforming retired corporate laptops into fully functional computer labs within government schools, colleges and skilling centres, giving students the hands-on practice needed to succeed in digital courses.</p>
        <Link className="bracket bracket--solid" to="/labs">Explore Digital Labs <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link></div>
    </article>
  </div>
</section>

<section className="cta-band"><div className="wrap grid reveal"><h2 className="display h2">Looking for Build for Good <em>or Renew Desk?</em></h2><div><p className="lede">They now sit under Giving Back, alongside our founders’ first-laptop campaign.</p><div className="btn-row mt-l"><Link className="bracket bracket--solid" to="/giving">See Giving Back <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link></div></div></div></section>
    </div>
  );
}
