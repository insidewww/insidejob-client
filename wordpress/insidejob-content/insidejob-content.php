<?php
/**
 * Plugin Name: Inside Job Content
 * Description: ACF fields, native block patterns and routing for the Inside Job React frontend.
 * Version: 1.0.2
 */
defined('ABSPATH') || exit;

// Preserve UHD/DCI 4K uploads as WordPress's full image size.
add_filter('big_image_size_threshold', static fn() => 4096);

add_action('acf/init', function () {
    $field = static function ($name, $label, $type, $extra = []) {
        return array_merge(['key' => 'field_ij_' . $name, 'name' => $name, 'label' => $label, 'type' => $type], $extra);
    };
    $date = static function ($name, $label) use ($field) {
        $parts = [];
        foreach (['year' => [1000, 9999], 'month' => [1, 12], 'day' => [1, 31]] as $part => $range) {
            $parts[] = $field($name . '_' . $part, ucfirst($part), 'number', [
                'name' => $part, 'min' => $range[0], 'max' => $range[1], 'step' => 1,
                'instructions' => $part === 'month' ? 'January = 1. Leave unknown parts empty.' : '',
                'wrapper' => ['width' => '25'],
            ]);
        }
        $parts[] = $field($name . '_time', 'Time', 'time_picker', ['name' => 'time', 'display_format' => 'H:i', 'return_format' => 'H:i', 'wrapper' => ['width' => '25']]);
        return $field($name, $label, 'group', ['sub_fields' => $parts, 'instructions' => 'Year is required when any part is filled. No end date means ongoing after the start. Times use the visitor’s local timezone, as on the previous website.']);
    };
    acf_add_local_field_group([
        'key' => 'group_ij_event', 'title' => 'Event details', 'show_in_rest' => 1,
        'fields' => [
            $field('venue', 'Venue', 'text'),
            $field('subtitle', 'Subtitle', 'wysiwyg', ['tabs' => 'visual', 'toolbar' => 'basic', 'media_upload' => 0]),
            $date('start_date', 'Start date'), $date('end_date', 'End date'),
        ],
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'post']]],
    ]);
    acf_add_local_field_group([
        'key' => 'group_ij_page', 'title' => 'Optional portfolio', 'show_in_rest' => 1,
        'fields' => [$field('portfolio_pdf', 'Portfolio PDF', 'file', ['mime_types' => 'pdf', 'return_format' => 'url'])],
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'page']]],
    ]);
    acf_add_local_field_group([
        'key' => 'group_ij_image', 'title' => 'Image appearance', 'show_in_rest' => 1,
        'fields' => [$field('is_bright', 'Bright image (dark homepage text)', 'true_false', ['ui' => 1])],
        // Native REST resolves media groups by post type; attachment MIME rules are editor-only.
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'attachment']]],
    ]);
});

foreach (['start_date', 'end_date'] as $name) {
    add_filter('acf/validate_value/name=' . $name, function ($valid, $value) use ($name) {
        if ($valid !== true || !is_array($value)) return $valid;
        $get = static fn($part) => $value['field_ij_' . $name . '_' . $part] ?? $value[$part] ?? '';
        $year = $get('year'); $month = $get('month'); $day = $get('day'); $time = $get('time');
        if (!$year && ($month || $day || $time)) return 'Enter a year, or leave every date field empty.';
        if ($day && !$month) return 'Enter a month when a day is specified.';
        if ($year && $month && $day && !checkdate((int)$month, (int)$day, (int)$year)) return 'Enter a valid calendar date.';
        return $valid;
    }, 10, 2);
}

function insidejob_update_event_sort($id) {
    if (get_post_type($id) !== 'post' || wp_is_post_revision($id)) return;
    $year = (int)get_post_meta($id, 'end_date_year', true);
    $month = (int)get_post_meta($id, 'end_date_month', true);
    $day = (int)get_post_meta($id, 'end_date_day', true);
    // Preserve ProjectController.safeDate's existing ordering, including its month offset.
    // Display/calendar dates use the correct month; this key is solely for archive order.
    $date = DateTimeImmutable::createFromFormat('!Y-n-j', sprintf('%04d-%d-%d', $year ?: 1970, max(1, $month - 1), $day ?: 1), new DateTimeZone('UTC'));
    update_post_meta($id, '_ij_event_end_sort', $year && $date ? $date->getTimestamp() : 0);
}
add_action('acf/save_post', 'insidejob_update_event_sort', 20);
add_action('save_post_post', 'insidejob_update_event_sort', 20);
// REST saves additional ACF fields after save_post; calculate from the final values.
add_action('rest_after_insert_post', function ($post) { insidejob_update_event_sort($post->ID); }, 20);
add_filter('rest_post_collection_params', function ($params) {
    $params['orderby']['enum'][] = 'event_end';
    return $params;
});
add_filter('rest_post_query', function ($args, $request) {
    if ($request->get_param('orderby') === 'event_end') {
        $args['meta_key'] = '_ij_event_end_sort';
        $args['orderby'] = ['meta_value_num' => $args['order'] ?? 'DESC', 'menu_order' => 'ASC', 'ID' => 'ASC'];
    }
    return $args;
}, 10, 2);

