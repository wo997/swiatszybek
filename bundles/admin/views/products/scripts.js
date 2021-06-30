/* js[view] */

domload(() => {
	/** @type {number[]} */
	let current_categories = [];
	let current_view = "general_products";

	try {
		const search_products_categories = localStorage.getItem("search_products_categories");
		const search_products_now = localStorage.getItem("search_products_now");

		if (search_products_now) {
			if (Date.now() - numberFromStr(search_products_now) < 1000 * 60 * 3) {
				if (search_products_categories) {
					current_categories = JSON.parse(search_products_categories);
				}
			}
		}
	} catch (e) {
		console.error(e);
	}

	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable = $("datatable-comp.general_products");

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

	DatatableComp(datatable, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "/general_product/search",
		columns: [
			{
				label: "Zdjęcie",
				width: "65px",
				key: "img_url",
				render: (value) =>
					html`<img data-src="${value}" class="wo997_img" style="width:48px;margin:-4px 0;height:48px;object-fit:contain" />`,
				flex: true,
			},
			{ label: "Produkt", key: "name", width: "1", sortable: true, searchable: "string" },
			{
				label: "Aktywny",
				key: "active",
				db_key: "gp.active",
				width: "1",
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
							datatable._backend_search();
						},
					});
				},
			},
			{ label: "W magazynie", key: "stock_all", width: "1", sortable: true, searchable: "number" },
			{
				label: "Akcja",
				key: "",
				width: "100px",
				render: (value, data) => {
					return html`<a class="btn subtle small" href="${STATIC_URLS["ADMIN"] + "/produkt/" + data.general_product_id}">
						Edytuj <i class="fas fa-cog"></i>
					</a>`;
				},
			},
		],
		primary_key: "general_product_id",
		label: "Produkty w sklepie",
		after_label: html`
			<button class="btn subtle show_categories" data-tooltip="html"></button>
			<span class="semi_bold what_categories_label"></span>
		`,
		empty_html: html`Brak produktów`,
		selectable: true,
		save_state_name: "admin_general_products",
		getRequestParams: () => ({
			category_ids: getCategoriesParam(),
		}),
	});

	// /** @type {DatatableComp} */
	// // @ts-ignore
	// const products_dt = $("datatable-comp.products");

	// quickTimeout(
	// 	() => {
	// 		DatatableComp(products_dt, undefined, {
	// 			search_url: STATIC_URLS["ADMIN"] + "/product/search",
	// 			columns: [
	// 				{
	// 					label: "Zdjęcie",
	// 					width: "65px",
	// 					key: "img_url",
	// 					render: (value) =>
	// 						html`<img
	// 							data-src="${value}"
	// 							class="product_img wo997_img"
	// 							style="width:48px;margin:-4px 0;height:48px;object-fit:contain;"
	// 						/>`,
	// 					flex: true,
	// 				},
	// 				{ label: "Produkt", key: "product_name", db_key: "p.__name", width: "1", sortable: true, searchable: "string" },
	// 				{
	// 					label: "W magazynie",
	// 					key: "stock",
	// 					width: "1",
	// 					sortable: true,
	// 					searchable: "number",
	// 					editable: "number",
	// 					editable_callback: (data) => {
	// 						xhr({
	// 							url: STATIC_URLS["ADMIN"] + "/product/save",
	// 							params: {
	// 								product: {
	// 									product_id: data.product_id,
	// 									stock: data.stock,
	// 								},
	// 							},
	// 							success: (res) => {
	// 								showNotification(`${data.product_name}: ${data.stock}szt.`, { type: "success", one_line: true });
	// 								products_dt._backend_search();
	// 							},
	// 						});
	// 					},
	// 				},
	// 				// {
	// 				// 	label: "Akcja",
	// 				// 	key: "",
	// 				// 	width: "100px",
	// 				// 	render: (value, data) => {
	// 				// 		return html`<a class="btn subtle small" href="${STATIC_URLS["ADMIN"] + "/produkt/" + data.general_product_id}">
	// 				// 			Edytuj <i class="fas fa-cog"></i>
	// 				// 		</a>`;
	// 				// 	},
	// 				// },
	// 			],
	// 			primary_key: "product_id",
	// 			empty_html: html`Brak produktów`,
	// 			selectable: true,
	// 			save_state_name: "admin_products",
	// 			getRequestParams: () => ({
	// 				category_ids: getCategoriesParam(),
	// 			}),
	// 		});
	// 	},
	// 	current_view == "products" ? 0 : 400
	// );

	const show_categories = datatable._child(".show_categories");

	/**
	 *
	 * @param {number[]} category_ids
	 */
	const setCategories = (category_ids) => {
		const chng = current_categories !== category_ids;
		if (chng) {
			current_categories = category_ids;
			localStorage.setItem("search_products_categories", JSON.stringify(current_categories));
			localStorage.setItem("search_products_now", Date.now() + "");
			datatable._backend_search();
		}

		const all = current_categories.length === 0;
		show_categories._set_content(
			html`<i class="fas fa-list-ul"></i> ` +
				(all
					? "Wszystkie kategorie"
					: product_categories
							.filter((c) => current_categories.includes(c.product_category_id))
							.map((c) => c.__category_path_names_csv.replace(/,/g, " ― "))
							.join(", "))
		);
	};
	setCategories(current_categories);

	show_categories.addEventListener("click", () => {
		getSelectProductCategoriesModal()._show(
			{
				category_ids: current_categories,
				close_callback: (category_ids) => {
					setCategories(category_ids);
				},
			},
			{ source: show_categories }
		);
	});
});
