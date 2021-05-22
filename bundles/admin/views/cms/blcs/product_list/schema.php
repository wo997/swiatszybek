<?php //hook[register]

PiepCMSManager::registerModule([
    "name" => "product_list",
    "render" => function ($params) {
        $product_list_sort = def($params, ["v_node", "settings", "product_list_sort"], "bestsellery");
        $product_list_layout = def($params, ["v_node", "settings", "product_list_layout"], "slider");
        $product_list_category_ids_csv = def($params, ["v_node", "settings", "product_list_category_ids_csv"], "");

        $params = [
            "page_id" => 0,
            "row_count" => 20,
            "search_order" => $product_list_sort,
            "layout" => $product_list_layout,
        ];

        ob_start();
        if ($product_list_category_ids_csv) {
            $product_list_category_ids = explode(",", $product_list_category_ids_csv);

            $__category_path_jsons = DB::fetchCol("SELECT __category_path_json FROM product_category WHERE product_category_id IN (" .
                clean($product_list_category_ids_csv) . ")");
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
