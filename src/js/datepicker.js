/* js[global] */

function getDatepickerDefaultOptions(e) {
  return {
    todayHighlight: true,
    todayBtn: true,
    clearBtn: true,
    maxView: 2,
    language: "pl",
    autohide: true,
    container: e.findScrollableParent(),
  };
}

window.addEventListener("DOMContentLoaded", () => {
  registerDatepickers();
});

function registerDatepickers() {
  $$(".default_datepicker:not(.registered)").forEach((e) => {
    e.classList.add("registered");

    var option = getDatepickerDefaultOptions(e);
    var orientation = e.getAttribute("data-orientation");
    if (orientation) {
      option.orientation = orientation;
    }

    new Datepicker(e, option);
  });
}
