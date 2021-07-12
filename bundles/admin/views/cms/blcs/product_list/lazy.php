<?php //route[/modules/product_list/lazy]

$p = json_decode($_POST["params"]);
$module = PiepCMSManager::$modules["product_list"];
die($module["render"]([
    "v_node" => [
        "settings" => [
            "product_list_layout" => $p[0],
            "product_list_display_what" => $p[1],
            "product_list_count" => $p[2],
            //"product_list_initial_count" => $p[3],
            "product_list_skip" => $p[3],
            "product_list_only_discount" => $p[4],
            "product_list_sort" => $p[5],
            "product_list_category_ids_csv" => $p[6],
            "lazy" => true
        ]
    ]
]));
