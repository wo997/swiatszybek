/* js[view] */

/**
 * @typedef {{
 * product_feature_id: number
 * options: Product_FeatureOptionCompData[]
 * } & ListCompRowData} Product_FeatureCompData
 *
 * @typedef {{
 * _data: Product_FeatureCompData
 * _set_data(data?: Product_FeatureCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  feature_name: PiepNode
 *  edit_feature_btn: PiepNode
 *  add_option_btn: PiepNode
 * } & ListControlTraitNodes
 * } & BaseComp} Product_FeatureComp
 */

/**
 * @param {Product_FeatureComp} comp
 * @param {*} parent
 * @param {Product_FeatureCompData} data
 */
function product_featureComp(comp, parent, data = { product_feature_id: -1, options: [] }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			pass_list_data: [{ what: "product_feature_id", where: "options" }],
			render: () => {
				const feature = product_features.find((e) => e.product_feature_id === data.product_feature_id);
				if (feature) {
					comp._nodes.feature_name._set_content(feature.name);
				}
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="variant_header">
				<div class="title inline semi-bold" data-node="{${comp._nodes.feature_name}}"></div>
				<div>
					<button data-node="{${comp._nodes.edit_feature_btn}}" class="btn subtle small"><i class="fas fa-cog"></i></button>
					<div class="no_actions">
						<p-batch-trait data-trait="list_controls"></p-batch-trait>
					</div>
				</div>
			</div>

			<span html="{${"Opcje: (" + data.options.length + ")"}}"></span>
			<button data-node="{${comp._nodes.add_option_btn}}" class="btn primary small">Wybierz <i class="fas fa-search"></i></button>

			<list-comp data-bind="{${data.options}}" class="options" data-primary="product_feature_option_id">
				<product_feature-option-comp></product_feature-option-comp>
			</list-comp>
		`,
		initialize: () => {
			/** @type {ProductFeatureModalComp} */
			// @ts-ignore
			const product_feature_modal_comp = $("#productFeature product-feature-modal-comp");

			comp._nodes.edit_feature_btn.addEventListener("click", () => {
				product_feature_modal_comp._show(comp._data.product_feature_id, { source: comp._nodes.edit_feature_btn });
			});

			/** @type {SelectProductFeatureOptionsModalComp} */
			// @ts-ignore
			const select_product_features_modal_comp = $("#selectProductFeatureOptions select-product-feature-options-modal-comp");

			comp._nodes.add_option_btn.addEventListener("click", () => {
				select_product_features_modal_comp._show(comp._data.product_feature_id, { source: comp._nodes.add_option_btn });
			});

			/** @type {ProductComp} */
			// @ts-ignore
			const product_comp = $("product-comp");

			const doWithRow = (action) => {
				const pfi = product_comp._data.product_feature_ids;
				const id = pfi.indexOf(comp._data.product_feature_id);
				if (id !== -1) {
					action(pfi, id);
				}
				product_comp._render();
			};

			comp._nodes.list_delete_btn.addEventListener("click", () => {
				doWithRow((pfi, id) => pfi.splice(id, 1));
			});

			comp._nodes.list_up_btn.addEventListener("click", () => {
				doWithRow((pfi, id) => ([pfi[id], pfi[id - 1]] = [pfi[id - 1], pfi[id]]));
			});

			comp._nodes.list_down_btn.addEventListener("click", () => {
				doWithRow((pfi, id) => ([pfi[id], pfi[id + 1]] = [pfi[id + 1], pfi[id]]));
			});
		},
	});
}
