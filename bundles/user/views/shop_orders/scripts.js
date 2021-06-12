/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.shop_orders");

	DatatableComp(datatable_comp, undefined, {
		search_url: STATIC_URLS["USER"] + "/shop_order/search",
		columns: [
			{ label: "Nr", key: "shop_order_id", width: "100px", mobile_label_before: "Nr: " },
			{
				label: "Produkty",
				key: "ordered_products",
				width: "2",
				render: (value) => {
					if (value) {
						try {
							const op = JSON.parse(value);
							if (op.length === 1 && op[0].qty === null) {
								return "";
							}
							return op.map((e) => html`<span class="semi_bold">${e.qty ? e.qty + " × " : ""}</span> ${e.name}`).join("<br>");
						} catch {}
					}
				},
			},
			{
				label: "Wartość",
				key: "total_price",
				width: "140px",
				mobile_label_before: "Wartość: ",
				render: (value) => {
					return html`${value} zł`;
				},
			},
			{
				label: "Status",
				key: "status_id",
				width: "200px",
				map_name: "order_status",
				render_map: (val, data) => {
					const order_status = order_statuses.find((e) => e.order_status_id === data.status_id);
					if (order_status) {
						return html`<div class="status_rect" style="background:${order_status.bckg_clr};color:${order_status.font_clr}">${val}</div>`;
					}
				},
				flex: true,
			},
			{
				label: "Złożono",
				mobile_label_before: "Data złożenia: ",
				key: "ordered_at",
				width: "108px",
				render: renderDatetimeDate,
			},
			{
				label: "Akcja",
				key: "stock",
				width: "140px",
				render: (value, data) => {
					//<a class="btn subtle small" href=""> Szczegóły (brak) <i class="fas fa-cog"></i> </a>
					return html`
						<a class="btn subtle small" href="/zamowienie/${data.shop_order_id}/${data.reference}">
							Szczegóły <i class="fas fa-chevron-right"></i>
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
		label: "Moje zamówienia",
		save_state_name: "user_shop_orders",
	});

	datatable_comp.addEventListener("click", (ev) => {
		const target = $(ev.target);
		const preview_url = target._parent(`[data-preview_url]`);
		if (preview_url) {
			previewUrl(preview_url.dataset.preview_url);
		}
	});
});
