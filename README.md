# Inside Job — WordPress frontend

The React frontend uses the hosted WordPress backend at `https://host951157.xce.pl`. The public domains `michalknychaus.com` and `ulalucinska.com` are served by Render from this repository’s `main` branch. GitHub Pages is a legacy deployment and is not used for the production cutover.

## Test the frontend locally

Use Node.js 22.12+ (Node 24 recommended).

```sh
npm ci
cp .env.example .env
npm run dev
```

Set this public configuration in `.env`:

```dotenv
VITE_WP_API_URL=https://host951157.xce.pl/wp-json/wp/v2
BASE_URL=https://michalknychaus.com
```

Open **http://localhost:5178**. WordPress runs on Hostido; no local Docker or database is needed. Changes made in WordPress appear after a refresh in every client using the new backend.

## Content model

- Standard Posts hold projects, calendar events and articles. Only published Posts in the `projects` category appear in Selected Projects.
- Published Posts in `calendar` appear in Current according to their ACF event dates. A Post may belong to both categories.
- Standard Tags provide the bracketed labels, including GROUP EXHIBITION. No custom taxonomy is used.
- Standard Pages hold Home, Bio, Contact, Projects and Current (slug `calendar`), plus any additional public pages.
- Text, images, galleries, related links and YouTube/Vimeo embeds use core blocks. Bio uses core Details blocks, rendered as the existing accordion.
- ACF Free provides venue, subtitle, partial event dates, optional portfolio PDF and image brightness. Definitions are versioned in [insidejob-content.php](wordpress/insidejob-content/insidejob-content.php).
- Hostido provides automatic hosting backups. Backup Migration 2.1.7 is also installed for manual, combined database-and-files ZIP exports; archives use the plugin’s protected directory and are downloaded through the authenticated admin session.

The client reads native `/wp-json/wp/v2/` content routes and the public `/wp-json/` index for Site Title, Tagline and Site Icon. The index request selects only those public fields and sends no credentials. The small content plugin adds the `event_end` order option to the standard Posts collection using WordPress's meta query sorting. It registers no custom API route. Route loaders manage remote content; gallery state stays local to its component. Responsive rendering uses a shared media-query subscription at Bootstrap’s 768px breakpoint; navigation expands at 992px. Fixed header/footer spacing is observed with `ResizeObserver`, so resizing updates the layout without a reload.

## Migration and operations

See [the runbook](wordpress/README.md) for backups, resumable import, verification and deployment boundaries. Migration source data, database dumps, configuration secrets and credentials must never be committed. The importer updates only records bearing its migration identity; do not rerun it after owners begin editing without a new backup and a content review.

```sh
npm test
npm run lint
npm run sitemap
npm run build
```

The public WordPress endpoint and primary frontend origin have production defaults in `scripts/config.mjs`. Render can build without a local `.env` or new service variables. `VITE_WP_API_URL` and `BASE_URL` override those defaults; malformed overrides fail validation. Vite explicitly embeds only the resolved public WordPress URL. No administrator credentials belong in frontend configuration.

Push the reviewed source to `main` for Render’s connected deployment. The validation workflow runs install, tests, lint, sitemap generation and build; its monthly schedule commits sitemap changes so Render republishes them. It does not publish GitHub Pages or change domain DNS. A second historical repository, `insidejob-client_ula`, has not changed since January 2025; both current public domains serve this repository’s Render build.

The intentional mixed canonical domains and existing archive order are preserved, including the legacy odd-day project domain spelling. Calendar dates retain the visitor-local midnight behavior. These rules are described in the hosting runbook.


## WordPress metadata and discussion

Site identity comes from native General Settings rather than an ACF duplicate. Document titles, descriptions, Open Graph/Twitter tags and favicon are rendered by `SiteMetadata`; native Post/Page titles, excerpts and featured images supply per-record metadata. Pages have core excerpt support enabled by the content plugin. The homepage prefers Tagline for its description; inner pages prefer the native excerpt and fall back to Tagline. WordPress generates an excerpt from content when no manual excerpt is supplied. Existing canonical-domain rules are retained. These tags are rendered in the browser by the existing SPA; crawlers that do not execute JavaScript require a separate prerendering/SSR change to receive route-specific metadata in the initial HTML.

Discussion defaults disable comments, incoming pings and outgoing pingbacks. Existing Posts, Pages and attachments have both discussion statuses closed. Status updates preserve publication/modified timestamps. The content plugin registers no custom settings endpoint or comment subsystem.
