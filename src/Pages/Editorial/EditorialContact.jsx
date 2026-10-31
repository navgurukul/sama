import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

export default function EditorialContact() {
  useReveal();

  useEffect(() => {
    document.title = "Contact Us | Sama";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="editorial-page page" id="page-contact">
<section className="page-hero">
  <div className="wrap reveal">
    <div className="crumbs"><Link to="/">Home</Link> / <b>Contact Us</b></div>
    <span className="eyebrow">Contact us</span>
    <h1 className="display h1 mt-s">Connect <em>with us.</em></h1>
    <p className="lede mt-m">Whether you want to become a Sama Saathi, bring the model to your community, donate laptops or partner with us, write to us and our team will get back to you.</p>
  </div>
</section>
<section className="sec" id="connect">
  <div className="wrap contact-grid">
    <form className="contact-form reveal" id="contact-form" novalidate>
      <label>I am reaching out about
        <select name="topic" id="cf-topic">
          <option>I want to become a Sama Saathi</option>
          <option>Bringing the Saathi model to my community</option>
          <option>Donating laptops</option>
          <option>Corporate partnership</option>
          <option>Renew Desk at our office</option>
          <option>Mentoring</option>
          <option>Something else</option>
        </select>
      </label>
      <div className="two"><label>Your name<input name="name" required autoComplete="name" /></label><label>Phone<input name="phone" type="tel" autoComplete="tel" /></label></div>
      <div className="two"><label>Email<input name="email" type="email" autoComplete="email" /></label><label>Town / district<input name="place" /></label></div>
      <label>Message<textarea name="message" rows="5" placeholder="Tell us a little about yourself and what you would like to do."></textarea></label>
      <button className="bracket bracket--solid" type="submit">Send message <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
      <p className="small">This opens your email app with your message addressed to operations@thesama.in. Press send there to reach us.</p>
    </form>
    <aside className="contact-side reveal">
      <h3>Write to us directly</h3>
      <p><a href="mailto:operations@thesama.in">operations@thesama.in</a></p>
      <h3 className="mt-l">Registered office</h3>
      <p>S.A.M.A. Digital Foundation<br />C-804, Surbhi Mangalam, Dhanori,<br />Pune City, Pune, Maharashtra 411015, India</p>
      <p className="small mt-m">CIN U85500PN2024NPL233531 · CSR-1 registered with the Ministry of Corporate Affairs. <Link to="/corporatepartner">NGO information</Link></p>
    </aside>
  </div>
</section>
    </div>
  );
}
