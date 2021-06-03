/* js[view] */

domload(() => {
	let current_view = "pages";

	try {
		const search_pages_view = localStorage.getItem("search_pages_view");
		const search_pages_now = localStorage.getItem("search_pages_now");

		if (search_pages_now) {
			if (Date.now() - numberFromStr(search_pages_now) < 1000 * 60 * 3) {
				if (search_pages_view) {
					current_view = search_pages_view;
				}
			}
		}
	} catch (e) {
		console.error(e);
	}

	/** @type {DatatableComp} */
	// @ts-ignore
	const pages_dt = $("datatable-comp.pages");

	const templates_map = {
		name: "template",
		getMap: () => {
			return [{ val: -1, label: "Brak - Pusta strona" }, ...templates.map((t) => ({ val: t.template_id, label: t.name }))];
		},
	};

	/** @type {DatatableColumnDef[]} */
	const common_columns = [
		{ label: "Tytuł", key: "seo_title", width: "0.8", searchable: "string" },
		{ label: "Opis", key: "seo_description", width: "0.8", searchable: "string" },
		{ label: "Utworzono", key: "created_at", width: "0.6", searchable: "date", sortable: true },
		{ label: "Zmodyfikowano", key: "modified_at", width: "0.6", searchable: "date", sortable: true },
		{ label: "Szablon", key: "template_id", width: "0.6", searchable: "select", map_name: "template" },
	];

	quickTimeout(
		() => {
			DatatableComp(pages_dt, undefined, {
				search_url: STATIC_URLS["ADMIN"] + "/page/search_pages",
				columns: [
					{
						label: "Link",
						key: "url",
						width: "1",
						searchable: "string",
						render: (data) => {
							return `${location.host}${data.url ? "/" : ""}${data.url}`;
						},
					},
					{
						label: "Aktywna",
						key: "active",
						width: "0.5",
						searchable: "boolean",
						editable: "checkbox",
						editable_callback: (data) => {
							xhr({
								url: STATIC_URLS["ADMIN"] + "/page/save",
								params: {
									page: {
										page_id: data.page_id,
										active: data.active,
									},
								},
								success: (res) => {
									showNotification(`${data.url}: ${data.active ? "aktywna" : "nieaktywna"}`, { type: "success", one_line: true });
									pages_dt._backend_search();
								},
							});
						},
					},
					...common_columns,
					{
						label: "Akcja",
						key: "",
						width: "100px",
						render: (data) => {
							return html`
								<a class="btn subtle small" href="${STATIC_URLS["ADMIN"]}/strona?nr_strony=${data.page_id}" data-tooltip="Edytuj">
									<i class="fas fa-cog"></i>
								</a>
								<a class="btn subtle small" href="/${data.url}" target="_blank" data-tooltip="Otwórz">
									<i class="fas fa-external-link-alt"></i>
								</a>
							`;
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
					{
						label: "Aktywna",
						key: "active",
						width: "0.5",
						searchable: "boolean",
						editable: "checkbox",
						editable_callback: (data) => {
							xhr({
								url: STATIC_URLS["ADMIN"] + "/page/save",
								params: {
									page: {
										page_id: data.page_id,
										active: data.active,
									},
								},
								success: (res) => {
									showNotification(`${data.name}: ${data.active ? "aktywna" : "nieaktywna"}`, { type: "success", one_line: true });
									general_products_dt._backend_search();
								},
							});
						},
					},
					...common_columns,
					{
						label: "Akcja",
						key: "",
						width: "100px",
						render: (data) => {
							return html`
								<a class="btn subtle small" href="${STATIC_URLS["ADMIN"]}/strona?nr_strony=${data.page_id}" data-tooltip="Edytuj">
									<i class="fas fa-cog"></i>
								</a>
								<a class="btn subtle small" href="${data.__url}" target="_blank" data-tooltip="Otwórz">
									<i class="fas fa-external-link-alt"></i>
								</a>
							`;
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
					{
						label: "Aktywna",
						key: "active",
						width: "0.5",
						searchable: "boolean",
						editable: "checkbox",
						editable_callback: (data) => {
							xhr({
								url: STATIC_URLS["ADMIN"] + "/page/save",
								params: {
									page: {
										page_id: data.page_id,
										active: data.active,
									},
								},
								success: (res) => {
									showNotification(`${data.__category_path_names_csv.replace(/,/g, " ― ")}: ${data.active ? "aktywna" : "nieaktywna"}`, {
										type: "success",
										one_line: true,
									});
									product_categories_dt._backend_search();
								},
							});
						},
					},
					...common_columns,
					{
						label: "Akcja",
						key: "",
						width: "100px",
						render: (data) => {
							return html`
								<a class="btn subtle small" href="${STATIC_URLS["ADMIN"]}/strona?nr_strony=${data.page_id}" data-tooltip="Edytuj">
									<i class="fas fa-cog"></i>
								</a>
								<a class="btn subtle small" href="${data.__url}" target="_blank" data-tooltip="Otwórz">
									<i class="fas fa-external-link-alt"></i>
								</a>
							`;
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
		localStorage.setItem("search_pages_now", Date.now() + "");
		pages_dt.classList.toggle("hidden", current_view !== "pages");
		general_products_dt.classList.toggle("hidden", current_view !== "general_products");
		product_categories_dt.classList.toggle("hidden", current_view !== "product_categories");
	});
	toggle_view._set_value(current_view);
});
