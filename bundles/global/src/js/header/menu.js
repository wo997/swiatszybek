/* js[global] */

domload(() => {
	$$("header .main_menu > .level_0 > li").forEach((e) => {
		e.addEventListener("mousemove", () => {
			const float_menu = e._child("ul");
			if (!float_menu || !float_menu.textContent) return;
			float_menu.classList.add("float_menu");
			const btn_rect = e.getBoundingClientRect();

			if (active_float_menu && active_float_menu != float_menu) {
				hideFloatingMenu();
			}
			active_float_menu_btn = e;
			active_float_menu = float_menu;

			float_menu.classList.add("hovered");
			float_menu.style.display = "block";
			const left = btn_rect.left;
			const top = btn_rect.top + btn_rect.height - 1;
			float_menu.style.left = left + "px";
			float_menu.style.top = top + "px";
			float_menu.style.minWidth = btn_rect.width + "px";

			if (!float_menu.classList.contains("created_columns")) {
				const aspect_ratio = float_menu.offsetHeight / float_menu.offsetWidth;
				const column_count = Math.round(Math.sqrt(aspect_ratio) * 1.618);
				if (column_count > 1) {
					float_menu.classList.add("created_columns");
					let sum_height = 0;

					const items = float_menu._direct_children();
					for (const item of items) {
						sum_height += item.offsetHeight;
					}
					let total_height = sum_height;

					/** @type {PiepNode[]} */
					const menu_columns = [];
					for (let i = 0; i < column_count; i++) {
						const menu_column = $(document.createElement("DIV"));
						menu_columns.push(menu_column);
					}

					sum_height = 0;
					for (const item of items) {
						sum_height += item.offsetHeight;
						const column_id = Math.floor(((column_count - 1) * sum_height) / total_height);
						menu_columns[column_id].append(item);
					}

					float_menu.append(...menu_columns);
				}
			}

			float_menu.classList.add("visible");

			const max_left = main_header.offsetWidth - float_menu.offsetWidth;
			if (left > max_left) {
				// u might wanna do it just once but trust me - it's ok for safety
				float_menu.style.left = max_left + "px";
			}
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
