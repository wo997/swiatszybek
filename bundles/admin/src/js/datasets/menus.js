/* js[!admin] */

/**
 * @typedef {{
 * menu_id: number
 * name: string
 * url: string
 * link_what: string
 * link_what_id: number
 * }} BaseMenuData
 */

/**
 * @typedef {{
 * parent_menu_id: number
 * pos: number
 * } & BaseMenuData} MenuData
 */

/**
 * @typedef {{
 * pos: number
 * sub_menus: MenusBranch[]
 * } & BaseMenuData} MenusBranch
 */

/** @type {MenuData[]} */
let menus;

/** @type {MenusBranch[]} */
let menu_tree;

function loadedMenu() {
	menu_tree = [];

	/**
	 *
	 * @param {MenusBranch} branch
	 */
	const connectWithParent = (branch) => {
		const list = branch ? branch.sub_menus : menu_tree;
		for (const cat of menus) {
			if (cat.parent_menu_id === (branch ? branch.menu_id : -1)) {
				/** @type {MenusBranch} */
				const sub_cat = {
					name: cat.name,
					link_what: cat.link_what,
					link_what_id: cat.link_what_id,
					url: cat.url,
					menu_id: cat.menu_id,
					pos: cat.pos,
					sub_menus: [],
				};
				list.push(sub_cat);
				connectWithParent(sub_cat);
			}
		}
		list.sort((a, b) => Math.sign(a.pos - b.pos));
	};

	connectWithParent(undefined);
}

function refreshMenu() {
	xhr({
		url: STATIC_URLS["ADMIN"] + "/menu/all",
		success: (res) => {
			menus = res;
			loadedMenu();
			window.dispatchEvent(new CustomEvent("menu_changed"));
		},
	});
}
