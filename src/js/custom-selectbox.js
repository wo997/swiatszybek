/* js[global] */

window.addEventListener("DOMContentLoaded", function () {
  registerSelectboxes();
});

function registerSelectboxes() {
  $$(".selectbox:not(.registered)").forEach((e) => {
    e.classList.add("registered");
    e.findAll("[data-option]").forEach((o) => {
      o.addEventListener("click", () => {
        var i = e.find("input");
        if (i) {
          setValue(i, o.getAttribute("data-option"));
          o.blur();
        }
      });
    });
  });
  /*$$(".selectbox:not(.showhover)").forEach((e) => {
      e.classList.add("showhover");
      e.findAll("[data-option]").forEach((o) => {
        o.addEventListener("click", () => {
          var i = e.find("input");
          if (i) {
            setValue(i, o.getAttribute("data-option"));
          }
        });
      });
    });*/
}
