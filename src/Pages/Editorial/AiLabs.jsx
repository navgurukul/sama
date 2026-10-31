import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

export default function AiLabs() {
  useReveal();

  useEffect(() => {
    document.title = "Digital Inclusion & AI Literacy Labs | Sama";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="editorial-page page" id="page-labs">
{/*  D1  */}
<section className="page-hero">
  <div className="wrap grid">
    <div className="reveal">
      <div className="crumbs"><Link to="/">Home</Link> / <Link to="/initiatives">Our Initiatives</Link> / <b>Digital Labs</b></div>
      <h1 className="display h1" style={{ fontSize: '62px' }}>Digital Inclusion &amp; AI Literacy <em>Labs.</em></h1>
      <p className="lede mt-m"><b style={{ color: 'var(--ink)', fontWeight: '500' }}>Equipping students in government schools, colleges and skilling centres with hands-on hardware and AI skills.</b></p>
      <p className="mt-m" style={{ color: 'var(--ink-2)', maxWidth: '600px' }}>We drive digital inclusion and practical AI literacy by building functional Digital Labs inside educational institutions. Sama collects, refurbishes and rigorously tests retired corporate laptops, deploying them directly to schools where training programmes exist but hardware is missing. Once installed, these labs help students turn theoretical learning into real digital skills.</p>
    </div>
    <div className="media reveal"><img src="/img/college-lab.jpg" alt="Students working in a Sama digital lab" /></div>
  </div>
</section>

{/*  D2  */}
<section className="sec">
  <div className="wrap">
    <div className="reveal">
      <span className="eyebrow">Digital Labs for government schools</span>
      <h2 className="display h2 mt-s">Bridging the practical gap, <em>from theory to hands-on.</em></h2>
      <p className="lede mt-m">In government schools, a Digital Lab is often a student’s very first hands-on experience with a computer. The lab gives them room to explore, make mistakes and build the kind of comfort with technology that private-school students take for granted, turning “I’ve never touched a laptop” into “I can find my way around one.”</p>
    </div>
    <article className="case reveal">
      <div className="head">
        <img src="/img/school-handover.jpg" alt="Students and teachers at a Tamil Nadu government school with their laptops" />
        <div className="txt">
          <span className="eyebrow">Case study · Amazon &amp; Asha for Education, Tamil Nadu</span>
          <h3>The challenge</h3>
          <p>In many government schools across Tamil Nadu, computing was taught purely in theory. Without accessible hardware, students missed out on hands-on practice and stayed unfamiliar with standard digital tools.</p>
          <h3>The deployment</h3>
          <p>In December 2024, Sama refurbished, tested and deployed 500 corporate laptops donated by Amazon, in partnership with Asha for Education, Chennai. The devices went directly to government schools across Chennai, Thoothukudi, Tiruvannamalai and Tiruvarur, extending the life of hardware that would otherwise have sat unused.</p>
        </div>
      </div>
      <div className="case-figs" style={{ paddingTop: '36px' }}>
        <div className="fig fig--light">
          <span className="eyebrow">Time to complete one lesson</span>
          <div className="bar-row"><span>Before</span><div className="bar bar--before">60 min</div></div>
          <div className="bar-row"><span>With laptops</span><div className="bar bar--after">30 min</div></div>
          <blockquote>“Students are eager to use the laptops. They search for answers on their own and confidently prepare their own projects.”<span>Teaching staff, PUMS Thazhavedu</span></blockquote>
        </div>
        <div className="fig fig--dark">
          <span className="eyebrow">Asha ACE showcase · Amazon office</span>
          <div className="dots52" aria-hidden="true"><i className="win">1</i><i></i><i></i><i className="win">4</i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <p>Partner-school students placed 1st and 4th out of 52 schools, winning <b>₹1.8 lakh</b> in school support and smartwatches for the team. Teachers at PUMS Thazhavedu reported a surge in student engagement, independence and curiosity.</p>
        </div>
      </div>
    </article>
  </div>
</section>

{/*  D3  */}
<section className="sec bg-stone">
  <div className="wrap">
    <div className="reveal">
      <span className="eyebrow">Digital Launchpads for higher education</span>
      <h2 className="display h2 mt-s">From academic learning <em>to career opportunity.</em></h2>
      <p className="lede mt-m">In government colleges, a Sama Digital Lab acts as a career launchpad rather than a basic introduction. Students have foundational digital awareness, but lack reliable hardware to research internships, submit job applications, secure fellowships and build industry-level digital fluency. Our labs provide the infrastructure that turns ambition into employment.</p>
    </div>
    <article className="case reveal">
      <div className="head">
        <img src="/img/college-lab.jpg" alt="College students in North Karnataka using refurbished laptops" />
        <div className="txt">
          <span className="eyebrow">Case study · Deshpande Skilling, North Karnataka</span>
          <h3>The challenge</h3>
          <p>Final-year students across eight college campuses in North Karnataka were preparing for career-defining job interviews without reliable computers or stable internet. Many had never used a laptop, and some were hesitant to touch one for fear of damaging it.</p>
          <h3>The deployment</h3>
          <p>Sama collected 200 retired laptops from Tiger Analytics, Macquarie and Accenture and refurbished each one. In 2025, they were deployed across 8 college campuses through Deshpande Skilling’s SkillPlus programme, setting up dedicated on-campus computer labs.</p>
        </div>
      </div>
      <div className="out">
        <div><b>20+ hours a week</b><p>Students practised analytical reasoning, English communication and résumé building, without technical interruptions.</p></div>
        <div><b>96 of 259 students</b><p>Across five cohorts, 96 students landed their first jobs, at starting salaries of ₹15,000–₹20,000 a month.</p></div>
        <div><b>A personal transformation</b><p>The student who was once afraid to touch a laptop completed her final interview on one, and now uses it independently in her daily work.</p></div>
      </div>
    </article>
  </div>
</section>

{/*  D4  */}
<section className="sec">
  <div className="wrap">
    <div className="center reveal">
      <span className="eyebrow">Bridging hardware supply and social demand</span>
      <h2 className="display h2 mt-s">Two problems. <em>One answer.</em></h2>
    </div>
    <div className="panels reveal">
      <div className="panel panel--supply"><span className="ico"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6F665A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/><path d="M14.5 9.5a3 3 0 1 0-.6 2.6"/><path d="M14.8 7.6v2h-2"/></svg></span><span className="eyebrow">Supply</span><h3>Good laptops, sitting idle</h3><p>Every three years, companies across India replace their laptops. Most still work well, but end up in storerooms, sold off in bulk or recycled too soon.</p><div className="fact"><b>70 lakh</b><span>laptops retired by companies every year</span></div></div>
      <div className="join"><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div>
      <div className="panel panel--demand"><span className="ico"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#B4582F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.3"/></svg></span><span className="eyebrow">Demand</span><h3>Ready to grow, no devices</h3><p>Community organisations run strong programmes for learning and livelihoods, but lack the laptops to deliver them. For millions of people, the barrier is access, not ability.</p><div className="fact"><b>&lt;1 in 10</b><span>Indian households own a laptop or computer</span></div></div>
      <div className="join"><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div>
      <div className="panel panel--sama"><span className="ico"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#174B32" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 18h18M5 18v-5M19 18v-5M3 13c3-5 15-5 18 0M9 11v7M15 11v7"/></svg></span><span className="eyebrow">Sama</span><h3>Bringing the two together</h3><p>We refurbish these laptops and put them in the hands of people who need them most. Companies retire their devices responsibly, and people get the tools to learn, earn and grow.</p><div className="fact"><b>3.5 Lakh+</b><span>people reached with a refurbished laptop</span></div></div>
    </div>
    <div className="mt-xl reveal"><div className="video"><iframe src="https://drive.google.com/file/d/1W1ZazYQAQU0X3FITflVfMkRpBKBsJx20/preview" title="Digital Labs film" allow="autoplay; fullscreen" loading="lazy"></iframe></div></div>
  </div>
</section>

<section className="cta-band">
  <div className="wrap grid reveal">
    <h2 className="display h2">Equip an institution <em>with a lab.</em></h2>
    <div>
      <p className="lede">Running a school, vocational skilling centre or grassroots non-profit that needs hardware? Partner with Sama to bring refurbished laptops and digital infrastructure to the learners you support.</p>
      <div className="btn-row mt-l">
        <Link className="bracket bracket--solid" to="/ngoregistration">Request laptops <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
        <Link className="bracket bracket--line" to="/donate">Donate laptops <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
      </div>
    </div>
  </div>
</section>
    </div>
  );
}
