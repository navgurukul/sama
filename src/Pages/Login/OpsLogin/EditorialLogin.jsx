import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SamaAuthArt from '../../../components/Editorial/SamaAuthArt';
import useReveal from '../../../components/Editorial/useReveal';
import '../../../styles/editorial.css';

// Helper to resolve backend API URLs safely across localhost, LAN IPs, and production
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

export default function EditorialLogin() {
  useReveal();

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [passErr, setPassErr] = useState('');
  const [shake, setShake] = useState(false);

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const userApiUrl = resolveApiUrl(process.env.REACT_APP_UserDetailsApis, 'user-exec');
  const ngoApiUrl = resolveApiUrl(process.env.REACT_APP_NgoInformationApi, 'ngo-exec');

  useEffect(() => {
    document.title = "Login to Dashboard | Sama";
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && forgotOpen) {
        setForgotOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [forgotOpen]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailErr('');
    setPassErr('');

    let hasValidationError = false;
    const trimmedIdentifier = email.trim();
    if (!trimmedIdentifier) {
      setEmailErr('Please enter your email or School ID.');
      hasValidationError = true;
    } else if (trimmedIdentifier.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedIdentifier)) {
      setEmailErr('Please enter a valid email address.');
      hasValidationError = true;
    }

    if (!password) {
      setPassErr('Please enter your password.');
      hasValidationError = true;
    }

    if (hasValidationError) {
      triggerShake();
      return;
    }

    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch(userApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'login',
          email: trimmedIdentifier,
          password: password,
        }),
        signal: controller.signal,
      });

      let data = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        data = {};
      }

      if (!response.ok || data.status === 'error' || data.error) {
        setError(data.message || data.detail || 'Invalid email or password.');
        triggerShake();
        return;
      }

      if ((data.status === 'success' || response.ok) && data.user) {
        const user = data.user;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('role', JSON.stringify(user.Role));
        localStorage.setItem(
          '_AuthSama_',
          JSON.stringify([
            {
              name: user.Name,
              email: user.Email,
              role: user.Role,
              NgoId: user['Ngo Id'],
              Type: user.Type,
              Doner: user.Doner,
              Udise: user.Udise,
            },
          ])
        );

        const role = (user.Role || '').toLowerCase();

        if (role.includes('admin')) {
          navigate('/ngo');
        } else if (role.includes('doner')) {
          navigate('/donorcsr');
        } else if (role.includes('school')) {
          navigate('/afe');
        } else if (role.includes('ops')) {
          navigate('/ops');
        } else if (role.includes('ngo')) {
          try {
            const regRes = await fetch(`${ngoApiUrl}?type=registration`);
            const regData = await regRes.json();
            const findUser = regData.data?.find(
              (item) =>
                item.Id === user['Ngo Id'] ||
                item.displayId === user['Ngo Id'] ||
                item.email?.toLowerCase() === user.Email?.toLowerCase()
            );

            if (findUser) {
              const docRes = await fetch(
                `${ngoApiUrl}?type=MultipleDocsGet&userId=${user['Ngo Id']}`
              );
              const docData = await docRes.json();

              if (!docData.isDataAvailable) {
                navigate('/documentupload');
                return;
              }

              const failed = [];
              const pending = [];
              const emptyStatuses = [];
              for (const [key, value] of Object.entries(docData)) {
                if (value && typeof value === 'object' && 'status' in value) {
                  if (value.status !== 'Success' && value.status !== 'Pending Verification') {
                    if (value.status === '') {
                      emptyStatuses.push(key);
                    }
                    failed.push(key);
                  } else if (value.status === 'Pending Verification') {
                    pending.push(key);
                  }
                }
              }

              if (failed.length > 0) {
                if (failed.includes('FCRA Approval') && failed.length === 1 && emptyStatuses.length === 1) {
                  if (findUser['Ngo Type'] === '1 to one') {
                    navigate('/beneficiarydata');
                    return;
                  } else {
                    navigate('/preliminary');
                    return;
                  }
                }
                navigate('/attentionneeded', { state: { failedStatuses: failed } });
                return;
              }

              if (pending.length > 0) {
                navigate('/submission-success');
                return;
              }

              const allSuccess = Object.values(docData)
                .filter((v) => typeof v === 'object' && 'status' in v)
                .every((v) => v.status === 'Success');

              if (allSuccess) {
                if (findUser['Ngo Type'] === '1 to one') {
                  navigate('/beneficiarydata');
                } else {
                  navigate('/preliminary');
                }
              } else {
                navigate('/preliminary');
              }
            } else {
              navigate('/preliminary');
            }
          } catch (ngoErr) {
            console.error('Error fetching NGO status:', ngoErr);
            navigate('/preliminary');
          }
        } else {
          navigate('/');
        }
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
        triggerShake();
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Login service timed out. Please try again.');
      } else if (
        err.message &&
        (err.message.includes('fetch') ||
          err.message.includes('NetworkError') ||
          err.message.includes('Load failed'))
      ) {
        setError(
          'Unable to reach backend server. Please verify your connection or ensure backend is running on port 8000.'
        );
      } else {
        setError(err.message || 'Unable to connect to the login service.');
      }
      triggerShake();
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotMessage('Please enter your email.');
      return;
    }
    setForgotLoading(true);
    setForgotMessage('');
    try {
      const res = await fetch(userApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim(), type: 'forgotPassword' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.status === 'success' || !data.error)) {
        setForgotMessage(
          data.message ||
            'If your email is registered, reset instructions and your temporary password have been sent to your inbox.'
        );
      } else {
        setForgotMessage(
          data.detail ||
            data.message ||
            'An error occurred. Please write directly to operations@thesama.in'
        );
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setForgotMessage('If your email is registered, reset instructions have been sent to your email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="editorial-page page" id="page-login" data-title="Login to Dashboard | Sama">
      <section className="auth">
        <div className="wrap">
          <div className={`auth-card reveal ${shake ? 'shake' : ''}`}>
            <aside className="auth-panel">
              <div>
                <span className="eyebrow">Partner dashboard</span>
                <h2 className="display">
                  Welcome <em>back.</em>
                </h2>
                <p className="sub">Sign in to access your Sama dashboard.</p>
              </div>
              <SamaAuthArt className="auth-art" />
              <p className="auth-foot">
                New NGO partner? <Link to="/ngoregistration">Register your organisation</Link>
              </p>
            </aside>

            <div className="auth-main">
              <h1 className="display">Login to Dashboard</h1>
              <p className="intro">Enter your details to continue.</p>

              <form className="auth-form" id="login-form" data-auth="login" onSubmit={handleSubmit} noValidate>
                <div className={`fld ${emailErr ? 'has-err' : ''}`}>
                  <label htmlFor="lg-email">User Email or School ID</label>
                  <div className="inp">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                    <input
                      id="lg-email"
                      name="email"
                      type="text"
                      required
                      autoComplete="username"
                      placeholder="you@organisation.org or School ID"
                      data-label="your email or School ID"
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
                  <div className="lblrow">
                    <label htmlFor="lg-pass">Password</label>
                    <button
                      type="button"
                      className="link-btn"
                      style={{ padding: 0, textDecoration: 'underline', color: 'var(--sage)', fontSize: '13px', fontWeight: 500 }}
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotOpen(true);
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="inp">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V8a4 4 0 018 0v3" />
                    </svg>
                    <input
                      id="lg-pass"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      data-label="your password"
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
                    <span className="lbl">{loading ? 'Logging in...' : 'Login'}</span>
                    <span className="spin" aria-hidden="true"></span>
                  </button>
                  <Link className="bracket bracket--line" to="/signup">
                    Sign Up
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div
          className="editorial-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setForgotOpen(false)}
        >
          <div
            className="editorial-modal"
            style={{ maxWidth: '460px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="editorial-modal-close"
              onClick={() => setForgotOpen(false)}
              aria-label="Close"
              title="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div style={{ paddingRight: '36px' }}>
              <h3 style={{ fontSize: '22px', marginBottom: '8px', fontFamily: 'var(--sans)', fontWeight: 700 }}>
                Reset Password
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                Enter your registered email address and we'll send you instructions to reset your password.
              </p>
            </div>
            <form onSubmit={handleForgotPassword} style={{ display: 'grid', gap: '16px', marginTop: '4px' }}>
              <div className="fld">
                <label htmlFor="fg-email">Email Address</label>
                <div className="inp">
                  <input
                    id="fg-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@organisation.org"
                  />
                </div>
              </div>
              {forgotMessage && (
                <div style={{ padding: '10px 14px', background: 'var(--mint)', color: 'var(--green)', borderRadius: '8px', fontSize: '13px', lineHeight: 1.5 }}>
                  {forgotMessage}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setForgotOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bracket bracket--solid"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
