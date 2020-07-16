<?php

function addSlide($url,$link,$text)
{
  //$l = $link ? "href='$link'" : "";
  //return "<a $l class='swiper-slide'><div class='item-image' style='background-image:url(\"$url\")'><div class='ql-editor'>$text</div></div></a>";
  return "<div class='swiper-slide'><div class='item-image' style='background-image:url(\"/uploads/df/$url\")'><div class='ql-editor'>$text</div></div></div>";
}