function insidejob_frontend_url($post) {
    $base = defined('INSIDEJOB_FRONTEND_URL') ? rtrim(INSIDEJOB_FRONTEND_URL, '/') : '';
    if (!$base) return get_permalink($post);
    if ((int)$post->ID === (int)get_option('page_on_front')) return $base . '/';
    $prefix = $post->post_type === 'post' && has_category('projects', $post) ? '/projects/' : '/';
    return $base . $prefix . $post->post_name;
}
add_filter('post_link', function ($url, $post) {
    return defined('INSIDEJOB_FRONTEND_URL') && INSIDEJOB_FRONTEND_URL && $post->post_status === 'publish' ? insidejob_frontend_url($post) : $url;
}, 10, 2);
add_filter('page_link', function ($url, $id) {
    $post = get_post($id);
    return defined('INSIDEJOB_FRONTEND_URL') && INSIDEJOB_FRONTEND_URL && $post && $post->post_status === 'publish' ? insidejob_frontend_url($post) : $url;
}, 10, 2);
add_filter('preview_post_link', function ($url, $post) {
    // Drafts remain in WordPress's native editor preview; only published links target React.
    return $post->post_status === 'publish' ? insidejob_frontend_url($post) : $url;
}, 10, 2);
add_filter('post_row_actions', function ($actions, $post) {
    if ($post->post_status === 'publish' && isset($actions['view'])) {
        $actions['view'] = '<a href="' . esc_url(insidejob_frontend_url($post)) . '">View on frontend</a>';
    }
    return $actions;
}, 10, 2);
add_filter('page_row_actions', function ($actions, $post) {
    if ($post->post_status === 'publish' && isset($actions['view'])) $actions['view'] = '<a href="' . esc_url(insidejob_frontend_url($post)) . '">View on frontend</a>';
    return $actions;
}, 10, 2);
add_action('admin_bar_menu', function ($bar) {
    if (is_admin() && ($post = get_post()) && $post->post_status === 'publish') $bar->add_node(['id' => 'view', 'title' => 'View on frontend', 'href' => insidejob_frontend_url($post)]);
}, 100);

add_action('init', function () {
    add_post_type_support('page', 'excerpt');
    register_block_pattern_category('insidejob', ['label' => 'Inside Job']);
    register_block_pattern('insidejob/project', [
        'title' => 'Inside Job project', 'categories' => ['insidejob'],
        'description' => 'Text and links in the left column, images/gallery/embeds in the right column. Add the Projects and/or Calendar category as appropriate.',
        'content' => '<!-- wp:group {"metadata":{"name":"Project text"},"className":"insidejob-text"} --><div class="wp-block-group insidejob-text"><!-- wp:paragraph --><p>Project description</p><!-- /wp:paragraph --></div><!-- /wp:group --><!-- wp:group {"metadata":{"name":"Project links"},"className":"insidejob-links"} --><div class="wp-block-group insidejob-links"><!-- wp:paragraph --><p><a href="https://example.com">Related link</a></p><!-- /wp:paragraph --></div><!-- /wp:group --><!-- wp:group {"metadata":{"name":"Project media"},"className":"insidejob-media"} --><div class="wp-block-group insidejob-media"><!-- wp:gallery {"linkTo":"none"} --><figure class="wp-block-gallery has-nested-images columns-default is-cropped"></figure><!-- /wp:gallery --></div><!-- /wp:group -->',
    ]);
});
add_filter('block_editor_settings_all', function ($settings) {
    $settings['disableCustomFontSizes'] = true;
    $settings['fontSizes'] = [];
    return $settings;
});
add_filter('wp_theme_json_data_theme', function ($data) {
    return $data->update_with(['version' => 3, 'settings' => ['typography' => ['customFontSize' => false, 'defaultFontSizes' => false, 'fontSizes' => [], 'fluid' => false]]]);
});
add_filter('render_block_core/image', function ($html, $block) {
    $id = (int)($block['attrs']['id'] ?? 0);
    if (!$id) return $html;
    // Keep normal responsive previews; the gallery uses the preserved original.
    $original_url = wp_get_original_image_url($id) ?: wp_get_attachment_image_url($id, 'full');
    if ($original_url) {
        $tags = new WP_HTML_Tag_Processor($html);
        if ($tags->next_tag('IMG')) {
            $tags->set_attribute('data-full-url', $original_url);
            $html = $tags->get_updated_html();
        }
    }
    if (stripos($html, '<figcaption') !== false) return $html;
    $caption = wp_get_attachment_caption($id) ?: get_post_field('post_content', $id);
    return $caption ? str_replace('</figure>', '<figcaption class="wp-element-caption">' . wp_kses_post($caption) . '</figcaption></figure>', $html) : $html;
}, 10, 2);
