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
    heading: "Corporate Laptop Donation & E-Waste",
    subtext:
      "Partner with Sama to transform end-of-life company laptops into powerful educational tools for youth and girls across India.",
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
    heading: "Our Corporate Partners",
    subtext:
      "Our corporate partners enable us to turn retired laptops into life-changing tools for underserved communities, fostering digital education, career opportunities, and sustainable e-waste solutions."
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
    const staticContent = `
      <main style="max-width: 900px; margin: 40px auto; padding: 20px; font-family: sans-serif; display: none;">
        <h1>${route.heading}</h1>
        <p>${route.subtext}</p>
        <p>Sama Digital Foundation | <a href="https://thesama.in/donate">Donate Laptops</a> | <a href="https://thesama.in/corporatepartner">Corporate Partnerships</a></p>
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
