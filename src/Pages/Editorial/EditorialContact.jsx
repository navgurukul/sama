import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

export default function EditorialContact() {
  useReveal();
  const location = useLocation();

  const [formData, setFormData] = useState({
    topic: 'I want to become a Sama Saathi',
    name: '',
    phone: '',
    email: '',
    place: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    document.title = "Contact Us | Sama";
    window.scrollTo(0, 0);

    // Support pre-selecting topic via URL query param (?topic=...) or hash
    const params = new URLSearchParams(location.search);
    const topicParam = params.get('topic');
    if (topicParam) {
      setFormData((prev) => ({ ...prev, topic: topicParam }));
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Your name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!formData.message.trim()) {
      errs.message = 'Please provide a brief message.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      const apiBase = process.env.REACT_APP_NgoInformationApi 
        ? process.env.REACT_APP_NgoInformationApi.replace(/\/ngo-exec.*$/, '')
        : 'http://localhost:8000';

      const payload = {
        formType: 'contact',
        topic: formData.topic,
        name: formData.name.trim(),
        firstName: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        place: formData.place.trim(),
        city: formData.place.trim(),
        message: formData.message.trim(),
      };

      const res = await fetch(`${apiBase}/exec?type=publicInquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.detail || data.message || 'Submission failed');
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setServerError(err.message || 'Could not send your message. Please try again or email operations@thesama.in directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      topic: 'I want to become a Sama Saathi',
      name: '',
      phone: '',
      email: '',
      place: '',
      message: '',
    });
    setErrors({});
    setIsSubmitted(false);
    setServerError('');
  };

  return (
    <div className="editorial-page page" id="page-contact">
      {/* Page Hero */}
      <section className="page-hero">
        <div className="wrap reveal">
          <div className="crumbs"><Link to="/">Home</Link> / <b>Contact Us</b></div>
          <span className="eyebrow">Contact us</span>
          <h1 className="display h1 mt-s">Connect <em>with us.</em></h1>
          <p className="lede mt-m">Whether you want to become a Sama Saathi, bring the model to your community, donate laptops or partner with us, write to us and our team will get back to you.</p>
        </div>
      </section>

      {/* Contact Grid Section */}
      <section className="sec" id="connect">
        <div className="wrap contact-grid">
          {!isSubmitted ? (
            <form className="contact-form reveal" id="contact-form" onSubmit={handleSubmit} noValidate>
              <label>
                <span>I am reaching out about</span>
                <select name="topic" id="cf-topic" value={formData.topic} onChange={handleChange}>
                  <option value="I want to become a Sama Saathi">I want to become a Sama Saathi</option>
                  <option value="Bringing the Saathi model to my community">Bringing the Saathi model to my community</option>
                  <option value="Donating laptops">Donating laptops</option>
                  <option value="Corporate partnership">Corporate partnership</option>
                  <option value="Renew Desk at our office">Renew Desk at our office</option>
                  <option value="Mentoring">Mentoring</option>
                  <option value="Something else">Something else</option>
                </select>
              </label>

              {serverError && (
                <div style={{ background: '#FDF2F2', border: '1px solid #F8B4B4', color: '#9B1C1C', padding: '10px 14px', borderRadius: '6px', fontSize: '14px' }}>
                  {serverError}
                </div>
              )}

              <div className="two">
                <label>
                  <span>Your name <span style={{ color: '#D32F2F' }}>*</span></span>
                  <input
                    name="name"
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    style={{ border: errors.name ? '1.5px solid #D32F2F' : undefined }}
                  />
                  {errors.name && <span style={{ color: '#D32F2F', fontSize: '12px' }}>{errors.name}</span>}
                </label>

                <label>
                  <span>Phone</span>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Contact number"
                  />
                </label>
              </div>

              <div className="two">
                <label>
                  <span>Email <span style={{ color: '#D32F2F' }}>*</span></span>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    style={{ border: errors.email ? '1.5px solid #D32F2F' : undefined }}
                  />
                  {errors.email && <span style={{ color: '#D32F2F', fontSize: '12px' }}>{errors.email}</span>}
                </label>

                <label>
                  <span>Town / district</span>
                  <input
                    name="place"
                    value={formData.place}
                    onChange={handleChange}
                    placeholder="City or district"
                  />
                </label>
              </div>

              <label>
                <span>Message <span style={{ color: '#D32F2F' }}>*</span></span>
                <textarea
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us a little about yourself and what you would like to do."
                  style={{ border: errors.message ? '1.5px solid #D32F2F' : undefined }}
                ></textarea>
                {errors.message && <span style={{ color: '#D32F2F', fontSize: '12px' }}>{errors.message}</span>}
              </label>

              <div>
                <button className="bracket bracket--solid" type="submit" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send message'}{' '}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </form>
          ) : (
            /* Instant Success Confirmation Card */
            <div className="contact-form reveal" style={{ textAlign: 'center', padding: '40px 28px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#EAF3EB', color: 'var(--green, #174B32)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </div>

              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '26px', color: 'var(--ink, #1D2123)', marginBottom: '8px' }}>
                Message Sent Successfully!
              </h2>

              <p style={{ color: 'var(--text, #5A4A35)', fontSize: '15.5px', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 24px' }}>
                Thank you, <b>{formData.name}</b>. Your message regarding <b>"{formData.topic}"</b> has been directly sent to our operations team at <b>operations@thesama.in</b>. We will get back to you shortly.
              </p>

              <div>
                <button type="button" className="bracket bracket--solid" onClick={handleReset}>
                  Send another message
                </button>
              </div>
            </div>
          )}

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
