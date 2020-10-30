<?php //route[{ADMIN}save_product]

$product_data = json_decode($_POST["product_data"], true);

if (isset($product_data["remove"])) {
    query("DELETE FROM variant WHERE product_id = ?", [
        $product_data["product_id"]
    ]);
    query("DELETE FROM link_variant_attribute_value INNER JOIN variant USING (variant_id) WHERE product_id = ?", [
        $product_data["product_id"]
    ]);
} else {
    $product_id = getEntityId("products", $product_data["product_id"]);

    $product_entity_data = filterArrayKeys($product_data, [
        "title",
        "link",
        "seo_title",
        "seo_description",
        "description",
        "published",
    ]);

    $product_entity_data["gallery"] = json_encode($product_data["gallery"]);
    $product_entity_data["variant_filters"] = json_encode($product_data["variant_filters"]);

    updateEntity($product_entity_data, "products", "product_id", $product_id);

    // categories
    query("DELETE FROM link_product_category WHERE product_id = ?", [$product_id]);
    $insert = "";
    foreach ($product_data["categories"] as $category_id) {
        $insert .= "($product_id," . intval($category_id) . "),";
    }
    if ($insert) {
        $insert = substr($insert, 0, -1);
        query("INSERT INTO link_product_category (product_id, category_id) VALUES $insert");
    }

    triggerEvent("product_gallery_change", ["product_id" => intval($product_id)]);

    // attributes
    include_once "admin/product/attributes_service.php";
    updateAttributesInDB($product_data["attributes"], "link_product_attribute_value", "product_attribute_values", "product_id", $product_id);

    // TODO: test if attribues work for products and if so remove the code below
    /*query("DELETE FROM link_variant_attribute_option WHERE product_id = ?", [$product_id]);
    $insert = "";
    $kolejnosc = 0;
    foreach ($product_data["variant_attribute_options"] as $row) {
        $attribute_id = $row["attribute_id"];
        $attribute_values = $row["attribute_values"];
        $kolejnosc++;
        $insert .= "($product_id," . intval($attribute_id) . "," . escapeSQL($attribute_values) . ",$kolejnosc),";
    }
    if ($insert) {
        $insert = substr($insert, 0, -1);
        query("INSERT INTO link_variant_attribute_option (product_id, attribute_id, attribute_values, kolejnosc) VALUES $insert");
    }*/

    // variants
    /*query("DELETE FROM link_variant_attribute_value WHERE variant_id = ?", [ // create foreign key?
        $product_data["variant_id"]
    ]);*/

    $kolejnosc = 0;
    $present_variant_ids = [];
    foreach ($product_data["variants"] as $variant_data) {
        $variant_id = getEntityId("variant", $variant_data["variant_id"], ["data" => ["product_id" => $product_id]]);
        $present_variant_ids[] = $variant_id;

        $variant_entity_data = filterArrayKeys($variant_data, ["name", "product_code", "zdjecie", "published", "price", "rabat"]);
        $kolejnosc++;
        $variant_entity_data["kolejnosc"] = $kolejnosc;
        updateEntity($variant_entity_data, "variant", "variant_id", $variant_id);

        triggerEvent("variant_stock_change", ["variant_id" => $variant_id, "stock_difference" => intval($variant_data["stock"]) - intval($variant_data["was_stock"])]);

        triggerEvent("variant_price_change", ["product_id" => $product_id]);

        // TODO: bring it back?
        //$attributes = $variant["attributes"];
        //updateAttributesInDB($attributes, "link_variant_attribute_value", "variant_attribute_values", "variant_id", $variant_id);
    }

    $where = "product_id = $product_id";
    if (count($present_variant_ids) > 0) {
        $where .= " AND variant_id NOT IN (" . join(",", $present_variant_ids) . ")";
    }
    query("DELETE FROM variant WHERE $where");
}

triggerEvent("sitemap_change");

redirect(STATIC_URLS["ADMIN"] . "produkt/$product_id");
