/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.product_queue");

	datatableComp(datatable_comp, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "/product_queue/search",
		columns: [
			{ label: "Produkt", key: "product_name", width: "1", searchable: "string" },
			{
				label: "E-maile",
				key: "emails",
				width: "2",
				searchable: "string",
				render: (data) => {
					return JSON.parse(data.emails).join(", ");
				},
			},
			{
				label: "Akcja",
				key: "",
				width: "100px",
				render: (data) => {
					return html`<a
						class="btn subtle small"
						href="${STATIC_URLS["ADMIN"] + "/produkt/" + data.general_product_id}"
						data-tooltip="Edytuj produkt"
					>
						<i class="fas fa-cog"></i>
					</a>`;
				},
			},
		],
		primary_key: "product_queue_id",
		empty_html: html`Brak oczekujących na produkty`,
		label: "Oczekujący na produkty",
		selectable: true,
		save_state_name: "product_queue",
	});
});
