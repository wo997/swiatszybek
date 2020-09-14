<?php

include_once __DIR__ . "/helpers.php";

//useJS("/src/swiper.min.js");
//useCSS("/src/swiper.min.css");
useCSS($moduleDir . "/main.css");

$slides = json_decode(nonull($moduleParams, "cms_slides", ""), true);

$slides_html = "";

foreach ($slides as $slide) {
  if (!$slide["values"]["published"]) {
    continue;
  }

  $slides_html .= "
    <div class='swiper-slide'>
      <div class='cms slide-desktop'>" . getCMSPageHTML($slide["values"]["content"]) . "</div>
      <div class='cms slide-mobile'>" . getCMSPageHTML($slide["values"]["content"])  . "</div>
    </div>
  ";
}


//$slides_html = get_slider_content();

$module_content .= "
  <div class='swiper-container slider_module swiper-all'>
    <div class='swiper-wrapper'>$slides_html</div>
    <div class='swiper-button-prev swiper-nav'><i class='fas fa-chevron-left'></i></div>
    <div class='swiper-button-next swiper-nav'><i class='fas fa-chevron-right'></i></div>
    <div class='swiper-pagination'></div>
  </div>";
