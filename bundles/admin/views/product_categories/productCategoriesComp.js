/* js[view] */

/**
 * @typedef {{
 * category_list: ProductSubCategoriesCompData
 * }} ProductCategoriesCompData
 *
 * @typedef {{
 * _data: ProductCategoriesCompData
 * _set_data(data?: ProductCategoriesCompData, options?: SetCompDataOptions)
 * _nodes: {
 *      save_btn?: PiepNode
 * } & CompWithHistoryNodes
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

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				setTimeout(() => {
					comp._children(".round_top").forEach((e) => e.classList.remove("round_top"));
					comp._children("product-category-comp").forEach((/** @type {ProductSubCategoryComp} */ com) => {
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
		`,
		initialize: () => {
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
		},
	});
}
