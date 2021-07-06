/* js[view] */
domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.sales");

	DatatableComp(datatable_comp, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "/transaction/search",
		getRequestParams: () => {
			return {
				is_expense: 0,
			};
		},
		columns: [
			{ label: "Nabywca", key: "buyer_display_name", width: "1", searchable: "string" },
			{ label: "NIP nabywcy", key: "buyer_nip", width: "1", searchable: "string" },
			{ label: "Wartość", key: "gross_price", width: "1", searchable: "number", render: renderPriceDefault },
			{
				label: "Produkty",
				key: "__products_search",
				width: "2",
				searchable: "string",
				simplify_search: true,
				render: (value, data) => {
					try {
						const products = JSON.parse(data.__products_json);
						if (products.length === 1 && products[0].qty === null) {
							return "";
						}
						return products.map((e) => html`<span class="semi_bold">${e.qty ? e.qty + " × " : ""}</span> ${e.name}`).join("<br>");
					} catch (e) {}
					return "";
				},
			},
			{ label: "Utworzono", key: "created_at", width: "1", searchable: "date", render: renderDatetimeDefault },
			{ label: "Opłacono", key: "paid_at", width: "1", searchable: "date", render: renderDatetimeDefault },
		],
		primary_key: "transaction_id",
		empty_html: html`Brak sprzedaży`,
		label: "Sprzedaż",
		after_label: html`<button class="btn primary add_sale_btn">
			Dodaj sprzedaż
			<i class="fas fa-plus"></i>
		</button>`,
		save_state_name: "admin_sales",
	});

	datatable_comp.addEventListener("click", (ev) => {
		const target = $(ev.target);

		const add_sale_btn = target._parent(".add_sale_btn");
		if (add_sale_btn) {
			getTransactionModal()._show(0, { source: add_sale_btn });
		}
	});

	window.addEventListener("transactions_changed", () => {
		datatable_comp._backend_search();
	});
});
