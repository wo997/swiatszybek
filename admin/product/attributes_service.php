<?php

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

function printSelectValuesOfAttribute($values, $attribute, $value_id = null)
{
    if (!isset($values[0])) return "";

    $field_name = "attribute-" . $attribute["attribute_id"] . ($value_id ? "_" . $value_id : "");

    $attr = $value_id ? "data-parent_value_id='" . $value_id . "'" : "";
    $html = "<select class='field' $attr data-attribute-value name='$field_name'>";
    $html .= "<option value=''>Nie dotyczy</option>";
    foreach ($values as $value_data) {
        $html .= "<option value='" . $value_data["values"]["value_id"] . "'>" . $value_data["values"]["value"] . "</option>";
    }
    $html .= "</select> ";
    foreach ($values as $value_data) {
        $html .= printSelectValuesOfAttribute($value_data["children"], $attribute, $value_data["values"]["value_id"]);
    }

    return $html;
}

function displayAllAttributeOptions()
{
    global $attribute_data_types;

    $res = "";

    $attributes = fetchArray("SELECT name, attribute_id, data_type FROM product_attributes");

    foreach ($attributes as $attribute) {
        $any = isset($attribute_data_types[$attribute["data_type"]]["field"]);

        $res .= "<div class='" . ($any ? "any-value-wrapper" : "combo-select-wrapper") . " attribute-row' data-attribute_id='" . $attribute["attribute_id"] . "'>";
        $res .= "<span>" . $attribute["name"] . "</span>";

        if ($any) {
            $res .=  '
              <label>
                <input type="checkbox" class="has_attribute">
                <div class="checkbox"></div>
              </label>
            ';
            if (strpos($attribute["data_type"], "color") !== false) {
                $res .=  '<input type="text" class="jscolor field attribute_value" style="display: inline-block;width:65px">';
            } else if (strpos($attribute["data_type"], "number") !== false) {
                $res .=  '<input type="number" class="field attribute_value">';
            } else if (strpos($attribute["data_type"], "date") !== false) {
                $res .=  '<input type="text" class="field datepicker attribute_value">';
            } else {
                $res .=  '<input type="text" class="field attribute_value">';
            }
        } else {
            $values = getAttributeValues($attribute["attribute_id"]);
            $res .=  printSelectValuesOfAttribute($values, $attribute);
        }

        $res .=  "</div>";
    }

    return $res;
}

function updateAttributesInDB($attributes, $link_selection_table, $link_values_table, $column_name, $object_id)
{
    global $attribute_data_types;
    // link attribute values
    query("DELETE FROM $link_selection_table WHERE $column_name = ?", [$object_id]);
    $insert = "";
    foreach ($attributes["selected"] as $value_id) {
        $insert .= "($object_id," . intval($value_id) . "),";
    }
    if ($insert) {
        $insert = substr($insert, 0, -1);
        query("INSERT INTO $link_selection_table ($column_name, value_id) VALUES $insert");
    }

    // any attribute values
    query("DELETE FROM $link_values_table WHERE $column_name = ?", [$object_id]);
    foreach ($attributes["values"] as $attribute_id => $value) {
        $data_type = fetchValue("SELECT data_type FROM product_attributes WHERE attribute_id = " . intval($attribute_id));
        $field_name = $attribute_data_types[$data_type]["field"];
        query("INSERT INTO $link_values_table ($column_name, attribute_id, $field_name) VALUES ($object_id, $attribute_id, ?)", [$value]);
    }
}

function getAttributesFromDB($link_selection_table, $link_values_table, $column_name, $object_id)
{
    $object_id = intval($object_id);
    return [
        "selected" => fetchColumn("SELECT value_id FROM $link_selection_table WHERE $column_name = $object_id"),
        "values" => fetchArray("SELECT * FROM $link_values_table INNER JOIN product_attributes USING (attribute_id) WHERE $column_name = $object_id")
    ];
}
