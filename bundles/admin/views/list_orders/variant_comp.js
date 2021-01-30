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
 * _set_data(data?: ProductVariantComponentData, options?: SetComponentDataOptions)
 * _nodes: {
 * }
 * } & BaseComponent} ProductVariantComponent
 */

/**
 * @param {ProductVariantComponent} node
 * @param {*} parent
 * @param {ProductVariantComponentData} data
 */
function productVariantComp(node, parent, data = undefined) {
	if (data === undefined) {
		data = { email: "", name: "name" };
	}

	createComponent(node, parent, data, {
		template: /*html*/ `
            {${data.row_index + 1}}
            <input type="text" data-bind="name" class="
                field inline
                some-class
                {pies:${data.row_index > 3}}
                {cat:${data.name == "qty"}}">

            <p-batch-trait data-trait="list_controls"></p-batch-trait>
            <p-component data-bind="state"></p-component>
            {${JSON.stringify(data)}}
        `,

		initialize: () => {
			node.classList.add("product_variant");
		},
		setData: (
			/** @type {ProductVariantComponentData} */ data = undefined,
			options = {}
		) => {
			setComponentData(node, data, {
				...options,
				render: () => {},
			});
		},
	});
}
