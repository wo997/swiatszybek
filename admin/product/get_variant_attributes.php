<?php //route[{ADMIN}get_variant_attributes]

json_response([
    "variant_attributes" => getAttributesFromDB("link_variant_attribute_value", "variant_attribute_values", "variant_id", $_POST["variant_id"])
]);
