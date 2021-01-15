/* js[view] */

useTool("cms");

document.addEventListener("DOMContentLoaded", function () {
	var output = "";
	Object.entries(attribute_data_types).forEach(([value, attribute]) => {
		output += `<option value='${value}'>${attribute.description}</option>`;
	});
	$(`[name="data_type"]`).insertAdjacentHTML("afterbegin", output);

	createDatatable({
		name: "mytable",
		url: STATIC_URLS["ADMIN"] + "search_product_attributes",
		lang: {
			subject: "cech",
		},
		primary: "attribute_id",
		db_table: "product_attributes",
		sortable: true,
		definition: [
			{
				title: "Nazwa cechy",
				width: "20%",
				render: (r) => {
					return `${r.name}`;
				},
			},
			{
				title: "Typ danych",
				width: "20%",
				render: (r) => {
					var type_def = attribute_data_types[r.data_type];
					if (type_def) {
						return `${type_def.description}`;
					}
					return "";
				},
			},
			{
				title: "Wartości",
				width: "60%",
				render: (r) => {
					return `${def(r.attr_values).replace(/,/g, ", ")}`;
				},
			},
			{
				title: "",
				width: "97px",
				render: (r, i, t) => {
					return `
                            <div class="btn secondary" onclick="editAttribute(this,${i},${t.name})">Edytuj <i class="fa fa-cog"></i></div>
                        `;
				},
				escape: false,
			},
		],
		controlsRight: `
                    <div class='float-icon space-right'>
                        <input type="text" placeholder="Filtruj..." data-param="search" class="field inline">
                        <i class="fas fa-search"></i>
                    </div>
                    <div class="btn important" onclick="editAttribute(this)"><span>Cecha</span> <i class="fa fa-plus"></i></div>
                `,
	});

	createSimpleList({
		name: "attribute_values_textlist",
		fields: {
			value_id: {},
			value: {
				unique: true,
				allow_empty: true,
			},
		},
		render: (data) => {
			return `
                    <input type='hidden' name="value_id">
                    <input type='text' class='field' style='flex-grow:1' name="value">
                `;
		},
		default_row: {
			value_id: -1,
			value: "",
		},
		recursive: 3,
	});

	createSimpleList({
		name: "attribute_values_colorlist",
		fields: {
			value_id: {},
			value: {
				unique: true,
				allow_empty: true,
			},
			color: {},
		},
		render: (data) => {
			return `
                    <input type='hidden' name="value_id">
                    <input type='text' class='field inline jscolor' name="color">
                    <input type='text' class='field' style='flex-grow:1' name="value">
                `;
		},
		default_row: {
			value_id: -1,
			value: "",
			color: "",
		},
		onChange: () => {
			jscolor.installByClassName();
		},
		recursive: 3,
	});

	createDatatable({
		name: "kategorie",
		url: STATIC_URLS["ADMIN"] + "search_product_categories",
		lang: {
			subject: "kategorii",
		},
		primary: "category_id",
		db_table: "product_categories",
		selectable: {
			data: [],
			output: "categories",
			has_metadata: true,
		},
		definition: [
			{
				title: "Kategoria",
				render: (r) => {
					return `${r.title}`;
				},
			},
			{
				title:
					"Główny filtr <i class='fas fa-info-circle' data-tooltip='Wyświetl powyżej listy produktów'></i>",
				width: "130px",
				className: "metadata-column center",
				render: (r) => {
					return `
                            <label>
                                <input type='checkbox' data-metadata='main_filter'>
                                <div class="checkbox standalone"></div>
                            </label>`;
				},
				escape: false,
			},
		],
		controlsRight: `
                    <div class='float-icon'>
                        <input type="text" placeholder="Filtruj..." data-param="search" class="field inline">
                        <i class="fas fa-search"></i>
                    </div>
                `,
	});
});

function editAttribute(btn = null, row_id = null, table = null) {
	const form = $("#editAttribute");

	var data = {
		attribute_id: -1,
		name: "",
		data_type: Object.keys(attribute_data_types)[0],
		attr_values: "",
		categories: [],
	};

	Object.keys(attribute_data_types)
		.filter((data_type) => {
			return data_type.indexOf("list") != -1;
		})
		.forEach((data_type) => {
			simple_lists
				.filter((simple_list) => {
					return simple_list.params.name == `attribute_values_${data_type}`;
				})
				.forEach((simple_list) => {
					simple_list.setListValues([]);
				});
		});

	if (row_id !== null) {
		data = table.results[row_id];

		xhr({
			url: STATIC_URLS["ADMIN"] + "search_product_attributes",
			params: {
				attribute_id: data.attribute_id,
				rowCount: 1,
				everything: true,
			},
			success: (res) => {
				setFormData(res.results[0], form);
				setFormInitialState(form);
			},
		});
	}

	setFormData(data, form);
	showModal(form.id, {
		source: btn,
	});
}

function saveAttribute(remove = false) {
	var f = $("#editAttribute");
	if (!remove && !validateForm(f)) {
		return;
	}
	var params = getFormData(f);
	if (remove) {
		params["remove"] = true;
	}
	xhr({
		url: STATIC_URLS["ADMIN"] + "save_product_attribute",
		params: params,
		success: (res) => {
			mytable.search();
		},
	});
	hideModalTopMost();
}

function toggleValues() {
	var data_type = $(`[name="data_type"]`).value;
	Object.entries(attribute_data_types).forEach(([type, params]) => {
		if (params.field) {
			return;
		}
		var node = $(`.attribute_values_${type}_wrapper`);
		if (node) {
			node.classList.toggle("hidden", data_type != type);
		}
	});
}
