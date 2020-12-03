export default class FloatingRearrangeControls {
	constructor(newCms) {
		/** @type {NewCms} */
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
			if (options.except && options.except.includes(e)) {
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
				parent_container = rearrange_near_block.findParentByClassName(
					"container",
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
			} else if (rearrange_near_block.classList.contains("container")) {
				const near_block_type = rearrange_near_block.getAttribute("data-block");
				if (near_block_type === "container") {
					rearrange_position = "inside";
					rearrange_control_node =
						rearrange_near_block.rearrange_control_inside;
					parent_container = rearrange_near_block;
				} else if (near_block_type === "grid") {
					let smallest_sq_distance = 10000; // magnetic 100px
					let smallest_sq_distance_control = null;
					newCms.content_scroll_content
						.findAll(
							".rearrange_control:not(.unavailable):not(.first_grid_node)"
						)
						.forEach((control) => {
							if (
								control.position !== "grid" ||
								control.rearrange_near_block !== rearrange_near_block
							) {
								return;
							}

							const dx =
								control.actual_position.left -
								this.newCms.content_scroll_panel.scrollLeft -
								this.newCms.mouse_x;

							const dy =
								control.actual_position.top -
								this.newCms.content_scroll_panel.scrollTop -
								this.newCms.mouse_y +
								this.newCms.grabbed_scroll_top;
							const sq_distance = dx * dx + dy * dy;

							if (sq_distance < smallest_sq_distance) {
								smallest_sq_distance = sq_distance;
								smallest_sq_distance_control = control;
							}
						});

					if (smallest_sq_distance_control) {
						rearrange_control_node = smallest_sq_distance_control;
						rearrange_position = "grid";
					}
				}
			} else if (!this.newCms.rearrange_grid_first_node) {
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
					rearrange_control_node = rearrange_near_block.rearrange_control_after;
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
				} else if (["before", "after"].includes(rearrange_position)) {
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

		this.node.empty();

		this.addBlockControls(block);
	}

	addBlockControls(block) {
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

				const block_type = block.getAttribute("data-block");

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

				const parent_container = block.findParentByClassName("container", {
					skip: 1,
				});

				if (
					parent_container &&
					parent_container.getAttribute("data-block") === "grid"
				) {
					// no befores and afters in a grid, just laundry
					return;
				}

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
					(block.find(".newCms_block") || block_type != "container")
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

				const index =
					block_rect_data.relative_pos.top +
					parent_count -
					(position == "inside" ? 100 : 0); // prefer insides

				blocks_data.push({
					index: index,
					block: block,
					rect_data: block_rect_data,
					is_parent_row: is_parent_row,
					position: position,
				});
			});
		};

		this.newCms.content_node.findAll(".newCms_block").forEach((block) => {
			block.rearrange_control_before = null;
			block.rearrange_control_after = null;
			block.rearrange_control_inside = null;
		});

		// grids first ;)
		this.newCms.content_node
			.findAll(`.newCms_block[data-block="grid"]`)
			.forEach((block) => {
				if (!block.grid_data || block == this.newCms.grabbed_block) {
					return;
				}

				const parent_container = block.findParentByClassName("container", {
					skip: 1,
				});

				const is_parent_row = parent_container
					? parent_container.classList.contains("container_row")
					: false;

				const block_rect_data = nodePositionAgainstScrollableParent(block);

				const x_coords = block.grid_data.x_coords;
				const y_coords = block.grid_data.y_coords;

				for (let xi = 0; xi < x_coords.length; xi++) {
					for (let yi = 0; yi < y_coords.length; yi++) {
						let left = x_coords[xi];
						let top = y_coords[yi];

						const actual_position = {
							left: block_rect_data.node_rect.left + left,
							top: block_rect_data.node_rect.top + top,
						};

						if (xi === x_coords.length - 1) {
							left -= rearrange_control_width;
						} else if (xi !== 0) {
							left -= rearrange_control_width * 0.5;
						}

						if (yi === y_coords.length - 1) {
							top -= rearrange_control_height;
						} else if (yi !== 0) {
							top -= rearrange_control_height * 0.5;
						}

						// TODO: xy, yi should be stored in blocks_data, ezy
						let block_rect_data_copy = {
							node_rect: {},
							relative_pos: {},
							scrollable_parent: {},
							scrollable_parent_rect: {},
						};

						block_rect_data_copy = deepMerge(
							block_rect_data_copy,
							block_rect_data
						);

						block_rect_data_copy.relative_pos.left += left;
						block_rect_data_copy.relative_pos.top += top;

						const index = block_rect_data_copy.relative_pos.top - 100; // these are important
						blocks_data.push({
							index: index,
							top: top,
							block: block,
							rect_data: block_rect_data_copy,
							is_parent_row: is_parent_row,
							position: "grid",
							xi: xi,
							yi: yi,
							actual_position: actual_position,
						});
					}
				}
			});

		addControls("inside");
		addControls("before");
		addControls("after");

		const sorted_blocks_data = blocks_data.sort((a, b) => {
			return Math.sign(a.index - b.index);
		});

		const sorted_blocks_data_length = sorted_blocks_data.length;
		//let upper_bound = 0;

		for (let i = 0; i < sorted_blocks_data_length; i++) {
			delete block.rearrange_control_before;
			delete block.rearrange_control_after;
		}

		for (let i = 0; i < sorted_blocks_data_length; i++) {
			const block_data = sorted_blocks_data[i];
			const block = block_data.block;

			let left = block_data.rect_data.relative_pos.left;
			let top = block_data.rect_data.relative_pos.top;

			left = Math.max(left, 5);
			left = Math.min(
				left,
				this.newCms.content_scroll_content.clientWidth -
					rearrange_control_width -
					5
			);

			top = Math.max(top, 5);
			top = Math.min(
				top,
				this.newCms.content_scroll_content.clientHeight -
					rearrange_control_height -
					5
			);

			let moving = true;
			while (moving) {
				moving = false;
				for (let u = 0; u < i; u++) {
					const prev_block_data = sorted_blocks_data[u];

					if (
						prev_block_data.rect_data.relative_pos.top <
							top + rearrange_control_height - 1 &&
						prev_block_data.rect_data.relative_pos.top +
							rearrange_control_height -
							1 >
							top &&
						prev_block_data.rect_data.relative_pos.left <
							left + rearrange_control_width - 1 &&
						prev_block_data.rect_data.relative_pos.left +
							rearrange_control_width -
							1 >
							left
					) {
						if (block_data.position === "after") {
							// go left
							left =
								prev_block_data.rect_data.relative_pos.left -
								rearrange_control_width;
						} else if (
							["before", "inside", "grid"].includes(block_data.position)
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

			if (block_data.position == "grid") {
				rearrange_control.classList.add("grid_control");
				rearrange_control_html = `<div style='width:6px;height:6px;border-radius:50%;background:black'></div>`;
				rearrange_control.classList.add("insert_inside");
				rearrange_control.grid_position = {
					column: block_data.xi + 1,
					row: block_data.yi + 1,
				};
				rearrange_control.actual_position = block_data.actual_position;
			} else if (block_data.position == "inside") {
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
