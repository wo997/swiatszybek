window.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth < 800) {
    var nv = $(".navbar_wrapper");
    if (!nv) return;
    nv.classList.add("expandY");
    nv.classList.add("hidden");
    nv.insertAdjacentHTML(
      "beforebegin",
      `
            <div class="btn secondary fill medium" onclick='expandWithArrow(this.next(),$(this).find(".expand"))'>
                <b>Menu</b> <div class='btn expand'><i class='fas fa-chevron-right'></i></div>
            </div>
        `
    );
  }
});
