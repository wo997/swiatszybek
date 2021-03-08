/* js[global] */

domload(() => {
	/** @type {CartProductComp} */
	// @ts-ignore
	const cart_products_comp = $("header cart-products-comp.all_products");
	if (!cart_products_comp) {
		return;
	}
	cartProductsComp(cart_products_comp, undefined);

	const loadCart = () => {
		cart_products_comp._data.products = user_cart.products;
		cart_products_comp._render();
		const empty = user_cart.products.length === 0;
		expand($(".case_cart_not_empty"), !empty);
		expand($(".case_cart_empty"), empty);

		$$(".cart_product_count").forEach((e) => {
			e._set_content(user_cart.products.length);
		});
		$$(".cart_products_price").forEach((e) => {
			e._set_content(user_cart.products_price + " zł");
		});
		$$(".cart_delivery_price").forEach((e) => {
			e._set_content(user_cart.delivery_price + " zł");
		});
		$$(".cart_total_price").forEach((e) => {
			e._set_content(user_cart.total_price + " zł");
		});
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
