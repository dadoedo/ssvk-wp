<?php
/**
 * SSVK Theme Functions
 */

// Enqueue styles and scripts
function ssvk_enqueue_assets() {
    // Main CSS
    wp_enqueue_style('ssvk-main', get_template_directory_uri() . '/assets/css/main.css', array(), '1.0.0');
    
    // Main JS
    wp_enqueue_script('ssvk-main', get_template_directory_uri() . '/assets/js/main.js', array(), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'ssvk_enqueue_assets');

// Register Custom Post Types
function ssvk_register_post_types() {
    // Register 'skola' post type
    register_post_type('skola', array(
        'labels' => array(
            'name' => 'Školy',
            'singular_name' => 'Škola',
            'add_new' => 'Pridať novú školu',
            'add_new_item' => 'Pridať novú školu',
            'edit_item' => 'Upraviť školu',
            'new_item' => 'Nová škola',
            'view_item' => 'Zobraziť školu',
            'search_items' => 'Hľadať školy',
            'not_found' => 'Žiadne školy',
            'not_found_in_trash' => 'Žiadne školy v koši'
        ),
        'public' => true,
        'has_archive' => true,
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'menu_icon' => 'dashicons-building',
        'rewrite' => array('slug' => 'skola'),
    ));

    // Register 'clanok' post type
    register_post_type('clanok', array(
        'labels' => array(
            'name' => 'Články',
            'singular_name' => 'Článok',
            'add_new' => 'Pridať nový článok',
            'add_new_item' => 'Pridať nový článok',
            'edit_item' => 'Upraviť článok',
            'new_item' => 'Nový článok',
            'view_item' => 'Zobraziť článok',
            'search_items' => 'Hľadať články',
            'not_found' => 'Žiadne články',
            'not_found_in_trash' => 'Žiadne články v koši'
        ),
        'public' => true,
        'has_archive' => true,
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'menu_icon' => 'dashicons-edit',
        'rewrite' => array('slug' => 'clanok'),
    ));
}
add_action('init', 'ssvk_register_post_types');

// Register Custom Taxonomy for articles
function ssvk_register_taxonomies() {
    register_taxonomy('kategoria_clanku', 'clanok', array(
        'labels' => array(
            'name' => 'Kategórie článkov',
            'singular_name' => 'Kategória článku',
            'search_items' => 'Hľadať kategórie',
            'all_items' => 'Všetky kategórie',
            'edit_item' => 'Upraviť kategóriu',
            'update_item' => 'Aktualizovať kategóriu',
            'add_new_item' => 'Pridať novú kategóriu',
            'new_item_name' => 'Názov novej kategórie',
            'menu_name' => 'Kategórie článkov',
        ),
        'hierarchical' => true,
        'public' => true,
        'show_ui' => true,
        'show_admin_column' => true,
        'rewrite' => array('slug' => 'kategoria-clanku'),
    ));
}
add_action('init', 'ssvk_register_taxonomies');

// Theme support
function ssvk_theme_support() {
    add_theme_support('post-thumbnails');
    add_theme_support('title-tag');
}
add_action('after_setup_theme', 'ssvk_theme_support');

// Register navigation menus
function ssvk_register_menus() {
    register_nav_menus(array(
        'primary' => 'Hlavné menu',
    ));
}
add_action('init', 'ssvk_register_menus');

// Fallback menu if no menu is set
function ssvk_fallback_menu() {
    echo '<ul class="main-menu">';
    echo '<li><a href="' . home_url() . '">Domov</a></li>';
    echo '<li><a href="' . get_post_type_archive_link('skola') . '">Školy</a></li>';
    echo '<li><a href="' . get_post_type_archive_link('clanok') . '">Články</a></li>';
    echo '<li><a href="' . home_url('/kontakt') . '">Kontakt</a></li>';
    echo '</ul>';
}

