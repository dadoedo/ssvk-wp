<?php
/**
 * Migračný skript pre vytvorenie základných stránok
 * 
 * POUŽITIE:
 * 1. Cez WP-CLI: wp eval-file wp-content/themes/ssvk-theme/migrations/create-pages.php
 * 2. Alebo v WordPress admin pridaj do functions.php: include_once 'migrations/create-pages.php'; ssvk_run_migration();
 *    (po spustení riadok zmaž)
 * 
 * Stránky sa vytvoria len ak ešte neexistujú (kontrola podľa slug).
 */

if (!defined('ABSPATH')) {
    // Ak spúšťame cez WP-CLI
    require_once dirname(__FILE__) . '/../../../../wp-load.php';
}

/**
 * Definícia stránok na vytvorenie
 */
function ssvk_get_pages_to_create() {
    return array(
        // Kontakt
        array(
            'title' => 'Kontakt',
            'slug' => 'kontakt',
            'content' => '
<!-- wp:heading {"level":2} -->
<h2>Kontaktné údaje</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><strong>Spojená škola Ľudovíta Štúra</strong></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Adresa: [DOPLNIŤ ADRESU]<br>
PSČ: [DOPLNIŤ PSČ]<br>
Mesto: [DOPLNIŤ MESTO]</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Telefónne čísla</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Sekretariát: <a href="tel:+421XXXXXXXXX">+421 XXX XXX XXX</a><br>
Riaditeľ: <a href="tel:+421XXXXXXXXX">+421 XXX XXX XXX</a><br>
Ekonomický úsek: <a href="tel:+421XXXXXXXXX">+421 XXX XXX XXX</a></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>E-mail</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Sekretariát: <a href="mailto:sekretariat@skola.sk">sekretariat@skola.sk</a><br>
Riaditeľ: <a href="mailto:riaditel@skola.sk">riaditel@skola.sk</a></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>IČO / DIČ</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>IČO: [DOPLNIŤ]<br>
DIČ: [DOPLNIŤ]</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Úradné hodiny</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Pondelok - Piatok: 8:00 - 15:00</p>
<!-- /wp:paragraph -->
',
            'menu_order' => 10,
        ),
        
        // Konzultačné hodiny
        array(
            'title' => 'Konzultačné hodiny',
            'slug' => 'konzultacne-hodiny',
            'content' => '
<!-- wp:heading {"level":2} -->
<h2>Konzultačné hodiny učiteľov</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Konzultačné hodiny pre rodičov sú stanovené nasledovne:</p>
<!-- /wp:paragraph -->

<!-- wp:table -->
<figure class="wp-block-table"><table><thead><tr><th>Meno učiteľa</th><th>Deň</th><th>Čas</th><th>Miestnosť</th></tr></thead><tbody><tr><td>Mgr. Ján Novák</td><td>Pondelok</td><td>14:00 - 15:00</td><td>Kabinet 101</td></tr><tr><td>Ing. Mária Horváthová</td><td>Utorok</td><td>13:00 - 14:00</td><td>Kabinet 205</td></tr><tr><td>PhDr. Peter Kováč</td><td>Streda</td><td>14:00 - 15:00</td><td>Kabinet 102</td></tr></tbody></table></figure>
<!-- /wp:table -->

<!-- wp:paragraph -->
<p><strong>Poznámka:</strong> Pre konzultáciu mimo uvedených hodín je potrebné sa vopred dohodnúť s príslušným učiteľom.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Aktuálny zoznam konzultačných hodín nájdete aj na nástenke pri vstupe do školy.</p>
<!-- /wp:paragraph -->
',
            'menu_order' => 20,
        ),
        
        // Pracovný poriadok
        array(
            'title' => 'Pracovný poriadok',
            'slug' => 'pracovny-poriadok',
            'content' => '
<!-- wp:heading {"level":2} -->
<h2>Pracovný poriadok</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Pracovný poriadok školy upravuje práva a povinnosti zamestnancov a vedenia školy.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Dokumenty na stiahnutie</h3>
<!-- /wp:heading -->

<!-- wp:list -->
<ul>
<li><a href="/wp-content/uploads/dokumenty/pracovny-poriadok-2024.pdf" target="_blank">Pracovný poriadok 2024 (PDF)</a></li>
<li><a href="/wp-content/uploads/dokumenty/organizacny-poriadok-2024.pdf" target="_blank">Organizačný poriadok 2024 (PDF)</a></li>
<li><a href="/wp-content/uploads/dokumenty/skolsky-poriadok-2024.pdf" target="_blank">Školský poriadok 2024 (PDF)</a></li>
</ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p><em>Poznámka: Pre správne zobrazenie PDF dokumentov potrebujete mať nainštalovaný Adobe Reader alebo podobný program.</em></p>
<!-- /wp:paragraph -->
',
            'menu_order' => 30,
        ),
        
        // Fotogaléria
        array(
            'title' => 'Fotogaléria',
            'slug' => 'fotogaleria',
            'content' => '
<!-- wp:heading {"level":2} -->
<h2>Fotogaléria</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Vitajte v našej fotogalérii. Tu nájdete fotografie z rôznych školských akcií, súťaží a podujatí.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Školský rok 2024/2025</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><em>Fotografie budú pridané priebežne počas školského roka.</em></p>
<!-- /wp:paragraph -->

<!-- wp:gallery {"columns":3,"linkTo":"media"} -->
<figure class="wp-block-gallery has-nested-images columns-3 is-cropped">
<!-- Tu pridajte obrázky cez WordPress editor -->
</figure>
<!-- /wp:gallery -->

<!-- wp:heading {"level":3} -->
<h3>Archív</h3>
<!-- /wp:heading -->

<!-- wp:list -->
<ul>
<li>Školský rok 2023/2024 (pripravujeme)</li>
<li>Školský rok 2022/2023 (pripravujeme)</li>
</ul>
<!-- /wp:list -->
',
            'menu_order' => 40,
        ),
        
        // Verejné obstarávanie
        array(
            'title' => 'Verejné obstarávanie',
            'slug' => 'verejne-obstaravanie',
            'content' => '
<!-- wp:heading {"level":2} -->
<h2>Verejné obstarávanie</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>V zmysle zákona č. 343/2015 Z. z. o verejnom obstarávaní zverejňujeme informácie o zákazkách a súťažiach.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Profil verejného obstarávateľa</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><strong>Názov:</strong> [NÁZOV ŠKOLY]<br>
<strong>IČO:</strong> [IČO]<br>
<strong>Sídlo:</strong> [ADRESA]</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Aktuálne výzvy</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><em>Momentálne nie sú žiadne aktívne výzvy.</em></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Archív zákaziek</h3>
<!-- /wp:heading -->

<!-- wp:heading {"level":4} -->
<h4>Rok 2024</h4>
<!-- /wp:heading -->

<!-- wp:list -->
<ul>
<li><a href="/wp-content/uploads/vo/zakazka-001-2024.pdf" target="_blank">Zákazka č. 001/2024 - Názov zákazky (PDF)</a></li>
</ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3>Súhrnné správy</h3>
<!-- /wp:heading -->

<!-- wp:list -->
<ul>
<li><a href="/wp-content/uploads/vo/suhrnna-sprava-q4-2024.pdf" target="_blank">Súhrnná správa Q4/2024 (PDF)</a></li>
<li><a href="/wp-content/uploads/vo/suhrnna-sprava-q3-2024.pdf" target="_blank">Súhrnná správa Q3/2024 (PDF)</a></li>
</ul>
<!-- /wp:list -->
',
            'menu_order' => 50,
        ),
        
        // O škole
        array(
            'title' => 'O škole',
            'slug' => 'o-skole',
            'content' => '
<!-- wp:heading {"level":2} -->
<h2>O našej škole</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Spojená škola je moderná vzdelávacia inštitúcia, ktorá poskytuje kvalitné vzdelanie v rôznych odboroch.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>História</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>[DOPLNIŤ HISTÓRIU ŠKOLY - kedy bola založená, významné míľniky, atď.]</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Naše hodnoty</h3>
<!-- /wp:heading -->

<!-- wp:list -->
<ul>
<li><strong>Kvalita vzdelávania</strong> - Kladieme dôraz na vysokú úroveň výučby</li>
<li><strong>Individuálny prístup</strong> - Každý žiak je pre nás dôležitý</li>
<li><strong>Moderné metódy</strong> - Využívame najnovšie vzdelávacie technológie</li>
<li><strong>Prax</strong> - Prepájame teoretické vedomosti s praxou</li>
</ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3>Vedenie školy</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><strong>Riaditeľ:</strong> [MENO]<br>
<strong>Zástupca riaditeľa:</strong> [MENO]<br>
<strong>Výchovný poradca:</strong> [MENO]</p>
<!-- /wp:paragraph -->
',
            'menu_order' => 5,
        ),
    );
}

