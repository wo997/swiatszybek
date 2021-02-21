/* js[view] */

/**
 * @typedef {{
 * categories: ProductCategoryCompData[]
 * }} ProductCategoriesCompData
 *
 * @typedef {{
 * _data: ProductCategoriesCompData
 * _set_data(data?: ProductCategoriesCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * } & BaseComp} ProductCategoriesComp
 */

/**
 * @param {ProductCategoriesComp} comp
 * @param {*} parent
 * @param {ProductCategoriesCompData} data
 */
function productCategoriesComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			categories: [],
		};
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<list-comp data-bind="{${data.categories}}">
				<product-category-comp></product-category-comp>
			</list-comp>
		`,
		initialize: () => {},
	});
}
