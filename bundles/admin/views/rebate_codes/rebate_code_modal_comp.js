/* js[view] */

/**
 * @typedef {{
 * rebate_code_id: number
 * code: string
 * discount_type: string
 * value: string
 * qty: number
 * available_from: string
 * available_till: string
 * }} RebateCodeModalCompData
 *
 * @typedef {{
 * _data: RebateCodeModalCompData
 * _set_data(data?: RebateCodeModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  save_btn: PiepNode
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
		};
	}

	comp._show = (rebate_code_id, options = {}) => {
		showModal("rebateCode", {
			source: options.source,
		});

		if (rebate_code_id === -1) {
			comp._data = {
				rebate_code_id: -1,
				code: "",
				discount_type: "static",
				qty: 0,
				value: "0",
				available_from: "",
				available_till: "",
			};
			comp._render();
		} else {
			xhr({
				url: `${STATIC_URLS["ADMIN"]}/rebate_code/get/${rebate_code_id}`,
				success: (res) => {
					comp._data = res.rebate_code;
					comp._render();
				},
			});
		}
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
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="custom_toolbar">
				<span class="title medium">Edycja kategorii produktów</span>
				<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary" data-node="{${comp._nodes.save_btn}}">Zapisz <i class="fas fa-save"></i></button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<div class="label">Kod</div>
				<input type="text" class="field" data-bind="{${data.code}}" data-validate="string" style="text-transform: uppercase;" />

				<div class="label">Wartość</div>
				<div class="glue_children">
					<input type="text" class="field" data-bind="{${data.value}}" data-validate="number" />
					<select type="text" class="field" data-bind="{${data.discount_type}}">
						<option value="static">Stała kwota (zł)</option>
						<option value="relative">Kwota proporcjonalna (%)</option>
					</select>
				</div>

				<div class="label">Ilość</div>
				<input type="text" class="field" data-bind="{${data.qty}}" />

				<div class="label">Dostępny od</div>
				<input type="text" class="field default_datepicker" data-bind="{${data.available_from}}" />

				<div class="label">Dostępny do</div>
				<input type="text" class="field default_datepicker" data-bind="{${data.available_till}}" />
			</div>
		`,
		ready: () => {
			comp._nodes.save_btn.addEventListener("click", () => {
				const errors = validateInputs(comp._children(`[data-validate]`));
				if (errors.length > 0) {
					return;
				}

				const rebate_code = comp._data;
				rebate_code.available_from = rebate_code.available_from ? rebate_code.available_from : null;
				rebate_code.available_till = rebate_code.available_till ? rebate_code.available_till : null;
				if (rebate_code.discount_type === "relative") {
					rebate_code.value += "%";
				}

				xhr({
					url: `${STATIC_URLS["ADMIN"]}/rebate_code/save`,
					params: {
						rebate_code,
					},
					success: (res) => {},
				});
				hideParentModal(comp._nodes.save_btn);
				window.dispatchEvent(new CustomEvent("rebate_codes_changed"));
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
