/* js[admin] */

/**
 * @typedef {{
 * rebate_code_id: number
 * code: string
 * discount_type: string
 * value: string
 * qty: number
 * available_from: string
 * available_till: string
 * select_general_product?: SelectableCompData
 * general_products: {general_product_id: number, qty: number}[]
 * select_user?: SelectableCompData
 * user_ids: number[]
 * }} RebateCodeModalCompData
 *
 * @typedef {{
 * _data: RebateCodeModalCompData
 * _set_data(data?: RebateCodeModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  value: PiepNode
 *  save_btn: PiepNode
 *  delete_btn: PiepNode
 * }
 * _show(rebate_code_id: number, options?: ShowModalParams)
 * } & BaseComp} RebateCodeModalComp
 */

/**
 * @param {RebateCodeModalComp} comp
 * @param {*} parent
 * @param {RebateCodeModalCompData} data
 */
function rebateCodeModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			rebate_code_id: -1,
			code: "",
			discount_type: "static",
			qty: 0,
			value: "0",
			available_from: "",
			available_till: "",
			general_products: [],
			user_ids: [],
		};
	}

	if (data.select_general_product === undefined) {
		data.select_general_product = {
			options: {},
			dataset: general_products.map((g) => ({ value: g.general_product_id + "", label: g.name })),
			custom_select_callback: (value) => {
				const data = comp._data;
				data.general_products.push({ general_product_id: +value, qty: 1 });
				comp._render();
			},
			get_custom_selection: () => {
				return comp._data.general_products.map((g) => g.general_product_id + "");
			},
		};
	}

	if (data.select_user === undefined) {
		data.select_user = {
			options: {},
			dataset: users.filter((u) => u.email).map((u) => ({ value: u.user_id + "", label: u.email })),
			parent_variable: "user_ids",
		};
	}

	comp._show = (rebate_code_id, options = {}) => {
		const data = comp._data;

		showModal("rebateCode", {
			source: options.source,
		});

		if (rebate_code_id === -1) {
			Object.assign(data, {
				rebate_code_id: -1,
				code: "",
				discount_type: "static",
				qty: 0,
				value: "0",
				available_from: "",
				available_till: "",
				general_products: [],
			});
		} else {
			const rebate_code = rebate_codes.find((r) => r.rebate_code_id === rebate_code_id);
			Object.assign(data, rebate_code);
			data.general_products = [];
			try {
				data.general_products = JSON.parse(rebate_code.general_products_json);
			} catch (e) {}
			data.user_ids = [];
			try {
				data.user_ids = JSON.parse(rebate_code.users_json).map((e) => +e.user_id);
			} catch (e) {}
		}
		comp._render();
	};

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				setTimeout(() => {
					if (data.value.includes("%")) {
						const data = comp._data;
						data.discount_type = "relative";
						data.value = numberFromStr(data.value) + "";
						comp._render();
					}
					if (data.value.includes("z")) {
						const data = comp._data;
						data.discount_type = "static";
						data.value = numberFromStr(data.value) + "";
						comp._render();
					}
				});

				comp._nodes.value.dataset.validate =
					def(data.discount_type, "static") === "static" ? "number|value:{0,10000}" : "number|value:{0,100}";
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="custom_toolbar">
				<span class="title medium">Kod rabatowy</span>
				<button class="btn subtle mla" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary ml1" data-node="{${comp._nodes.save_btn}}">Zapisz <i class="fas fa-save"></i></button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<div class="mtfn">
					<div class="label">Kod</div>
					<input class="field" data-bind="{${data.code}}" data-validate="length:{3,20}" style="text-transform: uppercase;" />

					<div class="label">Wartość</div>
					<div class="glue_children">
						<input class="field" data-bind="{${data.value}}" data-node="{${comp._nodes.value}}" />
						<select class="field" data-bind="{${data.discount_type}}">
							<option value="static">Stała kwota (zł)</option>
							<option value="relative">Kwota proporcjonalna (%)</option>
						</select>
					</div>

					<div class="label">Ilość</div>
					<input class="field" data-bind="{${data.qty}}" data-validate="value:{0,}" />

					<div class="form_columns">
						<div class="form_column">
							<div class="label">Dostępny od</div>
							<input class="field default_datepicker" data-bind="{${data.available_from}}" />
						</div>

						<div class="form_column">
							<div class="label">Dostępny do</div>
							<input class="field default_datepicker" data-bind="{${data.available_till}}" />
						</div>
					</div>

					<div class="label">Produkty</div>
					<selectable-comp data-bind="{${data.select_general_product}}"></selectable-comp>
					<list-comp data-bind="{${data.general_products}}" class="wireframe space mt1">
						<rebate-code_general-product-comp></rebate-code_general-product-comp>
					</list-comp>

					<div class="label">Użytkownicy</div>
					<selectable-comp data-bind="{${data.select_user}}"></selectable-comp>

					<div class="mta pt2" style="text-align: right;">
						<button class="btn error" data-node="{${comp._nodes.delete_btn}}">
							<span>Usuń kod rabatowy</span> <i class="fas fa-trash"></i>
						</button>
					</div>
				</div>
			</div>
		`,
		ready: () => {
			comp._nodes.save_btn.addEventListener("click", () => {
				const data = comp._data;
				const errors = validateInputs(comp._children(`[data-validate]`));
				if (errors.length > 0) {
					return;
				}

				/** @type {any} */
				const rebate_code = {};
				rebate_code.rebate_code_id = data.rebate_code_id;
				rebate_code.code = data.code;
				rebate_code.qty = data.qty;
				rebate_code.available_from = data.available_from ? data.available_from : null;
				rebate_code.available_till = data.available_till ? data.available_till : null;
				rebate_code.value = data.value;
				if (data.discount_type === "relative") {
					rebate_code.value += "%";
				}
				rebate_code.general_products_json = JSON.stringify(data.general_products);
				rebate_code.users_json = JSON.stringify(data.user_ids.map((user_id) => ({ user_id })));

				xhr({
					url: `${STATIC_URLS["ADMIN"]}/rebate_code/save`,
					params: {
						rebate_code,
					},
					success: (res) => {
						showNotification("Zapisano zmiany", { one_line: true, type: "success" });
						refreshRebateCodes();
					},
				});
				hideParentModal(comp._nodes.save_btn);
			});

			comp._nodes.delete_btn.addEventListener("click", () => {
				if (!confirm(`Czy aby na pewno chcesz usunąć kod rabatowy?`)) {
					return;
				}

				xhr({
					url: `${STATIC_URLS["ADMIN"]}/rebate_code/delete/${comp._data.rebate_code_id}`,
					success: (res) => {
						refreshRebateCodes();
					},
				});
				hideParentModal(comp._nodes.save_btn);
			});
		},
	});
}

function getRebateCodeModal() {
	const ex = $("#rebateCode");
	if (!ex) {
		registerModalContent(html`
			<div id="rebateCode" data-expand data-dismissable>
				<div class="modal_body" style="max-width: calc(30% + 400px);max-height: calc(75% + 100px);">
					<rebate-code-modal-comp class="flex_stretch"></rebate-code-modal-comp>
				</div>
			</div>
		`);
	}

	/** @type {RebateCodeModalComp} */
	// @ts-ignore
	const rebate_code_modal_comp = $("#rebateCode rebate-code-modal-comp");
	if (!ex) {
		rebateCodeModalComp(rebate_code_modal_comp, undefined);
	}

	return rebate_code_modal_comp;
}
