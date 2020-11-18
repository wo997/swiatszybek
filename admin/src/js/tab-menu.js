/* js[admin] */

document.addEventListener("click", (event) => {
  var t = $(event.target);
  var option = t.findParentByClassName("tab-option");
  var menu = t.findParentByClassName("tab-menu");
  if (!option || !header) return;

  var tab_id = option.getAttribute("data-tab_id");

  showTab(menu, tab_id);
});

function showTab(tab_menu, tab_id) {
  tab_menu.findAll(".tab-header .tab-option").forEach((e) => {
    e.classList.toggle("current", e.getAttribute("data-tab_id") == tab_id);
  });
  tab_menu.findAll(".tab-content").forEach((e) => {
    e.classList.toggle("hidden", e.getAttribute("data-tab_id") != tab_id);
  });
}
