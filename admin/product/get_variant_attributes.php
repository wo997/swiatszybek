<?php //->[admin/get_variant_attributes]

$variant_id = intval($_POST["variant_id"]);

$response = [];

$response["attribute_selected_values"] = fetchColumn("SELECT value_id FROM link_variant_attribute_value WHERE variant_id = $variant_id");
$response["attribute_values"] = fetchArray("SELECT * FROM variant_attribute_values INNER JOIN product_attributes USING (attribute_id) WHERE variant_id = $variant_id");

die(json_encode($response));