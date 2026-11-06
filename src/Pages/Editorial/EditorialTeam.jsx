import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

export default function EditorialTeam() {
  useReveal();

  useEffect(() => {
    document.title = "Team | Sama";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="editorial-page page" id="page-team">
<div className="team-page">
<div className="team-bg" aria-hidden="true"><img src="/img/team-backdrop.jpg" alt="" /></div>
<section className="page-hero team-hero">
  <div className="wrap reveal">
    <div className="crumbs"><Link to="/">Home</Link> / <b>Team</b></div>
    <span className="eyebrow">Different people. Shared work.</span>
    <h1 className="display h1 mt-s">The people <em>building Sama.</em></h1>
    <p className="lede mt-m">No one at Sama works one job. Everyone here works across everything the organisation needs. That’s reflected here too: no designations, just the people and why they’re doing this now.</p>
  </div>
</section>

<section className="sec founder-band">
  <div className="wrap founder2 reveal">
    <figure className="tm__img founder2__img"><img src="/img/manisha.jpg" alt="Manisha speaking to students" /></figure>
    <div className="founder2__txt">
      <span className="hand">Founder’s note</span>
      <blockquote>“I am building the world I want for my daughter, one rooted in equanimity, and in doing so giving back to the tier 2 girl I once was.”</blockquote>
      <p>I grew up believing that stability was the ceiling. That a good life meant a safe job, steady savings, and not asking for too much. It took me years to learn that access is what changes the question a person gets to ask. When you have tools you can trust and people who show you what is possible, you stop asking how to survive and start asking what you want to build.</p>
      <p>That is the shift I want for a million women and young people. Not charity, not a one-time handout, but access, tools, and ecosystems they can rely on. Something that stays after the programme ends and grows in their hands.</p>
      <span className="tm__name" style={{ marginTop: '18px' }}>Manisha</span>
    </div>
  </div>
</section>

<section className="sec team-story">
  <div className="wrap">
    <p className="hand hand--big reveal">Different paths.<br />Same purpose.</p>
    <div className="tm-grid">
      <article className="tm tm--l reveal">
  <figure className="tm__img"><img src="/img/shweta.jpg" alt="Shweta" /></figure>
  <div className="tm__txt"><span className="tm__name">Shweta</span><blockquote>“When I refurbish devices, I feel like I am giving them a new life and helping create a new chance for someone else.”</blockquote></div>
</article>
      <article className="tm tm--r reveal">
  <figure className="tm__img"><img src="/img/aritra.jpg" alt="Aritra" /></figure>
  <div className="tm__txt"><span className="tm__name">Aritra</span><blockquote>“To me, contributing to Digital Inclusion means creating new opportunities, that’ll lead to endless possibilities for grass-root level growth in India.”</blockquote></div>
</article>
    </div>
    <p className="hand reveal" style={{ textAlign: 'right' }}>One mission.<br />Many hands.</p>
    <div className="tm-grid tm-grid--feature">
      <h2 className="display h1 reveal" style={{ color: 'var(--green)' }}>Every device can become <em>an opportunity.</em></h2>
      <article className="tm tm--r reveal">
  <figure className="tm__img"><img src="/img/smriti.jpg" alt="Smriti" /></figure>
  <div className="tm__txt"><span className="tm__name">Smriti</span><blockquote>“Bridging the digital divide, building confidence and empowering women towards a future of financial independence and limitless possibilities.”</blockquote></div>
</article>
    </div>
    <div className="tm-grid">
      <article className="tm tm--l reveal">
  <figure className="tm__img"><img src="/img/chelsy.jpg" alt="Chelsy" /></figure>
  <div className="tm__txt"><span className="tm__name">Chelsy</span><blockquote>“Empowering 1 million women with digital access means creating one million stories of confidence, opportunity and independence.”</blockquote></div>
</article>
      <article className="tm tm--r reveal">
  <figure className="tm__img"><img src="/img/brendon.jpg" alt="Brendon" /></figure>
  <div className="tm__txt"><span className="tm__name">Brendon</span><blockquote>“Access to technology doesn’t just transform one woman, it lifts her entire family and ripples out to society.”</blockquote></div>
</article>
    </div>
    <div className="tm-grid">
      <article className="tm tm--l reveal">
  <figure className="tm__img"><img src="/img/bhavik.jpg" alt="Bhavik" /></figure>
  <div className="tm__txt"><span className="tm__name">Bhavik</span><blockquote>“A small window to technology can open a world of possibilities, bringing dreams once out of reach closer to reality.”</blockquote></div>
</article>
      <article className="tm tm--r reveal">
  <figure className="tm__img"><img src="/img/soumili.jpg" alt="Soumili" /></figure>
  <div className="tm__txt"><span className="tm__name">Soumili</span><blockquote>“Driven by connection and powered by purpose, we bridge the digital divide and transform communities for a digitally empowered India.”</blockquote></div>
</article>
    </div>
    <div className="tm-grid">
      <article className="tm tm--l reveal">
        <figure className="tm__img"><img src="/img/ganesh.jpg" alt="Ganesh" /></figure>
        <div className="tm__txt"><span className="tm__name">Ganesh</span><blockquote>“Talent is everywhere. Access is not. I am building Sama so a million women and young people never wait to build what they dream.”</blockquote></div>
      </article>
      <article className="tm tm--r reveal">
        <figure className="tm__img"><img src="/img/aditya.jpg" alt="Aditya Gupta" /></figure>
        <div className="tm__txt"><span className="tm__name">Aditya Gupta</span><blockquote>“What a company calls waste, an underserved community calls hope. We (SAMA) have turned e-waste into 15,000+ opportunities, and we are turning those opportunities into livelihoods, with 1 million women and youth by 2030 as our measure.”</blockquote></div>
      </article>
    </div>

    <p className="hand hand--big reveal" style={{ marginTop: '48px', marginBottom: '16px' }}>Voices of Sama.<br />What a refurbished laptop makes possible.</p>
    <div className="tm-grid">
      <article className="tm tm--l reveal">
        <figure className="tm__img"><img src="/img/pradeep.jpg" alt="Pradeep Kumar" /></figure>
        <div className="tm__txt"><span className="tm__name">Pradeep Kumar</span><blockquote>“Being part of Sama since its beginning has been a journey of learning, building and growing together. Every laptop we refurbish is more than just a device; it's an opportunity to connect someone with a world of possibilities.”</blockquote></div>
      </article>
      <article className="tm tm--r reveal">
        <figure className="tm__img"><img src="/img/rinki.jpg" alt="Rinki" /></figure>
        <div className="tm__txt"><span className="tm__name">Rinki</span><blockquote>“For me, Sama is where technology finds its purpose and every effort becomes a possibility. What begins with a laptop can become a learner's first step towards a world of opportunities. Being part of this journey reminds me that the most meaningful impact is not measured by what we build, but by the futures we help unlock.”</blockquote></div>
      </article>
    </div>

    <div className="tm-grid">
      <article className="tm tm--l reveal">
        <figure className="tm__img"><img src="/img/anumita.jpg" alt="Anumita" /></figure>
        <div className="tm__txt"><span className="tm__name">Anumita</span><blockquote>“Every device can become an opportunity. Every connection can create a possibility. Every learner deserves a chance to grow.”</blockquote></div>
      </article>
      <article className="tm tm--r reveal">
        <figure className="tm__img"><img src="/img/vishwanath.jpg" alt="Vishwanath" /></figure>
        <div className="tm__txt"><span className="tm__name">Vishwanath</span><blockquote>“For us, every laptop is the beginning of a new story. A chance to learn, grow and discover new possibilities. A step towards confidence, skills and independence. A new opportunity to build a brighter future.”</blockquote></div>
      </article>
    </div>

    <div className="tm-grid">
      <article className="tm tm--l reveal">
        <figure className="tm__img"><img src="/img/bhavesh.jpg" alt="Bhavesh" /></figure>
        <div className="tm__txt"><span className="tm__name">Bhavesh</span><blockquote>“Every laptop I refurbish is more than just a repaired device; it's an opportunity for someone to learn, grow, and build a better future.”</blockquote></div>
      </article>
      <article className="tm tm--r reveal">
        <figure className="tm__img"><img src="/img/shivansh.jpg" alt="Shivansh" /></figure>
        <div className="tm__txt"><span className="tm__name">Shivansh</span><blockquote>“I started my journey with confusion about my future, but every opportunity and experience has helped me discover my potential. Today, I'm not just learning new skills; I'm becoming more confident about the person I want to be.”</blockquote></div>
      </article>
    </div>

    <div className="tm-grid">
      <article className="tm tm--l reveal">
        <figure className="tm__img"><img src="/img/jyoti.jpg" alt="Jyoti" /></figure>
        <div className="tm__txt"><span className="tm__name">Jyoti</span><blockquote>“Turning old laptops into new opportunities, one device at a time. Every repair is a step towards making technology accessible to everyone.”</blockquote></div>
      </article>
      <article className="tm tm--r reveal">
        <figure className="tm__img"><img src="/img/ragini.jpg" alt="Ragini" /></figure>
        <div className="tm__txt"><span className="tm__name">Ragini</span><blockquote>“Every opportunity teaches us something new, helps us grow, and brings us one step closer to our dreams.”</blockquote></div>
      </article>
    </div>

    {/* Closing Banner: And still growing */}
    <div className="growing-banner reveal">
      <div className="growing-banner__txt">
        <span className="eyebrow" style={{ color: 'var(--green)' }}>Building the movement</span>
        <p className="hand hand--big" style={{ marginTop: '10px' }}>And still growing.</p>
        <p className="growing-banner__p">
          From our refurbishment workshops to learning centres across India, our work grows with every laptop restored. No one here works just one job. Every device and community we touch brings more hands, more hope, and more stories to Sama.
        </p>
        <div style={{ marginTop: '22px' }}>
          <Link className="bracket bracket--solid" to="/contact?topic=Something+else#contact-form">
            Work with us <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </Link>
        </div>
      </div>
      <figure className="growing-banner__img">
        <img src="https://navgurukul.github.io/sama-website/assets/team-growing-illustration-BHZiAJLZ.jpg" alt="Team Sama walking together towards a sunrise" />
      </figure>
    </div>
  </div>
</section>

<section className="cta-band">
  <div className="wrap grid reveal">
    <h2 className="display h2">Our work is collective. Our impact is shared. <em>Let’s build more of it, together.</em></h2>
    <div><p className="lede">Want to work with us or support our mission?</p>
      <div className="btn-row mt-l"><Link className="bracket bracket--solid" to="/contact">Get in touch <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link><Link className="bracket bracket--line" to="/donate">Donate <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link></div></div>
  </div>
</section>
      </div>
    </div>
  );
}
