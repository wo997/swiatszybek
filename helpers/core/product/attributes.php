<?php


$attribute_data_types = [
    "textlist" => [
        "description" => "Tekst (lista)",
    ],
    "numberlist" => [
        "description" => "Liczba (lista)",
    ],
    "colorlist" => [
        "description" => "Kolor (lista)"
    ],
    "numberany" => [
        "description" => "Liczba (dowolna)",
        "field" => "numerical_value"
    ],
    "dateany" => [
        "description" => "Data (dowolna)",
        "field" => "date_value"
    ],
    "textany" => [
        "description" => "Tekst (dowolny)",
        "field" => "text_value"
    ],
    /*"integer" => [
    "description" => "Liczba całkowita",
  ],
  "decimal" => [  
    "description" => "Liczba zmiennoprzecinkowa",
  ]*/
];

function getAttributeValues($attribute_id, $parent_value_id = 0)
{
    $values = [];

    $where = "attribute_id = $attribute_id AND parent_value_id = $parent_value_id";
    $sub_attributes = DB::fetchArr("SELECT value, value_id, additional_data FROM attribute_values WHERE $where ORDER BY kolejnosc");

    foreach ($sub_attributes as $sub_attribute) {
        $additional_data = json_decode($sub_attribute["additional_data"], true);
        if ($additional_data) {
            $sub_attribute = array_merge($sub_attribute, $additional_data);
        }

        $sub_attribute["_children"] = getAttributeValues($attribute_id, $sub_attribute["value_id"]);

        $values[] = $sub_attribute;
    }
    return $values;
}

function printSelectValuesOfAttribute($values, $attribute, $value_id = null)
{
    if (!isset($values[0])) return "";

    $field_name = "attribute-" . $attribute["attribute_id"] . ($value_id ? "_" . $value_id : "");

    $attr = $value_id ? "data-parent_value_id='" . $value_id . "'" : "";
    $html = "<select class='field no-wrap inline' $attr data-attribute-value name='$field_name'>";
    $html .= "<option value=''>―</option>";
    foreach ($values as $value_data) {

        $html .= "<option value='" . $value_data["value_id"] . "'>" . $value_data["value"] . ($value_data["_children"] ? " ❯" : "") . "</option>";
    }
    $html .= "</select> ";
    foreach ($values as $value_data) {
        $html .= printSelectValuesOfAttribute($value_data["_children"], $attribute, $value_data["value_id"]);
    }

    return $html;
}

function getAllAttributeOptions()
{
    global $attribute_data_types;

    $attribute_htmls = [];
    $all_values = [];

    $attributes = DB::fetchArr("SELECT name, attribute_id, data_type FROM product_attributes ORDER BY kolejnosc");

    foreach ($attributes as $attribute) {
        $any = isset($attribute_data_types[$attribute["data_type"]]["field"]);

        $html = "<div class='" . ($any ? "any-value-wrapper" : "combo-select-wrapper") . " attribute-row' data-attribute_id='" . $attribute["attribute_id"] . "'>";
        $html .= "<span class='label first'>";
        $html .= "<i class='fas fa-check-circle'></i><i class='fas fa-times-circle' data-tooltip='Nie dotyczy'></i>" . $attribute["name"];
        if ($any) {
            $html .=  '
              <label>
                <input type="checkbox" class="has_attribute">
                <div class="checkbox"></div>
              </label>
            ';
        }
        $html .= "</span>";

        if ($any) {
            $field_name = "attribute-" . $attribute["attribute_id"];

            if (strpos($attribute["data_type"], "color") !== false) {
                $html .=  "<input type='text' class='jscolor field attribute_value no-wrap inline' name='$field_name'>";
            } else if (strpos($attribute["data_type"], "number") !== false) {
                $html .=  "<input type='number' class='field attribute_value inline no-wrap' name='$field_name'>";
            } else if (strpos($attribute["data_type"], "date") !== false) {
                $html .=  "<input type='text' class='field default_datepicker inline attribute_value no-wrap' name='$field_name'>";
            } else {
                $html .=  "<input type='text' class='field attribute_value no-wrap' name='$field_name'>";
            }
        } else {
            $values = getAttributeValues($attribute["attribute_id"]);
            $all_values[] = $values;
            $html .=  printSelectValuesOfAttribute($values, $attribute);
        }

        $html .=  "</div>";

        $attribute_htmls[] = ["attribute_id" => $attribute["attribute_id"], "html" => $html];
    }

    return [
        "html_array" => $attribute_htmls,
        "values" => $all_values,
    ];
}

function updateAttributesInDB($attributes, $link_selection_table, $link_values_table, $column_name, $object_id)
{
    global $attribute_data_types;

    // link attribute values
    DB::execute("DELETE FROM $link_selection_table WHERE $column_name = ?", [$object_id]);
    $insert = "";
    foreach ($attributes["selected"] as $value_id) {
        $insert .= "($object_id," . intval($value_id) . "),";
    }
    if ($insert) {
        $insert = substr($insert, 0, -1);
        DB::execute("INSERT INTO $link_selection_table ($column_name, value_id) VALUES $insert");
    }
    // any attribute values
    DB::execute("DELETE FROM $link_values_table WHERE $column_name = ?", [$object_id]);
    foreach ($attributes["values"] as $attribute) {
        $attribute_id = intval($attribute["attribute_id"]);
        $value = $attribute["value"];
        $data_type = DB::fetchVal("SELECT data_type FROM product_attributes WHERE attribute_id = $attribute_id");
        $field_name = $attribute_data_types[$data_type]["field"];
        DB::execute("INSERT INTO $link_values_table ($column_name, attribute_id, $field_name) VALUES ($object_id, $attribute_id, ?)", [$value]);
    }
}

function getAttributesFromDB($link_selection_table, $link_values_table, $column_name, $object_id)
{
    global $attribute_data_types;

    $object_id = intval($object_id);

    $values_all = DB::fetchArr("SELECT * FROM $link_values_table INNER JOIN product_attributes USING (attribute_id) WHERE $column_name = $object_id");
    $values = [];

    foreach ($values_all as $attribute) {
        $attribute_id = $attribute["attribute_id"];
        $data_type = DB::fetchVal("SELECT data_type FROM product_attributes WHERE attribute_id = $attribute_id");
        $field_name = $attribute_data_types[$data_type]["field"];
        $values[] = [
            "attribute_id" => $attribute_id,
            "value" => $attribute[$field_name]
        ];
    }

    return [
        "selected" => DB::fetchCol("SELECT value_id FROM $link_selection_table WHERE $column_name = $object_id"),
        "values" => $values
    ];
}
