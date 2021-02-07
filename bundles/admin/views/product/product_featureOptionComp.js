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
 * }
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
			render: () => {
				// const option = feature.options.find((e) => e.option_id === data.option_id);
				// if (option && option) {
				// 	comp._nodes.option_name._set_content(option.name);
				// }
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="option_header">
				<div class="title inline" data-node="{${comp._nodes.option_name}}"></div>
				<div>
					<p-batch-trait data-trait="list_controls"></p-batch-trait>
				</div>
			</div>
		`,
		initialize: () => {},
	});
}