/**
 * Vytvorí stránku ak neexistuje
 */
function ssvk_create_page_if_not_exists($page_data) {
    // Skontroluj či stránka už existuje
    $existing = get_page_by_path($page_data['slug']);
    
    if ($existing) {
        echo "⏭️  Stránka '{$page_data['title']}' už existuje (ID: {$existing->ID})\n";
        return $existing->ID;
    }
    
    // Vytvor novú stránku
    $page_id = wp_insert_post(array(
        'post_title'    => $page_data['title'],
        'post_name'     => $page_data['slug'],
        'post_content'  => $page_data['content'],
        'post_status'   => 'publish',
        'post_type'     => 'page',
        'post_author'   => 1,
        'menu_order'    => $page_data['menu_order'] ?? 0,
    ));
    
    if (is_wp_error($page_id)) {
        echo "❌ Chyba pri vytváraní stránky '{$page_data['title']}': " . $page_id->get_error_message() . "\n";
        return false;
    }
    
    echo "✅ Vytvorená stránka '{$page_data['title']}' (ID: {$page_id})\n";
    return $page_id;
}

/**
 * Vytvorí menu a pridá stránky
 */
function ssvk_setup_menu($page_ids) {
    $menu_name = 'Hlavné menu';
    $menu_location = 'primary';
    
    // Skontroluj či menu existuje
    $menu = wp_get_nav_menu_object($menu_name);
    
    if (!$menu) {
        // Vytvor nové menu
        $menu_id = wp_create_nav_menu($menu_name);
        echo "✅ Vytvorené menu '{$menu_name}' (ID: {$menu_id})\n";
    } else {
        $menu_id = $menu->term_id;
        echo "ℹ️  Menu '{$menu_name}' už existuje (ID: {$menu_id})\n";
    }
    
    // Získaj existujúce položky menu
    $existing_items = wp_get_nav_menu_items($menu_id);
    $existing_page_ids = array();
    
    if ($existing_items) {
        foreach ($existing_items as $item) {
            if ($item->type === 'post_type' && $item->object === 'page') {
                $existing_page_ids[] = (int)$item->object_id;
            }
        }
    }
    
    // Pridaj Domov ako prvú položku ak neexistuje
    $home_exists = false;
    if ($existing_items) {
        foreach ($existing_items as $item) {
            if ($item->type === 'custom' && $item->url === home_url('/')) {
                $home_exists = true;
                break;
            }
        }
    }
    
    if (!$home_exists) {
        wp_update_nav_menu_item($menu_id, 0, array(
            'menu-item-title'   => 'Domov',
            'menu-item-url'     => home_url('/'),
            'menu-item-status'  => 'publish',
            'menu-item-type'    => 'custom',
            'menu-item-position' => 1,
        ));
        echo "✅ Pridaná položka menu 'Domov'\n";
    }
    
    // Pridaj stránky do menu
    $position = 10;
    foreach ($page_ids as $slug => $page_id) {
        if (!$page_id) continue;
        
        // Preskočí ak už je v menu
        if (in_array($page_id, $existing_page_ids)) {
            echo "⏭️  Stránka '{$slug}' už je v menu\n";
            $position += 10;
            continue;
        }
        
        $page = get_post($page_id);
        wp_update_nav_menu_item($menu_id, 0, array(
            'menu-item-title'     => $page->post_title,
            'menu-item-object'    => 'page',
            'menu-item-object-id' => $page_id,
            'menu-item-type'      => 'post_type',
            'menu-item-status'    => 'publish',
            'menu-item-position'  => $position,
        ));
        echo "✅ Pridaná položka menu '{$page->post_title}'\n";
        $position += 10;
    }
    
    // Priraď menu k lokácii
    $locations = get_theme_mod('nav_menu_locations');
    if (!is_array($locations)) {
        $locations = array();
    }
    $locations[$menu_location] = $menu_id;
    set_theme_mod('nav_menu_locations', $locations);
    echo "✅ Menu priradené k lokácii '{$menu_location}'\n";
    
    return $menu_id;
}

