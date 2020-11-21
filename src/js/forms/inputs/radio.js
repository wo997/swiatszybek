/* js[global] */

document.addEventListener("click", (e) => {
	var target = $(e.target);

	var option = target.findParentByTagName("radio-option");
	if (option) {
		var input = option.findParentByTagName("radio-input");
		input.findAll("radio-option").forEach((e) => {
			e.classList.toggle("selected", e === option);
		});
		input.dispatchChange();
	}
});
