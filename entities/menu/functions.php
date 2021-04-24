<?php //hook[helper]

// wait a sec, that seems a bit wrong
// /**
//  * getMenuLink
//  *
//  * @param  mixed $menu_path
//  * @param  number[] $option_ids
//  * @return string
//  */
// function getMenuLink($menu_path, $option_ids = [])
// {
//     $menu = end($menu_path);
//     $link = "/produkty";
//     if ($menu && $menu["id"] !== -1) {
//         $link .= "/" . $menu["id"];
//         $link .= "/" . escapeUrl(implode(" ", array_column($menu_path, "name")));
//     }
//     if ($option_ids) {
//         $link .= "?v=" . join("-", $option_ids);
//     }
//     return $link;
// }

function getAllMenus()
{
    return DB::fetchArr("SELECT * FROM menu");
}

function preloadMenus()
{
    $menus = json_encode(getAllMenus());
    return <<<JS
    menus = $menus;
    loadedMenu();
JS;
}
