/* js[admin] */

/**
 * @typedef {{
 * products_dt?: DatatableCompData
 * select_product?: SelectableCompData
 * }} TransactionModalCompData
 *
 * @typedef {{
 * _data: TransactionModalCompData
 * _set_data(data?: TransactionModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  save_btn: PiepNode
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
		data = {};
	}

	// /**
	//  * @typedef {{
	//  * transaction_product_id: number
	//  * transaction_id?: number
	//  * product_id: number
	//  * general_product_id?: number
	//  * name: string
	//  * net_price: number
	//  * vat: number
	//  * gross_price: number
	//  * current_gross_price: number
	//  * qty: number
	//  * total_gross_price: number
	//  * }} TransactionProductData
	//  */

	/** @type {DatatableCompData} */
	const datatable = {
		columns: [
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
				key: "net_price",
				label: "Cena Brutto (zł)",
				width: "1",
				editable: "number",
			},
			// {
			// 	key: "net_price",
			// 	label: "Cena Netto (zł)",
			// 	width: "1",
			// 	searchable: "number",
			// 	editable: "number",
			// 	batch_edit: true,
			// },
			// {
			// 	key: "net_price",
			// 	label: "Cena Netto (zł)",
			// 	width: "1",
			// 	searchable: "number",
			// 	editable: "number",
			// 	batch_edit: true,
			// },
			// { key: "", label: "", width: "1" },
			// { key: "", label: "", width: "1" },
		],
		// maps: [
		// 	{
		// 		name: "vat",
		// 		getMap: () => vats.map((v) => ({ val: v.vat_id, label: `${v.value * 100}%` })),
		// 	},
		// ],
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
							label += " (obecnie nieaktywny)";
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
						current_gross_price: product.__current_gross_price,
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
				return [];
				//return comp._data.general_products.map((g) => g.general_product_id + "");
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
		setCompData(comp, data, {
			...options,
			render: () => {},
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
				<div class="mtfn">
					<div class="label">Produkty</div>
					<selectable-comp data-bind="{${data.select_product}}"></selectable-comp>

					<datatable-comp data-bind="{${data.products_dt}}"></datatable-comp>
				</div>
			</div>
		`,
		ready: () => {
			comp._nodes.save_btn.addEventListener("click", () => {
				const data = comp._data;
				const errors = validateInputs(comp._children("[data-validate]").filter((e) => !e._parent(".hidden")));
				if (errors.length > 0) {
					return;
				}

				// showLoader();
				// xhr({
				// 	url: STATIC_URLS["ADMIN"] + "/page/save",
				// 	params: {
				// 		//page,
				// 	},
				// 	success: (res) => {
				// 		hideLoader();
				// 		if (!res || !res.page_id) {
				// 			alert("Wystąpił błąd krytyczny");
				// 			return;
				// 		}

				// 		window.location.href = `${STATIC_URLS["ADMIN"]}/strona?nr_strony=${res.page_id}`;
				// 	},
				// });
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
