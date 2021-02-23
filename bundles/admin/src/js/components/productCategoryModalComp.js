/* js[admin] */

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
 * _show?(id: number, options?: {source?: PiepNode})
 * _save()
 * _delete()
 * } & BaseComp} ProductCategoryModalComp
 */

/**
 * @param {ProductCategoryModalComp} comp
 * @param {*} parent
 * @param {ProductCategoryModalCompData} data
 */
function productCategoryModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = { name: "", product_category_id: -1, parent_product_category_id: -1 };
	}

	comp._show = (id, options = {}) => {
		const category = product_categories.find((e) => e.product_category_id === id);
		if (category) {
			comp._data.name = category.name;
			comp._data.product_category_id = category.product_category_id;
		}

		showModal("ProductCategory", {
			source: options.source,
		});
	};

	const hideAndSearch = () => {
		hideParentModal(comp);
		refreshProductCategories();
	};

	comp._save = () => {
		const errors = validateInputs([comp._nodes.name]);

		if (errors.length > 0) {
			return;
		}

		xhr({
			url: STATIC_URLS["ADMIN"] + "product/category/save",
			params: {
				product_category: {
					name: comp._data.name,
					product_category_id: comp._data.product_category_id,
				},
			},
			success: (res) => {
				hideAndSearch();
				showNotification(comp._data.product_category_id === -1 ? "Dodano kategorię produktu" : "Zapisano kategorię produktu", {
					one_line: true,
					type: "success",
				});
			},
		});
	};

	comp._delete = () => {
		if (comp._data.product_category_id !== -1) {
			xhr({
				url: STATIC_URLS["ADMIN"] + "product/category/delete/" + comp._data.product_category_id,
				params: {
					product_category: comp._data,
				},
				success: (res) => {
					hideAndSearch();
					showNotification(`Usunięto kategorię ${comp._data.name}`, {
						one_line: true,
						type: "success",
					});
				},
			});
		} else {
			hideAndSearch();
		}
	};

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				let options = html`<option value="-1">BRAK (KATEGORIA GŁÓWNA)</option>`;
				for (const category of product_categories) {
					let full_name = category.name;

					let parent_category = category;
					while (true) {
						const pid = parent_category.parent_product_category_id;
						if (pid === -1) {
							break;
						}
						parent_category = parent_category[pid];
						if (!parent_category) {
							break;
						}

						full_name = html`${parent_category.name} › ${full_name}`;
					}

					options += html`<option value="${category.product_category_id}">${full_name}</option>`;
				}
				comp._nodes.parent_product_category._set_content(options);
				comp._nodes.parent_product_category._set_value(data.parent_product_category_id, { quiet: true });
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="custom-toolbar">
				<span class="title">Kategoria produktu: <span html="{${data.name.trim() ? data.name : "Nowa"}}"></span></span>
				<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary" data-node="{${comp._nodes.save_btn}}" disabled="{${false}}">Zapisz <i class="fas fa-save"></i></button>
			</div>
			<div class="scroll-panel scroll-shadow panel-padding">
				<div class="label first">Nazwa kategorii</div>
				<input class="field" data-bind="{${data.name}}" data-node="{${comp._nodes.name}}" data-validate="string" />

				<div class="label">Kategoria nadrzędna</div>
				<select
					class="field"
					data-bind="{${data.parent_product_category_id}}"
					data-node="{${comp._nodes.parent_product_category}}"
				></select>

				<div style="margin-top: auto;padding-top: 10px;text-align: right;">
					<button class="btn error" data-node="{${comp._nodes.delete_btn}}">Usuń <i class="fas fa-trash"></i></button>
				</div>
			</div>
		`,
		initialize: () => {
			comp._nodes.save_btn.addEventListener("click", () => {
				comp._save();
			});
			comp._nodes.delete_btn.addEventListener("click", () => {
				if (confirm("Czy aby na pewno chcesz usunąć tę kategorię?")) {
					comp._delete();
				}
			});
		},
	});
}

function registerProductCategoryModal() {
	registerModalContent(html`
		<div id="ProductCategory" data-expand data-dismissable>
			<div class="modal-body" style="max-width: calc(20% + 250px);max-height: calc(20% + 100px);">
				<product-category-modal-comp class="flex_stretch"></product-category-modal-comp>
			</div>
		</div>
	`);

	const product_category_modal_comp = getProductCategoryModal();
	productCategoryModalComp(product_category_modal_comp, undefined);
	return product_category_modal_comp;
}

/**
 * @returns {ProductCategoryModalComp}
 */
function getProductCategoryModal() {
	// @ts-ignore
	return $("#ProductCategory product-category-modal-comp");
}
