# Sama SEO & Metadata Architecture — Comprehensive Guide

## 1. Executive Summary & Architecture Overview

Sama’s SEO system uses a **centralized, route-aware architecture** designed specifically for Single Page Applications (SPAs) built with React.

Rather than scattering `<SEO />` tags across multiple component files (which previously caused metadata leakage and accidental indexing of internal portals), the platform manages all search directives, Open Graph cards, canonical tags, and structured JSON-LD schemas through a single manager:
* **Root Mount**: `src/components/SEO/SeoRouter.js` (mounted inside `<Router>` in `src/App.js`).
* **Head Injector Component**: `src/components/SEO/SEO.js`.
* **Centralized Metadata Config**: `src/components/SEO/seoConfig.js`.
* **Static Fallback & Schema**: `public/index.html`.
* **Social Asset**: `public/og-image.jpg`.
* **Sitemap & Robots**: `public/sitemap.xml`, `public/robots.txt`.

---

## 2. Directory Structure & Key Files

```
sama/
├── public/
│   ├── index.html        # Pre-JS static titles, Open Graph tags, en-IN lang, static Organization schema
│   ├── og-image.jpg      # Official 1200x630 social preview banner (< 300 KB)
│   ├── robots.txt        # Crawl rules (disallowing /login, /corporate*, /admin*, /pickup*)
│   ├── sitemap.xml       # Canonical XML sitemap (<loc> and <lastmod>) submitted to Search Console
│   └── google9ab51571448867b4.html # Google Search Console HTML verification file
└── src/
    ├── App.js            # Mounts <SeoRouter /> at application root
    └── components/
        └── SEO/
            ├── README.md         # Technical reference documentation
            ├── SEO.js            # Pure DOM injector for dynamic meta/canonical/JSON-LD
            ├── SeoRouter.js      # Dynamic route matching, parameter sanitization & noindex default
            └── seoConfig.js      # Single source of truth for public titles, descriptions & schemas
```

---

## 3. How Dynamic Route Matching & Protection Work

`SeoRouter.js` intercepts every route transition and applies strict rules:
1. **Case-Insensitive Normalization**:
   - URLs like `/Donate`, `/donate`, and `/DoNaTe` match the exact same `/donate` configuration.
2. **Trailing Slash Removal**:
   - `/donate/` and `/donate` resolve identically without redirects.
3. **Query String & Fragment Strip**:
   - Tracking parameters like `/donate?utm_source=linkedin&ref=newsletter#form` are stripped before matching, preventing duplicate indexation.
4. **Internal Route Protection**:
   - The primary public URL `/ngoregistration` is public.
   - Any donor-specific parameterized links (`/ngoregistration/:donorId`) automatically receive `noindex, nofollow` to protect donor privacy.
5. **Private Route Default (`noindex, nofollow`) & robots.txt Protection**:
   - Any route not explicitly in `routeMap` (e.g. `/login`, `/corporate`, `/donormanager`, `/pickup-request-by-donor`, and 404s) receives `noindex, nofollow`.
   - In addition, `robots.txt` explicitly disallows bots from crawling `/login`, `/corporate*`, `/admin*`, and `/pickup*`, ensuring crawlers never waste crawl budget on gated portals.

---

## 4. Current Public Routes & Metadata Specifications

All page titles follow Google's strict display limits (≤ 60 characters) and high-intent commercial keywords:

