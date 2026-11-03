import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

const PARTNERS = [
  { name: 'Amazon', img: '/img/p-amazon.png' },
  { name: 'Microsoft', img: '/img/p-microsoft.png' },
  { name: 'Accenture', img: '/img/p-accenture.png' },
  { name: 'Capgemini', img: '/img/p-capgemini.svg' },
  { name: 'Eaton', img: '/img/p-eaton.png' },
  { name: 'S&P Global', img: '/img/p-sp-global.png' },
  { name: 'Tiger Analytics', img: '/img/p-tiger-analytics.png' },
  { name: 'Macquarie', img: '/img/p-macquarie.png' },
  { name: 'DXC Technology', img: '/img/p-dxc.png' },
  { name: 'Apexon', img: '/img/p-apexon.png' },
  { name: 'Avid Learning', img: '/img/p-avid.png' },
  { name: 'Fossil', img: '/img/p-fossil.svg' },
  { name: 'SG Analytics', img: '/img/p-sga.svg' },
];

const FAQS = [
  {
    q: "What types and conditions of IT assets does Sama accept from corporations?",
    a: "Sama accepts laptops, desktops, monitors, MacBooks, tablets, and related peripherals (chargers, docking stations). Devices do not need to be in perfect working condition — our technical refurbishment team repairs hardware, replaces damaged screens/batteries, and upgrades RAM and SSD storage before deployment."
  },
  {
    q: "How does Sama guarantee enterprise data security and confidentiality?",
    a: "Data sanitization is our top operational priority. Every device undergoes certified multi-pass storage data erasure following NIST 800-88 standards. We issue serialized, tamper-proof Certificates of Data Erasure / Destruction for your corporate security team, IT asset management (ITAM) audit, and CISO compliance."
  },
  {
    q: "Is laptop donation eligible under CSR Section 135 of the Companies Act?",
    a: "Yes. S.A.M.A. Digital Foundation is registered with the Ministry of Corporate Affairs under Form CSR-1 (Registration No. CSR00078179, CIN: U85500PN2024NPL233531). Donations and partnership funding qualify under Schedule VII of the Companies Act, 2013 for promoting digital education and sustainable e-waste management."
  },
  {
    q: "Who handles logistics, packaging, and pickup across India?",
    a: "Sama manages the complete chain-of-custody reverse logistics. Our verified logistics partners manage doorstep pickup, secure crating, and tracked transportation across all major tech hubs including Bengaluru, Pune, Mumbai, Hyderabad, Delhi NCR, and Chennai at zero logistical hassle to your IT team."
  },
  {
    q: "Do corporate partners receive ESG carbon offset and sustainability reporting?",
    a: "Yes. For every batch of retired devices repurposed, Sama provides an ESG Impact Certificate calculating electronic waste diverted from landfills and estimated Scope 3 GHG carbon emissions avoided by extending the device lifecycle by 3–4 additional years."
  },
  {
    q: "How does our company track where our refurbished laptops are deployed?",
    a: "Every device is tagged with a unique Sama Asset ID. Once refurbished, laptops are assigned to verified grassroots NGOs, schools, or community Sama Saathi centres. Corporate partners receive a comprehensive deployment impact report detailing geographic distribution, student beneficiary demographics, and educational outcomes."
  }
];

