/* js[admin] */

/**
 * @typedef {{
 * category_list: ProductSubCategoriesCompData
 * }} ProductCategoriesCompData
 *
 * @typedef {{
 * _data: ProductCategoriesCompData
 * _set_data(data?: ProductCategoriesCompData, options?: SetCompDataOptions)
 * _nodes: {
 *      add_btn: PiepNode
 *      save_btn: PiepNode
 * } & CompWithHistoryNodes
 * _recreate_tree()
 * _save()
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
			category_list: { categories: [] },
		};
	}

	comp._recreate_tree = () => {
		comp._data.category_list.categories = [];

		/**
		 *
		 * @param {ProductSubCategoryCompData} branch
		 * @param {ProductCategoryBranch[]} sub_categories
		 */
		const connectWithParent = (branch, sub_categories) => {
			const list = branch ? branch.category_list.categories : comp._data.category_list.categories;
			for (const copy_cat of sub_categories) {
				/** @type {ProductSubCategoryCompData} */
				const sub_cat = {
					name: copy_cat.name,
					product_category_id: copy_cat.product_category_id,
					category_list: { categories: [] },
				};
				list.push(sub_cat);
				connectWithParent(sub_cat, copy_cat.sub_categories);
			}
		};

		connectWithParent(undefined, product_categories_tree);

		comp._render({ freeze: true });
	};

	comp._save = () => {
		/**
		 *
		 * @param {ProductSubCategoryCompData[]} categories
		 * @return {ProductCategoryBranch[]}
		 */
		const traverse = (categories) => {
			let data = [];
			let pos = 0;

			for (const cat of categories) {
				pos++;
				const sub_categories = traverse(cat.category_list.categories);
				data.push({
					name: cat.name,
					pos,
					product_category_id: cat.product_category_id,
					sub_categories,
				});
			}

			return data;
		};

		const data = traverse(comp._data.category_list.categories);

		xhr({
			url: STATIC_URLS["ADMIN"] + "product/category/save_all",
			params: {
				product_categories: data,
			},
			success: (res) => {
				showNotification("Zapisano kategorie produktów", {
					one_line: true,
					type: "success",
				});
				setTimeout(refreshProductCategories, 200);
			},
		});
	};

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				setTimeout(() => {
					comp._children(".round_top").forEach((e) => e.classList.remove("round_top"));
					comp._children("product-sub-category-comp").forEach((/** @type {ProductSubCategoryComp} */ com) => {
						if (!com._data) {
							return;
						}
						const list_row = com._parent(".list_row");
						const pr = list_row._prev();
						const ne = list_row._next();
						const round = com._data.category_list.categories.length > 0;
						const category_wrapper = com._child(".category_wrapper");
						category_wrapper.classList.toggle("round_bottom", !ne || round);
						if (!pr) {
							category_wrapper.classList.add("round_top");
						}
						if (ne && round) {
							ne._child(".category_wrapper").classList.add("round_top");
						}
					});
				});
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<p-trait data-trait="history"></p-trait>
			<button class="btn primary" data-node="{${comp._nodes.save_btn}}">Zapisz <i class="fas fa-save"></i></button>
			<product-sub-categories-comp data-bind="{${data.category_list}}"></product-sub-categories-comp>
			<button class="btn primary" data-tooltip="Dodaj kategorię podrzędną" data-node="{${comp._nodes.add_btn}}" style="margin:15px 0 50px">
				Dodaj kategorię główną
				<i class="fas fa-plus"></i>
			</button>
		`,
		ready: () => {
			comp._recreate_tree();

			comp._nodes.save_btn.addEventListener("click", () => {
				comp._save();
			});

			const product_category_modal_comp = registerProductCategoryModal();
			const add_btn = comp._nodes.add_btn;
			add_btn.addEventListener("click", () => {
				product_category_modal_comp._show({
					source: add_btn,
					save_callback: (cat) => {
						comp._data.category_list.categories.push({
							name: cat.name,
							product_category_id: cat.product_category_id,
							category_list: { categories: [] },
						});
						comp._render();
					},
				});
			});

			window.addEventListener("product_categories_changed", () => {
				comp._recreate_tree();
			});
		},
	});
}
