/* js[view] */
domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.stock_products");

	DatatableComp(datatable_comp, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "/stock_product/search",
		columns: [
			{ label: "Produkt", key: "__name", width: "1", searchable: "string" },
			{ label: "Cena netto", key: "net_price", width: "1", searchable: "string" },
			{ label: "VAT", key: "vat_id", width: "1", searchable: "string" },
			{ label: "Cena brutto", key: "gross_price", width: "1", searchable: "string" },
			{ label: "Data dostawy", key: "delivered_at", width: "1", searchable: "date", render: renderDatetimeDefault },
		],
		maps: [
			// {
			// 	name: "product",
			// 	getMap: () => {
			// 		return products.map((g) => ({ label: g.__name, val: g.product_id }));
			// 	},
			// },
		],
		primary_key: "stock_product_id",
		empty_html: html`Brak produktów`,
		label: "Produkty",
		after_label: html`<button class="btn primary add_delivery_btn">
			Dodaj dostawę
			<i class="fas fa-plus"></i>
		</button>`,
		save_state_name: "admin_stock_products",
	});

	datatable_comp.addEventListener("click", (ev) => {
		const target = $(ev.target);

		const add_delivery_btn = target._parent(".add_delivery_btn");
		if (add_delivery_btn) {
			getStockProductsDeliveryModal()._show({ source: add_delivery_btn });
		}
	});
});
