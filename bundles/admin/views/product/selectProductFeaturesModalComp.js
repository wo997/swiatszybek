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
 *      close_btn: PiepNode
 *      datatable: DatatableComp
 * }
 * _show_modal(options?: {source?: PiepNode})
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
					/*{
						label: "Typ danych",
						key: "data_type",
						width: "200px",
						sortable: true,
						searchable: "string",
						render: (data) => {
							return data.data_type + "_x";
						},
					},*/
					{ label: "Wartości", key: "attr_values", width: "50%", sortable: true, searchable: "number" },
					{
						label: "",
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
				primary_key: "product_feature_id",
				empty_html: html`Brak cech`,
				label: "Cechy produktów",
				after_label: html`<button class="add_feature_btn btn primary" data-tooltip="W przypadku gdy nie widzisz takiej cechy na liście">
					Dodaj <i class="fas fa-plus"></i>
				</button> `,
			},
		};
	}

	comp._show_modal = (options = {}) => {
		//comp._render(); // but why?
		comp._nodes.datatable._datatable_search();

		comp._nodes.close_btn.classList.add("subtle");
		comp._nodes.close_btn.classList.remove("important");

		showModal("selectProductFeatures", {
			source: options.source,
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
				<span class="title">Wybierz cechy <span class="product_name"></span></span>
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
			const dt_product_features = comp._child("datatable-comp");

			dt_product_features.addEventListener("dataset_set", (ev) => {
				// @ts-ignore
				const detail = ev.detail;

				/** @type {DatatableCompData} */
				const data = detail.data;
				data.dataset.forEach((data) => {
					product_comp._data.variants.find((e) => {
						return e.product_feature_id === data.product_feature_id;
					});
					data.selected = !!product_comp._data.variants.find((e) => e.product_feature_id === data.product_feature_id);
				});
			});

			dt_product_features.addEventListener("click", (ev) => {
				/** @type {ProductFeatureComp} */
				// @ts-ignore
				const product_feature_comp = $("#productFeature product-feature-comp");

				const target = $(ev.target);

				const add_feature_btn = target._parent(".add_feature_btn", { skip: 0 });
				if (add_feature_btn) {
					showModal("productFeature", {
						source: add_feature_btn,
					});
					product_feature_comp._set_data();
				}

				const edit_btn = target._parent(".edit_btn", { skip: 0 });
				if (edit_btn) {
					const list_row = edit_btn._parent(".list_row", { skip: 0 });
					if (list_row) {
						showModal("productFeature", {
							source: add_feature_btn,
						});

						product_feature_comp._load_data(+list_row.dataset.primary);
					}
				}

				const select_btn = target._parent(".select_btn", { skip: 0 });
				if (select_btn) {
					const list_row = select_btn._parent(".list_row", { skip: 0 });
					if (list_row) {
						product_comp._data.variants.push({ product_feature_id: +list_row.dataset.primary, options: [] });
						product_comp._render();
						comp._nodes.datatable._set_dataset();
					}

					comp._nodes.close_btn.classList.remove("subtle");
					comp._nodes.close_btn.classList.add("important");
				}

				const remove_btn = target._parent(".remove_btn", { skip: 0 });
				if (remove_btn) {
					const list_row = remove_btn._parent(".list_row", { skip: 0 });
					if (list_row) {
						const ind = product_comp._data.variants.findIndex((e) => e.product_feature_id === +list_row.dataset.primary);
						if (ind !== -1) {
							product_comp._data.variants.splice(ind, 1);
							product_comp._render();
							comp._nodes.datatable._set_dataset();
						}
					}

					comp._nodes.close_btn.classList.remove("subtle");
					comp._nodes.close_btn.classList.add("important");
				}
			});
		},
	});
}
