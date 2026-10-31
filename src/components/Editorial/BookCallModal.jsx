import React, { useState, useEffect } from 'react';

export default function BookCallModal({ isOpen, onClose, initialTopic = 'Renew Desk at our office' }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    preferredTime: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset form when reopened
  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Please fill in your name, work email, and phone number.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const apiBase = process.env.REACT_APP_NgoInformationApi
        ? process.env.REACT_APP_NgoInformationApi.replace(/\/ngo-exec.*$/, '')
        : 'http://localhost:8000';

      const payload = {
        formType: 'book_call',
        topic: initialTopic,
        name: formData.name.trim(),
        firstName: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        companyName: formData.companyName.trim(),
        preferredTime: formData.preferredTime.trim(),
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

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting call booking request:', err);
      setError('Could not submit your request. Please try again or write directly to operations@thesama.in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="editorial-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="editorial-modal" style={{ maxWidth: '560px' }}>
        <button
          type="button"
          className="editorial-modal-close"
          onClick={onClose}
          aria-label="Close"
          title="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#EAF3EB',
                color: 'var(--sage, #5C785A)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
                fontSize: '26px',
                fontWeight: 'bold',
              }}
            >
              ✓
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '24px' }}>Request Received!</h3>
            <p style={{ color: 'var(--muted, #666)', fontSize: '15px', lineHeight: '1.6', margin: '0 0 20px' }}>
              Thank you, <b>{formData.name}</b>. Your request to book a 30-minute session has been sent directly to our operations team at <b>operations@thesama.in</b> with <b>brendon@thesama.in</b> in CC. We will get in touch shortly to confirm the meeting.
            </p>
            <button
              type="button"
              className="bracket bracket--solid"
              onClick={onClose}
              style={{ padding: '10px 24px' }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ paddingRight: '36px' }}>
              <span className="eyebrow" style={{ color: 'var(--sage, #5C785A)' }}>Book 30 minutes</span>
              <h3 style={{ margin: '4px 0 0', fontSize: '22px' }}>Let’s set one up</h3>
              <p className="mt-s" style={{ color: 'var(--muted, #666)', fontSize: '14px', lineHeight: '1.5' }}>
                Walk through dates with our team to bring a Renew Desk or digital initiative to your office.
              </p>
            </div>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  background: '#FDF2F2',
                  border: '1px solid #F0B3B3',
                  borderRadius: '8px',
                  color: '#9C2B2B',
                  fontSize: '13.5px',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
              <div className="two-col">
                <div className="fld">
                  <label htmlFor="bkm-name" style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Your Name *
                  </label>
                  <input
                    id="bkm-name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Priyesh Sharma"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6D0C5' }}
                  />
                </div>
                <div className="fld">
                  <label htmlFor="bkm-company" style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Company / Organisation *
                  </label>
                  <input
                    id="bkm-company"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Acme Corp"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6D0C5' }}
                  />
                </div>
              </div>

              <div className="two-col">
                <div className="fld">
                  <label htmlFor="bkm-email" style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Work Email *
                  </label>
                  <input
                    id="bkm-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6D0C5' }}
                  />
                </div>
                <div className="fld">
                  <label htmlFor="bkm-phone" style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Phone / WhatsApp *
                  </label>
                  <input
                    id="bkm-phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6D0C5' }}
                  />
                </div>
              </div>

              <div className="fld">
                <label htmlFor="bkm-time" style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  Preferred Date & Time / Notes <span style={{ fontWeight: 'normal', color: '#888' }}>(Optional)</span>
                </label>
                <input
                  id="bkm-time"
                  name="preferredTime"
                  type="text"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  placeholder="e.g. Next Tuesday afternoon or Friday 11 AM"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6D0C5' }}
                />
              </div>

              <div className="fld">
                <label htmlFor="bkm-msg" style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  Additional Notes <span style={{ fontWeight: 'normal', color: '#888' }}>(Optional)</span>
                </label>
                <textarea
                  id="bkm-msg"
                  name="message"
                  rows={2}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Approximate team size, office location, or questions..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6D0C5', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: '#777' }}>
                  Directly dispatched to operations team
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bracket bracket--solid"
                  style={{ opacity: submitting ? 0.7 : 1, padding: '10px 22px' }}
                >
                  {submitting ? 'Submitting...' : 'Request 30-min call →'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
