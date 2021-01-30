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
function createProductVariantComponent(node, parent, data = undefined) {
	if (data === undefined) {
		data = { email: "", name: "name" };
	}

	createComponent(node, parent, data, {
		template: /*html*/ `
            {{@row_index+1}}
            <input type="text" class="field inline" data-bind="name">

            <batch-trait data-trait="list_controls"></batch-trait>
        `,

		// {{#list_down_btn}}
		// {{#list_up_btn}}
		// {{#list_delete_btn}}
		initialize: () => {
			node.classList.add("product_variant");
			// node._nodes.delete_btn.addEventListener("click", () => {
			// 	if (parent._removeRow) {
			// 		parent._removeRow(node._data.row_index);
			// 	}
			// });
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
