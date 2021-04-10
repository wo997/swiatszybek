/* js[admin] */

/**
 * @typedef {{
 * product_variant_id: number
 * general_product_id: number
 * name: string
 * options: Product_VariantOptionCompData[]
 * pos?: number
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
function product_variantComp(comp, parent, data = { product_variant_id: -1, general_product_id: -1, name: "", options: [] }) {
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
			<list-comp data-bind="{${data.options}}" class="wireframe space" data-primary="product_variant_option_id">
				<product_variant-option-comp></product_variant-option-comp>
			</list-comp>
		`,

		initialize: () => {
			comp._nodes.add_option_btn.addEventListener("click", () => {
				showLoader();

				xhr({
					url: STATIC_URLS["ADMIN"] + "/general_product/variant/option/save",
					params: {
						product_variant_option: {
							product_variant_id: comp._data.product_variant_id,
							name: "",
						},
					},
					success: (res) => {
						const product_variant_option = res.product_variant_option;
						comp._data.options.push({
							product_variant_option_id: product_variant_option.product_variant_option_id,
							product_variant_id: product_variant_option.product_variant_id,
							name: product_variant_option.name,
						});
						comp._render();
						hideLoader();
					},
				});
			});
		},
	});
}
