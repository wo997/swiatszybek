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
 *  edit_feature: PiepNode
 * }
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
					<button data-node="{${comp._nodes.edit_feature}}" class="btn subtle small"><i class="fas fa-cog"></i></button>
					<p-batch-trait data-trait="list_controls"></p-batch-trait>
				</div>
			</div>

			<span html="{${"Opcje: (" + data.options.length + ")"}}"></span>
			<button data-node="add_option_btn" class="btn primary small">Wybierz <i class="fas fa-search"></i></button>

			<list-comp data-bind="{${data.options}}" class="options">
				<product_feature-option-comp></product_feature-option-comp>
			</list-comp>
		`,
		initialize: () => {
			/** @type {ProductFeatureModalComp} */
			// @ts-ignore
			const product_feature_modal_comp = $("#productFeature product-feature-modal-comp");

			comp._nodes.edit_feature.addEventListener("click", () => {
				product_feature_modal_comp._show(comp._data.product_feature_id, { source: comp._nodes.edit_feature });
			});
		},
	});
}
