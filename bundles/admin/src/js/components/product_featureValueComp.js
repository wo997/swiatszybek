/* js[admin] */

/**
 * @typedef {{
 * product_feature_value_id?: number
 * product_feature_id?: number
 * value?: string
 * label?: string
 * } & ListCompRowData} Product_FeatureValueCompData
 *
 * @typedef {{
 * _data: Product_FeatureValueCompData
 * _set_data(data?: Product_FeatureValueCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  option_name: PiepNode
 * } & ListControlTraitNodes
 * } & BaseComp} Product_FeatureValueComp
 */

/**
 * @param {Product_FeatureValueComp} comp
 * @param {*} parent
 * @param {Product_FeatureValueCompData} data
 */
function product_featureValueComp(comp, parent, data = { product_feature_value_id: -1, value: "", label: "", product_feature_id: -1 }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="option_header">
                <input class="field" data-bind="{${data.value}}"></div>
                <input class="field" data-bind="{${data.label}}"></div>
				<div style="margin-left:auto">
					<p-batch-trait data-trait="list_controls"></p-batch-trait>
				</div>
			</div>
		`,
		initialize: () => {
			/** @type {ListComp} */
			// @ts-ignore
			const list = comp._parent_comp;

			/** @type {ProductComp} */
			// @ts-ignore
			const product_comp = list._parent_comp._parent_comp._parent_comp;
		},
	});
}
