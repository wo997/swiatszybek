/* js[tool_newCms] */

class NewCmsSelectControls {
	/**
	 * @param {NewCms} newCms
	 */
	constructor(newCms) {
		this.newCms = newCms;
		this.node = this.newCms.container.find(`.select_controls`);
		this.selection_node = this.newCms.container.find(`.selection_node`);
		this.init();

		this.newCms.container.addEventListener("edit", (event) => {
			this.init();
		});
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

		this.selection_node.classList.remove("visible");
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
				(!this.selected_block.select_control ||
					!this.selected_block.select_control.classList.contains(
						"select_active"
					)))
		) {
			this.removeSelection();

			this.selected_block = hovered_block;

			const selected_block = this.selected_block;

			if (selected_block && selected_block.select_control) {
				//selected_block.classList.add("select_active");
				selected_block.select_control.classList.add("select_active");

				this.selection_node.classList.add("visible");
				const rect_data = nodePositionAgainstScrollableParent(selected_block);
				const border_width = 4;
				this.selection_node.style.left =
					rect_data.relative_pos.left - border_width * 0.5 + "px";
				this.selection_node.style.top =
					rect_data.relative_pos.top - border_width * 0.5 + "px";
				this.selection_node.style.width =
					rect_data.node_rect.width + border_width + "px";
				this.selection_node.style.height =
					rect_data.node_rect.height + border_width + "px";
			}
		}

		this.newCms.container.classList.toggle(
			"anything_selected",
			this.selected_block
		);
	}
	//mouseDown() {
	mouseClick() {
		if (this.selected_block && !this.newCms.grabbed_block) {
			this.newCms.edit_block.showControlsToBlock(this.selected_block);
			//this.newCms.grabBlock(this.selected_block);
		}
	}

	addFloatingSelectControls() {
		this.removeSelection();

		let blocks_data = [];
		this.newCms.content_node.findAll(".newCms_block").forEach((block) => {
			if (block.classList.contains("cramped")) {
				return;
			}

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

			left = Math.max(left, 0);
			left = Math.min(
				left,
				this.newCms.content_scroll_content.clientWidth -
					select_control_width -
					0
			);

			top = Math.max(top, 0);
			top = Math.min(
				top,
				this.newCms.content_scroll_content.clientHeight -
					select_control_height -
					0
			);

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
