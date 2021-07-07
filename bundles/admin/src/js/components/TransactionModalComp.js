/* js[admin] */

/**
 * @typedef {{
 * products_dt?: DatatableCompData
 * select_product?: SelectableCompData
 * } & TransactionData} TransactionModalCompData
 *
 * @typedef {{
 * _data: TransactionModalCompData
 * _set_data(data?: TransactionModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  save_btn: PiepNode
 *  products_dt: PiepNode
 *  add_other_product: PiepNode
 *  seller: AddressComp
 *  buyer: AddressComp
 * }
 * _show?(is_expense?: number, options?: ShowModalParams)
 * } & BaseComp} TransactionModalComp
 */

/**
 * @param {TransactionModalComp} comp
 * @param {*} parent
 * @param {TransactionModalCompData} data
 */
function TransactionModalComp(comp, parent, data = undefined) {
	/** @type {TransactionData} */
	const defa = {
		transaction_id: -1,
		gross_price: 0,
		net_price: 0,
		is_expense: 1,
		buyer: {
			party: "company",
			first_name: "",
			last_name: "",
			company: "",
			nip: "",
			phone: "",
			email: "",
			country: "Polska",
			post_code: "",
			city: "",
			street: "",
			building_number: "",
			flat_number: "",
		},
		seller: {
			party: "company",
			first_name: "",
			last_name: "",
			company: "",
			nip: "",
			phone: "",
			email: "",
			country: "Polska",
			post_code: "",
			city: "",
			street: "",
			building_number: "",
			flat_number: "",
		},
	};

	data = def(data, defa);

	/** @type {DatatableCompData} */
	const datatable = {
		columns: [
			{
				key: "name",
				label: "Nazwa",
				width: "3",
				editable: "string",
			},
			{
				key: "product_id",
				label: "Czy z magazynu?",
				width: "1",
				render: (product_id) => {
					const noProduct = () => {
						return "Nie";
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
						>Tak <i class="fas fa-external-link-alt"></i>
					</a>`;
				},
			},
			{
				key: "net_price",
				label: "J. Cena Netto (zł)",
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
				label: "J. Cena Brutto (zł)",
				width: "1",
				editable: "number",
			},
			{
				key: "discount_gross_price",
				label: "J. Rabatowa Cena Brutto (zł)",
				width: "1",
				editable_classes: ["empty_null"],
				editable: "number",
			},
			{
				key: "qty",
				label: "Ilość",
				width: "1",
				editable: "number",
			},
			{
				key: "total_gross_price",
				label: "Wartość Brutto (zł)",
				width: "1",
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
					/** @type {TransactionProductData} */
					const dt_product = {
						product_id: product.product_id,
						general_product_id: product.general_product_id,
						current_gross_price: product.__current_gross_price,
						discount_gross_price: product.discount_gross_price,
						gross_price: product.gross_price,
						name: product.__name,
						net_price: product.net_price,
						qty: 1,
						total_gross_price: 0,
						transaction_product_id: -1,
						vat: vats.find((v) => v.vat_id === product.vat_id).value * 100,
					};
					data.products_dt.dataset.push(dt_product);
				}

				comp._render();
			},
			get_custom_selection: () => {
				// allow repetitions
				return []; // comp._data.products_dt.dataset.map((row_data) => row_data.product_id + "");
			},
		};
	}

	comp._show = (is_expense, options = {}) => {
		comp._data = cloneObject(defa);
		const data = comp._data;

		data.is_expense = is_expense;
		if (is_expense) {
			// data.buyer.company = "asd";
			// data.buyer = {
			// };
		}

		comp._render();

		showModal("TransactionModal", {
			source: options.source,
		});
	};

	comp._set_data = (data, options = {}) => {
		const cd = comp._changed_data;

		if (cd.products_dt) {
			let total_gross_price = 0;
			data.products_dt.dataset.forEach((/** @type {TransactionProductData} */ row_data) => {
				row_data.current_gross_price = def(row_data.discount_gross_price, row_data.gross_price);
				row_data.total_gross_price = round(row_data.current_gross_price * row_data.qty, 2);
				total_gross_price += row_data.total_gross_price;
			});
			data.gross_price = total_gross_price;
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
				<span class="title medium">Transakcja</span>
				<button class="btn subtle mla" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary ml1" data-node="{${comp._nodes.save_btn}}">Dodaj <i class="fas fa-check"></i></button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<div class="mtfn pb5">
					<div class="label medium bold">Typ transakcji</div>
					<div
						class="radio_group boxes hide_checks number big_boxes"
						style="--columns:2;max-width: 400px;"
						data-bind="{${data.is_expense}}"
					>
						<div class="checkbox_area">
							<div>
								<p-checkbox data-value="0"></p-checkbox>
								<span class="semi_bold">Sprzedaż <i class="fas fa-arrow-alt-circle-up"></i></span>
							</div>
						</div>
						<div class="checkbox_area">
							<div>
								<p-checkbox data-value="1"></p-checkbox>
								<span class="semi_bold">Zakup (dostawa) <i class="fas fa-arrow-alt-circle-down"></i></span>
							</div>
						</div>
					</div>

					<div class="">
						<span class="label medium bold inline">Produkty</span
						><selectable-comp data-bind="{${data.select_product}}" class="inline ml2"></selectable-comp
						><button
							class="btn subtle ml2"
							data-node="{${comp._nodes.add_other_product}}"
							data-tooltip="Jeśli produkt nie jest przechowywany w magazynie, może to być np. usługa."
						>
							Dodaj inny <i class="fas fa-plus"></i>
						</button>
					</div>

					<datatable-comp data-node="{${comp._nodes.products_dt}}" data-bind="{${data.products_dt}}"></datatable-comp>

					<div class="products_footer">
						<div class="medium pln">Cena Brutto: <span html="{${prettyPrice(data.gross_price) + " zł"}}"></span></div>
					</div>

					<div class="desktop_row mt5" style="max-width:1000px">
						<div>
							<div class="label medium bold">Sprzedawca</div>
							<address-comp data-node="{${comp._nodes.seller}}" data-bind="{${data.seller}}" class="optional_phone_email"></address-comp>
						</div>

						<div>
							<div class="label medium bold">Nabywca</div>
							<address-comp data-node="{${comp._nodes.buyer}}" data-bind="{${data.buyer}}" class="optional_phone_email"></address-comp>
						</div>
					</div>
				</div>
			</div>
		`,
		ready: () => {
			const default_vat = vats[0] ? vats[0].value : 23;

			comp._nodes.add_other_product.addEventListener("click", () => {
				const data = comp._data;

				/** @type {TransactionProductData} */
				const dt_product = {
					product_id: null,
					general_product_id: null,
					current_gross_price: 0,
					discount_gross_price: null,
					gross_price: 0,
					name: "",
					net_price: 0,
					qty: 1,
					total_gross_price: 0,
					transaction_product_id: -1,
					vat: default_vat,
				};
				data.products_dt.dataset.push(dt_product);

				comp._render();
			});

			comp._nodes.save_btn.addEventListener("click", () => {
				const data = comp._data;
				// these arent even scoped lol, avoid this
				// const errors = validateInputs(comp._children("[data-validate]").filter((e) => !e._parent(".hidden")));
				// if (errors.length > 0) {
				// 	return;
				// }

				// if (!comp._nodes.seller._validate() || !comp._nodes.buyer._validate()) {
				// 	return;
				// }

				/** @type {TransactionData} */
				const transaction = {
					transaction_id: data.transaction_id,
					gross_price: data.gross_price,
					is_expense: data.is_expense,
					net_price: data.net_price,
					buyer: data.buyer,
					seller: data.seller,
					transaction_products: data.products_dt.dataset,
				};

				showLoader();
				xhr({
					url: STATIC_URLS["ADMIN"] + "/transaction/save",
					params: {
						transaction,
					},
					success: (res) => {
						hideLoader();
						window.dispatchEvent(new CustomEvent("transactions_changed"));
						hideModal("TransactionModal");
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

function getTransactionModal() {
	const ex = $("#TransactionModal");
	if (!ex) {
		registerModalContent(html`
			<div id="TransactionModal" data-expand data-dismissable>
				<div class="modal_body">
					<transaction-modal-comp class="flex_stretch"></transaction-modal-comp>
				</div>
			</div>
		`);
	}

	/** @type {TransactionModalComp} */
	// @ts-ignore
	const transaction_modal_comp = $("#TransactionModal transaction-modal-comp");
	if (!ex) {
		TransactionModalComp(transaction_modal_comp, undefined);
	}
	return transaction_modal_comp;
}
