import React from "react";
import { useLocation } from "react-router-dom";
import SEO from "./SEO";
import { seoRoutes } from "./seoConfig";

/**
 * Route-aware SEO Router
 * Mounted once inside <Router> at the App root.
 * - Handles case-insensitivity (/Donate -> /donate), trailing slashes (/donate/ -> /donate),
 *   query strings, and sub-paths (e.g., /ngoregistration/:donorId).
 * - Known public routes automatically receive their custom metadata.
 * - Any unmapped/private route (admin dashboards, portals, 404s) automatically receives noindex.
 */
const routeMap = {
  "/": seoRoutes.home,
  "/about": seoRoutes.about,
  "/our-approach": seoRoutes.ourApproach,
  "/donate": seoRoutes.donate,
  "/ngoregistration": seoRoutes.ngoRegistration,
  "/privacy-policy": seoRoutes.privacyPolicy,
  "/about-initiative": seoRoutes.aboutInitiative,
  "/ngo-information": seoRoutes.ngoInformation,
  "/statutory-disclosures": seoRoutes.ngoInformation,
  "/communitypartners": seoRoutes.communityPartners,
  "/our-government": seoRoutes.ourGoverment,
  "/ourteam": seoRoutes.ourTeam,
  "/team": seoRoutes.ourTeam,
  "/sama-saathi": seoRoutes.samaSaathi,
  "/labs": seoRoutes.labs,
  "/giving": seoRoutes.giving,
  "/initiatives": seoRoutes.initiatives,
  "/first-laptop": seoRoutes.firstLaptop,
  "/bfg": seoRoutes.bfg,
  "/build-for-good": seoRoutes.bfg,
  "/communications": seoRoutes.communications,
  "/comms": seoRoutes.communications,
  "/contact": seoRoutes.contact,
  "/blog/beyond-connectivity": seoRoutes.blogBeyondConnectivity,
  "/blog/from-e-waste-to-new-beginnings": seoRoutes.blogEWaste,
  "/blog/rethinking-digital-inclusion": seoRoutes.blogRethinkingInclusion,
};

// Internal admin / operations paths that must not appear in Google search
const privatePrefixes = [
  "/login",
  "/dashboard",
  "/ops",
  "/corporate",
  "/pickup",
  "/corpretedb",
  "/donorcsr",
  "/donormanager",
  "/admin",
  "/user-details",
  "/data-assignment",
  "/beneficiarydata",
  "/documentupload",
  "/laptopinventory",
  "/laptop-tagging",
  "/laptop-stage",
  "/yearly-reporting",
  "/yearly-report",
  "/signup",
  "/registration",
];

const SeoRouter = () => {
  const { pathname } = useLocation();

  // 1. Normalize pathname: lowercase and remove trailing slash (except root)
  const normalizedPath =
    pathname.length > 1
      ? pathname.toLowerCase().replace(/\/+$/, "")
      : pathname.toLowerCase();

  // 2. Direct match lookup for exact public routes
  const config = routeMap[normalizedPath];

  if (config) {
    return <SEO {...config} noindex={false} />;
  }

  // 3. Check if path is an internal/private operations portal route
  const isPrivate = privatePrefixes.some((prefix) => normalizedPath.startsWith(prefix));
  if (isPrivate) {
    return (
      <SEO
        title="Sama Digital Foundation | Portal"
        description="Sama Digital Foundation operations and management portal."
        noindex={true}
      />
    );
  }

  // 4. Default for any other public route: keep indexable, clean title
  return (
    <SEO
      title="Sama Digital Foundation | E-Waste & Laptop Donation"
      description="Sama repurposes corporate retired laptops and e-waste to power digital education for underserved girls and youth across India."
      noindex={false}
    />
  );
};

export default SeoRouter;
