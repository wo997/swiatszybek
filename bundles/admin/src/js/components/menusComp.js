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
					link_what: copy_cat.link_what,
					link_what_id: copy_cat.link_what_id,
					url: copy_cat.url,
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
					link_what: cat.link_what,
					link_what_id: cat.link_what_id,
					url: cat.url,
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
				comp.dispatchEvent(new CustomEvent("saved_state"));
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

					const menu_modal_comp = getMenuModal();

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

						const link_what = com._data.link_what;
						let info = "";
						let tooltip = "";
						if (link_what === "product_category") {
							info = "Kategoria produktów";
							const pretty_product_category = menu_modal_comp._data.select_product_category.dataset.find(
								(d) => d.value === com._data.link_what_id.toString()
							);
							if (pretty_product_category) {
								tooltip = pretty_product_category.label;
							}

							if (com._data.menus.length > 0) {
								info += ` (0)`;
								tooltip += html` - Kategorie podrzędne nie zostaną dołączone automatycznie`;
							} else {
								/** @type {string[]} */
								let categories_inside = [];
								/**
								 * @param {ProductCategoryBranch[]} category_branch
								 */
								const traverse = (category_branch, inside = false) => {
									category_branch.forEach((category) => {
										const cat_display = category.__category_path_names_csv.replace(/,/g, " ― ");
										if (inside) {
											categories_inside.push("<br> ⋅ " + cat_display);
										}
										traverse(category.sub_categories, inside || category.product_category_id === com._data.link_what_id);
									});
								};
								traverse(product_categories_tree);

								if (categories_inside.length) {
									info += ` (${categories_inside.length})`;
									tooltip += html`<div class="mt1">
										<span class="semi_bold">Automatycznie dołączone do menu:</span>${categories_inside}
									</div>`;
								}
							}
						} else if (link_what === "general_product") {
							info = "Produkt";
							const pretty_general_product = menu_modal_comp._data.select_general_product.dataset.find(
								(d) => d.value === com._data.link_what_id.toString()
							);
							if (pretty_general_product) {
								tooltip = pretty_general_product.label;
							}
						} else if (link_what === "page") {
							info = "Strona";
							const page = pages.find((p) => p.page_id === com._data.link_what_id);
							if (page) {
								tooltip = `${location.host}/${page.url}`;
							}
						} else if (link_what === "url") {
							info = "Link";
							tooltip = com._data.url;
						}
						if (info) {
							info = " - " + info;
						}
						com._nodes.info._set_content(info);
						com._nodes.info.dataset.tooltip = tooltip;
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

			<div class="mt2" style="position: relative;user-select: none;">
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
					is_new: true,
					save_callback: (cat) => {
						comp._data.menus.unshift({
							name: cat.name,
							link_what: cat.link_what,
							link_what_id: cat.link_what_id,
							url: cat.url,
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
