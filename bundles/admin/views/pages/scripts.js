/* js[view] */

domload(() => {
	let current_view = def(localStorage.getItem("search_pages_view"), "pages");

	/** @type {DatatableComp} */
	// @ts-ignore
	const pages_dt = $("datatable-comp.pages");

	const templates_map = {
		name: "template",
		getMap: () => {
			return [{ val: -1, label: "Brak - Pusta strona" }, ...templates.map((t) => ({ val: t.template_id, label: t.name }))];
		},
	};

	quickTimeout(
		() => {
			DatatableComp(pages_dt, undefined, {
				search_url: STATIC_URLS["ADMIN"] + "/page/search_pages",
				columns: [
					{ label: "Link", key: "url", width: "1", searchable: "string" },
					{ label: "Tytuł", key: "seo_title", width: "1", searchable: "string" },
					{ label: "Opis", key: "seo_description", width: "1", searchable: "string" },
					{ label: "Data utworzenia", key: "created_at", width: "1", searchable: "date", sortable: true },
					{ label: "Szablon", key: "template_id", width: "1", searchable: "select", map_name: "template" },
					{
						label: "Akcja",
						key: "",
						width: "100px",
						render: (data) => {
							return html`<a class="btn subtle small" href="${STATIC_URLS["ADMIN"]}/strona?nr_strony=${data.page_id}">
								Edytuj <i class="fas fa-cog"></i>
							</a>`;
						},
					},
				],
				maps: [templates_map],
				primary_key: "page_id",
				empty_html: html`Brak stron`,
				save_state_name: "admin_pages_search_pages",
			});
		},
		current_view == "pages" ? 0 : 400
	);

	/** @type {DatatableComp} */
	// @ts-ignore
	const general_products_dt = $("datatable-comp.general_products");

	quickTimeout(
		() => {
			DatatableComp(general_products_dt, undefined, {
				search_url: STATIC_URLS["ADMIN"] + "/page/search_general_products",
				columns: [
					{ label: "Produkt", key: "name", width: "1", searchable: "string" },
					{ label: "Tytuł", key: "seo_title", width: "1", searchable: "string" },
					{ label: "Opis", key: "seo_description", width: "1", searchable: "string" },
					{ label: "Data utworzenia", key: "created_at", width: "1", searchable: "date", sortable: true },
					{ label: "Szablon", key: "template_id", width: "1", searchable: "select", map_name: "template" },
					{
						label: "Akcja",
						key: "",
						width: "100px",
						render: (data) => {
							return html`<a class="btn subtle small" href="${STATIC_URLS["ADMIN"]}/strona?nr_strony=${data.page_id}">
								Edytuj <i class="fas fa-cog"></i>
							</a>`;
						},
					},
				],
				maps: [templates_map],
				primary_key: "page_id",
				empty_html: html`Brak stron`,
				save_state_name: "admin_pages_search_general_products",
			});
		},
		current_view == "general_products" ? 0 : 400
	);

	/** @type {DatatableComp} */
	// @ts-ignore
	const product_categories_dt = $("datatable-comp.product_categories");

	quickTimeout(
		() => {
			DatatableComp(product_categories_dt, undefined, {
				search_url: STATIC_URLS["ADMIN"] + "/page/search_product_categories",
				columns: [
					{
						label: "Kategoria",
						key: "__category_path_names_csv",
						width: "1",
						searchable: "string",
						render: (data) => {
							return data.__category_path_names_csv.replace(/,/g, " ― ");
						},
					},
					{ label: "Tytuł", key: "seo_title", width: "1", searchable: "string" },
					{ label: "Opis", key: "seo_description", width: "1", searchable: "string" },
					{ label: "Data utworzenia", key: "created_at", width: "1", searchable: "date", sortable: true },
					{ label: "Szablon", key: "template_id", width: "1", searchable: "select", map_name: "template" },
					{
						label: "Akcja",
						key: "",
						width: "100px",
						render: (data) => {
							return html`<a class="btn subtle small" href="${STATIC_URLS["ADMIN"]}/strona?nr_strony=${data.page_id}">
								Edytuj <i class="fas fa-cog"></i>
							</a>`;
						},
					},
				],
				maps: [templates_map],
				primary_key: "page_id",
				empty_html: html`Brak stron`,
				save_state_name: "admin_pages_search_product_categories",
			});
		},
		current_view == "product_categories" ? 0 : 400
	);

	const toggle_view = $(".pages_view_header .toggle_view");
	toggle_view.addEventListener("change", () => {
		current_view = toggle_view._get_value();
		localStorage.setItem("search_pages_view", current_view);
		pages_dt.classList.toggle("hidden", current_view !== "pages");
		general_products_dt.classList.toggle("hidden", current_view !== "general_products");
		product_categories_dt.classList.toggle("hidden", current_view !== "product_categories");
	});
	toggle_view._set_value(current_view);
});
