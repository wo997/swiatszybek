/* js[view] */

/**
 * @typedef {{
 * feature_id?: number
 * option_id: number
 * name?: string
 * } & ListCompRowData} ProductVariantOptionCompData
 *
 * @typedef {{
 * _data: ProductVariantOptionCompData
 * _set_data(data?: ProductVariantOptionCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  option_name: PiepNode
 * }
 * } & BaseComp} ProductVariantOptionComp
 */

/**
 * @param {ProductVariantOptionComp} comp
 * @param {*} parent
 * @param {ProductVariantOptionCompData} data
 */
function productVariantOptionComp(comp, parent, data = { option_id: -1, name: "" }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				const option = feature.options.find((e) => e.option_id === data.option_id);

				if (option && option) {
					comp._nodes.option_name._set_content(option.name);
				} else {
					/** @type {ListComp} */
					// @ts-ignore
					const parent = comp._parent_comp;
					parent._removeRow(comp._data.row_index);
				}
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
