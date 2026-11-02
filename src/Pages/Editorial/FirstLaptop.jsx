import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

export default function FirstLaptop() {
  useReveal();

  useEffect(() => {
    document.title = "First Laptop, Next Builder | Sama";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="editorial-page page" id="page-firstlaptop">
<section className="fl-hero">
  <div className="fl-hero__grid" aria-hidden="true"><img src="/img/fl-n1.jpg" alt="" /><img src="/img/fl-n5.jpg" alt="" /><img src="/img/builder-1.jpg" alt="" /><img src="/img/builder-2.jpg" alt="" /><img src="/img/fl-n8.jpg" alt="" /><img src="/img/fl-n3.jpg" alt="" /><img src="/img/builder-3.jpg" alt="" /><img src="/img/builder-4.jpg" alt="" /><img src="/img/fl-n7.jpg" alt="" /><img src="/img/fl-n4.jpg" alt="" /><img src="/img/builder-5.jpg" alt="" /><img src="/img/fl-n2.jpg" alt="" /></div>
  <div className="fl-hero__shade"></div>
  <div className="wrap fl-hero__txt reveal">
    <div className="crumbs"><Link to="/">Home</Link> / <Link to="/giving">Giving Back</Link> / <b>First Laptop, Next Builder</b></div>
    <span className="eyebrow">Individual giving</span>
    <h1 className="display h1 mt-s">First Laptop, <em>Next Builder.</em></h1>
    <p className="lede mt-m">Every founder remembers their first laptop. Share yours, and help put 400 refurbished MacBooks in the hands of the next generation of builders.</p>
    <div className="btn-row mt-l"><a className="bracket bracket--paper" href="#founders">How it works <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a><a className="bracket bracket--light" href="mailto:brendon@thesama.in?subject=First%20Laptop%2C%20Next%20Builder">Join the campaign <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>
  </div>
</section>
<section className="sec founders fl-page" id="founders">
  <div className="wrap">
    <div className="split" style={{ alignItems: 'start' }}>
      <div className="reveal">
        <span className="give-tag give-tag--light">The founders’ campaign</span>
        <h2 className="display h2 mt-s">Every founder remembers <em>their first laptop.</em></h2>
      </div>
      <div className="reveal">
        <p className="lede">We are inviting India’s startup founders to share the story of their first laptop, and to help put 400 refurbished MacBooks in the hands of the next generation of builders.</p>
        <p className="fl-p">Every founder started somewhere, often on a borrowed or second-hand machine. This campaign turns those stories into a call to give back: you built something, now it is someone else’s turn. It is a small part of a Viksit Bharat built by its own creators and entrepreneurs.</p>
        <div style={{ marginTop: '22px' }}><span className="status">Launching soon</span></div>
      </div>
    </div>

    <h3 className="fl-h reveal">How it works</h3>
    <div className="founder-steps founder-steps--5 reveal">
      <div><b>01</b><h3>A founder shares their story</h3><p>Their first laptop, on X or LinkedIn, tagging Sama and the campaign.</p></div>
      <div><b>02</b><h3>The post carries the ask</h3><p>Fund a laptop for a builder who is where you once were.</p></div>
      <div><b>03</b><h3>Contributions come in</h3><p>Through one campaign page. Each fixed contribution funds one refurbished MacBook.</p></div>
      <div><b>04</b><h3>Sama awards the laptops</h3><p>To selected freelancers, creators and early-stage founders.</p></div>
      <div><b>05</b><h3>The loop closes</h3><p>Recipients’ stories go back out on the same channels, to the founders who started it.</p></div>
    </div>


    <div className="fl-builders reveal"><img src="/img/builder-1.jpg" alt="A young woman with the refurbished laptop she received through Sama" /><img src="/img/builder-2.jpg" alt="A young woman with the refurbished laptop she received through Sama" /><img src="/img/builder-3.jpg" alt="A young woman with the refurbished laptop she received through Sama" /><img src="/img/builder-4.jpg" alt="A young woman with the refurbished laptop she received through Sama" /><img src="/img/builder-5.jpg" alt="A young woman with the refurbished laptop she received through Sama" /></div>
    <p className="fl-cap reveal">Young people with the refurbished laptops they received through Sama.</p>

    <div className="fl-laptops reveal" style={{ maxWidth: '760px' }}>
      <h3 className="fl-h">The laptops</h3>
      <p className="fl-p">Sama has 400 refurbished MacBooks ready to go to builders through this campaign. Founders are not asked to donate devices. The ask is their story, and a contribution towards a laptop for someone else.</p>
      <p className="fl-p">Each contribution covers refurbishment, data wiping, setup and delivery to an individual.</p>
    </div>

    <h3 className="fl-h reveal">Ways a founder can take part</h3>
    <p className="fl-p reveal" style={{ maxWidth: '640px' }}>Four levels, from a single post to a company partnership.</p>
    <div className="fl-levels reveal">
      <div><span className="fl-lvl">Share</span><p><b>You</b> post your first-laptop story and the campaign link.</p><p><b>Sama</b> amplifies the post and tracks the laptops funded through it.</p></div>
      <div><span className="fl-lvl">Mentor</span><p><b>You</b> mentor laptop recipients on SamaSocial.</p><p><b>Sama</b> matches you with recipients and runs the sessions.</p></div>
      <div><span className="fl-lvl">Fund a cohort</span><p><b>You</b> fund a set of laptops personally.</p><p><b>Sama</b> awards those laptops in your name.</p></div>
      <div><span className="fl-lvl">Partner</span><p><b>You</b> bring Sama in as a partner of your company.</p><p><b>Sama</b> awards laptops in the CEO’s name and features the partnership.</p></div>
    </div>


    <div className="fl-band fl-band--3 reveal"><img src="/img/fl-n1.jpg" alt="Build for Good 2026 finalists holding the refurbished laptops they received" /><img src="/img/fl-n6.jpg" alt="A finalist receiving a Sama kit at the Build for Good 2026 finale" /><img src="/img/fl-n7.jpg" alt="A student demonstrating the app her team built" /></div>
    <p className="fl-cap reveal">Every Build for Good 2026 finalist left with a refurbished laptop to keep building on.</p>

    <div className="split mt-xl" style={{ alignItems: 'start' }}>
      <div className="reveal">
        <h3 className="fl-h" style={{ marginTop: '0' }}>Who receives the laptops</h3>
        <p className="fl-p">Young people working on meaningful projects who lack the tools to take them further: freelancers, creators, early-stage founders and independent builders.</p>
        <p className="fl-p">Selection runs through an open call for individuals doing meaningful work. Each recipient gets two things: a refurbished MacBook, and structured mentorship on SamaSocial, Sama’s learning and community platform, from founders and their teams.</p>
        <p className="fl-p">Sama funds the first 5 laptops itself to open the call. Every laptop founders fund adds to that pool.</p>
      </div>
      <div className="reveal">
        <ol className="fl-select">
          <li><b>Apply</b><span>A short application: what you are building, and what a laptop changes for you.</span></li>
          <li><b>Shortlist</b><span>The Sama team shortlists on need and on the work itself.</span></li>
          <li><b>Announce</b><span>Grants are announced in batches, and each recipient’s story is shared publicly.</span></li>
        </ol>
      </div>
    </div>

    <div className="fl-join reveal">
      <div><h3>Join the campaign.</h3><p>If a laptop once changed what you could build, we would love you to be part of this. Write to Brendon Fernandes at <a href="mailto:brendon@thesama.in?subject=First%20Laptop%2C%20Next%20Builder">brendon@thesama.in</a>.</p></div>
      <div className="btn-row">
        <a className="bracket bracket--paper" href="mailto:brendon@thesama.in?subject=First%20Laptop%2C%20Next%20Builder%20-%20My%20story">Share your story <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
        <a className="bracket bracket--light" href="mailto:brendon@thesama.in?subject=First%20Laptop%2C%20Next%20Builder%20-%20Fund%20laptops">Fund laptops <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
        <a className="bracket bracket--light" href="mailto:brendon@thesama.in?subject=First%20Laptop%2C%20Next%20Builder%20-%20Mentor">Mentor recipients <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      </div>
    </div>
  </div>
</section>
    </div>
  );
}
