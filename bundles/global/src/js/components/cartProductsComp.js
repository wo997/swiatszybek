/* js[global] */

/**
 * @typedef {{
 * products: CartProducts_ProductCompData[]
 * no_redirect?: boolean
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
			pass_list_data: [{ what: "no_redirect", where: "products" }],
			render: () => {
				initBuy();
				setTimeout(() => {
					comp.classList.toggle("empty", data.products.length === 0);
				}, 250);
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<list-comp data-bind="{${data.products}}" data-primary="product_id" class="striped space">
				<cart-products_product-comp></cart-products_product-comp>
			</list-comp>
		`,
		initialize: () => {},
	});
}