| Route Path | Canonical URL | Title (Length) | Core Keyword Target |
| :--- | :--- | :--- | :--- |
| `/` | `https://thesama.in` | `Sama Digital Foundation \| E-Waste & Laptop Donation` (50 chars) | E-Waste, Laptop Donation India |
| `/donate` | `https://thesama.in/donate` | `Donate Used Laptops & E-Waste \| Sama` (37 chars) | Corporate Laptop Donation, E-Waste CSR |
| `/corporatepartner` | `https://thesama.in/corporatepartner` | `Corporate ESG & CSR Partnerships \| Sama` (41 chars) | Corporate ESG, IT Asset Disposal CSR |
| `/ngoregistration` | `https://thesama.in/ngoregistration` | `Request Refurbished Laptops for NGOs \| Sama` (45 chars) | Refurbished Laptops for NGOs / Schools |
| `/about` | `https://thesama.in/about` | `About Sama \| Tech & Digital Empowerment` (41 chars) | Digital Divide, Women Empowerment |
| `/our-approach` | `https://thesama.in/our-approach` | `Device Lifecycle & Refurbishment \| Sama` (41 chars) | Hardware Refurbishment, Data Sanitization |
| `/our-government` | `https://thesama.in/our-government` | `Government & Public Sector Partnerships \| Sama` (49 chars) | Public Education, Digital Inclusion |
| `/communitypartners` | `https://thesama.in/communitypartners` | `Community Partners & Grassroots Impact \| Sama` (47 chars) | Community Learning Centres, Youth Empowerment |
| `/ourteam` | `https://thesama.in/ourteam` | `Our Team & Leadership \| Sama Digital Foundation` (49 chars) | Leadership, Circular Economy Team |
| `/about-initiative` | `https://thesama.in/about-initiative` | `About Our Initiative \| Sama Digital Foundation` (47 chars) | Digital Empowerment Initiative |
| `/privacy-policy` | `https://thesama.in/privacy-policy` | `Privacy Policy \| Sama Digital Foundation` (41 chars) | Transparency, Cookie & LinkedIn Pixel Policy |

---

## 5. Structured Data (JSON-LD Schema) Implementation

1. **Static Organization Schema (`public/index.html`):**
   - Available to raw crawlers without executing JavaScript.
   - Assigned `@id`: `"https://thesama.in/#organization"`.
   - Includes official social links (LinkedIn, Instagram), contact email (`operations@thesama.in`), logo URL, and area served (`IN`).
