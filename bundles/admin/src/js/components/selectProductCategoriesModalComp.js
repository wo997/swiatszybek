/* js[admin] */

/**
 * @typedef {{
 * }} SelectProductCategoriesModalCompData
 *
 * @typedef {{
 * _data: SelectProductCategoriesModalCompData
 * _set_data(data?: SelectProductCategoriesModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *      close_btn: PiepNode
 *      datatable: DatatableComp
 * }
 * _show(options?: {source?: PiepNode})
 * _refresh_dataset()
 * } & BaseComp} SelectProductCategoriesModalComp
 */

/**
 * @param {SelectProductCategoriesModalComp} comp
 * @param {*} parent
 * @param {SelectProductCategoriesModalCompData} data
 */
function selectProductCategoriesModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {};
	}

	comp._show = (options = {}) => {
		comp._refresh_dataset();

		setTimeout(() => {
			showModal("selectProductCategories", {
				source: options.source,
			});
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
				<button class="btn subtle" data-node="{${comp._nodes.close_btn}}" onclick="hideParentModal(this)">
					Zamknij <i class="fas fa-times"></i>
				</button>
			</div>
			<div class="scroll-panel scroll-shadow panel-padding">
				<datatable-comp data-node="{${comp._nodes.datatable}}" data-bind="{${data.datatable}}"></datatable-comp>
			</div>
		`,
		initialize: () => {},
		ready: () => {},
	});
}

function registerSelectProductCategoriesModal() {
	// selectProductCategories
	registerModalContent(html`
		<div id="selectProductCategories" data-expand data-dismissable>
			<div class="modal-body" style="max-width: 1000px;max-height: calc(75% + 100px);">
				<select-product-Categories-modal-comp class="flex_stretch"></select-product-Categories-modal-comp>
			</div>
		</div>
	`);

	/** @type {SelectProductCategoriesModalComp} */
	// @ts-ignore
	const select_product_Categories_modal_comp = $("#selectProductCategories select-product-Categories-modal-comp");
	selectProductCategoriesModalComp(select_product_Categories_modal_comp, undefined);

	return select_product_Categories_modal_comp;
}
