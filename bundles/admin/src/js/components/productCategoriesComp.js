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
 *_recreate_tree()
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

		comp._render();
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

			const history_wrapper = comp._nodes.history;
			const history_btns_wrapper = $(".main_header .history_btns_wrapper");
			if (history_btns_wrapper) {
				history_btns_wrapper.appendChild(history_wrapper);
			}

			const save_btn = comp._nodes.save_btn;
			const save_btn_wrapper = $(".main_header .save_btn_wrapper");
			if (save_btn_wrapper) {
				save_btn_wrapper.appendChild(save_btn);
			}
			save_btn.addEventListener("click", () => {});

			const product_category_modal_comp = registerProductCategoryModal();
			const add_btn = comp._nodes.add_btn;
			add_btn.addEventListener("click", () => {
				product_category_modal_comp._show(-1, { source: add_btn });
			});

			window.addEventListener("product_categories_changed", () => {
				comp._recreate_tree();
			});
		},
	});
}
