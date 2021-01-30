/* js[admin] */

document.addEventListener("click", (event) => {
	var t = $(event.target);
	var option = t._parent(".tab-option");
	var menu = t._parent(".tab-menu");
	if (!option || !menu) return;

	var tab_id = option.getAttribute("data-tab_id");

	showTab(menu, tab_id);
});

function showTab(tab_menu, tab_id) {
	tab_menu._children(".tab-header .tab-option").forEach((e) => {
		e.classList.toggle("current", e.getAttribute("data-tab_id") == tab_id);
	});
	tab_menu._children(".tab-content").forEach((e) => {
		e.classList.toggle("hidden", e.getAttribute("data-tab_id") != tab_id);
	});
}
