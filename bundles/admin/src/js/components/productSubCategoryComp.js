/* js[admin] */

/**
 * @typedef {{
 * product_category_id: number
 * name: string
 * category_list: ProductSubCategoriesCompData
 * } & ListCompRowData} ProductSubCategoryCompData
 *
 * @typedef {{
 * _data: ProductSubCategoryCompData
 * _set_data(data?: ProductSubCategoryCompData, options?: SetCompDataOptions)
 * _nodes: {
 * categories: ProductSubCategoryComp
 * edit_btn: PiepNode
 * add_btn: PiepNode
 * }
 * } & BaseComp} ProductSubCategoryComp
 */

/**
 * @param {ProductSubCategoryComp} comp
 * @param {*} parent
 * @param {ProductSubCategoryCompData} data
 */
function productSubCategoryComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			product_category_id: -1,
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
			<div class="category_wrapper">
				<span class="category_name" html="{${data.name}}"></span>
				<button class="btn subtle small" data-tooltip="Edytuj kategorię" data-node="{${comp._nodes.edit_btn}}">
					<i class="fas fa-edit"></i>
				</button>
				<button class="btn subtle small" data-tooltip="Dodaj kategorię podrzędną" data-node="{${comp._nodes.add_btn}}">
					<i class="fas fa-plus"></i>
				</button>
				<p-trait
					data-trait="multi_list_grab_btn"
					data-multi_row_selector=".category_wrapper"
					data-tooltip="Zmień położenie kategorię"
					data-invisible="1"
				></p-trait>
			</div>
			<product-sub-categories-comp data-bind="{${data.category_list}}"></product-sub-categories-comp>
		`,
		//<p-trait data-trait="list_delete_btn" data-tooltip="Usuń kategorię"></p-trait>

		ready: () => {
			const edit_btn = comp._nodes.edit_btn;
			edit_btn.addEventListener("click", () => {
				getProductCategoryModal()._show(data.product_category_id, { source: edit_btn });
			});

			const add_btn = comp._nodes.add_btn;
			add_btn.addEventListener("click", () => {
				getProductCategoryModal()._show(-1, { source: add_btn });
			});
		},
	});
}
