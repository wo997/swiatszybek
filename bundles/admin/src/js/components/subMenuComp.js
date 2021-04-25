/* js[admin] */

/**
 * @typedef {{
 * menus: SubMenuCompData[]
 * expanded: boolean
 * } & BaseMenuData & ListCompRowData} SubMenuCompData
 *
 * @typedef {{
 * _data: SubMenuCompData
 * _set_data(data?: SubMenuCompData, options?: SetCompDataOptions)
 * _nodes: {
 * categories: SubMenuComp
 * edit_btn: PiepNode
 * add_btn: PiepNode
 * expand: PiepNode
 * info: PiepNode
 * }
 * } & BaseComp} SubMenuComp
 */

/**
 * @param {SubMenuComp} comp
 * @param {*} parent
 * @param {SubMenuCompData} data
 */
function SubMenuComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			menu_id: -1,
			name: "",
			link_what: "",
			link_what_id: undefined,
			url: undefined,
			menus: [],
			expanded: true,
		};
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				comp.dataset.menu_id = data.menu_id + "";
				expand(comp._nodes.expand, data.expanded);
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="menu_wrapper">
				<span class="menu_name">
					<span html="{${data.name}}"></span>
					<span data-node="{${comp._nodes.info}}" class="text_link semi_bold" data-tooltip_position="bottom"></span>
				</span>
				<p-trait data-trait="expand_multi_list_btn"></p-trait>
				<button class="btn subtle small multi_list_add_btn" data-tooltip="Dodaj menu podrzędne" data-node="{${comp._nodes.add_btn}}">
					<i class="fas fa-plus"></i>
				</button>
				<button class="btn subtle small" data-tooltip="Edytuj menu" data-node="{${comp._nodes.edit_btn}}">
					<i class="fas fa-edit"></i>
				</button>
				<p-trait data-trait="multi_list_grab_btn" data-tooltip="Zmień położenie menu" data-invisible="1"></p-trait>
			</div>
			<div class="expand_y" data-node="{${comp._nodes.expand}}">
				<list-comp data-bind="{${data.menus}}" class="clean">
					<sub-menu-comp></sub-menu-comp>
				</list-comp>
			</div>
		`,
		ready: () => {
			/** @type {ListComp} */
			// @ts-ignore
			const parent = comp._parent_comp;

			const edit_btn = comp._nodes.edit_btn;
			//const data = comp._data;
			edit_btn.addEventListener("click", () => {
				const data = comp._data;

				/** @type {MenuModalCompData} */
				const cat = {
					name: data.name,
					parent_menu_id: menus.find((c) => c.menu_id === data.menu_id).parent_menu_id,
					menu_id: data.menu_id,
					link_what: data.link_what,
					link_what_id: data.link_what_id,
					url: data.url,
				};
				getMenuModal()._show({
					cat,
					source: edit_btn,
					save_callback: (cat) => {
						data.name = cat.name;
						data.link_what = cat.link_what;
						data.link_what_id = cat.link_what_id;
						data.url = cat.url;
						comp._render();

						const menu_data = menus.find((c) => c.menu_id === data.menu_id);
						if (menu_data.parent_menu_id !== cat.parent_menu_id) {
							/** @type {MenusComp} */
							// @ts-ignore
							const menus_comp = comp._parent("menus-comp");

							//const multi_master = comp._parent(".multi_master");

							/** @type {SubMenuComp} */
							// @ts-ignore
							const sub_menu_comp = cat.parent_menu_id > 0 ? menus_comp._child(`[data-menu_id="${cat.parent_menu_id}"]`) : undefined;

							const push_data = cloneObject(data);
							delete push_data.row_id;

							const cat_target = sub_menu_comp ? sub_menu_comp : menus_comp;
							cat_target._data.menus.push(push_data);
							cat_target._render({ freeze: true });

							parent.classList.add("freeze");
							parent._remove_row(data.row_index);
							parent.classList.remove("remove");

							menus_comp._children(`[data-menu_id="${cat.menu_id}"]`).forEach((just_created_comp) => {
								if (just_created_comp !== comp) {
									scrollIntoView(just_created_comp);
								}
							});
						}
					},
					delete_callback: () => {
						parent._remove_row(data.row_index);
					},
				});
			});

			const add_btn = comp._nodes.add_btn;
			add_btn.addEventListener("click", () => {
				getMenuModal()._show({
					source: add_btn,
					is_new: true,
					save_callback: (cat) => {
						comp._data.menus.unshift({
							name: cat.name,
							menu_id: cat.menu_id,
							link_what: cat.link_what,
							link_what_id: cat.link_what_id,
							url: cat.url,
							menus: [],
							expanded: true,
						});
						comp._render();
					},
				});
			});
		},
	});
}
