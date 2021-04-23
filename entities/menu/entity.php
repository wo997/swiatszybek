<?php //hook[entity]

EntityManager::register("menu", [
    "props" => [
        "menu_id" => ["type" => "number"],
        "parent_menu_id" => ["type" => "number"],
        "name" => ["type" => "string"],
        "pos" => ["type" => "number"],
        "__menu_path_json" => ["type" => "string"],
    ],
]);

// TODO: scan more than just other menus
// EventListener::register("before_save_menu_entity", function ($params) {
//     /** @var Entity Menu */
//     $menu = $params["obj"];

//     $menu_path = [];

//     /** @var Entity Menu */
//     $parent_menu = $menu;
//     while (true) {
//         array_unshift($menu_path, ["id" => $parent_menu->getId(), "name" => $parent_menu->getProp("name")]);

//         $parent_menu_id = $parent_menu->getProp("parent_menu_id");
//         if ($parent_menu_id === -1) {
//             break;
//         }
//         $parent_menu = EntityManager::getEntityById("menu", $parent_menu_id);
//         if (!$parent_menu) {
//             break;
//         }
//     }

//     $menu->setProp("__menu_path_json", json_encode($menu_path));
// });
