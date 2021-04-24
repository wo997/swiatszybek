/* js[!admin] */

/**
 * @typedef {{
 * menu_id: number
 * parent_menu_id: number
 * name: string
 * pos: number
 * }} MenuData
 */

/**
 * @typedef {{
 * menu_id: number
 * name: string
 * pos: number
 * sub_menus: MenusBranch[]
 * }} MenusBranch
 */

/** @type {MenuData[]} */
let menus = [];

/** @type {MenusBranch[]} */
let menu_tree = [];

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
