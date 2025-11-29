<?php
/**
 * Front page template - Hero + Rozcestník na školy + Info + Novinky
 */
get_header();
?>

<main>
    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <h1><?php bloginfo('name'); ?></h1>
            <p><?php bloginfo('description'); ?></p>
        </div>
    </section>

    <!-- Rozcestník - Štvorlistok -->
    <section class="rozcestnik">
        <h2>Naše školy</h2>
        <div class="skoly-grid">
            <?php
            $skoly = get_posts(array(
                'post_type' => 'skola',
                'posts_per_page' => 4,
                'orderby' => 'date',
                'order' => 'ASC'
            ));

            if ($skoly) :
                foreach ($skoly as $skola) :
                    $thumbnail = get_the_post_thumbnail_url($skola->ID, 'medium');
            ?>
                <a href="<?php echo get_permalink($skola->ID); ?>" class="skola-card">
                    <?php if ($thumbnail) : ?>
                        <img src="<?php echo esc_url($thumbnail); ?>" alt="<?php echo esc_attr($skola->post_title); ?>">
                    <?php else : ?>
                        <div style="width: 100%; height: 240px; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); border-radius: var(--radius-xl) var(--radius-xl) 0 0; display: flex; align-items: center; justify-content: center; color: white; font-size: 4rem;">
                            🏫
                        </div>
                    <?php endif; ?>
                    <div class="skola-card-content">
                        <h3><?php echo esc_html($skola->post_title); ?></h3>
                        <?php if ($skola->post_excerpt) : ?>
                            <p><?php echo esc_html($skola->post_excerpt); ?></p>
                        <?php else : ?>
                            <p>Zistite viac o našej škole a jej aktivitách.</p>
                        <?php endif; ?>
                        <span class="btn">Viac informácií</span>
                    </div>
                </a>
            <?php
                endforeach;
            else :
            ?>
                <div style="grid-column: 1 / -1; text-align: center; padding: var(--spacing-xl); background: var(--color-bg-light); border-radius: var(--radius-lg); border: 2px dashed var(--color-border);">
                    <div style="font-size: 4rem; margin-bottom: var(--spacing-md); opacity: 0.5;">🏫</div>
                    <h3 style="margin-bottom: var(--spacing-sm); color: var(--color-text);">Zatiaľ nie sú pridané žiadne školy</h3>
                    <p style="color: var(--color-text-light); margin-bottom: var(--spacing-md);">Pridajte školy v <a href="<?php echo admin_url('edit.php?post_type=skola'); ?>" style="color: var(--color-primary); font-weight: 500;">WordPress admin</a>.</p>
                </div>
            <?php endif; ?>
        </div>
    </section>

    <!-- Info Sekcia -->
    <section class="info-sekcia">
        <?php
        // Môžeš vytvoriť stránku "Info" v WP admin a načítať ju tu
        $info_page = get_page_by_path('info');
        if ($info_page) :
        ?>
            <h2><?php echo esc_html($info_page->post_title); ?></h2>
            <div><?php echo wp_kses_post($info_page->post_content); ?></div>
        <?php else : ?>
            <h2>Vitajte na našej stránke</h2>
            <p>Tu môžeš pridať informácie o organizácii. Vytvor stránku s názvom "info" v WordPress admin a obsah sa zobrazí tu.</p>
        <?php endif; ?>
    </section>

    <!-- Spoločné novinky -->
    <section class="novinky">
        <h2>Spoločné novinky</h2>
        <?php
        // Získať kategóriu "Spoločné"
        $spolocne_term = get_term_by('slug', 'spolocne', 'kategoria_clanku');
        
        if ($spolocne_term) {
            $clanky = get_posts(array(
                'post_type' => 'clanok',
                'posts_per_page' => 6,
                'tax_query' => array(
                    array(
                        'taxonomy' => 'kategoria_clanku',
                        'field' => 'term_id',
                        'terms' => $spolocne_term->term_id,
                    ),
                ),
                'orderby' => 'date',
                'order' => 'DESC'
            ));
        } else {
            // Ak kategória neexistuje, zobraz všetky články
            $clanky = get_posts(array(
                'post_type' => 'clanok',
                'posts_per_page' => 6,
                'orderby' => 'date',
                'order' => 'DESC'
            ));
        }

        if ($clanky) :
        ?>
            <div class="clanky-grid">
                <?php foreach ($clanky as $clanok) : 
                    $clanok_thumbnail = get_the_post_thumbnail_url($clanok->ID, 'medium');
                    $kategorie = get_the_terms($clanok->ID, 'kategoria_clanku');
                ?>
                    <article class="clanok-card">
                        <?php if ($clanok_thumbnail) : ?>
                            <img src="<?php echo esc_url($clanok_thumbnail); ?>" alt="<?php echo esc_attr($clanok->post_title); ?>">
                        <?php else : ?>
                            <div style="width: 100%; height: 220px; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius: var(--radius-lg) var(--radius-lg) 0 0; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 3rem;">
                                📄
                            </div>
                        <?php endif; ?>
                        <div class="clanok-card-content">
                            <h3><a href="<?php echo get_permalink($clanok->ID); ?>"><?php echo esc_html($clanok->post_title); ?></a></h3>
                            <?php if ($clanok->post_excerpt) : ?>
                                <div class="excerpt"><?php echo esc_html($clanok->post_excerpt); ?></div>
                            <?php endif; ?>
                            <div class="meta">
                                <span>📅 <?php echo get_the_date('d.m.Y', $clanok->ID); ?></span>
                                <?php if ($kategorie && !is_wp_error($kategorie)) : ?>
                                    <span>•</span>
                                    <span>🏷️ <?php echo esc_html($kategorie[0]->name); ?></span>
                                <?php endif; ?>
                            </div>
                            <a href="<?php echo get_permalink($clanok->ID); ?>" class="btn">Čítať viac →</a>
                        </div>
                    </article>
                <?php endforeach; ?>
            </div>
        <?php else : ?>
            <div style="text-align: center; padding: var(--spacing-xl); background: var(--color-bg-light); border-radius: var(--radius-lg); border: 2px dashed var(--color-border);">
                <div style="font-size: 4rem; margin-bottom: var(--spacing-md); opacity: 0.5;">📰</div>
                <h3 style="margin-bottom: var(--spacing-sm); color: var(--color-text);">Zatiaľ nie sú pridané žiadne články</h3>
                <p style="color: var(--color-text-light); margin-bottom: var(--spacing-md);">Pridajte články v <a href="<?php echo admin_url('edit.php?post_type=clanok'); ?>" style="color: var(--color-primary); font-weight: 500;">WordPress admin</a>.</p>
            </div>
        <?php endif; ?>
    </section>
</main>

<?php
get_footer();
