/* js[admin_everywhere] */

domload(() => {
  var rm = $(".right_side_menu");
  if (rm && window.innerWidth < 1400) {
    rm.classList.remove("shown");
  }
});

function toggleRightSideMenu() {
  var shown = $(".right_side_menu").classList.toggle("shown");

  var btn = $(".right_side_menu .toggle-sidemenu-btn");
  btn.classList.toggle("subtle", shown);
  btn.classList.toggle("important", !shown);
}
