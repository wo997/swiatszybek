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
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			pass_list_data: [{ what: "feature_id", where: "options" }],
			render: () => {
				const feature = product_features.find((e) => e.feature_id === data.feature_id);
				if (feature) {
					comp._nodes.feature_name._set_content(feature.name);
				}
			},
		});
	};

	createComp(comp, parent, data, {
		template: /*html*/ `
            <div class="variant_header">
                <div class="title inline semi-bold" data-node="{${comp._nodes.feature_name}}"></div>
                <div>
                    <p-batch-trait data-trait="list_controls"></p-batch-trait>
                </div>
            </div>

            <span html="{${"Opcje: (" + data.options.length + ")"}}"></span>
            <button data-node="add_option_btn" class="btn primary small">Wybierz <i class="fas fa-search"></i></button>

            <list-comp data-bind="{${data.options}}" class="options">
                <product-variant-option-comp></product-variant-option-comp>
            </list-comp>
        `,
		initialize: () => {
			comp.classList.add("product_variant");
		},
	});
}
