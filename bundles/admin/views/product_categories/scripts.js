/* js[view] */

function refreshProductCategories() {
	xhr({
		url: STATIC_URLS["ADMIN"] + "product/categories/all",
		success: (res) => {
			product_categories = res;
			loadedProductCategories();
			window.dispatchEvent(new CustomEvent("product_categories_changed"));
		},
	});
}

function loadedProductCategories() {
	// seems to work!
	// product_categories = [
	// 	{ name: "a", pos: 0, product_category_id: 1, parent_product_category_id: -1 },
	// 	{ name: "b", pos: 1, product_category_id: 2, parent_product_category_id: 1 },
	// 	{ name: "c", pos: 0, product_category_id: 3, parent_product_category_id: 1 },
	// 	{ name: "d", pos: 0, product_category_id: 4, parent_product_category_id: 3 },
	// 	{ name: "e", pos: 0, product_category_id: 5, parent_product_category_id: -1 },
	// 	{ name: "f", pos: 0, product_category_id: 6, parent_product_category_id: -1 },
	// ];

	product_categories_tree = [];

	/**
	 *
	 * @param {ProductCategoryBranch} branch
	 */
	const connectWithParent = (branch) => {
		const list = branch ? branch.sub_categories : product_categories_tree;
		for (const cat of product_categories) {
			if (cat.parent_product_category_id === (branch ? branch.product_category_id : -1)) {
				/** @type {ProductCategoryBranch} */
				const sub_cat = {
					name: cat.name,
					product_category_id: cat.product_category_id,
					pos: cat.pos,
					sub_categories: [],
				};
				list.push(sub_cat);
				connectWithParent(sub_cat);
			}
		}
		list.sort((a, b) => Math.sign(a.pos - b.pos));
	};

	connectWithParent(undefined);
}

domload(() => {
	loadedProductCategories();

	/** @type {ProductCategoriesComp} */
	// @ts-ignore
	const product_categories_comp = $("product-categories-comp");

	productCategoriesComp(product_categories_comp, undefined);
});