export default function EditorialCorporatePartners() {
  useReveal();

  useEffect(() => {
    document.title = "Corporate Laptop Donation & E-Waste CSR Partnerships | Sama Digital Foundation";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="editorial-page page" id="page-corporate-partners">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="wrap reveal">
          <div className="crumbs">
            <Link to="/">Home</Link> / <b>Corporate Partnerships</b>
          </div>
          <span className="eyebrow">Enterprise IT Asset Disposal · CSR Section 135 · ESG Impact</span>
          <h1 className="display h1 mt-s">
            Turn your company’s retired laptops into <em>someone’s first classroom.</em>
          </h1>
          <p className="lede mt-m">
            We partner with leading enterprises across India to responsibly offboard decommissioned IT hardware, 
            guarantee NIST 800-88 certified data erasure, and deploy refurbished laptops to empower 
            underserved girls, students, and first-time digital builders across 21 states.
          </p>
          <div className="give-nav mt-l" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Link to="/donate" className="bracket bracket--solid" style={{ textDecoration: 'none' }}>
              Offboard Device Batch <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </Link>
            <a href="#engagement-tracks" className="bracket" style={{ textDecoration: 'none' }}>
              Partnership Models
            </a>
            <a href="#compliance" className="bracket" style={{ textDecoration: 'none' }}>
              Data Erasure &amp; CSR Compliance
            </a>
            <a href="#corporate-faq" className="bracket" style={{ textDecoration: 'none' }}>
              Enterprise FAQs
            </a>
          </div>
        </div>
      </section>

      {/* Corporate Partner Logos */}
      <section className="sec" style={{ paddingTop: '20px', paddingBottom: '40px', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <p className="eyebrow" style={{ textAlign: 'center', marginBottom: '20px' }}>
            Trusted by technology, finance &amp; manufacturing leaders across India
          </p>
          <div className="marquee" aria-label="Corporate Partners">
            <ul className="marquee__track">
              {PARTNERS.map((p, idx) => (
                <li key={idx}>
                  <img src={p.img} alt={p.name} loading="lazy" />
                </li>
              ))}
              {PARTNERS.map((p, idx) => (
                <li key={`dup-${idx}`} aria-hidden="true">
                  <img src={p.img} alt="" loading="lazy" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Enterprise Collaboration */}
      <section className="sec" id="compliance">
        <div className="wrap">
          <div className="reveal" style={{ maxWidth: '780px', marginBottom: '48px' }}>
            <span className="give-tag">Enterprise Standards</span>
            <h2 className="display h2 mt-s">
              Built for your <em>CISO, IT Operations, and CSR Committee.</em>
            </h2>
            <p className="lede mt-m">
              Enterprise laptop donation requires ironclad data security, documented compliance, 
              and zero operational friction. Here is how Sama delivers turnkey peace of mind.
            </p>
          </div>

          <div className="rd-grid reveal" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            <div className="rd-card">
              <b>01</b>
              <h4>Certified NIST 800-88 Data Erasure</h4>
              <p>
                Every drive is sanitized using multi-pass software erasure meeting global NIST 800-88 / DoD standards. 
                Your IT security team receives serialized, tamper-proof Certificates of Data Destruction.
              </p>
            </div>

            <div className="rd-card">
              <b>02</b>
              <h4>Seamless Pan-India Reverse Logistics</h4>
              <p>
                We coordinate secure chain-of-custody pickup from your corporate offices or data centers across 
                21 Indian states. Dedicated logistics handlers inspect, pack, and transport device batches.
              </p>
            </div>

            <div className="rd-card">
              <b>03</b>
              <h4>Section 135 CSR-1 Compliance</h4>
              <p>
                Registered under MCA Form CSR-1 (Reg. No. CSR00078179, CIN U85500PN2024NPL233531). 
                Partners receive 80G tax receipts and audited utilization certificates for annual Board reports.
              </p>
            </div>

            <div className="rd-card rd-card--light">
              <b>04</b>
              <h4>Scope 3 ESG Carbon Accounting</h4>
              <p>
                Prevent toxic e-waste in Indian landfills and earn verified ESG carbon avoidance metrics. 
                Extending laptop lifecycles cuts up to 316 kg of CO₂e per device for corporate sustainability reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Corporate Engagement Tracks */}
      <section className="sec bg-stone" id="engagement-tracks">
        <div className="wrap">
          <div className="reveal" style={{ maxWidth: '760px', marginBottom: '40px' }}>
            <span className="give-tag">Engagement Tracks</span>
            <h2 className="display h2 mt-s">
              Four ways your enterprise can <em>collaborate with Sama.</em>
            </h2>
            <p className="lede mt-m">
              Whether you are refreshing 500 company laptops or engaging your engineering workforce in volunteerism, 
              we tailor the partnership to match your corporate goals.
            </p>
          </div>

          <div className="split" style={{ alignItems: 'stretch', gap: '32px' }}>
            <div className="corp-card reveal" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>Track 01 · Corporate ITAM</span>
              <h3 className="h3 mt-xs">Bulk IT Asset Offboarding</h3>
              <p className="mt-s" style={{ color: 'var(--ink-2)', flexGrow: 1 }}>
                Decommissioning company laptops, monitors, or desktops at end-of-lease or 3–5 year tech refresh? 
                Hand over your retired devices to Sama with complete chain-of-custody tracking, certified data erasure, 
                and zero disposal overhead.
              </p>
              <div className="mt-m">
                <Link to="/donate" className="bracket bracket--solid">Offboard Corporate Devices →</Link>
              </div>
            </div>

            <div className="corp-card reveal" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>Track 02 · Employee Engagement</span>
              <h3 className="h3 mt-xs">The Renew Desk (Office Pop-up)</h3>
              <p className="mt-s" style={{ color: 'var(--ink-2)', flexGrow: 1 }}>
                A pop-up refurbishment station in your corporate cafeteria or town hall. Employees spend 20 minutes 
                working alongside our technicians to clean, test, and prepare laptops, leaving a signed welcome note 
                for the student who receives it next.
              </p>
              <div className="mt-m">
                <Link to="/giving#employee" className="bracket">Learn About Renew Desk →</Link>
              </div>
            </div>
          </div>

          <div className="split mt-m" style={{ alignItems: 'stretch', gap: '32px' }}>
            <div className="corp-card reveal" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>Track 03 · Corporate Hackathons</span>
              <h3 className="h3 mt-xs">Build for Good Hackathon</h3>
              <p className="mt-s" style={{ color: 'var(--ink-2)', flexGrow: 1 }}>
                Host a high-energy engineering hackathon where corporate software developers and hardware engineers 
                collaborate to restore laptops, configure Linux-based learning distributions, and build localized educational tools.
              </p>
              <div className="mt-m">
                <Link to="/bfg" className="bracket">Explore Build for Good →</Link>
              </div>
            </div>

            <div className="corp-card reveal" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>Track 04 · Strategic CSR Sponsorship</span>
              <h3 className="h3 mt-xs">Sponsor a Community Digital Lab</h3>
              <p className="mt-s" style={{ color: 'var(--ink-2)', flexGrow: 1 }}>
                Direct corporate CSR funds to equip an entire government school or Sama Saathi learning centre 
                with 20–30 refurbished laptops, internet connectivity, and an AI &amp; STEM literacy curriculum. 
                Complete with company branding and annual impact reporting.
              </p>
              <div className="mt-m">
                <Link to="/labs" className="bracket">Explore Digital Labs →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics Banner */}
      <section className="sec" style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="reveal" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 40px' }}>
            <span className="eyebrow">Measurable Grassroots Reach</span>
            <h2 className="display h2 mt-s">Where your corporate hardware creates impact.</h2>
          </div>
          <div className="rd-facts reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div style={{ textAlign: 'center', padding: '24px', background: 'var(--sand)', borderRadius: '8px' }}>
              <p style={{ fontSize: '36px', fontWeight: '700', color: 'var(--moss)', margin: 0 }}>18,500+</p>
              <p style={{ marginTop: '8px', fontSize: '15px', color: 'var(--ink-2)' }}>Laptops &amp; Devices Deployed</p>
            </div>
            <div style={{ textAlign: 'center', padding: '24px', background: 'var(--sand)', borderRadius: '8px' }}>
              <p style={{ fontSize: '36px', fontWeight: '700', color: 'var(--moss)', margin: 0 }}>60+</p>
              <p style={{ marginTop: '8px', fontSize: '15px', color: 'var(--ink-2)' }}>Grassroots NGO Partners</p>
            </div>
            <div style={{ textAlign: 'center', padding: '24px', background: 'var(--sand)', borderRadius: '8px' }}>
              <p style={{ fontSize: '36px', fontWeight: '700', color: 'var(--moss)', margin: 0 }}>21</p>
              <p style={{ marginTop: '8px', fontSize: '15px', color: 'var(--ink-2)' }}>Indian States Reached</p>
            </div>
            <div style={{ textAlign: 'center', padding: '24px', background: 'var(--sand)', borderRadius: '8px' }}>
              <p style={{ fontSize: '36px', fontWeight: '700', color: 'var(--moss)', margin: 0 }}>100%</p>
              <p style={{ marginTop: '8px', fontSize: '15px', color: 'var(--ink-2)' }}>Data Destruction Compliance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate FAQs */}
      <section className="sec bg-stone" id="corporate-faq">
        <div className="wrap">
          <div className="reveal" style={{ maxWidth: '780px', marginBottom: '40px' }}>
            <span className="give-tag">Common Questions</span>
            <h2 className="display h2 mt-s">Frequently asked corporate questions.</h2>
            <p className="lede mt-m">
              Key operational, legal, and compliance details for enterprise asset managers and CSR leaders.
            </p>
          </div>

          <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {FAQS.map((faq, i) => (
              <details key={i} className="corp-card" style={{ cursor: 'pointer' }}>
                <summary style={{ fontSize: '18px', fontWeight: '600', color: 'var(--ink)' }}>
                  {faq.q}
                </summary>
                <p style={{ marginTop: '14px', lineHeight: '1.65', color: 'var(--ink-2)' }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Contact & Statutory Disclosures Card */}
      <section className="sec" id="contact-corporate">
        <div className="wrap">
          <div className="corp-card reveal" style={{ background: 'var(--moss)', color: '#fff', padding: '48px 36px', borderRadius: '12px' }}>
            <div className="split" style={{ alignItems: 'center' }}>
              <div>
                <span className="eyebrow" style={{ color: 'var(--sand)' }}>Start a Corporate Partnership</span>
                <h2 className="display h2 mt-s" style={{ color: '#fff' }}>
                  Ready to schedule your company’s device offboarding?
                </h2>
                <p className="lede mt-m" style={{ color: 'rgba(255,255,255,0.92)' }}>
                  Contact our Corporate Operations team directly to register your device batches, 
                  arrange logistics, or schedule an exploratory CSR discussion.
                </p>
                <div className="mt-l" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                  <Link to="/donate" className="bracket bracket--solid" style={{ background: '#fff', color: 'var(--moss)', borderColor: '#fff' }}>
                    Donate Corporate Laptops →
                  </Link>
                  <a href="mailto:operations@thesama.in" className="bracket" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }}>
                    Email operations@thesama.in
                  </a>
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '24px', borderRadius: '8px', minWidth: '280px' }}>
                <h3 className="h4" style={{ color: '#fff' }}>Statutory Transparency</h3>
                <p style={{ fontSize: '13px', marginTop: '8px', lineHeight: '1.6', color: 'rgba(255,255,255,0.85)' }}>
                  <b>S.A.M.A. Digital Foundation</b><br />
                  CIN: U85500PN2024NPL233531<br />
                  Form CSR-1 Reg: Ministry of Corporate Affairs<br />
                  Registered Office: Pune, Maharashtra
                </p>
                <Link to="/ngo-information" style={{ display: 'inline-block', marginTop: '12px', color: 'var(--sand)', fontSize: '13px', textDecoration: 'underline' }}>
                  View Full Statutory NGO Information &amp; Directors’ Report →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
