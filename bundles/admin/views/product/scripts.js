/* js[view] */

var attribute_values = {};
attribute_values_array.forEach((value) => {
	attribute_values[value["value_id"]] = {
		value: value["value"],
		attribute_id: +value["attribute_id"],
		parent_value_id: +value["parent_value_id"],
	};
});

Object.entries(attribute_values).forEach(([value_id, value]) => {
	var whole_value = value.value;
	var curr_level_value = value;
	while (true) {
		var parent_value_id = +curr_level_value.parent_value_id;
		if (parent_value_id <= 0) {
			break;
		}
		parent_value = attribute_values[parent_value_id];
		if (!parent_value) {
			break;
		}
		whole_value = parent_value.value + " ❯ " + whole_value;

		curr_level_value = parent_value;
	}
	value.whole_value = whole_value;
});

var attributes = {};
attributes_array.forEach((attribute) => {
	attributes[attribute["attribute_id"]] = attribute["name"];
});

var attribute_select_options = "";

attributes_array.forEach((attribute) => {
	attribute_select_options += `<option value="${attribute["attribute_id"]}">${attribute["name"]}</option>`;
});

function comboSelectValuesChanged(combo, options = {}) {
	combo._children("select").forEach((select) => {
		for (option of select.options) {
			var childSelect = combo._child(
				`select[data-parent_value_id="${option.value}"]`
			);
			if (!childSelect) continue;
			if (option.value == select.value) {
				childSelect.classList.remove("hidden");
			} else {
				childSelect.classList.add("hidden");
			}
		}
		select.classList.toggle("empty", select.value == "");
	});

	var any_selected = false;
	combo._children("select").forEach((e) => {
		if (e.value !== "") {
			any_selected = true;
		}
	});
	combo.classList.toggle("any_selected", any_selected);

	if (options.onChange) {
		var attribute_id = +combo.getAttribute("data-attribute_id");

		options.onChange(combo, attribute_id, any_selected);
	}

	var attribute_values = combo._parent("[data-type]", "[attribute_values]");
	if (attribute_values) {
		attribute_values._dispatch_change();
	}
}

function createAttributeSelect(combo, options = {}) {
	if (!combo._is_empty()) {
		return;
	}
	attribute_options_html = "";

	attribute_options_htmls.forEach((data) => {
		if (
			!options.attribute_ids ||
			options.attribute_ids.indexOf(+data.attribute_id) !== -1
		) {
			attribute_options_html += data.html;
		}
	});

	combo.insertAdjacentHTML("afterbegin", attribute_options_html);
	combo
		._children("select:not(.combo-attribute-registered)")
		.forEach((select) => {
			select.classList.add("combo-attribute-registered");

			const changeCallback = () => {
				var wrapper = select._parent(".combo-select-wrapper");
				comboSelectValuesChanged(wrapper, options);

				if (select.value === "" && select.prev_value) {
					var sub_select = wrapper._child(
						`[data-parent_value_id="${select.prev_value}"]`
					);
					if (sub_select) {
						sub_select._set_value("");
					}
				}
				//console.log(select.prev_value);
				//select.prev_value = select.value;
			};
			select.addEventListener("change", changeCallback);

			changeCallback();
		});

	if (options.required) {
		combo._children(".combo-select-wrapper").forEach((e) => {
			var select = e._child("select");
			if (!select) {
				return;
			}
			select.setAttribute("data-validate", "");
			select.classList.add("warn-outline");
		});
	}

	if (options.use_all) {
		combo._children(".has_attribute").forEach((e) => {
			e._set_value(1);
		});
	}

	registerAnythingValues();
}

function anythingValueChanged(anything_wrapper) {
	var checkbox = anything_wrapper._child(`input[type="checkbox"]`);
	var input = anything_wrapper._child(`.field`);

	var any_selected = checkbox.checked;
	input.classList.toggle("hidden", !any_selected);

	anything_wrapper.classList.toggle("any_selected", any_selected);

	var attribute_values = anything_wrapper._parent(
		"[data-type]",
		"[attribute_values]"
	);
	if (attribute_values) {
		attribute_values._dispatch_change();
	}
}

