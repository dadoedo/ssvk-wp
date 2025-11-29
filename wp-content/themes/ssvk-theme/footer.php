    <footer>
        <div class="footer-container">
            <div class="footer-section">
                <h3><?php bloginfo('name'); ?></h3>
                <p><?php bloginfo('description'); ?></p>
            </div>
            
            <div class="footer-section">
                <h3>Rýchle odkazy</h3>
                <?php
                $skoly = get_posts(array(
                    'post_type' => 'skola',
                    'posts_per_page' => 4,
                    'orderby' => 'date',
                    'order' => 'ASC'
                ));
                
                if ($skoly) :
                    echo '<ul style="list-style: none; padding: 0;">';
                    foreach ($skoly as $skola) :
                        echo '<li><a href="' . get_permalink($skola->ID) . '">' . esc_html($skola->post_title) . '</a></li>';
                    endforeach;
                    echo '</ul>';
                endif;
                ?>
            </div>
            
            <div class="footer-section">
                <h3>Kontakt</h3>
                <p>Pre viac informácií nás kontaktujte.</p>
                <a href="<?php echo home_url('/kontakt'); ?>">Kontaktná stránka</a>
            </div>
        </div>
        
        <div class="footer-bottom">
            <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. Všetky práva vyhradené.</p>
        </div>
    </footer>
    <?php wp_footer(); ?>
</body>
</html>
