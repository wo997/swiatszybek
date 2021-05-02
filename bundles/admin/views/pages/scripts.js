/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.pages");

	DatatableComp(datatable_comp, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "/page/search_pages",
		columns: [
			{ label: "Link", key: "url", width: "1", searchable: "string" },
			{ label: "Strona", key: "seo_title", width: "1", searchable: "string" },
			{ label: "Typ strony", key: "link_what", width: "1", searchable: "string", map_name: "link_what" },
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
		maps: [
			{
				name: "link_what",
				getMap: () => {
					return [
						{ val: "page", label: "Zwykła strona" },
						{ val: "general_product", label: "Produkt" },
						{ val: "product_category", label: "Kategoria produktu" },
					];
				},
			},
		],
		primary_key: "page_id",
		empty_html: html`Brak stron`,
		save_state_name: "admin_pages",
	});
});
