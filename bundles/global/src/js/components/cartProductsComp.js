/* js[global] */

/**
 * @typedef {{
 * products: CartProducts_ProductCompData[]
 * no_redirect?: boolean
 * }} CartProductsCompData
 *
 * @typedef {{
 * _data: CartProductsCompData
 * _set_data(data?: CartProductsCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * } & BaseComp} CartProductsComp
 */

/**
 * @param {CartProductsComp} comp
 * @param {*} parent
 * @param {CartProductsCompData} data
 */
function CartProductsComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			products: [],
		};
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			pass_list_data: [{ what: "no_redirect", where: "products" }],
			render: () => {
				setTimeout(initBuy);
				setTimeout(() => {
					comp.classList.toggle("empty", data.products.length === 0);
				}, 250);
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<list-comp data-bind="{${data.products}}" data-primary="product_id" class="striped space open">
				<cart-products_product-comp></cart-products_product-comp>
			</list-comp>
		`,
		initialize: () => {},
	});
}
