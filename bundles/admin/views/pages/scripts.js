/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.pages");

	DatatableComp(datatable_comp, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "/page/search",
		columns: [
			{ label: "Tytuł", key: "seo_title", width: "1", searchable: "string" },
			{ label: "Opis", key: "seo_description", width: "1", searchable: "string" },
			{ label: "Data utworzenia", key: "created_at", width: "1", searchable: "date", sortable: true },
			{
				label: "Akcja",
				key: "",
				width: "100px",
				render: (data) => {
					return html`<a class="btn subtle small" href="${STATIC_URLS["ADMIN"] + "/strona/" + data.page_id}">
						Edytuj <i class="fas fa-cog"></i>
					</a>`;
				},
			},
		],
		primary_key: "page_id",
		empty_html: html`Brak stron`,
		label: "Strony",
		save_state_name: "admin_pages",
	});
});
