<?php

include_once "$moduleDir/helpers.php";

//useJS("/src/swiper.min.js");
//useCSS("/src/swiper.min.css");
useCSS("/$moduleDir/main.css");


$slides_html = get_slider_content();

$module_content .= "
  <div class='swipper-wrapper'>
    <div class='swiper-container slider'>
      <div class='swiper-wrapper'>$slides_html</div>
      <div class='swiper-button-prev'><i class='fas fa-chevron-left' style='transform:scaleX(0.7)'></i></div>
      <div class='swiper-button-next'><i class='fas fa-chevron-right' style='transform:scaleX(0.7)'></i></div>
    </div>
    <div class='swiper-pagination'>
  </div>
</div>";
