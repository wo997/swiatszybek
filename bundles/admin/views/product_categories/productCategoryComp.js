/* js[view] */

/**
 * @typedef {{
 * name: string
 * category_list: ProductCategoriesCompData
 * } & ListCompRowData} ProductCategoryCompData
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
		//<input class="field small inline" data-bind="{${data.name}}" placeholder="Nazwa kategorii" />
		template: html`
			<div class="category_wrapper">
				<span class="category_name" html="{${data.name}}"></span>
				<button class="btn subtle small" data-tooltip="Edytuj kategorię"><i class="fas fa-edit"></i></button>
				<button class="btn subtle small" data-tooltip="Dodaj kategorię podrzędną"><i class="fas fa-plus"></i></button>
				<p-trait
					data-trait="multi_list_grab_btn"
					data-multi_row_selector=".category_wrapper"
					data-tooltip="Zmień położenie kategorię"
					data-invisible="true"
				></p-trait>
			</div>
			<product-categories-comp data-bind="{${data.category_list}}"></product-categories-comp>
		`,
		//<p-trait data-trait="list_delete_btn" data-tooltip="Usuń kategorię"></p-trait>

		initialize: () => {},
	});
}
