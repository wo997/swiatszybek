/* js[global] */

domload(() => {
	$$("nav > .level_0 > li").forEach((e) => {
		e.addEventListener("mouseenter", () => {
			const float_menu = e._child("ul");
			if (!float_menu || !float_menu.textContent) return;
			float_menu.classList.add("float_menu");
			const rect = e.getBoundingClientRect();

			if (active_float_menu && active_float_menu != float_menu) {
				hideFloatingMenu();
			}
			active_float_menu_btn = e;
			active_float_menu = float_menu;

			active_float_menu_btn.classList.add("hovered");
			active_float_menu.style.display = "block";
			active_float_menu.style.left = rect.left + "px";
			active_float_menu.style.top = rect.top + rect.height - 1 + "px";
			active_float_menu.style.minWidth = rect.width + "px";
			setTimeout(() => {
				if (active_float_menu) {
					active_float_menu.classList.add("visible");
				}
			});
		});
	});
});

function hideFloatingMenu() {
	if (!active_float_menu) {
		return;
	}
	active_float_menu.classList.remove("visible");
	active_float_menu_btn.classList.remove("hovered");

	const menu_ref = active_float_menu;
	setTimeout(() => {
		menu_ref.style.display = "";
	}, 150);

	active_float_menu_btn = undefined;
	active_float_menu = undefined;
}

let active_float_menu_btn;
let active_float_menu;
document.addEventListener("mousemove", (event) => {
	if (!active_float_menu_btn) return;
	if ($(event.target)._parent(active_float_menu_btn)) return;
	hideFloatingMenu();
});
