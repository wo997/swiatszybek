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
            {{@row_index+1}}
            <input type="text" class="field inline" data-bind="name">

            <p-batch-trait data-trait="list_controls"></p-batch-trait>
            <p-component data-bind="state"></p-component>
        `,

		// {{#list_down_btn}}
		// {{#list_up_btn}}
		// {{#list_delete_btn}}
		initialize: () => {
			node.classList.add("product_variant");
		},
		setData: (
			/** @type {ProductVariantComponentData} */ data = undefined,
			options = {}
		) => {
			setComponentData(node, data, {
				...options,
				render: () => {
					//node._nodes.idk._set_content(JSON.stringify(node._data));
				},
			});
		},
	});
}
