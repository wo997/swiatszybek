/* js[view] */

/**
 * @typedef {{
 * name: string
 * category_list: ProductCategoriesCompData
 * }} ProductCategoryCompData
 *
 * @typedef {{
 * _data: ProductCategoryCompData
 * _set_data(data?: ProductCategoryCompData, options?: SetCompDataOptions)
 * _nodes: {
 * categories: ProductCategoryComp
 * }
 * } & BaseComp} ProductCategoryComp
 */

/**
 * @param {ProductCategoryComp} comp
 * @param {*} parent
 * @param {ProductCategoryCompData} data
 */
function productCategoryComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			name: "",
			category_list: {
				categories: [],
			},
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
			<div>
				<input class="field" data-bind="{${data.name}}" placeholder="Nazwa kategorii" />
				<product-categories-comp data-bind="{${data.category_list}}"></product-categories-comp>
			</div>
		`,
		initialize: () => {},
	});
}
