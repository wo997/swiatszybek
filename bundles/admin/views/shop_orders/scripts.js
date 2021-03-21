/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.shop_orders");

	datatableComp(datatable_comp, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "/shop_order/search",
		columns: [
			{ label: "Nr", key: "shop_order_id", width: "1", sortable: true, searchable: "string" },
			{ label: "Klient", key: "__display_name", width: "1", sortable: true, searchable: "string" },
			{ label: "Nr referencyjny", key: "reference", width: "1", sortable: true, searchable: "string" },
			{ label: "Wartość", key: "total_price", width: "1", sortable: true, searchable: "string" },
			{ label: "Status", key: "status_id", width: "1", searchable: "select", map_name: "order_status" },
			{ label: "Utworzono", key: "ordered_at", width: "108px", sortable: true, searchable: "date" },
			{
				label: "Akcja",
				key: "stock",
				width: "140px",
				render: (data) => {
					//<a class="btn subtle small" href=""> Szczegóły (brak) <i class="fas fa-cog"></i> </a>
					return html`
						<a
							class="btn subtle small"
							data-preview_url="/zamowienie/${data.shop_order_id}/${data.reference}"
							data-tooltip="Link dla klienta"
						>
							<i class="fas fa-eye"></i>
						</a>
					`;
				},
			},
		],
		maps: [
			{
				name: "order_status",
				getMap: () => {
					const map = order_statuses.map((order) => {
						const obj = {
							val: order.order_status_id,
							label: order.name,
						};
						return obj;
					});
					return map;
				},
			},
		],
		primary_key: "shop_order_id",
		empty_html: html`Brak zamówień`,
		label: "Zamówienia",
		selectable: true,
		save_state_name: "shop_orders",
	});

	datatable_comp.addEventListener("click", (ev) => {
		const target = $(ev.target);
		const preview_url = target._parent(`[data-preview_url]`, { skip: 0 });
		if (preview_url) {
			previewUrl(preview_url.dataset.preview_url);
		}
	});
});

// company: ""
// delivery_id: -1
// email: "wojtekwo997@gmail.com"
// first_name: "Wojciech"
// last_name: "Piepka"
// party: "person"
// phone: "605107454"
// reference: "5E05JUN077CAFRH"
// shop_order_id: 18
// total_price: "62.00"
