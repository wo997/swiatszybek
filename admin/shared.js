/* js[admin] */

window.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth < MOBILE_WIDTH) {
    var nv = $(".navbar_admin");
    if (!nv) return;
    nv.classList.add("expand_y");
    nv.classList.add("hidden");
    nv.classList.add("animate_hidden");
    nv.insertAdjacentHTML(
      "beforebegin",
      `
        <div class="btn subtle fill medium" onclick='expandMenu(this.next(),this)'>
            <b>Menu</b> <div class='expand_arrow'><i class='fas fa-chevron-right'></i></div>
        </div>
        `
    );
  }
});

window.addEventListener("DOMContentLoaded", () => {
  var shortest_hit = null;
  var shortest_length = 100000;
  $$(".navbar_admin .menu_item").forEach((e) => {
    var a = e.find("a");
    if (!a) {
      return;
    }
    href = a.getAttribute("href");
    if (
      location.pathname.indexOf(href) === 0 ||
      location.href.indexOf(href) === 0
    ) {
      if (href.length <= shortest_length) {
        shortest_hit = e;
        shortest_length = href.length;
      }
    }
  });

  if (shortest_hit) {
    shortest_hit.classList.add("current-route");

    var parent_sub_menu = shortest_hit.findParentByClassName("sub_menu");
    if (parent_sub_menu) {
      expandMenu(parent_sub_menu, parent_sub_menu.prev(), null, {
        duration: 0,
      });
      parent_sub_menu.prev().classList.add("current-route");
    }

    var sub_menu = shortest_hit.next();
    if (sub_menu && sub_menu.classList.contains("sub_menu")) {
      expandMenu(sub_menu, sub_menu.prev(), null, {
        duration: 0,
      });
    }
  }
});
