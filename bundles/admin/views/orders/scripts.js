/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.shop_orders");
	2;
	datatableComp(datatable_comp, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "/shop_order/search",
		columns: [
			{ label: "Nr zamówienia", key: "shop_order_id", width: "1", sortable: true, searchable: "string" },
			{ label: "Nr referencyjny", key: "reference", width: "1", sortable: true, searchable: "string" },
			{ label: "Wartość zamówienia", key: "total_price", width: "1", sortable: true, searchable: "string" },
			{
				label: "Akcja",
				key: "stock",
				width: "100px",
				render: (data) => {
					// return html`<a class="btn subtle small" href="${STATIC_URLS["ADMIN"] + "/order/" + data.shop_order_id}">
					// 	Szczegóły <i class="fas fa-cog"></i>
					// </a>`;
				},
			},
		],
		primary_key: "shop_order_id",
		empty_html: html`Brak zamówień`,
		label: "Zamówienia",
		selectable: true,
		save_state_name: "shop_orders",
	});
});
