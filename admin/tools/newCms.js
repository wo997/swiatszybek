// dependencies
useTool("fileManager");
useTool("quillEditor");

class EditBlock {
	constructor(edit_block_node, newCms) {
		this.node = edit_block_node;
		this.newCms = newCms;
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

class FloatingRearrangeControls {
	constructor(newCms) {
		this.newCms = newCms;
		this.node = newCms.container.find(`.rearrange_controls`);
		this.rearrange_insert_rect_node = newCms.container.find(
			`.rearrange_insert_rect`
		);
		this.rearrange_grabbed_rect_node = newCms.container.find(
			`.rearrange_grabbed_rect`
		);
		this.init();
	}

	init() {
		this.node.classList.remove("visible");
		this.rearrange_insert_rect_node.classList.remove("visible");
		this.rearrange_grabbed_rect_node.classList.remove("visible");

		this.removeRearrangement();
	}

	removeRearrangement(options = {}) {
		this.rearrange_near_block = null;
		this.rearrange_position = "";
		this.rearrange_control_node = null;

		this.newCms.container.findAll(".rearrange_active").forEach((e) => {
			if (options.except && options.except.indexOf(e) !== -1) {
				return;
			}
			e.classList.remove("rearrange_active");
		});

		this.newCms.container.classList.remove("rearrange_possible");
	}

	mouseMove() {
		const target = this.newCms.mouse_target;

		let rearrange_near_block = null;
		let rearrange_control_node = null;

		if (
			!target ||
			!target.findParentNode(this.rearrange_grabbed_rect_node, {
				inside: this.newCms.content_scroll_content,
			})
		) {
			rearrange_control_node = target
				? target.findParentByClassName("rearrange_control")
				: null;

			if (rearrange_control_node) {
				rearrange_near_block = rearrange_control_node.rearrange_near_block;
			}

			if (!rearrange_near_block) {
				rearrange_near_block = target
					? target.findParentByClassName("newCms_block")
					: null;
			}
		}

		let rearrange_position = "";

		let parent_container = null;
		let is_parent_row = false;
		let rearrange_near_block_rect = null;

		if (rearrange_near_block) {
			if (
				rearrange_control_node &&
				rearrange_control_node.classList.contains("insert_inside")
			) {
				parent_container = rearrange_near_block;
				rearrange_position = "inside";
			} else {
				parent_container = rearrange_near_block.findParentByAttribute(
					{ "data-block": "container" },
					{ skip: 1 }
				);

				if (!parent_container) {
					parent_container = this.newCms.content_node;
				}

				is_parent_row = parent_container
					? parent_container.classList.contains("container_row")
					: false;
			}

			if (rearrange_control_node) {
				rearrange_position = rearrange_control_node.position;
			} else {
				rearrange_near_block_rect = rearrange_near_block.getBoundingClientRect();
				if (is_parent_row) {
					rearrange_position =
						event.clientX <
						rearrange_near_block_rect.left +
							rearrange_near_block_rect.width * 0.5
							? "before"
							: "after";
				} else {
					rearrange_position =
						event.clientY <
						rearrange_near_block_rect.top +
							rearrange_near_block_rect.height * 0.5
							? "before"
							: "after";
				}

				if (rearrange_position == "inside") {
					rearrange_position = "inside";
					rearrange_control_node =
						rearrange_near_block.rearrange_control_inside;
				} else {
					if (rearrange_position == "before") {
						if (rearrange_near_block.rearrange_control_before) {
							rearrange_control_node =
								rearrange_near_block.rearrange_control_before;
						} else {
							const prev_block = rearrange_near_block.prev();

							if (prev_block && prev_block.rearrange_control_after) {
								rearrange_control_node = prev_block.rearrange_control_after;
							}
						}
					} else if (
						rearrange_position == "after" &&
						rearrange_near_block.rearrange_control_after
					) {
						rearrange_control_node =
							rearrange_near_block.rearrange_control_after;
					}
				}
			}
		}

		// this is slow
		if (this.rearrange_control_node != rearrange_control_node) {
			this.removeRearrangement({ except: [rearrange_control_node] });
		}

		if (!rearrange_control_node) {
			rearrange_near_block = null;
		}

		this.rearrange_near_block = rearrange_near_block;
		this.rearrange_position = rearrange_position;
		this.rearrange_control_node = rearrange_control_node;

		this.rearrange_insert_rect_node.classList.toggle(
			"visible",
			!!rearrange_control_node
		);

		this.newCms.container.classList.toggle(
			"rearrange_possible",
			!!rearrange_control_node
		);

		if (rearrange_control_node) {
			if (!rearrange_control_node.classList.contains("rearrange_active")) {
				const min_size = 20;

				let width = min_size;
				let height = min_size;

				const rearrange_near_block_rect_data = nodePositionAgainstScrollableParent(
					rearrange_near_block
				);

				let x = rearrange_near_block_rect_data.relative_pos.left;
				let y = rearrange_near_block_rect_data.relative_pos.top;

				if (rearrange_position == "inside") {
					height = rearrange_near_block_rect_data.node_rect.height;
					width = rearrange_near_block_rect_data.node_rect.width;

					if (height > 30) {
						height -= 20;
						y += 10;
					}
					if (width > 30) {
						width -= 20;
						x += 10;
					}
				} else {
					if (is_parent_row) {
						height = rearrange_near_block_rect_data.node_rect.height;
					} else {
						width = rearrange_near_block_rect_data.node_rect.width;
					}

					if (rearrange_position != "before") {
						if (is_parent_row) {
							x += rearrange_near_block_rect_data.node_rect.width;
						} else {
							y += rearrange_near_block_rect_data.node_rect.height;
						}
					}

					if (is_parent_row) {
						x -= min_size * 0.5;
					} else {
						y -= min_size * 0.5;
					}

					if (rearrange_control_node.classList.contains("insert_end")) {
						if (is_parent_row) {
							x += min_size * (rearrange_position == "before" ? 0.5 : -0.5);
						} else {
							y += min_size * (rearrange_position == "before" ? 0.5 : -0.5);
						}
					}
				}

				this.rearrange_insert_rect_node.style.left = x + "px";
				this.rearrange_insert_rect_node.style.top = y + "px";
				this.rearrange_insert_rect_node.style.width = width + "px";
				this.rearrange_insert_rect_node.style.height = height + "px";
			}
			rearrange_control_node.classList.add("rearrange_active");

			if (parent_container) {
				parent_container.classList.add("rearrange_active");
				if (parent_container.select_control) {
					parent_container.select_control.classList.add("rearrange_active");
				}
			}
		}
	}

	addFloatingRearrangeControls(block) {
		this.removeRearrangement();

		// just a rect u grab from
		if (block) {
			const block_rect_data = nodePositionAgainstScrollableParent(block);
			const rearrange_grabbed_rect_node = this.rearrange_grabbed_rect_node;

			block_rect_data.scrollable_parent.appendChild(
				rearrange_grabbed_rect_node
			);

			rearrange_grabbed_rect_node.style.left =
				block_rect_data.relative_pos.left + "px";
			rearrange_grabbed_rect_node.style.top =
				block_rect_data.relative_pos.top + "px";
			rearrange_grabbed_rect_node.style.width =
				block_rect_data.node_rect.width + "px";
			rearrange_grabbed_rect_node.style.height =
				block_rect_data.node_rect.height + "px";
			rearrange_grabbed_rect_node.classList.add("visible");
		}

		// them floating controls
		const rearrange_control_width = parseInt(
			getComputedStyle(document.documentElement).getPropertyValue(
				"--rearrange_control_width"
			)
		);
		const rearrange_control_height = parseInt(
			getComputedStyle(document.documentElement).getPropertyValue(
				"--rearrange_control_height"
			)
		);

		let blocks_data = [];
		const addControls = (position) => {
			this.newCms.content_node.findAll(".newCms_block").forEach((block) => {
				if (block == this.newCms.grabbed_block) {
					// don't touch itself
					return;
				}

				if (
					this.newCms.grabbed_block &&
					((position === "after" &&
						block.next() == this.newCms.grabbed_block) ||
						(position === "before" &&
							block.prev() == this.newCms.grabbed_block))
				) {
					// no siblings
					return;
				}

				const parent_container = block.findParentByAttribute(
					{ "data-block": "container" },
					{ skip: 1 }
				);

				const is_parent_row = parent_container
					? parent_container.classList.contains("container_row")
					: false;

				const block_rect_data = nodePositionAgainstScrollableParent(block);

				const prev_node = block.prev();

				if (
					position === "before" &&
					prev_node &&
					prev_node.classList.contains("newCms_block")
				) {
					// no kissing ugh
					if (is_parent_row) {
						const prev_node_rect = prev_node.getBoundingClientRect();
						const node_rect = block_rect_data.node_rect;
						if (
							Math.abs(node_rect.left - prev_node_rect.right) <
								rearrange_control_width &&
							Math.abs(
								node_rect.top +
									node_rect.height * 0.5 -
									prev_node_rect.top -
									prev_node_rect.height * 0.5
							) < rearrange_control_height
						) {
							// rows kissing
							return;
						}
					} else {
						// no need to put stuff on top
						return;
					}
				}

				if (
					position == "inside" &&
					(block.find(".newCms_block") ||
						block.getAttribute("data-block") != "container")
				) {
					// has a kid? no need to add that little icon to add more bro
					return;
				}

				let parent_count = 0;
				let parent = block;
				while (parent != this.content_node) {
					parent_count++;
					parent = parent.parent();
				}

				if (position == "inside") {
					block_rect_data.relative_pos.left +=
						(block_rect_data.node_rect.width - rearrange_control_width) * 0.5;
					block_rect_data.relative_pos.top +=
						(block_rect_data.node_rect.height - rearrange_control_height) * 0.5;
				} else {
					if (is_parent_row) {
						block_rect_data.relative_pos.left -= rearrange_control_width * 0.5;
						block_rect_data.relative_pos.top +=
							(block_rect_data.node_rect.height - rearrange_control_height) *
							0.5;

						if (position === "after") {
							block_rect_data.relative_pos.left +=
								block_rect_data.node_rect.width;
						}
					} else {
						block_rect_data.relative_pos.left +=
							(block_rect_data.node_rect.width - rearrange_control_width) * 0.5;
						block_rect_data.relative_pos.top -= rearrange_control_width * 0.5;

						if (position === "after") {
							block_rect_data.relative_pos.top +=
								block_rect_data.node_rect.height;
						}
					}
				}

				const index = block_rect_data.relative_pos.top + parent_count;
				blocks_data.push({
					index: index,
					block: block,
					rect_data: block_rect_data,
					is_parent_row: is_parent_row,
					position: position,
				});
			});
		};

		this.node.empty();

		this.newCms.content_node.findAll(".newCms_block").forEach((block) => {
			block.rearrange_control_before = null;
			block.rearrange_control_after = null;
			block.rearrange_control_inside = null;
		});

		addControls("inside");
		addControls("before");
		addControls("after");

		const sorted_blocks_data = blocks_data.sort((a, b) => {
			return Math.sign(a.index - b.index);
		});

		const sorted_blocks_data_length = sorted_blocks_data.length;
		let upper_bound = 0;

		for (let i = 0; i < sorted_blocks_data_length; i++) {
			delete block.rearrange_control_before;
			delete block.rearrange_control_after;
		}

		for (let i = 0; i < sorted_blocks_data_length; i++) {
			const block_data = sorted_blocks_data[i];
			const block = block_data.block;

			let left = block_data.rect_data.relative_pos.left;
			let top = block_data.rect_data.relative_pos.top;

			let moving = true;
			while (moving) {
				moving = false;
				for (let u = i - 1; u >= upper_bound; u--) {
					const prev_block_data = sorted_blocks_data[u];

					const prev_y2 =
						prev_block_data.rect_data.relative_pos.top +
						rearrange_control_height;

					if (top >= prev_y2) {
						// optimization
						upper_bound = u + 1;
						break;
					}

					if (
						prev_block_data.rect_data.relative_pos.left <
							left + rearrange_control_width &&
						prev_block_data.rect_data.relative_pos.left +
							rearrange_control_width >
							left
					) {
						if (block_data.position === "after") {
							// go left
							left =
								prev_block_data.rect_data.relative_pos.left -
								rearrange_control_width;
						} else if (
							block_data.position === "before" ||
							block_data.position === "inside"
						) {
							// go right
							left =
								prev_block_data.rect_data.relative_pos.left +
								rearrange_control_width;
						}
						moving = true;
					}
				}
			}

			block_data.rect_data.relative_pos.left = left;
			block_data.rect_data.relative_pos.top = top;

			const rearrange_control = document.createElement("DIV");
			rearrange_control.classList.add("rearrange_control");
			rearrange_control.style.left = left + "px";
			rearrange_control.style.top = top + "px";

			let rearrange_control_html = "";

			let rotation = 0;

			if (block_data.position == "inside") {
				rearrange_control_html = `<img style='width:0.7em' src="/src/img/insert_plus.svg">`;
				rearrange_control.classList.add("insert_inside");
			} else {
				if (block_data.is_parent_row) {
					rotation += 90;
				}

				const has_prev = block_data.position == "after" ? true : !!block.prev();
				const has_next =
					block_data.position == "before" ? true : !!block.next();

				if (has_next && has_prev) {
					rearrange_control_html = `<img style='width:1em' src="/src/img/arrows_insert_between.svg">`;
					rearrange_control.classList.add("insert_between");
				} else if (has_prev || has_next) {
					rearrange_control_html = `<img style='width:1em' src="/src/img/arrows_insert_after.svg">`;
					if (has_next) {
						rotation += 180;
					}
					rearrange_control.classList.add("insert_end");
				}
			}

			rearrange_control.innerHTML = rearrange_control_html;

			$(rearrange_control).find("*").style.transform = `rotate(${rotation}deg)`;

			block[`rearrange_control_${block_data.position}`] = rearrange_control;
			rearrange_control.rearrange_near_block = block;
			rearrange_control.position = block_data.position;

			this.node.appendChild(rearrange_control);
		}
	}
}

class FloatingSelectControls {
	constructor(newCms) {
		this.newCms = newCms;
		this.node = newCms.container.find(`.select_controls`);
		this.removeSelection();
	}

	init() {
		this.selected_block = null;
		this.node.classList.add("visible");
		this.removeSelection();
	}

	removeSelection() {
		this.newCms.container.findAll(".select_active").forEach((e) => {
			e.classList.remove("select_active");
		});
	}

	mouseMove() {
		const target = this.newCms.mouse_target;

		let hovered_block = null;

		const select_control = target
			? target.findParentByClassName("select_control")
			: null;

		if (select_control) {
			hovered_block = select_control.select_block;
		}

		if (!hovered_block) {
			hovered_block = target
				? target.findParentByClassName("newCms_block")
				: null;
		}

		if (
			this.selected_block != hovered_block ||
			(this.selected_block &&
				!this.selected_block.select_control.classList.contains("select_active"))
		) {
			this.removeSelection();

			this.selected_block = hovered_block;

			const selected_block = this.selected_block;

			if (selected_block) {
				selected_block.classList.add("select_active");
				selected_block.select_control.classList.add("select_active");
			}
		}

		this.newCms.container.classList.toggle(
			"anything_selected",
			this.selected_block
		);
	}

	mouseDown() {
		if (
			this.newCms.mouse_left_btn &&
			this.selected_block &&
			!this.newCms.grabbed_block
		) {
			this.newCms.edit_block.showControlsToBlock(this.selected_block);
			//this.newCms.grabBlock(this.selected_block);
		}
	}

	addFloatingSelectControls() {
		this.removeSelection();

		let blocks_data = [];
		this.newCms.content_node.findAll(".newCms_block").forEach((block) => {
			const block_rect_data = nodePositionAgainstScrollableParent(block);

			let parent_count = 0;
			let parent = block;
			while (parent != this.content_node) {
				parent_count++;
				parent = parent.parent();
			}

			const index = block_rect_data.relative_pos.top + parent_count;
			blocks_data.push({
				index: index,
				block: block,
				rect_data: block_rect_data,
			});
		});
		const sorted_blocks_data = blocks_data.sort((a, b) => {
			return Math.sign(a.index - b.index);
		});

		const select_control_width = parseInt(
			getComputedStyle(document.documentElement).getPropertyValue(
				"--select_control_width"
			)
		);
		const select_control_height = parseInt(
			getComputedStyle(document.documentElement).getPropertyValue(
				"--select_control_height"
			)
		);

		const sorted_blocks_data_length = sorted_blocks_data.length;
		let upper_bound = 0;

		this.node.empty();

		for (let i = 0; i < sorted_blocks_data_length; i++) {
			const block_data = sorted_blocks_data[i];
			const block = block_data.block;

			let left = block_data.rect_data.relative_pos.left;
			let top = block_data.rect_data.relative_pos.top;

			let moving = true;
			while (moving) {
				moving = false;
				for (let u = i - 1; u >= upper_bound; u--) {
					const prev_block_data = sorted_blocks_data[u];

					const prev_y2 =
						prev_block_data.rect_data.relative_pos.top + select_control_height;

					if (top >= prev_y2) {
						// optimization
						upper_bound = u + 1;
						break;
					}

					if (
						prev_block_data.rect_data.relative_pos.left <
							left + select_control_width &&
						prev_block_data.rect_data.relative_pos.left + select_control_width >
							left
					) {
						left =
							prev_block_data.rect_data.relative_pos.left +
							select_control_width;
						moving = true;
					}
				}
			}

			block_data.rect_data.relative_pos.left = left;
			block_data.rect_data.relative_pos.top = top;

			const select_control = document.createElement("DIV");
			select_control.classList.add("select_control");
			select_control.style.left = left + "px";
			select_control.style.top = top + "px";

			select_control.block = block;
			block.select_control = select_control;

			const block_type = block.getAttribute("data-block");

			select_control.setAttribute("data-block", block_type);

			const icon = $(`.side_block[data-block="${block_type}"] i`);

			select_control.innerHTML = icon
				? icon.outerHTML
				: `<i class="fas fa-square"></i>`;

			block.select_control = select_control;
			select_control.select_block = block;

			this.node.appendChild(select_control);
		}

		//this.node.classList.add("blocks_visible");
	}
}

class QuillEditor {
	color_list = [
		"rgb(255, 85, 118)",
		"rgb(255,43,0)",
		"#FFD700",
		"var(--primary-clr)", // TODO: primary color comes from admin, not front, weird glitch, might wanna abandon or let the use prepare color list for his needs in other theme tab
		"#3f00b5",
		"rgb(160,65,112)",
		"rgb(65,160,113)",
		"#e60000",
		"#ff9900",
		"#ffff00",
		"#008a00",
		"#0066cc",
		"#9933ff",
		"#ffffff",
		"#facccc",
		"#ffebcc",
		"#ffffcc",
		"#cce8cc",
		"#cce0f5",
		"#ebd6ff",
		"#bbbbbb",
		"#f06666",
		"#ffc266",
		"#ffff66",
		"#66b966",
		"#66a3e0",
		"#c285ff",
		"#888888",
		"#a10000",
		"#b26b00",
		"#b2b200",
		"#006100",
		"#0047b2",
		"#6b24b2",
		"#444444",
		"#5c0000",
		"#663d00",
		"#666600",
		"#003700",
		"#002966",
		"#3d1466",
		"#000000",
	];

	constructor(newCms, node) {
		this.node = node;
		this.newCms = newCms;

		var Size = Quill.import("attributors/style/size");
		Size.whitelist = [];
		for (let i = 0; i < 10; i++) {
			Size.whitelist.push(Math.round(Math.pow(1.25, i - 2) * 100) / 100 + "em");
		}

		this.editor = new Quill(node, {
			theme: "snow",
			modules: {
				syntax: true,
				toolbar: [
					[
						{
							size: Size.whitelist,
						},
					],
					["bold", "italic", "underline", "strike"],
					[
						{
							color: this.color_list,
						},
						{
							background: this.color_list,
						},
					],
					[
						{
							list: "ordered",
						},
						{
							list: "bullet",
						},
						{
							indent: "-1",
						},
						{
							indent: "+1",
						},
					],
					[
						{
							header: "1",
						},
						{
							header: "2",
						},
						{
							header: "3",
						},
					],
					[
						{
							align: [],
						},
					],
					["clean"],
				],
				table: false,
			},
		});

		this.ql_node = this.node.find(".ql-editor");

		this.newCms.container.addEventListener(
			IS_MOBILE ? "click" : "mousedown",
			(event) => {
				this.newCms.updateMouseCoords(event);
			}
		);

		this.any_changes = false;
		this.change_from_cms = false;

		this.editor.on("text-change", (delta, oldDelta, source) => {
			if (this.newCms.edit_block.edit_node) {
				const block_type = this.newCms.edit_block.edit_node.getAttribute(
					"data-block"
				);
				if (block_type == "quill_editor") {
					this.newCms.edit_block.edit_node
						.find(".newCms_block_content")
						.setContent(this.ql_node.innerHTML);

					if (!this.change_from_cms) {
						this.any_changes = true;
					}
				}
			}
		});

		this.newCms.container.addEventListener(
			IS_MOBILE ? "touchstart" : "mousemove",
			(event) => {
				this.newCms.updateMouseCoords(event);
				if (!this.newCms.mouse_target.findParentNode(this.newCms.sidebar)) {
					this.saveChanges();
				}
			}
		);

		this.newCms.container.addEventListener("click", (event) => {
			this.newCms.updateMouseCoords(event);
			if (!this.newCms.mouse_target.findParentNode(this.node)) {
				this.saveChanges();
			}
		});
	}

	saveChanges() {
		if (!this.any_changes) {
			return;
		}
		this.any_changes = false;
		this.newCms.contentChange();
	}

	setEditorContent(html) {
		this.any_changes = false;
		this.change_from_cms = true;
		this.ql_node.setContent(html);
		setTimeout(() => {
			// 0 is also "fine", sorry for that workaround
			this.change_from_cms = false;
		}, 200);
	}
}

class NewCms {
	constructor(container) {
		this.container = $(container);
		this.content_node = this.container.find(`.newCmsContent`);
		this.content_scroll_panel = this.container.find(`.content_scroll_panel`);
		this.content_scroll_content = this.container.find(
			`.content_scroll_content`
		);
		this.sidebar = this.container.find(`.sidebar`);
		this.sidebar_scroll_wrapper = this.sidebar.find(`.scroll-panel`);
		this.sidebar_content_wrapper = this.sidebar_scroll_wrapper.find(
			`.sidebar_content_wrapper`
		);

		this.rearrange_node = this.container.find(`.rearrange_node`);

		this.clean_output_node = this.container.find(`.clean_output`);

		this.sidebar_scroll_wrapper = this.sidebar.find(`.scroll-panel`);

		this.initEditBlock();
		this.initQuillEditor();
		this.initFloatingSelectControls();
		this.initFloatingRearrangeControls();
		this.initListenChange();

		this.initMargins();

		this.mouse_x = 0;
		this.mouse_y = 0;
		this.mouse_dx = 0;
		this.mouse_dy = 0;
		this.mouse_target = null;
		//this.scroll_top = 0;

		setFormData(
			{
				edit_mode: 1,
			},
			container
		);

		this.container.addEventListener(
			IS_MOBILE ? "touchstart" : "mousemove",
			(event) => {
				this.updateMouseCoords(event);
				this.mouseMove();
			}
		);

		this.container.addEventListener(
			IS_MOBILE ? "click" : "mousedown",
			(event) => {
				this.updateMouseCoords(event);
				this.mouseDown();
			}
		);

		this.container.addEventListener(
			IS_MOBILE ? "touchend" : "mouseup",
			(event) => {
				this.updateMouseCoords(event);
				this.mouseUp();
			}
		);

		this.content_scroll_panel.addEventListener("scroll", () => {
			this.scroll();
		});
	}

	initMargins() {
		const margin = this.sidebar.find(`.margin`);
		this.insertMarginControl(margin, "margin", {});

		margin.findAll("c-select").forEach((e) => {
			const input = e.find("input");
			const dir = input.getAttribute("data-dir");

			input.addEventListener("change", () => {
				this.edit_block.edit_node.style[
					`margin${dir.capitalize()}`
				] = input.getValue();

				this.contentChange();
			});
		});
	}

	insertMarginControl(node, name) {
		const options = /*html*/ `
            <c-option>0</c-option>
            <c-option>12px</c-option>
            <c-option>24px</c-option>
            <c-option>36px</c-option>
            <c-option>2%</c-option>
            <c-option>4%</c-option>
            <c-option>6%</c-option>
        `;

		const getInput = (dir) => {
			return /*html*/ `
                <c-select style="width:100px">
                    <input type="text" class="field"
                        name="${name + dir}" data-dir=${dir}>
                    <c-arrow></c-arrow>
                    <c-options>
                        ${options}
                    </c-options>
                </c-select>
            `;
		};

		node.insertAdjacentHTML(
			"afterbegin",
			/*html*/ `
            <div style="max-width:400px">
                <div style="display:flex;justify-content:center">
                    ${getInput("top")}
                </div>
                <div style="display:flex;justify-content: space-around;padding: 20px 0;">
                    ${getInput("left")}
                    ${getInput("right")}
                </div>
                <div style="display:flex;justify-content:center">
                    ${getInput("bottom")}
                </div>
            </div>
            `
		);
	}

	initListenChange() {
		this.content_node.addEventListener("change", () => {
			const trigger_change = !this.content_change_triggered;
			this.contentChange({
				trigger_change: trigger_change,
			});

			// TODO: based on what node has class edit_active or not you can show the edit block menu, crazy right?
			// html driven db <3
		});
	}

	getCleanOutput(html) {
		this.clean_output_node.setContent(html);

		this.container.dispatchEvent(new Event("clean_up_output"));

		return this.clean_output_node.innerHTML;
	}

	initEditBlock() {
		this.edit_block = new EditBlock(
			this.container.find(`.edit_block_node`),
			this
		);
	}

	initQuillEditor() {
		this.quill_editor = new QuillEditor(
			this,
			this.container.find(".quill_editor")
		);
	}

	initFloatingSelectControls() {
		this.select_controls = new FloatingSelectControls(this);
	}

	initFloatingRearrangeControls() {
		this.rearrange_controls = new FloatingRearrangeControls(this);
	}

	edit(targetNode, options) {
		this.targetNode = $(targetNode);
		this.options = options;

		this.edit_block.init();
		this.rearrange_controls.init();
		this.select_controls.init();

		setFormData(
			{
				content: this.getCleanOutput(this.targetNode.innerHTML),
			},
			this.container
		);
		this.contentChange();

		setFormInitialState(this.container);

		this.lockInput();

		showModal("newCms", {
			source: this.targetNode,
			lock_during_animation: true,
			callback: () => {
				setTimeout(() => {
					this.contentChange();
					this.unlockInput();
				}, 100);
			},
		});
	}

	save() {
		this.targetNode.setValue(
			this.getCleanOutput(getFormData(this.container).content)
		);
	}

	lockInput(delay) {
		if (delay <= 1) {
			return;
		}

		this.container.classList.add("locked_input");

		if (this.lock_timeout) {
			clearTimeout(this.lock_timeout);
		}

		if (delay) {
			this.lock_timeout = setTimeout(() => {
				this.unlockInput();
			}, delay);
		}
	}

	unlockInput() {
		this.container.classList.remove("locked_input");
		this.select_controls.addFloatingSelectControls();
	}

	updateMouseTarget() {
		this.mouse_target = $(
			document.elementFromPoint(this.mouse_x, this.mouse_y)
		);
	}

	updateMouseCoords(event) {
		this.content_scroll_panel_rect = this.content_scroll_panel.getBoundingClientRect();
		const mouse_x = event.clientX;
		const mouse_y = event.clientY;
		this.mouse_dx = mouse_x - this.mouse_x;
		this.mouse_dy = mouse_y - this.mouse_y;
		this.mouse_x = mouse_x;
		this.mouse_y = mouse_y;
		this.mouse_left_btn = event.buttons === 1;
		this.mouse_target = $(event.target);
	}

	mouseMove() {
		if (this.grabbed_block) {
			this.rearrange_controls.mouseMove();
			return;
		}

		if (this.edit_block.select_node) {
			this.edit_block.mouseMove();
		}

		this.select_controls.mouseMove();
	}

	mouseDown() {
		/*if (this.edit_block.target) {
    } else {
    }*/
		this.select_controls.mouseDown();

		const target = this.mouse_target;

		const side_block = target
			? target.findParentByClassName("side_block")
			: null;
		if (side_block) {
			this.grabBlock(side_block);
		}

		const show_side_menu = target.findParentByAttribute("data-show_side_menu");
		if (show_side_menu) {
			this.showSideMenu(show_side_menu.getAttribute("data-show_side_menu"));
		}
	}

	mouseUp() {
		if (this.grabbed_block) {
			this.releaseBlock();
		}
	}

	scroll() {
		this.updateMouseTarget();
		this.mouseMove();

		//this.scroll_top = this.content_scroll_panel.scrollTop;
		/*if (this.grabbed_block) {
      this.grabbedBlockPositionChange();
      return;
    }*/
	}

	contentChange(options = {}) {
		this.content_change_triggered = true;
		this.insertMissingQlClasses();

		this.select_controls.addFloatingSelectControls();

		if (nonull(options.trigger_change, true) === true) {
			this.content_node.dispatchChange();
		}
		this.content_change_triggered = false;
	}

	insertMissingQlClasses() {
		// TODO: should we use it on the whole container instead?
		this.content_node
			.findAll(".newCms_quill_editor")
			.forEach((newCms_block) => {
				const newCms_block_content = newCms_block.find(".newCms_block_content");
				newCms_block_content.classList.add("ql-editor");
				newCms_block_content.parent().classList.add("ql-snow");
			});
	}

	getBlockHtml(type, options = {}) {
		//let content = "";
		let class_name = "";

		let content_html = "";

		if (type === "quill_editor") {
			content_html = `<div class="newCms_block_content ql-editor"></div>`;
		} else {
			content_html = `<img class="newCms_block_content wo997_img">`;
		}

		return /*html*/ `
      <div class="newCms_block ${class_name}" data-block="${type}">
        ${content_html}
      </div>
    `;
	}

	insertBlock(target, position, type, options = {}) {
		target.insertAdjacentHTML(position, getBlockHtml(type, options));

		this.contentChange();
	}

	removeBlock(block) {
		if (!block) {
			return;
		}
		const duration = 300;
		this.lockInput();
		zoomNode(block, "out", {
			duration: duration,
			callback: () => {
				block.remove();
				this.contentChange();
				this.unlockInput();
			},
		});
	}

	grabBlock(block) {
		if (this.grabbed_block) {
			return;
		}

		const block_rect = block.getBoundingClientRect();
		block.last_rect = block_rect;

		this.source_grabbed_node = block.classList.contains("side_block")
			? this.sidebar
			: this.content_scroll_content;

		this.grabbed_node_scroll_parent = this.source_grabbed_node.findScrollParent(
			{ default: document.body }
		);

		this.source_grabbed_node.appendChild(
			newCms.rearrange_controls.rearrange_grabbed_rect_node
		);

		this.grabbed_block = $(block);
		this.grabbed_block.classList.add("grabbed");
		this.grabbed_mouse_x = this.mouse_x;
		this.grabbed_mouse_y = this.mouse_y;
		this.grabbed_scroll_top = this.grabbed_node_scroll_parent.scrollTop;

		this.container.classList.add("grabbed_block");

		this.rearrange_controls.node.classList.add("visible");
		//this.select_controls.node.classList.remove("blocks_visible");

		// show the grabbed clone
		const rearrange_node = this.rearrange_node;
		rearrange_node.setContent(this.grabbed_block.outerHTML);
		const block_inside = rearrange_node.find("*");
		const grabbed_block_rect = this.grabbed_block.getBoundingClientRect();
		rearrange_node.style.left = grabbed_block_rect.left + "px";
		rearrange_node.style.top = grabbed_block_rect.top + "px";
		block_inside.style.width = grabbed_block_rect.width + "px";
		block_inside.style.height = grabbed_block_rect.height + "px";
		rearrange_node.classList.add("visible");

		this.rearrange_controls.addFloatingRearrangeControls(this.grabbed_block);

		this.grab_animation_speed = 0;
		this.grabAnimation();
	}

	releaseBlock() {
		let grabbed_block = this.grabbed_block;
		if (!grabbed_block) {
			return;
		}

		const block_type = grabbed_block.getAttribute("data-block");

		let delay_grabbed_rect_node_fadeout = 0;

		let delay_rearrange_node_fadeout = 0;

		const is_side_block =
			block_type && grabbed_block.classList.contains("side_block");

		if (is_side_block) {
			const side_block = grabbed_block;
			const side_block_rect = side_block.getBoundingClientRect();

			// replace
			const animation_data = grabbed_block.animation_data;

			if (this.rearrange_controls.rearrange_near_block) {
				delay_grabbed_rect_node_fadeout = 250;
				side_block.classList.remove("grabbed");
				side_block.style.transform = "";
				animate(
					side_block,
					`
                        0% {opacity: 0; transform: scale(0.65)}
                        100% {opacity: 1; transform: scale(1)}
                    `,
					delay_grabbed_rect_node_fadeout
				);

				grabbed_block = createNodeByHtml(this.getBlockHtml(block_type));
				this.grabbed_block = grabbed_block;
				this.content_node.appendChild(grabbed_block);
				grabbed_block.animation_data = animation_data;
				grabbed_block.classList.add("select_active");
				grabbed_block.last_rect = side_block_rect;
			}

			// copy fade out
			delay_rearrange_node_fadeout = 150;
			animate(
				this.rearrange_node,
				`
                    0% {opacity: 1; transform: ${this.rearrange_node.style.transform} scale(1)}
                    100% {opacity: 0; transform: ${this.rearrange_node.style.transform} scale(0.65)}
                `,
				delay_rearrange_node_fadeout
			);
		}

		this.grabbed_block.style.transform = "";
		grabbed_block.classList.remove("grabbed");
		setTimeout(() => {
			this.rearrange_node.classList.remove("visible");
		}, delay_rearrange_node_fadeout);

		this.container.classList.remove("grabbed_block");

		this.grabbed_block = null;

		this.rearrange_controls.node.classList.remove("visible");

		setTimeout(() => {
			this.rearrange_controls.rearrange_grabbed_rect_node.classList.remove(
				"visible"
			);
		}, delay_grabbed_rect_node_fadeout);

		this.beforeContentAnimation();

		// some action
		if (this.rearrange_controls.rearrange_near_block) {
			if (this.rearrange_controls.rearrange_position == "inside") {
				this.rearrange_controls.rearrange_near_block
					.find(".newCms_block_content")
					.appendChild(grabbed_block);
			} else {
				let before_node = this.rearrange_controls.rearrange_near_block;
				if (this.rearrange_controls.rearrange_position == "after") {
					before_node = before_node.next();
				}

				this.rearrange_controls.rearrange_near_block
					.parent()
					.insertBefore(grabbed_block, before_node);
			}
		}

		this.animateContent(350);
	}

	beforeContentAnimation() {
		this.content_node.findAll(".newCms_block").forEach((block) => {
			if (!block.last_rect) {
				block.last_rect = block.getBoundingClientRect();
			}
		});
	}

	animateContent(duration) {
		let end_just_once = true;
		const end = () => {
			if (!end_just_once) {
				return;
			}
			end_just_once = false;

			// not needed cause we set it to user-select none bro
			removeUserSelection();

			this.contentChange();

			this.updateMouseTarget();
			this.mouseMove();
		};

		const all_animatable_blocks = this.content_node
			.findAll(".newCms_block")
			.filter((block) => {
				if (block.last_rect) {
					block.new_rect = block.getBoundingClientRect();
					if (!block.animation_data) {
						block.animation_data = { x: 0, y: 0 };
					}
					return true;
				} else {
					return false;
				}
			});

		all_animatable_blocks.forEach((block) => {
			const dx = block.last_rect.left - block.new_rect.left;
			const dy = block.last_rect.top - block.new_rect.top;

			block.animation_data.x += dx;
			block.animation_data.y += dy;

			block
				.find(".newCms_block_content")
				.directChildren()
				.forEach((sub_block) => {
					if (sub_block.animation_data) {
						sub_block.animation_data.x -= dx;
						sub_block.animation_data.y -= dy;
					}
				});
		});

		all_animatable_blocks.forEach((block) => {
			//const styles = window.getComputedStyle(block);

			// TODO: every property such like flexGrow etc needs to be available in a quickly accessible place
			// maybe put them straight to styles?
			// we should remove it when cleaning the cms output anyway ;)

			const half_dw = 0.5 * (block.new_rect.width - block.last_rect.width);
			const half_dh = 0.5 * (block.new_rect.height - block.last_rect.height);

			const mt = evalCss(block.style.marginTop, block);
			const mr = evalCss(block.style.marginRight, block);
			const mb = evalCss(block.style.marginBottom, block);
			const ml = evalCss(block.style.marginLeft, block);

			const mt0 = mt + half_dh;
			const mr0 = mr + half_dw;
			const mb0 = mb + half_dh;
			const ml0 = ml + half_dw;

			const dx = block.animation_data.x - half_dw;
			const dy = block.animation_data.y - half_dh;

			const fg = block.style.flexGrow;
			block.style.flexGrow = 0;

			animate(
				block,
				`
                    0% {
                        transform: translate(
                            ${dx}px,
                            ${dy}px
                        );
                        width: ${block.last_rect.width}px;
                        height: ${block.last_rect.height}px;
                        margin: ${mt0}px ${mr0}px ${mb0}px ${ml0}px;
                    }
                    100% {
                        transform: translate(
                            0px,
                            0px
                        );
                        width: ${block.new_rect.width}px;
                        height: ${block.new_rect.height}px;
                        margin: ${mt}px ${mr}px ${mb}px ${ml}px;
                    }
                `,
				duration,
				() => {
					block.style.flexGrow = fg;

					setTimeout(() => {
						end();
					}, 50);
				}
			);

			delete block.animation_data;
			delete block.last_rect;
		});

		this.lockInput(duration);
	}

	grabAnimation() {
		if (!this.grabbed_block) {
			return;
		}

		// cute scroll
		const content_scroll_panel_rect = this.content_scroll_panel.getBoundingClientRect();

		let speed_y = 0;

		const scroll_offset = 50;
		if (this.mouse_y < content_scroll_panel_rect.top + scroll_offset) {
			speed_y = this.mouse_y - scroll_offset - content_scroll_panel_rect.top;
			if (speed_y < -scroll_offset) {
				speed_y = -scroll_offset;
			}
		}

		if (content_scroll_panel_rect.height - this.mouse_y < scroll_offset) {
			speed_y = scroll_offset - content_scroll_panel_rect.height + this.mouse_y;

			if (speed_y > scroll_offset) {
				speed_y = scroll_offset;
			}
		}

		this.content_scroll_panel.scrollBy(0, speed_y * 0.4);

		// move the block itself
		{
			const grabbed_block = this.grabbed_block;

			// pull closer to the cursor
			this.grab_animation_speed = this.grab_animation_speed * 0.9 + 0.035;
			const acc = this.grab_animation_speed;

			const gb_rect = grabbed_block.last_rect;
			this.grabbed_mouse_x =
				this.grabbed_mouse_x * (1 - acc) +
				(gb_rect.left + gb_rect.width * 0.5) * acc;

			this.grabbed_mouse_y =
				this.grabbed_mouse_y * (1 - acc) +
				(gb_rect.top + gb_rect.height * 0.5) * acc;

			// display actual position using transform
			const base_dx = this.mouse_x - this.grabbed_mouse_x;
			const base_dy = this.mouse_y - this.grabbed_mouse_y;

			const dx = base_dx;
			const dy = base_dy; /* +
				this.grabbed_node_scroll_parent.scrollTop -
				this.grabbed_scroll_top;*/

			grabbed_block.animation_data = { x: dx, y: dy };

			this.rearrange_node.style.transform = `
                translate(
                    ${base_dx.toPrecision(5)}px,
                    ${base_dy.toPrecision(5)}px
                )
            `;
		}

		// repeat
		requestAnimationFrame(() => {
			this.grabAnimation();
		});
	}

	showSideMenu(target_side_menu_name) {
		const current_menu = this.sidebar.find(`[data-side_menu].active`);
		const target_menu = this.sidebar.find(
			`[data-side_menu="${target_side_menu_name}"]`
		);

		if (target_menu == current_menu) {
			return;
		}

		const duration = 300;

		const current_menu_height = current_menu.offsetHeight;
		const target_menu_height = target_menu.offsetHeight;
		const sidebar_scroll_wrapper = this.sidebar_scroll_wrapper;
		const sidebar_content_wrapper = this.sidebar_content_wrapper;
		const sidebar_scroll_wrapper_width = sidebar_scroll_wrapper.offsetWidth;
		const min_height = sidebar_scroll_wrapper.offsetHeight;

		current_menu.style.top = -sidebar_scroll_wrapper.scrollTop + "px";

		target_menu.classList.add("appears");
		current_menu.classList.add("disappears");
		sidebar_content_wrapper.classList.add("transiting");

		animate(
			target_menu,
			`
        0% {
          transform: translate(${sidebar_scroll_wrapper_width}px,0px);
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

				sidebar_content_wrapper.classList.remove("transiting");
				sidebar_content_wrapper.insertBefore(
					target_menu,
					sidebar_content_wrapper.firstChild
				);
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
          transform: translate(-${sidebar_scroll_wrapper_width}px,0px);
          opacity: 0;
        }
      `,
			duration
		);

		animate(
			sidebar_content_wrapper,
			`
        0% {
          height: ${Math.max(current_menu_height, min_height)}px
        }
        100% {
          height: ${Math.max(target_menu_height, min_height)}px
        }
      `,
			duration
		);

		this.container.dispatchEvent(
			new CustomEvent("side_menu_change", {
				detail: {
					side_menu_name: target_side_menu_name,
				},
			})
		);
	}
}

// TODO: move to animator?
function zoomNode(node, direction, options = {}) {
	const styles = window.getComputedStyle(node);

	const w = parseInt(styles.width);
	const h = parseInt(styles.height);

	const mr_l = parseInt(styles.marginLeft);
	const mr_r = parseInt(styles.marginRight);

	const mr_t = parseInt(styles.marginTop);
	const mr_b = parseInt(styles.marginBottom);

	const step_in = `
        transform: scale(1,1);
        margin: ${mr_t}px ${mr_r}px ${mr_b}px ${mr_l}px;
    `;
	const step_out = `
        transform: scale(0,0);
        margin: ${-h * 0.5}px ${-w * 0.5}px;
    `;

	let keyframes = "";

	if (direction == "out") {
		keyframes = `0% {${step_in}opacity: 1;} 100% {${step_out}opacity: 0;}`;
	} else {
		keyframes = `0% {${step_out}opacity: 0;} 100% {${step_in}opacity: 1;}`;
	}

	animate(node, keyframes, nonull(options.duration, 200), () => {
		if (options.callback) {
			options.callback();
		}
	});
}

registerModalContent(
	/*html*/ `
    <div id="newCms" class="newCms" data-expand="large" data-form data-history data-exclude-hidden>
        <div class="modal-body">
            <div class="custom-toolbar">
                <span class="title">
                    Edycja zawartości    
                </span>

                <div class="history-buttons"></div>
                <button class="btn primary" onclick="window.pasteType='container';showModal('pasteBlock')" data-tooltip="Wklej skopiowany kontener / blok"><i class="fas fa-paste"></i></button>
                <button class="btn primary" onclick="copyCMS()" data-tooltip="Skopiuj całą zawartość do schowka"> <i class="fas fa-clipboard"></i> </button>
                <button class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></button>
                <button onclick="showCmsPreview()" class="btn primary preview_btn">Podgląd <i class="fas fa-eye"></i></button>
                <button class="btn primary" onclick="newCms.save();hideParentModal(this);">Zapisz <i class="fa fa-save"></i></button>
            </div>

            <div class="mobileRow" style="flex-shrink: 1;overflow-y: hidden;flex-grow: 1;">
                <div class="sidebar form-hidden">
                  <div class="scroll-panel scroll-shadow hide_scrollbar">
                    <div class="sidebar_content_wrapper">
                      <div data-side_menu="add_block" class="active">
                        <!--<button class="toggle-sidebar-btn btn subtle" onclick="toggleSidebar(this.parent())" data-tooltip="Ukryj bloki"><i class="fas fa-chevron-left"></i><i class="fas fa-puzzle-piece"></i></button>-->
                        <span class="field-title first" style='margin-bottom:7px'><i class="fas fa-puzzle-piece"></i>
                          Bloki 
                          <i class="fas fa-info-circle" data-tooltip="Przeciągnij na dokument i upuść"></i>
                        </span>
                        <div class="block_list">
                          <div class="side_block" data-block="quill_editor">
                            <i class="fas fa-align-center"></i>
                            <span>Edytor tekstowy</span>
                          </div>
                          <div class="side_block" data-block="container">
                            <i class="fas fa-columns"></i>
                            <span>Kontener</span>
                          </div>
                          <div class="side_block" data-block="image">
                            <i class="far fa-image"></i>
                            <span>Zdjęcie</span>
                          </div>
                          <div class="side_block" data-block="video">
                            <i class="fas fa-film"></i>
                            <span>Film</span>
                          </div>
                          
                        </div>
                      </div>

                      <div data-side_menu="edit_block">
                        <span class="field-title first">
                          <button class="btn transparent" data-show_side_menu="add_block">
                            <i class="fas fa-chevron-left"></i>
                          </button>
                          Edycja bloku / kontenera...
                        </span>

                        <span class="field-title">Tekst</span>
                        <div class="quill_editor"></div>

                        <span class="field-title">Zdjęcie</span>
                        <image-input name="image" data-options='{"width":"100%","height":"1w"}'></image-input>

                        <span class="field-title">Ułożenie zawartości</span>
                        <radio-input name="container_flow" class="default">
                            <radio-option value="" data-default> <i class="fas fa-ellipsis-v align-icon"></i> Pionowo </radio-option>
                            <radio-option value="container_row"> <i class="fas fa-ellipsis-h align-icon"></i> Poziomo </radio-option>
                        </radio-input>
                        
                        <span class="field-title">Marginesy</span>
                        <div class="margin"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style="width:100%;">
                  <div class="scroll-panel scroll-shadow content_scroll_panel">
                    <div style="position:relative" class="content_scroll_content">
                      <div class="edit_block_node"></div>
                      <div class="select_controls"></div>
                      <div class="rearrange_controls"></div>
                      <div class="rearrange_insert_rect"></div>
                      <div class="rearrange_grabbed_rect"></div>
                      <div style="padding:25px;overflow:hidden">
                        <div class="newCmsContent newCms_container_content" data-type="html" name="content"></div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>  
          <div class="rearrange_node"></div>
          <div class="clean_output" style="display:none !important"></div>
        </div>
        <link href="/admin/tools/newCms.css?v=${CSS_RELEASE}" rel="stylesheet">
    </div>
  `,
	(modal) => {
		window.newCms = new NewCms(modal);
	}
);
