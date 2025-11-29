<?php
/**
 * Archive template for articles (clanky)
 */
get_header();
?>

<main>
    <header class="archive-header">
        <h1>Články</h1>
        <p>Všetky novinky a články</p>
    </header>

    <?php
    // Filter podľa kategórie
    $kategorie = get_terms(array(
        'taxonomy' => 'kategoria_clanku',
        'hide_empty' => true,
    ));
    
    if ($kategorie && !is_wp_error($kategorie)) :
    ?>
        <div class="filter-kategorie" style="margin-bottom: 2rem; text-align: center;">
            <a href="<?php echo get_post_type_archive_link('clanok'); ?>" class="btn <?php echo !get_query_var('kategoria_clanku') ? 'btn-secondary' : ''; ?>" style="margin: 0.25rem;">Všetky</a>
            <?php foreach ($kategorie as $kat) : 
                $is_active = get_query_var('kategoria_clanku') === $kat->slug;
            ?>
                <a href="<?php echo get_term_link($kat); ?>" class="btn <?php echo $is_active ? 'btn-secondary' : ''; ?>" style="margin: 0.25rem;">
                    <?php echo esc_html($kat->name); ?>
                </a>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>

    <?php if (have_posts()) : ?>
        <div class="clanky-grid">
            <?php while (have_posts()) : the_post(); 
                $thumbnail = get_the_post_thumbnail_url(get_the_ID(), 'medium');
                $kategorie = get_the_terms(get_the_ID(), 'kategoria_clanku');
            ?>
                <article class="clanok-card">
                    <?php if ($thumbnail) : ?>
                        <img src="<?php echo esc_url($thumbnail); ?>" alt="<?php echo esc_attr(get_the_title()); ?>">
                    <?php endif; ?>
                    <h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
                    <?php if (has_excerpt()) : ?>
                        <div class="excerpt"><?php the_excerpt(); ?></div>
                    <?php endif; ?>
                    <div class="meta">
                        <?php echo get_the_date(); ?>
                        <?php if ($kategorie && !is_wp_error($kategorie)) : ?>
                            | <?php echo esc_html($kategorie[0]->name); ?>
                        <?php endif; ?>
                    </div>
                    <a href="<?php the_permalink(); ?>" class="btn">Čítať viac</a>
                </article>
            <?php endwhile; ?>
        </div>

        <div class="pagination" style="margin-top: 3rem; text-align: center;">
            <?php
            the_posts_pagination(array(
                'mid_size' => 2,
                'prev_text' => '&laquo; Predchádzajúce',
                'next_text' => 'Ďalšie &raquo;',
            ));
            ?>
        </div>
    <?php else : ?>
        <p style="text-align: center; color: var(--color-text-light); padding: 3rem;">
            Zatiaľ nie sú pridané žiadne články. Pridajte ich v <a href="<?php echo admin_url('edit.php?post_type=clanok'); ?>">WordPress admin</a>.
        </p>
    <?php endif; ?>
</main>

<?php
get_footer();

