<?php //module_block[slider]

useCSS("/$module_block_dir/styles.css");

$slides = json_decode(nonull($params, "cms_slides", ""), true);

?>
<div class='swiper-container slider_module swiper-all'>
  <div class='swiper-wrapper'>
    <?php
    if (is_array($slides)) {
      foreach ($slides as $slide) {
        if (!$slide["values"]["published"]) {
          continue;
        }

    ?>
        <div class='swiper-slide'>
          <div class='cms slide-desktop'><?= getCMSPageHTML($slide["values"]["content"]) ?></div>
          <div class='cms slide-mobile'><?= getCMSPageHTML($slide["values"]["content"]) ?></div>
        </div>
    <?php
      }
    }
    ?></div>
  <div class='swiper-button-prev swiper-nav'><i class='fas fa-chevron-left'></i></div>
  <div class='swiper-button-next swiper-nav'><i class='fas fa-chevron-right'></i></div>
  <div class='swiper-pagination'></div>
</div>