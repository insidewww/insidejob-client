# Hosting runbook

## Current production

- Public sites: `https://michalknychaus.com` and `https://ulalucinska.com`, both served by the Render static site `insidejob-client.onrender.com`.
- Production source: `insidewww/insidejob-client`, branch `main`. Release commit: `f338af3217acfc53fba954f5bc85ac85c8e7485a`.
- WordPress: `/home/host951157/insidejob-wordpress`, with its own database and uploads.
- WordPress admin: `https://host951157.xce.pl/wp-admin/`; native REST: `https://host951157.xce.pl/wp-json/wp/v2`.
- `INSIDEJOB_FRONTEND_URL=https://michalknychaus.com` points published View links at production. Drafts remain private; REST API Only disables public theme pages and theme previews.
- Labguy’s application directory, separate legacy database, PM2 `www` process, old logs, reboot/health-check jobs and API/uploads proxy are removed. Port 3000 is closed; the WordPress cron job remains.
- The legacy database login is revoked by rotating its password. Its empty hosting-managed account remains because the SSH database account cannot execute `DROP USER`; complete account deletion requires Hostido database administration. Private recovery information is outside Git.

The hosting installer’s inactive WordPress copy was inside the removed Labguy directory. The working WordPress installation is independent and has no symlinks into Labguy. Both public domains now use native WordPress content; `/api/projects` returns 404.

## Backups before migration

Private off-server backups are in:

`/Users/jakubkanna/Documents/Backups/insidejob/2026-10-22-local-migration/`

They include the original Labguy SQL dump and application/uploads archive, plus the fresh WordPress database/files before import. `manifest.json` records sizes and SHA-256 hashes. These files include sensitive configuration and must remain private. The Labguy SQL backup was restored into a temporary isolated MySQL database before exporting content; that temporary container was removed.

## Import into a fresh WordPress

The following commands are an operator reference. They are not needed by site owners and should not be repeated on an edited site.

