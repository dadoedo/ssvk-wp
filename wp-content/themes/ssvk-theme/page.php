<?php
/**
 * Template for standard WordPress pages
 * Používa sa pre všetky stránky vytvorené cez WordPress admin
 */
get_header();
?>

<main>
    <article class="page-content">
        <header class="page-header">
            <h1><?php the_title(); ?></h1>
        </header>

        <div class="page-body">
            <?php 
            while (have_posts()) :
                the_post();
                the_content();
            endwhile;
            ?>
        </div>
    </article>
</main>

<?php
get_footer();
