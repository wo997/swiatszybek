/* js[global] */

domload(() => {
	/** @type {LastViewedProductsComp} */
	// @ts-ignore
	const last_viewed_products_comp = $("header last-viewed-products-comp");
	if (!last_viewed_products_comp) {
		return;
	}
	lastViewedProductsComp(last_viewed_products_comp, undefined);

	const loadLastViewdProducts = () => {
		last_viewed_products_comp._data.products = last_viewed_products.filter((e) => {
			if (typeof general_product_id !== "undefined") {
				return e.general_product_id !== general_product_id;
			}
			return true;
		});
		last_viewed_products_comp._render();
		const empty = user_cart.products.length === 0;
		$$(".case_last_viewed_products_not_empty").forEach((ne) => {
			expand(ne, !empty);
		});
		$$(".case_last_viewed_products_empty").forEach((e) => {
			expand(e, empty);
		});
	};

	window.addEventListener("last_viewed_products_changed", loadLastViewdProducts);
	loadLastViewdProducts();
});
