/* js[global] */

/*function getAnyTypeAttributeValue(attribute) {
  if (attribute.text_value) {
    return attribute.text_value;
  }
  if (attribute.numerical_value) {
    return attribute.numerical_value;
  }
  if (attribute.date_value) {
    return attribute.date_value;
  }
}*/

function setAttributePickerValues(input, value) {
  if (typeof values === "string") {
    try {
      values = JSON.parse(values);
      setAttributePickerValues(input, value);
    } catch (e) {}
    return;
  }

  input.findAll(".combo-select-wrapper").forEach((combo) => {
    combo.findAll("select").forEach((select) => {
      var option = value.selected
        ? [...select.options].find((o) => {
            return value.selected.indexOf(parseInt(o.value)) !== -1;
          })
        : null;
      if (option) {
        select.setValue(option.value);
      } else {
        select.setValue("");
      }
    });
  });

  input.findAll(".any-value-wrapper").forEach((any) => {
    any.find(`.has_attribute`).setValue(false);
  });

  if (value.values) {
    value.values.forEach((attribute) => {
      var attribute_row = input.find(
        `[data-attribute_id="${attribute.attribute_id}"]`
      );

      if (attribute_row) {
        var has_attribute_node = attribute_row.find(`.has_attribute`);
        var attribute_value_node = attribute_row.find(`.attribute_value`);
        if (has_attribute_node && attribute_value_node) {
          has_attribute_node.setValue(1);
          attribute_value_node.setValue(attribute.value);
        }
      }
    });
  }
}

function getAttibutePickerValues(input) {
  var attribute_selected_values = [];
  input.findAll("[data-attribute-value]").forEach((select) => {
    if (select.value) {
      attribute_selected_values.push(parseInt(select.value));
    }
  });
  var attribute_values = [];
  input.findAll(".any-value-wrapper").forEach((attribute_row) => {
    var attr_id = +attribute_row.getAttribute("data-attribute_id");
    var attr_val_node = attribute_row.find(".attribute_value:not(.hidden)");

    if (attr_val_node) {
      attribute_values.push({
        attribute_id: attr_id,
        value: attr_val_node.getValue(),
      });
    }
  });
  return {
    selected: attribute_selected_values,
    values: attribute_values,
  };
}
