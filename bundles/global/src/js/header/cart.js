/* js[modules/main_menu] */

domload(() => {
	/** @type {CartProductsComp} */
	// @ts-ignore
	const cart_products_comp = $("header cart-products-comp.all_products");
	if (!cart_products_comp) {
		return;
	}
	CartProductsComp(cart_products_comp, undefined);

	const loadCart = () => {
		cart_products_comp._data.products = user_cart.products;
		cart_products_comp._render();
	};

	window.addEventListener("user_cart_changed", loadCart);
	loadCart();

	$("header .basket_icon_wrapper").addEventListener("click", () => {
		if (cart_products_comp._data.products.length === 0) {
			return;
		}
		window.location.href = "/kup-teraz";
	});
});
