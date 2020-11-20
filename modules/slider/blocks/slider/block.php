<?php //module_block[slider]

useCSS("/$module_block_dir/styles.css");

$slides = nonull($params, "cms_slides", []);

?>
<div class='swiper-container slider_module swiper-all'>
    <div class='swiper-wrapper'>
        <?php
        if (is_array($slides)) {
            foreach ($slides as $slide) {
                if (!$slide["published"]) {
                    continue;
                }

        ?>
                <div class='swiper-slide'>
                    <div class='cms slide-desktop'><?= getCMSPageHTML($slide["content"]) ?></div>
                    <div class='cms slide-mobile'><?= getCMSPageHTML($slide["content"]) ?></div>
                </div>
        <?php
            }
        }
        ?></div>
    <div class='swiper-button-prev swiper-nav'><img src="/src/img/chevron.svg"></div>
    <div class='swiper-button-next swiper-nav'><img src="/src/img/chevron.svg"></div>
    <div class='swiper-pagination'></div>
</div>