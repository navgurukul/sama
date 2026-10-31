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
    path: "/donate",
    title: "Donate Used Laptops & E-Waste | Sama",
    description:
      "Partner with Sama to donate retired company laptops and IT assets. We turn end-of-life devices into learning tools for girls and youth across India.",
    canonical: `${BASE_URL}/donate`,
    heading: "Corporate Laptop Donation & E-Waste Repurposing in India",
    subtext:
      "Partner with Sama Digital Foundation to transform end-of-life company laptops into powerful educational tools for youth and girls across India. We coordinate pan-India pickup, complete data wiping, and track hardware deployment to verified grassroots schools.",
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
    path: "/corporatepartner",
    title: "Corporate Partnerships | Sama Digital Foundation",
    description:
      "Partner with Sama to repurpose retired company laptops into digital education tools for underserved youth, supporting circular economy and sustainability.",
    canonical: `${BASE_URL}/corporatepartner`,
    heading: "Corporate Partnerships: E-Waste Circularity & Digital Inclusion",
    subtext:
      "Our corporate partners enable us to turn retired laptops into life-changing tools for underserved communities, fostering digital education, career opportunities, and sustainable e-waste solutions.",
    faqs: [
      {
        question: "How does a company partner with Sama for laptop donation?",
        answer: "Companies can sign up on our corporate partner portal to register device batches, schedule pan-India logistics, and track hardware impact."
      },
      {
        question: "Can companies track the impact of their donated laptops?",
        answer: "Yes, Sama provides transparent tracking reports showing deployment details, student reach, and educational outcomes across beneficiary schools."
      }
    ],
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How does a company partner with Sama for laptop donation?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Companies can sign up on our corporate partner portal to register device batches, schedule pan-India logistics, and track hardware impact."
              }
            },
            {
              "@type": "Question",
              "name": "Can companies track the impact of their donated laptops?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Sama provides transparent tracking reports showing deployment details, student reach, and educational outcomes across beneficiary schools."
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
              "name": "Corporate Partners",
              "item": `${BASE_URL}/corporatepartner`
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
    title: "About Sama | Tech & Digital Empowerment",
    description:
      "Learn how Sama bridges the digital divide in India by transforming retired corporate hardware into classrooms and job-ready tech skills.",
    canonical: `${BASE_URL}/about`,
    heading: "About Sama: Refurbishing Laptops for Digital Education in India",
    subtext:
      "Sama bridges the digital divide by collecting end-of-life laptops from corporates, refurbishing them, and distributing devices to underserved communities."
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
    path: "/about-initiative",
    title: "About Our Initiative | Sama Digital Foundation",
    description:
      "Discover Sama's mission to bridge the digital divide in India through verified hardware refurbishment and education empowerment.",
    canonical: `${BASE_URL}/about-initiative`,
    heading: "Empower Tomorrow's Innovators with Yesterday's Devices",
    subtext:
      "Donate laptops to enable students from marginalized communities to open pathways for higher education or exciting careers."
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
    path: "/comms",
    title: "Communications & Reports | Sama Digital Foundation",
    description: "Official annual reports, impact assessments, research publications, and field stories from Sama Digital Foundation.",
    canonical: `${BASE_URL}/comms`,
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
      <main style="max-width: 900px; margin: 40px auto; padding: 20px; font-family: sans-serif; display: none;">
        <h1>${route.heading}</h1>
        <p>${route.subtext}</p>
        ${faqHtml}
        <p style="margin-top: 20px;">Sama Digital Foundation | <a href="https://thesama.in/donate">Donate Laptops</a> | <a href="https://thesama.in/corporatepartner">Corporate Partnerships</a></p>
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

  console.log(`[generate-seo] Successfully generated ${count} static route pages for S3/CloudFront.`);
}

generateSeoPages();
