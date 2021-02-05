/* js[view] */

/**
 * @typedef {{
 * datatable: DatatableCompData
 * }} SelectProductFeaturesCompData
 *
 * @typedef {{
 * _data: SelectProductFeaturesCompData
 * _set_data(data?: SelectProductFeaturesCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * } & BaseComp} SelectProductFeaturesComp
 */

/**
 * @param {SelectProductFeaturesComp} comp
 * @param {*} parent
 * @param {SelectProductFeaturesCompData} data
 */
function selectProductFeaturesComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			datatable: {
				search_url: STATIC_URLS["ADMIN"] + "search_product_attributes",
				columns: [
					{ label: "Cecha", key: "name", width: "300px", sortable: true, searchable: "string" },
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
					{ label: "Wartości", key: "attr_values", width: "200px", sortable: true, searchable: "number" },
				],
				primary_key: "attribute_id",
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
				<datatable-comp data-bind="{${data.datatable}}" class="dt_product_features"></datatable-comp>
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
			});
		},
	});
}
