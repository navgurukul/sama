import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

export default function EditorialHome() {
  useReveal();

  useEffect(() => {
    document.title = "Sama Digital Foundation | A laptop’s second life. Someone’s first.";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="editorial-page page" id="page-home">
{/*  A1 · Tagline + hero carousel + CTAs  */}
<section className="home-hero">
  <div className="wrap grid">
    <div className="reveal">
      <span className="eyebrow eyebrow--light">Sama Digital Foundation</span>
      <h1 className="display mt-m">A laptop’s second life. <em>Someone’s first.</em></h1>
      <div className="btn-row mt-l">
        <Link className="bracket bracket--solid" to="/donate">Donate laptops <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
        <a className="bracket bracket--light" href="#impact">See our impact <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      </div>
    </div>
    <div className="carousel reveal" aria-label="Photos of Sama laptops in use">
      <img className="on" src="/img/students-lab.jpg" alt="Young women working on refurbished laptops in a classroom" />
      <img src="/img/college-lab.jpg" alt="College students in a Sama digital lab" />
      <img src="/img/school-handover.jpg" alt="Government school students receiving laptops with their teachers" />
      <img src="/img/bfg-finalists.jpg" alt="Build for Good finalists with their refurbished laptops" />
      <div className="dots"><i className="on"></i><i></i><i></i><i></i></div>
    </div>
  </div>
</section>

{/*  A7 · Impact in numbers  */}
<section className="sec dark" id="impact">
  <div className="wrap">
    <div className="reveal">
      <span className="pill pill--live">Live impact data</span>
      <h2 className="display h2 mt-m">Our impact, <em>in numbers.</em></h2>
    </div>
    <div className="stat-row reveal">
      <div><b>20,000<sup>+</sup></b><span>Laptops refurbished</span></div>
      <div><b>3.5 Lakh<sup>+</sup></b><span>People reached</span></div>
      <div><b>22</b><span>States reached</span></div>
      <div><b>68</b><span>Districts reached</span></div>
      <div><b>5,390<sup>+ MT</sup></b><span>Carbon emissions avoided</span></div>
      <div><b>60+</b><span>NGO partners</span></div>
    </div>
  </div>
</section>

{/*  A2 · Who we are  */}
<section className="sec">
  <div className="wrap reveal">
    <span className="eyebrow">Who we are</span>
    <p className="statement mt-m">At Sama Digital Foundation, we repurpose retired corporate laptops into a growth and learning tool for underserved women and youth across India. Together with our corporate partners, we turn devices headed for e-waste into <b>access to learning, skills and income</b>, opening up pathways to social mobility.</p>
  </div>
</section>

{/*  A5 · The gap in numbers  */}
<section className="sec">
  <div className="wrap">
    <div className="reveal">
      <span className="eyebrow">The problem</span>
      <h2 className="display h2 mt-s">India has two digital gaps. <em>They meet in the same place.</em></h2>
      <p className="lede mt-m">On one side, organisations retire devices that have reached the end of their corporate life. On the other, schools, colleges, skilling centres and communities need working computers to turn a curriculum into something people can actually sit down and do.</p>
    </div>
    <div className="stat-grid mt-l reveal">
      <div className="stat-card"><b>6.19 lakh</b><p>Schools with no functional computer for teaching: 42% of every school in India</p><small>UDISE+ 2024–25</small></div>
      <div className="stat-card"><b>12.16 crore</b><p>Students enrolled in India’s government schools</p><small>UDISE+ 2024–25</small></div>
      <div className="stat-card"><b>4.2%</b><p>Of rural households own a computer of any kind; 9.9% nationally</p><small>NSS 79th round (CAMS) 2022–23</small></div>
      <div className="stat-card"><b>13.98 lakh MT</b><p>E-waste generated in FY 2024–25; 29% never formally collected or recycled</p><small>CPCB, Rajya Sabha reply, July 2025</small></div>
      <div className="stat-card"><b>220 kg</b><p>CO₂e in manufacturing emissions avoided each time one laptop is reused instead of replaced</p><small>Laptop life-cycle assessment, 2025</small></div>
      <div className="stat-card" style={{ background: 'var(--green)', borderColor: 'var(--green)' }}><b style={{ color: '#fff' }}>85% vs 33.9%</b><p style={{ color: '#DDE9E0' }}>Access is what changes the outcome. Among rural 14–18 year-olds surveyed by ASER, 85% of those with a computer at home could use one, against 33.9% of those without.</p><small style={{ color: '#A6CFB0' }}>ASER</small></div>
    </div>
  </div>
</section>

{/*  A6 · How it works  */}
<section className="sec how-band" id="how">
  <div className="wrap">
    <div className="reveal">
      <span className="eyebrow eyebrow--light">How it works</span>
      <h2 className="display h2 mt-s">How a retired laptop gets <em>a second life.</em></h2>
      <p className="lede mt-m">From a company’s storeroom to someone’s hands, every step is checked and recorded.</p>
    </div>
    <div className="zz">
      <div className="zz__phase reveal"><span>Digital resource recovery</span></div>
      <div className="zz__step zz__step--l reveal"><span className="zz__dot"></span><div className="zz__card"><img src="/img/proc-collect.png" alt="" loading="lazy" /><div><span className="n">01</span><h3>Collect</h3><p>We collect end-of-life laptops from our corporate partners.</p></div></div></div>
      <div className="zz__step zz__step--r reveal"><span className="zz__dot"></span><div className="zz__card"><img src="/img/proc-secure.png" alt="" loading="lazy" /><div><span className="n">02</span><h3>Secure data</h3><p>We ensure complete data erasure and privacy protection.</p></div></div></div>
      <div className="zz__step zz__step--l reveal"><span className="zz__dot"></span><div className="zz__card"><img src="/img/proc-restore.png" alt="" loading="lazy" /><div><span className="n">03</span><h3>Restore</h3><p>We restore and upgrade each laptop for learning and work.</p></div></div></div>
      <div className="zz__phase reveal"><span>Digital inclusion pipeline</span></div>
      <div className="zz__step zz__step--r reveal"><span className="zz__dot"></span><div className="zz__card"><img src="/img/proc-livelihood.png" alt="" loading="lazy" /><div><span className="n">04</span><h3>Create opportunity</h3><p>We create livelihood opportunities through our programmes.</p></div></div></div>
      <div className="zz__step zz__step--l reveal"><span className="zz__dot"></span><div className="zz__card"><img src="/img/proc-ecosystem.png" alt="" loading="lazy" /><div><span className="n">05</span><h3>Load learning</h3><p>We provide pre-installed online and offline learning resources.</p></div></div></div>
      <div className="zz__step zz__step--r reveal"><span className="zz__dot"></span><div className="zz__card"><img src="/img/proc-connect.png" alt="" loading="lazy" /><div><span className="n">06</span><h3>Reach communities</h3><p>We reach underserved communities through our network of NGO and government partners.</p></div></div></div>
      <div className="zz__phase reveal"><span>Digital tracking and reporting</span></div>
      <div className="zz__step zz__step--l reveal"><span className="zz__dot"></span><div className="zz__card"><img src="/img/proc-capture.png" alt="" loading="lazy" /><div><span className="n">07</span><h3>Capture data</h3><p>We capture data on each laptop’s lifecycle and community impact.</p></div></div></div>
      <div className="zz__step zz__step--r reveal"><span className="zz__dot"></span><div className="zz__card"><img src="/img/proc-analytics.png" alt="" loading="lazy" /><div><span className="n">08</span><h3>Report &amp; improve</h3><p>We share transparent reporting on ESG outcomes with our partners, and use what we learn to improve how we work.</p></div></div></div>
    </div>
    <div className="custody reveal"><span className="dot"></span><p><b style={{ color: 'var(--paper)' }}>Full chain of custody:</b> every laptop is recorded on our dashboard from pickup to the person who uses it. Corporate laptops are refurbished by our operations team, 90% of whom are women and beneficiaries of Sama Digital Foundation themselves.</p></div>
  </div>
</section>

{/*  For companies · corporate advantages  */}
<section className="sec corp" id="for-companies">
  <div className="wrap">
    <div className="corp__head reveal">
      <div><span className="eyebrow">For companies</span>
        <h2 className="display h2 mt-s">Retire your laptops responsibly. <em>See exactly where they go.</em></h2></div>
      <p className="lede">Your retired laptops still have years of work left in them. We make passing them on simple, secure and reportable.</p>
    </div>
    <div className="adv-grid reveal">
      <div className="adv"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B25F65" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="1.5"/><path d="M3 11h18M9 7V4h6v3"/></svg><h3>Handled end to end</h3><p>We collect retired laptops from your offices, refurbish them and deploy them through 60+ NGO partners. Your IT team hands over; we do the rest.</p></div>
      <div className="adv"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B25F65" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg><h3>Your data stays protected</h3><p>Laptops are wiped as per your IT policy before handover, or the drives are removed before pickup.</p></div>
      <div className="adv"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B25F65" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-6.3-7-11.5A7 7 0 0 1 19 9.5C19 14.7 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg><h3>Full traceability</h3><p>Every laptop is logged on our dashboard from pickup to the person who uses it.</p></div>
      <div className="adv"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B25F65" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 8h6M9 12h6M9 16h3"/></svg><h3>Impact you can report</h3><p>Regular updates on laptops refurbished, people reached and where each batch went, ready for your CSR and ESG reporting.</p></div>
      <div className="adv"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B25F65" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path d="M5 19l8-8"/></svg><h3>Measurable sustainability</h3><p>Every laptop reused instead of replaced avoids about 220 kg CO₂e of manufacturing emissions. Our partners have avoided 5,390+ MT so far.</p></div>
      <div className="adv"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B25F65" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20c.8-3.5 3.2-5.5 6-5.5s5.2 2 6 5.5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.6c2.6.2 4.4 2 5 5.4"/></svg><h3>Employees who take part</h3><p>Bring a <a href="#contact:connect" data-topic="Renew Desk at our office">Renew Desk</a> to your office, where employees refurbish laptops alongside our team.</p></div>
    </div>
    <div className="corp__foot reveal">
      <span className="pill" style={{ marginTop: '0' }}>★ CSR-1 registered with the Ministry of Corporate Affairs</span>
      <div className="btn-row">
        <Link className="bracket bracket--solid" to="/donate">Donate your retired laptops <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
        <a className="bracket bracket--line" href="mailto:operations@thesama.in?subject=Retired%20laptops%20%E2%80%93%2030%20minutes%20with%20Sama">Book 30 minutes with us <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      </div>
    </div>
  </div>
</section>

{/*  A8 · Trusted by  */}
<section className="trust">
  <div className="wrap reveal">
    <span className="eyebrow">Trusted by</span>
    <div className="marquee" aria-label="Our corporate partners"><ul className="marquee__track"><li><img src="/img/p-amazon.png" alt="Amazon" loading="lazy" /></li><li><img src="/img/p-microsoft.png" alt="Microsoft" loading="lazy" /></li><li><img src="/img/p-accenture.png" alt="Accenture" loading="lazy" /></li><li><img src="/img/p-capgemini.svg" alt="Capgemini" loading="lazy" /></li><li><img src="/img/p-eaton.png" alt="Eaton" loading="lazy" /></li><li><img src="/img/p-sp-global.png" alt="S&amp;P Global" loading="lazy" /></li><li><img src="/img/p-tiger-analytics.png" alt="Tiger Analytics" loading="lazy" /></li><li><img src="/img/p-macquarie.png" alt="Macquarie" loading="lazy" /></li><li><img src="/img/p-dxc.png" alt="DXC Technology" loading="lazy" /></li><li><img src="/img/p-apexon.png" alt="Apexon" loading="lazy" /></li><li><img src="/img/p-avid.png" alt="Avid Learning" loading="lazy" /></li><li><img src="/img/p-fossil.svg" alt="Fossil" loading="lazy" /></li><li><img src="/img/p-sga.svg" alt="SG Analytics" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-amazon.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-microsoft.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-accenture.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-capgemini.svg" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-eaton.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-sp-global.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-tiger-analytics.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-macquarie.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-dxc.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-apexon.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-avid.png" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-fossil.svg" alt="" loading="lazy" /></li><li aria-hidden="true"><img src="/img/p-sga.svg" alt="" loading="lazy" /></li></ul></div>
    <p className="small mt-m">Along with our other corporate partners.</p>
    <span className="pill">★ CSR-1 registered with the Ministry of Corporate Affairs</span>
  </div>
</section>

{/*  People behind the numbers (collage)  */}
<section className="faces">
  <div className="wrap">
    <div className="faces__head reveal">
      <div><span className="eyebrow eyebrow--light">The people behind the numbers</span>
      <h2 className="display h2 mt-s">3.5 lakh+ people. <em>Every one of them has a name.</em></h2></div>
      <p className="lede">Each face here is a girl or young woman learning, studying or working on a laptop that a company once retired.</p>
    </div>
    <figure className="faces__img reveal">
      <img src="/img/faces.jpg" alt="A collage of young women and girls across India holding and working on their refurbished laptops" />
    </figure>
  </div>
</section>

{/*  A4 · One person's story  */}
<section className="sec dark">
  <div className="wrap">
    <span className="eyebrow eyebrow--light reveal">One person’s story</span>
    <div className="story-feature mt-m reveal">
      <img src="/img/shrutika.jpg" alt="Shrutika at her Sama Digi Kendra" />
      <div className="body">
        <blockquote>“A laptop a company had retired became the start of her business.”</blockquote>
        <div className="who"><b>Shrutika, 19</b> <span>· Mitnapur, Yavatmal district, Maharashtra</span></div>
        <p>After her father passed away, Shrutika watched debt weigh on her family. At 19, she set up a Sama Digi Kendra at home on a refurbished laptop that a company had retired. Her centre has since served 900+ people in her village, and in one week in September 2026 she earned ₹10,000. She is now expanding it to serve children and the elderly.</p>
        <Link className="text-link mt-m" style={{ alignSelf: 'flex-start', color: 'var(--ink)' }} to="/sama-saathi">Read more stories <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
      </div>
    </div>
  </div>
</section>

{/*  A3 · What drives us  */}
<section className="sec bg-stone">
  <div className="wrap split">
    <div className="media reveal"><img src="/img/students-lab.jpg" alt="Young women learning on refurbished laptops" /></div>
    <div className="reveal">
      <span className="eyebrow">What drives us</span>
      <h2 className="display h2 mt-s">A computer is no longer <em>optional.</em></h2>
      <p className="lede mt-m">For a first-time learner in India, it is the classroom, the bank, the job application and the shop counter. Sama makes sure that not having a device is never what holds back an underserved woman or young person.</p>
      <div className="mv mv--vision"><span className="eyebrow">Vision</span><p>Everyone in India who has never used a computer, using one with confidence.</p></div>
    </div>
  </div>
  <div className="wrap mt-xl reveal"><div className="video"><iframe src="https://drive.google.com/file/d/1KUbE0jDX03YPiVaZJbb7xb4twuJgeEwu/preview" title="Sama Digital Foundation film" allow="autoplay; fullscreen" loading="lazy"></iframe></div></div>
</section>

{/*  A9 · Vision for 2030  */}
<section className="sec sage">
  <div className="wrap">
    <div className="reveal">
      <span className="eyebrow" style={{ color: '#DDE7DA' }}>Our vision for 2030</span>
      <h2 className="display h1 mt-s">1 million <em>by 2030.</em></h2>
      <p className="lede mt-m" style={{ color: 'rgba(255,255,255,.88)' }}>By 2030, we aim to reach 1 million women and young people across India. We take laptops that companies no longer need, refurbish them, and give them to people who will use them to study and earn. Every laptop we repurpose stays out of a landfill and helps someone become more independent.</p>
    </div>
    <div className="progress reveal">
      <div className="top"><div className="now"><b>3.5 Lakh+</b><span>people reached</span></div><div className="goal"><b>1M</b><span>goal by 2030</span></div></div>
      <div className="track"><i data-w="35%"></i></div>
      <div className="ticks"><span>0</span><span>2.5 Lakh</span><span>5 Lakh</span><span>7.5 Lakh</span><span>10 Lakh</span></div>
    </div>
    <div className="btn-row mt-l reveal"><Link className="bracket bracket--paper" to="/donate">Donate laptops <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link></div>
  </div>
</section>

{/*  Reports band  */}
<section className="report-band">
  <div className="wrap grid reveal">
    <div><span className="eyebrow">Our reports</span><h2 className="display h2 mt-s">Read our work, <em>year by year.</em></h2></div>
    <div className="report-links">
      <Link className="report-chip" to="/comms#reports"><b>Annual Report</b><span>FY 2025–26</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
      <Link className="report-chip" to="/comms#reports"><b>Impact Report</b><span>FY 2024–25</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
    </div>
  </div>
</section>
    </div>
  );
}
