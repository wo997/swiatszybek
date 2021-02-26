/* js[admin] */

/**
 * @typedef {{
 * datatable: DatatableCompData
 * }} SelectProductFeatureOptionModalCompData
 *
 * @typedef {{
 * source?: PiepNode
 * callback?(option_id)
 * exclude?: number[]
 * }} ShowSelectOptionsOptions
 *
 * @typedef {{
 * _data: SelectProductFeatureOptionModalCompData
 * _set_data(data?: SelectProductFeatureOptionModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *      datatable: DatatableComp
 * }
 * _show(options?: ShowSelectOptionsOptions)
 * _options?: ShowSelectOptionsOptions
 * } & BaseComp} SelectProductFeatureOptionModalComp
 */

/**
 * @param {SelectProductFeatureOptionModalComp} comp
 * @param {*} parent
 * @param {SelectProductFeatureOptionModalCompData} data
 */
function selectProductFeatureOptionModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			datatable: {
				columns: [
					{ label: "Cecha", key: "product_feature_id", width: "1", map_name: "product_feature", searchable: "select" },
					{ label: "Opcja", key: "name", width: "1", sortable: true, searchable: "string" },
					{
						label: "Akcja",
						width: "135px",
						render: (data) => {
							return html`<button class="btn primary small select_btn">Wybierz <i class="fas fa-check"></i></button>`;
						},
					},
				],
				maps: [
					{
						name: "product_feature",
						getMap: () => {
							return product_features.map((feature) => ({ val: feature.product_feature_id, label: feature.name }));
						},
					},
				],
				primary_key: "product_feature_option_id",
				empty_html: html`Brak opcji`,
				label: "Opcje",
			},
		};
	}

	comp._show = (options = {}) => {
		comp._data.datatable.dataset = product_feature_options;
		if (options.exclude) {
			comp._data.datatable.dataset = comp._data.datatable.dataset.filter((e) => !options.exclude.includes(e.product_feature_option_id));
		}
		comp._render({ freeze: true });

		comp._options = options;
		showModal("selectProductFeatureOption", {
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
				<span class="title">Wybierz opcję</span>
				<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<datatable-comp data-node="{${comp._nodes.datatable}}" data-bind="{${data.datatable}}"></datatable-comp>
			</div>
		`,
		initialize: () => {
			comp._nodes.datatable.addEventListener("click", (ev) => {
				const target = $(ev.target);

				const select_btn = target._parent(".select_btn", { skip: 0 });
				if (select_btn) {
					const list_row = select_btn._parent(".list_row", { skip: 0 });
					if (list_row) {
						comp._options.callback(+list_row.dataset.primary);
						hideParentModal(comp);
					}
				}
			});

			window.addEventListener("product_features_changed", () => {
				comp._nodes.datatable._warmup_maps();
			});
		},
	});
}

function registerSelectProductFeatureOptionModal() {
	registerModalContent(html`
		<div id="selectProductFeatureOption" data-expand data-dismissable>
			<div class="modal_body" style="max-width: calc(70% + 100px);max-height: calc(70% + 100px);">
				<select-product-feature-option-modal-comp class="flex_stretch"></select-product-feature-option-modal-comp>
			</div>
		</div>
	`);

	/** @type {SelectProductFeatureOptionModalComp} */
	// @ts-ignore
	const select_product_feature_option_modal_comp = $("#selectProductFeatureOption select-product-feature-option-modal-comp");
	selectProductFeatureOptionModalComp(select_product_feature_option_modal_comp, undefined);

	return select_product_feature_option_modal_comp;
}
