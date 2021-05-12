/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.templates");

	DatatableComp(datatable_comp, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "/template/search",
		//dataset: templates,
		columns: [
			{ label: "Nazwa", key: "name", width: "1", searchable: "string" },
			{
				key: "is_global",
				label: "Czy główny?",
				width: "140px",
				searchable: "boolean",
				editable: "checkbox",
				editable_callback: (data) => {
					xhr({
						url: STATIC_URLS["ADMIN"] + "/template/save",
						params: {
							template: {
								template_id: data.template_id,
								is_global: data.is_global,
							},
						},
						success: (res) => {
							showNotification(
								html`<div class="header">Szablon ${data.name}</div>
									<div class="center">Czy główny? ${data.is_global ? "TAK" : "NIE"}</div>`
							);
							datatable_comp._backend_search();
						},
					});
				},
			},
			{ label: "Szablon nadrzędny", key: "parent_template_id", width: "1", searchable: "select", map_name: "template" },
			{ label: "Typ strony", key: "page_type", width: "1", searchable: "select", map_name: "page_type" },
			{ label: "Data utworzenia", key: "created_at", width: "1", searchable: "date" },
			{
				label: "Akcja",
				key: "",
				width: "100px",
				render: (data) => {
					return html`<a
						class="btn subtle small"
						href="${STATIC_URLS["ADMIN"]}/strona?nr_szablonu=${data.template_id}"
						data-tooltip="Edytuj"
					>
						<i class="fas fa-cog"></i>
					</a>`;
				},
			},
		],
		maps: [
			{
				name: "page_type",
				getMap: () => {
					return [
						{ val: "page", label: "Zwykła strona" },
						{ val: "general_product", label: "Produkt" },
						{ val: "product_category", label: "Kategoria produktów" },
					];
				},
			},
			{
				name: "template",
				getMap: () => {
					return [{ val: -1, label: "Brak - Pusta strona" }, ...templates.map((t) => ({ val: t.template_id, label: t.name }))];
				},
			},
		],
		pagination_data: { row_count: 50 },
		label: "Szablony",
		after_label: html`<button class="btn primary" onclick="getAddTemplateModal()._show({source:this})">
			Utwórz szablon <i class="fas fa-plus"></i>
		</button> `,
		primary_key: "template_id",
		empty_html: html`Brak szablonów`,
		sortable: true,
		require_sort: { key: "pos", order: "asc" },
		db_table: "template",
		sort_on_backend: true,
	});
});
