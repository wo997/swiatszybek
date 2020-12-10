/* js[tool_newCms] */

// dependencies
useTool("fileManager");
//useTool("quillEditor"); // TODO: get it to work, should be a module, well, fuck it xd

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

		this.content_node_copy = this.container.find(`.newCmsContent_copy`);

		this.initEditBlock();
		this.initQuillEditor();
		this.initFloatingSelectControls();
		this.initFloatingRearrangeControls();
		this.initListenChange();
		this.initStyling();

		this.initGrids();

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

		/*this.container.addEventListener(
                IS_MOBILE ? "click" : "mousedown",
                (event) => {
                    this.updateMouseCoords(event);
                    this.mouseDown();
                }
            );*/

		this.container.addEventListener("click", (event) => {
			this.updateMouseCoords(event);
			this.mouseClick();
		});

		/*this.container.addEventListener(
                IS_MOBILE ? "touchend" : "mouseup",
                (event) => {
                    this.updateMouseCoords(event);
                    this.mouseUp();
                }
            );*/

		this.content_scroll_panel.addEventListener("scroll", () => {
			this.scroll();
		});

		window.addEventListener("resize", () => {
			if (this.grabbed_block) {
				this.rearrange_controls.addFloatingRearrangeControls(
					this.grabbed_block
				);
			} else {
				this.select_controls.addFloatingSelectControls();
			}
		});

		this.container.addEventListener("clean_up_output", () => {
			this.clean_output_node.findAll(".to_remove").forEach((e) => {
				e.remove();
			});
		});
	}

	stylesLoaded() {
		this.container.dispatchEvent(new Event("styles_loaded"));
	}

	initGrids() {
		this.container.addEventListener("clean_up_output", () => {
			this.cleanupGrids(this.clean_output_node);
		});
	}

	initStyling() {
		this.styling = new NewCmsStyling(this);
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
			this.container.find(".quill_editor"),
			this
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

		this.styling.init();

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

		this.select_controls.node.classList.remove("visible");

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
		setTimeout(() => {
			this.select_controls.addFloatingSelectControls();
			this.select_controls.node.classList.add("visible");
		}, 50);

		this.updateMouseTarget();
		this.mouseMove();
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
		} else {
			this.select_controls.mouseMove();
		}
	}
	//mouseDown() {
	mouseClick() {
		if (this.grabbed_block) {
			this.releaseBlock();
			return;
		}

		if (!this.edit_block.select_node) {
			this.select_controls.mouseClick();
		}

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

	/*mouseUp() {
		if (this.grabbed_block) {
			this.releaseBlock();
		}
	}*/

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
		this.manageGrids();

		// temporary
		this.content_node.findAll("img").forEach((e) => {
			if (!e.style.width) {
				e.style.width = e.getBoundingClientRect().width + "px";
			}
		});

		this.select_controls.addFloatingSelectControls();

		if (nonull(options.trigger_change, true) === true) {
			this.content_node.dispatchChange();
		}
		this.content_change_triggered = false;
		this.content_node.findAll(".to_remove").forEach((e) => {
			e.remove();
		});
	}

	cleanupGrids(node = null) {
		if (node === null) {
			node = this.content_node;
		}

		node.findAll(`.grid_wireframe_line`).forEach((e) => {
			e.remove();
		});
	}

	manageGrids() {
		this.cleanupGrids();

		const any_grid = this.content_node.find(`.newCms_block[data-block="grid"]`);
		if (!any_grid) {
			return;
		}
		const scrollable_parent = any_grid.findScrollParent({
			default: document.body,
		});
		const scrollable_parent_rect = scrollable_parent.getBoundingClientRect();

		const off_x = scrollable_parent_rect.left + scrollable_parent.scrollLeft;
		const off_y = scrollable_parent_rect.top + scrollable_parent.scrollTop;

		this.content_node
			.findAll(`.newCms_block[data-block="grid"]`)
			.forEach((grid) => {
				// TODO: retrieve from grid props
				const columns = 3;
				const rows = 2;

				const block_content = grid.find(".newCms_block_content");

				const grid_rect = grid.getBoundingClientRect();

				let x_coords = [];
				for (let column = 1; column < columns + 1; column++) {
					const grid_wireframe = document.createElement("DIV");

					grid_wireframe.style.gridArea = `${1}/${column}/${rows + 1}/${
						column + 1
					}`;

					block_content.appendChild(grid_wireframe);

					const grid_wireframe_rect = grid_wireframe.getBoundingClientRect();

					if (column === 1) {
						grid_wireframe.classList.add("grid_wireframe_line_left");
						x_coords.push(grid_wireframe_rect.left - grid_rect.left);
					}
					grid_wireframe.classList.add("grid_wireframe_line");
					grid_wireframe.classList.add("grid_wireframe_line_right");
					x_coords.push(
						grid_wireframe_rect.left +
							grid_wireframe_rect.width -
							grid_rect.left
					);
				}

				let y_coords = [];
				for (let row = 1; row < rows + 1; row++) {
					const grid_wireframe = document.createElement("DIV");

					grid_wireframe.style.gridArea = `${row}/${1}/${row + 1}/${
						columns + 1
					}`;

					block_content.appendChild(grid_wireframe);

					const grid_wireframe_rect = grid_wireframe.getBoundingClientRect();

					if (row === 1) {
						grid_wireframe.classList.add("grid_wireframe_line_top");
						y_coords.push(grid_wireframe_rect.top - grid_rect.top);
					}
					grid_wireframe.classList.add("grid_wireframe_line");
					grid_wireframe.classList.add("grid_wireframe_line_bottom");
					y_coords.push(
						grid_wireframe_rect.top + grid_wireframe_rect.height - grid_rect.top
					);
				}

				grid.grid_data = {
					x_coords,
					y_coords,
				};
			});
	}

	insertMissingQlClasses() {
		// TODO: should we use it on the whole container instead? probably no XD
		this.content_node
			.findAll(`.newCms_block[data-block="quill_editor"]`)
			.forEach((newCms_block) => {
				const newCms_block_content = newCms_block.find(".newCms_block_content");
				newCms_block_content.classList.add("ql-editor");
				newCms_block_content.parent().classList.add("ql-snow");
			});
	}

	getBlockHtml(type, options = {}) {
		//let content = "";
		let class_list = [];

		let content_html = "";

		// TODO: event listeners
		if (type === "quill_editor") {
			content_html = /*html*/ `<div class="newCms_block_content ql-editor"></div>`;
		} else if (type === "image") {
			content_html = /*html*/ `<img class="newCms_block_content wo997_img">`;
		} else if (type === "video") {
			// TODO: just do it
			content_html = /*html*/ `<div class="newCms_block_content"></div>`;
		} else if (type === "container") {
			class_list.push("container");
			content_html = /*html*/ `<div class="newCms_block_content container"></div>`;
		} else if (type === "grid") {
			class_list.push("container");
			content_html = /*html*/ `<div class="newCms_block_content"></div>`;
		}

		return /*html*/ `
      <div class="newCms_block ${class_list.join(" ")}" data-block="${type}">
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
		/*const duration = 300;
		this.lockInput();
		zoomNode(block, "out", {
			duration: duration,
			callback: () => {
				block.remove();
				this.contentChange();
				this.unlockInput();
			},
        });*/

		this.beforeContentAnimation();

		block.classList.add("cramped");

		const all_animatable_blocks = this.afterContentAnimation();

		block.classList.add("animation_cramp");

		this.animateContent(all_animatable_blocks, 350, {
			beforeAnimationEndCallback() {
				block.classList.remove("animation_cramp");
			},
			callback() {
				block.classList.add("to_remove");
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

		/*this.grabbed_node_scroll_parent = this.source_grabbed_node.findScrollParent(
			{ default: document.body }
		);*/

		this.source_grabbed_node.appendChild(
			newCms.rearrange_controls.rearrange_grabbed_rect_node
		);

		this.grabbed_block = $(block);
		this.grabbed_block.classList.add("grabbed");
		this.grabbed_mouse_x = this.mouse_x;
		this.grabbed_mouse_y = this.mouse_y;
		//this.grabbed_scroll_top = this.grabbed_node_scroll_parent.scrollTop;
		this.grabbed_scroll_top = this.content_scroll_panel.scrollTop;

		this.container.classList.add("grabbed_block");

		this.rearrange_controls.node.classList.add("visible");
		//this.select_controls.node.classList.remove("blocks_visible");

		// show the grabbed clone
		const rearrange_node = this.rearrange_node;
		rearrange_node.setContent(this.grabbed_block.outerHTML);
		this.rearrange_node_block_inside = rearrange_node.find("*");
		const grabbed_block_rect = this.grabbed_block.getBoundingClientRect();
		rearrange_node.style.left = grabbed_block_rect.left + "px";
		rearrange_node.style.top = grabbed_block_rect.top + "px";
		this.rearrange_node_block_inside.style.width =
			grabbed_block_rect.width + "px";
		this.rearrange_node_block_inside.style.height =
			grabbed_block_rect.height + "px";
		rearrange_node.classList.add("visible");

		this.rearrange_controls.addFloatingRearrangeControls(this.grabbed_block);

		this.grab_animation_speed = 0;
		delete this.grabbed_block.animation_data;
		this.grabAnimation();
	}

	unselectFirstGridNode() {
		this.rearrange_grid_first_node = null;
		this.grab_animation_speed = 0;

		newCms.content_scroll_content
			.findAll(".rearrange_control.unavailable")
			.forEach((control) => {
				control.classList.remove("unavailable");
			});

		newCms.content_scroll_content
			.findAll(".rearrange_control.first_grid_node")
			.forEach((control) => {
				control.classList.remove("first_grid_node");
			});
	}

	releaseBlock() {
		let grabbed_block = this.grabbed_block;
		if (!grabbed_block) {
			return;
		}

		// if it's in a grid u wanna go for 2 steps
		let rearrange_grid_first_node_ref = null;
		let rearrange_grid_second_node_ref = null;
		if (
			this.rearrange_controls.rearrange_near_block &&
			this.rearrange_controls.rearrange_position == "grid"
		) {
			if (!this.rearrange_grid_first_node) {
				this.rearrange_grid_first_node = this.rearrange_controls.rearrange_control_node;
				this.grab_animation_speed = 0;

				const fst = newCms.rearrange_grid_first_node;
				fst.classList.add("first_grid_node");

				newCms.content_scroll_content
					.findAll(".rearrange_control:not(.first_grid_node)")
					.forEach((control) => {
						control.classList.toggle(
							"unavailable",
							control.position !== "grid" ||
								control.rearrange_near_block !== fst.rearrange_near_block ||
								control.grid_position.column === fst.grid_position.column ||
								control.grid_position.row === fst.grid_position.row
						);
					});

				this.updateMouseTarget();
				this.mouseMove();

				return;
			} else {
				if (
					this.rearrange_grid_first_node ===
					this.rearrange_controls.rearrange_control_node
				) {
					this.unselectFirstGridNode();
					return;
				}
				rearrange_grid_first_node_ref = this.rearrange_grid_first_node;
				rearrange_grid_second_node_ref = this.rearrange_controls
					.rearrange_control_node;

				this.unselectFirstGridNode();

				grabbed_block.last_rect.width = grabbed_block.animation_data.w;
				grabbed_block.last_rect.height = grabbed_block.animation_data.h;
			}
		}

		if (this.rearrange_grid_first_node) {
			this.unselectFirstGridNode();
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

				grabbed_block.last_rect.width = grabbed_block.animation_data.w;
				grabbed_block.last_rect.height = grabbed_block.animation_data.h;
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
			} else if (this.rearrange_controls.rearrange_position == "grid") {
				this.rearrange_controls.rearrange_near_block
					.find(".newCms_block_content")
					.appendChild(grabbed_block);

				const fst = rearrange_grid_first_node_ref.grid_position;
				const scd = rearrange_grid_second_node_ref.grid_position;

				const r1 = Math.min(fst.row, scd.row);
				const r2 = Math.max(fst.row, scd.row);
				const c1 = Math.min(fst.column, scd.column);
				const c2 = Math.max(fst.column, scd.column);

				grabbed_block.style.gridArea = `${r1}/${c1}/${r2}/${c2}`;
			} else {
				let before_node = this.rearrange_controls.rearrange_near_block;
				if (this.rearrange_controls.rearrange_position == "after") {
					before_node = before_node.next();
				}

				this.rearrange_controls.rearrange_near_block
					.parent()
					.insertBefore(grabbed_block, before_node);
			}

			this.styling.registerMissingBlocks();
		}

		const all_animatable_blocks = this.afterContentAnimation();

		this.animateContent(all_animatable_blocks, 350);
	}

	beforeContentAnimation() {
		this.content_node.findAll(".newCms_block").forEach((block) => {
			if (!block.last_rect) {
				block.last_rect = block.getBoundingClientRect();
			}
		});
	}

	afterContentAnimation() {
		const all_animatable_blocks = this.content_node
			.findAll(".newCms_block")
			.filter((block) => {
				if (block.last_rect) {
					block.new_rect = block.getBoundingClientRect();
					if (!block.animation_data) {
						block.animation_data = { dx: 0, dy: 0 };
					}
					if (block.classList.contains("container")) {
						const newCms_block_content = block.find(".newCms_block_content");
						newCms_block_content.new_rect = newCms_block_content.getBoundingClientRect();
					}

					return true;
				} else {
					return false;
				}
			});

		all_animatable_blocks.forEach((block) => {
			const dx = block.last_rect.left - block.new_rect.left;
			const dy = block.last_rect.top - block.new_rect.top;

			block.animation_data.dx += dx;
			block.animation_data.dy += dy;

			block
				.find(".newCms_block_content")
				.directChildren()
				.forEach((sub_block) => {
					if (sub_block.animation_data) {
						sub_block.animation_data.dx -= dx;
						sub_block.animation_data.dy -= dy;
					}
				});
		});

		// copy overlay to hide layout update
		this.content_node_copy.setContent(this.content_node.innerHTML);
		this.content_node_copy.findAll("*").forEach((e) => {
			// itd why rly sry
			e.style.animation = "";
		});

		const content_padding = parseInt(
			getComputedStyle(document.documentElement).getPropertyValue(
				"--content_padding"
			)
		);

		const content_node_rect = this.content_node.getBoundingClientRect();
		this.content_node_copy.style.left =
			content_node_rect.left - content_padding + "px";
		this.content_node_copy.style.top =
			content_node_rect.top - content_padding + "px";
		this.content_node_copy.style.width =
			content_node_rect.width + 2 * content_padding + "px";
		this.content_node_copy.style.height =
			content_node_rect.height + 2 * content_padding + "px";

		return all_animatable_blocks;
	}

	animateContent(all_animatable_blocks, duration, options = {}) {
		this.container.classList.add("animating_rearrangement");

		const finishAnimation = () => {
			this.content_node_copy.classList.add("visible");
			setTimeout(() => {
				if (options.beforeAnimationEndCallback) {
					options.beforeAnimationEndCallback();
				}

				// browser needs time to render it again
				this.container.classList.remove("animating_rearrangement");
				this.content_node_copy.classList.remove("visible");

				this.contentChange();

				// not needed cause we set it to user-select none bro
				//removeUserSelection();

				this.updateMouseTarget();
				this.mouseMove();

				// not used so far
				if (options.callback) {
					options.callback();
				}
			}, 100);
		};

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

			const dx = block.animation_data.dx - half_dw;
			const dy = block.animation_data.dy - half_dh;

			const parent_rect = block.parent().new_rect;

			const kisses_right_border = parent_rect
				? Math.abs(
						block.last_rect.left +
							block.last_rect.width +
							mr -
							(parent_rect.left + parent_rect.width)
				  ) < 5
				: false;

			// give flexbox some space baby
			const subtract_mr = kisses_right_border ? 2 : 0;

			const fg = block.style.flexGrow;
			block.style.flexGrow = "0";

			const animation_cramp = block.classList.contains("animation_cramp");

			let keyframes = "";

			if (animation_cramp) {
				const half_w = block.last_rect.width * 0.5;
				const half_h = block.last_rect.height * 0.5;

				keyframes = `
                    0% {
                        transform-origin: center;
                        transform: translate(${dx}px, ${dy}px) scale(1);
                        margin: ${mt0}px ${mr0}px ${mb0}px ${ml0}px;
                        width: ${block.last_rect.width}px;
                        height: ${block.last_rect.height}px;
                    }
                    100% {
                        transform-origin: center;
                        transform: translate(${dx}px, ${dy}px) scale(0);
                        margin: -${half_h}px -${half_w}px;
                        width: ${block.last_rect.width}px;
                        height: ${block.last_rect.height}px;
                    }
                `;
			} else {
				keyframes = `
                    0% {
                        transform: translate(${dx}px, ${dy}px);
                        width: ${block.last_rect.width}px;
                        height: ${block.last_rect.height}px;
                        margin: ${mt0}px 
                                ${mr0 - subtract_mr}px ${mb0}px ${ml0}px;
                    }
                    100% {
                        transform: translate(0px, 0px);
                        width: ${block.new_rect.width}px;
                        height: ${block.new_rect.height}px;
                        margin: ${mt}px
                                ${mr - subtract_mr}px ${mb}px ${ml}px;
                    }
                `;
			}

			// I am sorry for that workaround, but as we go to 90% the animation
			// freezes so we can be sure nothing will jump like crazy for a single frame,
			// the proper solution - css transition "forwards" didn't seem to work
			animate(block, keyframes, duration, () => {
				block.style.flexGrow = fg;
			});

			delete block.animation_data;
			delete block.last_rect;
		});

		setTimeout(() => {
			finishAnimation();
		}, duration);

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

			if (this.grab_animation_speed < 1) {
				this.grab_animation_speed += 0.03;
			} else {
				this.grab_animation_speed = 1;
			}
			const acc = this.grab_animation_speed;

			let target_dx = 0;
			let target_dy = 0;

			const gb_rect = grabbed_block.last_rect;
			const base_w = gb_rect.width;
			const base_h = gb_rect.height;
			let target_w = base_w;
			let target_h = base_h;

			if (!grabbed_block.animation_data) {
				grabbed_block.animation_data = { dx: 0, dy: 0, w: base_w, h: base_h };
			}

			const grabbed_block_rect = grabbed_block.getBoundingClientRect(); // cant reuse cause we change dimensions

			const is_side_block = this.grabbed_block.classList.contains("side_block");

			if (this.rearrange_grid_first_node) {
				// hanging laundry
				const rearrange_grid_first_node_actual_position = this
					.rearrange_grid_first_node.actual_position;
				const rearrange_grid_first_node_scroll_parent = this.rearrange_grid_first_node.findScrollParent();
				const rearrange_grid_first_node_scroll_parent_rect = rearrange_grid_first_node_scroll_parent.getBoundingClientRect();

				target_dx =
					rearrange_grid_first_node_actual_position.left -
					grabbed_block_rect.left;
				target_dy =
					rearrange_grid_first_node_actual_position.top -
					grabbed_block_rect.top;

				target_w =
					this.mouse_x - rearrange_grid_first_node_actual_position.left;
				target_h = this.mouse_y - rearrange_grid_first_node_actual_position.top;

				const scr_dx = this.content_scroll_panel.scrollLeft;
				const scr_dy =
					this.content_scroll_panel.scrollTop - this.grabbed_scroll_top;

				const scr_pos_factor = is_side_block ? -1 : -2;

				target_w += scr_dx;
				target_h += scr_dy;
				target_dx += scr_pos_factor * scr_dx;
				target_dy += scr_pos_factor * scr_dy;

				const min_w = is_side_block ? 140 : Math.max(50, Math.min(base_w, 150));
				if (target_w < -min_w) {
					target_dx += target_w;
					target_w = -target_w;
				} else if (target_w < min_w) {
					target_dx += (target_w - min_w) * 0.5;
					target_w = min_w;
				}

				const min_h = is_side_block ? 50 : Math.max(50, Math.min(base_h, 150));
				if (target_h < -min_h) {
					target_dy += target_h;
					target_h = -target_h;
				} else if (target_h < min_h) {
					target_dy += (target_h - min_h) * 0.5;
					target_h = min_h;
				}
			} else {
				// pull center to the cursor
				target_dx =
					this.mouse_x - (gb_rect.left + grabbed_block_rect.width * 0.5);
				target_dy =
					this.mouse_y - (gb_rect.top + grabbed_block_rect.height * 0.5);
			}

			grabbed_block.animation_data.dx =
				grabbed_block.animation_data.dx * (1 - acc) + target_dx * acc;
			grabbed_block.animation_data.dy =
				grabbed_block.animation_data.dy * (1 - acc) + target_dy * acc;

			grabbed_block.animation_data.w =
				grabbed_block.animation_data.w * (1 - acc) + target_w * acc;
			grabbed_block.animation_data.h =
				grabbed_block.animation_data.h * (1 - acc) + target_h * acc;

			let set_w = grabbed_block.animation_data.w;
			let set_h = grabbed_block.animation_data.h;

			const side_block_side_padding = parseInt(
				getComputedStyle(document.documentElement).getPropertyValue(
					"--side_block_side_padding"
				)
			);

			if (is_side_block) {
				this.rearrange_node_block_inside.style.padding =
					"0 " + ((set_w - base_w) * 0.5 + side_block_side_padding) + "px";
			}

			this.rearrange_node_block_inside.style.width = set_w + "px";
			this.rearrange_node_block_inside.style.height = set_h + "px";

			this.rearrange_node.style.transform = `
                translate(
                    ${grabbed_block.animation_data.dx.toPrecision(5)}px,
                    ${grabbed_block.animation_data.dy.toPrecision(5)}px
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

window.init_tool_js_newCms = () => {
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
                            <div class="side_block" data-block="grid">
                                <i class="fas fa-border-all"></i>
                                <span>Siatka</span>
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
                        <div style="padding:var(--content_padding);overflow:hidden;position:relative">
                            <!-- newCms_block_content class is temporary, it prevents margin collapsing, later u wanna for for sections etc-->
                            <div class="newCmsContent newCms_block_content" data-type="html" name="content"></div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>  
            <div class="rearrange_node"></div>
            <div class="clean_output" style="display:none !important"></div>
            <div style="position:absolute;width:100%;height:100%;left:0;top:0;overflow:hidden;pointer-events:none">
                <div class="newCmsContent_copy newCms_block_content"></div>
            </div>
            </div>
        </div>`,
		(modal) => {
			window.newCms = new NewCms(modal);
		}
	);
};

window.init_tool_fully_newCms = () => {
	newCms.stylesLoaded();
};
