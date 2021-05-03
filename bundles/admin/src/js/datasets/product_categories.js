/* js[!admin] */

/**
 *
 * @typedef {{
 * product_category_id: number
 * parent_product_category_id?: number
 * name: string
 * pos: number
 * __category_path_json?: any
 * __category_path_names_csv?: string
 * __product_count: number
 * }} ProductCategoryData
 */

/**
 * @typedef {{
 * sub_categories: ProductCategoryBranch[]
 * } & ProductCategoryData} ProductCategoryBranch
 */

/** @type {ProductCategoryData[]} */
let product_categories;

/** @type {ProductCategoryBranch[]} */
let product_categories_tree;

function loadedProductCategories() {
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
					__product_count: cat.__product_count,
					__category_path_names_csv: cat.__category_path_names_csv,
				};
				list.push(sub_cat);
				connectWithParent(sub_cat);
			}
		}
		list.sort((a, b) => Math.sign(a.pos - b.pos));
	};

	connectWithParent(undefined);
}

function refreshProductCategories() {
	xhr({
		url: STATIC_URLS["ADMIN"] + "/product/category/all",
		success: (res) => {
			product_categories = res;
			loadedProductCategories();
			window.dispatchEvent(new CustomEvent("product_categories_changed"));
		},
	});
}
