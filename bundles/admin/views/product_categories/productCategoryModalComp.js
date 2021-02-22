/* js[view] */

/**
 * @typedef {{
 * product_category_id: number
 * name: string
 * }} ProductCategoryModalCompData
 *
 * @typedef {{
 * _data: ProductCategoryModalCompData
 * _set_data(data?: ProductCategoryModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *      save_btn: PiepNode
 *      delete_btn: PiepNode
 * }
 * _show?(id: number, options?: {source?: PiepNode})
 * _save_data()
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
		data = { name: "", product_category_id: -1 }; // , parent_product_category_id: -1
	}

	comp._show = (id, options = {}) => {
		// const category = product_categories.find((e) => e.product_category_id === id);
		// if (category) {
		// 	comp._data.name = category.name;
		// 	comp._data.product_category_id = category.product_category_id;
		// }
		// clearCompHistory(comp);

		showModal("ProductCategory", {
			source: options.source,
		});
	};

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
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
				<input class="field" data-bind="{${data.name}}" />

				<div style="margin-top: auto;padding-top: 10px;text-align: right;">
					<button class="btn error" data-node="{${comp._nodes.delete_btn}}">Usuń <i class="fas fa-trash"></i></button>
				</div>
			</div>
		`,
		initialize: () => {
			comp._nodes.save_btn.addEventListener("click", () => {
				comp._save_data();
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
			<div class="modal-body" style="max-width: calc(40% + 100px);max-height: calc(40% + 200px);">
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
