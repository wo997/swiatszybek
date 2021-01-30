/* js[view] */

/**
 * @typedef {{
 * email: string
 * list_length?: number
 * name: string
 * } & ListCompRowData} ProductVariantCompData
 *
 * @typedef {{
 * _data: ProductVariantCompData
 * _prev_data: ProductVariantCompData
 * _set_data(data?: ProductVariantCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * } & BaseComp} ProductVariantComp
 */

/**
 * @param {ProductVariantComp} node
 * @param {*} parent
 * @param {ProductVariantCompData} data
 */
function productVariantComp(node, parent, data = undefined) {
	if (data === undefined) {
		data = { email: "", name: "" };
	}

	// you can add classes like this inline: {even:${data.row_index % 2 === 0}}

	createComp(node, parent, data, {
		template: /*html*/ `
            {${data.row_index + 1}}
            <select class="field inline">
                <option value="a">A</option>
                <option value="b">B</option>
                <option value="c">C</option>
            </select>
            <input type="text" data-bind="{${data.name}}" class="field inline">

            <p-batch-trait data-trait="list_controls"></p-batch-trait>

            {${JSON.stringify(data)}}
        `,

		initialize: () => {
			node.classList.add("product_variant");
		},
		setData: (
			/** @type {ProductVariantCompData} */ data = undefined,
			options = {}
		) => {
			setCompData(node, data, {
				...options,
				render: () => {},
			});
		},
	});
}