1. Make and verify database and file backups.
2. Confirm the WordPress database is different from Labguy's.
3. Install ACF Free from its [official download](https://www.advancedcustomfields.com/resources/installation/) and `insidejob-content/`.
4. Put the content-only source JSON and `import.php` outside the web root, readable only by the account owner.
5. Activate ACF and Inside Job Content.
6. Import all media in resumable batches, then content. Original files are copied from the legacy uploads when available; the importer downloads from the original Cloudinary URL if needed. Every result is a WordPress attachment with generated sizes. Existing originals are read without alteration.

```sh
wp eval-file /PRIVATE/import.php /PRIVATE/source.json media 0 20 --path=/home/host951157/insidejob-wordpress
# Repeat with offsets 20, 40, … until all 469 images are imported.
wp eval-file /PRIVATE/import.php /PRIVATE/source.json content --path=/home/host951157/insidejob-wordpress
```

The importer records each image's legacy etag and each content record's migration identity. A successful media rerun skips existing attachments. The content phase refuses to run until all source images exist.

Expected migrated content: 469 attachments; 45 event/project Posts; one article Post; 11 Tags; five public Pages; 30 Posts in Projects and 45 in Calendar. The 15 old `published=false` events were already public in the old calendar and have no project text/media. They become published Calendar-only Posts. The original published project Posts belong to both categories.

Event date fields use human month numbers (January = 1); the client adapts these to its existing date helpers. Archive sorting uses a derived numeric post-meta key and native WP_Query sorting. The key retains the old API's month offset; the original order supplies stable ties. This is deliberate behavior preservation. Post timestamps are retained for the existing canonical-domain logic.

## Verification

- Compare all legacy project slugs, dates, text, links, tags and selected-project order with the snapshot.
- Verify all attachments have files, descriptions, alt text, dimensions and generated sizes; content URLs must use WordPress uploads.
- Check published/draft visibility, Projects/Calendar membership, partial/no-end dates, articles and new Pages.
- Check native block validity and save/reload a temporary project, including Gallery, rich text, an Embed and ACF fields.
- Check desktop/mobile layouts, Bio accordion, gallery keyboard/focus/scroll behavior and all Back button states.
- Hostido provides automatic hosting backups. Backup Migration also provides manual combined database/files ZIP exports. Keep a verified snapshot before imports or deployment.
- After cutover, verify native WordPress endpoints and both public sites work while legacy `/api/projects` returns 404.

## Production deployment and retirement — 22 October 2026

The release was pushed to `main`, passed [GitHub validation](https://github.com/insidewww/insidejob-client/actions/runs/39858093765), and deployed through Render. Both public domains serve the new asset `/assets/index-Cng2ydP6.js`, containing the native WordPress endpoint and no Labguy API or Cloudinary runtime dependency. The historical `insidejob-client_ula` repository is not serving a separate current deployment.

Fresh off-server backups were verified before retirement at `/Users/jakubkanna/Documents/Backups/insidejob/2026-10-22-production-cutover/`: both databases, Labguy source/uploads/configuration, PM2 recovery files/logs, cron snapshots and WordPress configuration. Legacy project data was unchanged since migration. Original and final source references, checksum manifests, live browser reports and the retirement report are retained privately there. Temporary legacy migration, repair and server-side retirement copies were removed after verification; the WordPress dashboard backup remains available.

Both domains passed production browser checks for Home, Projects, tags, gallery arrows/captions/focus, Bio, Contact, calendar, mobile overflow, Back button, missing pages and API failure recovery before removal. Live resizing across 767/768px and 991/992px passes without reload or lost gallery/Bio state. After removal, direct project links, both sitemaps, WordPress login and native APIs still respond correctly. All 469 image hashes and 51 published content records/timestamps are unchanged; discussion remains disabled.

## Deployment configuration

Render builds from the connected `main` branch. The public defaults in `scripts/config.mjs` allow a clean checkout to build without `.env` files or new dashboard variables. Optional `VITE_WP_API_URL` and `BASE_URL` overrides are validated; the frontend embeds only the resolved public endpoint. The legacy GitHub Pages workflow was replaced with validation and monthly sitemap refresh; it no longer publishes to Pages or changes CNAME/DNS.

For future releases:

1. Take and verify database/files backups and review any newer content edits.
2. Run tests, lint, sitemap generation and build. Validate a clean checkout when build configuration changes.
3. Push the reviewed source to `main`, then verify GitHub checks, the live asset and public routes on both domains. Render’s existing SPA rewrite supports direct page/project URLs.
4. Keep the backend excluded from indexing (`blog_public=0`) and retain the chosen canonical-domain behavior unless a separate SEO change is approved.
5. Keep `INSIDEJOB_FRONTEND_URL` at the production origin. Local frontend development uses the hosted WordPress backend without changing that constant.

Documentation-only completion commits may use Render’s [supported skip phrase](https://render.com/docs/deploys#skipping-an-auto-deploy), `[skip render]`, to preserve the tested deployment. No credentials, owner instructions, screenshots or PDFs belong in this repository.

## Review results — 22 October 2026

- Nine automated tests pass, covering REST pagination/failures, event dates and deployment configuration. Lint and the production build pass; existing Bootstrap/Sass deprecation warnings remain.
- Production-build browser checks pass on desktop and 390px mobile: all public sections, 30 selected projects, tags, Bio accordion, transparent gallery controls, keyboard navigation, focus return, matching Back button edges, 404 handling and recovery after a simulated API outage.
- Live resizing was verified in both directions across 767/768px and 991/992px without reloading. Project previews and column scrolling update, open galleries and Bio sections retain their state, and mobile navigation releases its scroll/focus lock on desktop.
- Native WordPress validation: 51 published records, 979 blocks, no invalid blocks. The empty Calendar-only entry was checked without changing its content.
- All 469 image originals match the legacy SHA-256 hashes; 418 captions and all image dimensions are present. Migrated content has no Cloudinary image references.
- WordPress core and ACF checksum verification, plugin PHP syntax and WP-Cron checks pass. The active plugin matches the repository copy.
- The sitemap contains 36 unique published URLs. The SPA fallback matches the built index. The legacy API and existing public frontend return HTTP 200.
- Credentials are absent from repository source and build output; `.env` remains ignored. Owner instructions, screenshots, credentials and the PDF remain outside the repository.

This section records the earlier review before production deployment. The completed production state and release evidence are documented above.


## Metadata and discussion update — 22 October 2026

The public REST index supplies `name`, `description` and `site_icon_url` with `_fields`; the authenticated `/wp/v2/settings` endpoint is not used by the client. The plugin enables WordPress Page excerpt support and removes the ACF duplicate of Site Title. Old stored field data is retained, and the importer initializes native `blogname` directly.

A fresh database/plugin backup was verified at `/Users/jakubkanna/Documents/Backups/insidejob/2026-10-22-metadata-guide/` before changing settings. Native options `default_comment_status` and `default_ping_status` are `closed`, and `default_pingback_flag` is `0`. Existing Post/Page/attachment statuses were closed directly without changing timestamps; no comments were deleted. Inside Job Content is version 1.0.1.

The private owner guide now documents exact editor paths for the block inserter, Patterns category/preview, Post settings, Categories checkboxes, Tags, Excerpt and General/Discussion settings, with actual screenshots. Owner documentation and credentials remain outside the repository.


Metadata verification passed on all public sections, including simulated changes to Site Title, Tagline, Site Icon, page title and manual excerpt. Head tags remain unique during client-side navigation. Native settings requests omit credentials. Desktop/mobile resizing checks also pass after these changes. The existing frontend remains an SPA with browser-rendered metadata; initial HTML for non-JavaScript crawlers needs prerendering/SSR under a separate deployment change.

The private guide was regenerated and visually checked (15 pages, 12 screenshots). Its pattern insertion and category/tag/excerpt navigation was tested on an owned private draft; that draft was removed afterward. Published content remains 46 Posts and five Pages, with no open discussion records.


## Manual backup plugin — 22 October 2026

Backup Migration (`backup-backup`) 2.1.7 is active and its WordPress.org checksums pass. The existing Dashboard Menu Visibility settings expose its native admin menu; the obsolete WPvivid menu entry was removed. No plugin vendor code was modified.

Saved settings select the entire database plus plugins, uploads, themes, other wp-content files and WordPress core. Optional file-exclusion filters are disabled. The plugin always excludes its own files/archives and the hosting-specific `wp-config.php`; restoration keeps the destination installation’s configuration. Set/check `INSIDEJOB_FRONTEND_URL` after recovery on another installation, as for production cutover. The current configuration is retained separately in the private verification backup.

The plugin uses its native protected directory under wp-content. Public direct-link sharing and direct static downloading are disabled; downloads stream through PHP and require an administrator session. Plugin schedules, remote keep-alive and email notifications are disabled. Hostido’s automatic backups continue to cover the hosting account.

A fresh SQL export was downloaded and verified before installation. The private operator snapshot and verification files are at `/Users/jakubkanna/Documents/Backups/insidejob/2026-10-22-backup-plugin/`. The owner instructions and actual dashboard screenshots are in the private guide outside Git. The backup scope is this WordPress installation; the separate React repository and Labguy require their existing backups.

The generated archive is 430,006,325 bytes (411 MB in the plugin UI), with 7,289 ZIP entries and all 13 database tables. Server-side ZIP CRC validation passes. All 469 imported original-image hashes and the checked core/content-plugin/htaccess hashes match the live installation. Anonymous downloads are rejected both through the plugin endpoint (HTTP 423) and the direct archive URL (HTTP 404). WordPress still exposes 46 published Posts and five Pages; the legacy API still returns its 45 projects and the existing frontend returns HTTP 200. Discussion remains closed.

The combined archive was downloaded completely using the native administrator dashboard. Its local SHA-256 matches the server archive; local ZIP integrity, all 469 original-image hashes and all 13 table schemas pass. The private owner PDF was regenerated and visually checked (17 pages, 15 screenshots); the repository contains only technical documentation.


## 4K images — 23 October 2026

Inside Job Content 1.0.2 sets the native `big_image_size_threshold` filter to 4096px, preserving UHD 3840×2160 and DCI 4096×2160 uploads as full-size images. Larger uploads still retain their original files alongside WordPress’s scaled display copies. The core Image block render filter uses `wp_get_original_image_url()` and `WP_HTML_Tag_Processor` to expose `data-full-url`; the frontend gallery reads that URL while normal previews retain responsive `srcset` behavior. This also resolves original files for images scaled by the previous 2560px threshold, without rewriting posts or regenerating media.

The hosting limit is 512 MB per file, confirmed in the native Media upload screen. A fresh SQL/plugin backup was downloaded and verified before the change at `/Users/jakubkanna/Documents/Backups/insidejob/2026-10-23-4k-images/`. Actual WordPress uploads and the production-build browser gallery were checked at UHD and DCI 4K, including an older scaled attachment and a 1024px inline preview. Original-file hashes are unchanged. Temporary verification attachments were removed afterward. Ten tests, lint and the production build pass.