2. **Linked Dynamic WebSite Schema (`seoConfig.js`):**
   - Embedded on the homepage with `@id`: `"https://thesama.in/#website"`.
   - Uses `"publisher": { "@id": "https://thesama.in/#organization" }` to link the site entity directly to the organization entity.
   - *Validation Tool*: Test using the official **Schema Markup Validator** ([validator.schema.org](https://validator.schema.org)).
3. **No Deprecated FAQ Markup:**
   - FAQ rich result schemas were intentionally removed, aligning with Google Search algorithm updates.

---

## 6. Social Share Card Guidelines (`public/og-image.jpg`)

- **File Path**: `public/og-image.jpg` (mirrored to `build/og-image.jpg`).
- **Exact Dimensions**: `1200 x 630 px` (Standard 1.91:1 Open Graph ratio).
- **File Size**: Optimized under 300 KB (~154 KB) for instant link unfurling on slow mobile networks.
- **Card Content**:
  - Sama logo & tagline (*"Empowering India's Digital Future"*).
  - Main headline: *"Corporate Laptop Donation & E-Waste CSR India"*.
  - Impact metrics: *17,000+ laptops donated, Pan-India presence*.
  - Official domain: `thesama.in`.
- **Injected Meta Tags**:
  - `og:image`: `https://thesama.in/og-image.jpg`
  - `og:image:width`: `1200`
  - `og:image:height`: `630`
  - `og:image:alt`: `Sama Digital Foundation - Corporate Laptop Donation & E-Waste CSR India`
  - `twitter:card`: `summary_large_image`
  - `og:site_name`: `Sama Digital Foundation`
  - `og:locale`: `en_IN`

---

## 7. Semantic Heading Standard (`<h1>`)

Every public page enforces **exactly one primary `<h1>`** tag, preserving the original design and typography:

* **Home (`/`)**: `<Typography variant="h3" component="h1">` $\rightarrow$ *"Where yesterday's devices power tomorrow's innovators"*
* **Donate (`/donate`)**: `<Typography variant="h6" component="h1">` $\rightarrow$ *"Support Sama's Mission"*
* **NGO Registration (`/ngoregistration`)**: `<Typography variant="h5" component="h1">` $\rightarrow$ *"NGO Information Form"*
* **About (`/about`)**: `<Typography variant="h5" component="h1">` $\rightarrow$ *"What We Do"*
* **Our Approach (`/our-approach`)**: `<Typography sx={styleh5} variant="h5" component="h1">` $\rightarrow$ *"Our Rationale"*
* **Privacy Policy (`/privacy-policy`)**: `<Typography variant="h5" component="h1">` $\rightarrow$ *"Privacy Policy"*

---

## 8. Prerendering & Crawling Architecture (Important Context)

* **Googlebot:** Google renders JavaScript pages, sometimes with a delay depending on server response times and crawl queueing.
* **Non-JS Scrapers (WhatsApp, LinkedIn, Twitter/X):**
  - These crawlers make a simple HTTP GET request and parse the raw `public/index.html` without running React code.
  - Therefore, shared links on `/donate` read the fallback tags from `index.html` (which feature the official title and `og-image.jpg`).
* **Recommended Upgrade**: Prerendering (via `react-snap`, SSR, or Cloudflare Edge Worker Prerendering) is strongly recommended so search previews and first-pass crawlers see route-specific raw HTML immediately.

---

## 9. Post-Deployment Verification & Go-Live Checklist

Once deployed to production (`https://thesama.in`), run these verification steps:

### A. Terminal / cURL Verification
```bash
# 1. Verify Homepage Raw Title & Schema
curl -s https://thesama.in/ | grep -i "<title>"
curl -s https://thesama.in/ | grep -i "schema.org"

# 2. Verify Robots & Sitemap Accessibility (ensuring server serves real files, not index.html)
curl -s https://thesama.in/robots.txt
curl -s https://thesama.in/sitemap.xml | head -25
curl -s https://thesama.in/google9ab51571448867b4.html
```

### B. In-Browser DevTools Verification
1. Open Chrome DevTools on `https://thesama.in/login` $\rightarrow$ inspect `<head>` $\rightarrow$ confirm `<meta name="robots" content="noindex, nofollow">` is present.
2. Click over to `/donate` $\rightarrow$ confirm `noindex` disappears immediately and `<link rel="canonical">` points to `https://thesama.in/donate`.
3. In Console tab, verify all schemas using:
   ```javascript
   document.querySelectorAll('script[type="application/ld+json"]').forEach(s => console.log(JSON.parse(s.textContent)));
   ```

### C. Search Engines & Social Platforms
* **Google Search Console:**
  1. Complete site ownership verification (via `google9ab51571448867b4.html` or HTML tag).
  2. Submit `https://thesama.in/sitemap.xml`.
  3. Use the **URL Inspection Tool** on `/`, `/donate`, and `/ngoregistration`.
  4. Click **"Test Live URL"** $\rightarrow$ click **"View Tested Page"** to confirm Googlebot executes the page cleanly.
* **Bing Webmaster Tools:** Connect and import the verified Google Search Console property (takes 2 minutes).
* **LinkedIn Post Inspector:** Paste `https://thesama.in` $\rightarrow$ click "Inspect" $\rightarrow$ confirm image, title, and description preview cleanly.

---

## 10. Organic Search Measurement (30-60-90 Day Plan)

1. **Baseline Snapshot (Before Deployment):** Record current Google Search Console total clicks, impressions, and PageSpeed Insights mobile/desktop scores before deploying new marketing initiatives.
2. **GA4 Tracking:** Add Google Analytics 4 tag (`G-XXXXXXXXXX`) to `public/index.html` to measure key events (`donate_form_submit`, `ngo_form_submit`).
3. **Monthly Review:** Review keyword queries monthly in Search Console, targeting higher click-through on high-intent terms (*"corporate laptop donation india"*, *"e-waste CSR"*).
