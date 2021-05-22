<?php //hook[register]

PiepCMSManager::registerModule([
    "name" => "product_list",
    "render" => function ($params) {
        $product_list_sort = def($params, ["v_node", "settings", "product_list_sort"], "bestsellery");
        $product_list_layout = def($params, ["v_node", "settings", "product_list_layout"], "slider");
        //$product_list_category_ids_csv = def($params, ["v_node", "settings", "product_list_category_ids_csv"], "slider");

        ob_start();

        $list_html = renderGeneralProductsList([
            "page_id" => 0,
            "row_count" => 20,
            "search_order" => $product_list_sort,
            "layout" => $product_list_layout,
        ])["html"];

        if ($product_list_layout === "slider") {
?>
        <div class="wo997_slider" data-slide_width="300px" data-show_next_mobile>
            <div class="wo997_slides_container">
                <div class="wo997_slides_wrapper">
                    <?= $list_html ?>
                </div>
            </div>
        </div>
    <?php
        } else {
    ?>
        <div class="product_list">
            <?= $list_html ?>
        </div>
<?php
        }

        return ob_get_clean();
    },
    "js_path" => BUILDS_PATH . "modules/product_list.js",
    "css_path" => BUILDS_PATH . "modules/product_list.css",
]);
