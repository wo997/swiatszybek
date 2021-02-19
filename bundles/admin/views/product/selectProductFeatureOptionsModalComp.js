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
 * _show(product_feature_id: number, options?: {source_rect?: DOMRect})
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
					{ label: "Opcja", key: "name", width: "1", sortable: true, searchable: "string" },
					{
						label: "Akcja",
						width: "155px",
						render: (data) => {
							let cell = "";

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

		comp._nodes.datatable._data.dataset = product_feature_options.filter((e) => e.product_feature_id === product_feature_id);
		comp._nodes.datatable._render();

		setTimeout(() => {
			showModal("selectProductFeatureOptions", {
				source_rect: options.source_rect,
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
						product_comp._data.product_feature_option_ids.push(+list_row.dataset.primary);
						product_comp._render();
						comp._nodes.datatable._render();

						showNotification("Dodano opcję", {
							one_line: true,
							type: "success",
						});
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
							comp._nodes.datatable._render();

							showNotification("Usunięto opcję", {
								one_line: true,
								type: "success",
							});
						}
					}

					comp._nodes.close_btn.classList.remove("subtle");
					comp._nodes.close_btn.classList.add("important");
				}
			});
		},
	});
}

function registerSelectProductFeatureOptionsModal() {
	registerModalContent(html`
		<div id="selectProductFeatureOptions" data-expand data-dismissable>
			<div class="modal-body" style="max-width: calc(75% + 100px);max-height: calc(75% + 100px);">
				<select-product-feature-options-modal-comp class="flex_stretch"></select-product-feature-options-modal-comp>
			</div>
		</div>
	`);

	/** @type {SelectProductFeatureOptionsModalComp} */
	// @ts-ignore
	const select_product_feature_options_modal_comp = $("#selectProductFeatureOptions select-product-feature-options-modal-comp");
	selectProductFeatureOptionsModalComp(select_product_feature_options_modal_comp, undefined);

	return select_product_feature_options_modal_comp;
}
