/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.shop_orders");

	datatableComp(datatable_comp, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "/shop_order/search",
		columns: [
			{ label: "Nr", key: "shop_order_id", width: "100px", sortable: true, searchable: "string" },
			{ label: "Klient", key: "display_address_name", width: "1", sortable: true, searchable: "string" },
			{
				label: "Produkty",
				key: "ordered_products",
				width: "2",
				render: (data) => {
					if (data.ordered_products) {
						try {
							const op = JSON.parse(data.ordered_products);
							if (op.length === 1 && op[0].qty === null) {
								return "";
							}
							return op.map((e) => html`<span class="semi_bold">${e.qty ? e.qty + " × " : ""}</span> ${e.name}`).join("<br>");
						} catch {}
					}
				},
			},
			//{ label: "Nr referencyjny", key: "reference", width: "1", sortable: true, searchable: "string" },
			{
				label: "Wartość",
				key: "total_price",
				width: "140px",
				sortable: true,
				searchable: "number",
				render: (data) => {
					return html`${data.total_price} zł`;
				},
			},
			{
				label: "Dostawa",
				key: "delivery_type_id",
				map_name: "delivery_type",
				width: "140px",
				searchable: "select",
			},

			{
				label: "Status",
				key: "status_id",
				width: "200px",
				searchable: "select",
				map_name: "order_status",
				select_overlay: (val, data) => {
					const order_status = order_statuses.find((e) => e.order_status_id === data.status_id);
					if (order_status) {
						return html`<div class="status_rect" style="background:${order_status.bckg_clr};color:${order_status.font_clr}">${val}</div>`;
					}
				},
				flex: true,
				editable: "select",
				editable_callback: (data) => {
					xhr({
						url: STATIC_URLS["ADMIN"] + "/shop_order/save",
						params: {
							shop_order: {
								shop_order_id: data.shop_order_id,
								status: data.status_id,
							},
						},
						success: (res) => {
							showNotification(
								html`<div class="header">Zamówienie #${data.shop_order_id}</div>
									<div class="center">Status: ${order_statuses.find((e) => e.order_status_id === data.status_id).name}</div>`
							);
							datatable_comp._backend_search();
						},
					});
				},
			},
			{ label: "Złożono", key: "ordered_at", width: "135px", sortable: true, searchable: "date" },
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
			{
				name: "delivery_type",
				getMap: () => {
					const map = delivery_types.map((d) => {
						const obj = {
							val: d.delivery_type_id,
							label: d.name,
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
		save_state_name: "admin_shop_orders",
	});

	datatable_comp.addEventListener("click", (ev) => {
		const target = $(ev.target);
		const preview_url = target._parent(`[data-preview_url]`, { skip: 0 });
		if (preview_url) {
			previewUrl(preview_url.dataset.preview_url);
		}
	});
});
