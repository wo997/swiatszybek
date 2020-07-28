<?php


function get_slider_content()
{
  $slides = fetchArray("SELECT content_desktop, content_mobile FROM slides ORDER BY kolejnosc");
  $slides_html = "";
  foreach ($slides as $slide) {
    $slides_html .= "
      <div class='swiper-slide'>
        <div class='cms slide-desktop'>" . $slide["content_desktop"] . "</div>
        <div class='cms slide-mobile'>" . $slide["content_mobile"] . "</div>
      </div>
    ";
  }
  return $slides_html;
}
