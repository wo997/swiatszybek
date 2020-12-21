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

		node.findAll(".edit_active").forEach((e) => {
			e.classList.remove("edit_active");
		});
	}

	hideContextMenu() {
		this.select_node = null;
		this.node.classList.toggle("visible", false);
	}

	mouseMove() {
		const target = this.newCms.mouse_target;

		if (this.select_node) {
			if (!target.findParentByClassName("edit_block_node")) {
				this.hideContextMenu();
			}
		}
	}

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

		// define block buttons html
		let edit_block_html = "";

		let buttons = "";

		const radius = 40;
		const inner_radius = 16;

		const norad = Math.PI / 180;

		const x0 = radius;
		const y0 = radius;

		let btn_set = [];

		btn_set.push({
			color: "#58D",
			icon: `<i class="fas fa-pencil-alt" style="margin-top: 1px;"></i>`,
			className: "edit_btn",
			tooltip: "Edytuj blok",
		});
		if (block.dataset.block == "grid") {
			btn_set.push({
				color: "#b5b",
				icon: /*html*/ `
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="-21 -21 682.667 682.667" width="1em"><rect width="676.881" height="86.78" x="-18" y="48.904" rx="6.68" ry="6.429" paint-order="markers fill stroke"/><rect width="676.881" height="86.78" x="-18" y="325.585" rx="6.68" ry="6.429" paint-order="markers fill stroke"/><rect width="676.881" height="86.78" x="-18" y="507.446" rx="6.68" ry="6.429" paint-order="markers fill stroke"/><rect width="676.881" height="86.78" x="-18.215" y="-134.96" rx="6.68" ry="6.429" transform="rotate(90)" paint-order="markers fill stroke"/><rect width="676.881" height="86.78" x="-18.215" y="-418.28" rx="6.68" ry="6.429" transform="rotate(90)" paint-order="markers fill stroke"/><rect width="676.881" height="86.78" x="-18.215" y="-597.681" rx="6.68" ry="6.429" transform="rotate(90)" paint-order="markers fill stroke"/></svg>
                `,
				className: "grid_btn",
				tooltip: "Wiersze / kolumny",
			});
		}
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
			tooltip: "Kopiuj blok",
		});

		//if (!block.parent().classList.contains("newCmsContent")) {
		btn_set.push({
			color: "#f55",
			icon: `<i class="fas fa-times"></i>`,
			className: "remove_btn",
			tooltip: "Usuń blok",
		});
		//}

		const btn_count = btn_set.length;

		const icon_size = 20;

		const space_ratio = 1.5;
		const inner_space_ratio = (space_ratio * radius) / inner_radius;

		const point = (a, r) => {
			return {
				x: x0 - Math.sin(a * norad) * r,
				y: y0 - Math.cos(a * norad) * r,
			};
		};

		const on_left_left = point(90, 0.5 * radius);
		const on_right_right = point(270, 0.5 * radius);
		const on_top_top = point(0, 0.5 * radius);

		for (let i = 0; i < btn_count; i++) {
			const a1 = (i * 360) / btn_count;
			const a2 = ((i + 1) * 360) / btn_count;

			const p1 = point(a1 + space_ratio, radius);
			const p2 = point(a2 - space_ratio, radius);
			const p3 = point(a2 - inner_space_ratio, inner_radius);
			const p4 = point(a1 + inner_space_ratio, inner_radius);

			const p5 = point((a1 + a2) * 0.5, (radius + inner_radius) * 0.485);

			const btn_data = btn_set[i];

			let tooltip = "";
			if (btn_data.tooltip) {
				let pos = "center";
				let mid_x = (p1.x + p2.x) * 0.5;
				let mid_y = (p1.y + p2.y) * 0.5;
				if (mid_x < on_left_left.x) {
					pos = "left";
				} else if (mid_x > on_right_right.x) {
					pos = "right";
				} else if (mid_y < on_top_top.y) {
					if (mid_x < (on_left_left.x + on_right_right.x) * 0.5) {
						pos = "left";
					} else {
						pos = "right";
					}
				}
				tooltip = `data-tooltip="${btn_data.tooltip}" data-tooltip-position="${pos}"`;
			}

			buttons += /*html*/ `
                <path class="context-btn" fill="#fff" d="
                    M${p1.x},${p1.y}
                    A${radius},${radius} 1 0,0 ${p2.x},${p2.y}
                    L${p3.x},${p3.y}
                    A${inner_radius},${inner_radius} 1 0,1 ${p4.x},${p4.y}
                    L${p1.x},${p1.y}
                    z
                "></path>
                <path class="context-btn 
                ${btn_data.className}"
                ${tooltip}
                fill="${btn_data.color}" d="
                    M${p1.x},${p1.y}
                    A${radius},${radius} 1 0,0 ${p2.x},${p2.y}
                    L${p3.x},${p3.y}
                    A${inner_radius},${inner_radius} 1 0,1 ${p4.x},${p4.y}
                    L${p1.x},${p1.y}
                    z
                "></path>
                <foreignObject x="${p5.x - icon_size * 0.5}" y="${
				p5.y - icon_size * 0.5
			}" width="${icon_size}" height="${icon_size}" pointer-events="none">
                    <div class="context-icon">
                        ${btn_data.icon}
                    </div>
                </foreignObject>
            `;
		}
		edit_block_html = /*html*/ `
            <svg viewBox="-1 -1 ${radius * 2 + 2} ${radius * 2 + 2}"
                width="${radius * 2 + 2}"
                height="${radius * 2 + 2}"
                xmlns="http://www.w3.org/2000/svg" version="1.1">
                <circle cx="${x0}" cy="${y0}" r="${inner_radius}" fill="#ccc5" class="dismiss_btn" />
                ${buttons}
            </svg>    
        `;

		this.node.setContent(edit_block_html);

		// add block actions
		const edit_block_btn = this.node.find(".edit_btn");
		if (edit_block_btn) {
			edit_block_btn.addEventListener("click", () => {
				this.init();
				this.editBlock(block);
			});
		}

		const relocate_btn = this.node.find(".relocate_btn");
		if (relocate_btn) {
			relocate_btn.addEventListener("click", () => {
				this.hideContextMenu();
				this.newCms.grabBlock(block);
			});
		}

		const copy_btn = this.node.find(".copy_btn");
		if (copy_btn) {
			copy_btn.addEventListener("click", () => {
				/** @type {NewCmsBlock} */
				// @ts-ignore
				const copied_block = createNodeFromHtml(block.outerHTML);
				const b_rect = block.getBoundingClientRect();
				this.newCms.sidebar.node.appendChild(copied_block);

				/** @type {BlockStyles} */
				// @ts-ignore
				const styling_data = cloneObject(block.styling_data);
				copied_block.styling_data = styling_data;
				copied_block.style.width = b_rect.width + "px";
				copied_block.style.height = b_rect.height + "px";
				copied_block.last_rect = copied_block.getBoundingClientRect();

				const block_id = this.newCms.styling.getBlockId(copied_block);
				const block_class_name = this.newCms.styling.getBlockClassName(
					block_id
				);
				if (block_class_name) {
					copied_block.classList.remove(block_class_name);
				}

				/** @type {AnimationData} */
				const cbad = {
					dx: b_rect.left - copied_block.last_rect.left,
					dy: b_rect.top - copied_block.last_rect.top,
					w: b_rect.width,
					h: b_rect.height,
				};
				copied_block.animation_data = cbad;

				this.newCms.grabBlock(copied_block, { copy: true });
				this.hideContextMenu();
			});
		}

		const remove_btn = this.node.find(".remove_btn");
		if (remove_btn) {
			remove_btn.addEventListener("click", () => {
				this.hideContextMenu();
				this.newCms.removeBlock(block);
				if (this.newCms.sidebar.getCurrentMenu() === "edit_block") {
					this.newCms.sidebar.showPreviousSideMenu();
				}
			});
		}

		const dismiss_btn = this.node.find(".dismiss_btn");
		if (dismiss_btn) {
			dismiss_btn.addEventListener("click", () => {
				this.hideContextMenu();
			});
		}

		const grid_btn = this.node.find(".grid_btn");
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

		const node_rect = this.node.getBoundingClientRect();

		let left = this.newCms.mouse_x - this.newCms.content_scroll_panel_rect.left;
		let top = this.newCms.mouse_y - this.newCms.content_scroll_panel_rect.top;

		const node_width = node_rect.width;
		const node_height = node_rect.height;
		const side_offset = node_width * 0.5 + 5;
		const vertical_offset = node_height * 0.5 + 5;

		left = Math.max(left, side_offset);
		left = Math.min(
			left,
			this.newCms.content_scroll_panel.clientWidth - side_offset
		);

		top = Math.max(top, vertical_offset);
		top = Math.min(
			top,
			this.newCms.content_scroll_panel.clientHeight - vertical_offset
		);

		this.node.style.left = left + "px";
		this.node.style.top =
			top + this.newCms.content_scroll_panel.scrollTop + "px";

		this.node.classList.toggle("visible", true);
	}
}
