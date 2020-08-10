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

    $variant_attributes = json_decode($_POST["variant_attributes"], true);

    // link attribute values
    query("DELETE FROM link_variant_attribute_value WHERE variant_id = ?", [$variant_id]);
    $insert = "";
    foreach ($variant_attributes["selected"] as $value_id) {
        $insert .= "($variant_id," . intval($value_id) . "),";
    }
    $insert = substr($insert, 0, -1);
    query("INSERT INTO link_variant_attribute_value (variant_id, value_id) VALUES $insert");

    // any attribute values
    query("DELETE FROM variant_attribute_values WHERE variant_id = ?", [$variant_id]);
    foreach ($variant_attributes["values"] as $attribute_id => $value) {
        $data_type = fetchValue("SELECT data_type FROM product_attributes WHERE attribute_id = " . intval($attribute_id));
        $field_name = $attribute_data_types[$data_type]["field"];
        query("INSERT INTO variant_attribute_values (variant_id, attribute_id, $field_name) VALUES ($variant_id, $attribute_id, ?)", [$value]);
    }
}

die;
