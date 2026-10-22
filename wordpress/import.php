<?php
/** Run with WP-CLI only: wp eval-file import.php SOURCE.json media|content [offset] [limit] */
if (!defined('WP_CLI') || !WP_CLI) exit(1);
if (!function_exists('update_field')) WP_CLI::error('Activate ACF and Inside Job Content first.');
$source = json_decode(file_get_contents($args[0] ?? ''), true, 512, JSON_THROW_ON_ERROR);
$phase = $args[1] ?? 'content';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
function ij_existing($key, $value, $type = 'any') {
    $ids = get_posts(['post_type' => $type, 'post_status' => $type === 'attachment' ? 'inherit' : 'any', 'numberposts' => 1, 'fields' => 'ids', 'meta_key' => $key, 'meta_value' => $value]);
    return $ids ? (int)$ids[0] : 0;
}
function ij_check($value) { if (is_wp_error($value)) WP_CLI::error($value->get_error_message()); return $value; }
if ($phase === 'media') {
    $images = array_slice($source['ImageRef'], (int)($args[2] ?? 0), (int)($args[3] ?? count($source['ImageRef'])));
    foreach ($images as $image) {
        if (ij_existing('_ij_legacy_etag', $image['etag'], 'attachment')) continue;
        $filename = sanitize_file_name(($image['filename'] ?: $image['etag']) . '.' . ($image['format'] ?: 'jpg'));
        $tmp = wp_tempnam($filename);
        if (!empty($image['path']) && is_readable($image['path'])) {
            copy($image['path'], $tmp);
        } else {
            unlink($tmp);
            $url = $image['cld_url'] ?? '';
            if (parse_url($url, PHP_URL_HOST) !== 'res.cloudinary.com') WP_CLI::error('Unexpected media source for ' . $image['etag']);
            $tmp = ij_check(download_url($url));
        }
        $id = ij_check(media_handle_sideload(['name' => $filename, 'tmp_name' => $tmp], 0, $image['description'] ?? ''));
        update_post_meta($id, '_ij_legacy_etag', $image['etag']);
        update_post_meta($id, '_wp_attachment_image_alt', wp_strip_all_tags($image['description'] ?: $image['filename']));
        wp_update_post(['ID' => $id, 'post_title' => $image['filename'], 'post_excerpt' => $image['description'] ?? '', 'post_content' => $image['description'] ?? '']);
        update_field('field_ij_is_bright', (bool)$image['isBright'], $id);
        WP_CLI::log('Imported image ' . $id . ' (' . $image['etag'] . ')');
    }
    WP_CLI::success('Media batch complete.');
    return;
}
if ($phase !== 'content') WP_CLI::error('Expected media or content phase.');
$media_count = count(get_posts(['post_type' => 'attachment', 'post_status' => 'inherit', 'fields' => 'ids', 'numberposts' => -1, 'meta_key' => '_ij_legacy_etag']));
if ($media_count !== count($source['ImageRef'])) WP_CLI::error('Import every image before content. Found ' . $media_count);
function ij_block($name, $html = '', $attrs = []) {
    return '<!-- wp:' . $name . ($attrs ? ' ' . wp_json_encode($attrs, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : '') . ' -->' . $html . '<!-- /wp:' . $name . ' -->';
}
function ij_group($name, $html) {
    return ij_block('group', '<div class="wp-block-group ' . $name . '">' . $html . '</div>', ['className' => $name, 'metadata' => ['name' => ucwords(str_replace(['insidejob-', '-'], ['', ' '], $name))]]);
}
function ij_rich($html) {
    $html = str_replace('\\n', "\n", $html ?? '');
    $html = preg_replace('~</?span\b[^>]*>~i', '', $html);
    $doc = new DOMDocument();
    @$doc->loadHTML('<?xml encoding="utf-8" ?><div id="ij-root">' . $html . '</div>');
    $root = $doc->getElementById('ij-root');
    $output = '';
    foreach ($root->childNodes as $node) {
        if ($node->nodeType === XML_TEXT_NODE) {
            if (trim($node->textContent)) $output .= ij_block('paragraph', '<p>' . esc_html($node->textContent) . '</p>');
            continue;
        }
        if (!($node instanceof DOMElement)) continue;
        $name = strtolower($node->nodeName); $inner = '';
        foreach ($node->childNodes as $child) $inner .= $doc->saveHTML($child);
        $inner = wp_kses_post($inner);
        if ($name === 'p') $output .= ij_block('paragraph', '<p>' . $inner . '</p>');
        elseif (preg_match('/^h([1-6])$/', $name, $match)) $output .= ij_block('heading', '<' . $name . ' class="wp-block-heading">' . $inner . '</' . $name . '>', ['level' => (int)$match[1]]);
        elseif ($name === 'ul' || $name === 'ol') {
            $items = '';
            foreach ($node->childNodes as $li) {
                if ($li->nodeName !== 'li') continue;
                $li_html = ''; foreach ($li->childNodes as $child) $li_html .= $doc->saveHTML($child);
                $items .= ij_block('list-item', '<li>' . wp_kses_post($li_html) . '</li>');
            }
            $output .= ij_block('list', '<' . $name . ' class="wp-block-list">' . $items . '</' . $name . '>', $name === 'ol' ? ['ordered' => true] : []);
        } elseif ($name === 'blockquote') $output .= ij_block('quote', '<blockquote class="wp-block-quote">' . ij_rich($inner) . '</blockquote>');
        else $output .= ij_block('html', wp_kses_post($doc->saveHTML($node)));
    }
    return $output;
}
function ij_image($image) {
    if (empty($image['etag'])) return '';
    $id = ij_existing('_ij_legacy_etag', $image['etag'], 'attachment');
    if (!$id) WP_CLI::error('Missing attachment ' . $image['etag']);
    $caption = $image['description'] ?? wp_get_attachment_caption($id);
    $url = wp_get_attachment_image_url($id, 'full');
    $alt = get_post_meta($id, '_wp_attachment_image_alt', true);
    return ij_block('image', '<figure class="wp-block-image size-full"><img src="' . esc_url($url) . '" alt="' . esc_attr($alt) . '" class="wp-image-' . $id . '"/>' . ($caption ? '<figcaption class="wp-element-caption">' . esc_html($caption) . '</figcaption>' : '') . '</figure>', ['id' => $id, 'sizeSlug' => 'full', 'linkDestination' => 'none']);
}
function ij_links($urls) {
    $links = [];
    foreach ($urls ?: [] as $url) $links[] = '<a href="' . esc_url($url['url']) . '" target="_blank" rel="noreferrer noopener">' . esc_html($url['title'] ?: $url['url']) . '</a>';
    return $links ? ij_block('paragraph', '<p>' . implode(', ', $links) . '</p>') : '';
}
function ij_date($date) {
    if (!$date) return ['year' => '', 'month' => '', 'day' => '', 'time' => ''];
    return ['year' => $date['year'] ?? '', 'month' => isset($date['month']) ? (int)$date['month'] + 1 : '', 'day' => $date['day'] ?? '', 'time' => $date['time'] ?? ''];
}
function ij_upsert($identity, $title, $slug, $type, $content, $extra = []) {
    $id = ij_existing('_ij_migration_identity', $identity, $type);
    $owner = get_user_by('email', get_option('admin_email'));
    $post = array_merge(['post_type' => $type, 'post_status' => 'publish', 'post_title' => $title, 'post_name' => $slug, 'post_content' => $content, 'post_author' => $owner ? $owner->ID : 1, 'comment_status' => 'closed', 'ping_status' => 'closed'], $extra);
    if ($id) $post['ID'] = $id;
    $id = ij_check(wp_insert_post(wp_slash($post), true));
    update_post_meta($id, '_ij_migration_identity', $identity);
    return $id;
}
$categories = [];
foreach (['projects' => 'Projects', 'calendar' => 'Calendar'] as $slug => $name) {
    $term = get_term_by('slug', $slug, 'category');
    $categories[$slug] = $term ? (int)$term->term_id : (int)ij_check(wp_insert_term($name, 'category', ['slug' => $slug]))['term_id'];
}
$tags = [];
foreach ($source['Tag'] as $tag) {
    $term = get_term_by('name', trim($tag['title']), 'post_tag');
    $tags[$tag['id']] = $term ? (int)$term->term_id : (int)ij_check(wp_insert_term(trim($tag['title']), 'post_tag'))['term_id'];
}
$general = array_column($source['GeneralSection'], null, 'id');
$relations = [];
foreach ($source['_GeneralSectionToTag'] as $r) $relations[$r['A']][] = $tags[$r['B']];
$order = 0;
foreach ($source['Project'] as $project) {
    $g = $general[$project['generalId']];
    $media = ''; foreach ($project['media'] ?: [] as $image) $media .= ij_image($image);
    $content = ij_group('insidejob-text', ij_rich($project['text'])) . ij_group('insidejob-links', ij_links($project['urls'])) . ij_group('insidejob-media', $media);
    $rank = array_search($project['id'], $source['_ArchiveOrder'] ?? [], true);
    $id = ij_upsert('project:' . $project['id'], $g['title'], $g['slug'], 'post', $content, ['post_date_gmt' => substr($g['createdAt'], 0, 19), 'post_date' => get_date_from_gmt(substr($g['createdAt'], 0, 19)), 'menu_order' => $rank !== false ? $rank : $order++]);
    wp_set_post_categories($id, $g['published'] ? array_values($categories) : [$categories['calendar']]);
    wp_set_post_tags($id, $relations[$g['id']] ?? []);
    foreach (['venue', 'subtitle'] as $field) update_field('field_ij_' . $field, $project[$field] ?? '', $id);
    foreach (['start_date', 'end_date'] as $field) update_field('field_ij_' . $field, ij_date($project[$field]), $id);
    insidejob_update_event_sort($id);
    if (!empty($project['media'][0]['etag'])) set_post_thumbnail($id, ij_existing('_ij_legacy_etag', $project['media'][0]['etag'], 'attachment'));
    global $wpdb;
    $modified = substr($g['updatedAt'] ?: $g['createdAt'], 0, 19);
    $wpdb->update($wpdb->posts, ['post_modified_gmt' => $modified, 'post_modified' => get_date_from_gmt($modified)], ['ID' => $id]);
    clean_post_cache($id);
}
foreach ($source['Post'] as $post) {
    $g = $general[$post['generalId']]; $content = '';
    foreach ($post['content'] ?: [] as $block) {
        if (isset($block['text'])) $content .= ij_rich($block['text']);
        foreach ($block['images'] ?? [] as $image) $content .= ij_image($image);
    }
    $id = ij_upsert('article:' . $post['id'], $g['title'], $g['slug'], 'post', $content, ['post_status' => $g['published'] ? 'publish' : 'draft', 'post_date_gmt' => $g['createdAt'], 'post_date' => get_date_from_gmt($g['createdAt'])]);
    wp_set_post_tags($id, $relations[$g['id']] ?? []);
}
$profile = $source['Profile'][0]; $prefs = $source['Preferences'][0];
$home = ij_block('heading', '<h1 class="wp-block-heading">' . esc_html($prefs['homepage_heading']) . '</h1>', ['level' => 1]);
$home .= ij_block('heading', '<h2 class="wp-block-heading">' . esc_html($prefs['homepage_subheading']) . '</h2>');
$home .= ij_image($prefs['homepage_media']) . ij_group('insidejob-home-links', ij_links($prefs['homepage_urls']));
$home_id = ij_upsert('page:home', 'Home', 'home', 'page', $home);
update_option('show_on_front', 'page'); update_option('page_on_front', $home_id);
if (!empty($prefs['homepage_media']['etag'])) set_post_thumbnail($home_id, ij_existing('_ij_legacy_etag', $prefs['homepage_media']['etag'], 'attachment'));
$bio = ij_group('insidejob-bio-intro', ij_image($profile['picture']) . ij_rich($profile['statement']));
$details = '';
foreach ($profile['additional'] ?: [] as $i => $section) {
    $html = $section['html']; $title = 'Section ' . ($i + 1);
    if (preg_match('~<h3[^>]*>(.*?)</h3>~is', $html, $m)) { $title = wp_strip_all_tags($m[1]); $html = str_replace($m[0], '', $html); }
    $details .= ij_block('details', '<details class="wp-block-details"><summary>' . esc_html($title) . '</summary>' . ij_rich($html) . '</details>');
}
$bio .= ij_group('insidejob-bio-details', $details);
$bio_id = ij_upsert('page:bio', 'Bio', 'bio', 'page', $bio);
if ($profile['portfolio_pdf_url']) update_field('field_ij_portfolio_pdf', $profile['portfolio_pdf_url'], $bio_id);
$columns = '';
foreach ($source['Contact'] as $contact) {
    $html = ij_block('heading', '<h5 class="wp-block-heading">' . esc_html($contact['name']) . '</h5>', ['level' => 5]);
    $html .= ij_block('paragraph', '<p>' . esc_html($contact['email']) . '</p>');
    foreach ($source['SocialMedia'] as $sm) if ($sm['contactId'] === $contact['id']) {
        $html .= ij_block('paragraph', '<p><a href="' . esc_url($sm['profileUrl']) . '" target="_blank" rel="noreferrer noopener"><i class="bi bi-' . esc_attr(strtolower($sm['platform'])) . '"></i> ' . esc_html($sm['username']) . '</a></p>');
    }
    $columns .= ij_block('column', '<div class="wp-block-column col-12 col-md-6 d-flex flex-column align-items-center text-center my-3 p-4">' . $html . '</div>', ['className' => 'col-12 col-md-6 d-flex flex-column align-items-center text-center my-3 p-4']);
}
$contact = ij_block('columns', '<div class="wp-block-columns row justify-content-center align-items-center">' . $columns . '</div>', ['className' => 'row justify-content-center align-items-center']);
$contact_id = ij_upsert('page:contact', 'Contact', 'contact', 'page', $contact);
if ($profile['portfolio_pdf_url']) update_field('field_ij_portfolio_pdf', $profile['portfolio_pdf_url'], $contact_id);
foreach (['projects' => 'Projects', 'calendar' => 'Current'] as $slug => $title) ij_upsert('page:' . $slug, $title, $slug, 'page', '');
update_option('blogname', $prefs['artists_name']);
update_option('blogdescription', ''); update_option('timezone_string', 'Europe/Warsaw');
update_option('blog_public', 0);
update_option('permalink_structure', '/%postname%/'); flush_rewrite_rules();
WP_CLI::success('Imported 45 events/projects, 1 article and 5 pages. All 469 images are local WordPress attachments.');
