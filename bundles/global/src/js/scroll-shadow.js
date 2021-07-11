/* js[global] */

// scroll_shadow doc
// horizontal requires the parent to be a row flexbox
function registerScrollShadows() {
	$$(".scroll_shadow:not(.scrsh_registered)").forEach((pan) => {
		pan.classList.add("scrsh_registered");
		pan.classList.add("overflow_hidden");
		const offset = 25.0;
		const light = pan.classList.contains("light");
		let class_list = "shadow_node";

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

			bef.style.opacity = s > 0 ? "1" : "0";
			aft.style.opacity = x - h - s > 0 ? "1" : "0";

			// bef.style.opacity = Math.min(s / offset, 1) + "";
			// aft.style.opacity = Math.min((x - h - s) / offset, 1) + "";
		};

		pan.addEventListener("scroll", panelScrollCallback);
		pan.addEventListener("click", () => {
			panelScrollCallback();
			setTimeout(() => {
				panelScrollCallback();
			}, 100);
		});
		window.addEventListener("resize", panelScrollCallback);
		window.addEventListener("modal_shown", panelScrollCallback);
		panelScrollCallback();
		setTimeout(panelScrollCallback, 100);
	});
}

domload(registerScrollShadows);
windowload(registerScrollShadows);
