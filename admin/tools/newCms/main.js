/* js[tool_newCms] */

// dependencies
useTool("fileManager");
//useTool("quillEditor"); // TODO: get it to work, should be a module, well, fuck it xd

/**
 * @typedef {{
 * animation_data: AnimationData
 * last_rect: ClientRect
 * new_rect: ClientRect
 * rearrange_control_before: RearrangeControl
 * rearrange_control_after: RearrangeControl
 * rearrange_control_inside: RearrangeControl
 * getNextBlock(): NewCmsBlock
 * getPrevBlock(): NewCmsBlock
 * select_control: PiepNode
 * styling_data: BlockStyles
 * } & PiepNode} NewCmsBlock
 */

/**
 * @typedef {{
 * x_coords
 * y_coords}} GridData
 */

/**
 * @typedef {{
 * grid_data} & NewCmsBlock} NewCmsGrid
 */

/**
 * @typedef {{
 * dx
 * dy
 * w
 * h
 * margin_left
 * margin_top}} AnimationData
 */

class NewCms {
	constructor(container) {
		this.container = $(container);
		this.content_node = this.container.find(`.newCmsContent`);
		this.content_scroll_panel = this.container.find(`.content_scroll_panel`);
		this.content_scroll_content = this.container.find(
			`.content_scroll_content`
		);
		this.rearrange_node = this.container.find(`.rearrange_node`);
		this.clean_output_node = this.container.find(`.clean_output`);
		this.content_node_copy = this.container.find(`.newCmsContent_copy`);

		this.mouse_x = 0;
		this.mouse_y = 0;
		this.mouse_dx = 0;
		this.mouse_dy = 0;
		/** @type {PiepNode} */
		this.mouse_target = null;
		this.last_content_scroll_top = 0;

		this.grab_options = {};

		/** @type {NewCmsBlock} */
		this.grabbed_block = null;

		this.initStyling();
		this.initSidebar();
		this.initTrashBlock();
		this.initEditBlock();
		this.initQuillEditor();
		this.initFloatingSelectControls();
		this.initFloatingRearrangeControls();
		this.initHistory();
		this.initGrids();
		this.initMargins();

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

		this.container.addEventListener("mousedown", (event) => {
			this.mouse_left_btn = event.buttons === 1;
		});

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

		this.container.addEventListener("contextmenu", (event) => {
			this.mouse_left_btn = false;
			if (this.grabbed_block) {
				this.rearrange_controls.removeRearrangement();
				this.releaseBlock();
				event.preventDefault();
				return false;
			}
		});

		this.content_scroll_panel.addEventListener(
			"wheel",
			(event) => {
				const dy_bottom = this.getBottomScrollOffset();

				if (event && event.deltaY !== null) {
					if (dy_bottom - event.deltaY < 0 && event.deltaY >= 0) {
						event.preventDefault();
					}
				}
			},
			{
				// allow preventDefault()
				passive: false,
			}
		);

		this.content_scroll_panel.addEventListener("scroll", () => {
			this.scroll();
		});

		window.addEventListener("resize", () => {
			this.onResize();
		});

		this.container.addEventListener("clean_up_output", () => {
			this.clean_output_node.findAll(".to_remove").forEach((e) => {
				e.remove();
			});

			// TODO: be careful with that
			this.clean_output_node.findAll(".newCms_block").forEach((e) => {
				e.removeAttribute("style");
			});
		});

		this.container
			.find(".return_btn")
			.setAttribute("href", `${STATIC_URLS["ADMIN"]}nowe-strony`);
	}

	getBottomScrollOffset() {
		const inner_rect = this.content_node.getBoundingClientRect();
		const wrap_rect = this.content_scroll_panel.getBoundingClientRect();

		return (
			inner_rect.height -
			(this.content_scroll_panel.scrollTop + wrap_rect.height)
		);
	}

	onResize(options = {}) {
		this.manageGrids();

		if (this.grabbed_block) {
			this.rearrange_controls.addFloatingRearrangeControls(this.grabbed_block);
		} else {
			this.select_controls.addFloatingSelectControls();
		}

		if (options.source != "styling") {
			this.styling.setResponsiveContainerSize();
		}
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
		this.styling = new NewCmsStyling(this, this.container.find(".styles_node"));
	}

