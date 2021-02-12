/* js[global] */

document.addEventListener("click", (e) => {
	var target = $(e.target);

	var select = target._parent("c-select");
	if (select) {
		if (target.tagName == "C-ARROW") {
			select.classList.toggle("open");
		} else {
			select.classList.remove("open");
		}
		var option = target._parent("c-option");

		if (option) {
			select._child("input")._set_value(def(option.getAttribute("data-value"), option.innerHTML));
		}
	} else {
		removeClasses("open", "c-select.open");
	}
});
