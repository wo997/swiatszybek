/* js[view] */

/**
 * @typedef {{
 * product_feature_id?: number
 * product_feature_option_id: number
 * name?: string
 * } & ListCompRowData} Product_FeatureOptionCompData
 *
 * @typedef {{
 * _data: Product_FeatureOptionCompData
 * _set_data(data?: Product_FeatureOptionCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  option_name: PiepNode
 * } & ListControlTraitNodes
 * } & BaseComp} Product_FeatureOptionComp
 */

/**
 * @param {Product_FeatureOptionComp} comp
 * @param {*} parent
 * @param {Product_FeatureOptionCompData} data
 */
function product_featureOptionComp(comp, parent, data = { product_feature_option_id: -1, name: "", product_feature_id: -1 }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="option_header">
				<div class="title inline" html="{${data.name}}"></div>
				<div>
					<p-batch-trait data-trait="list_controls"></p-batch-trait>
				</div>
			</div>
		`,

		// <button data-node="{${comp._nodes.down_btn}}" class="btn subtle small"><i class="fas fa-chevron-down"></i></button>
		// <button data-node="{${comp._nodes.up_btn}}" class="btn subtle small"><i class="fas fa-chevron-up"></i></button>
		// <button data-node="{${comp._nodes.delete_btn}}" class="btn subtle small"><i class="fas fa-trash"></i></button>
		initialize: () => {
			/** @type {ProductComp} */
			// @ts-ignore
			const product_comp = $("product-comp");

			comp._nodes.delete_btn.addEventListener("click", () => {
				const product_feature_option_ids = product_comp._data.product_feature_option_ids;
				const id = product_feature_option_ids.indexOf(comp._data.product_feature_option_id);
				if (id !== -1) {
					product_feature_option_ids.splice(id, 1);
				}
				product_comp._render();
			});

			comp._nodes.up_btn.addEventListener("click", () => {
				const product_feature_option_ids = product_comp._data.product_feature_option_ids;
				const id = product_feature_option_ids.indexOf(comp._data.product_feature_option_id);
				if (id !== -1) {
					product_feature_option_ids.splice(id, 1);
				}
				product_comp._render();
			});
		},
	});
}
