/* js[view] */

/**
 * @typedef {{
 * datatable: DatatableCompData
 * }} SelectProductFeatureOptionModalCompData
 *
 * @typedef {{
 * _data: SelectProductFeatureOptionModalCompData
 * _set_data(data?: SelectProductFeatureOptionModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *      datatable: DatatableComp
 * }
 * _show(options?: {source?: PiepNode})
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
					{ label: "Cecha", key: "feature_name" },
					{ label: "Opcja", key: "name", width: "20%", sortable: true, searchable: "string" },
					{
						label: "Akcja",
						width: "135px",
						render: (data) => {
							return html`<button class="btn primary small select_btn">Wybierz <i class="fas fa-check"></i></button>`;
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
		comp._nodes.datatable._data.dataset = product_feature_options.map((opt) => {
			const feature = product_features.find((fea) => fea.product_feature_id === opt.product_feature_id);
			return { name: opt.name, feature_name: feature ? feature.name : "" };
		});
		comp._nodes.datatable._render();

		setTimeout(() => {
			showModal("selectProductFeatureOption", {
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
				<span class="title">Wybierz opcję</span>
				<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
			</div>
			<div class="scroll-panel scroll-shadow panel-padding">
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
						//+list_row.dataset.primary
					}
				}
			});
		},
	});
}

function registerSelectProductFeatureOptionModal() {
	registerModalContent(html`
		<div id="selectProductFeatureOption" data-expand data-dismissable>
			<div class="modal-body" style="max-width: calc(70% + 100px);max-height: calc(70% + 100px);">
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
