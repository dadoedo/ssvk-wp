<?php
/**
 * Template for single school page
 */
get_header();

while (have_posts()) :
    the_post();
    $thumbnail = get_the_post_thumbnail_url(get_the_ID(), 'large');
    $clanky_skoly = get_posts(array(
        'post_type' => 'clanok',
        'posts_per_page' => 6,
        'meta_query' => array(
            array(
                'key' => 'skola_id',
                'value' => get_the_ID(),
                'compare' => '='
            )
        ),
        'orderby' => 'date',
        'order' => 'DESC'
    ));
    
    // Alternatívne: nájsť články podľa kategórie školy
    $skola_slug = sanitize_title(get_the_title());
    $skola_kategoria = get_term_by('slug', $skola_slug, 'kategoria_clanku');
    
    if ($skola_kategoria) {
        $clanky_skoly = get_posts(array(
            'post_type' => 'clanok',
            'posts_per_page' => 6,
            'tax_query' => array(
                array(
                    'taxonomy' => 'kategoria_clanku',
                    'field' => 'term_id',
                    'terms' => $skola_kategoria->term_id,
                ),
            ),
            'orderby' => 'date',
            'order' => 'DESC'
        ));
    }
?>

<main>
    <article class="skola-single">
        <?php if ($thumbnail) : ?>
            <div class="skola-header-image">
                <img src="<?php echo esc_url($thumbnail); ?>" alt="<?php echo esc_attr(get_the_title()); ?>">
            </div>
        <?php endif; ?>
        
        <header class="skola-header">
            <h1><?php the_title(); ?></h1>
            <?php if (get_the_excerpt()) : ?>
                <p class="skola-excerpt"><?php the_excerpt(); ?></p>
            <?php endif; ?>
        </header>

        <div class="skola-content">
            <?php the_content(); ?>
        </div>

        <?php if ($clanky_skoly) : ?>
            <section class="skola-clanky">
                <h2>Novinky z tejto školy</h2>
                <div class="clanky-grid">
                    <?php foreach ($clanky_skoly as $clanok) : 
                        $clanok_thumbnail = get_the_post_thumbnail_url($clanok->ID, 'medium');
                    ?>
                        <article class="clanok-card">
                            <?php if ($clanok_thumbnail) : ?>
                                <img src="<?php echo esc_url($clanok_thumbnail); ?>" alt="<?php echo esc_attr($clanok->post_title); ?>">
                            <?php endif; ?>
                            <h3><a href="<?php echo get_permalink($clanok->ID); ?>"><?php echo esc_html($clanok->post_title); ?></a></h3>
                            <?php if ($clanok->post_excerpt) : ?>
                                <div class="excerpt"><?php echo esc_html($clanok->post_excerpt); ?></div>
                            <?php endif; ?>
                            <div class="meta">
                                <?php echo get_the_date('', $clanok->ID); ?>
                            </div>
                            <a href="<?php echo get_permalink($clanok->ID); ?>" class="btn">Čítať viac</a>
                        </article>
                    <?php endforeach; ?>
                </div>
            </section>
        <?php endif; ?>
    </article>
</main>

<?php
endwhile;
get_footer();

