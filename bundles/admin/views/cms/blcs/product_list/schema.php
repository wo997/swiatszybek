<?php //hook[register]

PiepCMSManager::registerModule([
    "name" => "product_list",
    "render" => function ($params) {
        global $GENERAL_PRODUCT_ID;

        $layout = def($params, ["v_node", "settings", "product_list_layout"], "slider");
        $display_what = def($params, ["v_node", "settings", "product_list_display_what"], "custom");
        $count_str = trim(def($params, ["v_node", "settings", "product_list_count"], ""));
        $initial_count_str = trim(def($params, ["v_node", "settings", "product_list_initial_count"], ""));
        $only_discount = intval(def($params, ["v_node", "settings", "product_list_only_discount"], ""));
        $sort = def($params, ["v_node", "settings", "product_list_sort"], "bestsellery");
        $category_ids_csv = def($params, ["v_node", "settings", "product_list_category_ids_csv"], "");

        $lazy = def($params, ["v_node", "settings", "lazy"], false);
        $skip = intval(def($params, ["v_node", "settings", "product_list_skip"], "0"));

        if ($count_str === "") {
            $count_str = "45";
        }
        $count = intval($count_str);

        if (!$lazy) {
            if ($initial_count_str === "") {
                if ($layout === "slider") {
                    // remember that this may vary
                    // 6 = 5 + 1, 1 is simply an offset
                    $initial_count_str = "6";
                    // fuck this shit, just for for 10 straight, NO XD
                    // $initial_count_str = 10;
                } else {
                    $initial_count_str = $count_str;
                }
            }
            $count = intval($initial_count_str);
        }

        $params = [
            "page_id" => 0,
            // HEY load all for admin duuuude
            "row_count" => $count,
            "layout" => $layout,
            "skip" => $skip
        ];

        if ($display_what === "general_product") {
            $params["search_order"] = "general_product";
            $params["general_product_id"] = $GENERAL_PRODUCT_ID;
        } else if ($display_what === "custom") {

            $params["search_order"] = $sort;
            $params["only_discount"] = $only_discount;

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
        }

        $list_html = renderGeneralProductsList($params)["html"];

        if ($lazy) {
            die($list_html);
        }

        // array for effi
        $params_html = "data-params=\"" . htmlspecialchars(json_encode([$layout, $display_what, $count_str, $initial_count_str, $only_discount, $sort, $category_ids_csv])) . "\"";

        ob_start();
        if ($layout === "slider") {
?>
        <div class="wo997_slider lazy_products" data-slide_width="300px" data-max_visible_count="5" data-show_next_mobile <?= $params_html ?>>
            <div class="wo997_slides_container">
                <div class="wo997_slides_wrapper">
                    <?= $list_html ?>
                </div>
            </div>
        </div>
    <?php
        } else {
    ?>
        <div class="product_list lazy_products" <?= $params_html ?>>
            <?= $list_html ?>
        </div>
<?php
        }

        return ob_get_clean();
    },
    // "js_path" => BUILDS_PATH . "modules/product_list.js",
    // "css_path" => BUILDS_PATH . "modules/product_list.css",
]);