function registerAnythingValues() {
	$$(".any-value-wrapper").forEach((anything_wrapper) => {
		var checkbox = anything_wrapper._child(
			`input[type="checkbox"]:not(.active-registered)`
		);
		if (!checkbox) return;
		checkbox.classList.add("active-registered");
		const changeCallback = () => {
			anythingValueChanged(anything_wrapper);
		};
		checkbox.addEventListener("change", changeCallback);

		var field = anything_wrapper._child(`.field`);
		if (field) {
			field.addEventListener("change", changeCallback);
		} else {
			console.error(anything_wrapper, "Missing .field");
		}

		changeCallback();
	});
}

domload(() => {
	// TODO: attribute intersection validation
	/*$$(`#variantForm [name="attributes"] .attribute-row`).forEach(e => {
      e.insertAdjacentHTML("beforeend", `
        <div class='case_common rect' style='background:#0001;color:#444'>Cechy wspólny</div>
        <div class='case_intersect rect' style='background:var(--error-clr)'>Cechy wspólny <i class='fas fa-info-circle' data-tooltip='Cechy wspólny zostanie usunięty po zapisaniu wariantu'></i></div>
      `);
    });*/

	loadCategoryPicker(
		"product_categories",
		{
			skip: 2,
		},
		() => {
			var form = "#productForm";
			setFormData(
				{
					categories: product_categories,
				},
				form
			);
			setFormInitialState(form);
		}
	);

	createSimpleList({
		name: "gallery",
		fields: {
			src: {
				unique: true,
			},
		},
		render: (data) => {
			return /*html*/ `
            <div class='select-image-wrapper' style="display: flex;align-items: center">
              <img name="src" data-height='1w' style="object-fit:contain;width:120px;display: block;margin-right:10px;">
              <button class="btn primary add_img_btn" onclick="fileManager.open(this._prev(),{asset_types: ['image']})"> <span>Wybierz</span> <i class="fas fa-image"></i></button>
            </div>
          `;
		},
		onChange: (values, list) => {
			var rowIndex = -1;
			list.wrapper._children(".simple-list-row-wrapper").forEach((row) => {
				rowIndex++;
				if (rowIndex === 0) {
					row.style.backgroundColor = "#eee";

					if (!row._child(".main-img")) {
						row
							._child(".select-image-wrapper")
							.insertAdjacentHTML(
								"beforeend",
								/*html*/ `<span class="main-img rect" data-tooltip="Wyświetlane przy wyszukiwaniu produktów" style="font-weight: 600;margin-left: 10px;color: #0008;background: #0001;"> Zdjęcie główne <i class="fas fa-eye"></i> </span>`
							);
					}
				} else {
					row.style.backgroundColor = "";
					const mn = row._child(".main-img");
					if (mn) {
						mn.remove();
					}
				}

				var img = row._child("img");
				row
					._child(".add_img_btn span")
					._set_content(img._get_value() ? "Zmień" : "Wybierz");
			});
			lazyLoadImages();
		},
		onNewRowDataSet: (row, values, list, options) => {
			if (options.user) {
				row._child(".add_img_btn").dispatchEvent(new Event("click"));
				setCustomHeights();
			}
		},
		default_row: {
			src: "",
		},
		title: "Galeria zdjęć produktu",
	});

	createVariantFiltersSimpleList($(`[name="variant_filters"]`), {
		title: "Pola wyboru wariantu produktu",
		onChange: (data, list, row) => {},
	});

	createSimpleList({
		name: "variants",
		fields: {
			variant_id: {},
			name: {
				unique: true,
				allow_empty: true,
			},
			price: {},
			vat: {},
			gross_price: {},
			rabat: {},
			stock: {},
			zdjecie: {},
		},
		table: true,
		header: /*html*/ `
      <th>Nazwa <i class="fas fa-info-circle" data-tooltip="Nazwa wariantu wyświetlana w koszyku, np.:<br>Nazwa produktu: Etui iPhone X<br>Nazwa wariantu: <span style='text-decoration:underline'>Zielone</span>"></i></th>
      <th>Cechy</th>
      <th>Aktywny</th>
      <th>Zdjęcie</th>
      <th>Cena Netto</th>
      <th>VAT</th>
      <th>Cena Brutto</th>
      <th>Rabat</th>
      <th>Kod produktu</th>
      <th>W magazynie</th>
      <th></th>
      <th></th>
    `,
		render: (data) => {
			return /*html*/ `
        <td>
          <input type='hidden' data-number name="variant_id">
          <textarea name="name" class="field inline" style="height: 3.75em;"></textarea>
        </td>
        <td>
          <input type='hidden' name="attributes" onchange="displayAttributesPreview($(this)._next(), this.value)">
          <div data-tooltip class='clamp-lines clamp-4'></div>
        </td>
        <td>
          <input type='hidden' name="published" onchange='$(this)._next()._set_content(renderIsPublished({published:this._get_value()}))'>
          <span></span>
        </td>
        <td>
          <img name="zdjecie" style="width:80px;height:80px;object-fit:contain"/>
        </td>
        <td>
          <div class='glue-children'>
            <input type='number' name="price" class="field inline no-wrap"><span class='field-description'>zł</span>
          </div>
        </td>
        <td>
          <div class='glue-children'>
            <input type='number' name="vat" class="field inline no-wrap"><span class='field-description'>%</span>
          </div>
        </td>
        <td>
          <div class='glue-children'>
            <input type='number' name="gross_price" class="field inline no-wrap"><span class='field-description'>zł</span>
          </div>
        </td>
        <td>
          <div class='glue-children'>
            <input type='number' name="rabat" class="field inline no-wrap"><span class='field-description'>zł</span>
          </div>
        </td>
        <td>
          <input type='text' name="product_code" class="field inline" style="width: 150px;">
        </td>
        <td>
          <div class='glue-children'>
            <input type='number' name="stock" class="field inline no-wrap"><span class='field-description'>szt.</span>
          </div>
          <input type='hidden' name="was_stock">
        </td>
        <td style="width:90px;">
          <button class='btn primary edit-btn' onclick='editVariant($(this)._parent()._parent(), this)'>Edytuj <i class="fas fa-cog"></i></button>
        </td>
      `;
		},
		default_row: {
			variant_id: -1,
			name: "",
			price: 0,
			vat: 0,
			rabat: 0,
			stock: 0,
			was_stock: 0,
			product_code: "",
			zdjecie: "",
			published: 0,
			attributes: '{"selected:"[],"values:"[]"}',
		},
		title: "Warianty produktu",
		empty: `<div class='rect light-gray'>Dodaj min. 1 wariant</div>`,
		onChange: () => {},
		onNewRowDataSet: (row, values, list, options) => {
			if (options.user) {
				editVariant(row, list.wrapper._child(".field-title .add_btn"));
			}
		},
	});

	createAttributeSelect($(`#variantForm [name="attributes"]`));

	createAttributeSelect($(`#productForm [name="attributes"]`), {
		onChange: (combo, attribute_id, any_selected) => {
			variant_combo = $(`#variantForm [data-attribute_id="${attribute_id}"]`);
			if (variant_combo) {
				variant_combo.classList.toggle("common", any_selected);
			}
		},
	});

	registerAnythingValues();

	var variants_data = [];
	product_data.variants.forEach((e) => {
		e.was_stock = e.stock;
		variants_data.push(e);
	});
	product_data.variants = variants_data;

	setFormData(product_data, "#productForm");
});

