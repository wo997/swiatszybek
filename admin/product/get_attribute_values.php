<?php //->[admin/get_attribute_values]

function getAttributeValues($attribute_id, $parent_value_id = 0)
{
    $values = [];

    $where = "attribute_id = $attribute_id AND parent_value_id = $parent_value_id";
    $sub_attributes = fetchArray("SELECT value, value_id FROM attribute_values WHERE $where ORDER BY kolejnosc");

    foreach ($sub_attributes as $sub_attribute) {
        $values[] = [
            "values" => $sub_attribute,
            "children" => getAttributeValues($attribute_id, $sub_attribute["value_id"])
        ];
    }
    return $values;
}

$values = getAttributeValues(intval($_POST['attribute_id'])); // recursive

echo json_encode($values);

?>
