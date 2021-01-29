/* js[view] */

/**
 * @typedef {{
 * email: string
 * list_length?: number
 * name: string
 * } & ListComponentRowData} ProductVariantComponentData
 *
 * @typedef {{
 * _data: ProductVariantComponentData
 * _prev_data: ProductVariantComponentData
 * _setData(data?: ProductVariantComponentData, options?: SetComponentDataOptions)
 * _nodes: {
 * }
 * } & BaseComponent} ProductVariantComponent
 */

/**
 * @param {ProductVariantComponent} node
 * @param {*} parent
 * @param {ProductVariantComponentData} data
 */
function createProductVariantComponent(node, parent, data = undefined) {
	if (data === undefined) {
		data = { email: "", name: "name" };
	}

	createComponent(node, parent, data, {
		template: /*html*/ `
            <span data-node="row_index"></span>
            <input type="text" class="field inline" data-bind="name">
        `,
		initialize: () => {
			node.classList.add("product_variant");
			node._setData = (data = undefined, options = {}) => {
				setComponentData(node, data, {
					...options,
					render: () => {
						//node._nodes.idk._set_content(JSON.stringify(node._data));
					},
				});
			};
		},
	});
}
