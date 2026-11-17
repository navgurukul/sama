/**
 * Website analytics events for Google Analytics 4.
 *
 * The GA4 tag itself is loaded in public/index.html, and GA4 enhanced
 * measurement already records page views, scrolls, outbound clicks and file
 * downloads. This module adds the events GA4 cannot see on its own:
 *
 *   lead_form_start    first interaction with a lead form   (form_name)
 *   <form>_submit      a form the server accepted            (see SUBMIT_EVENTS)
 *   lead_form_error    the server rejected a submission      (form_name)
 *   cta_click          a click on a donate, contact, partner, email or social link
 *
 * Submit events fire only after a successful server response, so they count
 * completed inquiries, never button presses.
 *
 * Staff devices and local development are tagged traffic_type=internal so
 * GA4's internal-traffic filter keeps them out of the reports.
 *
 * Nothing personal (names, emails, phone numbers, free text) is ever sent.
 * Every call is a no-op when the GA4 tag is missing or blocked, so analytics
 * can never break a page or a form.
 */

const STAFF_ROLES = ['admin', 'ops'];
const STAFF_DEVICE_KEY = '_SamaStaffDevice_';
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0'];

/** Completed-submission event for each form, as named in the monthly report. */
const SUBMIT_EVENTS = {
  donate_corporate: 'corporate_donation_submit',
  donate_individual: 'individual_donation_submit',
  donate_support: 'support_inquiry_submit',
  laptop_request: 'laptop_request_submit',
  book_call: 'partnership_inquiry_submit',
  ngo_registration: 'ngo_registration_submit',
  newsletter: 'newsletter_signup',
};

/** The contact form's topic decides which kind of inquiry it is. */
const CONTACT_TOPIC_EVENTS = {
  'Corporate partnership': 'partnership_inquiry_submit',
  'Renew Desk at our office': 'partnership_inquiry_submit',
  'Bringing the Saathi model to my community': 'partnership_inquiry_submit',
  'Donating laptops': 'individual_donation_submit',
  'I want to become a Sama Saathi': 'support_inquiry_submit',
  Mentoring: 'support_inquiry_submit',
  'Something else': 'contact_submit',
};

/** Tabs on /donate mapped to the form names above. */
export const DONATE_FORM_NAMES = {
  give_corporate: 'donate_corporate',
  give_individual: 'donate_individual',
  financial_volunteer: 'donate_support',
  need_individual: 'laptop_request',
};

const send = (...args) => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag(...args);
    }
  } catch {
    // Analytics must never interfere with the page.
  }
};

const readStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const slug = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);

const currentRole = () => {
  const raw = readStorage('role');
  if (!raw) return '';
  try {
    return String(JSON.parse(raw) || '').toLowerCase();
  } catch {
    return String(raw).toLowerCase();
  }
};

/**
 * Tag this browser's events as internal when it belongs to Sama staff or is a
 * local build. A staff device stays tagged after logout, so staff browsing the
 * public site do not inflate the visitor numbers. Logged-in NGO, donor and
 * school users get a sama_role user property instead, so their dashboard use
 * can be separated from public visits without being discarded.
 */
export const syncVisitorContext = () => {
  const role = currentRole();
  const loggedIn = Boolean(readStorage('isLoggedIn'));

  if (loggedIn && STAFF_ROLES.some((staff) => role.includes(staff))) {
    try {
      localStorage.setItem(STAFF_DEVICE_KEY, '1');
    } catch {
      // Without storage the flag lasts for this page only.
    }
  }

  const isLocal = typeof window !== 'undefined' && LOCAL_HOSTS.includes(window.location.hostname);
  if (isLocal || readStorage(STAFF_DEVICE_KEY)) {
    send('set', { traffic_type: 'internal' });
  }
  if (loggedIn && role) {
    send('set', 'user_properties', { sama_role: slug(role) });
  }
};

export const trackEvent = (name, params = {}) => send('event', name, params);

/** Record a submission the server accepted. */
export const trackFormSubmit = (formName, topic) => {
  const event =
    formName === 'contact'
      ? CONTACT_TOPIC_EVENTS[topic] || 'contact_submit'
      : SUBMIT_EVENTS[formName];
  if (!event) return;
  const params = { form_name: formName };
  // Only known topics are sent: the contact form also accepts ?topic= from the URL.
  if (topic && CONTACT_TOPIC_EVENTS[topic]) params.inquiry_topic = slug(topic);
  trackEvent(event, params);
};

/** Record a submission the server rejected or that failed to send. */
export const trackFormError = (formName) => trackEvent('lead_form_error', { form_name: formName });

/** Classify a link for cta_click; null means the click is not a CTA. */
const ctaTypeForHref = (href) => {
  if (!href) return null;
  const lower = href.toLowerCase();
  if (lower.startsWith('mailto:')) return 'email';
  if (lower.startsWith('tel:')) return 'phone';
  if (lower.includes('wa.me/') || lower.includes('whatsapp.com')) return 'whatsapp';
  if (lower.includes('linkedin.com') || lower.includes('instagram.com')) return 'social';

  let url;
  try {
    url = new URL(href, window.location.origin);
  } catch {
    return null;
  }
  if (url.origin !== window.location.origin) return null;
  const path = url.pathname.toLowerCase();
  if (path.startsWith('/donate')) return 'donate';
  if (path.startsWith('/contact')) return 'contact';
  if (path.startsWith('/ngoregistration')) return 'ngo_registration';
  if (path.startsWith('/giving')) return 'giving';
  return null;
};

/** Destination without query strings or email addresses. */
const safeDestination = (href, ctaType) => {
  if (['email', 'phone', 'whatsapp'].includes(ctaType)) return ctaType;
  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin ? url.pathname : url.hostname + url.pathname;
  } catch {
    return '';
  }
};

// GA4 forbids email addresses in event data, even in a link's visible text.
const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/g;

const linkText = (el) =>
  (el.getAttribute('aria-label') || el.innerText || el.textContent || '')
    .replace(EMAIL_PATTERN, '[email]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);

const handleClick = (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  // Explicitly marked controls (buttons that open a form, donate tabs).
  const marked = target.closest('[data-analytics-cta]');
  if (marked) {
    trackEvent('cta_click', {
      cta_type: marked.getAttribute('data-analytics-cta'),
      link_text: linkText(marked),
    });
    return;
  }

  const link = target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  const ctaType = ctaTypeForHref(href);
  if (!ctaType) return;
  trackEvent('cta_click', {
    cta_type: ctaType,
    link_text: linkText(link),
    link_destination: safeDestination(href, ctaType),
  });
};

// One lead_form_start per form per page load.
const startedForms = new Set();

const handleFocus = (event) => {
  const target = event.target instanceof Element ? event.target : null;
  // Only fields count: buttons inside a form (such as the /donate tabs) are not a start.
  if (!target || !target.matches('input, select, textarea')) return;
  const form = target.closest('form[data-analytics-form]');
  if (!form) return;
  const formName = form.getAttribute('data-analytics-form');
  if (!formName || startedForms.has(formName)) return;
  startedForms.add(formName);
  trackEvent('lead_form_start', { form_name: formName });
};

let installed = false;

/** Call once at startup. Listens at the document level, so no page needs changes for CTA clicks. */
export const installAnalytics = () => {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  syncVisitorContext();
  document.addEventListener('click', handleClick, { capture: true, passive: true });
  document.addEventListener('focusin', handleFocus, { passive: true });
};
