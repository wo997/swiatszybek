<?php //route[{ADMIN}save_product_attribute]

$attributes = json_decode($_POST["attribute_values_" . $_POST["data_type"]], true);

if (isset($_POST["remove"])) {
    DB::execute("DELETE FROM product_attributes WHERE attribute_id = ?", [
        $_POST["attribute_id"]
    ]);
    DB::execute("DELETE FROM attribute_values WHERE attribute_id = ?", [
        $_POST["attribute_id"]
    ]);
} else {
    $attribute_id = isset($_POST["attribute_id"]) ? $_POST["attribute_id"] : "-1";
    if ($attribute_id == "-1") {
        DB::execute("INSERT INTO product_attributes () VALUES ()");
        $attribute_id = DB::lastInsertedId();
    } else {
        $attribute_id = intval($_POST["attribute_id"]);
    }

    $parent_id = isset($_POST["parent_id"]) ? intval($_POST["parent_id"]) : 0;

    DB::execute("UPDATE product_attributes SET name = ?, data_type = ? WHERE attribute_id = " . $attribute_id, [
        $_POST["name"], $_POST["data_type"]
    ]);


    $value_ids = "";

    // move it to service if u want to reuse it 
    function saveAttributeValuesRows($attributes, $depth = 1, $parent_id = 0)
    {
        global $value_ids, $attribute_id;

        $kolejnosc = 0;

        foreach ($attributes as $value_data) {
            $value_id = intval($value_data["value_id"]);
            $value_value = $value_data["value"];
            if ($value_id == "-1") {
                DB::execute("INSERT INTO attribute_values () VALUES ()");
                $value_id = DB::lastInsertedId();
            }

            $additional_data = $value_data ? json_encode(getArrayWithoutKeys($value_data, ["value_id", "value", "_children"])) : "";

            $kolejnosc++;
            DB::execute("UPDATE attribute_values SET value = ?, attribute_id = ?, kolejnosc = ?, parent_value_id = ?, additional_data = ? WHERE value_id = " . $value_id, [
                $value_value, $attribute_id, $kolejnosc, $parent_id, $additional_data
            ]);

            $value_ids .= $value_id . ",";

            if (isset($value_data["_children"])) {
                saveAttributeValuesRows($value_data["_children"], $depth++, $value_id);
            }
        }
    }

    saveAttributeValuesRows($attributes);

    if (!$value_ids) {
        $value_ids = "-1,";
    }
    $value_ids = substr($value_ids, 0, -1);
    DB::execute("DELETE FROM attribute_values WHERE attribute_id = $attribute_id AND value_id NOT IN ($value_ids)");


    // link attributes

    DB::execute("DELETE FROM link_category_attribute WHERE attribute_id = ?", [$attribute_id]);
    $insert = "";
    foreach (json_decode($_POST["categories"], true) as $attribute_metadata) {
        $insert .= "(" . intval($attribute_metadata["category_id"]) . ",$attribute_id," . intval($attribute_metadata["main_filter"]) . "),";
    }
    $insert = substr($insert, 0, -1);
    DB::execute("INSERT INTO link_category_attribute (category_id, attribute_id, main_filter) VALUES $insert");
}

die;
