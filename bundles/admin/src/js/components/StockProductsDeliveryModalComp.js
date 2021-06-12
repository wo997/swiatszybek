/* js[admin] */

/**
 * @typedef {{
 * products: StockProductData[]
 * }} StockProductsDeliveryModalCompData
 *
 * @typedef {{
 * _data: StockProductsDeliveryModalCompData
 * _set_data(data?: StockProductsDeliveryModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  save_btn: PiepNode
 * }
 * _show?(options?: ShowModalParams)
 * } & BaseComp} StockProductsDeliveryModalComp
 */

/**
 * @param {StockProductsDeliveryModalComp} comp
 * @param {*} parent
 * @param {StockProductsDeliveryModalCompData} data
 */
function StockProductsDeliveryModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			products: [],
		};
	}

	comp._show = (options = {}) => {
		const data = comp._data;

		comp._render();

		showModal("StockProductsDeliveryModal", {
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
			<div class="scroll_panel scroll_shadow panel_ping"></div>
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

function getStockProductsDeliveryModal() {
	const ex = $("#StockProductsDeliveryModal");
	if (!ex) {
		registerModalContent(html`
			<div id="StockProductsDeliveryModal" data-expand data-dismissable>
				<div class="modal_body" style="max-width: calc(30% + 500px);max-height: calc(20% + 500px);">
					<stock-products-delivery-modal-comp class="flex_stretch"></stock-products-delivery-modal-comp>
				</div>
			</div>
		`);
	}

	/** @type {StockProductsDeliveryModalComp} */
	// @ts-ignore
	const stock_products_delivery_modal_comp = $("#StockProductsDeliveryModal stock-products-delivery-modal-comp");
	if (!ex) {
		StockProductsDeliveryModalComp(stock_products_delivery_modal_comp, undefined);
	}
	return stock_products_delivery_modal_comp;
}
