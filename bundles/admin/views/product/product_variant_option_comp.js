/* js[view] */

/**
 * @typedef {{
 * option_id: number
 * name?: string
 * } & ListCompRowData} ProductVariantOptionCompData
 *
 * @typedef {{
 * _data: ProductVariantOptionCompData
 * _set_data(data?: ProductVariantOptionCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * } & BaseComp} ProductVariantOptionComp
 */

/**
 * @param {ProductVariantOptionComp} node
 * @param {*} parent
 * @param {ProductVariantOptionCompData} data
 */
function productVariantOptionComp(
	node,
	parent,
	data = { option_id: -1, name: "" }
) {
	node._set_data = (data = undefined, options = {}) => {
		setCompData(node, data, {
			...options,
			render: () => {},
		});
	};

	// you can add classes like this inline: {even:${data.row_index % 2 === 0}}

	createComp(node, parent, data, {
		template: /*html*/ `
            <input type="text" data-bind="{${data.name}}" class="field inline">
            <p-batch-trait data-trait="list_controls"></p-batch-trait>
        `,
		initialize: () => {
			node.classList.add("product_variant");
		},
	});
}
