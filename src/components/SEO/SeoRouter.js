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
};

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
    return <SEO {...config} />;
  }

  // 4. Any unmapped or internal route (/corporate, /admin, /pickup, /login, or 404s) gets strict noindex
  return (
    <SEO
      title="Sama Digital Foundation"
      description="Sama Digital Foundation operations and management portal."
      noindex={true}
    />
  );
};

export default SeoRouter;
