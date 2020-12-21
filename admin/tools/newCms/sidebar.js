/* js[tool_newCms] */

class NewCmsSidebar {
	/**
	 * @param {NewCms} newCms
	 * @param {PiepNode} node
	 */
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

		const width = this.node.find(`[name="width"]`);

		const changeCallback = () => {
			this.newCms.styling.setBlockStyles({
				width: width.getValue(),
			});
		};
		width.addEventListener("change", changeCallback);
		width.addEventListener("input", changeCallback);

		const grid_template_columns = this.node.find(
			`[name="grid_template_columns"]`
		);

		const changeCallback2 = () => {
			//console.log(grid_template_columns.getValue());
			this.newCms.styling.setBlockStyles(
				{
					"grid-template-columns": grid_template_columns.getValue(),
				},
				null,
				{
					target: "inside",
				}
			);
		};
		grid_template_columns.addEventListener("change", changeCallback2);
		grid_template_columns.addEventListener("input", changeCallback2);

		const image = this.node.find(`[name="image"]`);
		image.addEventListener("change", () => {
			if (this.newCms.edit_block.edit_node) {
				const block_type = this.newCms.edit_block.edit_node.getAttribute(
					"data-block"
				);
				if (block_type == "image") {
					this.newCms.edit_block.edit_node
						.find(".newCms_block_content")
						.setValue(image.getValue(), false);

					lazyLoadImages();
					this.newCms.contentChange();
				}
			}
		});

		const container_flow = this.node.find(`[name="container_flow"]`);
		container_flow.addEventListener("change", () => {
			const block_type = this.newCms.edit_block.edit_node.dataset.block;
			if (block_type == "container") {
				this.newCms.styling.setBlockStyles(
					{
						"flex-flow": container_flow.getValue(),
					},
					null,
					{
						target: "inside",
					}
				);
			}
		});

		const custom_css = this.node.find(`[name="custom_css"]`);

		const changeCallback5 = () => {
			this.newCms.styling.setBlockStyles(custom_css.getValue(), null, {
				type: "custom",
			});
		};
		custom_css.addEventListener("change", changeCallback5);
		custom_css.addEventListener("input", changeCallback5);
	}

	init() {
		this.opened_menus = [];
		this.collapsed = false;
		this.showSideMenu("add_block", { quiet: true, duration: 0 });
	}

	setSidebarEditBlockData() {
		const block = this.newCms.edit_block.edit_node;

		if (!block) {
			return;
		}

		const block_styles = this.newCms.styling.getBlockCurrentStyles(block);

		/*if (options.quiet) {
			set_val_options.quiet = options.quiet;
		}*/

		const block_type = block.dataset.block;
		if (block_type == "quill_editor") {
			this.newCms.quill_editor.setEditorContent(
				block.find(".newCms_block_content").innerHTML
			);
		}
		if (block_type == "image") {
			const image = this.newCms.sidebar.node.find(`[name="image"]`);
			image.setValue(block.find(".newCms_block_content").getValue(), {
				quiet: true,
			});
			lazyLoadImages();
		}
		if (block_type == "container") {
			const container_flow = this.newCms.sidebar.node.find(
				`[name="container_flow"]`
			);

			container_flow.setValue(block_styles.inside["flex-flow"], {
				quiet: true,
			});
		}

		// for all blocks types
		const margin = this.newCms.sidebar.node.find(`.margin`);

		// TODO: each "style component" should be added externally maybe with index to sort it nicely
		// anyway the goal is to keep them separate, have event for when the block is edited and when each of those field changes
		// which is pretty straightforward, seems like a clean solution baby, why am I talkin to myself wtf :* :* :*
		margin.findAll("c-select").forEach((e) => {
			const input = e.find("input");
			const dir = input.dataset.dir;
			input.setValue(nonull(block_styles.outside[`margin-${dir}`], ""), {
				quiet: true,
			});
		});

		///// HEY DUDE, IT AINT RESPONSIVE, THE STYLES GO TO ALL GROUPS FOR SOME REASON, NOT JUST ONE

		const grid_template_columns = this.newCms.sidebar.node.find(
			`[name="grid_template_columns"]`
		);

		//console.log(block_styles);

		const gtc = block_styles
			? block_styles.inside["grid-template-columns"]
			: null;

		if (gtc) {
			grid_template_columns.setValue(gtc, { quiet: true });
		}
	}

	toggleSidebar(collapsed = null) {
		const duration = 300;
		this.newCms.lockInput(duration);

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

	getCurrentMenu() {
		return this.getCurrentMenuNode().getAttribute("data-side_menu");
	}

	getCurrentMenuNode() {
		return this.node.find(`[data-side_menu].active`);
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

		const current_menu = this.getCurrentMenuNode();
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
		target_menu.animate(
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
			{
				callback: () => {
					target_menu.classList.add("active");
					target_menu.classList.remove("appears");

					this.node.insertBefore(target_menu, this.node.firstChild);
				},
			}
		);

		if (current_menu) {
			const current_offset_x = is_new ? -sidebar_width : sidebar_width;
			current_menu.animate(
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
				{
					callback: () => {
						current_menu.classList.remove("disappears");
						current_menu.classList.remove("active");
						current_menu.style.top = "";
					},
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
