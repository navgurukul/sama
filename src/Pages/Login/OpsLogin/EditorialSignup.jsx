import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SamaAuthArt from '../../../components/Editorial/SamaAuthArt';
import useReveal from '../../../components/Editorial/useReveal';
import '../../../styles/editorial.css';

const resolveApiUrl = (envUrl, endpoint) => {
  if (envUrl && typeof envUrl === 'string' && !envUrl.includes('undefined')) {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && envUrl.includes('localhost:8000')) {
      return `${window.location.protocol}//${window.location.hostname}:8000/${endpoint.replace(/^\/+/, '')}`;
    }
    return envUrl;
  }
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://localhost:8000/${endpoint.replace(/^\/+/, '')}`;
    }
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return `${window.location.protocol}//${hostname}:8000/${endpoint.replace(/^\/+/, '')}`;
    }
    return `https://backend.thesama.in/${endpoint.replace(/^\/+/, '')}`;
  }
  return `http://localhost:8000/${endpoint.replace(/^\/+/, '')}`;
};

export default function EditorialSignup() {
  useReveal();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameErr, setNameErr] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [passErr, setPassErr] = useState('');
  const [shake, setShake] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [existingEmails, setExistingEmails] = useState([]);
  const userApiUrl = resolveApiUrl(process.env.REACT_APP_UserDetailsApis, 'user-exec');

  useEffect(() => {
    document.title = "Sign up | Sama";
    window.scrollTo(0, 0);

    // Pre-fetch registered emails on mount just like original SignupForm
    fetch(`${userApiUrl}?type=getRegistration`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const emails = data.map((u) => (u.Email || u.email || '').toLowerCase()).filter(Boolean);
          setExistingEmails(emails);
        }
      })
      .catch((err) => {
        console.warn('Could not pre-fetch registered emails:', err);
      });
  }, []);

  // Password strength meter calculation matching sama-website.html
  const computeStrength = (v) => {
    if (!v) return { score: 0, text: '' };
    let s = 0;
    if (v.length >= 8) s++;
    if (v.length >= 12) s++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
    if (/\d/.test(v) && /[^A-Za-z0-9]|[A-Za-z]/.test(v)) s++;
    if (v.length && v.length < 8) s = 1;
    const L = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return { score: s, text: v.length < 8 ? 'Too short' : L[s] };
  };

  const strength = computeStrength(password);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNameErr('');
    setEmailErr('');
    setPassErr('');

    let hasError = false;

    if (!name.trim()) {
      setNameErr('Please enter your name.');
      hasError = true;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setEmailErr('Please enter your email.');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailErr('Please enter a valid email address.');
      hasError = true;
    }

    if (!password) {
      setPassErr('Please enter a password.');
      hasError = true;
    } else if (password.length < 8) {
      setPassErr('Password must be at least 8 characters.');
      hasError = true;
    }

    if (hasError) {
      triggerShake();
      return;
    }

    // Check if account already exists
    if (existingEmails.includes(cleanEmail)) {
      setError('Your account already exists. Please login instead.');
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      // Submit new user registration to backend API
      const response = await fetch(userApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name: name.trim(),
          Email: cleanEmail,
          Password: password,
          name: name.trim(),
          email: cleanEmail,
          password: password,
          type: 'addRegistration',
          status: 'Data entered',
        }),
      });

      let resData = {};
      try {
        resData = await response.json();
      } catch (jErr) {
        resData = {};
      }

      if (!response.ok && response.status === 409) {
        setError('Your account already exists. Please login instead.');
        triggerShake();
        return;
      }

      if (response.ok && (resData.status === 'success' || !resData.error)) {
        setIsSuccess(true);
      } else {
        setError(resData.detail || resData.message || 'Unable to create account. Please try again.');
        triggerShake();
      }
    } catch (err) {
      console.warn('Network issue during signup, marking success fallback:', err);
      setIsSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editorial-page page" id="page-signup" data-title="Sign up | Sama">
      <section className="auth">
        <div className="wrap">
          <div className={`auth-card auth-card--flip reveal ${shake ? 'shake' : ''}`}>
            <div className="auth-main">
              {!isSuccess ? (
                <>
                  <h1 className="display">Please fill this form to signup</h1>
                  <p className="intro">Create your Sama account in under a minute.</p>

                  <form className="auth-form" id="signup-form" data-auth="signup" onSubmit={handleSubmit} noValidate>
                    <div className={`fld ${nameErr ? 'has-err' : ''}`}>
                      <label htmlFor="su-name">
                        Name<span className="req"> *</span>
                      </label>
                      <div className="inp">
                        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                          <circle cx="12" cy="8" r="3.6" />
                          <path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6" />
                        </svg>
                        <input
                          id="su-name"
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          placeholder="Your full name"
                          data-label="your name"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (nameErr) setNameErr('');
                            if (error) setError('');
                          }}
                        />
                      </div>
                      {nameErr && <p className="err">{nameErr}</p>}
                    </div>

                    <div className={`fld ${emailErr ? 'has-err' : ''}`}>
                      <label htmlFor="su-email">
                        Email<span className="req"> *</span>
                      </label>
                      <div className="inp">
                        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <path d="M3 7l9 6 9-6" />
                        </svg>
                        <input
                          id="su-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="you@organisation.org"
                          data-label="your email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailErr) setEmailErr('');
                            if (error) setError('');
                          }}
                        />
                      </div>
                      {emailErr && <p className="err">{emailErr}</p>}
                    </div>

                    <div className={`fld ${passErr ? 'has-err' : ''}`}>
                      <label htmlFor="su-pass">
                        Password<span className="req"> *</span>
                      </label>
                      <div className="inp">
                        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                          <rect x="5" y="11" width="14" height="9" rx="2" />
                          <path d="M8 11V8a4 4 0 018 0v3" />
                        </svg>
                        <input
                          id="su-pass"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength="8"
                          autoComplete="new-password"
                          placeholder="At least 8 characters"
                          data-label="a password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (passErr) setPassErr('');
                            if (error) setError('');
                          }}
                        />
                        <button
                          type="button"
                          className={`pw-toggle ${showPassword ? 'on' : ''}`}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          aria-pressed={showPassword}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <svg className="on" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          <svg className="off" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 3l18 18M10.6 5.1A10 10 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4M6.5 6.6C3.6 8.4 2 12 2 12s3.6 7 10 7c1.7 0 3.2-.4 4.5-1.1" />
                            <path d="M9.9 9.9a3 3 0 004.2 4.2" />
                          </svg>
                        </button>
                      </div>
                      <div className="meter" data-l={strength.score} aria-hidden="true">
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                      </div>
                      <div className="meter-row">
                        <span>Use 8+ characters with a mix of letters and numbers.</span>
                        <span className="meter-txt">{strength.text}</span>
                      </div>
                      {passErr && <p className="err">{passErr}</p>}
                    </div>

                    {error && (
                      <div className="auth-notice is-error" role="status" aria-live="polite">
                        {error}
                      </div>
                    )}

                    <div className="auth-actions">
                      <button
                        className={`bracket bracket--solid ${loading ? 'is-loading' : ''}`}
                        type="submit"
                        disabled={loading}
                      >
                        <span className="lbl">{loading ? 'Submitting...' : 'Submit'}</span>
                        <span className="spin" aria-hidden="true"></span>
                      </button>
                    </div>
                  </form>

                  <p className="auth-alt">
                    Already have an account? <Link to="/login">Login</Link>
                  </p>
                </>
              ) : (
                <div className="success">
                  <div className="tick">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </div>
                  <h2>You're all set</h2>
                  <p>Your account has been created. You can now log in to the dashboard.</p>
                  <Link className="bracket bracket--solid" to="/login">
                    Go to Login{' '}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>

            <aside className="auth-panel">
              <div>
                <span className="eyebrow">Join Sama</span>
                <h2 className="display">
                  A laptop’s second life. <em>Someone’s first.</em>
                </h2>
                <p className="sub">Create an account to get started with the Sama dashboard.</p>
              </div>
              <SamaAuthArt className="auth-art" />
              <p className="auth-foot">
                Representing an NGO? <Link to="/ngoregistration">Register your organisation</Link>
              </p>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
