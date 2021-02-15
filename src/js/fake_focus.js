/* js[global] */

document.addEventListener("mouseup", () => {
	let exclude;
	if (mouse_down_target.tagName === "LABEL") {
		exclude = mouse_down_target._child(".focus");
	} else {
		exclude = mouse_down_target._parent(".focus", { skip: 0 });
	}

	$$(".focus").forEach((e) => {
		if (e !== exclude) e.classList.remove("focus");
	});
});