function fillVariantsFromFilters() {
	var variant_filters = $(`[name="variant_filters"]`).list.values;

	var unique_variants = getVariantFiltersUniqueOptions(variant_filters);

	var pretty_unique_variants = unique_variants.map((selected_attributes) => {
		return {
			selected: selected_attributes.reduce((map, obj) => {
				map.push(...obj.selected);
				return map;
			}, []),
			values: selected_attributes.reduce((map, obj) => {
				map.push(...obj.values);
				return map;
			}, []),
		};
	});

	var variant_list = $(`[name="variants"]`).list;

	pretty_unique_variants.forEach((unique_variant_attributes) => {
		var exists = false;

		var exists = variant_list.values.reduce((map, variant) => {
			if (map) {
				return true;
			}
			var va = JSON.parse(variant.attributes);
			return (
				isEquivalent(unique_variant_attributes.selected, va.selected) &&
				isEquivalent(unique_variant_attributes.values, va.values)
			);
		}, false);

		if (!exists) {
			variant_data = variant_list.params.default_row;
			// just in case u go away from json baby :*
			/*Object.assign(
        variant_data.attributes,
        unique_variant_attributes
      );*/
			variant_data.attributes = JSON.stringify(unique_variant_attributes);
			variant_list.insertRow(variant_data);
		}
	});
}

