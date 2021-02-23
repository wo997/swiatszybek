/* js[view] */

domload(() => {
	loadedProductCategories();

	/** @type {ProductCategoriesComp} */
	// @ts-ignore
	const product_categories_comp = $("product-categories-comp");

	productCategoriesComp(product_categories_comp, undefined);
});
