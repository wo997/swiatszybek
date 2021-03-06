/* js[admin] */

/**
 * @typedef {{
 * cat?: ProductCategoryModalCompData,
 * is_new?: boolean
 * source?: PiepNode,
 * save_callback?(cat: ProductCategoryModalCompData),
 * delete_callback?()}} ShowProductCategoryModalOptions
 */

/**
 * @typedef {{
 * product_category_id: number
 * name: string
 * parent_product_category_id: number
 * }} ProductCategoryModalCompData
 *
 * @typedef {{
 * _data: ProductCategoryModalCompData
 * _set_data(data?: ProductCategoryModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *      save_btn: PiepNode
 *      delete_btn: PiepNode
 *      name: PiepNode
 *      parent_product_category: PiepNode
 * }
 * _show?(options: ShowProductCategoryModalOptions)
 * _save()
 * _delete()
 * _options: ShowProductCategoryModalOptions
 * } & BaseComp} ProductCategoryModalComp
 */

/**
 * @param {ProductCategoryModalComp} comp
 * @param {*} parent
 * @param {ProductCategoryModalCompData} data
 */
function ProductCategoryModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = { name: "", product_category_id: -1, parent_product_category_id: -1 };
	}

	comp._show = (options = {}) => {
		comp._options = options;

		if (!options.cat) {
			options.cat = { product_category_id: -1, name: "", parent_product_category_id: -1 };
		}

		comp._data.name = options.cat.name;
		comp._data.product_category_id = options.cat.product_category_id;
		comp._data.parent_product_category_id = options.cat.parent_product_category_id;

		comp._render();

		comp._child(".parent_menu_wrapper").classList.toggle("hidden", !!options.is_new);

		showModal("productCategory", {
			source: options.source,
		});
	};

	comp._save = () => {
		const errors = validateInputs([comp._nodes.name]);
		if (errors.length > 0) {
			return;
		}

		if (comp._options.save_callback) {
			comp._options.save_callback(comp._data);
		}

		hideParentModal(comp);
	};

	comp._delete = () => {
		if (comp._options.delete_callback) {
			comp._options.delete_callback();
		}
		hideParentModal(comp);
	};

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				let options = html`<option value="-1">BRAK (KATEGORIA GŁÓWNA)</option>`;

				/**
				 *
				 * @param {ProductCategoryBranch[]} category_branch
				 */
				const traverse = (category_branch, level = 0) => {
					category_branch.forEach((category) => {
						const cat_display = category.__category_path_names_csv.replace(/,/g, " ― ");
						if (category.product_category_id === data.product_category_id) {
							return;
						}
						options += html`<option value="${category.product_category_id}">${cat_display}</option>`;
						if (level < 1) {
							traverse(category.sub_categories, level + 1);
						}
					});
				};
				traverse(product_categories_tree);
				comp._nodes.parent_product_category._set_content(options);
				comp._nodes.parent_product_category._set_value(data.parent_product_category_id, { quiet: true });
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="custom_toolbar">
				<span class="title medium">Kategoria produktu</span>
				<button class="btn subtle mla" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary ml1" data-node="{${comp._nodes.save_btn}}" disabled="{${false}}">
					Zapisz <i class="fas fa-save"></i>
				</button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<div class="mtfn">
					<div class="label">Nazwa kategorii</div>
					<input class="field" data-bind="{${data.name}}" data-node="{${comp._nodes.name}}" data-validate="" />

					<div class="parent_menu_wrapper">
						<div class="label">Kategoria nadrzędna</div>
						<select
							class="field"
							data-bind="{${data.parent_product_category_id}}"
							data-node="{${comp._nodes.parent_product_category}}"
						></select>
					</div>
				</div>
				<div class="mta pt2" style="text-align: right;">
					<button class="btn error" data-node="{${comp._nodes.delete_btn}}">Usuń kategorię <i class="fas fa-trash"></i></button>
				</div>
			</div>
		`,
		ready: () => {
			comp._nodes.save_btn.addEventListener("click", () => {
				comp._save();
			});
			comp._nodes.delete_btn.addEventListener("click", () => {
				comp._delete();
			});
		},
	});
}

function getProductCategoryModal() {
	const ex = $("#productCategory");
	if (!ex) {
		registerModalContent(html`
			<div id="productCategory" data-expand data-dismissable>
				<div class="modal_body" style="max-width: calc(20% + 250px);max-height: calc(20% + 100px);">
					<product-category-modal-comp class="flex_stretch"></product-category-modal-comp>
				</div>
			</div>
		`);
	}

	/** @type {ProductCategoryModalComp} */
	// @ts-ignore
	const product_category_modal_comp = $("#productCategory product-category-modal-comp");
	if (!ex) {
		ProductCategoryModalComp(product_category_modal_comp, undefined);
	}
	return product_category_modal_comp;
}
