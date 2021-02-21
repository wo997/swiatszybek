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
			${comp.classList.contains("main")
				? html`
						<p-trait data-trait="history"></p-trait>

						<button class="btn primary" data-node="{${comp._nodes.save_btn}}">Zapisz <i class="fas fa-save"></i></button>
				  `
				: ""}
			<list-comp data-bind="{${data.categories}}">
				<product-category-comp></product-category-comp>
			</list-comp>
		`,
		initialize: () => {
			if (comp.classList.contains("main")) {
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
			}
		},
	});
}
