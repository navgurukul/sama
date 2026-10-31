import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

export default function BuildForGood() {
  useReveal();

  useEffect(() => {
    document.title = "Build for Good 2026 | Sama";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="editorial-page page" id="page-bfg">
{/*  BF1  */}
<section className="page-hero">
  <div className="wrap grid">
    <div className="reveal">
      <div className="crumbs"><Link to="/">Home</Link> / <Link to="/giving">Giving Back</Link> / <b>Build for Good</b></div>
      <span className="status">2026 cohort complete <span>| 2027 applications opening soon</span></span>
      <h1 className="display h1 mt-m" style={{ fontSize: '62px' }}>Over 2,000 students built technology <em>for real-world impact.</em></h1>
      <p className="lede mt-m">A nationwide student initiative to develop software and AI-driven solutions to social challenges. Our 2026 national finale brought together top student innovators to build and deploy tools for local communities.</p>
      <div className="btn-row mt-l">
        <a className="bracket bracket--solid" href="#demo-day">See what got built <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      </div>
    </div>
    <div className="media reveal"><img src="/img/bfg-finalists.jpg" alt="Build for Good 2026 finalists with their refurbished laptops" /></div>
  </div>
</section>

{/*  BF1b · Build for Good film  */}
<section className="sec--tight" style={{ background: 'var(--stone)', paddingTop: '0' }}>
  <div className="wrap reveal">
    <span className="eyebrow">Watch</span>
    <h2 className="display h3 mt-s" style={{ fontSize: '30px' }}>The Build for Good <em>film.</em></h2>
    <div className="mt-m"><div className="video"><iframe src="https://drive.google.com/file/d/1zli4Sxy0UM-R65F6Kj6cdOoaHzeAyuUK/preview" title="Build for Good 2026 film" allow="autoplay; fullscreen" loading="lazy"></iframe></div></div>
  </div>
</section>

{/*  BF2  */}
<section className="sec" style={{ background: 'linear-gradient(#F7F0E3,#FBFAF7)' }}>
  <div className="wrap">
    <div className="reveal"><span className="eyebrow">Challenge pillars &amp; focus areas</span><h2 className="display h2 mt-s">What problem keeps <em>you thinking?</em></h2></div>
    <div className="themes reveal"><div className="theme" style={{ color: '#B4582F' }}><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#B4582F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="1.5"/><path d="M9 7V5h6v2M3 12h18"/></svg><span className="hi">Rozgaar</span><span className="en" lang="hi">रोज़गार</span><span className="area">Work &amp; livelihoods</span><p>Ideas that help people find work, earn fairly, or build a livelihood that lasts.</p></div><div className="theme" style={{ color: '#B25F65' }}><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#B25F65" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/><path d="M8 12h2.2l1.2-2 1.6 4 1-2H16"/></svg><span className="hi">Swasthya</span><span className="en" lang="hi">स्वास्थ्य</span><span className="area">Health</span><p>Ideas that make healthcare easier to reach, understand, or afford.</p></div><div className="theme" style={{ color: '#3B6EA5' }}><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#3B6EA5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5.5C6 4.5 9 4.5 12 6c3-1.5 6-1.5 8-.5V19c-2-1-5-1-8 .5-3-1.5-6-1.5-8-.5z"/><path d="M12 6v13.5"/></svg><span className="hi">Vidya</span><span className="en" lang="hi">विद्या</span><span className="area">Learning</span><p>Ideas that make learning more accessible, effective, or engaging.</p></div><div className="theme" style={{ color: '#5C785A' }}><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#5C785A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path d="M5 19l8-8"/></svg><span className="hi">Dharti</span><span className="en" lang="hi">धरती</span><span className="area">Planet</span><p>Ideas that protect land, water, air, and the systems they depend on.</p></div><div className="theme" style={{ color: '#7A5BA6' }}><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#7A5BA6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg><span className="hi">Awaaz</span><span className="en" lang="hi">आवाज़</span><span className="area">Voice</span><p>Ideas that help people be heard, access information, or hold power accountable.</p></div><div className="theme" style={{ color: '#3E8C8C' }}><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#3E8C8C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 15c4 0 6-2 7.5-5.5C12 6 14.5 4.5 17 5l3 1-2.5 1.5c.3 4.6-3 9.5-9 9.5H4z"/><path d="M8 17l-2 3M12 17l-1 3"/></svg><span className="hi">Shanti</span><span className="en" lang="hi">शांति</span><span className="area">Peace</span><p>Ideas that ease conflict, build trust, or make communities safer.</p></div></div>
  </div>
</section>

{/*  BF3  */}
<section className="sec">
  <div className="wrap">
    <div className="reveal"><span className="eyebrow">From idea to impact</span><h2 className="display h2 mt-s">How it <em>unfolded.</em></h2></div>
    <div className="rail reveal">
      <div className="node"><i><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#174B32" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg></i><b>100K+</b><span>Students reached</span><p>Mobilised youth across colleges and technical institutions nationwide.</p></div>
      <div className="node"><i><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#174B32" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 8h6M9 12h6M9 16h3"/></svg></i><b>2K+</b><span>Students registered</span><p>Forms submitted from aspiring civic tech builders.</p></div>
      <div className="node"><i><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#174B32" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16l-6 7v6l-4 2v-8z"/></svg></i><b>117</b><span>Finalist teams</span><p>Shortlisted for feasibility, original thinking and social relevance.</p></div>
      <div className="node"><i><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#174B32" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/></svg></i><b>45 days</b><span>Of development</span><p>A dedicated sprint to build, test and refine open-source prototypes.</p></div>
      <div className="node"><i><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#174B32" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4"/></svg></i><b>14–15 Aug</b><span>2026 finale</span><p>Grand Demo Day: finalist teams pitched live to a panel of expert judges.</p></div>
    </div>
  </div>
</section>

{/*  BF4  */}
<section className="sec bg-stone">
  <div className="wrap split" style={{ alignItems: 'start' }}>
    <div className="reveal"><span className="eyebrow">Mentoring the next generation</span><h2 className="display h2 mt-s">Shortlisting was only <em>the beginning.</em></h2></div>
    <div className="reveal">
      <p className="lede">During the intensive 45-day development sprint, every finalist team was embedded in one of 22 specialised mentor groups led by volunteer industry professionals. Through structured check-ins and feedback cycles, mentors guided students in refining their concepts.</p>
      <p className="mt-m" style={{ color: 'var(--ink-2)' }}>Many mentors went above and beyond, often giving 1–2 hours over the weekend or reaching out to others in their network to help refine student ideas.</p>
      <div className="chips"><span>22 mentor groups</span><span>45 days of guidance</span><span>Volunteer industry professionals</span></div>
    </div>
  </div>
</section>

{/*  BF5  */}
<section className="sec">
  <div className="wrap">
    <div className="reveal"><span className="eyebrow">Demographics &amp; regional reach</span></div>
    <div className="big2 mt-m reveal">
      <div><b>60%</b><p>of participating teams came from Tier II &amp; III cities</p></div>
      <div><b>79</b><p>finalist team members took the stage at the finale</p></div>
    </div>
    <p className="tagline-note reveal">Great ideas don’t necessarily need to come from Mumbai or Bengaluru.</p>
  </div>
</section>

{/*  BF6  */}
<section className="sec bg-band" id="demo-day">
  <div className="wrap">
    <div className="reveal">
      <span className="eyebrow">The grand finale &amp; winning innovations</span>
      <h2 className="display h2 mt-s">What came out <em>of it.</em></h2>
      <p className="lede mt-m">Ahead of the finale, ten expert external judges evaluated each finalist team across code repositories, walkthrough videos, technical decks and live solution demos. On 14–15 August 2026, the two-day Grand Finale took place at the Deshpande Foundation in Hubballi. Every finalist was awarded a refurbished corporate laptop, turning decommissioned hardware into a tool for young innovators building for national impact.</p>
    </div>
    <div className="winners reveal">
      <div className="winner"><figure className="winner__img"><img src="/img/win-carronade.jpg" alt="Team Carronade receiving the first prize at the Build for Good 2026 finale" /></figure><span className="tag">1st place</span><h3>Carronade</h3><p className="team">School student team: Mohneesh Joshi, Atharva Ranjan Sharma and Ojasvi Aruman · Bharatiya Vidya Bhavan Vidyashram, Jaipur</p><p>A non-lethal acoustic deterrent designed to protect farmland from crop-raiding wildlife, safely and humanely.</p></div>
      <div className="winner"><figure className="winner__img"><img src="/img/win-swasthyatap.jpg" alt="Team SwasthyaTap receiving the second prize at the Build for Good 2026 finale" /></figure><span className="tag">2nd place</span><h3>SwasthyaTap</h3><p className="team">Harshit Borana and Aditya Chhipa · Geetanjali Institute of Technical Studies, Udaipur</p><p>An instant NFC-enabled emergency health card storing critical patient data, blood type, allergies and emergency contacts.</p></div>
      <div className="winner"><figure className="winner__img"><img src="/img/win-food360.jpg" alt="Team FOOD360 receiving the third prize at the Build for Good 2026 finale" /></figure><span className="tag">3rd place</span><h3>FOOD360</h3><p className="team">Kavya Jain and team · [institution to be added]</p><p>A food safety platform detecting edible oil adulteration, paired with vendor trust scores and interactive community safety maps.</p></div>
    </div>
    <p className="mt-l reveal" style={{ fontFamily: 'var(--sans)', fontWeight: '700', color: 'var(--green)' }}>All three winning teams came from Tier II cities in Rajasthan.</p>
    <div className="reveal mt-m"><p style={{ color: 'var(--ink-2)' }}>Five further ideas are being carried forward beyond the finale:</p>
      <div className="chips"><span>Jan-Hit</span><span>Neonatal Health Monitoring System</span><span>TenderMind AI</span><span>KrishiSetu</span><span>SilverCare</span></div></div>
    <div className="slider reveal" id="bfg-slider" aria-roledescription="carousel" aria-label="Build for Good 2026 photos">
      <div className="slider__track">
        <figure className="slider__slide"><img src="/img/bfg-g01.jpg" alt="Students waiting their turn as judges review notes at the finale" /></figure>
        <figure className="slider__slide"><img src="/img/bfg-g02.jpg" alt="A finalist team presenting their prototype to the Sama team" /></figure>
        <figure className="slider__slide"><img src="/img/bfg-g03.jpg" alt="A speaker presenting at the lectern" /></figure>
        <figure className="slider__slide"><img src="/img/bfg-g04.jpg" alt="Finalists in the audience at the Build for Good finale" /></figure>
        <figure className="slider__slide"><img src="/img/bfg-g05.jpg" alt="Judges, mentors and finalists on stage at the Build for Good 2026 national finale" /></figure>
        <figure className="slider__slide"><img src="/img/bfg-g06.jpg" alt="The first-prize team receiving their cheque" /></figure>
        <figure className="slider__slide"><img src="/img/bfg-g07.jpg" alt="All finalists holding their refurbished MacBooks" /></figure>
        <figure className="slider__slide"><img src="/img/bfg-g08.jpg" alt="A Sama team member addressing the finalists" /></figure>
        <figure className="slider__slide"><img src="/img/bfg-g09.jpg" alt="Keychains made from recycled laptop circuit boards" /></figure>
        <figure className="slider__slide"><img src="/img/bfg-g10.jpg" alt="The Sama team at the finale" /></figure>
      </div>
      <button className="slider__btn slider__btn--prev" type="button" aria-label="Previous photo"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button>
      <button className="slider__btn slider__btn--next" type="button" aria-label="Next photo"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
      <div className="slider__dots" role="tablist"></div>
    </div>
    <p className="small mt-s">Build for Good 2026 national finale, Deshpande Foundation, Hubballi, 14 to 15 August 2026.</p>
  </div>
</section>

{/*  BF7  */}
<section className="sec">
  <div className="wrap split">
    <div className="reveal">
      <span className="eyebrow">Prizes built with purpose</span>
      <h2 className="display h2 mt-s">Every prize has <em>a second life.</em></h2>
      <p className="lede mt-m">The refurbished MacBooks awarded to Build for Good finalists were restored through the same rigorous pipeline that powers digital inclusion across India, turning corporate hardware into tools for future builders.</p>
      <a className="text-link mt-l" style={{ marginTop: '30px' }} href="#home:how">See how Sama restores devices <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
    </div>
    <div className="reveal"><img src="https://navgurukul.github.io/sama-website/assets/hero-laptop-v2-BFsezopc.webp" alt="A restored laptop, open and ready to be passed on" style={{ marginLeft: 'auto', maxHeight: '340px' }} /></div>
  </div>
</section>

{/*  BF8  */}
<section className="cta-band">
  <div className="wrap grid reveal">
    <div><span className="eyebrow">Get involved</span><h2 className="display h2 mt-s">2027 registration <em>opening soon.</em></h2>
      <p className="lede mt-m">Build for Good is an ongoing commitment to nurturing student-led civic innovation. Whether you are a student ready to build, an engineer looking to mentor, or a corporate partner eager to support, there is a place for you in our next cohort.</p></div>
    <div><h3 className="display h3">Stay updated</h3>
      <p className="mt-s" style={{ color: 'var(--ink-2)' }}>Subscribe to receive news on upcoming hackathons, cohort announcements and civic innovation updates.</p>
      <form className="signup" action="#"><label className="sr" htmlFor="em" style={{ position: 'absolute', left: '-9999px' }}>Email address</label><input id="em" type="email" required placeholder="Your email address" /><button className="bracket bracket--solid" type="submit">Notify me <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>
      <p className="small mt-m">Questions? Write to <a href="mailto:operations@thesama.in?subject=Build%20for%20Good%20query" style={{ color: 'var(--green)' }}>operations@thesama.in</a></p></div>
  </div>
</section>
    </div>
  );
}
