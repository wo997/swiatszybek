<?php //hook[register]

PiepCMSManager::registerModule([
    "name" => "product_list",
    "render" => function ($params) {
        $product_list_sort = def($params, ["v_node", "settings", "product_list_sort"], "bestsellery");
        ob_start();
        echo renderGeneralProductsList([
            //"general_product_ids" => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 79, 175, 95],
            "page_id" => 0,
            "row_count" => 20,
            "search_order" => $product_list_sort
        ])["html"];
        return "<div class=\"product_list\">" . ob_get_clean() . "</div>";
    },
    "js_path" => BUILDS_PATH . "modules/product_list.js",
    "css_path" => BUILDS_PATH . "modules/product_list.css",
]);
