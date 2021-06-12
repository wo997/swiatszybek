/* js[admin] */

/**
 * @typedef {{
 * products: {
 * net_price: number
 * gross_price: number
 * vat_id: number
 * }[]
 * }} AddStockProductsDeliveryModalCompData
 *
 * @typedef {{
 * _data: AddStockProductsDeliveryModalCompData
 * _set_data(data?: AddStockProductsDeliveryModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  save_btn: PiepNode
 * }
 * _show?(options?: ShowModalParams)
 * } & BaseComp} AddStockProductsDeliveryModalComp
 */

/**
 * @param {AddStockProductsDeliveryModalComp} comp
 * @param {*} parent
 * @param {AddStockProductsDeliveryModalCompData} data
 */
function AddStockProductsDeliveryModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {};
	}

	comp._show = (options = {}) => {
		const data = comp._data;

		comp._render();

		showModal("AddStockProductsDeliveryModal", {
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
			<div class="custom_toolbar">
				<span class="title medium">Dostawa produktów</span>
				<button class="btn subtle mla" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary ml1" data-node="{${comp._nodes.save_btn}}">Dodaj <i class="fas fa-check"></i></button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding"></div>
		`,
		ready: () => {
			comp._nodes.save_btn.addEventListener("click", () => {
				const data = comp._data;
				const errors = validateInputs(comp._children("[data-validate]").filter((e) => !e._parent(".hidden")));
				if (errors.length > 0) {
					return;
				}

				showLoader();
				xhr({
					url: STATIC_URLS["ADMIN"] + "/page/save",
					params: {
						//page,
					},
					success: (res) => {
						hideLoader();
						if (!res || !res.page_id) {
							alert("Wystąpił błąd krytyczny");
							return;
						}

						window.location.href = `${STATIC_URLS["ADMIN"]}/strona?nr_strony=${res.page_id}`;
					},
				});
			});
		},
	});
}

function getAddStockProductsDeliveryModal() {
	const ex = $("#AddStockProductsDeliveryModal");
	if (!ex) {
		registerModalContent(html`
			<div id="AddStockProductsDeliveryModal" data-expand data-dismissable>
				<div class="modal_body" style="max-width: calc(30% + 500px);max-height: calc(20% + 500px);">
					<add-stock-products-delivery-modal-comp class="flex_stretch"></add-stock-products-delivery-modal-comp>
				</div>
			</div>
		`);
	}

	/** @type {AddStockProductsDeliveryModalComp} */
	// @ts-ignore
	const add_stock_products_delivery_modal_comp = $("#AddStockProductsDeliveryModal add-stock-products-delivery-modal-comp");
	if (!ex) {
		AddStockProductsDeliveryModalComp(add_stock_products_delivery_modal_comp, undefined);
	}
	return add_stock_products_delivery_modal_comp;
}
