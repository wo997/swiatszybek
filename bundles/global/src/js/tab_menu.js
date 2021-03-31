/* js[global] */

document.addEventListener("click", (ev) => {
	const target = $(ev.target);
	const option = target._parent(".tab_option");
	const menu = target._parent(".tab_menu");

	if (!option || !menu) return;

	const tab_id = +option.dataset.tab_id;
	showTab(menu, tab_id);
});

/**
 *
 * @param {PiepNode} tab_menu
 * @param {number} tab_id
 */
function showTab(tab_menu, tab_id) {
	tab_menu._children(".tab_header .tab_option").forEach((option) => {
		const curr = +option.getAttribute("data-tab_id") === tab_id;
		option.classList.toggle("current", curr);
	});
	tab_menu._children(".tab_content").forEach((menu) => {
		//menu.classList.toggle("hidden", +menu.dataset.tab_id !== tab_id);
		expand(menu, +menu.dataset.tab_id === tab_id);
	});
	tab_menu._dispatch_change();
}
