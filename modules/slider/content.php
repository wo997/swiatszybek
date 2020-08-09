<?php

include_once __DIR__ . "/helpers.php";

//useJS("/src/swiper.min.js");
//useCSS("/src/swiper.min.css");
useCSS(__DIR__ . "/main.css");


$slides_html = get_slider_content();

$module_content .= "
  <div class='swiper-container module-slider'>
    <div class='swiper-wrapper'>$slides_html</div>
    <div class='swiper-button-prev'><i class='fas fa-chevron-left' style='transform:scaleX(0.7)'></i></div>
    <div class='swiper-button-next'><i class='fas fa-chevron-right' style='transform:scaleX(0.7)'></i></div>
    <div class='swiper-pagination'></div>
  </div>";
