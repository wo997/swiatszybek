/* js[admin] */

/**
 * @typedef {{
 * parent_page_id: number
 * product_category_id?: string,
 * url: string
 * link_what: string
 * link_what_id: number
 * general_product_id?: string
 * select_product_category?: SelectableCompData
 * select_general_product?: SelectableCompData
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
			link_what: "",
			link_what_id: undefined,
			parent_page_id: -1,
			product_category_id: null,
			general_product_id: null,
		};
	}

	if (data.select_product_category === undefined) {
		/** @type {SelectableOptionData[]} */
		let category_options = [];

		/**
		 *
		 * @param {ProductCategoryBranch[]} category_branch
		 * @param {number} level
		 */
		const traverse = (category_branch, level = 0, slug = "") => {
			category_branch.forEach((category) => {
				const cat_display = slug + (slug ? " ― " : "") + category.name;
				category_options.push({ label: cat_display, value: category.product_category_id + "" });
				traverse(category.sub_categories, level + 1, cat_display);
			});
		};
		traverse(product_categories_tree);

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
			dataset: general_products.map((g) => ({ value: g.general_product_id.toString(), label: g.name })),
			parent_variable: "general_product_id",
		};
	}

	comp._show = (options = {}) => {
		const data = comp._data;

		data.product_category_id = data.link_what === "product_category" ? data.link_what_id.toString() : null;
		data.general_product_id = data.link_what === "general_product" ? data.link_what_id.toString() : null;

		comp._render();

		showModal("AddPageModal", {
			source: options.source,
		});
	};

	comp._set_data = (data, options = {}) => {
		if (data.link_what === "product_category") {
			data.link_what_id = +data.product_category_id;
		} else if (data.link_what === "general_product") {
			data.link_what_id = +data.general_product_id;
		} else if (data.link_what === "page") {
			data.link_what_id = null;
		}

		setCompData(comp, data, {
			...options,
			render: () => {
				expand(comp._nodes.case_page, data.link_what === "page");
				expand(comp._nodes.case_product_category, data.link_what === "product_category");
				expand(comp._nodes.case_general_product, data.link_what === "general_product");
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="custom_toolbar">
				<span class="title medium">Utwórz stronę</span>
				<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary" data-node="{${comp._nodes.save_btn}}">Dodaj <i class="fas fa-check"></i></button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<div class="label first">Typ strony</div>
				<div class="radio_group boxes hide_checks semi_bold" data-bind="{${data.link_what}}" data-validate="">
					<div class="checkbox_area">
						<p-checkbox data-value="page"></p-checkbox>
						<span>Zwykła strona</span>
					</div>
					<div class="checkbox_area">
						<p-checkbox data-value="product_category"></p-checkbox>
						<span>Strona kategorii produktów</span>
					</div>
					<div class="checkbox_area">
						<p-checkbox data-value="general_product"></p-checkbox>
						<span>Strona produktu</span>
					</div>
				</div>

				<div class="expand_y" data-node="{${comp._nodes.case_page}}">
					<div class="label">Link</div>
					<input class="field trim" data-bind="{${data.url}}" data-validate="" />
				</div>
				<div class="expand_y" data-node="{${comp._nodes.case_product_category}}">
					<div class="label">Kategoria produktów</div>
					<selectable-comp data-bind="{${data.select_product_category}}" data-validate=""></selectable-comp>
				</div>
				<div class="expand_y" data-node="{${comp._nodes.case_general_product}}">
					<div class="label">Produkt</div>
					<selectable-comp data-bind="{${data.select_general_product}}" data-validate=""></selectable-comp>
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

				showLoader();
				xhr({
					url: STATIC_URLS["ADMIN"] + "/page/save",
					params: {
						page: {
							page_id: -1,
							link_what: data.link_what,
							link_what_id: data.link_what_id,
							url: data.url,
							active: 0,
						},
					},
					success: (res) => {
						hideLoader();
						if (!res.page_id) {
							alert("Wystąpił błąd krytyczny");
							return;
						}

						window.location.href = `${STATIC_URLS["ADMIN"] + "/strona/" + res.page_id}`;
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
