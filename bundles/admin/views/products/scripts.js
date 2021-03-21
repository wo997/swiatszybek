/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.products");

	datatableComp(datatable_comp, undefined, {
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
							datatable_comp._backend_search();
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
		primary_key: "general_product_id",
		empty_html: html`Brak produktów`,
		after_label: html`<a href="${STATIC_URLS["ADMIN"]}/produkt" class="btn primary"> Dodaj produkt <i class="fas fa-plus"></i> </a> `,
		selectable: true,
		save_state_name: "products",
	});

	datatable_comp._child(".datatable_label").insertAdjacentHTML(
		"afterend",
		html`
			<div class="radio_group boxes hide_checks semi_bold">
				<div class="checkbox_area box">
					<p-checkbox data-value="1"></p-checkbox>
					<span>
						<i class="fas fa-cubes"></i>
						Przęglądaj produkty
					</span>
				</div>
				<div class="checkbox_area box">
					<p-checkbox data-value="2"></p-checkbox>
					<span>
						<i class="fas fa-list-ol"></i>
						Zarządzaj magazynem
					</span>
				</div>
			</div>
		`
	);

	if (!datatable_comp._data.columns.find((e) => e.key === "stock_all")) {
		datatable_comp._data.columns.push({ label: "W magazynie", key: "stock_all", width: "1", sortable: true, searchable: "number" });
	}

	if (!datatable_comp._data.columns.find((e) => e.key === "stock")) {
		datatable_comp._data.columns.push({
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
						datatable_comp._backend_search();
					},
				});
			},
		});
	}
});
