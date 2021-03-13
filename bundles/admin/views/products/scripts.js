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
					html`<img data-src="${data.__img_url}" class="product_img wo997_img" style="width:48px;margin:-4px 0;height:48px;" />`,
				flex: true,
			},
			{ label: "Produkt", key: "name", width: "1", sortable: true, searchable: "string" },
			{ label: "Publiczny", key: "published", width: "1", sortable: true, searchable: "boolean" },
			{ label: "W magazynie", key: "stock", width: "1", sortable: true, searchable: "number" },
			{
				label: "Akcja",
				key: "stock",
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
		label: "Produkty",
		after_label: html`<a href="${STATIC_URLS["ADMIN"]}/produkt" class="btn primary"> Nowy produkt <i class="fas fa-plus"></i> </a> `,
		selectable: true,
		save_state_name: "products",
	});
});
