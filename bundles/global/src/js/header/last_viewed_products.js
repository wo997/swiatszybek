/* js[modules/main_menu] */

domload(() => {
	/** @type {LastViewedProductsComp} */
	// @ts-ignore
	const last_viewed_products_comp = $("last-viewed-products-comp"); // a single node that jumps between a header and modal, tricky
	if (!last_viewed_products_comp) {
		return;
	}
	LastViewedProductsComp(last_viewed_products_comp, undefined);

	const loadLastViewdProducts = () => {
		last_viewed_products_comp._data.products = last_viewed_products.filter((e) => {
			if (typeof general_product_id !== "undefined") {
				return e.general_product_id !== general_product_id;
			}
			return true;
		});
		last_viewed_products_comp._render();
		const empty = last_viewed_products_comp._data.products.length === 0;
		expand($(".case_last_viewed_products_not_empty"), !empty);
		expand($(".case_last_viewed_products_empty"), empty);
	};

	window.addEventListener("last_viewed_products_changed", loadLastViewdProducts);
	loadLastViewdProducts();

	loadedLastViewedProducts();
});
