/* js[view] */

domload(() => {
	/** @type {MenusComp} */
	// @ts-ignore
	const menus_comp = $("menus-comp.main");

	MenusComp(menus_comp, undefined);

	$(".main_header .history_btns_wrapper").appendChild(menus_comp._nodes.history);
	$(".main_header .save_btn_wrapper").appendChild(menus_comp._nodes.save_btn);

	/** @type {SelectableComp} */
	// @ts-ignore
	const selectable = $("selectable-comp");

	/** @type {SelectableOptionData[]} */
	let category_options = [];

	/**
	 *
	 * @param {ProductCategoryBranch[]} category_branch
	 * @param {number} level
	 */
	const traverse = (category_branch, level = 0, slug = "") => {
		category_branch.forEach((category) => {
			const cat_display = slug + (slug ? " ― " : "") + category.name;
			category_options.push({ label: cat_display, value: category.product_category_id + "" });
			if (level < 1) {
				traverse(category.sub_categories, level + 1, cat_display);
			}
		});
	};
	traverse(product_categories_tree);

	SelectableComp(selectable, undefined, {
		options: {
			single: true,
		},
		dataset: category_options,
	});
});
