<?php

// also globaj.js 
function getLink($phrase)
{
    $pl = array(',', ' ', 'ę', 'Ę', 'ó', 'Ó', 'ą', 'Ą', 'ś', 'Ś', 'ł', 'Ł', 'ż', 'Ż', 'ź', 'Ź', 'ć', 'Ć', 'ń', 'Ń');
    $en = array('-', '-', 'e', 'E', 'o', 'O', 'a', 'A', 's', 'S', 'l', 'L', 'z', 'Z', 'z', 'Z', 'c', 'C', 'n', 'N');
    return strtolower(preg_replace("/-+/", "-", preg_replace("/[^(a-zA-Z0-9-)]/", "", str_replace($pl, $en, $phrase))));
}


function getMenuLink($menu_item)
{
    $title = "";
    $url = "";

    if ($menu_item["url"]) {
        $title = $menu_item["url"];
        $url = $menu_item["url"];
    } else if ($menu_item["cms_url"]) {
        $title = $menu_item["cms_title"];
        $url = "/" . $menu_item["cms_url"];
    } else if ($menu_item["product_id"]) {
        $title = $menu_item["product_title"];
        $url = getProductLink($menu_item["product_id"], $menu_item["product_link"]);
    }
    return ["title" => $title, "url" => $url];
}
