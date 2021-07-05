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
 * }
 * _show?(options?: ShowModalParams)
 * } & BaseComp} TransactionModalComp
 */

/**
 * @param {TransactionModalComp} comp
 * @param {*} parent
 * @param {TransactionModalCompData} data
 */
function TransactionModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
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
	}

	/** @type {DatatableCompData} */
	const datatable = {
		columns: [
			// { key: "name", label: "Nazwa", width: "2" }, // hey display a product maybe? :) we have product_id and general_product_id
			{ key: "name", label: "Nazwa", width: "2" },
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
			{
				key: "discount_gross_price",
				label: "Rabatowa Cena Brutto (zł)",
				width: "1",
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
				label: "Suma Brutto (zł)",
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
			options: {},
			dataset: products
				? products.map((p) => {
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
				  })
				: [],
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
				return comp._data.products_dt.dataset.map((row_data) => row_data.product_id + "");
			},
		};
	}

	comp._show = (options = {}) => {
		const data = comp._data;

		comp._render();

		showModal("TransactionModal", {
			source: options.source,
		});
	};

	comp._set_data = (data, options = {}) => {
		const cd = comp._changed_data;

		if (cd.products_dt) {
			data.products_dt.dataset.forEach((row_data) => {
				row_data.current_gross_price = row_data.discount_gross_price ? row_data.discount_gross_price : row_data.gross_price;
				row_data.total_gross_price = round(row_data.current_gross_price * row_data.qty, 2);
			});
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

					<div class="label">
						<span class="medium bold">Produkty</span
						><selectable-comp data-bind="{${data.select_product}}" class="inline ml2"></selectable-comp
						><button class="btn subtle ml2" data-tooltip="Zaleca się dodać produkt z listy">Dodaj inny <i class="fas fa-plus"></i></button>
					</div>

					<datatable-comp data-node="{${comp._nodes.products_dt}}" data-bind="{${data.products_dt}}"></datatable-comp>

					<div class="desktop_row mt5" style="max-width:1000px">
						<div>
							<div class="label medium bold">Sprzedawca</div>
							<address-comp data-bind="{${data.seller}}" class="optional_phone_email"></address-comp>
						</div>

						<div>
							<div class="label medium bold">Nabywca</div>
							<address-comp data-bind="{${data.buyer}}" class="optional_phone_email"></address-comp>
						</div>
					</div>
				</div>
			</div>
		`,
		ready: () => {
			// const after_label_placeholder = comp._child(".bind_products_dt .after_label_placeholder");
			// after_label_placeholder.style.flexGrow = "1";
			// after_label_placeholder.append(comp._child(".bind_select_product"));
			// let next = after_label_placeholder;
			// while (true) {
			// 	next = next._next();
			// 	if (!next) {
			// 		break;
			// 	}
			// 	next.classList.add("hidden");
			// }

			// comp._children("address-comp .bind_phone, address-comp .bind_email").forEach((e) => {
			// 	e.classList.add("hidden");
			// 	e._prev().classList.add("hidden");
			// });

			// removeClasses("address-comp .big_boxes", ["big_boxes"], comp);
			// comp._nodes.products_dt._child(".dt_main_label").classList.remove("bold");

			comp._nodes.save_btn.addEventListener("click", () => {
				const data = comp._data;
				const errors = validateInputs(comp._children("[data-validate]").filter((e) => !e._parent(".hidden")));
				if (errors.length > 0) {
					return;
				}

				// showLoader();
				// xhr({
				// 	url: STATIC_URLS["ADMIN"] + "/transaction/save",
				// 	params: {
				// 		//page,
				// 	},
				// 	success: (res) => {
				// 		hideLoader();
				// 	},
				// });
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
