/* js[global] */

/**
 * @typedef {{
 * products: LastViewedProducts_ProductCompData[]
 * }} LastViewedProductsCompData
 *
 * @typedef {{
 * _data: LastViewedProductsCompData
 * _set_data(data?: LastViewedProductsCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * } & BaseComp} LastViewedProductsComp
 */

/**
 * @param {LastViewedProductsComp} comp
 * @param {*} parent
 * @param {LastViewedProductsCompData} data
 */
function lastViewedProductsComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			products: [],
		};
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<list-comp data-bind="{${data.products}}" data-primary="general_product_id" class="striped space open">
				<last-viewed-products_product-comp></last-viewed-products_product-comp>
			</list-comp>
		`,
		initialize: () => {},
	});
}
