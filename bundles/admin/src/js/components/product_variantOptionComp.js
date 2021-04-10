/* js[admin] */

/**
 * @typedef {{
 * product_variant_option_id: number
 * product_variant_id: number
 * name: string
 * pos?: number
 * } & ListCompRowData} Product_VariantOptionCompData
 *
 * @typedef {{
 * _data: Product_VariantOptionCompData
 * _set_data(data?: Product_VariantOptionCompData, options?: SetCompDataOptions)
 * _nodes: {
 * } & ListControlTraitNodes
 * } & BaseComp} Product_VariantOptionComp
 */

/**
 * @param {Product_VariantOptionComp} comp
 * @param {*} parent
 * @param {Product_VariantOptionCompData} data
 */
function product_variantOptionComp(
	comp,
	parent,
	data = {
		product_variant_option_id: -1,
		product_variant_id: -1,
		name: "",
	}
) {
	let last_saved_product_feature_option;

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<input class="field small inline" data-bind="{${data.name}}" />
			<div style="margin-left:auto">
				<p-batch-trait data-trait="list_controls"></p-batch-trait>
			</div>
		`,
		initialize: () => {
			/** @type {ListComp} */
			// @ts-ignore
			const list = comp._parent_comp;

			/** @type {ProductComp} */
			// @ts-ignore
			const product_comp = list._parent_comp._parent_comp._parent_comp;
		},
	});
}
