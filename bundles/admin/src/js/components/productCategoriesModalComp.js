/* js[admin] */

/**
 * @typedef {{
 * categories: ProductCategoriesCompData
 * }} ProductCategoriesModalCompData
 *
 * @typedef {{
 * _data: ProductCategoriesModalCompData
 * _set_data(data?: ProductCategoriesModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *      close_btn: PiepNode
 *      categories: ProductCategoriesComp
 * }
 * _show(options?: {source?: PiepNode})
 * } & BaseComp} ProductCategoriesModalComp
 */

/**
 * @param {ProductCategoriesModalComp} comp
 * @param {*} parent
 * @param {ProductCategoriesModalCompData} data
 */
function productCategoriesModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			categories: { category_list: { categories: [] } },
		};
	}

	comp._show = (options = {}) => {
		showModal("productCategories", {
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
				<span class="title">Wybierz kategorie dla: <span class="product_name"></span></span>
				<div class="history_btns_wrapper"></div>
				<button class="btn subtle" data-node="{${comp._nodes.close_btn}}" onclick="hideParentModal(this)">
					Zamknij <i class="fas fa-times"></i>
				</button>
				<div class="save_btn_wrapper"></div>
			</div>
			<div class="scroll-panel scroll-shadow panel-padding">
				<product-categories-comp data-node="{${comp._nodes.categories}}" data-bind="{${data.categories}}"></product-categories-comp>
			</div>
		`,
		ready: () => {
			comp._child(".custom-toolbar .history_btns_wrapper").appendChild(comp._nodes.categories._nodes.history);
			comp._child(".custom-toolbar .save_btn_wrapper").appendChild(comp._nodes.categories._nodes.save_btn);
		},
	});
}

function registerProductCategoriesModal() {
	// ProductCategories
	registerModalContent(html`
		<div id="productCategories" data-expand data-dismissable>
			<div class="modal-body" style="max-width: 1000px;max-height: calc(75% + 100px);">
				<product-categories-modal-comp class="flex_stretch"></product-categories-modal-comp>
			</div>
		</div>
	`);

	/** @type {ProductCategoriesModalComp} */
	// @ts-ignore
	const product_categories_modal_comp = $("#productCategories product-categories-modal-comp");
	productCategoriesModalComp(product_categories_modal_comp, undefined);

	return product_categories_modal_comp;
}
