/* js[view] */

useTool("cms");

document.addEventListener("DOMContentLoaded", function () {
	createDatatable({
		name: "mytable",
		url: STATIC_URLS["ADMIN"] + "search_product_categories",
		lang: {
			subject: "kategorii",
			main_category: ">",
		},
		primary: "category_id",
		db_table: "product_categories",
		sortable: true,
		tree_view: {
			form: "editCategory",
			loadCategoryForm: loadCategoryForm,
			formParams: {
				include_attributes: true,
			},
		},
		definition: [
			{
				title: "Kategoria",
				width: "10%",
				render: (r, i, t) => {
					return `
                            <div class="link text-plus-icon" onclick="${t.name}.showEditCategory(this,${i})" data-tooltip="Sortuj malejąco / rosnąco">
                                <span>${r.title}</span>
                                <i class="fa fa-cog"></i>
                            </div>
                        `;
				},
				escape: false,
			},
			{
				title: "Podkategorie",
				width: "13%",
				render: (r, i, t) => {
					return `
                            <div class="link text-plus-icon" onclick="${
															t.name
														}.openCategory(${i})" >
                                <span>${nonull(r.subcategories, "Brak")}</span>
                                <i class="fas fa-chevron-circle-right"></i>
                            </div>
                        `;
				},
				escape: false,
			},
			getPublishedDefinition(),
			{
				title: "link",
				width: "7%",
				render: (r) => {
					return `${r.link}`;
				},
			},
			{
				title: "Ikonka",
				width: "60px",
				render: (r) => {
					return `<img data-src="${r.icon}" class="wo997_img" style="max-width: 100%;max-height: 32px;display: block;">`;
				},
				escape: false,
			},
			{
				title: "Opis górny",
				width: "6%",
				render: (r) => {
					return r.description_text.replace(/\n/g, "");
				},
			},
			{
				title: "Zawartość (dół)",
				width: "6%",
				render: (r) => {
					return r.content_text.replace(/\n/g, "");
				},
			},
		],
		controlsRight: `
                    <div class='float-icon'>
                        <input type="text" placeholder="Filtruj..." data-param="search" class="field inline">
                        <i class="fas fa-search"></i>
                    </div>
                `,
		onSearch: () => {
			lazyLoadImages(false);
		},
	});

	createDatatable({
		name: "atrybuty",
		url: STATIC_URLS["ADMIN"] + "search_product_attributes",
		lang: {
			subject: "atrybutów",
		},
		primary: "attribute_id",
		db_table: "product_attributes",
		selectable: {
			data: [],
			output: "attributes",
			has_metadata: true,
		},
		definition: [
			{
				title: "Nazwa atrybutu",
				width: "25%",
				render: (r) => {
					return `${r.name}`;
				},
			},
			{
				title: "Typ danych",
				width: "20%",
				render: (r) => {
					return `${attribute_data_types[r.data_type].description}`;
				},
			},
			{
				title: "Wartości",
				width: "60%",
				render: (r) => {
					return `${nonull(r.attr_values).replace(/,/g, ", ")}`;
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

function loadCategoryForm(formId, data, isNew) {
	if (!data.name) data.name = "";

	var formElement = $(`#${formId}`);

	if (isNew) {
		data = {
			...data,
			title: "",
			link: "",
			published: "",
			icon: "",
			attributes: [],
			description: "",
			content: "",
			published: "0",
			category_id: "-1",
		};
	}

	setFormData(data, formElement);

	var canDelete = !data.subcategories;

	formElement.find(".caseCanDelete").classList.toggle("hidden", isNew);
	formElement.find(`.btn.red`).toggleAttribute("disabled", !canDelete);
	formElement.find(".btn.red + i").classList.toggle("hidden", canDelete);

	lazyLoadImages();
}

function saveCategoryForm(remove = false) {
	var f = $("#editCategory");
	if (!remove && !validateForm(f)) {
		return;
	}
	var params = getFormData(f);
	if (remove) {
		params["remove"] = true;
	}
	xhr({
		url: STATIC_URLS["ADMIN"] + "save_product_category",
		params: params,
		success: (res) => {
			mytable.postSaveCategory(params, remove);
			loadCategoryPicker("product_categories", {
				skip: 0,
			});
		},
	});
	hideModal(mytable.tree_view.form);
}

document.addEventListener("DOMContentLoaded", function () {
	loadCategoryPicker("product_categories", {
		skip: 0,
	});
});

function rewriteURL() {
	$(`[name="link"]`).setValue(escapeUrl($(`[name="title"]`).value));
}
