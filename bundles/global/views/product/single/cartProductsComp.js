/* js[view] */

/**
 * @typedef {{
 * products: CartProducts_ProductCompData[]
 * }} CartProductCompData
 *
 * @typedef {{
 * _data: CartProductCompData
 * _set_data(data?: CartProductCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * } & BaseComp} CartProductComp
 */

/**
 * @param {CartProductComp} comp
 * @param {*} parent
 * @param {CartProductCompData} data
 */
function cartProductsComp(comp, parent, data = undefined) {
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
			<list-comp data-bind="{${data.products}}" data-primary="product_id" class="wireframe">
				<cart-products_product-comp></cart-products_product-comp>
			</list-comp>
		`,
		initialize: () => {},
	});
}