function getVariantFiltersUniqueOptions(variant_filters) {
	var all_unique_variants = [];

	variant_filters.forEach((variant_filter) => {
		if (all_unique_variants.length == 0) {
			all_unique_variants.push([]);
		}

		var new_unique_variants = [];

		variant_filter.filter_options.forEach((filter_option) => {
			var option_unique_variants = getVariantFiltersUniqueOptions(
				filter_option.variant_filters
			);

			if (option_unique_variants.length == 0) {
				option_unique_variants.push([]);
			}

			option_unique_variants.forEach((option_selected_attribute_values) => {
				all_unique_variants.forEach((all_selected_attribute_values) => {
					new_unique_variants.push([
						...option_selected_attribute_values,
						...all_selected_attribute_values,
						filter_option.selected_attribute_values,
					]);
				});
			});
		});
		all_unique_variants = new_unique_variants;
	});
	return all_unique_variants;
}

function choiceNameChanged(input) {
	input = $(input);
	var sub_filter = input._parent(`.sub_filter`);

	var add_buttons = sub_filter._child(`.add_buttons`);

	if (add_buttons) {
		var add_begin = add_buttons._child(".add_begin");
		if (add_begin) {
			add_begin.setAttribute(
				"data-tooltip",
				`Dodaj opcję do pola wyboru <span class='semi-bold'>${input.value.toLowerCase()}</span> na początku`
			);
			add_buttons
				._child(".add_end")
				.setAttribute(
					"data-tooltip",
					`Dodaj opcję do pola wyboru <span class='semi-bold'>${input.value.toLowerCase()}</span> na końcu`
				);
		}
	}
}

function optionNameChanged(input) {
	input = $(input);
	var sub_filter = input._parent(`.sub_filter`);

	var add_buttons = sub_filter._child(`.add_buttons`);

	if (add_buttons) {
		var add_begin = add_buttons._child(".add_begin");
		if (add_begin) {
			add_begin.setAttribute(
				"data-tooltip",
				`Dodaj pole wyboru do opcji <span class='semi-bold'>${input.value.toLowerCase()}</span> na początku`
			);
			add_buttons
				._child(".add_end")
				.setAttribute(
					"data-tooltip",
					`Dodaj pole wyboru do opcji <span class='semi-bold'>${input.value.toLowerCase()}</span> na końcu`
				);
		}
	}

	add_additional_filters = sub_filter._child(".add_additional_filters");
	if (add_additional_filters) {
		add_additional_filters.setAttribute(
			"data-tooltip",
			`Zastosuj jeśli dodatkowe opcje mają tyczyć się tylko wariantu ${input.value.toLowerCase()}`
		);
	}
}

function choiceAttributeChanged(select) {
	select = $(select);
	var sub_filter = select._parent(`.sub_filter`);
	var filter_name = sub_filter._child(`[name="filter_name"]`);
	filter_name._set_value(
		select.value == -1 ? "" : getSelectDisplayValue(select)
	);
}

function choiceValuesChanged(values_combo) {
	values_combo = $(values_combo);
	var whole_value = "";

	var attribute_value_node = values_combo._child(`.attribute_value`);
	if (attribute_value_node) {
		whole_value = attribute_value_node._get_value();
	} else {
		values_combo._children("select").forEach((e) => {
			if (e.value && !e.classList.contains("hidden")) {
				whole_value += attribute_values[e.value].value + " ";
			}
		});
	}
	whole_value = whole_value.trim();

	if (whole_value) {
		var sub_filter = values_combo._parent(`.sub_filter`);
		var value_field = sub_filter._child(`[name="value"]`);
		value_field._set_value(whole_value);
	}
}

