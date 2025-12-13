<?php
/**
 * SSVK Theme Functions
 */

// Enqueue styles and scripts
function ssvk_enqueue_assets() {
    // Main CSS (filemtime for cache busting during development)
    wp_enqueue_style('ssvk-main', get_template_directory_uri() . '/assets/css/main.css', array(), filemtime(get_template_directory() . '/assets/css/main.css'));
    
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
    // Podpora pre Gutenberg editor
    add_theme_support('editor-styles');
    add_theme_support('wp-block-styles');
    add_theme_support('align-wide');
    add_theme_support('responsive-embeds');
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

/**
 * Admin stránka pre spustenie migrácií
 */
function ssvk_add_migration_admin_page() {
    add_management_page(
        'SSVK Migrácie',
        'SSVK Migrácie',
        'manage_options',
        'ssvk-migrations',
        'ssvk_migration_admin_page'
    );
}
add_action('admin_menu', 'ssvk_add_migration_admin_page');

function ssvk_migration_admin_page() {
    // Spracuj akciu
    if (isset($_POST['run_migration']) && wp_verify_nonce($_POST['ssvk_migration_nonce'], 'ssvk_run_migration')) {
        echo '<div class="wrap">';
        echo '<h1>SSVK Migrácie - Výsledok</h1>';
        echo '<pre style="background: #1d2327; color: #fff; padding: 20px; border-radius: 4px; font-family: monospace; line-height: 1.6;">';
        
        // Načítaj a spusti migráciu
        require_once get_template_directory() . '/migrations/create-pages.php';
        ssvk_run_migration();
        
        echo '</pre>';
        echo '<p><a href="' . admin_url('tools.php?page=ssvk-migrations') . '" class="button">← Späť</a></p>';
        echo '</div>';
        return;
    }
    
    ?>
    <div class="wrap">
        <h1>SSVK Migrácie</h1>
        <div class="card" style="max-width: 600px; padding: 20px;">
            <h2>Vytvoriť základné stránky</h2>
            <p>Táto migrácia vytvorí nasledujúce stránky:</p>
            <ul style="list-style: disc; padding-left: 20px;">
                <li><strong>O škole</strong> - základné informácie o škole</li>
                <li><strong>Kontakt</strong> - kontaktné údaje, adresa, telefón, email</li>
                <li><strong>Konzultačné hodiny</strong> - tabuľka konzultačných hodín</li>
                <li><strong>Pracovný poriadok</strong> - odkazy na PDF dokumenty</li>
                <li><strong>Fotogaléria</strong> - galéria fotografií</li>
                <li><strong>Verejné obstarávanie</strong> - dokumenty VO</li>
            </ul>
            <p><strong>Poznámka:</strong> Stránky sa vytvoria len ak ešte neexistujú. Existujúce stránky nebudú prepísané.</p>
            <p>Po vytvorení budú stránky pridané do hlavného menu.</p>
            
            <form method="post" style="margin-top: 20px;">
                <?php wp_nonce_field('ssvk_run_migration', 'ssvk_migration_nonce'); ?>
                <input type="submit" name="run_migration" class="button button-primary button-large" value="🚀 Spustiť migráciu">
            </form>
        </div>
        
        <div class="card" style="max-width: 600px; padding: 20px; margin-top: 20px;">
            <h2>Alternatívne spustenie cez WP-CLI</h2>
            <p>Ak máš prístup k príkazovému riadku, môžeš migráciu spustiť aj takto:</p>
            <code style="display: block; background: #f0f0f1; padding: 10px; border-radius: 4px;">
                wp eval-file wp-content/themes/ssvk-theme/migrations/create-pages.php
            </code>
        </div>
    </div>
    <?php
}

