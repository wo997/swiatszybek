<?php

if (!function_exists('isCurrent')) {
  function isCurrent($some_url)
  {
    global $url;
    return strpos($url, $some_url) !== false ? "current" : "";
  }

  function renderPageItem($page,$params = []) {
    $className = "";

    if (isset($params["dropdown"])) {
      $className .= " dropdown-header";
    }
    if (isset($params["current"]) && $params["current"]) {
      $className .= " current";
    }
    else {
      $className .= isCurrent($page['url']);
    }

    return "<a class='menu_item $className' href='/{$page['url']}'>{$page['title']} ".renderNotification($page['notifcation_count'])." </a>";
  }
}

foreach ($admin_navigations_tree as $page) {
  $current = false;
  if (isset($page['sub'])) {
    foreach ($page['sub'] as $sub) {
      $current = isCurrent($sub['url']);
      if ($current) {
        break;
      }
    }
  } else {
    $current = isCurrent($page['url']);
  }

  if (isset($page['sub'])) {
    $notifcation = renderNotification($page['notifcation_count']);
    if ($notifcation) $notifcation .= " ";

    echo "<div class='dropdown mobile-hover $current' >
        ".renderPageItem($page,["dropdown"=>true,"current"=>$current])."
        <div class='dropdown-expand'>
      ";

    foreach ($page['sub'] as $sub) {
      echo renderPageItem($sub);
    }

    echo "</div></div>";
  } else {
    echo renderPageItem($page);
  }
}
