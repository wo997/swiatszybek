/* js[global] */

document.addEventListener("click", (e) => {
	var target = $(e.target);

	var href_parent = target._parent("[data-href]");
	if (href_parent) {
		href = href_parent.getAttribute("data-href");
		window.location = href;
	}
});
