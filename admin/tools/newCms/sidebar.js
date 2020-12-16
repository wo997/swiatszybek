/* js[tool_newCms] */

class NewCmsSidebar {
	/** @param {NewCms} newCms */
	constructor(newCms, node) {
		this.newCms = newCms;
		this.node = node;

		this.init();

		this.newCms.container.addEventListener("edit", (event) => {
			this.init();
		});

		this.newCms.container.addEventListener("styles_loaded", () => {
			this.sidebar_width = parseInt(
				getComputedStyle(document.documentElement).getPropertyValue(
					"--sidebar_width"
				)
			);
			this.sidebar_collapsed_width = parseInt(
				getComputedStyle(document.documentElement).getPropertyValue(
					"--sidebar_collapsed_width"
				)
			);
			this.sidebar_animation_offset =
				this.sidebar_width - this.sidebar_collapsed_width;
		});
	}

	init() {
		this.opened_menus = [];
		this.collapsed = false;
		this.showSideMenu("add_block", { quiet: true });
	}

	toggleSidebar(collapsed = null) {
		const duration = 300;
		this.newCms.lockInput(duration + 100);

		if (collapsed !== null) {
			this.collapsed = this.newCms.container.classList.toggle(
				"sidebar_collapsed",
				collapsed
			);
		} else {
			this.collapsed = this.newCms.container.classList.toggle(
				"sidebar_collapsed"
			);
		}

		this.newCms.styling.setResponsiveContainerSize({
			duration: duration,
			width_diff: this.sidebar_animation_offset * (this.collapsed ? 1 : -1),
		});
	}

	showSideMenu(target_side_menu_name, options = {}) {
		if (!target_side_menu_name) {
			return;
		}

		let is_new = false;

		const target_side_menu_pos = this.opened_menus.indexOf(
			target_side_menu_name
		);
		if (target_side_menu_pos !== -1) {
			if (target_side_menu_pos != this.opened_menus.length - 1) {
				this.opened_menus.splice(target_side_menu_pos + 1);
			}
		} else {
			this.opened_menus.push(target_side_menu_name);
			is_new = true;
		}
		target_side_menu_name = this.opened_menus.last();

		const current_menu = this.node.find(`[data-side_menu].active`);
		const target_menu = this.node.find(
			`[data-side_menu="${target_side_menu_name}"]`
		);

		if (target_menu == current_menu) {
			return;
		}

		const duration = nonull(options.duration, 300);

		const sidebar_width = this.node.offsetWidth;

		target_menu.classList.add("appears");
		if (current_menu) {
			current_menu.classList.add("disappears");
		}

		const target_offset_x = is_new ? sidebar_width : -sidebar_width;
		animate(
			target_menu,
			`
                0% {
                    transform: translate(${target_offset_x}px,0px);
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

				this.node.insertBefore(target_menu, this.node.firstChild);
			}
		);

		if (current_menu) {
			const current_offset_x = is_new ? -sidebar_width : sidebar_width;
			animate(
				current_menu,
				`
                    0% {
                        transform: translate(0px,0px);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(${current_offset_x}px,0px);
                        opacity: 0;
                    }
                `,
				duration,
				() => {
					current_menu.classList.remove("disappears");
					current_menu.classList.remove("active");
					current_menu.style.top = "";
				}
			);
		}

		this.node.dispatchEvent(
			new CustomEvent("side_menu_change", {
				detail: {
					side_menu_name: target_side_menu_name,
				},
			})
		);

		if (this.collapsed) {
			this.toggleSidebar();
		}

		// make selection history visible
		if (!options.quiet) {
			this.newCms.contentChange();
		}
	}

	showPreviousSideMenu() {
		if (this.opened_menus.length >= 2) {
			const last_menu_name = this.opened_menus[this.opened_menus.length - 2];
			this.showSideMenu(last_menu_name);
		}
	}

	mouseClick() {
		const target = this.newCms.mouse_target;

		const show_side_menu = target.findParentByAttribute("data-show_side_menu");
		if (show_side_menu) {
			this.showSideMenu(show_side_menu.getAttribute("data-show_side_menu"));
		} else if (target.findParentByClassName("previous_side_menu")) {
			this.showPreviousSideMenu();
		} else if (target.findParentByClassName("toggle_sidebar")) {
			this.toggleSidebar();
		}
	}
}
