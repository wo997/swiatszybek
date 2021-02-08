/* js[view] */

/**
 * @typedef {{
 * datatable: DatatableCompData
 * }} SelectProductFeatureOptionsModalCompData
 *
 * @typedef {{
 * _data: SelectProductFeatureOptionsModalCompData
 * _set_data(data?: SelectProductFeatureOptionsModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *      close_btn: PiepNode
 *      datatable: DatatableComp
 * }
 * _show(product_feature_id: number, options?: {source?: PiepNode})
 * } & BaseComp} SelectProductFeatureOptionsModalComp
 */

/**
 * @param {SelectProductFeatureOptionsModalComp} comp
 * @param {*} parent
 * @param {SelectProductFeatureOptionsModalCompData} data
 */
function selectProductFeatureOptionsModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			datatable: {
				columns: [
					{ label: "Opcja", key: "name", width: "20%", sortable: true, searchable: "string" },
					{
						label: "Akcja",
						width: "155px",
						render: (data) => {
							let cell = html`<button class="btn subtle small edit_btn" data-tooltip="Edytuj">
								<i class="fas fa-cog"></i>
							</button>`;

							if (data.selected) {
								cell += html` <button class="btn subtle small remove_btn">Odznacz <i class="fas fa-times"></i></button>`;
							} else {
								cell += html` <button class="btn primary small select_btn">Wybierz <i class="fas fa-check"></i></button>`;
							}

							return cell;
						},
					},
				],
				primary_key: "product_feature_option_id",
				empty_html: html`Brak opcji`,
				label: "Opcje",
			},
		};
	}

	comp._show = (product_feature_id, options = {}) => {
		comp._nodes.close_btn.classList.add("subtle");
		comp._nodes.close_btn.classList.remove("important");

		comp._nodes.datatable._set_dataset(
			product_feature_options.filter((e) => e.product_feature_id === product_feature_id),
			{ immediately: true }
		);

		setTimeout(() => {
			showModal("selectProductFeatureOptions", {
				source: options.source,
			});
		});
	};

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="custom-toolbar">
				<span class="title">Wybierz opcje dla: <span class="product_name"></span></span>
				<button class="btn subtle" data-node="{${comp._nodes.close_btn}}" onclick="hideParentModal(this)">
					Zamknij <i class="fas fa-times"></i>
				</button>
			</div>
			<div class="scroll-panel scroll-shadow panel-padding">
				<datatable-comp data-node="{${comp._nodes.datatable}}" data-bind="{${data.datatable}}"></datatable-comp>
			</div>
		`,
		initialize: () => {
			/** @type {ProductComp} */
			// @ts-ignore
			const product_comp = $("product-comp");

			/** @type {DatatableComp} */
			// @ts-ignore
			const dt_product_feature_options = comp._child("datatable-comp");

			dt_product_feature_options.addEventListener("dataset_set", (ev) => {
				// @ts-ignore
				const detail = ev.detail;

				/** @type {DatatableCompData} */
				const data = detail.data;
				data.dataset.forEach((data) => {
					product_comp._data.feature_options.find((e) => {
						return e.product_feature_id === data.product_feature_id;
					});
					data.selected = !!product_comp._data.features.find((e) => e.product_feature_id === data.product_feature_id);
				});
			});
		},
	});
}
