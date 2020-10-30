<?php //route[{ADMIN}save_product]

//$input = ["exceptions" => ["categories", "description", "gallery", "attributes", "variants", "variant_attribute_options"]];
//include "helpers/safe_post.php";

if (isset($_POST["remove"])) {
    query("DELETE FROM variant WHERE product_id = ?", [
        $_POST["product_id"]
    ]);
    query("DELETE FROM link_variant_attribute_value INNER JOIN variant USING (variant_id) WHERE product_id = ?", [
        $_POST["product_id"]
    ]);
} else {
    $product_id = getEntityId("products", $_POST["product_id"]);

    $product_data = filterArrayKeys($_POST, [
        "title",
        "link",
        "seo_title",
        "seo_description",
        "description",
        "gallery",
        "published",
        //"variant_attributes_layout",
        "variant_filters"
    ]);

    updateEntity($product_data, "products", "product_id", $product_id);

    // categories
    query("DELETE FROM link_product_category WHERE product_id = ?", [$product_id]);
    $insert = "";
    foreach (json_decode($_POST["categories"], true) as $category_id) {
        $insert .= "($product_id," . intval($category_id) . "),";
    }
    if ($insert) {
        $insert = substr($insert, 0, -1);
        query("INSERT INTO link_product_category (product_id, category_id) VALUES $insert");
    }

    triggerEvent("product_gallery_change", ["product_id" => intval($product_id)]);

    // attributes
    include_once "admin/product/attributes_service.php";
    $attributes = json_decode($_POST["attributes"], true);
    updateAttributesInDB($attributes, "link_product_attribute_value", "product_attribute_values", "product_id", $product_id);

    // TODO: test if attribues work for products and if so remove the code below
    /*query("DELETE FROM link_variant_attribute_option WHERE product_id = ?", [$product_id]);
    $insert = "";
    $kolejnosc = 0;
    foreach (json_decode($_POST["variant_attribute_options"], true) as $row) {
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
        $_POST["variant_id"]
    ]);*/
    $variant_ids = "";
    $kolejnosc = 0;
    foreach (json_decode($_POST["variants"], true) as $variant) {
        $kolejnosc++;
        $variant_id = getEntityId("variant", $variant["variant_id"], ["data" => ["product_id" => $product_id]]);
        $variant_ids .= "$variant_id,";

        $data = filterArrayKeys($variant, ["name", "product_code", "zdjecie", "published", "price", "rabat"]);
        $data["product_id"] = $product_id;
        $data["kolejnosc"] = $kolejnosc;

        updateEntity($data, "variant", "variant_id", $variant_id);

        triggerEvent("variant_stock_change", ["variant_id" => $variant_id, "stock_difference" => intval($variant["stock"]) - intval($variant["was_stock"])]);

        triggerEvent("variant_price_change", ["product_id" => $product_id]);

        $attributes = json_decode($variant["attributes"], true);
        updateAttributesInDB($attributes, "link_variant_attribute_value", "variant_attribute_values", "variant_id", $variant_id);
    }

    if (!$variant_ids) {
        $variant_ids = "-1,";
    }
    $variant_ids = substr($variant_ids, 0, -1);
    query("DELETE FROM variant WHERE product_id = $product_id AND variant_id NOT IN ($variant_ids)");
}

triggerEvent("sitemap_change");

redirect(STATIC_URLS["ADMIN"] . "produkt/$product_id");
