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
	comp._set_data = (data = undefined, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				const feature = product_features.find((e) => e.feature_id === comp._data.feature_id);
				if (feature) {
					const option = feature.options.find((e) => e.option_id === comp._data.option_id);

					if (option) {
						comp._nodes.option_name._set_content(option.name);
					}
				}
			},
		});
	};

	// you can add classes like this inline: {even:${data.row_index % 2 === 0}}

	createComp(comp, parent, data, {
		template: /*html*/ `
            <div class="title inline" data-node="{${comp._nodes.option_name}}"></div>    

            <p-batch-trait data-trait="list_controls"></p-batch-trait>
        `,
		initialize: () => {
			comp.classList.add("product_variant");
		},
	});
}