function choiceListChanged(attribute_row_wrapper) {
	var select = attribute_row_wrapper._child(`[name="attribute_id"]`);
	if (!select) {
		return;
	}

	const attribute_id = +select.value;

	var list = attribute_row_wrapper._child(`[name="filter_options"] .list`);
	if (!list) {
		return;
	}

	list._direct_children().forEach((value_list_wrapper) => {
		var selected_attribute_values = value_list_wrapper._child(
			`[name='selected_attribute_values']`
		);

		if (
			selected_attribute_values._child(`[data-attribute_id="${attribute_id}"]`)
		) {
			// nothing to create
			return;
		}

		selected_attribute_values._empty();

		select_value_wrapper = value_list_wrapper._child(`.select_value_wrapper`);
		if (select_value_wrapper) {
			select_value_wrapper.classList.toggle("hidden", attribute_id == -1);
		}

		createAttributeSelect(selected_attribute_values, {
			attribute_ids: [+attribute_id],
			onChange: (combo, attribute_id, any_selected) => {},
			required: true,
			use_all: true,
		});

		//registerDatepickers();
	});
}

function createVariantFiltersSimpleList(node, options = {}) {
	createSimpleList({
		wrapper: node,
		fields: {
			filter_name: {
				unique: true,
			},
			attribute_id: {},
		},
		render: (data) => {
			return /*html*/ `
          <div class='sub_filter filter_wrapper'>
            <div style='margin-right:6px' class="inline">
              <div class='fancy-label label-filters'>
                <i class="fas fa-th-large"></i>
                <input type="text" class="field inline no-wrap semi-bold white" name="filter_name" placeholder="Nazwa pola wyboru" data-tooltip="Wpisz nazwę pola wyboru<br>Np.: <span class='semi-bold'>kolor</span>" data-tooltip-position="center" onchange="choiceNameChanged(this)">
              </div>
              Cecha
              <select class="field inline no-wrap" name="attribute_id" onchange="choiceAttributeChanged(this)" data-tooltip="W tym miejscu możesz:<br>1. Wybrać cechę z listy wcześniej przygotowanej w zakładce › Produkty › Cechy<br>2. Wybrać pole niestandardowe (gdy cecha opisuje tylko dany produkt)">
                ${attribute_select_options}
                <option value='-1'>⋆ Pole niestandardowe ⋆</option>
              </select>
            </div>
            <div class='indent'>
              <div>
                <button class='btn transparent expand_arrow open' onclick='expandMenu($(this)._parent()._next(),$(this)._parent())'><i class='fas fa-chevron-right'></i></button>
                <span class='field-title inline indent_field_title'>
                  Lista opcji
                  <span class='option_count'></span>
                  <span class='add_buttons'></span>
                </span>
                <span style='margin-left:10px'>
                  <i class="fas fa-arrows-alt-h"></i>
                  <select name="style" class="field inline" data-tooltip='Szerokość "kafelek" opcji widocznych dla klienta'>
                    <option value="col1">100%</option>
                    <option value="col2">1/2</option>
                    <option value="col3">1/3</option>
                    <option value="col4">1/4</option>
                  </select>
                </span>
              </div>
              <div name="filter_options" class="expand_y" data-validate="|count:1+"></div>
            </div>
          </div>
        `;
		},
		default_row: {
			filter_name: "",
			attribute_id: -1,
		},
		onRowInserted: (row, values) => {
			createFilterOptionsSimpleList(row._child(`[name="filter_options"]`));

			// must be set first cause it's used to generate attribute pickers
			row._child(`[name="attribute_id"]`)._set_value(values.attribute_id);
		},

		onChange: (data, list, row) => {
			var options_wrapper = node._parent(".options_wrapper");
			if (options_wrapper) {
				options_wrapper.setAttribute("data-option-count", data.length);
			}
			if (options.onChange) {
				options.onChange(data, list);
			}

			if (row) {
				choiceListChanged(row);
			}
		},
	});
}

