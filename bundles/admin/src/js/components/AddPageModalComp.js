/* js[admin] */

/**
 * @typedef {{
 * template_id: number
 * product_category_id?: string,
 * url: string
 * page_type: string
 * link_what_id: number
 * general_product_id?: string
 * select_product_category?: SelectableCompData
 * select_general_product?: SelectableCompData
 * select_template?: SelectableCompData
 * }} AddPageModalCompData
 *
 * @typedef {{
 * _data: AddPageModalCompData
 * _set_data(data?: AddPageModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  save_btn: PiepNode
 *  case_page: PiepNode
 *  case_product_category: PiepNode
 *  case_general_product: PiepNode
 * }
 * _show?(options?: ShowModalParams)
 * _save()
 * _delete()
 * } & BaseComp} AddPageModalComp
 */

/**
 * @param {AddPageModalComp} comp
 * @param {*} parent
 * @param {AddPageModalCompData} data
 */
function AddPageModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			url: undefined,
			page_type: "",
			link_what_id: undefined,
			template_id: -1,
			general_product_id: null,
			product_category_id: null,
		};
	}

	if (data.select_product_category === undefined) {
		/** @type {SelectableOptionData[]} */
		let category_options = [];

		/**
		 *
		 * @param {ProductCategoryBranch[]} category_branch
		 */
		const traverse = (category_branch) => {
			category_branch.forEach((category) => {
				const cat_display = category.__category_path_names_csv.replace(/,/g, " ― ");
				category_options.push({ label: cat_display, value: category.product_category_id + "" });
				traverse(category.sub_categories);
			});
		};
		if (product_categories_tree) {
			traverse(product_categories_tree);
		}

		data.select_product_category = {
			options: {
				single: true,
			},
			dataset: category_options,
			parent_variable: "product_category_id",
		};
	}

	if (data.select_general_product === undefined) {
		data.select_general_product = {
			options: {
				single: true,
			},
			dataset: general_products ? general_products.map((g) => ({ value: g.general_product_id.toString(), label: g.name })) : [],
			parent_variable: "general_product_id",
		};
	}

	if (data.select_template === undefined) {
		data.select_template = {
			options: { single: true },
			dataset: [],
			parent_variable: "template_id",
		};
	}

	comp._show = (options = {}) => {
		const data = comp._data;

		data.product_category_id = data.page_type === "product_category" ? data.link_what_id.toString() : null;
		data.general_product_id = data.page_type === "general_product" ? data.link_what_id.toString() : null;

		comp._render();

		showModal("AddPageModal", {
			source: options.source,
		});
	};

	comp._set_data = (data, options = {}) => {
		if (data.page_type === "product_category") {
			data.link_what_id = +data.product_category_id;
		} else if (data.page_type === "general_product") {
			data.link_what_id = +data.general_product_id;
		}

		if (data.page_type === "page") {
			data.link_what_id = null;
		}

		data.select_template.dataset = [
			...templates.filter((t) => t.page_type === data.page_type).map((t) => ({ value: t.template_id.toString(), label: t.name })),
		];

		if (data.page_type === "page") {
			data.select_template.dataset.unshift({ value: "-1", label: "Brak - Pusta strona" });
		}

		setCompData(comp, data, {
			...options,
			render: () => {
				expand(comp._nodes.case_page, data.page_type === "page");
				expand(comp._nodes.case_product_category, data.page_type === "product_category");
				expand(comp._nodes.case_general_product, data.page_type === "general_product");
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="custom_toolbar">
				<span class="title medium">Utwórz stronę</span>
				<button class="btn subtle mla" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary ml1" data-node="{${comp._nodes.save_btn}}">Dodaj <i class="fas fa-check"></i></button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<div class="mtfn">
					<div class="label">Typ strony</div>
					<div class="radio_group boxes hide_checks semi_bold flex" data-bind="{${data.page_type}}" data-validate="">
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

					<div class="expand_y" data-node="{${comp._nodes.case_page}}">
						<div class="label">
							Link
							<div class="hover_info">Pozostaw pusty dla strony głównej</div>
						</div>
						<div class="glue_children">
							<span class="field_desc">${location.host}/</span>
							<input class="field trim" data-bind="{${data.url}}" />
						</div>
					</div>
					<div class="expand_y" data-node="{${comp._nodes.case_general_product}}">
						<div class="label">Produkt</div>
						<selectable-comp data-bind="{${data.select_general_product}}" data-validate=""></selectable-comp>
					</div>
					<div class="expand_y" data-node="{${comp._nodes.case_product_category}}">
						<div class="label">Kategoria produktów</div>
						<selectable-comp data-bind="{${data.select_product_category}}" data-validate=""></selectable-comp>
					</div>

					<div class="label">Szablon</div>
					<selectable-comp data-bind="{${data.select_template}}" data-validate=""></selectable-comp>
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

				const page = {
					page_id: -1,
					active: 0,
					page_type: data.page_type,
				};

				if (data.page_type === "page") {
					page.url = data.url;
				} else {
					page.link_what_id = data.link_what_id;
				}

				page.template_id = data.template_id;

				showLoader();
				xhr({
					url: STATIC_URLS["ADMIN"] + "/page/save",
					params: {
						page,
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

function getAddPageModal() {
	const ex = $("#AddPageModal");
	if (!ex) {
		registerModalContent(html`
			<div id="AddPageModal" data-expand data-dismissable>
				<div class="modal_body" style="max-width: calc(10% + 500px);max-height: calc(20% + 500px);">
					<add-page-modal-comp class="flex_stretch"></add-page-modal-comp>
				</div>
			</div>
		`);
	}

	/** @type {AddPageModalComp} */
	// @ts-ignore
	const add_page_modal_comp = $("#AddPageModal add-page-modal-comp");
	if (!ex) {
		AddPageModalComp(add_page_modal_comp, undefined);
	}
	return add_page_modal_comp;
}
