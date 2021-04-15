/* js[admin] */

/**
 * @typedef {{
 * product_category_id: number
 * name: string
 * categories: ProductSubCategoryCompData[]
 * expanded: boolean
 * } & ListCompRowData} ProductSubCategoryCompData
 *
 * @typedef {{
 * _data: ProductSubCategoryCompData
 * _set_data(data?: ProductSubCategoryCompData, options?: SetCompDataOptions)
 * _nodes: {
 * categories: ProductSubCategoryComp
 * edit_btn: PiepNode
 * add_btn: PiepNode
 * expand: PiepNode
 * }
 * } & BaseComp} ProductSubCategoryComp
 */

/**
 * @param {ProductSubCategoryComp} comp
 * @param {*} parent
 * @param {ProductSubCategoryCompData} data
 */
function ProductSubCategoryComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			product_category_id: -1,
			name: "",
			categories: [],
			expanded: true,
		};
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				comp.dataset.product_category_id = data.product_category_id + "";
				expand(comp._nodes.expand, data.expanded);
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="category_wrapper">
				<span class="category_name" html="{${data.name}}"></span>
				<p-trait data-trait="expand_multi_list_btn"></p-trait>
				<button class="btn subtle small multi_list_add_btn" data-tooltip="Dodaj kategorię podrzędną" data-node="{${comp._nodes.add_btn}}">
					<i class="fas fa-plus"></i>
				</button>
				<button class="btn subtle small" data-tooltip="Edytuj kategorię" data-node="{${comp._nodes.edit_btn}}">
					<i class="fas fa-edit"></i>
				</button>
				<p-trait data-trait="multi_list_grab_btn" data-tooltip="Zmień położenie kategorię" data-invisible="1"></p-trait>
			</div>
			<div class="expand_y" data-node="{${comp._nodes.expand}}">
				<list-comp data-bind="{${data.categories}}" class="clean">
					<product-sub-category-comp></product-sub-category-comp>
				</list-comp>
			</div>
		`,
		ready: () => {
			/** @type {ListComp} */
			// @ts-ignore
			const parent = comp._parent_comp;

			const edit_btn = comp._nodes.edit_btn;
			//const data = comp._data;
			edit_btn.addEventListener("click", () => {
				const data = comp._data;

				/** @type {ProductCategoryModalCompData} */
				const cat = {
					name: data.name,
					parent_product_category_id: product_categories.find((c) => c.product_category_id === data.product_category_id)
						.parent_product_category_id,
					product_category_id: data.product_category_id,
				};
				getProductCategoryModal()._show({
					cat,
					source: edit_btn,
					save_callback: (cat) => {
						data.name = cat.name;

						const category_data = product_categories.find((c) => c.product_category_id === data.product_category_id);
						if (category_data.parent_product_category_id !== cat.parent_product_category_id) {
							/** @type {ProductCategoriesComp} */
							// @ts-ignore
							const categories_comp = comp._parent("product-categories-comp");

							//const multi_master = comp._parent(".multi_master");

							/** @type {ProductSubCategoryComp} */
							// @ts-ignore
							const sub_category_comp =
								cat.parent_product_category_id > 0
									? categories_comp._child(`[data-product_category_id="${cat.parent_product_category_id}"]`)
									: undefined;

							const push_data = cloneObject(data);
							delete push_data.row_id;

							const cat_target = sub_category_comp ? sub_category_comp : categories_comp;
							cat_target._data.categories.push(push_data);
							cat_target._render({ freeze: true });

							parent.classList.add("freeze");
							parent._remove_row(data.row_index);
							parent.classList.remove("remove");

							categories_comp._children(`[data-product_category_id="${cat.product_category_id}"]`).forEach((just_created_comp) => {
								if (just_created_comp !== comp) {
									scrollIntoView(just_created_comp);
								}
							});
						}
					},
					delete_callback: () => {
						parent._remove_row(data.row_index);
					},
				});
			});

			const add_btn = comp._nodes.add_btn;
			add_btn.addEventListener("click", () => {
				getProductCategoryModal()._show({
					source: add_btn,
					save_callback: (cat) => {
						comp._data.categories.unshift({
							name: cat.name,
							product_category_id: cat.product_category_id,
							categories: [],
							expanded: true,
						});
						comp._render();
					},
				});
			});
		},
	});
}
