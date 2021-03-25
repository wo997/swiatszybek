/* js[view] */

domload(() => {
	/** @type {number[]} */
	let current_categories = JSON.parse(def(localStorage.getItem("search_products_categories"), "[]"));
	let current_view = def(localStorage.getItem("search_products_view"), "general_products");

	/** @type {DatatableComp} */
	// @ts-ignore
	const general_products = $("datatable-comp.general_products");

	const getCategoriesParam = () => {
		let ignore_cat_ids = [];
		current_categories.forEach((category_id) => {
			try {
				const cat_ids = JSON.parse(product_categories.find((c) => c.product_category_id === category_id).__category_path_json).map(
					(c) => c.id
				);
				let first = true;
				for (const cat_id of cat_ids.reverse()) {
					if (first) {
						first = false;
						continue;
					}
					ignore_cat_ids.push(cat_id);
				}
			} catch {}
		});

		// just lowest level
		return current_categories.filter((cid) => !ignore_cat_ids.includes(cid));
	};

	quickTimeout(
		() => {
			datatableComp(general_products, undefined, {
				search_url: STATIC_URLS["ADMIN"] + "/general_product/search",
				columns: [
					{
						label: "Zdjęcie",
						width: "65px",
						render: (data) =>
							html`<img data-src="${data.img_url}" class="product_img wo997_img" style="width:48px;margin:-4px 0;height:48px;" />`,
						flex: true,
					},
					{ label: "Produkt", key: "name", width: "1", sortable: true, searchable: "string" },
					{
						label: "Aktywny",
						key: "active",
						db_key: "gp.active",
						width: "1",
						sortable: true,
						searchable: "boolean",
						editable: "checkbox",
						editable_callback: (data) => {
							xhr({
								url: STATIC_URLS["ADMIN"] + "/general_product/save",
								params: {
									general_product: {
										general_product_id: data.general_product_id,
										active: data.active,
									},
								},
								success: (res) => {
									showNotification(`${data.name}: ${data.active ? "aktywny" : "nieaktywny"}`, { type: "success", one_line: true });
									general_products._backend_search();
								},
							});
						},
					},
					{ label: "W magazynie", key: "stock_all", width: "1", sortable: true, searchable: "number" },
					{
						label: "Akcja",
						key: "",
						width: "100px",
						render: (data) => {
							return html`<a class="btn subtle small" href="${STATIC_URLS["ADMIN"] + "/produkt/" + data.general_product_id}">
								Edytuj <i class="fas fa-cog"></i>
							</a>`;
						},
					},
				],
				primary_key: "general_product_id",
				empty_html: html`Brak produktów`,
				selectable: true,
				save_state_name: "general_products",
				getRequestParams: () => ({
					category_ids: getCategoriesParam(),
				}),
			});
		},
		current_view == "general_products" ? 0 : 400
	);

	/** @type {DatatableComp} */
	// @ts-ignore
	const products = $("datatable-comp.products");

	quickTimeout(
		() => {
			datatableComp(products, undefined, {
				search_url: STATIC_URLS["ADMIN"] + "/product/search",
				columns: [
					{
						label: "Zdjęcie",
						width: "65px",
						render: (data) =>
							html`<img data-src="${data.img_url}" class="product_img wo997_img" style="width:48px;margin:-4px 0;height:48px;" />`,
						flex: true,
					},
					{ label: "Produkt", key: "product_name", db_key: "p.__name", width: "1", sortable: true, searchable: "string" },
					{
						label: "W magazynie",
						key: "stock",
						width: "1",
						sortable: true,
						searchable: "number",
						editable: "number",
						editable_callback: (data) => {
							xhr({
								url: STATIC_URLS["ADMIN"] + "/product/save",
								params: {
									product: {
										product_id: data.product_id,
										stock: data.stock,
									},
								},
								success: (res) => {
									showNotification(`${data.product_name}: ${data.stock}szt.`, { type: "success", one_line: true });
									products._backend_search();
								},
							});
						},
					},
					{
						label: "Akcja",
						key: "",
						width: "100px",
						render: (data) => {
							return html`<a class="btn subtle small" href="${STATIC_URLS["ADMIN"] + "/produkt/" + data.general_product_id}">
								Edytuj <i class="fas fa-cog"></i>
							</a>`;
						},
					},
				],
				primary_key: "product_id",
				empty_html: html`Brak produktów`,
				selectable: true,
				save_state_name: "products",
				getRequestParams: () => ({
					category_ids: getCategoriesParam(),
				}),
			});
		},
		current_view == "products" ? 0 : 400
	);

	const toggle_view = $(".products_view_header .toggle_view");
	toggle_view.addEventListener("change", () => {
		current_view = toggle_view._get_value();
		localStorage.setItem("search_products_view", current_view);
		general_products.classList.toggle("hidden", current_view !== "general_products");
		products.classList.toggle("hidden", current_view !== "products");
	});
	toggle_view._set_value(current_view);

	const unselect_categories_btn = $(".products_view_header_under .unselect_categories_btn");
	unselect_categories_btn.addEventListener("click", () => {
		setCategories([]);
	});
	const what_categories_label = $(".products_view_header_under .what_categories_label");

	/**
	 *
	 * @param {number[]} category_ids
	 */
	const setCategories = (category_ids) => {
		const chng = current_categories !== category_ids;
		if (chng) {
			current_categories = category_ids;
			localStorage.setItem("search_products_categories", JSON.stringify(current_categories));
			quickTimeout(
				() => {
					general_products._backend_search();
				},
				current_view == "general_products" ? 0 : 400
			);
			quickTimeout(
				() => {
					products._backend_search();
				},
				current_view == "products" ? 0 : 400
			);
		}

		const all = current_categories.length === 0;
		unselect_categories_btn.classList.toggle("hidden", all);
		what_categories_label._set_content(
			all
				? "Wszystkie produkty"
				: product_categories
						.filter((c) => current_categories.includes(c.product_category_id))
						.map((c) => c.name)
						.join(", ")
		);
	};
	setCategories(current_categories);

	const show_filters = $(".products_view_header_under .show_filters");
	show_filters.addEventListener("click", () => {
		getSelectProductCategoriesModal()._show(
			{
				category_ids: current_categories,
				close_callback: (category_ids) => {
					setCategories(category_ids);
				},
			},
			{ source: show_filters }
		);
	});
});
