export default class EditBlock {
	constructor(edit_block_node, newCms) {
		/** @type {NewCms} */
		this.newCms = newCms;
		this.node = edit_block_node;
		this.init();

		this.newCms.container.addEventListener("side_menu_change", (event) => {
			const is_edit_block_menu = event.detail.side_menu_name == "edit_block";

			if (!is_edit_block_menu) {
				this.init();
			}
		});

		const image = this.newCms.sidebar.find(`[name="image"]`);
		image.addEventListener("change", () => {
			if (this.newCms.edit_block.edit_node) {
				const block_type = this.newCms.edit_block.edit_node.getAttribute(
					"data-block"
				);
				if (block_type == "image") {
					this.newCms.edit_block.edit_node
						.find(".newCms_block_content")
						.setValue(image.getValue());

					lazyLoadImages();
					this.newCms.contentChange();
				}
			}
		});

		const container_flow = this.newCms.sidebar.find(`[name="container_flow"]`);
		container_flow.addEventListener("change", () => {
			if (this.newCms.edit_block.edit_node) {
				const block_type = this.newCms.edit_block.edit_node.getAttribute(
					"data-block"
				);
				if (block_type == "container") {
					this.newCms.edit_block.edit_node
						.find(".newCms_block_content")
						.classList.toggle(
							"container_row",
							container_flow.getValue() == "container_row"
						);

					this.newCms.contentChange();
				}
			}
		});

		this.newCms.container.addEventListener("clean_up_output", () => {
			this.cleanUpContent(this.newCms.clean_output_node);
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

	editBlock(block) {
		this.edit_node = block;

		// TODO: event listeners for each block type? extending?
		// we might need to use blocks "blocks" as something that comes with modules?
		// u know these weird scripts that include and combined give a nice juicy forms etc?
		// thats what I'm talking about
		const block_type = block.getAttribute("data-block");
		if (block_type == "quill_editor") {
			this.newCms.quill_editor.setEditorContent(
				block.find(".newCms_block_content").innerHTML
			);
		}
		if (block_type == "image") {
			const image = this.newCms.sidebar.find(`[name="image"]`);
			image.setValue(block.find(".newCms_block_content").getValue());
			lazyLoadImages();
		}
		if (block_type == "container") {
			const container_flow = this.newCms.sidebar.find(
				`[name="container_flow"]`
			);
			container_flow.setValue(
				this.newCms.edit_block.edit_node
					.find(".newCms_block_content")
					.classList.contains("container_row")
					? "container_row"
					: ""
			);
		}

		// for all blocks types
		const margin = this.newCms.sidebar.find(`.margin`);

		margin.findAll("c-select").forEach((e) => {
			const input = e.find("input");
			const dir = input.getAttribute("data-dir");

			input.setValue(this.edit_node.style[`margin${dir.capitalize()}`]);
		});

		block.classList.add("edit_active");
		this.newCms.showSideMenu("edit_block");

		// this.newCms.container.classList.remove("anything_selected");
	}

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

		const btn_set = [
			{
				color: "#58D",
				icon: `<i class="fas fa-pencil-alt" style="transform:translateX(1px)"></i>`,
				className: "edit_btn",
			},
			{
				color: "#a7a7a7",
				icon: `<i class="fas fa-arrows-alt"></i>`,
				className: "relocate_btn",
			},
			{
				color: "#f55",
				icon: `<i class="fas fa-times"></i>`,
				className: "remove_btn",
			},
		];

		const btn_count = btn_set.length;

		const icon_size = 20;

		const space_ratio = 1.5;
		const inner_space_ratio = (space_ratio * radius) / inner_radius;

		for (let i = 0; i < btn_count; i++) {
			const point = (a, r) => {
				return {
					x: x0 - Math.sin(a * norad) * r,
					y: y0 - Math.cos(a * norad) * r,
				};
			};
			const a1 = (i * 360) / btn_count;
			const a2 = ((i + 1) * 360) / btn_count;

			const p1 = point(a1 + space_ratio, radius);
			const p2 = point(a2 - space_ratio, radius);
			const p3 = point(a2 - inner_space_ratio, inner_radius);
			const p4 = point(a1 + inner_space_ratio, inner_radius);

			const p5 = point((a1 + a2) * 0.5, (radius + inner_radius) * 0.485);

			const btn_data = btn_set[i];

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
                    <div class="context-icon" >
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
			relocate_btn.addEventListener(
				IS_MOBILE ? "touchstart" : "mousedown",
				() => {
					this.hideContextMenu();
					this.newCms.grabBlock(block);
				}
			);
		}

		const remove_btn = this.node.find(".remove_btn");
		if (remove_btn) {
			remove_btn.addEventListener("click", () => {
				this.hideContextMenu();
				this.newCms.removeBlock(block);
			});
		}

		const dismiss_btn = this.node.find(".dismiss_btn");
		if (dismiss_btn) {
			dismiss_btn.addEventListener("click", () => {
				this.hideContextMenu();
			});
		}

		const node_rect = this.node.getBoundingClientRect();

		let left = this.newCms.mouse_x - this.newCms.content_scroll_panel_rect.left;
		let top =
			this.newCms.mouse_y -
			this.newCms.content_scroll_panel_rect.top +
			this.newCms.content_scroll_panel.scrollTop;

		const node_width = node_rect.width;
		const node_height = node_rect.height;
		const side_offset = node_width * 0.5 + 5;
		const vertical_offset = node_height * 0.5 + 5;

		left = Math.max(left, side_offset);
		left = Math.min(
			left,
			this.newCms.content_scroll_content.clientWidth - side_offset
		);

		top = Math.max(top, vertical_offset);
		top = Math.min(
			top,
			this.newCms.content_scroll_content.clientHeight - vertical_offset
		);

		this.node.style.left = left + "px";
		this.node.style.top = top + "px";

		this.node.classList.toggle("visible", true);
	}
}
