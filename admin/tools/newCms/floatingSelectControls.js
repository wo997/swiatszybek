/* js[tool_newCms] */

/**
 * @typedef {{
 * block: PiepNode
 * select_block: PiepNode} & PiepNode} SelectControl
 */

class NewCmsSelectControls {
	/** @param {NewCms} newCms */
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
		/** @type {NewCmsBlock} */
		this.selected_block = null;
		this.node.classList.add("visible");
		this.removeSelection();
	}

	removeSelection() {
		this.newCms.container.findAll(".select_active").forEach((e) => {
			e.classList.remove("select_active");
		});

		this.selection_node.classList.remove("visible");
		this.newCms.svg.empty();
	}

	mouseMove() {
		const target = this.newCms.mouse_target;

		let hovered_block = null;

		/** @type {SelectControl} */
		// @ts-ignore
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

			// @ts-ignore
			this.selected_block = hovered_block;

			const selected_block = this.selected_block;

			if (selected_block && selected_block.select_control) {
				//selected_block.classList.add("select_active");
				selected_block.classList.add("select_active");

				selected_block.select_control.classList.add("select_active");

				this.selection_node.classList.add("visible");
				const rect_data = nodePositionAgainstScrollableParent(selected_block);
				const border_width = 4;
				const width = rect_data.node_rect.width;
				const height = rect_data.node_rect.height;
				const left = rect_data.relative_pos.left;
				const top = rect_data.relative_pos.top;
				const right = left + width;
				const bottom = top + height;
				this.selection_node.style.left = left - border_width * 0.5 + "px";
				this.selection_node.style.top = top - border_width * 0.5 + "px";
				this.selection_node.style.width = width + border_width + "px";
				this.selection_node.style.height = height + border_width + "px";

				const block_styles = this.newCms.styling.getBlockComputedStyles(
					this.selected_block
				);
				const mt = evalCss(
					block_styles.outside["margin-top"],
					this.selection_node
				);
				const mr = evalCss(
					block_styles.outside["margin-right"],
					this.selection_node
				);
				const mb = evalCss(
					block_styles.outside["margin-bottom"],
					this.selection_node
				);
				const ml = evalCss(
					block_styles.outside["margin-left"],
					this.selection_node
				);
				//console.log(mt, mr, mb, ml);

				let paths = "";

				const addQuadrangle = (
					x1,
					y1,
					x2,
					y2,
					x3,
					y3,
					x4,
					y4,
					invert,
					type
				) => {
					let clr;
					if (type == "margin") {
						clr = invert > 0 ? "fa05" : "c005";
					} else {
						clr = "0c05";
					}

					return /*html*/ `<path
                        d="
                            M ${x1},${y1}
                            L ${x2},${y2}
                            L ${x3},${y3}
                            L ${x4},${y4}
                            Z
                        "
                        fill="#${clr}"
                        />
                        `;

					//stroke="#0003"
					//stroke-width="2"
					//stroke-dasharray="10 5"
				};

				// left
				paths += addQuadrangle(
					left,
					top,
					left,
					bottom,
					left - ml,
					bottom + mb,
					left - ml,
					top - mt,
					ml,
					"margin"
				);

				// right
				paths += addQuadrangle(
					right,
					top,
					right,
					bottom,
					right + mr,
					bottom + mb,
					right + mr,
					top - mt,
					mr,
					"margin"
				);

				// top
				paths += addQuadrangle(
					left,
					top,
					right,
					top,
					right + mr,
					top - mt,
					left - ml,
					top - mt,
					mt,
					"margin"
				);

				// bottom
				paths += addQuadrangle(
					left,
					bottom,
					right,
					bottom,
					right + mr,
					bottom + mb,
					left - ml,
					bottom + mb,
					mb,
					"margin"
				);

				this.newCms.svg.setContent(/*html*/ `
                    ${paths}
                `);
			}
		}

		this.newCms.container.classList.toggle(
			"anything_selected",
			!!this.selected_block
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

		const blocks = this.newCms.content_node.findAll(
			".newCms_block:not(.cramped):not(.parent_cramped)"
		);

		let blocks_data = [];
		blocks.forEach((block) => {
			const block_rect_data = nodePositionAgainstScrollableParent(block);

			let parent_count = 0;
			let parent = block;
			while (parent != this.newCms.content_node) {
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

			/** @type {SelectControl} */
			// @ts-ignore
			const select_control = $(document.createElement("DIV"));
			select_control.classList.add("select_control");
			select_control.style.left = left + "px";
			select_control.style.top = top + "px";

			select_control.block = block;
			block.select_control = select_control;

			const block_type = block.dataset.block;

			select_control.dataset.block = block_type;

			const icon = $(`.side_block[data-block="${block_type}"] i`);

			select_control.setContent(
				icon ? icon.outerHTML : `<i class="fas fa-square"></i>`
			);

			block.select_control = select_control;
			select_control.select_block = block;

			this.node.appendChild(select_control);
		}

		this.node.classList.remove("non_clickable");
	}
}
