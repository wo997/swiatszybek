/* js[view] */

domload(() => {
	/** @type {number[]} */
	let current_categories = [];

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

	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable = $("datatable-comp.products");

	DatatableComp(datatable, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "/product/search",
		columns: [
			{
				label: "Zdjęcie",
				width: "65px",
				key: "__img_url",
				render: (value) =>
					html`<img data-src="${value}" class="product_img wo997_img" style="width:48px;margin:-4px 0;height:48px;object-fit:contain;" />`,
				flex: true,
			},
			{
				label: "Produkt w sklepie",
				key: "gp_name",
				width: "1",
				sortable: true,
				searchable: "string",
				render: (value, data) => {
					if (!data.general_product_id) {
						return "—";
					}
					return html`<a class="link" href="${STATIC_URLS["ADMIN"] + "/produkt/" + data.general_product_id}"> ${value} </a>`;
				},
			},
			{
				label: "Produkt",
				key: "__name",
				width: "1",
				sortable: true,
				searchable: "string",
				render: (value, data) => {
					return html`<a class="link edit_btn"> ${value} </a>`;
				},
			},
			// {
			// 	label: "W magazynie",
			// 	key: "stock",
			// 	width: "1",
			// 	sortable: true,
			// 	searchable: "number",
			// 	editable: "number",
			// 	editable_callback: (data) => {
			// 		xhr({
			// 			url: STATIC_URLS["ADMIN"] + "/product/save",
			// 			params: {
			// 				product: {
			// 					product_id: data.product_id,
			// 					stock: data.stock,
			// 				},
			// 			},
			// 			success: (res) => {
			// 				showNotification(`${data.product_name}: ${data.stock}szt.`, { type: "success", one_line: true });
			// 				datatable._backend_search();
			// 			},
			// 		});
			// 	},
			// },
			{
				label: "Akcja",
				key: "",
				width: "100px",
				render: () => {
					return html`<a class="btn subtle small edit_btn"> Edytuj <i class="fas fa-cog"></i> </a>`;
				},
			},
		],
		primary_key: "product_id",
		label: "Wszystkie produkty",
		after_label: html`
			<button class="btn subtle show_categories" data-tooltip="html"></button>
			<button class="btn primary add_product ml2">Dodaj produkt <i class="fas fa-plus"></i></button>
		`,
		empty_html: html`Brak produktów`,
		selectable: true,
		save_state_name: "admin_products",
		getRequestParams: () => ({
			category_ids: getCategoriesParam(),
		}),
	});

	datatable.addEventListener("click", (ev) => {
		const target = $(ev.target);

		const edit_btn = target._parent(".edit_btn");
		if (edit_btn) {
			/** @type {DatatableRowComp} */
			// @ts-ignore
			const dt_row = edit_btn._parent("datatable-row-comp");
			const data = dt_row._data.row_data;
			getProductModal()._show(
				{
					product_id: data.product_id,
					general_product_id: data.general_product_id,
					active: data.active,
					gross_price: data.gross_price,
					height: data.height,
					length: data.length,
					net_price: data.net_price,
					stock: data.stock,
					vat_id: data.vat_id,
					weight: data.weight,
					width: data.width,
					img_url: data.img_url,
					name: data.name,
					__img_url: data.__img_url,
					__name: data.__name,
					discount_price: data.discount_price,
					discount_untill: data.discount_untill,
				},
				{ source: edit_btn }
			);
		}
	});

	const add_product = datatable._child(".add_product");
	add_product.addEventListener("click", () => {
		getProductModal()._show(undefined, { source: add_product });
	});

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

	window.addEventListener("products_changed", () => {
		datatable._backend_search();
	});
});
