/**
 * Build-time static SEO HTML generator for Sama Digital Foundation
 * Inspired by InternHack's lightweight build generator:
 * - Reads compiled `build/index.html` as a template
 * - Generates dedicated static `index.html` files for every public route:
 *   /donate/index.html, /corporatepartner/index.html, /our-government/index.html, etc.
 * - Injects exact <title>, <meta name="description">, canonical tag, OG tags, and Schema.org JSON-LD
 * - Provides non-JS crawlers (WhatsApp, LinkedIn, ChatGPT, Perplexity) with complete metadata
 * - When loaded in a browser, React cleanly hydrates without affecting application flow or user data.
 */

const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.join(__dirname, "..", "build");
const TEMPLATE_PATH = path.join(BUILD_DIR, "index.html");
const BASE_URL = "https://thesama.in";

const routes = [
  {
    path: "/",
    title: "Sama Digital Foundation | Corporate Laptop Donation & E-Waste CSR India",
    description:
      "Sama repurposes corporate retired laptops and e-waste to power digital education for underserved girls and youth across India. Certified data erasure and CSR-1 compliance.",
    canonical: `${BASE_URL}/`,
    heading: "Sama Digital Foundation | A laptop’s second life. Someone’s first.",
    subtext:
      "We collect retired laptops from corporate offices, sanitize all storage drives with certified NIST 800-88 data wiping, refurbish hardware, and deploy ready-to-learn computers through 60+ verified grassroots NGO partners across 21 Indian states. Your IT team hands over; we do the rest.",
    faqs: [
      {
        question: "What does Sama Digital Foundation do?",
        answer: "Sama Digital Foundation is a Section 8 non-profit that bridges India's digital divide by collecting end-of-life corporate laptops, refurbishing them to high performance, and deploying them to schools, grassroots NGOs, and community learning centres."
      },
      {
        question: "How can corporations donate retired laptops and IT assets to Sama?",
        answer: "Companies can visit our Corporate Partnerships or Donate page to register device batches. Sama manages pan-India doorstep pickup, NIST 800-88 certified data sanitization, asset tracking, and Form CSR-1 documentation."
      },
      {
        question: "Does Sama guarantee secure data destruction on donated computers?",
        answer: "Yes, every laptop and desktop undergoes multi-pass software erasure meeting NIST 800-88 standards. Sama provides serialized Certificates of Data Erasure for corporate IT security and CISO audit sign-off."
      },
      {
        question: "Are laptop donations and CSR partnerships eligible under Section 135?",
        answer: "Yes. S.A.M.A. Digital Foundation is registered with the Ministry of Corporate Affairs under Form CSR-1 (CIN: U85500PN2024NPL233531). Contributions qualify under Schedule VII of the Companies Act, 2013."
      }
    ]
  },
  {
    path: "/donate",
    title: "Donate Used Laptops & E-Waste | Sama Digital Foundation",
    description:
      "Donate retired company laptops, pre-owned devices, or request laptops for education. Certified data erasure and pan-India logistics by Sama Digital Foundation.",
    canonical: `${BASE_URL}/donate`,
    heading: "Donate a Laptop | Join the Digital Inclusion Movement",
    subtext:
      "Whether you are a corporation looking to offboard IT assets seamlessly, an individual giving a pre-owned device a second life, or an institution driving digital literacy, there is a place for you in our ecosystem. Help us close the hardware divide.",
    faqs: [
      {
        question: "What devices does Sama accept for donation?",
        answer: "Sama accepts retired corporate laptops, desktops, monitors, tablets, and related IT peripherals in working or repairable condition."
      },
      {
        question: "How does Sama handle data sanitization on donated laptops?",
        answer: "Every donated device undergoes rigorous, complete storage data erasure to ensure all company proprietary data is permanently wiped before refurbishment."
      },
      {
        question: "Does Sama arrange device pickup across India?",
        answer: "Yes, Sama manages coordinated doorstep logistics and pickup for corporate IT assets across major cities and states in India."
      },
      {
        question: "Who receives the refurbished laptops?",
        answer: "Refurbished laptops are deployed to verified grassroots NGOs, government schools, and community digital learning centres supporting underserved girls and youth."
      }
    ],
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "DonateAction",
          "name": "Donate Used Laptops and IT Assets to Sama",
          "description":
            "Donate retired company laptops and e-waste to power digital education for underserved girls and youth in India.",
          "recipient": {
            "@id": `${BASE_URL}/#organization`
          },
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${BASE_URL}/donate`
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What devices does Sama accept for donation?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sama accepts retired corporate laptops, desktops, monitors, tablets, and related IT peripherals in working or repairable condition."
              }
            },
            {
              "@type": "Question",
              "name": "How does Sama handle data sanitization on donated laptops?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Every donated device undergoes rigorous, complete storage data erasure to ensure all company proprietary data is permanently wiped before refurbishment."
              }
            },
            {
              "@type": "Question",
              "name": "Does Sama arrange device pickup across India?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Sama manages coordinated doorstep logistics and pickup for corporate IT assets across major cities and states in India."
              }
            },
            {
              "@type": "Question",
              "name": "Who receives the refurbished laptops?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Refurbished laptops are deployed to verified grassroots NGOs, government schools, and community digital learning centres supporting underserved girls and youth."
              }
            }
          ]
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": BASE_URL
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Donate Laptops",
              "item": `${BASE_URL}/donate`
            }
          ]
        }
      ]
    }
  },
  {
    path: "/ngo-information",
    title: "NGO Information & Statutory Disclosures | Sama Digital Foundation",
    description:
      "Statutory information, Form CSR-1 registration, CIN U85500PN2024NPL233531, and Directors' Report of S.A.M.A. Digital Foundation under Companies Act, 2013.",
    canonical: `${BASE_URL}/ngo-information`,
    heading: "S.A.M.A. Digital Foundation Statutory Disclosures & Compliance",
    subtext:
      "Statutory disclosures, Board of Directors, MCA Form CSR-1 registration, and Directors' Report under the Companies Act, 2013.",
    faqs: [],
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": BASE_URL
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "NGO Information",
              "item": `${BASE_URL}/ngo-information`
            }
          ]
        }
      ]
    }
  },
  {
    path: "/our-government",
    title: "Government & Public Sector Partnerships | Sama",
    description:
      "Partnering with state and education initiatives to advance digital literacy, e-waste circularity, and smart education in public institutions.",
    canonical: `${BASE_URL}/our-government`,
    heading: "Our Government Partners",
    subtext:
      "Through government collaborations, we scale our efforts to reach rural and underserved areas, ensuring equitable access to technology and opportunity."
  },
  {
    path: "/communitypartners",
    title: "Community Partners & Grassroots Impact | Sama",
    description:
      "See how Sama collaborates with community organizations, learning centres, and grassroots NGOs to empower youth and women across India.",
    canonical: `${BASE_URL}/communitypartners`,
    heading: "Our Community Partners",
    subtext:
      "Our community partners bring local insights and on-the-ground support, helping us connect with and empower the individuals who need it most."
  },
  {
    path: "/ngoregistration",
    title: "Request Refurbished Laptops for NGOs | Sama",
    description:
      "Apply for high-quality refurbished laptops and digital classroom devices for your grassroots NGO, community learning centre, or school in India.",
    canonical: `${BASE_URL}/ngoregistration`,
    heading: "Request Refurbished Laptops for Grassroots NGOs & Schools",
    subtext:
      "Apply for high-quality refurbished laptops and digital learning infrastructure for your grassroots NGO, learning centre, or school across India."
  },
  {
    path: "/about",
    title: "Who We Are | Sama Digital Foundation",
    description:
      "Sama repurposes corporate retired laptops and e-waste to power digital education for underserved girls and youth across India.",
    canonical: `${BASE_URL}/`,
    heading: "Who We Are | Sama Digital Foundation",
    subtext:
      "Sama Digital Foundation bridges the digital divide in India by collecting retired enterprise laptops, refurbishing them to high performance, and deploying them to schools and grassroots NGOs."
  },
  {
    path: "/our-approach",
    title: "Device Lifecycle & Refurbishment | Sama",
    description:
      "Explore Sama's laptop refurbishment process: collecting retired devices, data erasure, hardware testing, and empowering grassroots learners in India.",
    canonical: `${BASE_URL}/our-approach`,
    heading: "Our Approach: Device Lifecycle & Circular Impact",
    subtext:
      "Recovering corporate IT hardware, ensuring complete data erasure, and deploying refurbished devices to empower digital literacy."
  },
  {
    path: "/ourteam",
    title: "Our Team & Leadership | Sama Digital Foundation",
    description:
      "Meet the dedicated team, leaders, and technologists driving Sama's circular economy and digital inclusion missions across India.",
    canonical: `${BASE_URL}/ourteam`,
    heading: "Our Team",
    subtext:
      "Meet the passionate individuals who bring innovation and excellence to every project, driven by a shared vision of creating lasting impact."
  },
  {
    path: "/team",
    title: "Our Team & Leadership | Sama Digital Foundation",
    description:
      "Meet the dedicated team, leaders, and technologists driving Sama's circular economy and digital inclusion missions across India.",
    canonical: `${BASE_URL}/ourteam`,
    heading: "Our Team",
    subtext:
      "Meet the passionate individuals who bring innovation and excellence to every project, driven by a shared vision of creating lasting impact."
  },
  {
    path: "/about-initiative",
    title: "Our Initiatives | Sama Digital Foundation",
    description:
      "Discover Sama's initiatives: Sama Saathi, Digital Labs, Renew Desk, and First Laptop programs empowering youth across India.",
    canonical: `${BASE_URL}/initiatives`,
    heading: "Our Initiatives | Sama Digital Foundation",
    subtext:
      "Transforming retired corporate laptops into learning and livelihood opportunities across India."
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy | Sama Digital Foundation",
    description:
      "Review the official data privacy policy, transparency guidelines, and security practices of Sama Digital Foundation.",
    canonical: `${BASE_URL}/privacy-policy`,
    heading: "Privacy Policy",
    subtext:
      "Review the official data privacy policy, transparency guidelines, and security practices of Sama Digital Foundation."
  },
  {
    path: "/initiatives",
    title: "Our Initiatives | Sama Digital Foundation",
    description: "Explore Sama Digital Foundation initiatives: rural women-led Sama Saathi centres and hands-on digital & AI literacy labs.",
    canonical: `${BASE_URL}/initiatives`,
    heading: "Sama Digital Foundation Initiatives",
    subtext: "Repurposing retired corporate laptops into learning and livelihood opportunities across India."
  },
  {
    path: "/sama-saathi",
    title: "Sama Saathi Programme | Sama Digital Foundation",
    description: "Women who own and operate their own community digital service centres. Transforming rural livelihoods on refurbished laptops.",
    canonical: `${BASE_URL}/sama-saathi`,
    heading: "Sama Saathi Programme",
    subtext: "Equipping rural women entrepreneurs with laptops, peripherals, and training to deliver essential digital services."
  },
  {
    path: "/labs",
    title: "Digital Inclusion & AI Literacy Labs | Sama",
    description: "Building functional computer labs in government schools, colleges, and training centres using refurbished corporate laptops.",
    canonical: `${BASE_URL}/labs`,
    heading: "Digital Inclusion & AI Literacy Labs",
    subtext: "Giving underserved students hands-on access to practical computing, AI literacy, and vocational skills."
  },
  {
    path: "/giving",
    title: "Giving Back | Sama Digital Foundation",
    description: "Employee laptop giving, the Renew Desk corporate refurbishment program, and Build for Good hackathons.",
    canonical: `${BASE_URL}/giving`,
    heading: "Giving Back with Sama",
    subtext: "Engage your workforce and empower community learning through corporate device refurbishment and hackathons."
  },
  {
    path: "/first-laptop",
    title: "First Laptop, Next Builder | Sama",
    description: "Support young innovators and grassroots software builders with their very first laptop for real-world impact.",
    canonical: `${BASE_URL}/first-laptop`,
    heading: "First Laptop, Next Builder",
    subtext: "Turning personal agency and ambition into technology solutions for India's underserved communities."
  },
  {
    path: "/bfg",
    title: "Build for Good 2026 | Sama",
    description: "India's annual social-tech hackathon powering grassroots solutions on refurbished hardware.",
    canonical: `${BASE_URL}/bfg`,
    heading: "Build for Good Hackathon",
    subtext: "Students and young builders solving real problems for communities across India."
  },
  {
    path: "/communications",
    title: "Communications & Reports | Sama Digital Foundation",
    description: "Official annual reports, impact assessments, research publications, and field stories from Sama Digital Foundation.",
    canonical: `${BASE_URL}/communications`,
    heading: "Sama Communications & Reports",
    subtext: "Transparent impact documentation, annual filings, and stories from our grassroots partners."
  },
  {
    path: "/comms",
    title: "Communications & Reports | Sama Digital Foundation",
    description: "Official annual reports, impact assessments, research publications, and field stories from Sama Digital Foundation.",
    canonical: `${BASE_URL}/communications`,
    heading: "Sama Communications & Reports",
    subtext: "Transparent impact documentation, annual filings, and stories from our grassroots partners."
  },
  {
    path: "/contact",
    title: "Contact Us | Sama Digital Foundation",
    description: "Get in touch with Sama Digital Foundation to donate laptops, explore corporate CSR partnerships, or start a Kendra.",
    canonical: `${BASE_URL}/contact`,
    heading: "Contact Sama Digital Foundation",
    subtext: "Reach our operations team at operations@thesama.in or submit a partnership inquiry."
  },
  {
    path: "/blog/beyond-connectivity",
    title: "Beyond Connectivity: India's Real Digital Divide | Sama",
    description: "Why smartphones are not enough for genuine education and livelihoods, and why computing access matters.",
    canonical: `${BASE_URL}/blog/beyond-connectivity`,
    heading: "Beyond Connectivity: The Real Divide",
    subtext: "An in-depth perspective on digital literacy, hardware agency, and educational equity."
  },
  {
    path: "/blog/from-e-waste-to-new-beginnings",
    title: "From E-Waste to New Beginnings | Sama",
    description: "How extending the lifecycle of corporate IT assets prevents carbon emissions and creates educational opportunity.",
    canonical: `${BASE_URL}/blog/from-e-waste-to-new-beginnings`,
    heading: "From E-Waste to New Beginnings",
    subtext: "Circular economy in action: avoiding 220kg CO2e per refurbished laptop."
  },
  {
    path: "/blog/rethinking-digital-inclusion",
    title: "Rethinking Digital Inclusion Through Sama Saathi | Sama",
    description: "How local women entrepreneurs are bridging the last-mile digital gap in rural India.",
    canonical: `${BASE_URL}/blog/rethinking-digital-inclusion`,
    heading: "Rethinking Digital Inclusion",
    subtext: "Ownership, agency, and community service delivery through village Digi Kendras."
  }
];

function generateSeoPages() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.warn("[generate-seo] build/index.html not found. Run 'npm run build' first.");
    return;
  }

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
  console.log(`[generate-seo] Generating ${routes.length} static SEO route pages...`);

  let count = 0;
  for (const route of routes) {
    let html = template;

    // 1. Replace Title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`);

    // 2. Replace Description
    html = html.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
      `<meta name="description" content="${route.description}" />`
    );

    // 3. Replace or Insert Canonical URL
    if (/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i.test(html)) {
      html = html.replace(
        /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
        `<link rel="canonical" href="${route.canonical}" />`
      );
    } else {
      html = html.replace(
        /<\/head>/i,
        `  <link rel="canonical" href="${route.canonical}" />\n</head>`
      );
    }

    // 4. Update Open Graph & Twitter meta tags
    html = html.replace(
      /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:title" content="${route.title}" />`
    );
    html = html.replace(
      /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:description" content="${route.description}" />`
    );
    html = html.replace(
      /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:url" content="${route.canonical}" />`
    );
    html = html.replace(
      /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
      `<meta name="twitter:title" content="${route.title}" />`
    );
    html = html.replace(
      /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
      `<meta name="twitter:description" content="${route.description}" />`
    );

    // 5. Inject per-route schema if present
    if (route.schema) {
      const schemaString = JSON.stringify(route.schema);
      html = html.replace(
        /<\/head>/i,
        `  <script type="application/ld+json">${schemaString}</script>\n</head>`
      );
    }

    // 6. Inject crawlable snapshot inside <div id="root">
    // React 18 createRoot will clear and hydrate this on mount, but non-JS bots see real text!
    const faqHtml = route.faqs && route.faqs.length
      ? `
        <section style="margin-top: 24px;">
          <h2>Frequently Asked Questions</h2>
          ${route.faqs
            .map(
              (f) => `
            <article style="margin-bottom: 16px;">
              <h3>${f.question}</h3>
              <p>${f.answer}</p>
            </article>`
            )
            .join("")}
        </section>`
      : "";

    const staticContent = `
      <main style="max-width: 960px; margin: 40px auto; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #2D3748;">
        <h1 style="color: #2F3E2E; font-size: 32px; line-height: 1.25; margin-bottom: 16px;">${route.heading}</h1>
        <p style="font-size: 18px; color: #4A5568; margin-bottom: 24px;">${route.subtext}</p>
        <div style="margin: 28px 0; padding: 20px 24px; background: #F0F4EF; border-left: 4px solid #5C785A; border-radius: 6px;">
          <h2 style="margin-top: 0; font-size: 19px; color: #2F3E2E;">Verified Grassroots Impact Across India</h2>
          <p style="margin: 8px 0 0 0; color: #4A5568;"><strong>18,500+</strong> Laptops &amp; Devices Deployed · <strong>60+</strong> Grassroots NGO Partners · <strong>21</strong> Indian States · <strong>100%</strong> NIST 800-88 Certified Data Sanitization</p>
        </div>
        ${faqHtml}
        <nav style="margin-top: 36px; padding-top: 24px; border-top: 1px solid #E2E8F0; font-size: 14px; color: #718096;">
          <p style="margin-bottom: 10px;"><strong>Sama Digital Foundation (S.A.M.A. Digital Foundation)</strong> · CIN: U85500PN2024NPL233531 · Form CSR-1 Reg. Ministry of Corporate Affairs · Pune, Maharashtra</p>
          <div style="display: flex; flex-wrap: wrap; gap: 10px 16px; margin-top: 10px;">
            <a href="https://thesama.in/donate" style="color: #5C785A; text-decoration: underline;">Donate Laptops</a>
            <a href="https://thesama.in/initiatives" style="color: #5C785A; text-decoration: underline;">Our Initiatives</a>
            <a href="https://thesama.in/sama-saathi" style="color: #5C785A; text-decoration: underline;">Sama Saathi</a>
            <a href="https://thesama.in/labs" style="color: #5C785A; text-decoration: underline;">Digital &amp; AI Labs</a>
            <a href="https://thesama.in/giving" style="color: #5C785A; text-decoration: underline;">Giving Back</a>
            <a href="https://thesama.in/ourteam" style="color: #5C785A; text-decoration: underline;">Team</a>
            <a href="https://thesama.in/communications" style="color: #5C785A; text-decoration: underline;">Reports &amp; Press</a>
            <a href="https://thesama.in/ngo-information" style="color: #5C785A; text-decoration: underline;">Statutory Disclosures</a>
            <a href="https://thesama.in/contact" style="color: #5C785A; text-decoration: underline;">Contact Us</a>
          </div>
        </nav>
      </main>
    `;
    html = html.replace('<div id="root"></div>', `<div id="root">${staticContent}</div>`);

    // 7. Write output directory and index.html
    const routeFolder = path.join(BUILD_DIR, route.path.replace(/^\//, ""));
    if (!fs.existsSync(routeFolder)) {
      fs.mkdirSync(routeFolder, { recursive: true });
    }

    fs.writeFileSync(path.join(routeFolder, "index.html"), html, "utf8");
    count++;
  }

  // 8. Generate clean 301/meta-refresh redirects for consolidated & removed URLs
  const redirects = [
    { from: "/corporatepartner", to: `${BASE_URL}/donate`, label: "Donate Laptops & Corporate Asset Disposal" },
    { from: "/corporate-partners", to: `${BASE_URL}/donate`, label: "Donate Laptops & Corporate Asset Disposal" },
    { from: "/about", to: `${BASE_URL}/`, label: "Who We Are | Sama Digital Foundation" },
    { from: "/about-initiative", to: `${BASE_URL}/initiatives`, label: "Our Initiatives" },
  ];

  for (const red of redirects) {
    const redFolder = path.join(BUILD_DIR, red.from.replace(/^\//, ""));
    if (!fs.existsSync(redFolder)) {
      fs.mkdirSync(redFolder, { recursive: true });
    }
    const redHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Redirecting to ${red.label}...</title>
  <link rel="canonical" href="${red.to}">
  <meta http-equiv="refresh" content="0; url=${red.to}">
  <meta name="robots" content="noindex, follow">
</head>
<body>
  <p>Redirecting to <a href="${red.to}">${red.label}</a>...</p>
</body>
</html>`;
    fs.writeFileSync(path.join(redFolder, "index.html"), redHtml, "utf8");
  }

  console.log(`[generate-seo] Successfully generated ${count} static route pages and ${redirects.length} SEO redirects for S3/CloudFront.`);
}

generateSeoPages();
