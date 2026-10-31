import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

export default function EditorialDonate() {
  useReveal();

  useEffect(() => {
    document.title = "Donate | Sama";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="editorial-page page" id="page-involved">
<section className="page-hero">
  <div className="wrap reveal">
    <div className="crumbs"><Link to="/">Home</Link> / <b>Donate</b></div>
    <span className="eyebrow">Join the digital inclusion movement</span>
    <h1 className="display h1 mt-s">Donate <em>a laptop.</em></h1>
    <p className="lede mt-m">Whether you are a corporation looking to offboard IT assets seamlessly, an NGO expanding grassroots education, or an institution driving digital literacy, there is a place for you in our ecosystem. Help us close the hardware divide.</p>
  </div>
</section>
<section className="sec">
  <div className="wrap">
    <div className="center reveal"><span className="eyebrow">Five ways in</span><h2 className="display h2 mt-s">Give or need, as an individual, <em>an employee or an organisation.</em></h2></div>
    <div className="ways" id="give">
      <div className="way way--give reveal"><span className="ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#174B32" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/></svg></span><span className="eyebrow">Give · Individual</span><h3>Donate a used laptop</h3><p>Give your pre-owned laptop a second life. Sama refurbishes and deploys decommissioned devices directly to students, aspiring entrepreneurs, or community members preparing for their first digital milestone.</p><a className="bracket bracket--solid" href="https://www.thesama.in/donate">Donate a laptop <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>
      <div className="way way--give reveal"><span className="ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#174B32" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4"/></svg></span><span className="eyebrow">Give · Organisation</span><h3>Decommission a corporate fleet</h3><p>Transform end-of-life hardware into measurable social impact. Sama collects, refurbishes and redeploys corporate laptop fleets at scale, turning them into fully functional computer labs and livelihood programmes.</p><a className="bracket bracket--solid" href="https://www.thesama.in/donate">Donate as a company <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>
    </div>
    <div className="ways" id="need" style={{ marginTop: '26px' }}>
      <div className="way way--need reveal"><span className="ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B6EA5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6"/></svg></span><span className="eyebrow" style={{ color: '#3B6EA5' }}>Need · Individual</span><h3>Request individual access</h3><p>Are you preparing for a career-defining exam, launching a local enterprise, or building your technical skills without access to a computer? Share your requirements with us to see how we can help.</p><a className="bracket bracket--solid" href="mailto:operations@thesama.in?subject=Request%20for%20a%20laptop%20(individual)">Request a laptop <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>
      <div className="way way--need reveal"><span className="ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B6EA5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 8h6M9 12h6M9 16h3"/></svg></span><span className="eyebrow" style={{ color: '#3B6EA5' }}>Need · Organisation</span><h3>Equip an institution or lab</h3><p>Are you running a school, vocational skilling centre or grassroots non-profit in need of hardware? Partner with Sama to bring quality refurbished laptops and digital infrastructure to the learners you support.</p><a className="bracket bracket--solid" href="mailto:operations@thesama.in?subject=Request%20for%20laptops%20(organisation)">Request laptops for your organisation <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>
    </div>
    <div className="ways" style={{ marginTop: '26px' }}>
      <div className="way way--emp reveal"><span className="ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5A4A35" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20c.8-3.5 3.2-5.5 6-5.5s5.2 2 6 5.5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.6c2.6.2 4.4 2 5 5.4"/></svg></span><div><span className="eyebrow" style={{ color: 'var(--text)' }}>Give · Employees</span><h3>Renew a laptop. Reboot someone’s life.</h3><p>Bring your team to a Sama Renew Desk at your office and restore retired laptops yourselves, alongside our refurbishment team. Every laptop you work on goes to someone using a computer for the first time.</p></div><a className="bracket bracket--solid" href="#contact:connect" data-topic="Renew Desk at our office">Bring a Renew Desk to your office <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>
    </div>
    <div className="mt-xl reveal"><div className="video"><iframe src="https://drive.google.com/file/d/1dsq7K3D4eazwwY-HE7eyN-sLKmTM4cgC/preview" title="Get involved with Sama" allow="autoplay; fullscreen" loading="lazy"></iframe></div></div>
  </div>
</section>
<section className="trust">
  <div className="wrap reveal">
    <span className="eyebrow">Trusted by</span>
    <div className="marquee" aria-label="Our corporate partners"><ul className="marquee__track"><li><img src="/img/p-amazon.png" alt="Amazon" loading="lazy" /></li><li><img src="/img/p-microsoft.png" alt="Microsoft" loading="lazy" /></li><li><img src="/img/p-accenture.png" alt="Accenture" loading="lazy" /></li><li><img src="/img/p-capgemini.svg" alt="Capgemini" loading="lazy" /></li><li><img src="/img/p-eaton.png" alt="Eaton" loading="lazy" /></li><li><img src="/img/p-sp-global.png" alt="S&amp;P Global" loading="lazy" /></li><li><img src="/img/p-tiger-analytics.png" alt="Tiger Analytics" loading="lazy" /></li><li><img src="/img/p-macquarie.png" alt="Macquarie" loading="lazy" /></li><li><img src="/img/p-dxc.png" alt="DXC Technology" loading="lazy" /></li><li><img src="/img/p-apexon.png" alt="Apexon" loading="lazy" /></li><li><img src="/img/p-avid.png" alt="Avid Learning" loading="lazy" /></li><li><img src="/img/p-fossil.svg" alt="Fossil" loading="lazy" /></li><li><img src="/img/p-sga.svg" alt="SG Analytics" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-amazon.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-microsoft.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-accenture.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-capgemini.svg" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-eaton.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-sp-global.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-tiger-analytics.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-macquarie.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-dxc.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-apexon.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-avid.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-fossil.svg" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-sga.svg" alt="" loading="lazy" /></li></ul></div>
    <span className="pill">★ CSR-1 registered with the Ministry of Corporate Affairs</span>
  </div>
</section>
    </div>
  );
}
