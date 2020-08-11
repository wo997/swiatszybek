<?php //route[admin/save_variant]

$input = ["exceptions" => ["variant_attributes"]];
include "helpers/safe_post.php";

if (isset($_POST["remove"])) {
    query("DELETE FROM variant WHERE variant_id = ?", [
        $_POST["variant_id"]
    ]);
    query("DELETE FROM link_variant_attribute_value WHERE variant_id = ?", [
        $_POST["variant_id"]
    ]);
} else {
    $variant_id = isset($_POST["variant_id"]) ? $_POST["variant_id"] : "-1";
    if ($variant_id == "-1") {
        query("INSERT INTO variant () VALUES ()");
        $variant_id = getLastInsertedId();
    }

    query("UPDATE variant SET name = ?, product_code = ?, zdjecie = ?, color = ?, published = ?, price = ?, rabat = ?, product_id = ? WHERE variant_id = " . intval($variant_id), [
        $_POST["name"], $_POST["product_code"], $_POST["zdjecie"], $_POST["color"], $_POST["published"], $_POST["price"], $_POST["rabat"], $_POST["product_id"]
    ]);

    triggerEvent("variant_stock_change", ["variant_id" => intval($variant_id), "stock_difference" => intval($_POST["stock"]) - intval($_POST["was_stock"])]);

    triggerEvent("variant_price_change", ["product_id" => intval($_POST["product_id"])]);

    include_once "admin/product/attributes_service.php";
    $variant_attributes = json_decode($_POST["variant_attributes"], true);
    updateAttributesInDB($variant_attributes, "link_variant_attribute_value", "variant_attribute_values", "variant_id", $variant_id);
}

die;
