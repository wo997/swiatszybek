/* js[tool_newCms] */

class NewCmsSidebar {
	constructor(newCms, node) {
		/** @type {NewCms} */
		this.newCms = newCms;
		this.node = node;
	}

	init() {}

	showSideMenu(target_side_menu_name) {
		const current_menu = this.node.find(`[data-side_menu].active`);
		const target_menu = this.node.find(
			`[data-side_menu="${target_side_menu_name}"]`
		);

		if (target_menu == current_menu) {
			return;
		}

		const duration = 300;

		const sidebar_width = this.node.offsetWidth;

		target_menu.classList.add("appears");
		current_menu.classList.add("disappears");

		animate(
			target_menu,
			`
                0% {
                    transform: translate(${sidebar_width}px,0px);
                    opacity: 0;
                }
                100% {
                    transform: translate(0px,0px);
                    opacity: 1;
                }
            `,
			duration,
			() => {
				target_menu.classList.add("active");
				target_menu.classList.remove("appears");

				current_menu.classList.remove("disappears");
				current_menu.classList.remove("active");
				current_menu.style.top = "";

				this.node.insertBefore(target_menu, this.node.firstChild);
			}
		);

		animate(
			current_menu,
			`
                0% {
                    transform: translate(0px,0px);
                    opacity: 1;
                }
                100% {
                    transform: translate(-${sidebar_width}px,0px);
                    opacity: 0;
                }
            `,
			duration
		);

		this.node.dispatchEvent(
			new CustomEvent("side_menu_change", {
				detail: {
					side_menu_name: target_side_menu_name,
				},
			})
		);
	}

	mouseClick() {
		const target = this.newCms.mouse_target;

		const show_side_menu = target.findParentByAttribute("data-show_side_menu");
		if (show_side_menu) {
			this.showSideMenu(show_side_menu.getAttribute("data-show_side_menu"));
		}
	}
}
