import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

export default function SamaSaathi() {
  useReveal();

  useEffect(() => {
    document.title = "Sama Saathi Programme | Sama";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="editorial-page page" id="page-saathi">
{/*  S1 · Page header + strapline  */}
<section className="hero">
  <div className="hero__copy">
    <span className="eyebrow">Sama Saathi Programme</span>
    <span className="hero__rule"></span>
    <h1 className="serif-h">Women who own their own digital <span className="accent">service centres.</span></h1>
    <p className="hero__sub">One woman. One centre.<br />Owned and run in her own community.</p>
    <div className="hero__ctas">
      <a className="bracket bracket--solid" href="#become">Support a Saathi Kendra →</a>
      <a className="link" href="/docs/sama-saathi-concept-note.pdf" download="Sama_Saathi_Concept_Note.pdf">Download the Sama Saathi concept note (PDF)</a>
    </div>
  </div>
  <figure className="hero__media">
    <img src="/img/saathi-kendra.jpg" alt="A Sama Digi Kendra at work in the evening, with laptops in use" />
    <figcaption className="hero__caption">A Sama Digi Kendra at work</figcaption>
  </figure>
</section>

{/*  S1 · What is a Saathi  */}
<section className="what">
  <div className="wrap reveal">
    <span className="eyebrow">What is a Saathi?</span>
    <h2 className="serif-h lines"><span>She is not a beneficiary.</span><span className="l2">She is not a trainee.</span><span className="l3">She is the owner.</span></h2>
    <p className="sub">Sama Saathi supports people who have the initiative to create livelihoods and solve problems around them: starting a small business, running a community activity, providing a local service, or taking an idea forward.</p>
    <p className="sub">We work with local partners to find people with the drive to learn, act and create value for others. Sama then provides what they need for their next step, from refurbished laptops and printers to training and mentoring. The laptop is only the start. It is each Saathi’s initiative, and the value she creates in her community, that turns access into opportunity.</p>
  </div>
</section>

{/*  S2 · Bridging the last-mile digital divide  */}
<section className="sec sec--bg">
  <div className="wrap">
    <div className="center reveal">
      <span className="eyebrow">Bridging the last-mile digital divide</span>
      <h2 className="serif-h" style={{ marginTop: '18px' }}>Services exist. Access doesn’t.</h2>
    </div>
    <div className="gap-grid reveal">
      <div className="gap-card">
        <span className="eyebrow">The challenge</span>
        <h3>The rural digital gap</h3>
        <p>Millions of rural citizens lack access to essential digital services, such as government schemes, banking and online applications, because there is no local infrastructure or hardware.</p>
      </div>
      <div className="gap-card gap-card--solid">
        <span className="eyebrow">The Saathi solution</span>
        <h3>Sama Digi Kendras</h3>
        <p>Sama equips local rural women with refurbished laptops and digital training to set up Sama Digi Kendras, giving their village immediate access to digital services and building a sustainable livelihood for her.</p>
      </div>
    </div>
  </div>
</section>

{/*  S3 · How the model works  */}
<section className="sec sec--bg" style={{ paddingTop: '0' }}>
  <div className="wrap">
    <div className="divider center reveal">
      <span className="eyebrow">How the Sama Saathi model works</span>
      <h2 className="serif-h" style={{ marginTop: '18px' }}>From a refurbished laptop to a village Kendra</h2>
    </div>
    <div className="steps steps--4 reveal">
      <div className="step"><div className="step__num">01</div><div className="step__label">Selection &amp; onboarding</div><p className="step__text">Identifying driven entrepreneurs in target villages.</p></div>
      <div className="step"><div className="step__num">02</div><div className="step__label">Hardware &amp; setup</div><p className="step__text">Deploying refurbished corporate laptops, pre-configured for digital services.</p></div>
      <div className="step"><div className="step__num">03</div><div className="step__label">Training &amp; skilling</div><p className="step__text">Training in digital literacy, service delivery and business management.</p></div>
      <div className="step"><div className="step__num">04</div><div className="step__label">Launch &amp; impact</div><p className="step__text">Opening the Sama Digi Kendra to serve local citizens and generate a sustainable income.</p></div>
    </div>
  </div>
</section>

{/*  S4 · Stories of change  */}
<section className="sec" style={{ background: 'var(--beige)' }}>
  <div className="wrap">
    <div className="center reveal">
      <span className="eyebrow">Stories of change</span>
      <h2 className="serif-h" style={{ marginTop: '18px' }}>Two women. Two centres.</h2>
    </div>
    <div className="stories">
      <article className="story reveal">
        <img style={{ objectPosition: '22% center' }} src="/img/naina.jpg" alt="Naina, Sama Saathi from Neemuch district" />
        <div className="story__body">
          <div className="story__name">Naina</div>
          <div className="eyebrow story__place">Neemuch district, Madhya Pradesh</div>
          <p className="story__text">Naina comes from the Banchhada community, where generations of women have faced significant social barriers. Her centre has become the trusted point through which her village accesses government schemes, opens bank accounts, updates essential documents and submits applications. These are services that were previously difficult or impossible to reach without leaving the village.</p>
          <div className="story__stats"><div className="stat"><b>800+</b><span>Citizens served</span></div></div>
        </div>
      </article>
      <article className="story reveal">
        <img src="/img/shrutika.jpg" alt="Shrutika, Sama Saathi from Mitnapur" />
        <div className="story__body">
          <div className="story__name">Shrutika, 19</div>
          <div className="eyebrow story__place">Mitnapur, Yavatmal district, Maharashtra</div>
          <p className="story__text">Shrutika grew up watching the financial pressure that debt placed on her family after her father passed away. Instead of losing hope, she built her Sama Digi Kendra at home. She has earned an income from day one, and is now expanding her centre to serve children and the elderly in her village.</p>
          <div className="story__stats"><div className="stat"><b>900+</b><span>Citizens served</span></div><div className="stat"><b>₹10,000</b><span>Earned in one week, Sept 2026</span></div></div>
        </div>
      </article>
    </div>
  </div>
</section>

{/*  S5 · Why the model works  */}
<section className="sec sec--bg">
  <div className="wrap">
    <div className="center reveal">
      <h2 className="serif-h">One centre becomes many</h2>
      <p className="lede">The Sama Saathi Programme invests directly in rural micro-entrepreneurs, making them long-term catalysts for local economic growth and digital inclusion. By combining hardware with capacity building, business development and continuous mentorship, skills, confidence and economic opportunity ripple across entire communities.</p>
    </div>
    <div className="steps reveal">
      <div className="step">
        <div className="step__num">01</div><div className="step__label">Own</div>
        <p className="step__text">She establishes her digital service centre.</p>
        <svg className="connector" viewBox="0 0 76 20" fill="none" stroke="#174B32" strokeWidth="1.2"><path d="M2 16C22 18 44 4 74 3"/></svg>
        <div className="step__art"><img src="https://navgurukul.github.io/sama-website/assets/centre-origin-transparent-IIE9goi7.webp" alt="An illustrated Saathi-owned digital service centre" /></div>
      </div>
      <div className="step">
        <div className="step__num">02</div><div className="step__label">Support</div>
        <p className="step__text">She trains and supports other women in her network.</p>
        <svg className="connector" viewBox="0 0 76 20" fill="none" stroke="#174B32" strokeWidth="1.2"><path d="M2 4C28 2 46 18 74 15"/></svg>
        <div className="step__art"><img src="https://navgurukul.github.io/sama-website/assets/saathi-support-transparent-B6IdxMrx.webp" alt="An illustrated Saathi showing another woman how to work on a laptop" /></div>
      </div>
      <div className="step">
        <div className="step__num">03</div><div className="step__label">Multiply</div>
        <p className="step__text">More centres emerge, creating opportunity across communities.</p>
        <div className="step__art step__art--many">
          <img src="https://navgurukul.github.io/sama-website/assets/centre-network-1-transparent-C9WTI2r2.webp" alt="" />
          <img src="https://navgurukul.github.io/sama-website/assets/centre-network-2-transparent-B-hcIZPi.webp" alt="" />
          <img src="https://navgurukul.github.io/sama-website/assets/centre-network-3-transparent-OeTWa8_8.webp" alt="" />
        </div>
      </div>
    </div>
    <div className="videos reveal">
      <div className="video"><iframe src="https://drive.google.com/file/d/1Cv2sxmPrxLo_Mq-G9grP72_XhCF9y3H-/preview" title="Sama Saathi video 1" allow="autoplay; fullscreen" loading="lazy"></iframe></div>
      <div className="video"><iframe src="https://drive.google.com/file/d/1UC7CIyFKDu7N7URJdvQLizhPuQqQW6Fr/preview" title="Sama Saathi video 2" allow="autoplay; fullscreen" loading="lazy"></iframe></div>
    </div>
  </div>
</section>

{/*  Growing from here  */}
<section className="sec sec--bg" style={{ paddingTop: '0' }}>
  <div className="wrap">
    <div className="divider reveal">
      <h2 className="serif-h">Growing from here.</h2>
    </div>
    <div className="geo reveal">
      <div className="state">
        <svg viewBox="0 0 193 163" role="img" aria-label="Map of Maharashtra"><path d="M42,12 49,14 57,19 66,25 77,25 83,30 92,29 97,22 105,18 113,20 113,25 122,24 131,20 139,22 146,19 154,21 164,21 173,24 176,29 176,37 177,44 173,52 173,58 176,61 182,68 176,69 170,78 167,85 163,77 163,68 155,66 147,68 140,63 131,59 129,65 125,73 119,75 120,81 116,88 113,94 107,91 101,96 97,103 93,106 88,111 86,114 78,113 72,115 73,123 65,125 59,125 52,131 46,132 45,137 47,142 47,148 40,152 32,150 27,141 25,132 23,122 21,113 19,104 16,94 16,92 16,83 18,78 14,78 13,67 11,59 16,51 22,53 27,46 29,41 37,40 33,32 35,29 41,23 41,21 36,18Z"/></svg>
        <h3>Maharashtra</h3><p>Yavatmal · Nandurbar · Gadchiroli</p>
      </div>
      <div className="state">
        <svg viewBox="0 0 206 155" role="img" aria-label="Map of Madhya Pradesh"><path d="M98,12 111,14 117,22 114,30 111,40 100,46 99,56 101,69 110,72 113,65 107,55 105,46 110,44 114,45 112,47 116,49 121,51 124,48 128,52 137,47 143,51 148,53 153,52 157,56 163,52 169,51 177,58 183,62 192,63 193,73 191,81 178,82 171,83 175,89 180,98 173,107 165,112 157,120 153,129 146,137 136,134 124,130 113,134 103,133 92,137 82,134 79,130 68,136 59,144 51,137 37,137 24,131 16,125 12,116 12,113 20,105 22,98 23,91 29,81 27,70 27,59 28,57 36,54 40,58 39,61 49,64 48,72 43,77 46,80 55,74 63,74 72,73 73,66 72,58 80,53 77,47 65,45 66,34 77,26 89,19Z"/></svg>
        <h3>Madhya Pradesh</h3><p>Neemuch</p>
      </div>
      <img className="arrow" src="https://navgurukul.github.io/sama-website/assets/sketch-arrow-transparent-Dk6vZfqn.webp" alt="" />
      <div className="state state--next">
        <svg viewBox="0 0 104 159" role="img" aria-label="Map of Chhattisgarh"><path d="M73,9 78,13 81,17 86,20 87,24 88,29 91,34 95,36 92,41 87,45 84,49 79,53 78,58 76,62 75,65 74,71 71,74 66,75 59,76 56,81 52,84 53,90 54,96 56,101 60,104 57,104 51,103 46,101 42,103 46,107 47,112 49,117 50,123 48,129 43,131 41,136 36,140 34,146 30,150 25,149 24,142 20,142 18,137 14,132 9,130 9,125 11,118 16,116 21,115 20,111 16,107 12,105 13,103 13,98 15,95 16,89 16,86 13,80 14,75 18,70 19,63 21,57 24,55 27,50 29,46 34,46 38,42 40,38 44,33 48,30 47,25 43,22 37,22 39,17 39,14 45,14 51,15 56,15 62,12 68,13Z"/></svg>
        <h3>Chhattisgarh</h3><p>Expanding next</p>
      </div>
    </div>
  </div>
</section>

{/*  CTA  */}
<section className="cta" id="become">
  <div className="wrap">
    <div className="grid reveal">
      <h2 className="serif-h">Could the next centre be yours?</h2>
      <div className="opt">
        <span className="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5C785A" strokeWidth="1.6"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6"/></svg></span>
        <div>
          <p>For women interested in owning and running a centre in their community.</p>
          <a href="#contact:connect" data-topic="I want to become a Sama Saathi">I want to become a Saathi <span>→</span></a>
        </div>
      </div>
      <div className="opt">
        <span className="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5C785A" strokeWidth="1.6"><rect x="5" y="4" width="14" height="16" rx="1.5"/><path d="M9 8h6M9 12h6M9 16h3"/></svg></span>
        <div>
          <p>For organisations and local partners who want to bring the Saathi model to their community.</p>
          <a href="#contact:connect" data-topic="Bringing the Saathi model to my community">Bring the model to my community <span>→</span></a>
        </div>
      </div>
    </div>
  </div>
  <div className="landscape"><img src="https://navgurukul.github.io/sama-website/assets/saathi-landscape-transparent-rT7habJw.webp" alt="" /></div>
</section>
    </div>
  );
}
