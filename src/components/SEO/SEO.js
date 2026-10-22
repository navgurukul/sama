import { useEffect } from "react";
import PropTypes from "prop-types";
import { defaultSEO, BASE_URL } from "./seoConfig";

/**
 * Enterprise SEO & Head Manager for Sama Platform
 * - Dynamic route title, description & Open Graph injection
 * - Safe canonical generation without URL parameters/hashes
 * - Noindex support for private, login, and 404 pages
 * - Complete unmount cleanup preventing meta leaks across navigations
 * - Multi-schema @graph JSON-LD support
 */
const SEO = ({
  title,
  description,
  canonical,
  ogType,
  ogImage,
  ogImageAlt,
  schema,
  noindex = false,
}) => {
  useEffect(() => {
    // 1. Set Page Title
    const finalTitle = title || defaultSEO.title;
    document.title = finalTitle;

    // 2. Compute Clean Canonical URL (strips query strings & hashes, normalizes trailing slash)
    const cleanPath = (window.location.pathname || "").replace(/\/+$/, "") || "";
    const finalUrl = canonical || `${BASE_URL}${cleanPath}`;

    // Helper to safely set or create meta tag
    const setMetaTag = (attributeName, attributeValue, contentValue) => {
      if (contentValue === undefined || contentValue === null) return;
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", contentValue);
    };

    // 3. Search Engine Indexing Directives
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.setAttribute("name", "robots");
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute("content", "noindex, nofollow");
    } else {
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.setAttribute("name", "robots");
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute(
        "content",
        "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      );
    }

    // 4. Standard Description
    const finalDescription = description || defaultSEO.description;
    setMetaTag("name", "description", finalDescription);

    // 5. Open Graph Tags (WhatsApp, LinkedIn, Facebook)
    const finalImage = ogImage || defaultSEO.ogImage;
    const finalImageAlt = ogImageAlt || defaultSEO.ogImageAlt;
    setMetaTag("property", "og:title", finalTitle);
    setMetaTag("property", "og:description", finalDescription);
    setMetaTag("property", "og:type", ogType || defaultSEO.ogType);
    setMetaTag("property", "og:url", finalUrl);
    setMetaTag("property", "og:site_name", "Sama Digital Foundation");
    setMetaTag("property", "og:locale", "en_IN");
    setMetaTag("property", "og:image", finalImage);
    setMetaTag("property", "og:image:alt", finalImageAlt);
    setMetaTag("property", "og:image:width", "1200");
    setMetaTag("property", "og:image:height", "630");

    // 6. Twitter Card Tags (1200x630 banner uses summary_large_image)
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", finalTitle);
    setMetaTag("name", "twitter:description", finalDescription);
    setMetaTag("name", "twitter:image", finalImage);
    setMetaTag("name", "twitter:image:alt", finalImageAlt);

    // 7. Canonical Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", finalUrl);

    // 8. JSON-LD Structured Data
    const schemaScriptId = "sama-dynamic-jsonld";
    let scriptTag = document.getElementById(schemaScriptId);
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = schemaScriptId;
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      // If array of schemas is passed, wrap in @graph
      const formattedSchema = Array.isArray(schema)
        ? { "@context": "https://schema.org", "@graph": schema }
        : schema;
      scriptTag.textContent = JSON.stringify(formattedSchema);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    // 9. Cleanup injected JSON-LD when component unmounts or route updates
    return () => {
      const lingeringScript = document.getElementById(schemaScriptId);
      if (lingeringScript) {
        lingeringScript.remove();
      }
    };
  }, [title, description, canonical, ogType, ogImage, ogImageAlt, schema, noindex]);

  return null;
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  canonical: PropTypes.string,
  ogType: PropTypes.string,
  ogImage: PropTypes.string,
  ogImageAlt: PropTypes.string,
  schema: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  noindex: PropTypes.bool,
};

export default SEO;
