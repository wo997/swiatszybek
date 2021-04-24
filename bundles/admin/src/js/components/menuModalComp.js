/* js[admin] */

/**
 * @typedef {{
 * cat?: MenuModalCompData,
 * source?: PiepNode,
 * is_new?: boolean
 * save_callback?(cat: MenuModalCompData),
 * delete_callback?()}} ShowMenuModalOptions
 */

/**
 * @typedef {{
 * parent_menu_id: number
 * product_category_id?: number,
 * product_id?: number
 * } & BaseMenuData} MenuModalCompData
 *
 * @typedef {{
 * _data: MenuModalCompData
 * _set_data(data?: MenuModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *      save_btn: PiepNode
 *      delete_btn: PiepNode
 *      parent_menu: PiepNode
 *      case_product_category: PiepNode
 *      case_product: PiepNode
 *      case_url: PiepNode
 * }
 * _show?(options: ShowMenuModalOptions)
 * _save()
 * _delete()
 * _options: ShowMenuModalOptions
 * } & BaseComp} MenuModalComp
 */

/**
 * @param {MenuModalComp} comp
 * @param {*} parent
 * @param {MenuModalCompData} data
 */
function MenuModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			name: "",
			url: undefined,
			link_what: "",
			link_what_id: undefined,
			menu_id: -1,
			parent_menu_id: -1,
			product_category_id: -1,
			product_id: -1,
		};
	}

	comp._show = (options = {}) => {
		const data = comp._data;

		comp._options = options;

		if (!options.cat) {
			options.cat = {
				menu_id: -1,
				link_what: "",
				link_what_id: undefined,
				url: undefined,
				name: "",
				parent_menu_id: -1,
			};
		}

		data.name = options.cat.name;
		data.menu_id = options.cat.menu_id;
		data.parent_menu_id = options.cat.parent_menu_id;
		data.link_what = options.cat.link_what;
		data.link_what_id = options.cat.link_what_id;
		data.url = options.cat.url;

		data.product_category_id = data.link_what === "product_category" ? data.link_what_id : null;
		data.product_id = data.link_what === "product" ? data.link_what_id : null;

		comp._render();

		comp._child(".parent_menu_wrapper").classList.toggle("hidden", !!options.is_new);

		showModal("Menu", {
			source: options.source,
		});
	};

	comp._save = () => {
		const data = comp._data;
		const errors = validateInputs(comp._children("[data-validate]").filter((e) => !e._parent(".hidden")));
		if (errors.length > 0) {
			return;
		}

		if (comp._options.save_callback) {
			comp._options.save_callback(data);
		}

		hideParentModal(comp);
	};

	comp._delete = () => {
		if (comp._options.delete_callback) {
			comp._options.delete_callback();
		}
		hideParentModal(comp);
	};

	comp._set_data = (data, options = {}) => {
		if (data.link_what === "product_category") {
			data.link_what_id = data.product_category_id;
		} else if (data.link_what === "product") {
			data.link_what_id = data.product_id;
		} else {
			data.link_what_id = null;
		}

		setCompData(comp, data, {
			...options,
			render: () => {
				let options = html`<option value="-1">BRAK (MENU GŁÓWNE)</option>`;

				/**
				 *
				 * @param {MenusBranch[]} menu_branch
				 * @param {number} level
				 */
				const traverse = (menu_branch, level = 0, slug = "") => {
					menu_branch.forEach((menu) => {
						const cat_display = slug + (slug ? " ― " : "") + menu.name;
						if (menu.menu_id === data.menu_id) {
							return;
						}
						options += html`<option value="${menu.menu_id}">${cat_display}</option>`;
						if (level < 1) {
							traverse(menu.sub_menus, level + 1, cat_display);
						}
					});
				};
				traverse(menu_tree);
				comp._nodes.parent_menu._set_content(options);
				comp._nodes.parent_menu._set_value(data.parent_menu_id, { quiet: true });

				expand(comp._nodes.case_product_category, data.link_what === "product_category");
				expand(comp._nodes.case_product, data.link_what === "product");
				expand(comp._nodes.case_url, data.link_what === "url");
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="custom_toolbar">
				<span class="title medium">Menu</span>
				<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary" data-node="{${comp._nodes.save_btn}}" disabled="{${false}}">Zapisz <i class="fas fa-save"></i></button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<div class="label first">Nazwa menu</div>
				<input class="field" data-bind="{${data.name}}" data-validate="" />

				<div class="label">Typ linku</div>
				<div class="radio_group boxes hide_checks semi_bold" data-bind="{${data.link_what}}" data-validate="">
					<div class="checkbox_area">
						<p-checkbox data-value="product_category"></p-checkbox>
						<span>Kategoria produktów</span>
					</div>
					<div class="checkbox_area">
						<p-checkbox data-value="product"></p-checkbox>
						<span>Produkt</span>
					</div>
					<div class="checkbox_area">
						<p-checkbox data-value="url"></p-checkbox>
						<span>Dowolny link</span>
					</div>
				</div>

				<div class="expand_y" data-node="{${comp._nodes.case_product_category}}">
					<div class="label">Kategoria Produkt</div>
					<input class="field number" data-bind="{${data.product_category_id}}" data-validate="" />
				</div>
				<div class="expand_y" data-node="{${comp._nodes.case_product}}">
					<div class="label">Produkt</div>
					<input class="field number" data-bind="{${data.product_id}}" data-validate="" />
				</div>
				<div class="expand_y" data-node="{${comp._nodes.case_url}}">
					<div class="label">Link</div>
					<input class="field trim" data-bind="{${data.url}}" data-validate="" />
				</div>

				<div class="parent_menu_wrapper">
					<div class="label">Kategoria nadrzędna</div>
					<select class="field" data-bind="{${data.parent_menu_id}}" data-node="{${comp._nodes.parent_menu}}"></select>
				</div>

				<div style="margin-top: auto;padding-top: 10px;text-align: right;">
					<button class="btn error" data-node="{${comp._nodes.delete_btn}}">Usuń menu <i class="fas fa-trash"></i></button>
				</div>
			</div>
		`,
		ready: () => {
			comp._nodes.save_btn.addEventListener("click", () => {
				comp._save();
			});
			comp._nodes.delete_btn.addEventListener("click", () => {
				comp._delete();
			});
		},
	});
}

function getMenuModal() {
	const ex = $("#Menu");
	if (!ex) {
		registerModalContent(html`
			<div id="Menu" data-expand data-dismissable>
				<div class="modal_body" style="max-width: calc(10% + 500px);max-height: calc(20% + 500px);">
					<menu-modal-comp class="flex_stretch"></menu-modal-comp>
				</div>
			</div>
		`);
	}

	/** @type {MenuModalComp} */
	// @ts-ignore
	const menu_modal_comp = $("#Menu menu-modal-comp");
	if (!ex) {
		MenuModalComp(menu_modal_comp, undefined);
	}
	return menu_modal_comp;
}
