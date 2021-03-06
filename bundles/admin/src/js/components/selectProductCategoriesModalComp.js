/* js[admin] */

/**
 * @typedef {{
 * selection: number[]
 * categories: ProductCategoryPickerNodeCompData[]
 * }} SelectProductCategoriesModalCompData
 *
 * @typedef {{
 * category_ids: number[]
 * close_callback(category_ids: number[])
 * }} SelectProductCategoriesOptions
 *
 * @typedef {{
 * _data: SelectProductCategoriesModalCompData
 * _set_data(data?: SelectProductCategoriesModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *      edit_btn: PiepNode
 *      save_btn: PiepNode
 *      clear_btn: PiepNode
 * }
 * _show(options: SelectProductCategoriesOptions, modal_options?: ShowModalParams)
 * _select_product_categories_options: SelectProductCategoriesOptions
 * _refresh_dataset()
 * } & BaseComp} SelectProductCategoriesModalComp
 */

/**
 * @param {SelectProductCategoriesModalComp} comp
 * @param {*} parent
 * @param {SelectProductCategoriesModalCompData} data
 */
function SelectProductCategoriesModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			selection: [],
			categories: [],
		};
	}

	// MAKE SURE YOU CALL IT AFTER THE SELECTION WAS CHANGED
	comp._refresh_dataset = () => {
		/**
		 * @param {ProductCategoryPickerNodeCompData[]} categories_ref
		 * @param {ProductCategoryBranch[]} wanted_categories
		 */
		const traverse = (categories_ref, wanted_categories) => {
			wanted_categories.forEach((wcat) => {
				categories_ref.push({
					product_category_id: wcat.product_category_id,
					categories: [],
					product_category_name: wcat.name,
					selected: comp._data.selection.includes(wcat.product_category_id),
					__product_count: wcat.__product_count,
				});
			});

			categories_ref.forEach((cat) => {
				traverse(cat.categories, wanted_categories.find((e) => e.product_category_id === cat.product_category_id).sub_categories);
			});
		};

		comp._data.categories = [];
		traverse(comp._data.categories, product_categories_tree);
	};

	comp._show = (options, modal_options = {}) => {
		comp._select_product_categories_options = options;

		comp._data.selection = options.category_ids;
		comp._refresh_dataset();
		comp._render();

		setTimeout(() => {
			showModal("selectProductCategories", {
				source: modal_options.source,
			});
		});
	};

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				let controversial = false;
				/**
				 * @param {ProductCategoryPickerNodeCompData[]} categories_ref
				 * @param {boolean} cancel
				 */
				const traverse = (categories_ref, cancel) => {
					categories_ref.forEach((cat) => {
						if (cancel) {
							if (cat.selected) {
								cat.selected = false;
								controversial = true;
							}
						} else if (cat.selected) {
							comp._data.selection.push(cat.product_category_id);
						}
						traverse(cat.categories, cancel || !cat.selected);
					});
				};

				comp._data.selection = [];
				traverse(comp._data.categories, false);

				if (controversial) {
					// let's hope it executes once
					comp._render();
				}
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="custom_toolbar">
				<span class="title medium">Wybierz kategorie</span>
				<button class="btn subtle mla" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary ml1" data-node="{${comp._nodes.save_btn}}">Zastosuj <i class="fas fa-save"></i></button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<div>
					<button class="btn subtle small" data-node="{${comp._nodes.edit_btn}}">Edytuj kategorie <i class="fas fa-cog"></i></button
					><button class="btn error_light small ml2" data-node="{${comp._nodes.clear_btn}}">
						Odznacz wszystko <i class="fas fa-eraser"></i>
					</button>
					<list-comp data-bind="{${data.categories}}" class="mt2" data-primary="product_category_id">
						<product-category-picker-node-comp></product-category-picker-node-comp>
					</list-comp>
				</div>
			</div>
		`,
		initialize: () => {
			comp._nodes.edit_btn.addEventListener("click", () => {
				const product_categories_modal_comp = getProductCategoriesModal();
				product_categories_modal_comp._show();
			});

			window.addEventListener("product_categories_changed", () => {
				comp._refresh_dataset();
				comp._render();
			});

			comp._nodes.save_btn.addEventListener("click", () => {
				hideParentModal(comp);
				if (comp._select_product_categories_options.close_callback) {
					comp._select_product_categories_options.close_callback(comp._data.selection);
				}
			});

			comp._nodes.clear_btn.addEventListener("click", () => {
				comp._data.selection = [];
				comp._refresh_dataset();
				comp._render();
			});
		},
	});
}

function getSelectProductCategoriesModal() {
	const ex = $("#selectProductCategories");
	if (!ex) {
		registerModalContent(html`
			<div id="selectProductCategories" data-expand data-dismissable>
				<div class="modal_body" style="max-width: calc(20% + 350px);max-height: calc(50% + 250px);">
					<select-product-categories-modal-comp class="flex_stretch"></select-product-categories-modal-comp>
				</div>
			</div>
		`);
	}

	/** @type {SelectProductCategoriesModalComp} */
	// @ts-ignore
	const select_product_categories_modal_comp = $("#selectProductCategories select-product-categories-modal-comp");
	if (!ex) {
		SelectProductCategoriesModalComp(select_product_categories_modal_comp, undefined);
	}

	return select_product_categories_modal_comp;
}
