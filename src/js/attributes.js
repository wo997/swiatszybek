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
