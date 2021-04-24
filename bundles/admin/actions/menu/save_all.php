<?php //route[{ADMIN}/menu/save_all]

try {
    DB::beginTransaction();

    $menus = json_decode($_POST["menus"], true);

    $traverse = function ($arr, $parent_id = -1) use (&$traverse) {
        $ids_we_have = [];
        foreach ($arr as $item) {
            $menu_data = filterArrayKeys($item, ["name", "link_what", "link_what_id", "url", "menu_id", "pos", "menu_id"]);
            if ($menu_data["link_what"] === "url") {
                unset($menu_data["link_what_id"]);
            } else {
                unset($menu_data["url"]);
            }
            $menu_data["parent_menu_id"] = $parent_id;
            $menu = EntityManager::getEntity("menu", $menu_data);
            $category_id = $menu->getId();
            $ids_we_have[] = $category_id;
            $ids_we_have = array_merge($ids_we_have, $traverse($item["sub_menus"], $category_id));
        }
        return $ids_we_have;
    };

    $ids_we_have = $traverse($menus);

    $query = "SELECT menu_id FROM menu";
    if ($ids_we_have) {
        $query .= " WHERE menu_id NOT IN (" . join(",", $ids_we_have) . ")";
    }

    foreach (DB::fetchCol($query) as $id) {
        $menu = EntityManager::getEntityById("menu", $id);
        $menu->setWillDelete();
    }

    EntityManager::saveAll();

    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
