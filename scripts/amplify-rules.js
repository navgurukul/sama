/**
 * Prints the AWS Amplify "Rewrites and redirects" rules for thesama.in.
 *
 *   node scripts/amplify-rules.js > amplify-rules.json
 *
 * Paste the output into Amplify console > Hosting > Rewrites and redirects >
 * Manage redirects (JSON editor). Amplify applies rules top to bottom, so the
 * order matters:
 *   1. 301 redirects for retired or merged URLs (permanent, so Google moves
 *      their ranking to the new page).
 *   2. 200 rewrites that serve each public route its own pre-rendered page
 *      (written by generate-seo-pages.js), so crawlers and link previews see
 *      that page's title, description and canonical instead of the home page's.
 *   3. The single-page-app fallback: every other path gets index.html.
 *
 * Routes and redirects come from generate-seo-pages.js, so re-run this after
 * adding a page there and update the console if the output changed.
 */

const { routes, redirects, BASE_URL } = require("./generate-seo-pages");

// Paths with these extensions are real files and must never fall back to index.html.
const FILE_EXTENSIONS = "css|gif|ico|jpg|jpeg|js|png|txt|svg|woff|woff2|ttf|map|json|webp|xml|pdf|mp4|html";

const toPath = (url) => url.replace(BASE_URL, "") || "/";

// Both "/x" and "/x/" so neither form escapes the rule.
const variants = (path) => [path, `${path}/`];

const redirected = new Set(redirects.map((r) => r.from));

const rules = [
  ...redirects.flatMap((r) =>
    variants(r.from).map((source) => ({ source, target: toPath(r.to), status: "301", condition: null }))
  ),
  ...routes
    .filter((r) => r.path !== "/" && !redirected.has(r.path))
    .flatMap((r) =>
      variants(r.path).map((source) => ({
        source,
        target: `${r.path}/index.html`,
        status: "200",
        condition: null,
      }))
    ),
  {
    source: "/sama-quarterly/index.html",
    target: "/sama-quarterly",
    status: "301",
    condition: null,
  },
  {
    source: "/sama-quarterly",
    target: "/sama-quarterly/index.html",
    status: "200",
    condition: null,
  },
  {
    source: "/sama-quarterly/",
    target: "/sama-quarterly/index.html",
    status: "200",
    condition: null,
  },
  {
    source: `</^[^.]+$|\\.(?!(${FILE_EXTENSIONS})$)([^.]+$)/>`,
    target: "/index.html",
    status: "200",
    condition: null,
  },
];

process.stdout.write(`${JSON.stringify(rules, null, 2)}\n`);
