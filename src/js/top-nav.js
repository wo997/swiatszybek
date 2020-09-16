/* js[global] */

if (window.innerWidth >= 1200) {
  window.addEventListener("DOMContentLoaded", () => {
    $$("nav > div").forEach((e) => {
      e.addEventListener("mouseenter", () => {
        var x = e.find(".float-category");
        if (!x || !x.textContent) return;
        var rect = e.getBoundingClientRect();

        if (floatCategoryHovered && floatCategoryHovered != x) {
          hideFloatingCategory();
        }
        dropdownButtonHovered = e;
        floatCategoryHovered = x;

        dropdownButtonHovered.classList.add("hovered");
        floatCategoryHovered.style.display = "block";
        floatCategoryHovered.style.left = rect.left + "px";
        floatCategoryHovered.style.top = rect.top + rect.height - 1 + "px";
        setTimeout(() => {
          floatCategoryHovered.classList.add("visible");
        });
      });
    });
  });

  function hideFloatingCategory() {
    if (!floatCategoryHovered) {
      return;
    }
    floatCategoryHovered.classList.remove("visible");
    dropdownButtonHovered.classList.remove("hovered");

    let zzz = floatCategoryHovered;
    setTimeout(() => {
      zzz.style.display = "";
    }, 150);

    dropdownButtonHovered = null;
    floatCategoryHovered = null;
  }

  var dropdownButtonHovered = null;
  var floatCategoryHovered = null;
  document.addEventListener("mousemove", (event) => {
    if (!dropdownButtonHovered) return;
    if (isInNode(event.target, dropdownButtonHovered)) return;
    hideFloatingCategory();
  });
}
