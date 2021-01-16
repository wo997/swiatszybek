/* js[global] */

function setAttributePickerValues(input, value) {
	if (typeof values === "string") {
		try {
			values = JSON.parse(values);
			setAttributePickerValues(input, value);
		} catch (e) {}
		return;
	}

	input._children(".combo-select-wrapper").forEach((combo) => {
		combo._children("select").forEach((select) => {
			var option = value.selected
				? [...select.options].find((o) => {
						return value.selected.indexOf(parseInt(o.value)) !== -1;
				  })
				: null;
			if (option) {
				select._set_value(option.value);
			} else {
				select._set_value("");
			}
		});
	});

	input._children(".any-value-wrapper").forEach((any) => {
		any._child(`.has_attribute`)._set_value(false);
	});

	if (value.values) {
		value.values.forEach((attribute) => {
			var attribute_row = input.find(
				`[data-attribute_id="${attribute.attribute_id}"]`
			);

			if (attribute_row) {
				var has_attribute_node = attribute_row._child(`.has_attribute`);
				var attribute_value_node = attribute_row._child(`.attribute_value`);
				if (has_attribute_node && attribute_value_node) {
					has_attribute_node._set_value(1);
					attribute_value_node._set_value(attribute.value);
				}
			}
		});
	}
}

function getAttibutePickerValues(input) {
	var attribute_selected_values = [];
	input._children("[data-attribute-value]").forEach((select) => {
		if (select.value) {
			attribute_selected_values.push(parseInt(select.value));
		}
	});
	var attribute_values = [];
	input._children(".any-value-wrapper").forEach((attribute_row) => {
		var attr_id = +attribute_row.getAttribute("data-attribute_id");
		var attr_val_node = attribute_row._child(".attribute_value:not(.hidden)");

		if (attr_val_node) {
			attribute_values.push({
				attribute_id: attr_id,
				value: attr_val_node._get_value(),
			});
		}
	});
	return {
		selected: attribute_selected_values,
		values: attribute_values,
	};
}