	initTrashBlock() {
		this.trash_block = new NewCmsTrashBlock(
			this,
			this.container.find(".trash_block")
		);
	}
	initMargins() {
		const margin = this.sidebar.node.find(`.margin`);
		// @ts-ignore
		this.insertMarginControl(margin, "margin", {});

		margin.findAll("c-select").forEach((e) => {
			const input = e.find("input");
			const dir = input.dataset.dir;

			input.addEventListener("change", () => {
				let styles = {};
				//styles[`margin${dir.capitalize()}`] = input.getValue();
				styles[`margin-${dir}`] = input.getValue();

				this.styling.setBlockStyles(styles, null, {
					type: "desktop",
				});

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
	initHistory() {
		this.container.addEventListener("after_set_form_data", (event) => {
			this.contentChange({
				quiet: true,
			});

			/** @type {NewCmsBlock} */
			// @ts-ignore
			const edit_block = this.content_node.find(".edit_active");
			if (edit_block) {
				this.edit_block.editBlock(edit_block, {
					duration: 0,
					quiet: true,
				});
			} else {
				this.sidebar.showSideMenu("add_block", {
					quiet: true,
					duration: 0,
				});
			}
		});
	}

	getCleanOutput(html = null) {
		if (!html) {
			html = this.content_node.innerHTML;
		}
		this.clean_output_node.setContent(html);

		this.container.dispatchEvent(new Event("clean_up_output"));

		return this.clean_output_node.innerHTML;
	}

	initSidebar() {
		this.sidebar = new NewCmsSidebar(this, this.container.find(`.sidebar`));
	}

	initEditBlock() {
		this.edit_block = new NewCmsEditBlock(
			this,
			this.container.find(`.edit_block_node`)
		);
	}

	initQuillEditor() {
		this.quill_editor = new NewCmsQuillEditor(
			this,
			this.container.find(".quill_editor")
		);
	}

	initFloatingSelectControls() {
		this.select_controls = new NewCmsSelectControls(this);
	}

	initFloatingRearrangeControls() {
		this.rearrange_controls = new NewCmsRearrangeControls(this);
	}

	edit(targetNode, options) {
		this.targetNode = $(targetNode);
		this.options = options;

		/*setFormData(
			{
				content: this.getCleanOutput(this.targetNode.innerHTML),
			},
			this.container
		);*/
		this.contentChange();

		this.lockInput();

		this.container.classList.remove("ready");

		showModal("newCms", {
			source: this.targetNode,
			callback: () => {
				this.container.classList.add("ready");
				setTimeout(() => {
					this.contentChange();
					this.unlockInput();

					// who the hell needs that? not me
					//this.container.dispatchEvent(new Event("ready"));
				}, 100);
			},
		});

		this.container.dispatchEvent(new Event("edit"));

		setFormInitialState(this.container);
	}

	save() {
		// TODO: it should go straight to backend at this point
		this.targetNode.setValue(
			//getFormData(this.container).content
			this.getCleanOutput()
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
		// TODO: should we care?
		if (!IS_MOBILE) {
			this.mouse_target = $(
				document.elementFromPoint(this.mouse_x, this.mouse_y)
			);
		}
	}

	updateMouseCoords(event) {
		this.content_scroll_panel_rect = this.content_scroll_panel.getBoundingClientRect();
		const mouse_x = event.clientX;
		const mouse_y = event.clientY;
		this.mouse_dx = mouse_x - this.mouse_x;
		this.mouse_dy = mouse_y - this.mouse_y;
		this.mouse_x = mouse_x;
		this.mouse_y = mouse_y;
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

	mouseClick() {
		if (!this.mouse_left_btn) {
			return;
		}

		if (this.grabbed_block) {
			this.releaseBlock();
			return;
		}

		if (!this.edit_block.select_node) {
			this.select_controls.mouseClick();
		}

		const target = this.mouse_target;

		/** @type {NewCmsBlock} */
		// @ts-ignore
		const side_block = target
			? target.findParentByClassName("side_block")
			: null;
		if (side_block) {
			side_block.styling_data = this.styling.getDefaultBlockStyles();
			this.grabBlock(side_block);
		}

		this.sidebar.mouseClick();
		this.styling.mouseClick();
	}

	scroll() {
		this.updateMouseTarget();
		this.mouseMove();

		const dy_bottom = this.getBottomScrollOffset();

		if (dy_bottom < 0) {
			this.content_scroll_panel.scrollBy(0, dy_bottom);
		}
	}

	caseEmptyHint() {
		const has_any_block = !!this.content_node.find(
			".newCms_block:not(.cramped):not(.parent_cramped)"
		);

		if (!has_any_block) {
			this.content_node.insertAdjacentHTML(
				"afterbegin",
				this.getBlockHtml("container")
			);
			this.contentChange();
		}

		/*
        const add_block_hint = this.content_node.find(".add_block_hint");
        if (!has_any_block && !add_block_hint) {
			this.content_node.insertAdjacentHTML(
				"afterbegin",
				`
                    <div class="add_block_hint">
                        <i class="fas fa-info-circle"></i>
                        Wybierz blok, który chcesz
                        <br>
                        dodać z menu po lewej stronie
                    </div>
                `
            );
		}*/

		/*if (has_any_block && add_block_hint) {
			add_block_hint.remove();
		}*/
	}

	// TODO: do we really need it? hmmm, maybe
	giveImagesNaturalWidth() {
		this.content_node.findAll("img.newCms_block_content").forEach((e) => {
			if (!e.style.width) {
				const img_data = getResponsiveImageData(e.dataset.src);
				let w = 0;
				if (img_data) {
					w = img_data.w;
				} else {
					w = e.getBoundingClientRect().width;
				}
				e.style.width = w + "px";
			}
		});
	}

	contentChange(options = {}) {
		this.insertMissingQlClasses();
		this.manageGrids();
		this.styling.setBlocksFlexOrder();

		this.caseEmptyHint();
		this.giveImagesNaturalWidth();

		this.select_controls.addFloatingSelectControls();

		if (!options.quiet) {
			this.content_node.dispatchChange();
		}
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
			.forEach((g) => {
				/** @type {NewCmsGrid} */
				// @ts-ignore
				const grid = g;

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
			content_html = /*html*/ `<div class="newCms_block_content"></div>`;
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

	/*insertBlock(target, position, type, options = {}) {
		target.insertAdjacentHTML(position, this.getBlockHtml(type, options));

		this.contentChange();
	}*/

	/**
	 * @param {NewCmsBlock} block
	 */
	removeBlock(block) {
		if (!block) {
			return;
		}

		this.beforeContentAnimation();

		block.classList.add("cramped");
		block.findAll(".newCms_block").forEach((e) => {
			e.classList.add("parent_cramped");
		});

		const all_animatable_blocks = this.afterContentAnimation();

		block.classList.add("animation_cramp");

		this.animateContent(all_animatable_blocks, 350, {
			beforeAnimationEndCallback() {
				block.classList.remove("animation_cramp");
			},
			callback: () => {
				block.classList.add("to_remove");
			},
		});
	}

	/**
	 *
	 * @param {NewCmsBlock} block
	 * @param {*} options
	 */
	grabBlock(block, options = {}) {
		if (this.grabbed_block) {
			return;
		}
		this.grab_options = options;

		const block_rect = block.getBoundingClientRect();
		if (!options.copy) {
			block.last_rect = block_rect;
		}

		this.source_grabbed_node = block.classList.contains("side_block")
			? this.sidebar.node
			: this.content_scroll_content;

		/*this.grabbed_node_scroll_parent = this.source_grabbed_node.findScrollParent(
			{ default: document.body }
		);*/

		this.source_grabbed_node.appendChild(
			this.rearrange_controls.rearrange_grabbed_rect_node
		);

		this.grabbed_block = block;
		this.grabbed_block.classList.add("grabbed");
		this.grabbed_mouse_x = this.mouse_x;
		this.grabbed_mouse_y = this.mouse_y;
		//this.grabbed_scroll_top = this.grabbed_node_scroll_parent.scrollTop;
		this.grabbed_scroll_top = this.content_scroll_panel.scrollTop;

		this.container.classList.add("grabbed_block");

		this.select_controls.removeSelection();
		this.rearrange_controls.node.classList.add("visible");
		this.select_controls.node.classList.add("non_clickable");

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
		this.scroll_speed_y = 0;

		if (!options.copy) {
			delete this.grabbed_block.animation_data;
		}

		if (this.sidebar.collapsed) {
			this.sidebar.toggleSidebar();
			this.grabbed_mouse_x += this.sidebar.sidebar_animation_offset;
		}

		this.grabAnimation();
	}

	unselectFirstGridNode() {
		this.rearrange_grid_first_node = null;
		this.grab_animation_speed = 0;

		this.content_scroll_content
			.findAll(".rearrange_control.unavailable")
			.forEach((control) => {
				control.classList.remove("unavailable");
			});

		this.content_scroll_content
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

		const do_trash = this.mouse_target.findParentNode(this.trash_block.node);

		// a copy has these values fixed
		grabbed_block.style.width = "";
		grabbed_block.style.height = "";

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

				const fst = this.rearrange_grid_first_node;
				fst.classList.add("first_grid_node");

				this.content_scroll_content
					.findAll(".rearrange_control:not(.first_grid_node)")
					.forEach((c) => {
						/** @type {RearrangeControl} */
						// @ts-ignore
						const control = c;
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

				/** @type {AnimationData} */
				const gbad = grabbed_block.animation_data;
				// @ts-ignore
				grabbed_block.last_rect = {
					width: gbad.w,
					height: gbad.h,
					left: grabbed_block.last_rect.left,
					top: grabbed_block.last_rect.top,
				};
			}
		}

		if (!do_trash && this.rearrange_grid_first_node) {
			this.unselectFirstGridNode();
			return;
		}

		const block_type = grabbed_block.dataset.block;

		let delay_grabbed_rect_node_fadeout = 0;

		let delay_rearrange_node_fadeout = 0;

		const is_side_block =
			block_type && grabbed_block.classList.contains("side_block");

		if (is_side_block) {
			const side_block = grabbed_block;
			const side_block_rect = side_block.getBoundingClientRect();

			// replace
			/** @type {AnimationData} */
			const animation_data = grabbed_block.animation_data;

			if (this.rearrange_controls.rearrange_near_block) {
				delay_grabbed_rect_node_fadeout = 250;
				side_block.classList.remove("grabbed");
				side_block.style.transform = "";
				side_block.animate(
					`
                        0% {opacity: 0; transform: scale(0.65)}
                        100% {opacity: 1; transform: scale(1)}
                    `,
					delay_grabbed_rect_node_fadeout
				);

				// @ts-ignore
				grabbed_block = createNodeFromHtml(this.getBlockHtml(block_type));
				this.grabbed_block = grabbed_block;
				this.content_node.appendChild(grabbed_block);
				grabbed_block.animation_data = animation_data;
				grabbed_block.classList.add("select_active");
				grabbed_block.last_rect = side_block_rect;

				const gbad = grabbed_block.animation_data;
				// @ts-ignore
				grabbed_block.last_rect = {
					width: gbad.w,
					height: gbad.h,
					left: grabbed_block.last_rect.left,
					top: grabbed_block.last_rect.top,
				};
			}

			// copy fade out
			delay_rearrange_node_fadeout = 150;
			this.rearrange_node.animate(
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

				this.styling.setBlockStyles(
					{
						"grid-area": `${r1}/${c1}/${r2}/${c2}`,
					},
					grabbed_block
				);
			} else {
				/** @type {NewCmsBlock} */
				let before_node = this.rearrange_controls.rearrange_near_block;
				if (this.rearrange_controls.rearrange_position == "after") {
					before_node = before_node.getNextBlock();
				}

				if (this.styling.allow_free_rearrangement || is_side_block) {
					this.rearrange_controls.rearrange_near_block
						.parent()
						.insertBefore(grabbed_block, before_node);
				}

				if (!this.styling.allow_free_rearrangement) {
					//const parent_children = grabbed_block.parent().directChildren();

					//const current_flex_order = parseInt(grabbed_block.dataset.flex_order);
					// 0.5 will go through them... u know - blocks
					let target_flex_order = before_node
						? parseInt(before_node.dataset.flex_order) - 0.5
						: 1000000;

					this.styling.setBlockStyles(
						{
							order: target_flex_order,
						},
						grabbed_block
					);
				}

				this.styling.setBlocksFlexOrder();
			}

			this.styling.registerMissingBlocks();

			if (this.grab_options.copy) {
				grabbed_block.style.display = "";
			}
		} else {
			if (this.grab_options.copy) {
				grabbed_block.remove();
			}
		}

		if (do_trash) {
			this.grab_options.remove = true;
			this.removeBlock(grabbed_block);
			return;
		}

		this.rearrange_controls.removeRearrangement();

		const all_animatable_blocks = this.afterContentAnimation();

		this.animateContent(all_animatable_blocks, 350);
	}

	beforeContentAnimation() {
		this.content_node.findAll(".newCms_block").forEach((b) => {
			/** @type {NewCmsBlock} */
			// @ts-ignore
			const block = b;
			if (!block.last_rect) {
				block.last_rect = block.getBoundingClientRect();
			}
		});
	}

	afterContentAnimation() {
		const all_animatable_blocks = this.content_node
			.findAll(".newCms_block")
			.filter((b) => {
				/** @type {NewCmsBlock} */
				// @ts-ignore
				const block = b;
				if (block.last_rect) {
					block.new_rect = block.getBoundingClientRect();
					if (!block.animation_data) {
						/** @type {AnimationData} */
						// @ts-ignore
						const block_animation_data = { dx: 0, dy: 0, w: 0, h: 0 };
						block.animation_data = block_animation_data;
					}
					if (block.classList.contains("container")) {
						/** @type {NewCmsBlock} */
						// @ts-ignore
						const newCms_block_content = block.find(".newCms_block_content");
						// it's used for flex items to tell when they kiss the edge, don't move it away!
						newCms_block_content.new_rect = newCms_block_content.getBoundingClientRect();
					}

					return true;
				} else {
					return false;
				}
			});

		all_animatable_blocks.forEach((b) => {
			/** @type {NewCmsBlock} */
			// @ts-ignore
			const block = b;

			const dx = block.last_rect.left - block.new_rect.left;
			const dy = block.last_rect.top - block.new_rect.top;

			/** @type {AnimationData} */
			const block_animation_data = block.animation_data;
			block_animation_data.dx += dx;
			block_animation_data.dy += dy;

			block
				.find(".newCms_block_content")
				.directChildren()
				.forEach((s) => {
					/** @type {NewCmsBlock} */
					// @ts-ignore
					const sub_block = s;
					if (sub_block.animation_data) {
						sub_block.animation_data.dx -= dx;
						sub_block.animation_data.dy -= dy;
					}
				});
		});

		// copy overlay to hide layout update
		this.content_node_copy.setContent(this.content_node.innerHTML);

		this.scroll();

		return all_animatable_blocks;
	}

	/**
	 *
	 * @param {NewCmsBlock[]} all_animatable_blocks
	 * @param {number} duration
	 * @param {*} options
	 */
	animateContent(all_animatable_blocks, duration, options = {}) {
		this.lockInput(duration);

		this.select_controls.removeSelection();

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

				this.scroll();

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

			const block_styles = this.styling.getNodeCurrentStyles(block);
			const mt = evalCss(block_styles.outside["margin-top"], block);
			const mr = evalCss(block_styles.outside["margin-right"], block);
			const mb = evalCss(block_styles.outside["margin-bottom"], block);
			const ml = evalCss(block_styles.outside["margin-left"], block);

			const mt0 = mt + half_dh;
			const mr0 = mr + half_dw;
			const mb0 = mb + half_dh;
			const ml0 = ml + half_dw;

			/** @type {AnimationData} */
			const block_animation_data = block.animation_data;
			const dx = block_animation_data.dx - half_dw;
			const dy = block_animation_data.dy - half_dh;

			const parent_rect = block.parent().new_rect;

			const kisses_right_border = parent_rect
				? Math.abs(
						block.new_rect.left +
							block.new_rect.width +
							mr -
							(parent_rect.left + parent_rect.width)
				  ) < 15
				: false;

			// give flexbox some space baby
			const subtract_mr = kisses_right_border ? 2 : 0;

			const fg = block_styles.outside["flex-grow"];
			if (fg) {
				block.style.flexGrow = "0";
			}

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
			block.animate(keyframes, duration, {
				callback: () => {
					if (fg) {
						block.style.flexGrow = fg;
					}
				},
			});

			delete block.animation_data;
			delete block.last_rect;
		});

		setTimeout(() => {
			finishAnimation();
		}, duration);
	}

	grabAnimation() {
		const grabbed_block = this.grabbed_block;

		if (!grabbed_block) {
			return;
		}

		let target_speed_y = 0;
		const const_acc = 0.5;

		// cute scroll
		if (this.mouse_target.findParentNode(this.content_scroll_panel)) {
			const content_scroll_panel_rect = this.content_scroll_panel.getBoundingClientRect();

			const scroll_offset = 50;

			const upper_dy =
				this.mouse_y - content_scroll_panel_rect.top - scroll_offset;
			if (upper_dy < 0) {
				target_speed_y = upper_dy;
				if (target_speed_y < -scroll_offset) {
					target_speed_y = -scroll_offset;
				}
			}

			const bottom_dy =
				scroll_offset -
				content_scroll_panel_rect.top -
				content_scroll_panel_rect.height +
				this.mouse_y;
			if (bottom_dy > 0) {
				target_speed_y = bottom_dy;

				if (target_speed_y > scroll_offset) {
					target_speed_y = scroll_offset;
				}
			}
			target_speed_y *= 0.4;
		}

		if (this.scroll_speed_y + const_acc < target_speed_y) {
			this.scroll_speed_y += const_acc;
		} else if (this.scroll_speed_y - const_acc > target_speed_y) {
			this.scroll_speed_y -= const_acc;
		}

		if (Math.abs(this.scroll_speed_y) > const_acc * 1.1) {
			this.content_scroll_panel.scrollBy(0, this.scroll_speed_y);
		}

		// move the block itself
		{
			if (this.grab_animation_speed < 1) {
				this.grab_animation_speed += 0.03;
			} else {
				this.grab_animation_speed = 1;
			}
			const acc = this.grab_animation_speed;

			let target_dx = 0;
			let target_dy = 0;

			const gb_rect = grabbed_block.last_rect;
			if (!gb_rect) {
				return;
			}
			const base_w = gb_rect.width;
			const base_h = gb_rect.height;
			let target_w = base_w;
			let target_h = base_h;

			if (!grabbed_block.animation_data) {
				// @ts-ignore
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

			const block_styles = this.styling.getNodeCurrentStyles(grabbed_block);
			const mt = evalCss(block_styles.outside["margin-top"], grabbed_block);
			//const mr = evalCss(block_styles.outside["margin-right"], block);
			//const mb = evalCss(block_styles.outside["margin-bottom"], block);
			const ml = evalCss(block_styles.outside["margin-left"], grabbed_block);

			/** @type {AnimationData} */
			const gbad = grabbed_block.animation_data;

			gbad.dx = gbad.dx * (1 - acc) + target_dx * acc;
			gbad.dy = gbad.dy * (1 - acc) + target_dy * acc;

			gbad.w = gbad.w * (1 - acc) + target_w * acc;
			gbad.h = gbad.h * (1 - acc) + target_h * acc;

			let set_w = gbad.w;
			let set_h = gbad.h;

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
                    ${(gbad.dx - ml).toPrecision(5)}px,
                    ${(gbad.dy - mt).toPrecision(5)}px
                )
            `;
		}

		// repeat
		requestAnimationFrame(() => {
			this.grabAnimation();
		});
	}
}
window.addEventListener("tool_loaded", (event) => {
	// @ts-ignore
	if (event.detail.name != "newCms") {
		return;
	}

	// @ts-ignore
	if (event.detail.info == "js") {
		// @ts-ignore
		registerModalContent(
			// TODO: syntax highlighting + open src in piep extension
			`@include(admin/tools/newCms/main.html)`,
			(modal) => {
				// @ts-ignore
				window.newCms = new NewCms(modal);
			}
		);
	}
	// @ts-ignore
	if (event.detail.info == "all") {
		// @ts-ignore
		window.newCms.stylesLoaded();
	}
});
