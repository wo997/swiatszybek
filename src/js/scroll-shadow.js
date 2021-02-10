/* js[global] */

// scroll-shadow doc
// horizontal requires the parent to be a row flexbox
function registerScrollShadows() {
	$$(".scroll-shadow:not(.scrsh_registered)").forEach((e) => {
		e.classList.add("scrsh_registered");
		e.classList.add("overflow_hidden");
		const offset = 25.0;
		const light = e.classList.contains("light");
		var class_list = "shadow-node";
		if (light) {
			class_list += " light";
		}

		if (e.classList.contains("horizontal")) {
			e.insertAdjacentHTML("beforebegin", html`<div class="${class_list} left"></div>`);
			e.insertAdjacentHTML("afterend", html`<div class="${class_list} right"></div>`);

			var shadow_left = e._prev();
			var shadow_right = e._next();

			var panelScrollCallback = () => {
				var w = e.getBoundingClientRect().width;
				var x = e.scrollLeft;

				shadow_left.style.opacity = Math.min(x / offset, 1) + "";
				shadow_right.style.opacity = Math.min((e.scrollWidth - w - x) / offset, 1) + "";
			};
		} else {
			e.insertAdjacentHTML("beforebegin", html`<div class="${class_list} top"></div>`);
			e.insertAdjacentHTML("afterend", html`<div class="${class_list} bottom"></div>`);

			var shadow_top = e._prev();
			var shadow_bottom = e._next();

			var panelScrollCallback = () => {
				var h = e.getBoundingClientRect().height;
				var y = e.scrollTop;

				shadow_top.style.opacity = Math.min(y / offset, 1) + "";
				shadow_bottom.style.opacity = Math.min((e.scrollHeight - h - y) / offset, 1) + "";
			};
		}

		e.addEventListener("scroll", panelScrollCallback);
		window.addEventListener("resize", panelScrollCallback);
		panelScrollCallback();
	});
}

domload(registerScrollShadows);
