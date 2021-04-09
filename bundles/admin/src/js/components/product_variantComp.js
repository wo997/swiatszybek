/* js[admin] */

/**
 * @typedef {{
 * name: string
 * options: string[]
 * } & ListCompRowData} Product_VariantCompData
 *
 * @typedef {{
 * _data: Product_VariantCompData
 * _set_data(data?: Product_VariantCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  add_option_btn: PiepNode
 * } & ListControlTraitNodes
 * } & BaseComp} Product_VariantComp
 */

/**
 * @param {Product_VariantComp} comp
 * @param {*} parent
 * @param {Product_VariantCompData} data
 */
function product_variantComp(comp, parent, data = { name: "", options: [] }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="variant_header">
				<span class="semi_bold mr2" html="{${data.row_index + 1 + "."}}"></span>
				<input class="field small inline" data-bind="{${data.name}}" />
				<button
					style="margin-left:5px"
					data-node="{${comp._nodes.add_option_btn}}"
					class="btn {${data.options.length === 0}?important:primary} small"
				>
					Dodaj opcje <i class="fas fa-plus"></i>
				</button>

				<div style="margin-left:auto">
					<p-batch-trait data-trait="list_controls"></p-batch-trait>
				</div>
			</div>

			<list-comp data-bind="{${data.options}}" class="wireframe space">
				<!-- data-primary="product_feature_option_id" -->
				<!-- <product_feature-option-comp></product_feature-option-comp> -->
			</list-comp>
		`,
		initialize: () => {},
	});
}
