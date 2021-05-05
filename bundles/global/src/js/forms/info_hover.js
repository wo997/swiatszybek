/* js[global] */

window.addEventListener("register-form-components", (ev) => {
	// @ts-ignore
	$$(".hover_info:not(.rgrt)").forEach((e) => {
		e.classList.add("rgrt");
		e.dataset.tooltip = e.innerHTML;
		e._set_content(ICONS.i);
	});
});
