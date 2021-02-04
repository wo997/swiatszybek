/* js[tool_newCms] */

class NewCmsEditBlock {
	/**
	 * @param {NewCms} newCms
	 * @param {PiepNode} edit_block_node
	 */
	constructor(newCms, edit_block_node) {
		this.newCms = newCms;
		this.node = edit_block_node;
		this.init();

		this.newCms.sidebar.node.addEventListener("side_menu_change", (event) => {
			// @ts-ignore
			const is_edit_block_menu = event.detail.side_menu_name == "edit_block";

			if (!is_edit_block_menu) {
				this.init();
			}
		});

		this.newCms.container.addEventListener("clean_up_output", () => {
			this.cleanUpContent(this.newCms.clean_output_node);
		});

		this.newCms.container.addEventListener("edit", (event) => {
			this.init();
		});
	}

	init() {
		this.edit_node = null;

		this.hideContextMenu();

		this.cleanUpContent();
	}

	cleanUpContent(node = null) {
		if (node === null) {
			node = this.newCms.container;
		}

		node._children(".edit_active").forEach((e) => {
			e.classList.remove("edit_active");
		});
	}

	hideContextMenu() {
		this.select_node = null;
		this.node.classList.toggle("visible", false);
		setTimeout(() => {
			this.node.style.top = "-1000px";
		}, 200);
	}

	mouseMove() {}

	/**
	 *
	 * @param {NewCmsBlock} block
	 * @param {*} options
	 */
	editBlock(block, options = {}) {
		this.edit_node = block;

		block.classList.add("edit_active");

		const sidebar_options = cloneObject(options);
		if (options.quiet) {
			sidebar_options.duration = 0;
		}
		this.newCms.sidebar.showSideMenu("edit_block", sidebar_options);

		// it actually says that there is a block we are currently editing by .edit_active, nicely done
		if (!options.quiet) {
			this.newCms.contentChange();
		}

		// this.newCms.container.classList.remove("anything_selected");

		this.newCms.sidebar.setSidebarEditBlockData();
	}

