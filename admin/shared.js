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
            <div class="btn secondary fill medium" onclick='expandWithArrow(this.next(),$(this).find(".expand_arrow"))'>
                <b>Menu</b> <div class='expand_arrow'><i class='fas fa-chevron-right'></i></div>
            </div>
        `
    );
  }
});
