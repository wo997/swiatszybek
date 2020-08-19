<?php

function ratingBlock($rating)
{
    $d = fmod($rating - 0.25, 1);
    $half = $d < 0.5 ? "rating" . round($rating - 0.75) . "5" : "";

    return $rating == 0 ? '' : '<div class="rating rating' . round($rating + 0.25) . ' ' . $half . '">
      <span><img src="/img/star-gray.png"></span>
      <span><img src="/img/star-gray.png"></span>
      <span><img src="/img/star-gray.png"></span>
      <span><img src="/img/star-gray.png"></span>
      <span><img src="/img/star-gray.png"></span>
    </div>';
}
