/* js[view] */

/**
 * @typedef {{
 * categories: ProductSubCategoryCompData[]
 * }} ProductSubCategoriesCompData
 *
 * @typedef {{
 * _data: ProductSubCategoriesCompData
 * _set_data(data?: ProductSubCategoriesCompData, options?: SetCompDataOptions)
 * _nodes: {
 * } & CompWithHistoryNodes
 * } & BaseComp} ProductSubCategoriesComp
 */

/**
 * @param {ProductSubCategoriesComp} comp
 * @param {*} parent
 * @param {ProductSubCategoriesCompData} data
 */
function productSubCategoriesComp(comp, parent, data = undefined) {
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
		template: html` <list-comp data-bind="{${data.categories}}" class="clean">
			<product-sub-category-comp></product-sub-category-comp>
		</list-comp>`,
		initialize: () => {},
	});
}
