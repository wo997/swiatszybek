/* js[global] */

document.addEventListener("click", (e) => {
  var target = $(e.target);

  var select = target.findParentByClassName("select");
  if (select) {
    if (target.classList.contains("select-arrow")) {
      select.classList.toggle("open");
    } else {
      select.classList.remove("open");
    }
    var option = target.findParentByTagName("option");

    if (option) {
      select
        .find("input")
        .setValue(nonull(option.getAttribute("data-value"), option.innerHTML));
    }
  } else {
    removeClasses("open", ".select.open");
  }
});
