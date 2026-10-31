import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

export default function EditorialCorporate() {
  useReveal();

  useEffect(() => {
    document.title = "NGO Information | Sama";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="editorial-page page" id="page-corporate">
<section className="page-hero">
  <div className="wrap reveal">
    <div className="crumbs"><Link to="/">Home</Link> / <b>NGO Information</b></div>
    <span className="eyebrow">Statutory disclosures</span>
    <h1 className="display h1 mt-s">NGO <em>information.</em></h1>
    <p className="lede mt-m">Registration details, directors and the Directors’ Report of S.A.M.A. Digital Foundation, published as required under the Companies Act, 2013.</p>
  </div>
</section>
<section className="sec" id="details">
  <div className="wrap corp-grid">
    <div className="corp-card reveal">
      <h2 className="corp-h">Registration details</h2>
      <dl className="corp-dl">
        <div><dt>Name of the company</dt><dd>S.A.M.A. Digital Foundation</dd></div>
        <div><dt>Corporate Identification Number (CIN)</dt><dd>U85500PN2024NPL233531</dd></div>
        <div><dt>Registered office</dt><dd>C-804, Surbhi Mangalam, Dhanori,<br />Pune City, Pune, Maharashtra 411015, India</dd></div>
        <div><dt>Email</dt><dd><a href="mailto:operations@thesama.in">operations@thesama.in</a></dd></div>
        <div><dt>CSR registration</dt><dd>CSR-1 registered with the Ministry of Corporate Affairs</dd></div>
      </dl>
    </div>
    <div className="corp-card reveal">
      <h2 className="corp-h">Board of Directors</h2>
      <ul className="corp-dirs">
        <li><b>Abhishek Gupta</b><span>Director</span><span><a href="mailto:abhishek@navgurukul.org">abhishek@navgurukul.org</a></span></li>
        <li><b>Manisha Sinha</b><span>Director</span><span><a href="mailto:manisha@thesama.in">manisha@thesama.in</a></span></li>
      </ul>
      <h2 className="corp-h" style={{ marginTop: '40px' }}>Directors’ Report</h2>
      <div className="corp-doc">
        <div><b>Boards’ Report FY 2025–26</b><span>For the year ended 31 March 2026 · PDF</span></div>
        <a className="bracket bracket--solid" href="/docs/directors-report-2025-26.pdf" download="SAMA_Digital_Foundation_Directors_Report_FY2025-26.pdf">Download PDF <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      </div>
      <p className="small mt-m">Our annual and impact reports are on the <Link to="/comms#reports">Communications</Link> page.</p>
    </div>
  </div>
</section>
    </div>
  );
}
