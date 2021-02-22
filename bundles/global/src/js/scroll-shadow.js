/* js[global] */

// scroll-shadow doc
// horizontal requires the parent to be a row flexbox
function registerScrollShadows() {
	$$(".scroll-shadow:not(.scrsh_registered)").forEach((pan) => {
		pan.classList.add("scrsh_registered");
		pan.classList.add("overflow_hidden");
		const offset = 25.0;
		const light = pan.classList.contains("light");
		let class_list = "shadow-node";

		if (light) {
			class_list += " light";
		}

		const hor = pan.classList.contains("horizontal");

		pan.insertAdjacentHTML("beforebegin", html`<div class="${class_list} ${hor ? "left" : "top"}"></div>`);
		pan.insertAdjacentHTML("afterend", html`<div class="${class_list} ${hor ? "right" : "bottom"}"></div>`);

		const bef = pan._prev();
		const aft = pan._next();

		const panelScrollCallback = () => {
			const h = pan[hor ? "offsetWidth" : "offsetHeight"];
			const s = pan[hor ? "scrollLeft" : "scrollTop"];
			const x = pan[hor ? "scrollWidth" : "scrollHeight"];

			bef.style.opacity = Math.min(s / offset, 1) + "";
			aft.style.opacity = Math.min((x - h - s) / offset, 1) + "";
		};

		pan.addEventListener("scroll", panelScrollCallback);
		window.addEventListener("resize", panelScrollCallback);
		window.addEventListener("modal-shown", panelScrollCallback);
		panelScrollCallback();
	});
}

domload(registerScrollShadows);
windowload(registerScrollShadows);
