/* js[view] */

domload(() => {
	/** @type {ProductCategoriesComp} */
	// @ts-ignore
	const product_categories_comp = $("product-categories-comp");

	ProductCategoriesComp(product_categories_comp, undefined);

	$(".main_header .history_btns_wrapper").appendChild(product_categories_comp._nodes.history);
	$(".main_header .save_btn_wrapper").appendChild(product_categories_comp._nodes.save_btn);
});
