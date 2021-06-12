/* js[admin] */

/**
 * @typedef {{
 * vat_id: number
 * value: number
 * description: string
 * }} VatModalCompData
 *
 * @typedef {{
 * _data: VatModalCompData
 * _set_data(data?: VatModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  save_btn: PiepNode
 *  delete_btn: PiepNode
 * }
 * _show?(vat_id: number, options?: ShowModalParams)
 * } & BaseComp} VatModalComp
 */

/**
 * @param {VatModalComp} comp
 * @param {*} parent
 * @param {VatModalCompData} data
 */
function VatModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			value: 0,
			description: "",
		};
	}

	comp._show = (vat_id, options = {}) => {
		const data = comp._data;

		showModal("VatModal", {
			source: options.source,
		});

		data.vat_id = vat_id;
		if (vat_id === -1) {
			data.value = 0;
			data.description = "";
			comp._render();
		} else {
			const vat = vats.find((r) => r.vat_id === vat_id);
			data.value = vat.value;
			data.description = vat.description;
			comp._render();
		}
	};

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				comp._child(".case_can_delete").classList.toggle("hidden", data.vat_id === -1);
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="custom_toolbar">
				<span class="title medium mr2">Dostawa produktów</span>
				<button class="btn subtle mla" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary ml1" data-node="{${comp._nodes.save_btn}}">Dodaj <i class="fas fa-check"></i></button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<div class="mtfn">
					<div class="label">Wartość</div>
					<div class="glue_children">
						<input class="field" data-bind="{${data.value}}" data-validate="number|value:{0,100}" />
						<div class="field_desc">%</div>
					</div>

					<div class="label">Opis</div>
					<input class="field" data-bind="{${data.description}}" />

					<div class="mta pt2 case_can_delete" style="text-align: right;">
						<button class="btn error" data-node="{${comp._nodes.delete_btn}}">Usuń stawkę VAT <i class="fas fa-trash"></i></button>
					</div>
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

				const vat = {
					value: data.value,
					description: data.description,
				};

				showLoader();
				xhr({
					url: STATIC_URLS["ADMIN"] + "/vat/save",
					params: {
						vat,
					},
					success: (res) => {
						hideLoader();
						refreshVats();
						hideModal("VatModal");
					},
				});
			});

			comp._nodes.delete_btn.addEventListener("click", () => {
				if (!confirm("Czy aby na pewno chcesz usunąć stawkę VAT?")) {
					return;
				}

				showLoader();
				xhr({
					url: `${STATIC_URLS["ADMIN"]}/vat/delete/${comp._data.vat_id}`,
					success: (res) => {
						hideLoader();
						refreshVats();
						hideModal("VatModal");
					},
				});
			});
		},
	});
}

function getVatModal() {
	const ex = $("#VatModal");
	if (!ex) {
		registerModalContent(html`
			<div id="VatModal" data-dismissable>
				<div class="modal_body">
					<vat-modal-comp class="flex_stretch"></vat-modal-comp>
				</div>
			</div>
		`);
	}

	/** @type {VatModalComp} */
	// @ts-ignore
	const vat_modal_comp = $("#VatModal vat-modal-comp");
	if (!ex) {
		VatModalComp(vat_modal_comp, undefined);
	}
	return vat_modal_comp;
}
