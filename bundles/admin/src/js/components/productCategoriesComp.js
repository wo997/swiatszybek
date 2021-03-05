/* js[admin] */

/**
 * @typedef {{
 * categories: ProductSubCategoryCompData[]
 * }} ProductCategoriesCompData
 *
 * @typedef {{
 * _data: ProductCategoriesCompData
 * _set_data(data?: ProductCategoriesCompData, options?: SetCompDataOptions)
 * _nodes: {
 *      add_btn: PiepNode
 *      save_btn: PiepNode
 *      expand_all_btn: PiepNode
 *      shrink_all_btn: PiepNode
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
			categories: [],
		};
	}

	comp._recreate_tree = () => {
		comp._data.categories = [];

		/**
		 *
		 * @param {ProductSubCategoryCompData} branch
		 * @param {ProductCategoryBranch[]} sub_categories
		 */
		const connectWithParent = (branch, sub_categories) => {
			const list = branch ? branch.categories : comp._data.categories;
			for (const copy_cat of sub_categories) {
				/** @type {ProductSubCategoryCompData} */
				const sub_cat = {
					name: copy_cat.name,
					product_category_id: copy_cat.product_category_id,
					categories: [],
					expanded: true,
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
				const sub_categories = traverse(cat.categories);
				data.push({
					name: cat.name,
					pos,
					product_category_id: cat.product_category_id,
					sub_categories,
				});
			}

			return data;
		};

		const data = traverse(comp._data.categories);

		xhr({
			url: STATIC_URLS["ADMIN"] + "/product/category/save_all",
			params: {
				product_categories: data,
			},
			success: (res) => {
				comp.dispatchEvent(new CustomEvent("saved_product_categories"));
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
						const round = com._data.categories.length > 0;
						const category_wrapper = com._child(".category_wrapper");
						category_wrapper.classList.toggle("round_bottom", !ne || round);
						if (!pr) {
							category_wrapper.classList.add("round_top");
						}
						if (ne && round) {
							ne._child(".category_wrapper").classList.add("round_top");
						}

						// expand_btn
						const expand_multi_list_btn = com._child(".node_expand_multi_list_btn");

						let lr = list_row;
						let level = 0;
						while (lr) {
							level++;
							lr = lr._parent(".list_row");
						}
						const max_expand = 1;

						const active = level <= max_expand && com._data.categories.length > 0;
						expand_multi_list_btn.classList.toggle("active", active);

						// sometimes the user can do nothing so pls don't hide the contents
						if (!active && !expand_multi_list_btn.classList.contains("expanded")) {
							expand_multi_list_btn.click();
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

			<button class="btn primary" data-node="{${comp._nodes.add_btn}}">
				Dodaj kategorię główną
				<i class="fas fa-plus"></i>
			</button>

			<button class="btn subtle" data-node="{${comp._nodes.shrink_all_btn}}">
				Zwiń wszystko
				<i class="fas fa-angle-double-up"></i>
			</button>
			<button class="btn subtle" data-node="{${comp._nodes.expand_all_btn}}">
				Rozwiń wszystko
				<i class="fas fa-angle-double-down"></i>
			</button>

			<div style="height:20px"></div>

			<div style="position: relative;user-select: none;">
				<list-comp
					data-bind="{${data.categories}}"
					class="clean multi_master"
					data-max_level="3"
					data-multi_row_selector=".category_wrapper"
				>
					<product-sub-category-comp></product-sub-category-comp>
				</list-comp>
			</div>

			<div style="height:50px"></div>
		`,
		ready: () => {
			setTimeout(() => {
				comp._recreate_tree();
			});

			comp._nodes.save_btn.addEventListener("click", () => {
				comp._save();
			});

			const product_category_modal_comp = getProductCategoryModal();
			const add_btn = comp._nodes.add_btn;
			add_btn.addEventListener("click", () => {
				product_category_modal_comp._show({
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

			comp._nodes.expand_all_btn.addEventListener("click", () => {
				comp._children(".node_expand_multi_list_btn.active:not(.expanded)").forEach((e) => {
					e.click();
				});
			});

			comp._nodes.shrink_all_btn.addEventListener("click", () => {
				comp._children(".node_expand_multi_list_btn.active.expanded").forEach((e) => {
					e.click();
				});
			});

			window.addEventListener("product_categories_changed", () => {
				comp._recreate_tree();
			});
		},
	});
}
