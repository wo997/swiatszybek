/* js[view] */

domload(() => {
	let current_view = def(localStorage.getItem("search_products_view"), "general_products");

	/** @type {DatatableComp} */
	// @ts-ignore
	const general_products = $("datatable-comp.general_products");

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
					{ label: "Produkt", key: "name", width: "1", sortable: true, searchable: "string" },
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
									showNotification(`${data.name}: ${data.stock}szt.`, { type: "success", one_line: true });
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
});
