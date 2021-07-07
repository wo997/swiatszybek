/* js[admin] */

/**
 * @typedef {{
 * is_add?: number
 * products_dt?: DatatableCompData
 * select_product?: SelectableCompData
 * }} AddStockProductsModalCompData
 *
 * @typedef {{
 * _data: AddStockProductsModalCompData
 * _set_data(data?: AddStockProductsModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  save_btn: PiepNode
 *  products_dt: PiepNode
 * }
 * _show?(is_add?: number, options?: ShowModalParams)
 * } & BaseComp} AddStockProductsModalComp
 */

/**
 * @param {AddStockProductsModalComp} comp
 * @param {*} parent
 * @param {AddStockProductsModalCompData} data
 */
function AddStockProductsModalComp(comp, parent, data = undefined) {
	/** @type {AddStockProductsModalCompData} */
	const defa = {};

	data = def(data, defa);

	/** @type {DatatableCompData} */
	const datatable = {
		columns: [
			{
				key: "product_id",
				label: "Produkt",
				width: "3",
				render: (product_id) => {
					const noProduct = () => {
						return "—";
					};
					if (!product_id) {
						return noProduct();
					}
					const product = products.find((p) => p.product_id);
					if (!product) {
						return noProduct();
					}
					return html`<a
						class="link"
						target="_blank"
						data-tooltip="Pokaż produkt w nowej karcie"
						href="${STATIC_URLS["ADMIN"]}/produkt/${product.general_product_id}"
						>${product.__name}
					</a>`;
				},
			},
			{
				key: "net_price",
				label: "Cena Netto (zł)",
				width: "1",
				editable: "number",
			},
			{
				key: "vat",
				label: "VAT (%)",
				width: "1",
				editable: "number",
			},
			{
				key: "gross_price",
				label: "Cena Brutto (zł)",
				width: "1",
				editable: "number",
			},
		],
		empty_html: "Brak produktów",
		dataset: [],
		searchable: false,
		paginable: false,
		deletable: true,
		sortable: true,
	};

	data.products_dt = def(data.products_dt, datatable);

	if (data.select_product === undefined) {
		data.select_product = {
			placeholder: "Wyszukaj produkty z magazynu...",
			dataset: products.map((p) => {
				const value = p.product_id + "";

				let label = p.__name + "";

				let active = true;
				if (p.general_product_id) {
					active = !!p.active && !!p.gp_active;
				} else {
					active = !!p.active;
				}

				if (!active) {
					label += html` <i class="fas fa-times text_error ml1" data-tooltip="obecnie nieaktywny"></i>`;
				}

				return {
					value,
					label,
				};
			}),
			custom_select_callback: (value) => {
				const data = comp._data;
				const product = products.find((p) => p.product_id === +value);
				if (product) {
					/** @type {StockProductData} */
					const dt_product = {
						stock_product_id: -1,
						product_id: product.product_id,
						gross_price: product.gross_price,
						net_price: product.net_price,
						vat: vats.find((v) => v.vat_id === product.vat_id).value * 100,
					};
					data.products_dt.dataset.push(dt_product);
				}

				comp._render();
			},
			get_custom_selection: () => {
				return [];
			},
		};
	}

	comp._show = (is_add, options = {}) => {
		comp._data = cloneObject(defa);
		const data = comp._data;

		data.is_add = is_add;
		if (is_add) {
			// data.buyer.company = "asd";
			// data.buyer = {
			// };
		}
		// console.log(data);

		comp._render();

		showModal("AddStockProductsModal", {
			source: options.source,
		});
	};

	comp._set_data = (data, options = {}) => {
		const cd = comp._changed_data;

		if (cd.products_dt) {
			data.products_dt.dataset.forEach((/** @type {StockProductData} */ row_data) => {});
		}

		setCompData(comp, data, {
			...options,
			render: () => {
				const data = comp._data; // actually important
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="custom_toolbar">
				<span class="title medium">Zarządzaj magazynem</span>
				<button class="btn subtle mla" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary ml1" data-node="{${comp._nodes.save_btn}}">Dodaj <i class="fas fa-check"></i></button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<div class="mtfn pb5">
					<div class="label medium bold">Typ modyfikacji</div>
					<div class="radio_group boxes hide_checks number big_boxes" style="--columns:2;max-width: 400px;" data-bind="{${data.is_add}}">
						<div class="checkbox_area">
							<div>
								<p-checkbox data-value="0"></p-checkbox>
								<span class="semi_bold">Sprzedaj produkty <i class="fas fa-arrow-alt-circle-up"></i></span>
							</div>
						</div>
						<div class="checkbox_area">
							<div>
								<p-checkbox data-value="1"></p-checkbox>
								<span class="semi_bold">Dodaj produkty <i class="fas fa-arrow-alt-circle-down"></i></span>
							</div>
						</div>
					</div>

					<div class="">
						<span class="label medium bold inline mr2">Produkty</span
						><selectable-comp data-bind="{${data.select_product}}" class="inline"></selectable-comp>
					</div>

					<datatable-comp data-node="{${comp._nodes.products_dt}}" data-bind="{${data.products_dt}}"></datatable-comp>
				</div>
			</div>
		`,
		ready: () => {
			comp._nodes.save_btn.addEventListener("click", () => {
				const data = comp._data;

				// const errors = validateInputs(comp._children("[data-validate]").filter((e) => !e._parent(".hidden")));
				// if (errors.length > 0) {
				// 	return;
				// }

				showLoader();
				xhr({
					url: STATIC_URLS["ADMIN"] + "/stock_product/save_many",
					params: {
						stock_products: data.products_dt.dataset,
					},
					success: (res) => {
						hideLoader();
						window.dispatchEvent(new CustomEvent("stock_product_changed"));
						hideModal("AddStockProductsModal");
					},
				});
			});

			comp._nodes.products_dt.addEventListener("editable_change", (ev) => {
				// @ts-ignore
				const detail = ev.detail;
				/** @type {TransactionProductData} */
				const row_data = detail.row_data;
				const key = detail.key;

				row_data.gross_price = round(row_data.gross_price, 2);
				row_data.net_price = round(row_data.net_price, 2);

				let set_what = "";

				if (key === "vat") {
					// anything to rewrite?
					if (numberFromStr(row_data.gross_price + "")) {
						set_what = "net_price";
					} else if (numberFromStr(row_data.net_price + "")) {
						set_what = "gross_price";
					}
				} else {
					if (key === "gross_price") {
						set_what = "net_price";
					} else if (key === "net_price") {
						set_what = "gross_price";
					}
				}

				if (set_what === "net_price") {
					row_data.net_price = round(row_data.gross_price / (1 + row_data.vat * 0.01), 2);
				} else if (set_what === "gross_price") {
					row_data.gross_price = round(row_data.net_price * (1 + row_data.vat * 0.01), 2);
				}
			});
		},
	});
}

function getAddStockProductsModal() {
	const ex = $("#AddStockProductsModal");
	if (!ex) {
		registerModalContent(html`
			<div id="AddStockProductsModal" data-expand data-dismissable>
				<div class="modal_body">
					<add-stock-products-modal-comp class="flex_stretch"></add-stock-products-modal-comp>
				</div>
			</div>
		`);
	}

	/** @type {AddStockProductsModalComp} */
	// @ts-ignore
	const add_stock_products_modal_comp = $("#AddStockProductsModal add-stock-products-modal-comp");
	if (!ex) {
		AddStockProductsModalComp(add_stock_products_modal_comp, undefined);
	}
	return add_stock_products_modal_comp;
}
