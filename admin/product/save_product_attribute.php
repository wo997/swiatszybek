<?php //route[admin/save_product_attribute]

$attributes = json_decode($_POST["attribute_values_" . $_POST["data_type"]], true);

if (isset($_POST["remove"])) {
    query("DELETE FROM product_attributes WHERE attribute_id = ?", [
        $_POST["attribute_id"]
    ]);
    query("DELETE FROM attribute_values WHERE attribute_id = ?", [
        $_POST["attribute_id"]
    ]);
} else {
    $attribute_id = isset($_POST["attribute_id"]) ? $_POST["attribute_id"] : "-1";
    if ($attribute_id == "-1") {
        query("INSERT INTO product_attributes () VALUES ()");
        $attribute_id = getLastInsertedId();
    } else {
        $attribute_id = intval($_POST["attribute_id"]);
    }

    $parent_id = $_POST["parent_id"] ? intval($_POST["parent_id"]) : 0;

    query("UPDATE product_attributes SET name = ?, data_type = ? WHERE attribute_id = " . $attribute_id, [
        $_POST["name"], $_POST["data_type"]
    ]);


    $value_ids = "";

    // move it to service if u want to reuse it 
    function saveAttributeValuesRows($attributes, $depth = 1, $parent_id = 0)
    {
        global $value_ids, $attribute_id;

        $kolejnosc = 0;

        foreach ($attributes as $attribute) {
            $value_data = $attribute["values"];
            $value_id = intval($value_data["value_id"]);
            $value_value = $value_data["value"];
            if ($value_id == "-1") {
                query("INSERT INTO attribute_values () VALUES ()");
                $value_id = getLastInsertedId();
            }

            // additional_data, ⚠️ the array will be missing the rest of data
            unset($value_data["value_id"]);
            unset($value_data["value"]);
            $additional_data = $value_data ? json_encode($value_data) : "";

            $kolejnosc++;
            query("UPDATE attribute_values SET value = ?, attribute_id = ?, kolejnosc = ?, parent_value_id = ?, additional_data = ? WHERE value_id = " . $value_id, [
                $value_value, $attribute_id, $kolejnosc, $parent_id, $additional_data
            ]);

            $value_ids .= $value_id . ",";

            if (isset($attribute["children"])) {
                saveAttributeValuesRows($attribute["children"], $depth++, $value_id);
            }
        }
    }

    saveAttributeValuesRows($attributes);

    if (!$value_ids) {
        $value_ids = "-1,";
    }
    $value_ids = substr($value_ids, 0, -1);
    query("DELETE FROM attribute_values WHERE attribute_id = $attribute_id AND value_id NOT IN ($value_ids)");
}


/*

"[{"values":{"value_id":"14","value":"Samsung"},"children":[{"values":{"value_id":"-1","value":"dsfgdsfg"},"children":[{"values":{"value_id":"-1","value":"sd"},"children":[]}]}]},{"values":{"value_id":"26","value":"Apple"},"children":[{"values":{"value_id":"-1","value":"aaaa"},"children":[]},{"values":{"value_id":"-1","value":"aa"},"children":[]}]}]"

*/

die;
