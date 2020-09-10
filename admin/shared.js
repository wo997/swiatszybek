/* js[admin] */

window.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth < 800) {
    var nv = $(".navbar_wrapper");
    if (!nv) return;
    nv.classList.add("expand_y");
    nv.classList.add("hidden");
    nv.classList.add("animate_hidden");
    nv.insertAdjacentHTML(
      "beforebegin",
      `
            <div class="btn admin-secondary fill medium" onclick='expandWithArrow(this.next(),$(this).find(".expand"))'>
                <b>Menu</b> <div class='btn expand'><i class='fas fa-chevron-right'></i></div>
            </div>
        `
    );
  }
});
