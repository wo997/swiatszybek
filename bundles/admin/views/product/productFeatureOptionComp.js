/* js[view] */

/**
 * @typedef {{
 * product_feature_option_id: number
 * name: string
 * selected?: boolean
 * } & ListCompRowData} ProductFeatureOptionCompData
 *
 * @typedef {{
 * _data: ProductFeatureOptionCompData
 * _set_data(data?: ProductFeatureOptionCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * } & BaseComp} ProductFeatureOptionComp
 */

/**
 * @param {ProductFeatureOptionComp} comp
 * @param {*} parent
 * @param {ProductFeatureOptionCompData} data
 */
function productFeatureOptionComp(comp, parent, data) {
	comp._set_data = (data = { product_feature_option_id: -1, name: "" }, options = {}) => {
		data.selected = def(data.selected, false);
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="option_row">
				<div style="margin-right:auto">
					<p-checkbox class="square inline" data-bind="{${data.selected}}"></p-checkbox>
					<input type="text" class="field inline small" data-bind="{${data.name}}" />
				</div>
				<div>
					<p-batch-trait data-trait="list_controls"></p-batch-trait>
				</div>
			</div>
		`,
		initialize: () => {},
	});
}
