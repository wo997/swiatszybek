<?php //module_block[slider]

useCSS("/$module_block_dir/styles.css");

$slides = def($params, "cms_slides", []);

?>
<div class='wo997_slider slider_module' data-slide_width="100%">
    <div class='wo997_slides_container'>
        <?php
        if (is_array($slides)) {
            foreach ($slides as $slide) {
                if (!$slide["published"]) {
                    continue;
                }

        ?>
                <div class='wo997_slide'>
                    <div class='cms slide-desktop'><?= getCMSPageHTML($slide["content"]) ?></div>
                    <div class='cms slide-mobile'><?= getCMSPageHTML($slide["content"]) ?></div>
                </div>
        <?php
            }
        }
        ?>
    </div>
</div>