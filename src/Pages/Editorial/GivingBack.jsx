import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import BookCallModal from '../../components/Editorial/BookCallModal';
import '../../styles/editorial.css';

export default function GivingBack() {
  useReveal();
  const [showBookCallModal, setShowBookCallModal] = useState(false);

  useEffect(() => {
    document.title = "Giving Back | Sama";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="editorial-page page" id="page-giving">
<section className="page-hero">
  <div className="wrap reveal">
    <div className="crumbs"><Link to="/">Home</Link> / <b>Giving Back</b></div>
    <span className="eyebrow">Giving back</span>
    <h1 className="display h1 mt-s">One laptop, <em>passed forward.</em></h1>
    <p className="lede mt-m">Every refurbished laptop is an act of giving back. There are three ways to be part of it: as a company and its employees, as an individual, and through the hackathon we host every year.</p>
    <div className="give-nav mt-l"><a href="#employee">Employee giving</a><a href="#individual">Individual giving</a><a href="#bfg-way">Our flagship hackathon</a></div>
  </div>
</section>



<section className="sec give bg-stone" id="employee">
  <div className="wrap">
    <div className="emp-head reveal">
      <span className="give-tag">01 · Employee giving</span>
      <h2 className="display h2 mt-s">Your people, <em>giving their time and skills.</em></h2>
      <p className="lede mt-m">Two ways for employees to take part: hands-on at a Renew Desk in your office, and as mentors to students working on their own projects.</p>
      <div className="give-nav mt-m"><a href="#renew-desk">The Renew Desk</a><a href="#mentoring">Mentorship Programme</a></div>
    </div>
    <div id="renew-desk" className="anchor"></div>
    <div className="split" style={{ alignItems: 'center' }}>
      <div className="reveal">
        <p className="rd-name">The Renew Desk</p>
        <h2 className="display h2 mt-s">Renew a laptop. <em>Reboot someone’s life.</em></h2>
        <p className="rd-pillars">Laptops <i>|</i> Learning <i>|</i> Brighter futures</p>
        <p className="lede mt-m">The Renew Desk is a pop-up renewal station for your office. Employees open up a laptop with a technician, help bring a retired laptop back to life for a learner, and leave a note for whoever opens it next. It fits in a stall and runs for a working day.</p>
      </div>
      <figure className="rd-photo reveal"><img src="/img/renew-desk.jpg" alt="Young women from Sama’s network holding refurbished laptops" /></figure>
    </div>

    <div className="rd-facts reveal">
      <div><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B25F65" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20c.8-3.5 3.2-5.5 6-5.5s5.2 2 6 5.5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.6c2.6.2 4.4 2 5 5.4"/></svg><span><b>No tech experience</b> needed</span></div>
      <div><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B25F65" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16l-6 7v6l-4 2v-8z"/></svg><span><b>20 to 30 minutes</b> at the desk</span></div>
      <div><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B25F65" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4"/></svg><span><b>One desk</b>, a few stools and a patch of wall</span></div>
    </div>

    <h3 className="rd-sub reveal">Four things to do at the desk</h3>
    <div className="rd-grid reveal">
      <div className="rd-card"><b>1</b><h4>Open It Up</h4><p>Take the back off a demo laptop, check what’s inside, and see what makes it work.</p></div>
      <div className="rd-card"><b>2</b><h4>The Refurb Bench</h4><p>Clean, test and load apps on a laptop before it goes to someone who really needs it.</p></div>
      <div className="rd-card"><b>3</b><h4>The Take-Away</h4><p>Leave with one skill on a card: checking battery health, or wiping a laptop safely.</p></div>
      <div className="rd-card rd-card--light"><b>4</b><h4>Next Chapter Wall</h4><p>Pin a one-line note for whoever gets that laptop next.</p></div>
    </div>

    <div className="split mt-xl" style={{ alignItems: 'start' }}>
      <div className="reveal">
        <h3 className="rd-sub" style={{ marginTop: '0' }}>Where the laptops go next</h3>
        <p style={{ color: 'var(--ink-2)', marginTop: '12px' }}>Laptops finished at the refurb bench join Sama’s next batch, each carrying the refurb card employees signed. Laptops dropped off on the day are wiped at Sama afterwards, never at the desk. Each one reaches a student or first-time jobseeker through Sama’s network, and your team gets a short impact update on how many came through and where they went.</p>
      </div>
      <div className="reveal">
        <h3 className="rd-sub" style={{ marginTop: '0' }}>What we need from you</h3>
        <div className="rd-needs">
          <div><h4>A corner</h4><p>Desk space with power for a few laptops, two or three stools and a patch of wall for notes.</p></div>
          <div><h4>A heads-up</h4><p>A short note to employees before the day, so they know when the desk is open and can bring a laptop to donate.</p></div>
          <div><h4>Your retired laptops</h4><p>Any retired company laptops you would like collected, set aside for the same day.</p></div>
        </div>
      </div>
    </div>

    <div className="rd-cta reveal">
      <div><h3>Let’s set one up.</h3><p>Give us 30 minutes to walk through dates, and we will bring a Renew Desk to your office.</p></div>
      <button type="button" className="bracket bracket--paper" onClick={() => setShowBookCallModal(true)}>Book 30 minutes with us <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
    </div>
    <p className="rd-foot reveal">There’s more life in your old laptop than you think.</p>

    <div className="mentor" id="mentoring">
      <div className="split" style={{ alignItems: 'center' }}>
        <div className="reveal">
          <p className="rd-name">The Mentorship Programme</p>
          <h2 className="display h2 mt-s">Mentor a student <em>on what they are building.</em></h2>
          <p className="lede mt-m">Your employees pair with a student who is already working on a project, whether an app, a small business, a research idea or a community initiative, and help them take it further. Mentors bring the experience; students bring the drive.</p>
        </div>
        <figure className="rd-photo reveal"><img src="/img/bfg-g02.jpg" alt="Mentors working with students on their projects" /></figure>
      </div>
      <div className="rd-grid rd-grid--3 reveal">
        <div className="rd-card"><b>1</b><h4>Get matched</h4><p>We pair each mentor with a student whose project fits their skills and experience.</p></div>
        <div className="rd-card"><b>2</b><h4>Meet regularly</h4><p>Short, regular check-ins to unblock problems, review the work and plan the next step.</p></div>
        <div className="rd-card rd-card--light"><b>3</b><h4>See it through</h4><p>Stay with the student as the project grows, online through SamaSocial, Sama’s learning and community platform.</p></div>
      </div>
      <div className="rd-cta reveal">
        <div><h3>Bring your team in as mentors.</h3><p>Tell us about your team’s skills and we will match them with students who need them.</p></div>
        <a className="bracket bracket--paper" href="https://www.samasocial.in/be-a-mentor" target="_blank" rel="noopener noreferrer">Mentor with us <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      </div>
    </div>
  </div>
</section>

<section className="sec give indiv" id="individual">
  <div className="wrap split" style={{ alignItems: 'center' }}>
    <div className="indiv__mosaic reveal">
      <img src="/img/builder-1.jpg" alt="" /><img src="/img/builder-3.jpg" alt="" /><img src="/img/builder-4.jpg" alt="" /><img src="/img/builder-5.jpg" alt="" />
    </div>
    <div className="reveal">
      <span className="give-tag give-tag--light">02 · Individual giving</span>
      <h2 className="display h2 mt-s">First Laptop, <em>Next Builder.</em></h2>
      <p className="lede mt-m">Every founder started somewhere, often on a borrowed or second-hand machine. We are inviting India’s startup founders to share the story of their first laptop, and to help put 400 refurbished MacBooks in the hands of the next generation of builders.</p>
      <div style={{ marginTop: '20px' }}><span className="status">Launching soon</span></div>
      <div className="btn-row mt-l"><Link className="bracket bracket--paper" to="/first-laptop">See the campaign <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link></div>
    </div>
  </div>
</section>

<section className="sec give" id="bfg-way">
  <div className="wrap split">
    <div className="media reveal"><img src="/img/bfg-finalists.jpg" alt="Build for Good 2026 finalists with their refurbished laptops" /></div>
    <div className="reveal">
      <span className="give-tag">03 · Our flagship hackathon</span>
      <h2 className="display h2 mt-s">Build for <em>Good.</em></h2>
      <p className="lede mt-m">Our way of giving back: a national student hackathon we host every year, for ideas that solve real problems. In 2026, over 2,000 students took part, 117 teams were mentored across 45 days, and every finalist left with a refurbished laptop.</p>
      <div className="btn-row mt-l"><Link className="bracket bracket--solid" to="/bfg">Explore Build for Good <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link></div>
    </div>
  </div>
</section>

      {/* Book a Call Modal */}
      <BookCallModal
        isOpen={showBookCallModal}
        onClose={() => setShowBookCallModal(false)}
        initialTopic="Renew Desk at our office"
      />
    </div>
  );
}
