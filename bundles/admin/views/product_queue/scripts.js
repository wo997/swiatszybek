/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.product_queue");

	DatatableComp(datatable_comp, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "/product_queue/search",
		columns: [
			{
				label: "Produkt",
				key: "product_name",
				width: "1",
				searchable: "string",
				render: (value, data) => {
					return html`<a class="link" href="${STATIC_URLS["ADMIN"] + "/produkt/" + data.general_product_id}"> ${value} </a>`;
				},
			},
			{
				label: "E-maile",
				key: "emails",
				width: "2",
				searchable: "string",
				render: (value) => {
					return JSON.parse(value).join(", ");
				},
			},
			{
				label: "Akcja",
				key: "",
				width: "100px",
				render: () => {
					return html``;
				},
			},
		],
		primary_key: "product_queue_id",
		empty_html: html`Brak oczekujących na produkty`,
		label: "Oczekujący na produkty",
		save_state_name: "admin_product_queue",
	});
});
