<?php

$u = fetchRow("SELECT cat_id, mother, children_json js, pies as piesekx FROM cat");
$u["cat_id"];

$u = fetchArray("SELECT dddd, mother, children_json js, pies as piesekx FROM cat");
$u[0]["cat_id"];
$u[1]["mother"];

foreach ($u as $p) {
    $p["dddd"];
}

/**
 * heyca
 *
 * @param  GridData $x
 * @param  string $y
 * @return void
 */
function heyca($x, $y)
{
    $x["x_coords"];
}
createTable("product_attribute_values", [
    ["name" => "", "type" => ""],
    ["name" => "product_id", "type" => "INT"],
    ["name" => "attribute_id", "type" => "INT"],
    ["name" => "numerical_value", "type" => "INT", "null" => true],
    ["name" => "text_value", "type" => "TEXT", "null" => true],
    ["name" => "date_value", "type" => "DATE", "null" => true],
]);
