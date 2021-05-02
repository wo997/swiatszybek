/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.templates");

	DatatableComp(datatable_comp, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "/template/search",
		columns: [
			{ label: "Nazwa", key: "name", width: "1", searchable: "string" },
			{ label: "Typ strony", key: "page_type", width: "1", searchable: "string" },
			{ label: "Data utworzenia", key: "created_at", width: "1", searchable: "date", sortable: true },
			{
				label: "Akcja",
				key: "",
				width: "100px",
				render: (data) => {
					return html`<a class="btn subtle small" href="${STATIC_URLS["ADMIN"]}/strona?nr_szablonu=${data.template_id}">
						Edytuj <i class="fas fa-cog"></i>
					</a>`;
				},
			},
		],
		label: "Szablony",
		after_label: html`<button class="btn primary" onclick="getAddTemplateModal()._show({source:this})">
			Utwórz szablon <i class="fas fa-plus"></i>
		</button> `,
		primary_key: "template_id",
		empty_html: html`Brak stron`,
		save_state_name: "admin_templates",
	});
});
