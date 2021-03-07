/* js[view] */

domload(() => {
	/** @type {CartProductComp} */
	// @ts-ignore
	const cart_products_comp = $("cart-products-comp.buy_products");
	if (!cart_products_comp) {
		return;
	}
	cartProductsComp(cart_products_comp, undefined);

	const loadCart = () => {
		cart_products_comp._data.products = user_cart.products;
		cart_products_comp._render();
		const empty = cart_products_comp._data.products.length === 0;
		expand($(".case_basket_not_empty"), !empty);
		expand($(".case_basket_empty"), empty);

		$$(".basket_item_count").forEach((e) => {
			e._set_content(cart_products_comp._data.products.length);
		});
	};

	window.addEventListener("user_cart_changed", loadCart);
	loadCart();
});
