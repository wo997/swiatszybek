/* js[view] */

/**
 * @typedef {{
 * datatable: DatatableCompData
 * }} SelectProductFeaturesModalCompData
 *
 * @typedef {{
 * _data: SelectProductFeaturesModalCompData
 * _set_data(data?: SelectProductFeaturesModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * } & BaseComp} SelectProductFeaturesModalComp
 */

/**
 * @param {SelectProductFeaturesModalComp} comp
 * @param {*} parent
 * @param {SelectProductFeaturesModalCompData} data
 */
function selectProductFeaturesModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			datatable: {
				search_url: STATIC_URLS["ADMIN"] + "product/feature/search",
				columns: [
					{ label: "Cecha", key: "name", width: "20%", sortable: true, searchable: "string" },
					{
						label: "Typ danych",
						key: "data_type",
						width: "200px",
						sortable: true,
						searchable: "string",
						render: (data) => {
							return data.data_type + "_x";
						},
					},
					{ label: "Wartości", key: "attr_values", width: "50%", sortable: true, searchable: "number" },
					{
						label: "",
						width: "50px",
						render: (data) => {
							return html`<button class="btn subtle small edit_btn"><i class="fas fa-cog"></i></button>`;
						},
					},
				],
				primary_key: "product_feature_id",
				empty_html: html`Brak cech`,
				label: "Cechy produktów",
				after_label: html`<button class="add_feature_btn btn important" data-tooltip="W przypadku gdy nie widzisz takiej cechy na liście">
					Dodaj <i class="fas fa-plus"></i>
				</button> `,
				selectable: true,
			},
		};
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="custom-toolbar">
				<span class="title">Wybierz cechy <span class="product_name"></span></span>
				<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button
					class="btn primary"
					onclick="hideParentModal(this)"
					disabled="{${data.datatable.selection.length === 0}}"
					style="min-width: 115px;"
					data-tooltip="{${data.datatable.selection.length === 0 ? "☑️ Zaznacz wybrane elementy listy" : ""}}"
				>
					Wybierz
					<span
						class="semi-bold"
						html="{${data.datatable.selection.length ? "(" + data.datatable.selection.length + ') <i class="fas fa-check"></i>' : ""}}"
					></span>
				</button>
			</div>
			<div class="scroll-panel scroll-shadow panel-padding">
				<datatable-comp data-bind="{${data.datatable}}"></datatable-comp>
			</div>
		`,
		initialize: () => {
			/** @type {DatatableComp} */
			// @ts-ignore
			const dt_product_features = comp._child("datatable-comp");

			dt_product_features.addEventListener("click", (ev) => {
				const target = $(ev.target);
				const add_feature_btn = target._parent(".add_feature_btn", { skip: 0 });
				if (add_feature_btn) {
					showModal("productFeature", {
						source: add_feature_btn,
					});
				}
				const edit_btn = target._parent(".edit_btn", { skip: 0 });
				if (edit_btn) {
					const list_row = edit_btn._parent(".list_row", { skip: 0 });
					if (list_row) {
						showModal("productFeature", {
							source: add_feature_btn,
						});

						/** @type {ProductFeatureComp} */
						// @ts-ignore
						const product_feature_comp = $("#productFeature product-feature-comp");
						product_feature_comp._load_data(+list_row.dataset.primary);
					}
				}
			});
		},
	});
}
