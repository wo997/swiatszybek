/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.shop_orders");

	DatatableComp(datatable_comp, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "/shop_order/search",
		columns: [
			{ label: "Nr", key: "shop_order_id", width: "100px", sortable: true, searchable: "string" },
			{ label: "Klient", key: "display_address_name", width: "1", sortable: true, searchable: "string" },
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
			//{ label: "Nr referencyjny", key: "reference", width: "1", sortable: true, searchable: "string" },
			{
				label: "Wartość",
				key: "total_price",
				width: "140px",
				sortable: true,
				searchable: "number",
				render: renderPriceDefault,
			},
			{
				label: "Dostawa",
				key: "carrier_id",
				map_name: "carrier",
				width: "150px",
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
			{ label: "Złożono", key: "ordered_at", width: "135px", sortable: true, searchable: "date", render: renderDatetimeDefault },
			{
				label: "Akcja",
				key: "stock",
				width: "140px",
				render: (value, data) => {
					//<a class="btn subtle small" href=""> Szczegóły (brak) <i class="fas fa-cog"></i> </a>
					let action_html = "";
					action_html += html` <a
						class="btn subtle small"
						data-preview_url="/zamowienie/${data.shop_order_id}/${data.reference}"
						data-tooltip="Link dla klienta"
					>
						<i class="fas fa-eye"></i>
					</a>`;
					// can print delivery label
					if ([5, 2, 3, 4].includes(data.status_id)) {
						const carrier = carriers.find((c) => c.carrier_id === data.carrier_id);
						if (carrier) {
							if (carrier.api_key === "inpost") {
								action_html += html`
									<button
										class="btn subtle small print_label_btn"
										data-shop_order_id="${data.shop_order_id}"
										data-tooltip="Drukuj etykietę nadawczą"
									>
										<i class="fas fa-print"></i>
									</button>
								`;
							}
						}
					}

					// if (data.status_id === 6) {
					// 	action_html += html`
					// 		<button
					// 			class="btn subtle small refund_btn"
					// 			data-shop_order_id="${data.shop_order_id}"
					// 			data-tooltip="Zwróć pieniądze klientowi"
					// 		>
					// 			<i class="fas fa-hand-holding-usd"></i>
					// 		</button>
					// 	`;
					// }

					return action_html;
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
						return {
							val: d.delivery_type_id,
							label: d.name,
						};
					});
					return map;
				},
			},
			{
				name: "carrier",
				getMap: () => {
					const map = carriers.map((c) => {
						return {
							val: c.carrier_id,
							label: c.__full_name,
						};
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
		const preview_url = target._parent(`[data-preview_url]`);
		if (preview_url) {
			previewUrl(preview_url.dataset.preview_url);
		}

		const print_label_btn = target._parent(`.print_label_btn`);
		if (print_label_btn) {
			/** @type {DatatableRowComp} */
			// @ts-ignore
			const row = print_label_btn._parent(`datatable-row-comp`);
			showShippingLabelModal(row._data.row_data, { source: print_label_btn });
			// data-url="${STATIC_URLS["ADMIN"]}/carrier/inpost/print_label"
			// xhr({
			// 	url: print_label_btn.dataset.url,
			// 	params: {
			// 		shop_order_id: print_label_btn.dataset.shop_order_id,
			// 	},
			// 	success: (res) => {
			// 		console.log(res);
			// 	},
			// });
		}

		// const refund_btn = target._parent(`.refund_btn`);
		// if (refund_btn) {
		// 	console.log(refund_btn.dataset.shop_order_id);
		// }
	});

	let care_about_refresh = false;
	window.addEventListener("shipping_label_open", () => {
		care_about_refresh = true;
	});
	document.addEventListener("visibilitychange", () => {
		if (!document.hidden && care_about_refresh) {
			datatable_comp._backend_search();
			care_about_refresh = false;
		}
	});
});
