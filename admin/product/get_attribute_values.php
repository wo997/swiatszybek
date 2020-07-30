<?php //route[admin/get_attribute_values]

include_once "attributes_service.php";

$values = getAttributeValues(intval($_POST['attribute_id'])); // recursive

echo json_encode($values);