function createFilterOptionsSimpleList(node) {
	createSimpleList({
		wrapper: node,
		fields: {
			value: {},
		},
		render: (data) => {
			return /*html*/ `
          <div class='sub_filter options_wrapper'>
            <div class='fancy-label label-options'>
              <input type='text' name="value" class="field inline no-wrap semi-bold white" placeholder="Nazwa wariantu / Cecha" onchange="optionNameChanged(this)">
            </div>
            <div style='margin-right:6px' class="inline select_value_wrapper">
              Wartość:
              <div class='inline' name='selected_attribute_values' data-type="attribute_values" onchange="choiceValuesChanged(this)"></div>
            </div>
            <button class='btn secondary semi-bold add_additional_filters' onclick='this._next()._child(".add_begin").click()'>Dodatkowe pola wyboru <i class='fas fa-plus'></i></button>

            <div class='indent'>
              <div class='field-title indent_field_title'>
                Pola wyboru
                <span class='add_buttons'></span>
              </div>
              <div name="variant_filters"></div>
            </div>
          </div>
        `;
		},
		default_row: {
			value: "",
		},
		onRowInserted: (row, values) => {
			choiceListChanged(row._parent(".filter_wrapper")._parent());
			createVariantFiltersSimpleList(row._child(`[name="variant_filters"]`));
		},
		onChange: (data, list, row) => {
			var filter_wrapper = node._parent(".filter_wrapper");
			if (filter_wrapper) {
				filter_wrapper._child(".option_count")._set_content(`(${data.length})`);
			}
		},
	});

	var filter_wrapper = node._parent(".filter_wrapper");
	var add_buttons = filter_wrapper._child(".add_buttons");
	if (add_buttons) {
		var expandList = () => {
			expand_arrow = filter_wrapper._child(".expand_arrow");
			if (!expand_arrow.classList.contains("open")) {
				expand_arrow.click();
			}
		};
		add_buttons._child(".add_begin").addEventListener("click", expandList);
		add_buttons._child(".add_end").addEventListener("click", expandList);
	}
}

windowload(() => {
	fileManager.setDefaultName($('[name="title"]').value);
});

function displayAttributesPreview(target, data) {
	var output = "";
	try {
		var attributes = JSON.parse(data);
		attributes.selected.forEach((attribute_id) => {
			output += attribute_values[+attribute_id].value + "<br>";
		});
		attributes.values.forEach((attribute) => {
			output += attribute.value + "<br>";
		});
	} catch {}

	target._set_content(output);
}

function copyMainImage(node) {
	node.setAttribute("src", $("#img-main").getAttribute("src"));
}

function editPage() {
	fileManager.setDefaultName($('[name="title"]').value);
	editCMS($('[name="description"]'));
}

var variantRow = null;

function editVariant(row, btn = null) {
	variantRow = $(row);

	var data = getFormData(row);

	var form = $(`#variantForm`);
	setFormData(data, form);

	showModal(form.id, {
		source: btn,
	});
}

function saveVariant(remove = false) {
	if (remove) {
		variantRow.remove();
	}

	var data = getFormData($(`#variantForm`));
	data.attributes = JSON.stringify(data.attributes);

	setFormData(data, variantRow, {
		find_by: "name",
	});

	lazyLoadImages();
}

function deleteProduct() {
	setFormInitialState(`#productForm`);
	if (confirm("Czy chcesz usunąć produkt?")) {
		window.location = `${STATIC_URLS["ADMIN"]}delete_product/${product_id}`;
	}
}

function saveProduct() {
	var form = $(`#productForm`);

	if (!validateForm(form)) {
		return;
	}

	var params = {
		product_data: getFormData(form),
	};

	xhr({
		url: STATIC_URLS["ADMIN"] + "save_product",
		params: params,
		success: () => {
			// TODO: reload why?
			setFormInitialState(form);
		},
	});
}

function showPreview() {
	var form = $(`#productForm`);

	if (!validateForm(form)) {
		return;
	}

	var data = getFormData(form);
	data.cache_thumbnail = "";
	try {
		data.cache_thumbnail = JSON.parse(data.gallery)[0].src;
	} catch {}
	data.cache_rating_count = Math.floor(5 + 100 * Math.random());
	data.cache_avg_rating = 5;
	data.price_min = 0;
	data.price_max = 10000000; // really doesnt matter what u set, it's used for seo later though

	window.preview.open(getProductLink(data.product_id, data.link), data);
}
