/* js[admin] */

/**
 * @typedef {{
 * product_feature_id: number
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
 * _show(product_feature_id: number, options?: ShowModalParams)
 * _reload_data()
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
			product_feature_id: -1,
			datatable: {
				columns: [
					{
						label: "Opcja nadrzędna (Grupa)",
						key: "parent_product_feature_option_id",
						width: "1.3",
						map_name: "product_feature_option",
						searchable: "select",
					},
					{
						label: "Opcja",
						key: "value",
						width: "1",
						sortable: true,
						searchable: "string",
						render: (data) => {
							if (data.selected) {
								return html`<div style="font-weight: 600;color: var(--success-clr);"><i class="fas fa-check"></i> ${data.value}</div>`;
							}
							return data.value;
						},
					},
					{
						label: "Akcja",
						width: "105px",
						render: (data) => {
							let cell = "";

							if (data.selected) {
								cell += html` <button class="btn subtle small remove_btn" style="min-width: 73px;">
									Usuń <i class="fas fa-times"></i>
								</button>`;
							} else {
								cell += html` <button class="btn primary small select_btn" style="min-width: 73px;">
									Dodaj <i class="fas fa-plus"></i>
								</button>`;
							}

							return cell;
						},
					},
				],
				maps: [
					{
						name: "product_feature_option",
						getMap: () => {
							const map = product_feature_options.map((option) => {
								const obj = {
									val: option.product_feature_option_id,
									label: option.full_value,
								};
								return obj;
							});
							return map;
						},
					},
				],
				primary_key: "product_feature_option_id",
				empty_html: html`Brak opcji`,
				label: "Opcje",
				after_label: html`<button
					class="add_feature_option_btn btn primary"
					data-tooltip="W przypadku gdy nie widzisz takiej opcji na liście"
				>
					Dodaj <i class="fas fa-plus"></i>
				</button> `,
			},
		};
	}

	comp._reload_data = () => {
		comp._data.datatable.dataset = product_feature_options.filter((e) => e.product_feature_id === comp._data.product_feature_id);
	};

	comp._show = (product_feature_id, options = {}) => {
		comp._data.product_feature_id = product_feature_id;

		comp._data.datatable.label = product_features.find((e) => e.product_feature_id === product_feature_id).name;
		comp._reload_data();
		comp._render();

		showModal("selectProductFeatureOptions", {
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
			<div class="custom_toolbar">
				<span class="title medium">Wybierz opcje dla: <span class="product_name"></span></span>
				<button class="btn subtle" data-node="{${comp._nodes.close_btn}}" onclick="hideParentModal(this)">
					Zamknij <i class="fas fa-times"></i>
				</button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<datatable-comp data-node="{${comp._nodes.datatable}}" data-bind="{${data.datatable}}"></datatable-comp>
			</div>
		`,
		initialize: () => {
			/** @type {ProductComp} */
			// @ts-ignore
			const product_comp = $("product-comp");

			const select_product_features_modal_comp = getSelectProductFeaturesModal();

			comp._nodes.datatable.addEventListener("rows_set", (ev) => {
				// @ts-ignore
				const detail = ev.detail;

				/** @type {DatatableCompData} */
				const data = detail.data;
				data.rows.forEach((data) => {
					data.row_data.selected = product_comp._data.product_feature_option_ids.indexOf(data.row_data.product_feature_option_id) !== -1;
				});
			});

			comp._nodes.datatable.addEventListener("click", (ev) => {
				const target = $(ev.target);

				const select_btn = target._parent(".select_btn", { skip: 0 });
				if (select_btn) {
					const list_row = select_btn._parent(".list_row", { skip: 0 });
					if (list_row) {
						const product_feature_option_id = +list_row.dataset.primary;
						const product_feature_option = product_feature_options.find(
							(opt) => opt.product_feature_option_id === product_feature_option_id
						);
						product_feature_option.all_ids.forEach((option_id) => {
							if (!product_comp._data.product_feature_option_ids.includes(option_id)) {
								product_comp._data.product_feature_option_ids.push(option_id);

								const product_feature_id = product_feature_options.find((opt) => opt.product_feature_option_id === option_id)
									.product_feature_id;

								if (!product_comp._data.product_feature_ids.includes(product_feature_id)) {
									product_comp._data.product_feature_ids.push(product_feature_id);
								}
							}
						});

						product_comp._render();
						select_product_features_modal_comp._render();
						comp._nodes.datatable._render();
					}

					comp._nodes.close_btn.classList.remove("subtle");
					comp._nodes.close_btn.classList.add("important");
				}

				const remove_btn = target._parent(".remove_btn", { skip: 0 });
				if (remove_btn) {
					const list_row = remove_btn._parent(".list_row", { skip: 0 });
					if (list_row) {
						const ind = product_comp._data.product_feature_option_ids.indexOf(+list_row.dataset.primary);
						if (ind !== -1) {
							product_comp._data.product_feature_option_ids.splice(ind, 1);
							product_comp._render();
							select_product_features_modal_comp._render();
							comp._nodes.datatable._render();
						}
					}

					comp._nodes.close_btn.classList.remove("subtle");
					comp._nodes.close_btn.classList.add("important");
				}

				const add_feature_option_btn = target._parent(".add_feature_option_btn", { skip: 0 });
				if (add_feature_option_btn) {
					const product_feature_modal_comp = getProductFeatureModal();
					product_feature_modal_comp._show(comp._data.product_feature_id, { source: add_feature_option_btn });
				}
			});

			window.addEventListener("product_features_changed", () => {
				comp._nodes.datatable._warmup_maps();
				comp._reload_data();
				comp._render();
			});
		},
	});
}

function getSelectProductFeatureOptionsModal() {
	const ex = $("#selectProductFeatureOptions");
	if (!ex) {
		registerModalContent(html`
			<div id="selectProductFeatureOptions" data-expand data-dismissable>
				<div class="modal_body" style="max-width: calc(40% + 200px);max-height: calc(65% + 100px);">
					<select-product-feature-options-modal-comp class="flex_stretch"></select-product-feature-options-modal-comp>
				</div>
			</div>
		`);
	}

	/** @type {SelectProductFeatureOptionsModalComp} */
	// @ts-ignore
	const select_product_feature_options_modal_comp = $("#selectProductFeatureOptions select-product-feature-options-modal-comp");
	if (!ex) {
		selectProductFeatureOptionsModalComp(select_product_feature_options_modal_comp, undefined);
	}

	return select_product_feature_options_modal_comp;
}
