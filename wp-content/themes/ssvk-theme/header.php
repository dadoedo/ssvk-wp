<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
    <header>
        <div class="header-container">
            <div class="logo">
                <a href="<?php echo home_url(); ?>"><?php bloginfo('name'); ?></a>
            </div>
            <button class="menu-toggle" aria-label="Menu">☰</button>
            <?php
            wp_nav_menu(array(
                'theme_location' => 'primary',
                'menu_class' => 'main-menu',
                'container' => false,
                'fallback_cb' => 'ssvk_fallback_menu',
            ));
            ?>
        </div>
    </header>

