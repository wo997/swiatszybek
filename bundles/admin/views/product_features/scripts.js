/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const dt = $("datatable-comp.product_features");

	DatatableComp(dt, undefined, {
		dataset: product_features,
		columns: [
			{
				label: "Cecha",
				key: "name",
				width: "1",
				searchable: "string",
				render: (data) => {
					if (data.selected) {
						return html`<div class="semi_bold" style="color: var(--success-clr);"><i class="fas fa-check"></i> ${data.name}</div>`;
					}
					return data.name;
				},
			},
			{
				label: "Opcje",
				key: "options",
				width: "2",
				searchable: "string",
			},
			{
				label: "",
				width: "100px",
				flex: true,
				render: (data) => {
					return html`<button class="btn subtle small edit_btn" style="margin-left:auto">Edytuj <i class="fas fa-cog"></i></button>`;
				},
			},
		],
		pagination_data: { row_count: 50 },
		primary_key: "product_feature_id",
		empty_html: html`Brak cech`,
		label: "Cechy produktów",
		after_label: html`<button class="add_feature_btn btn primary" data-tooltip="W przypadku gdy nie widzisz takiej cechy na liście">
			Dodaj cechę <i class="fas fa-plus"></i>
		</button> `,
		sortable: true,
		require_sort: { key: "pos", order: "asc" },
		db_table: "product_feature",
		sort_on_backend: true,
	});

	const product_feature_modal_comp = getProductFeatureModal();

	dt.addEventListener("click", (ev) => {
		const target = $(ev.target);

		const add_feature_btn = target._parent(".add_feature_btn");
		if (add_feature_btn) {
			product_feature_modal_comp._show(-1, { source: add_feature_btn });
		}

		const edit_btn = target._parent(".edit_btn");
		if (edit_btn) {
			const list_row = edit_btn._parent(".list_row");
			if (list_row) {
				product_feature_modal_comp._show(+list_row.dataset.primary, { source: edit_btn });
			}
		}
	});

	window.addEventListener("product_features_changed", () => {
		dt._data.dataset = product_features;
		dt._warmup_maps();
		dt._render({ force_render: true });
	});
});
