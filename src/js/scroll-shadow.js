/* js[global] */

// scroll-shadow doc
// horizontal requires the parent to be a row flexbox
function registerScrollShadows() {
  $$(".scroll-shadow:not(.registered)").forEach((e) => {
    const offset = 25.0;
    const light = e.classList.contains("light");
    var class_list = "shadow-node";
    if (light) {
      class_list += " light";
    }

    if (e.classList.contains("horizontal")) {
      e.classList.add("registered");

      e.insertAdjacentHTML(
        "beforebegin",
        `
            <div class='${class_list} left'></div>
          `
      );
      e.insertAdjacentHTML(
        "afterend",
        `
            <div class='${class_list} right'></div>
          `
      );

      var shadow_left = e.prev();
      var shadow_right = e.next();

      var panelScrollCallback = () => {
        var w = e.getBoundingClientRect().width;
        var x = e.scrollLeft;

        shadow_left.style.opacity = Math.min(x / offset, 1);

        shadow_right.style.opacity = Math.min(
          (e.scrollWidth - w - x) / offset,
          1
        );
      };
    } else {
      e.classList.add("registered");

      e.insertAdjacentHTML(
        "beforebegin",
        `
            <div class='${class_list} top'></div>
          `
      );
      e.insertAdjacentHTML(
        "afterend",
        `
            <div class='${class_list} bottom'></div>
          `
      );

      var shadow_top = e.prev();
      var shadow_bottom = e.next();

      var panelScrollCallback = () => {
        var h = e.getBoundingClientRect().height;
        var y = e.scrollTop;

        shadow_top.style.opacity = Math.min(y / offset, 1);

        shadow_bottom.style.opacity = Math.min(
          (e.scrollHeight - h - y) / offset,
          1
        );
      };
    }

    e.addEventListener("scroll", panelScrollCallback);
    window.addEventListener("resize", panelScrollCallback);
    panelScrollCallback();
  });
}

window.addEventListener("DOMContentLoaded", registerScrollShadows);
