/* js[admin] */

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
 * _show(options?: {source?: PiepNode})
 * _refresh_dataset()
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
					{ label: "Opcje", key: "options", width: "2", searchable: "string" },
					{
						label: "Akcja",
						width: "207px",
						flex: true,
						render: (data) => {
							let cell = "";

							if (data.selected) {
								cell += html` <button class="btn subtle small remove_btn" style="min-width: 73px;">
									Usuń <i class="fas fa-times"></i>
								</button>`;
								cell += html` <button class="btn ${data.option_count ? "subtle" : "important"} small options_btn" style="margin-left:10px">
									Opcje (${data.option_count}) <i class="fas fa-list"></i>
								</button>`;
							} else {
								cell += html` <button class="btn primary small select_btn" style="min-width: 73px;">
									Dodaj <i class="fas fa-plus"></i>
								</button>`;
							}

							return cell;
						},
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
			},
		};
	}

	comp._refresh_dataset = () => {
		comp._nodes.datatable._data.dataset = product_features;
		comp._nodes.datatable._render();
	};

	comp._show = (options = {}) => {
		comp._refresh_dataset();

		setTimeout(() => {
			showModal("selectProductFeatures", {
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
				<span class="title">Wybierz cechy dla: <span class="product_name"></span></span>
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

			comp._nodes.datatable.addEventListener("rows_set", (ev) => {
				// @ts-ignore
				const detail = ev.detail;

				/** @type {DatatableCompData} */
				const data = detail.data;
				data.rows.forEach((data) => {
					product_comp._data.features.find((e) => {
						return e.product_feature_id === data.row_data.product_feature_id;
					});

					const feature = product_comp._data.features.find((e) => e.product_feature_id === data.row_data.product_feature_id);
					data.row_data.selected = !!feature;
					data.row_data.option_count = feature ? feature.options.length : undefined;
				});
			});

			comp._nodes.datatable.addEventListener("click", (ev) => {
				/** @type {ProductFeatureModalComp} */
				// @ts-ignore
				const product_feature_modal_comp = $("#productFeature product-feature-modal-comp");

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

				const showOptionsFrom = (product_feature_id, btn) => {
					/** @type {SelectProductFeatureOptionsModalComp} */
					// @ts-ignore
					const select_product_features_modal_comp = $("#selectProductFeatureOptions select-product-feature-options-modal-comp");
					select_product_features_modal_comp._show(product_feature_id, { source: btn });
				};

				const select_btn = target._parent(".select_btn", { skip: 0 });
				if (select_btn) {
					const list_row = select_btn._parent(".list_row", { skip: 0 });
					if (list_row) {
						const product_feature_id = +list_row.dataset.primary;
						showOptionsFrom(product_feature_id, select_btn);
					}

					comp._nodes.close_btn.classList.remove("subtle");
					comp._nodes.close_btn.classList.add("important");
				}

				const options_btn = target._parent(".options_btn", { skip: 0 });
				if (options_btn) {
					const list_row = options_btn._parent(".list_row", { skip: 0 });
					if (list_row) {
						const product_feature_id = +list_row.dataset.primary;
						showOptionsFrom(product_feature_id, options_btn);
					}

					comp._nodes.close_btn.classList.remove("subtle");
					comp._nodes.close_btn.classList.add("important");
				}

				const remove_btn = target._parent(".remove_btn", { skip: 0 });
				if (remove_btn) {
					const list_row = remove_btn._parent(".list_row", { skip: 0 });
					if (list_row) {
						const ind = product_comp._data.product_feature_ids.indexOf(+list_row.dataset.primary);
						if (ind !== -1) {
							product_comp._data.product_feature_ids.splice(ind, 1);
							product_comp._render();
							comp._nodes.datatable._render();
						}
					}

					comp._nodes.close_btn.classList.remove("subtle");
					comp._nodes.close_btn.classList.add("important");
				}
			});

			window.addEventListener("product_features_changed", () => {
				comp._refresh_dataset();
			});
		},
		ready: () => {},
	});
}

function registerSelectProductFeaturesModal() {
	// selectProductFeatures
	registerModalContent(html`
		<div id="selectProductFeatures" data-expand data-dismissable>
			<div class="modal-body" style="max-width: 1000px;max-height: calc(75% + 100px);">
				<select-product-features-modal-comp class="flex_stretch"></select-product-features-modal-comp>
			</div>
		</div>
	`);

	/** @type {SelectProductFeaturesModalComp} */
	// @ts-ignore
	const select_product_features_modal_comp = $("#selectProductFeatures select-product-features-modal-comp");
	selectProductFeaturesModalComp(select_product_features_modal_comp, undefined);

	return select_product_features_modal_comp;
}
