/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.comments");

	DatatableComp(datatable_comp, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "/comment/search",
		columns: [
			{
				label: "Produkt",
				key: "general_product_name",
				width: "1",
				searchable: "string",
				render: (value, data) => {
					return html`<a class="link" href="${STATIC_URLS["ADMIN"] + "/produkt/" + data.general_product_id}"> ${value} </a>`;
				},
			},
			{ label: "Komentarz", key: "comment", width: "2", searchable: "string" },
			{
				label: "Ocena",
				key: "rating",
				width: "110px",
				sortable: true,
				render: (value) => {
					return html`<span class="rating stars">${value}</span>`;
				},
			},
			{ label: "E-mail", key: "email", width: "1", searchable: "string" },
			{ label: "Kiedy", key: "created_at", width: "135px", sortable: true, searchable: "date" },
			{
				label: "Akcja",
				key: "",
				width: "100px",
				render: () => {
					return html` <button class="btn subtle small" disabled data-tooltip="Ukryj komentarz"><i class="fas fa-eye-slash"></i></button> `;
				},
			},
		],
		primary_key: "comment_id",
		empty_html: html`Brak komentarzy`,
		label: "Komentarze",
		selectable: true,
		save_state_name: "admin_comments",
	});

	datatable_comp.addEventListener("change", () => {
		starsLoaded();
	});
});
