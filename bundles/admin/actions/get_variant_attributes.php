<?php //route[{ADMIN}/get_variant_attributes]

Request::jsonResponse([
    "variant_attributes" => getAttributesFromDB("link_variant_attribute_value", "variant_attribute_values", "variant_id", $_POST["variant_id"])
]);
