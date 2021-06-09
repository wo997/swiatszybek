<?php //hook[register]

PiepCMSManager::registerModule([
    "name" => "product_list",
    "render" => function ($params) {
        global $GENERAL_PRODUCT_ID;

        $layout = def($params, ["v_node", "settings", "product_list_layout"], "slider");
        $display_what = def($params, ["v_node", "settings", "product_list_display_what"], "custom");
        $count = intval(def($params, ["v_node", "settings", "product_list_count"], ""));
        if (!$count) {
            $count = 30;
        }

        if ($display_what === "general_product") {
            $params = [
                "page_id" => 0,
                "row_count" => $count,
                "search_order" => "general_product",
                "general_product_id" => $GENERAL_PRODUCT_ID,
                "layout" => $layout,
            ];

            $list_html = renderGeneralProductsList($params)["html"];
        } else if ($display_what === "custom") {
            $sort = def($params, ["v_node", "settings", "product_list_sort"], "bestsellery");
            $category_ids_csv = def($params, ["v_node", "settings", "product_list_category_ids_csv"], "");

            $params = [
                "page_id" => 0,
                "row_count" => $count,
                "search_order" => $sort,
                "layout" => $layout,
            ];

            if ($category_ids_csv) {
                $product_list_category_ids = explode(",", $category_ids_csv);

                $__category_path_jsons = DB::fetchCol("SELECT __category_path_json FROM product_category WHERE product_category_id IN (" .
                    clean($category_ids_csv) . ")");
                foreach ($__category_path_jsons as $__category_path_json) {
                    $category_path = json_decode($__category_path_json, true);
                    $i = count($category_path);
                    foreach ($category_path as $cat) {
                        $i--;
                        if ($i === 0) {
                            break;
                        }
                        $ind = array_search($cat["id"], $product_list_category_ids);
                        if ($ind !== false) {
                            array_splice($product_list_category_ids, $ind, 1);
                        }
                    }
                }
                $general_product_ids = DB::fetchCol("SELECT general_product_id
                FROM general_product
                INNER JOIN general_product_to_category gptc USING (general_product_id)
                WHERE product_category_id IN (" . join(",", $product_list_category_ids) . ")");

                $params["general_product_ids"] = $general_product_ids;
            }

            $list_html = renderGeneralProductsList($params)["html"];
        }

        ob_start();
        if ($layout === "slider") {
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
    // "js_path" => BUILDS_PATH . "modules/product_list.js",
    // "css_path" => BUILDS_PATH . "modules/product_list.css",
]);
