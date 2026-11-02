import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

export default function EditorialDonate() {
  useReveal();

  const formRef = useRef(null);
  const [formType, setFormType] = useState('give_corporate'); // 'give_corporate', 'financial_volunteer'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    companyName: '',
    designation: '',
    fleetSize: '10–50 laptops',
    decommissionTimeline: 'Within 1 month',
    dataWipingNeeded: 'Yes',
    deviceAge: '< 3 years',
    pickupAddress: '',
    financialVolunteerChoice: 'Make a CSR contribution towards refurbishment',
    hearAbout: 'Social Media',
    message: '',
    receiveUpdates: true,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRefId, setSubmittedRefId] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleCopyRef = () => {
    if (submittedRefId) {
      navigator.clipboard.writeText(submittedRefId);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2200);
    }
  };


  const handleChipSelect = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  useEffect(() => {
    document.title = "Donate | Sama";
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');

    if (tabParam === 'financial_volunteer') {
      setFormType('financial_volunteer');
    } else {
      setFormType('give_corporate');
    }

    if (tabParam) {
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleSelectTab = (type) => {
    setFormType(type);
    setErrors({});
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid work email address.';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (formData.phone.trim().replace(/\D/g, '').length < 10) {
      errs.phone = 'Please provide a valid 10-digit mobile number.';
    }

    if (formType === 'give_corporate') {
      if (!formData.companyName.trim()) errs.companyName = 'Company name is required.';
      if (!formData.designation.trim()) errs.designation = 'Work role / designation is required.';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      const apiBase = process.env.REACT_APP_NgoInformationApi 
        ? process.env.REACT_APP_NgoInformationApi.replace(/\/ngo-exec.*$/, '')
        : 'http://localhost:8000';

      const isGiveCorp = formType === 'give_corporate';
      const isFinVol = formType === 'financial_volunteer';

      const payload = {
        formType,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        contributionType: isGiveCorp ? 'company' : 'csr_grant',
        companyName: isGiveCorp ? formData.companyName.trim() : '',
        designation: isGiveCorp ? formData.designation.trim() : '',
        donationIntent: isFinVol ? formData.financialVolunteerChoice : 'donate_laptops',
        numberOfLaptops: isGiveCorp ? formData.fleetSize : 0,
        deviceAge: isGiveCorp ? formData.deviceAge : '',
        pickupAddress: isGiveCorp ? formData.pickupAddress.trim() : '',
        decommissionTimeline: isGiveCorp ? formData.decommissionTimeline : '',
        dataWipingNeeded: isGiveCorp ? (formData.dataWipingNeeded === 'Yes') : false,
        hearAbout: formData.hearAbout,
        message: formData.message.trim(),
        receiveUpdates: formData.receiveUpdates,
      };

      const res = await fetch(`${apiBase}/api/public/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.detail || data.message || 'Submission failed');
      }

      setSubmittedRefId(data.reference_id || `SAMA-REF-${Date.now().toString().slice(-4)}`);
      setIsSubmitted(true);

      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setServerError(err.message || 'Could not submit your details. Please verify your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      companyName: '',
      designation: '',
      fleetSize: '10–50 laptops',
      decommissionTimeline: 'Within 1 month',
      dataWipingNeeded: 'Yes',
      deviceAge: '< 3 years',
      pickupAddress: '',
      financialVolunteerChoice: 'Make a CSR contribution towards refurbishment',
      hearAbout: 'Social Media',
      message: '',
      receiveUpdates: true,
    });
    setErrors({});
    setIsSubmitted(false);
    setSubmittedRefId('');
    setServerError('');
  };

  return (
    <div className="editorial-page page" id="page-involved">
      {/* Page Hero */}
      <section className="page-hero">
        <div className="wrap reveal">
          <div className="crumbs"><Link to="/">Home</Link> / <b>Donate</b></div>
          <span className="eyebrow">Join the digital inclusion movement</span>
          <h1 className="display h1 mt-s">Donate <em>a laptop.</em></h1>
          <p className="lede mt-m">
            Partner with Sama Digital Foundation to offboard retired corporate IT assets responsibly and seamlessly. We collect, securely data-wipe, and redeploy decommissioned corporate laptops as powerful learning and livelihood tools for underserved girls and youth across India.
          </p>
        </div>
      </section>

      {/* Corporate & Institutional Engagement Pathways */}
      <section className="sec" style={{ paddingBottom: '40px' }}>
        <div className="wrap">
          <div className="center reveal">
            <span className="eyebrow">Engagement Pathways</span>
            <h2 className="display h2 mt-s">Partner with Sama to <em>scale hardware impact.</em></h2>
          </div>

          <div className="ways" id="give">
            {/* Card 1: Corporate Fleet Decommissioning */}
            <div className="way way--give reveal">
              <span className="ico">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5C785A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="5" y="3" width="14" height="18" rx="1.5" />
                  <path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4" />
                </svg>
              </span>
              <span className="eyebrow">Enterprise · IT Asset Offboarding</span>
              <h3>Decommission a corporate fleet</h3>
              <p>Transform end-of-life hardware into measurable social impact. Sama collects, sanitises, and redeploys corporate laptop fleets at scale, turning them into fully functional computer labs and livelihood programmes with CSR-1 certification.</p>
              <button
                type="button"
                className="bracket bracket--solid"
                onClick={() => handleSelectTab('give_corporate')}
              >
                Donate corporate fleet <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>

            {/* Card 2: Renew Desk at Your Office */}
            <div className="way way--emp reveal">
              <span className="ico">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5A4A35" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="8" r="3" />
                  <path d="M3 20c.8-3.5 3.2-5.5 6-5.5s5.2 2 6 5.5" />
                  <circle cx="17" cy="9" r="2.4" />
                  <path d="M16 14.6c2.6.2 4.4 2 5 5.4" />
                </svg>
              </span>
              <div>
                <span className="eyebrow" style={{ color: 'var(--text)' }}>Volunteering · Employee Engagement</span>
                <h3>Bring a Renew Desk to your office</h3>
                <p>Host an on-site refurbishment event at your corporate office where employees restore retired laptops alongside our technical team, seeing first-hand the impact on first-time learners.</p>
              </div>
              <a
                className="bracket bracket--solid"
                href="mailto:operations@thesama.in?subject=Renew%20Desk%20at%20our%20office&body=Hello%20Sama%20Operations%20Team,%0D%0A%0D%0AWe%20would%20like%20to%20explore%20hosting%20a%20Sama%20Renew%20Desk%20at%20our%20office%20for%20our%20employees.%0D%0A%0D%0ACompany%20Name:%0D%0AContact%20Person:%0D%0APhone%20/%20Email:%0D%0AOffice%20Location:%0D%0AApproximate%20Team%20Size:%0D%0A%0D%0ALooking%20forward%20to%20collaborating."
              >
                Host a Renew Desk <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
            </div>
          </div>

          <div className="ways" id="need" style={{ marginTop: '26px' }}>
            {/* Card 3: Equip an Institution or Lab */}
            <div className="way way--need reveal">
              <span className="ico">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B6EA5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="5" y="3" width="14" height="18" rx="1.5" />
                  <path d="M9 8h6M9 12h6M9 16h3" />
                </svg>
              </span>
              <span className="eyebrow" style={{ color: '#3B6EA5' }}>Institutions · NGO Network</span>
              <h3>Equip a school or computer lab</h3>
              <p>Are you running a registered school, vocational training centre, or grassroots non-profit in need of hardware? Apply through Sama's verified NGO portal to receive batches of high-quality refurbished laptops.</p>
              <Link className="bracket bracket--solid" to="/ngoregistration">
                Request laptops for your organisation <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
            </div>

            {/* Card 4: CSR Grants & Refurbishment Capital */}
            <div className="way way--give reveal">
              <span className="ico">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5C785A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </span>
              <span className="eyebrow">Funding · CSR Capital</span>
              <h3>Support refurbishment &amp; parts</h3>
              <p>Every laptop requires replacement batteries, SSD upgrades, certified data sanitisation, and safe logistics. Your CSR contribution directly funds the restoration and deployment pipeline.</p>
              <button
                type="button"
                className="bracket bracket--solid"
                onClick={() => handleSelectTab('financial_volunteer')}
              >
                Contribute CSR funds <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Contribution & Request Form Section */}
      <section className="sec bg-paper" id="contribution-form" ref={formRef} style={{ paddingTop: '60px' }}>
        <div className="wrap">
          <div className="donate-card-wrapper">
            <div className="donate-card-accent-bar" />
            <div className="donate-card-inner">
              
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="donate-header">
                    <span className="eyebrow-pill">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Get Involved
                    </span>
                    <h2>Your Details</h2>
                    <p>
                      Share your requirements or donation details and our team will get in touch with you promptly.
                    </p>
                  </div>

                  {/* Corporate B2B Form Mode Selector */}
                  <div className="donate-tabs-grid" role="tablist" aria-label="Select contribution type" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                    {[
                      {
                        id: 'give_corporate',
                        title: 'Corporate Fleet Decommissioning',
                        sub: 'Enterprise · 10+ devices',
                        icon: (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                            <line x1="9" y1="22" x2="9" y2="22.01" />
                            <line x1="15" y1="22" x2="15" y2="22.01" />
                            <line x1="8" y1="6" x2="10" y2="6" />
                            <line x1="14" y1="6" x2="16" y2="6" />
                            <line x1="8" y1="10" x2="10" y2="10" />
                            <line x1="14" y1="10" x2="16" y2="10" />
                            <line x1="8" y1="14" x2="10" y2="14" />
                            <line x1="14" y1="14" x2="16" y2="14" />
                          </svg>
                        ),
                      },
                      {
                        id: 'financial_volunteer',
                        title: 'CSR & Refurbishment Capital',
                        sub: 'Funding · Logistics & Parts',
                        icon: (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        ),
                      },
                    ].map((tab) => {
                      const isActive = formType === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          className={`donate-tab-btn ${isActive ? 'is-active' : ''}`}
                          onClick={() => handleSelectTab(tab.id)}
                        >
                          <span className="donate-tab-badge" />
                          <div className="donate-tab-icon-wrap">
                            {tab.icon}
                          </div>
                          <div>
                            <div className="donate-tab-title">{tab.title}</div>
                            <div className="donate-tab-sub">{tab.sub}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ background: 'rgba(92,120,90,0.08)', border: '1px solid rgba(92,120,90,0.22)', borderRadius: '10px', padding: '12px 18px', marginTop: '18px', marginBottom: '24px', fontSize: '13.5px', color: 'var(--ink)' }}>
                    <span>
                      <b>Institutional Requests:</b> If you are a school, vocational lab, or grassroots non-profit seeking laptops, please apply via our{' '}
                      <Link to="/ngoregistration" style={{ textDecoration: 'underline', fontWeight: 600, color: 'var(--sage)' }}>
                        Verified NGO Partner Portal →
                      </Link>
                    </span>
                  </div>

                  {serverError && (
                    <div style={{ background: '#FDF2F2', border: '1px solid #F8B4B4', color: '#9B1C1C', padding: '12px 16px', borderRadius: '10px', marginBottom: '24px', fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                      {serverError}
                    </div>
                  )}

                  {/* Section 1: Personal Details */}
                  <div className="donate-fields-grid">
                    <div className="donate-field">
                      <label htmlFor="donate-firstName">
                        <span>First Name <span className="req">*</span></span>
                      </label>
                      <input
                        id="donate-firstName"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="e.g. Rajesh"
                        className={`donate-input ${errors.firstName ? 'has-error' : ''}`}
                      />
                      {errors.firstName && (
                        <span className="donate-field-err">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                          {errors.firstName}
                        </span>
                      )}
                    </div>

                    <div className="donate-field">
                      <label htmlFor="donate-lastName">
                        <span>Last Name <span className="req">*</span></span>
                      </label>
                      <input
                        id="donate-lastName"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="e.g. Kumar"
                        className={`donate-input ${errors.lastName ? 'has-error' : ''}`}
                      />
                      {errors.lastName && (
                        <span className="donate-field-err">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                          {errors.lastName}
                        </span>
                      )}
                    </div>

                    <div className="donate-field">
                      <label htmlFor="donate-email">
                        <span>Email Address <span className="req">*</span></span>
                      </label>
                      <input
                        id="donate-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. rajesh@gmail.com"
                        className={`donate-input ${errors.email ? 'has-error' : ''}`}
                      />
                      {errors.email && (
                        <span className="donate-field-err">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                          {errors.email}
                        </span>
                      )}
                    </div>

                    <div className="donate-field">
                      <label htmlFor="donate-phone">
                        <span>Phone Number <span className="req">*</span></span>
                      </label>
                      <input
                        id="donate-phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 98765 43210"
                        className={`donate-input ${errors.phone ? 'has-error' : ''}`}
                      />
                      {errors.phone && (
                        <span className="donate-field-err">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                          {errors.phone}
                        </span>
                      )}
                    </div>

                    <div className="donate-field">
                      <label htmlFor="donate-city">
                        <span>City</span>
                        <span className="opt">Optional</span>
                      </label>
                      <input
                        id="donate-city"
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. New Delhi"
                        className="donate-input"
                      />
                    </div>

                    <div className="donate-field">
                      <label htmlFor="donate-state">
                        <span>State</span>
                        <span className="opt">Optional</span>
                      </label>
                      <input
                        id="donate-state"
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="e.g. Delhi"
                        className="donate-input"
                      />
                    </div>
                  </div>

                  {/* Section 2: Conditional Fields based on formType */}
                  <div className="donate-context-panel">
                    
                    {/* Option B: Give Corporate */}
                    {formType === 'give_corporate' && (
                      <>
                        <div className="donate-context-header">
                          <div className="donate-context-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                              <line x1="9" y1="22" x2="9" y2="22.01" />
                              <line x1="15" y1="22" x2="15" y2="22.01" />
                            </svg>
                          </div>
                          <div>
                            <h4>Corporate Fleet Decommissioning</h4>
                            <span>Partner with Sama to transform company hardware into education labs</span>
                          </div>
                        </div>

                        <div className="donate-fields-grid" style={{ marginBottom: 0 }}>
                          <div className="donate-field">
                            <label htmlFor="donate-companyName">
                              <span>Company Name <span className="req">*</span></span>
                            </label>
                            <input
                              id="donate-companyName"
                              type="text"
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleChange}
                              placeholder="e.g. Acme Technologies India"
                              className={`donate-input ${errors.companyName ? 'has-error' : ''}`}
                            />
                            {errors.companyName && (
                              <span className="donate-field-err">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                {errors.companyName}
                              </span>
                            )}
                          </div>

                          <div className="donate-field">
                            <label htmlFor="donate-designation">
                              <span>Your Designation / Role <span className="req">*</span></span>
                            </label>
                            <input
                              id="donate-designation"
                              type="text"
                              name="designation"
                              value={formData.designation}
                              onChange={handleChange}
                              placeholder="e.g. IT Asset Manager / CSR Lead"
                              className={`donate-input ${errors.designation ? 'has-error' : ''}`}
                            />
                            {errors.designation && (
                              <span className="donate-field-err">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                {errors.designation}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="donate-field">
                          <label>
                            <span>Estimated fleet size to decommission:</span>
                          </label>
                          <div className="donate-chips-wrap">
                            {['10–50 laptops', '50–200 laptops', '200+ laptops'].map((sz) => {
                              const isSelected = formData.fleetSize === sz;
                              return (
                                <button
                                  key={sz}
                                  type="button"
                                  className={`donate-chip-btn ${isSelected ? 'is-selected' : ''}`}
                                  onClick={() => handleChipSelect('fleetSize', sz)}
                                >
                                  <span className="donate-chip-dot">
                                    <span className="donate-chip-dot-inner" />
                                  </span>
                                  {sz}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="donate-fields-grid" style={{ marginBottom: 0 }}>
                          <div className="donate-field">
                            <label>
                              <span>Decommission Timeline:</span>
                            </label>
                            <div className="donate-chips-wrap" style={{ flexDirection: 'column', gap: '8px' }}>
                              {['Immediate', 'Within 1 month', 'Next quarter'].map((time) => {
                                const isSelected = formData.decommissionTimeline === time;
                                return (
                                  <button
                                    key={time}
                                    type="button"
                                    className={`donate-chip-btn ${isSelected ? 'is-selected' : ''}`}
                                    onClick={() => handleChipSelect('decommissionTimeline', time)}
                                    style={{ width: '100%', justifyContent: 'flex-start' }}
                                  >
                                    <span className="donate-chip-dot">
                                      <span className="donate-chip-dot-inner" />
                                    </span>
                                    {time}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="donate-field">
                            <label>
                              <span>Data Sanitisation Certificate:</span>
                            </label>
                            <div className="donate-chips-wrap" style={{ flexDirection: 'column', gap: '8px' }}>
                              {[
                                { label: 'Yes, required', val: 'Yes' },
                                { label: 'Not needed', val: 'No' },
                              ].map((opt) => {
                                const isSelected = formData.dataWipingNeeded === opt.val;
                                return (
                                  <button
                                    key={opt.val}
                                    type="button"
                                    className={`donate-chip-btn ${isSelected ? 'is-selected' : ''}`}
                                    onClick={() => handleChipSelect('dataWipingNeeded', opt.val)}
                                    style={{ width: '100%', justifyContent: 'flex-start' }}
                                  >
                                    <span className="donate-chip-dot">
                                      <span className="donate-chip-dot-inner" />
                                    </span>
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Option D: Financial / Volunteer */}
                    {formType === 'financial_volunteer' && (
                      <>
                        <div className="donate-context-header">
                          <div className="donate-context-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </div>
                          <div>
                            <h4>Support Sama's Mission</h4>
                            <span>Choose how you would like to participate</span>
                          </div>
                        </div>

                        <div className="donate-field">
                          <label>
                            <span>I would like to:</span>
                          </label>
                          <div style={{ display: 'grid', gap: '10px' }}>
                            {[
                              'Make a financial contribution towards refurbishment',
                              'Volunteer my time / technical skills',
                              'Both contribute financially and volunteer',
                            ].map((opt) => {
                              const isSelected = formData.financialVolunteerChoice === opt;
                              return (
                                <div
                                  key={opt}
                                  className={`donate-option-card ${isSelected ? 'is-selected' : ''}`}
                                  onClick={() => handleChipSelect('financialVolunteerChoice', opt)}
                                >
                                  <span className="donate-chip-dot">
                                    <span className="donate-chip-dot-inner" />
                                  </span>
                                  <span className="donate-option-card-title">{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Section 3: How did you hear about Sama? */}
                  <div className="donate-field" style={{ marginBottom: '22px' }}>
                    <label>
                      <span>How did you hear about Sama?</span>
                      <span className="opt">Optional</span>
                    </label>
                    <div className="donate-chips-wrap">
                      {['Social Media', 'Website', 'Friend/Colleague', 'Event', 'Other'].map((source) => {
                        const isSelected = formData.hearAbout === source;
                        return (
                          <button
                            key={source}
                            type="button"
                            className={`donate-chip-btn ${isSelected ? 'is-selected' : ''}`}
                            onClick={() => handleChipSelect('hearAbout', source)}
                          >
                            <span className="donate-chip-dot">
                              <span className="donate-chip-dot-inner" />
                            </span>
                            {source}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 4: Message */}
                  <div className="donate-field" style={{ marginBottom: '22px' }}>
                    <label htmlFor="donate-message">
                      <span>Any additional information or questions</span>
                      <span className="opt">Optional</span>
                    </label>
                    <textarea
                      id="donate-message"
                      name="message"
                      rows="3"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Share any specific notes or questions you have for our team..."
                      className="donate-textarea"
                    />
                  </div>

                  {/* Section 5: Checkbox Updates */}
                  <div style={{ marginBottom: '28px' }}>
                    <label className="donate-checkbox-label">
                      <input
                        type="checkbox"
                        name="receiveUpdates"
                        checked={formData.receiveUpdates}
                        onChange={handleChange}
                        style={{ display: 'none' }}
                      />
                      <span className="donate-checkbox-box">
                        {formData.receiveUpdates && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span>I would like to receive mission updates and impact stories from Sama</span>
                    </label>
                  </div>

                  {/* Submit button */}
                  <div>
                    <button
                      type="submit"
                      className="donate-submit-btn"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="spin-icon">
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" />
                          </svg>
                          Submitting your details...
                        </>
                      ) : (
                        <>
                          {formType === 'give_corporate' && 'Submit Corporate Fleet Inquiry'}
                          {formType === 'financial_volunteer' && 'Submit CSR Funding Inquiry'}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Success Confirmation Card */
                <div className="donate-success-card">
                  <div className="donate-success-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </div>

                  <div className="donate-ref-badge">
                    <span>Reference ID:</span>
                    <b>{submittedRefId}</b>
                    <button
                      type="button"
                      className="donate-copy-btn"
                      onClick={handleCopyRef}
                      title="Copy Reference ID"
                    >
                      {copiedRef ? (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--ink)', marginBottom: '10px' }}>
                    Submission Received Successfully!
                  </h3>
                  <p style={{ color: 'var(--muted, #666)', fontSize: '16px', maxWidth: '540px', margin: '0 auto 28px', lineHeight: 1.6 }}>
                    Thank you for reaching out. Your details have been recorded directly in our system. Our operations team will review your submission and contact you shortly.
                  </p>

                  <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="bracket bracket--solid"
                      onClick={handleReset}
                    >
                      Submit another response
                    </button>
                    <Link
                      to="/"
                      className="bracket"
                      style={{
                        padding: '12px 24px',
                        borderRadius: '4px',
                        background: '#fff',
                        border: '1px solid #ddd',
                        textDecoration: 'none',
                        color: 'var(--ink, #111)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontWeight: 600,
                      }}
                    >
                      Back to Home
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Corporate Trust Marquee */}
      <section className="trust">
        <div className="wrap reveal">
          <span className="eyebrow">Trusted by</span>
          <div className="marquee" aria-label="Our corporate partners">
            <ul className="marquee__track">
              <li><img src="/img/p-amazon.png" alt="Amazon" loading="lazy" /></li>
              <li><img src="/img/p-microsoft.png" alt="Microsoft" loading="lazy" /></li>
              <li><img src="/img/p-accenture.png" alt="Accenture" loading="lazy" /></li>
              <li><img src="/img/p-capgemini.svg" alt="Capgemini" loading="lazy" /></li>
              <li><img src="/img/p-eaton.png" alt="Eaton" loading="lazy" /></li>
              <li><img src="/img/p-sp-global.png" alt="S&P Global" loading="lazy" /></li>
              <li><img src="/img/p-tiger-analytics.png" alt="Tiger Analytics" loading="lazy" /></li>
              <li><img src="/img/p-macquarie.png" alt="Macquarie" loading="lazy" /></li>
              <li><img src="/img/p-dxc.png" alt="DXC Technology" loading="lazy" /></li>
              <li><img src="/img/p-apexon.png" alt="Apexon" loading="lazy" /></li>
              <li><img src="/img/p-avid.png" alt="Avid Learning" loading="lazy" /></li>
              <li><img src="/img/p-fossil.svg" alt="Fossil" loading="lazy" /></li>
              <li><img src="/img/p-sga.svg" alt="SG Analytics" loading="lazy" /></li>
              <li aria-hidden="true"><img src="/img/p-amazon.png" alt="" loading="lazy" /></li>
              <li aria-hidden="true"><img src="/img/p-microsoft.png" alt="" loading="lazy" /></li>
              <li aria-hidden="true"><img src="/img/p-accenture.png" alt="" loading="lazy" /></li>
              <li aria-hidden="true"><img src="/img/p-capgemini.svg" alt="" loading="lazy" /></li>
              <li aria-hidden="true"><img src="/img/p-eaton.png" alt="" loading="lazy" /></li>
              <li aria-hidden="true"><img src="/img/p-sp-global.png" alt="" loading="lazy" /></li>
              <li aria-hidden="true"><img src="/img/p-tiger-analytics.png" alt="" loading="lazy" /></li>
              <li aria-hidden="true"><img src="/img/p-macquarie.png" alt="" loading="lazy" /></li>
              <li aria-hidden="true"><img src="/img/p-dxc.png" alt="" loading="lazy" /></li>
              <li aria-hidden="true"><img src="/img/p-apexon.png" alt="" loading="lazy" /></li>
              <li aria-hidden="true"><img src="/img/p-avid.png" alt="" loading="lazy" /></li>
              <li aria-hidden="true"><img src="/img/p-fossil.svg" alt="" loading="lazy" /></li>
              <li aria-hidden="true"><img src="/img/p-sga.svg" alt="" loading="lazy" /></li>
            </ul>
          </div>
          <span className="pill">★ CSR-1 registered with the Ministry of Corporate Affairs</span>
        </div>
      </section>
    </div>
  );
}
