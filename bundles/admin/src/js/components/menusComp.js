/* js[admin] */

/**
 * @typedef {{
 * menus: SubMenuCompData[]
 * }} MenusCompData
 *
 * @typedef {{
 * _data: MenusCompData
 * _set_data(data?: MenusCompData, options?: SetCompDataOptions)
 * _nodes: {
 *      add_btn: PiepNode
 *      save_btn: PiepNode
 *      expand_all_btn: PiepNode
 *      shrink_all_btn: PiepNode
 * } & CompWithHistoryNodes
 * _recreate_tree()
 * _save()
 * } & BaseComp} MenusComp
 */

/**
 * @param {MenusComp} comp
 * @param {*} parent
 * @param {MenusCompData} data
 */
function MenusComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			menus: [],
		};
	}

	comp._recreate_tree = () => {
		comp._data.menus = [];

		/**
		 *
		 * @param {SubMenuCompData} branch
		 * @param {MenusBranch[]} sub_categories
		 */
		const connectWithParent = (branch, sub_categories) => {
			const list = branch ? branch.menus : comp._data.menus;
			for (const copy_cat of sub_categories) {
				/** @type {SubMenuCompData} */
				const sub_cat = {
					name: copy_cat.name,
					menu_id: copy_cat.menu_id,
					menus: [],
					expanded: true,
				};
				list.push(sub_cat);
				connectWithParent(sub_cat, copy_cat.sub_menus);
			}
		};

		connectWithParent(undefined, menu_tree);

		comp._render({ freeze: true });
	};

	comp._save = () => {
		/**
		 *
		 * @param {SubMenuCompData[]} menus
		 * @return {MenusBranch[]}
		 */
		const traverse = (menus) => {
			let data = [];
			let pos = 0;

			for (const cat of menus) {
				pos++;
				const sub_menus = traverse(cat.menus);
				data.push({
					name: cat.name,
					pos,
					menu_id: cat.menu_id,
					sub_menus,
				});
			}

			return data;
		};

		const data = traverse(comp._data.menus);

		xhr({
			url: STATIC_URLS["ADMIN"] + "/menu/save_all",
			params: {
				menus: data,
			},
			success: (res) => {
				comp.dispatchEvent(new CustomEvent("saved_menu"));
				showNotification("Zapisano menu", {
					one_line: true,
					type: "success",
				});
				setTimeout(refreshMenu, 200);

				buildResponsiveHeader();
			},
		});
	};

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				setTimeout(() => {
					const multi_master = comp._child(".multi_master");

					comp._children(".round_top").forEach((e) => e.classList.remove("round_top"));
					comp._children("sub-menu-comp").forEach((/** @type {SubMenuComp} */ com) => {
						if (!com._data) {
							return;
						}
						const list_row = com._parent(".list_row");
						const pr = list_row._prev();
						const ne = list_row._next();
						const round = com._data.menus.length > 0;
						const menu_wrapper = com._child(".menu_wrapper");
						menu_wrapper.classList.toggle("round_bottom", !ne || round);
						if (!pr) {
							menu_wrapper.classList.add("round_top");
						}
						if (ne && round) {
							ne._child(".menu_wrapper").classList.add("round_top");
						}

						// expand_btn
						const expand_multi_list_btn = com._child(".node_expand_multi_list_btn");

						let lr = list_row;
						let level = 0;
						while (lr) {
							level++;
							lr = lr._parent(".list_row", { skip: 1 });
						}
						const max_expand = 1;

						const active = level <= max_expand && com._data.menus.length > 0;
						expand_multi_list_btn.classList.toggle("active", active);

						// add_btn
						const max_levels = +def(multi_master.dataset.max_level, 3);
						const multi_list_add_btn = com._child(".multi_list_add_btn");
						multi_list_add_btn.classList.toggle("active", level < max_levels);

						// sometimes the user can do nothing so pls don't hide the contents
						if (!active && !expand_multi_list_btn.classList.contains("expanded")) {
							expand_multi_list_btn.click();
						}
					});
				});
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<p-trait data-trait="history"></p-trait>
			<button class="btn primary" data-node="{${comp._nodes.save_btn}}">Zapisz <i class="fas fa-save"></i></button>

			<button class="btn primary" data-node="{${comp._nodes.add_btn}}">
				Dodaj menu główne
				<i class="fas fa-plus"></i>
			</button>

			<button class="btn subtle" data-node="{${comp._nodes.shrink_all_btn}}">
				Zwiń wszystko
				<i class="fas fa-angle-double-up"></i>
			</button>
			<button class="btn subtle" data-node="{${comp._nodes.expand_all_btn}}">
				Rozwiń wszystko
				<i class="fas fa-angle-double-down"></i>
			</button>

			<div style="height:20px"></div>

			<div style="position: relative;user-select: none;">
				<list-comp data-bind="{${data.menus}}" class="clean multi_master" data-max_level="3" data-multi_row_selector=".menu_wrapper">
					<sub-menu-comp></sub-menu-comp>
				</list-comp>
			</div>

			<div style="height:50px"></div>
		`,
		ready: () => {
			setTimeout(() => {
				comp._recreate_tree();
			});

			comp._nodes.save_btn.addEventListener("click", () => {
				comp._save();
			});

			const menu_modal_comp = getMenuModal();
			const add_btn = comp._nodes.add_btn;
			add_btn.addEventListener("click", () => {
				menu_modal_comp._show({
					source: add_btn,
					save_callback: (cat) => {
						comp._data.menus.unshift({
							name: cat.name,
							menu_id: cat.menu_id,
							menus: [],
							expanded: true,
						});
						comp._render();
					},
				});
			});

			comp._nodes.expand_all_btn.addEventListener("click", () => {
				comp._children(".node_expand_multi_list_btn.active:not(.expanded)").forEach((e) => {
					e.click();
				});
			});

			comp._nodes.shrink_all_btn.addEventListener("click", () => {
				comp._children(".node_expand_multi_list_btn.active.expanded").forEach((e) => {
					e.click();
				});
			});

			window.addEventListener("menu_changed", () => {
				comp._recreate_tree();
			});
		},
	});
}
