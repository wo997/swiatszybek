/* js[admin] */

/**
 * @typedef {{
 * name: string
 * page_type: string
 * parent_template_id: number
 * select_parent_template?: SelectableCompData
 * }} AddTemplateModalCompData
 *
 * @typedef {{
 * _data: AddTemplateModalCompData
 * _set_data(data?: AddTemplateModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  save_btn: PiepNode
 * }
 * _show?(options?: ShowModalParams)
 * _save()
 * _delete()
 * } & BaseComp} AddTemplateModalComp
 */

/**
 * @param {AddTemplateModalComp} comp
 * @param {*} parent
 * @param {AddTemplateModalCompData} data
 */
function AddTemplateModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			name: "",
			page_type: "",
			parent_template_id: undefined,
		};
	}

	if (data.select_parent_template === undefined) {
		data.select_parent_template = {
			options: {
				single: true,
			},
			dataset: [
				{ value: "-1", label: "Brak - Pusta strona" },
				...templates.map((t) => ({ value: t.template_id.toString(), label: t.name })),
			],
			parent_variable: "parent_template_id",
		};
	}

	comp._show = (options = {}) => {
		const data = comp._data;

		data.parent_template_id = null;

		comp._render();

		showModal("AddTemplateModal", {
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
				<span class="title medium">Utwórz szablon</span>
				<button class="btn subtle mla" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary ml1" data-node="{${comp._nodes.save_btn}}">Dodaj <i class="fas fa-check"></i></button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<div class="label first">Nazwa szablonu</div>
				<input class="field" data-bind="{${data.name}}" />

				<div class="label">Typ strony</div>
				<div class="radio_group boxes hide_checks semi_bold" data-bind="{${data.page_type}}" data-validate="">
					<div class="checkbox_area">
						<p-checkbox data-value="page"></p-checkbox>
						<span>Zwykła strona</span>
					</div>
					<div class="checkbox_area">
						<p-checkbox data-value="general_product"></p-checkbox>
						<span>Produkt</span>
					</div>
					<div class="checkbox_area">
						<p-checkbox data-value="product_category"></p-checkbox>
						<span>Kategoria produktów</span>
					</div>
				</div>

				<div class="label">Szablon nadrzędny</div>
				<selectable-comp data-bind="{${data.select_parent_template}}" data-validate=""></selectable-comp>
			</div>
		`,
		ready: () => {
			comp._nodes.save_btn.addEventListener("click", () => {
				const data = comp._data;
				const errors = validateInputs(comp._children("[data-validate]").filter((e) => !e._parent(".hidden")));
				if (errors.length > 0) {
					return;
				}

				const template = {
					template_id: -1,
					name: data.name,
					page_type: data.page_type,
					parent_template_id: data.parent_template_id,
				};

				showLoader();
				xhr({
					url: STATIC_URLS["ADMIN"] + "/template/save",
					params: {
						template,
					},
					success: (res) => {
						hideLoader();
						if (!res.template_id) {
							alert("Wystąpił błąd krytyczny");
							return;
						}

						window.location.href = `${STATIC_URLS["ADMIN"]}/strona?nr_szablonu=${res.template_id}`;
					},
				});
			});
		},
	});
}

function getAddTemplateModal() {
	const ex = $("#AddTemplateModal");
	if (!ex) {
		registerModalContent(html`
			<div id="AddTemplateModal" data-expand data-dismissable>
				<div class="modal_body" style="max-width: calc(10% + 500px);max-height: calc(20% + 500px);">
					<add-template-modal-comp class="flex_stretch"></add-template-modal-comp>
				</div>
			</div>
		`);
	}

	/** @type {AddTemplateModalComp} */
	// @ts-ignore
	const add_template_modal_comp = $("#AddTemplateModal add-template-modal-comp");
	if (!ex) {
		AddTemplateModalComp(add_template_modal_comp, undefined);
	}
	return add_template_modal_comp;
}
