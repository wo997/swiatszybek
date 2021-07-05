/* js[view] */
domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.expenses");

	DatatableComp(datatable_comp, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "/transaction/search",
		getRequestParams: () => {
			return {
				is_expense: 1,
			};
		},
		columns: [
			{ label: "Sprzedawca", key: "seller_display_name", width: "1", searchable: "string" },
			{ label: "NIP", key: "seller_nip", width: "1", searchable: "string" },
			{ label: "Cena brutto", key: "gross_price", width: "1", searchable: "string" },
			{ label: "Data transakcji", key: "created_at", width: "1", searchable: "date", render: renderDatetimeDefault },
		],
		primary_key: "stock_product_id",
		empty_html: html`Brak wydatków`,
		label: "Wydatki",
		after_label: html`<button class="btn primary add_sale_btn">
			Dodaj zakup
			<i class="fas fa-plus"></i>
		</button>`,
		save_state_name: "admin_sales",
	});

	datatable_comp.addEventListener("click", (ev) => {
		const target = $(ev.target);

		const add_sale_btn = target._parent(".add_sale_btn");
		if (add_sale_btn) {
			getTransactionModal()._show({ source: add_sale_btn });
		}
	});
});
