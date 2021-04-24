/* js[admin] */

/**
 * @typedef {{
 * cat?: MenuModalCompData,
 * source?: PiepNode,
 * save_callback?(cat: MenuModalCompData),
 * delete_callback?()}} ShowMenuModalOptions
 */

/**
 * @typedef {{
 * menu_id: number
 * name: string
 * parent_menu_id: number
 * }} MenuModalCompData
 *
 * @typedef {{
 * _data: MenuModalCompData
 * _set_data(data?: MenuModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *      save_btn: PiepNode
 *      delete_btn: PiepNode
 *      name: PiepNode
 *      parent_menu: PiepNode
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
		data = { name: "", menu_id: -1, parent_menu_id: -1 };
	}

	comp._show = (options = {}) => {
		comp._options = options;

		if (!options.cat) {
			options.cat = { menu_id: -1, name: "", parent_menu_id: -1 };
		}

		comp._data.name = options.cat.name;
		comp._data.menu_id = options.cat.menu_id;
		comp._data.parent_menu_id = options.cat.parent_menu_id;

		comp._render();

		showModal("Menu", {
			source: options.source,
		});
	};

	comp._save = () => {
		const errors = validateInputs([comp._nodes.name]);
		if (errors.length > 0) {
			return;
		}

		if (comp._options.save_callback) {
			comp._options.save_callback(comp._data);
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
		setCompData(comp, data, {
			...options,
			render: () => {
				let options = html`<option value="-1">BRAK (KATEGORIA GŁÓWNA)</option>`;

				/**
				 *
				 * @param {MenusBranch[]} category_branch
				 * @param {number} level
				 */
				const traverse = (category_branch, level = 0, slug = "") => {
					category_branch.forEach((category) => {
						const cat_display = slug + (slug ? " ― " : "") + category.name;
						options += html`<option value="${category.menu_id}">${cat_display}</option>`;
						// HARDCODED 2 LEVELS
						if (level < 1) {
							traverse(category.sub_menus, level + 1, cat_display);
						}
					});
				};
				traverse(menu_tree);
				comp._nodes.parent_menu._set_content(options);
				comp._nodes.parent_menu._set_value(data.parent_menu_id, { quiet: true });
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="custom_toolbar">
				<span class="title medium">Kategoria produktu</span>
				<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary" data-node="{${comp._nodes.save_btn}}" disabled="{${false}}">Zapisz <i class="fas fa-save"></i></button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<div class="label first">Nazwa menu</div>
				<input class="field" data-bind="{${data.name}}" data-node="{${comp._nodes.name}}" data-validate="" />

				<div class="label">Kategoria nadrzędna</div>
				<select class="field" data-bind="{${data.parent_menu_id}}" data-node="{${comp._nodes.parent_menu}}"></select>

				<div style="margin-top: auto;padding-top: 10px;text-align: right;">
					<button class="btn error" data-node="{${comp._nodes.delete_btn}}">Usuń kategorię <i class="fas fa-trash"></i></button>
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
				<div class="modal_body" style="max-width: calc(20% + 250px);max-height: calc(20% + 100px);">
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
