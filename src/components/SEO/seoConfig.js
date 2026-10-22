/**
 * Centralized SEO & Structured Data Configuration for Sama Platform
 * - Titles strictly ≤ 60 characters to prevent Google SERP truncation
 * - Descriptions strictly ≤ 155 characters
 * - Consistent canonicals without trailing slashes
 * - Accurate schema with real organization data
 */

export const BASE_URL = "https://thesama.in";

export const defaultSEO = {
  title: "Sama Digital Foundation | E-Waste & Laptop Donation",
  description:
    "Sama repurposes corporate retired laptops and e-waste to power digital education for underserved girls and youth across India.",
  canonical: BASE_URL,
  ogType: "website",
  ogImage: `${BASE_URL}/og-image.jpg`,
  ogImageAlt: "Sama Digital Foundation - Corporate Laptop Donation & E-Waste CSR India",
};

export const seoRoutes = {
  home: {
    title: "Sama Digital Foundation | E-Waste & Laptop Donation",
    description:
      "Sama repurposes corporate retired laptops and e-waste to power digital education for underserved girls and youth across India.",
    canonical: `${BASE_URL}`,
    ogType: "website",
    schema: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      name: "Sama Digital Foundation",
      url: BASE_URL,
      publisher: {
        "@id": `${BASE_URL}/#organization`
      }
    }
  },

  about: {
    title: "About Sama | Tech & Digital Empowerment",
    description:
      "Learn how Sama bridges the digital divide in India by transforming retired corporate hardware into classrooms and job-ready tech skills.",
    canonical: `${BASE_URL}/about`,
    ogType: "website",
    schema: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About Sama Digital Foundation",
      description:
        "Sama bridges the digital divide in India by turning retired corporate hardware into classrooms and job-ready tech skills.",
      url: `${BASE_URL}/about`
    }
  },

  ourApproach: {
    title: "Device Lifecycle & Refurbishment | Sama",
    description:
      "Explore Sama's transparent laptop refurbishment lifecycle: certified data sanitization, hardware audits, RMS monitoring, and impact reporting.",
    canonical: `${BASE_URL}/our-approach`,
    ogType: "website"
  },

  donate: {
    title: "Donate Used Laptops & E-Waste | Sama",
    description:
      "Partner with Sama to donate retired company laptops and IT assets. Certified data wiping, 80G tax receipts, nationwide logistics, and verifiable impact.",
    canonical: `${BASE_URL}/donate`,
    ogType: "website"
  },

  ngoRegistration: {
    title: "Request Refurbished Laptops for NGOs | Sama",
    description:
      "Apply for high-quality refurbished laptops and digital classroom devices for your grassroots NGO, community learning centre, or school in India.",
    canonical: `${BASE_URL}/ngoregistration`,
    ogType: "website"
  },
  privacyPolicy: {
    title: "Privacy Policy | Sama Digital Foundation",
    description:
      "Review the official data privacy policy, transparency guidelines, and security practices of Sama Digital Foundation.",
    canonical: `${BASE_URL}/privacy-policy`,
    ogType: "website"
  },
  aboutInitiative: {
    title: "About Our Initiative | Sama Digital Foundation",
    description:
      "Discover Sama's mission to bridge the digital divide in India through verified hardware refurbishment and education empowerment.",
    canonical: `${BASE_URL}/about-initiative`,
    ogType: "website"
  }
};
