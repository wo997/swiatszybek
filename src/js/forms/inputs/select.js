/* js[global] */

document.addEventListener("click", (e) => {
  var target = $(e.target);

  var select = target.findParentByTagName("c-select");
  if (select) {
    if (target.tagName == "C-ARROW") {
      select.classList.toggle("open");
    } else {
      select.classList.remove("open");
    }
    var option = target.findParentByTagName("c-option");

    if (option) {
      select
        .find("input")
        .setValue(nonull(option.getAttribute("data-value"), option.innerHTML));
    }
  } else {
    removeClasses("open", "c-select.open");
  }
});