	/**
	 *
	 * @param {NewCmsBlock} block
	 */
	showControlsToBlock(block) {
		this.select_node = block;

		let btn_set = [];

		btn_set.push({
			color: "#58D",
			icon: `<i class="fas fa-pencil-alt" style="margin-top: 1px;"></i>`,
			className: "edit_btn",
			tooltip: "Edytuj",
		});
		if (block.dataset.block == "grid") {
			btn_set.push({
				color: "#b5b",
				icon: html`
					<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="-21 -21 682.667 682.667" width="1em">
						<rect width="676.881" height="86.78" x="-18" y="48.904" rx="6.68" ry="6.429" paint-order="markers fill stroke" />
						<rect width="676.881" height="86.78" x="-18" y="325.585" rx="6.68" ry="6.429" paint-order="markers fill stroke" />
						<rect width="676.881" height="86.78" x="-18" y="507.446" rx="6.68" ry="6.429" paint-order="markers fill stroke" />
						<rect
							width="676.881"
							height="86.78"
							x="-18.215"
							y="-134.96"
							rx="6.68"
							ry="6.429"
							transform="rotate(90)"
							paint-order="markers fill stroke"
						/>
						<rect
							width="676.881"
							height="86.78"
							x="-18.215"
							y="-418.28"
							rx="6.68"
							ry="6.429"
							transform="rotate(90)"
							paint-order="markers fill stroke"
						/>
						<rect
							width="676.881"
							height="86.78"
							x="-18.215"
							y="-597.681"
							rx="6.68"
							ry="6.429"
							transform="rotate(90)"
							paint-order="markers fill stroke"
						/>
					</svg>
				`,
				className: "grid_btn",
				tooltip: "Wiersze / kolumny",
			});
		}
		/*btn_set.push({
			color: "#58D",
			icon: `<i class="fas fa-expand-alt" style="margin-top: 1px;"></i>`,
			className: "size_btn",
			tooltip: "Wymiary",
		});*/
		btn_set.push({
			color: "#a7a7a7",
			icon: `<i class="fas fa-arrows-alt"></i>`,
			className: "relocate_btn",
			tooltip: "Przemieść",
		});
		btn_set.push({
			color: "#a7a7a7",
			icon: `<i class="fas fa-copy"></i>`,
			className: "copy_btn",
			tooltip: "Kopiuj",
		});

		//if (!block._parent().classList.contains("newCmsContent")) {
		btn_set.push({
			color: "#f55",
			icon: `<i class="fas fa-trash"></i>`,
			className: "remove_btn",
			tooltip: "Usuń",
		});

		btn_set.push({
			color: "#f55",
			icon: `<i class="fas fa-times"></i>`,
			className: "dismiss_btn",
			tooltip: "Zamknij",
		});

		let edit_block_html = `<div class="glue-children inline-flex">`;
		for (const btn of btn_set) {
			if (["dismiss_btn", "remove_btn"].includes(btn.className)) {
				edit_block_html += `</div> <div class="glue-children inline-flex">`;
			}
			edit_block_html += html`<button class="btn subtle ${btn.className}" data-tooltip="${btn.tooltip}" data-tooltip-position="bottom">
				${btn.icon}
			</button>`;
		}
		edit_block_html += `</div>`;

		this.node._set_content(edit_block_html);

		// add block actions
		const edit_block_btn = this.node._child(".edit_btn");
		if (edit_block_btn) {
			edit_block_btn.addEventListener("click", () => {
				this.init();
				this.editBlock(block);
			});
		}

		const relocate_btn = this.node._child(".relocate_btn");
		if (relocate_btn) {
			relocate_btn.addEventListener("click", () => {
				this.hideContextMenu();
				this.newCms.grabBlock(block);
			});
		}

		const copy_btn = this.node._child(".copy_btn");
		if (copy_btn) {
			copy_btn.addEventListener("click", () => {
				/** @type {NewCmsBlock} */
				// @ts-ignore
				const copied_block = createNodeFromHtml(block.outerHTML);
				const b_rect = block.client_rect;
				copied_block.style.opacity = "0";
				this.newCms.copied_block_container.appendChild(copied_block);

				// @ts-ignore
				copied_block.styling_data = block.styling_data;
				copied_block.style.width = b_rect.width + "px";
				copied_block.style.height = b_rect.height + "px";
				copied_block.last_rect = copied_block.getBoundingClientRect();

				/** @type {AnimationData} */
				const cbad = {
					dx: b_rect.left - copied_block.last_rect.left,
					dy: b_rect.top - copied_block.last_rect.top,
					w: b_rect.width,
					h: b_rect.height,
				};
				copied_block.animation_data = cbad;

				this.newCms.grabBlock(copied_block, { copy: true, copied_from: block });
				copied_block.style.opacity = "";
				this.hideContextMenu();
			});
		}

		const remove_btn = this.node._child(".remove_btn");
		if (remove_btn) {
			remove_btn.addEventListener("click", () => {
				this.hideContextMenu();
				this.newCms.removeBlock(block);
			});
		}

		const dismiss_btn = this.node._child(".dismiss_btn");
		if (dismiss_btn) {
			dismiss_btn.addEventListener("click", () => {
				this.hideContextMenu();
			});
		}

		const grid_btn = this.node._child(".grid_btn");
		if (grid_btn) {
			grid_btn.addEventListener("click", () => {
				this.hideContextMenu();
				/*this.newCms.removeBlock(block);
				if (this.newCms.sidebar.getCurrentMenu() === "edit_block") {
					this.newCms.sidebar.showPreviousSideMenu();
				}*/
			});
		}

		this.node.addEventListener("click", (event) => {
			// self explanatory ;)
			event.stopPropagation();
		});

		const off = 5;

		const node_rect = this.node.getBoundingClientRect();

		/*let left = this.newCms.mouse_x - this.newCms.content_scroll_panel_rect.left;
        let top = this.newCms.mouse_y - this.newCms.content_scroll_panel_rect.top;*/

		const node_width = node_rect.width;
		const node_height = node_rect.height;

		const block_pos_data = nodePositionAgainstScrollableParent(this.select_node);
		const block_relative_pos = block_pos_data.relative_pos;

		let left = block_relative_pos.left - this.newCms.content_scroll_panel.scrollLeft;

		let top = block_relative_pos.top - this.newCms.content_scroll_panel.scrollTop - node_height;

		//if (node_width > block_pos_data.node_rect.width) {
		left -= 0.5 * (node_width - block_pos_data.node_rect.width);
		//}

		left = Math.max(left, off);
		left = Math.min(left, this.newCms.content_scroll_panel.clientWidth - node_width - off);

		top = Math.max(top, off);
		top = Math.min(top, this.newCms.content_scroll_panel.clientHeight - node_height - off);

		this.node.style.left = left + "px";
		this.node.style.top = top + this.newCms.content_scroll_panel.scrollTop + "px";

		this.node.classList.toggle("visible", true);
	}
}
