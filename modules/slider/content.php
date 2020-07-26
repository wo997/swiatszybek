<?php

include_once "helpers.php";

//useJS("/src/swiper.min.js");
//useCSS("/src/swiper.min.css");
useCSS("$moduleDir/main.css");

$gallery = "";
// $slides = fetchArray("SELECT img, link, tekst FROM slides ORDER BY kolejnosc");
// foreach ($slides as $slide) {
//   $gallery .= addSlide($slide["img"],$slide["link"], $slide["tekst"]);
// }

$module_content .= "
  <div class='swipper-wrapper'>
    <div class='swiper-container slider'>
      <div class='swiper-wrapper'>$gallery</div>
      <div class='swiper-button-next'><img style='transform: scale(-0.7,0.7);' src='/img/chevron-left.png'></div>
      <div class='swiper-button-prev'><img style='transform: scale(0.7,0.7);' src='/img/chevron-left.png'></div>
    </div>
    <div class='swiper-pagination'>
  </div>
</div>";
