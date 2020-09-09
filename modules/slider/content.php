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
  <div class='swiper-container module-slider'>
    <div class='swiper-wrapper'>$slides_html</div>
    <div class='swiper-button-prev'><i class='fas fa-chevron-left' style='transform:scaleX(0.7)'></i></div>
    <div class='swiper-button-next'><i class='fas fa-chevron-right' style='transform:scaleX(0.7)'></i></div>
    <div class='swiper-pagination'></div>
  </div>";
