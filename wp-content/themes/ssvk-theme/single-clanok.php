<?php
/**
 * Template for single article page
 */
get_header();

while (have_posts()) :
    the_post();
    $thumbnail = get_the_post_thumbnail_url(get_the_ID(), 'large');
    $kategorie = get_the_terms(get_the_ID(), 'kategoria_clanku');
?>

<main>
    <article class="clanok-single">
        <header class="clanok-header">
            <?php if ($kategorie && !is_wp_error($kategorie)) : ?>
                <div class="clanok-kategoria">
                    <?php foreach ($kategorie as $kat) : ?>
                        <span class="kategoria-badge"><?php echo esc_html($kat->name); ?></span>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
            
            <h1><?php the_title(); ?></h1>
            
            <div class="clanok-meta">
                <span><?php echo get_the_date(); ?></span>
                <?php if (get_the_author()) : ?>
                    <span>| Autor: <?php the_author(); ?></span>
                <?php endif; ?>
            </div>
        </header>

        <?php if ($thumbnail) : ?>
            <div class="clanok-header-image">
                <img src="<?php echo esc_url($thumbnail); ?>" alt="<?php echo esc_attr(get_the_title()); ?>">
            </div>
        <?php endif; ?>

        <div class="clanok-content">
            <?php the_content(); ?>
        </div>

        <footer class="clanok-footer">
            <div class="clanok-navigation">
                <?php
                $prev_post = get_previous_post();
                $next_post = get_next_post();
                ?>
                <?php if ($prev_post) : ?>
                    <a href="<?php echo get_permalink($prev_post->ID); ?>" class="btn">← Predchádzajúci článok</a>
                <?php endif; ?>
                <?php if ($next_post) : ?>
                    <a href="<?php echo get_permalink($next_post->ID); ?>" class="btn">Ďalší článok →</a>
                <?php endif; ?>
            </div>
        </footer>
    </article>
</main>

<?php
endwhile;
get_footer();