/**
 * Hlavná funkcia migrácie
 */
function ssvk_run_migration() {
    echo "\n";
    echo "╔══════════════════════════════════════════════════════════════╗\n";
    echo "║           SSVK - Migrácia stránok                          ║\n";
    echo "╚══════════════════════════════════════════════════════════════╝\n";
    echo "\n";
    
    $pages = ssvk_get_pages_to_create();
    $page_ids = array();
    
    echo "📄 VYTVÁRANIE STRÁNOK\n";
    echo "─────────────────────────────────────────────────────────────────\n";
    
    foreach ($pages as $page) {
        $page_ids[$page['slug']] = ssvk_create_page_if_not_exists($page);
    }
    
    echo "\n";
    echo "🍔 NASTAVENIE MENU\n";
    echo "─────────────────────────────────────────────────────────────────\n";
    
    ssvk_setup_menu($page_ids);
    
    echo "\n";
    echo "╔══════════════════════════════════════════════════════════════╗\n";
    echo "║  ✅ Migrácia dokončená!                                      ║\n";
    echo "║                                                              ║\n";
    echo "║  Stránky nájdete v: WordPress Admin → Stránky               ║\n";
    echo "║  Menu upravíte v: WordPress Admin → Vzhľad → Menu           ║\n";
    echo "╚══════════════════════════════════════════════════════════════╝\n";
    echo "\n";
}

// Ak je skript spustený priamo cez WP-CLI
if (defined('WP_CLI') && WP_CLI) {
    ssvk_run_migration();
} elseif (php_sapi_name() === 'cli') {
    // Spustené z príkazového riadku
    ssvk_run_migration();
}

