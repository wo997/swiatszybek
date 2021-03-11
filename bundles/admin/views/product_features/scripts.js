/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const dt = $("datatable-comp.product_features");

	datatableComp(dt, undefined, {
		dataset: product_features,
		columns: [
			{
				label: "Cecha",
				key: "name",
				width: "1",
				searchable: "string",
				render: (data) => {
					if (data.selected) {
						return html`<div style="font-weight: 600;color: var(--success-clr);"><i class="fas fa-check"></i> ${data.name}</div>`;
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
				width: "90px",
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
			Dodaj <i class="fas fa-plus"></i>
		</button> `,
		sortable: true,
		require_sort: { key: "pos", order: "asc" },
		db_table: "product_feature",
		sort_on_backend: true,
	});

	const product_feature_modal_comp = getProductFeatureModal();

	dt.addEventListener("click", (ev) => {
		const target = $(ev.target);

		const add_feature_btn = target._parent(".add_feature_btn", { skip: 0 });
		if (add_feature_btn) {
			product_feature_modal_comp._show(-1, { source: add_feature_btn });
		}

		const edit_btn = target._parent(".edit_btn", { skip: 0 });
		if (edit_btn) {
			const list_row = edit_btn._parent(".list_row", { skip: 0 });
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
