/* js[view] */

/**
 * @typedef {{
 * feature_id: number
 * options: ProductVariantOptionCompData[]
 * } & ListCompRowData} ProductVariantCompData
 *
 * @typedef {{
 * _data: ProductVariantCompData
 * _set_data(data?: ProductVariantCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  feature_name: PiepNode
 * }
 * } & BaseComp} ProductVariantComp
 */

/**
 * @param {ProductVariantComp} comp
 * @param {*} parent
 * @param {ProductVariantCompData} data
 */
function productVariantComp(comp, parent, data = { feature_id: -1, options: [] }) {
	comp._set_data = (data = undefined, options = {}) => {
		if (data === undefined) {
			data = comp._data;
		}

		setCompData(comp, data, {
			...options,
			pass_list_data: [{ what: "feature_id", where: "options" }],
			render: () => {
				const feature = product_features.find((e) => e.feature_id === comp._data.feature_id);
				if (feature) {
					comp._nodes.feature_name._set_content(feature.name);
				}
			},
		});
	};

	// you can add classes like this inline: {even:${data.row_index % 2 === 0}}

	createComp(comp, parent, data, {
		template: /*html*/ `
            <span html="{${data.row_index + 1 + "."}}"></span>
            <div class="title inline" data-node="{${comp._nodes.feature_name}}"></div>

            <p-batch-trait data-trait="list_controls"></p-batch-trait>

            <list-comp data-bind="{${data.options}}">
                <product-variant-option-comp></product-variant-option-comp>
            </list-comp>
        `,
		initialize: () => {
			comp.classList.add("product_variant");
		},
	});
}
