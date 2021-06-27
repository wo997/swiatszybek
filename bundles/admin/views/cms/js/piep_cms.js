/* js[piep_cms] */

class PiepCMS {
	/**
	 *
	 * @param {PiepNode} container
	 */
	constructor(container) {
		this.container = container;

		/** @type {vDomNode[]} */
		this.v_dom = [];
		/** @type {PiepCMSEditHistory[]} */
		this.edit_history = [];

		this.max_vid_inside = 0;

		this.last_map_vid_render_props = {}; // vid => props

		this.initNodes();

		piep_cms_manager.setPiepCms(this);

		//this.initInspector();
		this.initSelectionBreadcrumbs();
		this.initSideMenu();
		this.initFloatMenu();
		this.initRightMenu();
		this.initAddBlockMenu();
		this.initClipboardMenu();
		this.initLayoutEdit();
		this.initInserting();
		this.initMultiSelect();
		this.initSelectResolution();
		this.initEditables();

		this.focus_node_vid = -1;

		this.initPaste();
		this.initClick();
		this.initTyping();
		this.initTextSelection();

		this.initHistory();

		this.mainLoop();

		piep_cms_manager.editorReady();

		// no zoom? great!
		this.container.addEventListener(
			"wheel",
			(event) => {
				if (event.ctrlKey && (this.selecting_blcs || this.grabbed_block_vid)) {
					event.preventDefault();
				}
			},
			true
		);
	}

	/**
	 *
	 * @param {number} vid
	 */
	selectTextContainerContents(vid) {
		const v_node = this.getVNodeById(vid);
		const children = v_node.children;
		if (children) {
			let length = 0;
			const middle_vids = [];
			children.forEach((c) => {
				if (c.text) {
					length += c.text.length;
					middle_vids.push(c.id);
				}
			});

			this.text_selection = {
				anchor_vid: children[0].id,
				anchor_offset: 0,
				focus_vid: children[children.length - 1].id,
				focus_offset: children[children.length - 1].text.length,
				middle_vids,
				partial_ranges: [],
				// @ts-ignore
				direction: 1,
				length,
				single_node: children.length === 1,
			};
		}
	}

	updateDefiniteSelection() {
		if (!this.text_selection) {
			return;
		}
		this.definiteSelection(
			this.getNode(this.text_selection.anchor_vid),
			this.text_selection.anchor_offset,
			this.getNode(this.text_selection.focus_vid),
			this.text_selection.focus_offset
		);
	}

	/**
	 *
	 * @param {PiepNode} sel_anchor_node
	 * @param {number} anchor_offset
	 * @param {PiepNode} sel_focus_node
	 * @param {number} focus_offset
	 *
	 * Pretty much recalculates selection, have fun
	 */
	definiteSelection(sel_anchor_node, anchor_offset, sel_focus_node, focus_offset) {
		const anchor_vid = +sel_anchor_node.dataset.vid;
		const focus_vid = +sel_focus_node.dataset.vid;

		// const is_anchor_textable = sel_anchor_node.classList.contains("textable");
		// const is_focus_textable = sel_focus_node.classList.contains("textable");

		const is_anchor_in_text_container = sel_anchor_node.classList.contains("in_text_container");
		const is_focus_in_text_container = sel_focus_node.classList.contains("in_text_container");

		if (is_anchor_in_text_container && is_focus_in_text_container) {
			const indices_anchor = sel_anchor_node.dataset.indices.split(",").map((e) => +e);
			indices_anchor.push(anchor_offset);
			const indices_focus = sel_focus_node.dataset.indices.split(",").map((e) => +e);
			indices_focus.push(focus_offset);

			const single_node = anchor_vid === focus_vid;

			const direction = compareIndices(indices_anchor, indices_focus);

			let total_length = 0;

			/** @type {PiepTextPartialRange[]} */
			const partial_ranges = [];
			/** @type {number[]} */
			const middle_vids = [];

			{
				const start_offset = direction === 1 ? anchor_offset : focus_offset;
				const end_offset = direction === 1 ? focus_offset : anchor_offset;
				const start_vid = direction === 1 ? anchor_vid : focus_vid;
				const end_vid = direction === 1 ? focus_vid : anchor_vid;
				const sel_start_node = direction === 1 ? sel_anchor_node : sel_focus_node;
				const sel_end_node = direction === 1 ? sel_focus_node : sel_anchor_node;
				const start_len = sel_start_node.textContent.length;
				const end_len = sel_end_node.textContent.length;

				if (single_node) {
					if (start_offset === 0 && end_offset === start_len) {
						middle_vids.push(start_vid);
						total_length += start_len;
					} else {
						const length = end_offset - start_offset;
						if (length > 0) {
							total_length += length;
							partial_ranges.push({
								vid: start_vid,
								start: start_offset,
								end: end_offset,
							});
						}
					}
				} else {
					if (start_offset === 0) {
						middle_vids.push(start_vid);
					} else {
						const length = start_len - start_offset;
						if (length > 0) {
							total_length += length;
							partial_ranges.push({
								vid: start_vid,
								start: start_offset,
								end: start_len,
							});
						}
					}

					if (end_offset === end_len) {
						middle_vids.push(end_vid);
						total_length += end_len;
					} else {
						const length = end_offset;
						if (length > 0) {
							total_length += length;
							partial_ranges.push({
								vid: end_vid,
								start: 0,
								end: end_offset,
							});
						}
					}
				}
			}

			if (!single_node) {
				let next = sel_anchor_node;
				while (true) {
					next = this.getDeepSibling(next, ".in_text_container", direction);
					if (next === sel_focus_node) {
						break;
					}
					if (next) {
						middle_vids.push(+next.dataset.vid);
						total_length += next.textContent.length;
					} else {
						break;
					}
				}
			}

			this.text_selection = {
				anchor_vid: +sel_anchor_node.dataset.vid,
				anchor_offset: anchor_offset,
				focus_vid: +sel_focus_node.dataset.vid,
				focus_offset: focus_offset,
				middle_vids,
				partial_ranges,
				direction,
				length: total_length,
				single_node,
			};
		} else {
			this.text_selection = undefined;
		}

		// if (is_anchor_textable && !is_focus_textable) {
		// 	const anchor_parent = sel_anchor_node._parent();
		// 	if (anchor_parent.classList.contains("text_container")) {
		// 		this.selectTextContainerContents(+anchor_parent.dataset.vid);
		// 	}
		// }
	}

	initTextSelection() {
		/** @type {PiepTextSelection} */
		this.text_selection = undefined;

		this.container.addEventListener("dragstart", (ev) => {
			ev.preventDefault();
		});

		this.content.addEventListener("mousemove", (ev) => {
			this.select_blc_active = true;
		});
		this.container.addEventListener("click", (ev) => {
			this.select_blc_active = true;
		});

		document.addEventListener("selectionchange", () => {
			if (this.removing_selection) {
				setTimeout(() => {
					this.removing_selection = false;
				});
				return;
			}

			if (this.grabbed_v_node || !this.content_active) {
				return;
			}

			this.text_selection = undefined;

			const sel = document.getSelection();
			//console.log(cloneObject(sel));

			if (sel.anchorNode && sel.focusNode) {
				const sel_anchor_node = $(sel.anchorNode)._parent(".blc");
				const sel_focus_node = $(sel.focusNode)._parent(".blc");

				if (sel_anchor_node && sel_focus_node) {
					const anchor_offset = sel.anchorOffset;
					const focus_offset = sel.focusOffset;

					this.definiteSelection(sel_anchor_node, anchor_offset, sel_focus_node, focus_offset);
				}
			}

			this.onSelectionChange();
		});
	}

	onSelectionChange() {
		this.manageText();

		if (this.text_selection) {
			this.setFocusNode(this.text_selection.focus_vid);

			// const focus_node_data = this.getVNodeDataById();
			// if (focus_node_data) {
			// 	this.setFocusNode(focus_node_data.parent_v_nodes[0].id);
			// }
		}
	}

	/**
	 *
	 * @param {{
	 * vids?: number[]
	 * force?: boolean
	 * }} options
	 */
	displayTextSelection(options = {}) {
		let render_selection_token = "";
		if (options.vids) {
			render_selection_token += "_" + options.vids.join(",");
		}
		if (this.text_selection) {
			render_selection_token += "_" + JSON.stringify(this.text_selection);
		}
		if (!options.force && render_selection_token === this.last_render_selection_token) {
			return;
		}
		this.last_render_selection_token = render_selection_token;

		let selection_html = "";

		const rendered_keys = [];

		const text_range = document.createRange();

		/**
		 *
		 * @param {number} vid
		 * @param {number} start
		 * @param {number} end
		 */
		const displaySelection = (vid, start = undefined, end = undefined, class_name = "text_selection") => {
			const node = this.getNode(vid);

			if (!node) {
				return;
			}

			/** @type {DOMRect[]} */
			let rects = [];
			/** @type {Position} */
			let base_direction_vector;
			/** @type {number[]} */
			let wrap_positions = [];

			if (start === undefined) {
				start = 0;
			}
			if (end === undefined) {
				end = node.textContent.length;
			}

			const key = vid + "_" + start + "_" + end + "_" + class_name;
			if (rendered_keys.includes(key)) {
				return;
			}
			rendered_keys.push(key);

			let cnt = -1;
			const text_node = getTextNode(node); // optimisation - pass to getRangeByIndex for speeeed

			for (let i = start; i < end; i++) {
				cnt++;

				try {
					text_range.setStart(text_node, i);
					text_range.setEnd(text_node, i + 1);
				} catch (e) {
					console.error(e, node);
				}

				const text_range_rect = text_range.getBoundingClientRect();
				rects.push(text_range_rect);

				if (cnt > 0) {
					/** @type {Position} */
					const direction_vector = { x: rects[cnt].x - rects[cnt - 1].x, y: rects[cnt].y - rects[cnt - 1].y };

					if (cnt === 1) {
						base_direction_vector = direction_vector;
					} else {
						if (direction_vector.x * base_direction_vector.x + direction_vector.y + base_direction_vector.y < 0) {
							// other direction, wrap? lol
							wrap_positions.push(cnt);
						}
					}
				}
			}

			const join_points = [0, ...wrap_positions, end - start];

			for (let i = 0; i < join_points.length - 1; i++) {
				let p1 = join_points[i];
				let p2 = join_points[i + 1] - 1;

				const r1 = rects[p1];
				const r2 = rects[p2];

				if (!r1 || !r2) {
					continue;
				}

				selection_html += html`<div
					class="${class_name}"
					style="
                        left:${r1.left}px;
                        top:${r1.top + this.content_scroll.scrollTop}px;
                        width:${r2.left + r2.width - r1.left}px;
                        height:${r2.top + r2.height - r1.top}px;"
				></div>`;
			}
		};

		if (this.text_selection) {
			this.text_selection.middle_vids.forEach((vid) => {
				displaySelection(vid);
			});
			this.text_selection.partial_ranges.forEach((partial_range) => {
				displaySelection(partial_range.vid, partial_range.start, partial_range.end);
			});

			displaySelection(this.text_selection.focus_vid, undefined, undefined, "just_underline");
		}

		if (options.vids) {
			options.vids.forEach((vid) => {
				displaySelection(vid, undefined, undefined, "just_underline");
			});
		}

		this.display_text_selection._set_content(selection_html);

		// cursor
		if (this.text_selection) {
			const focus_node = this.getNode(this.text_selection.focus_vid);
			if (focus_node) {
				const focus_range = getRangeByIndex(focus_node, this.text_selection.focus_offset);
				const focus_range_rect = (focus_node.textContent === "" ? focus_node : focus_range).getBoundingClientRect();

				//const width = Math.max(focus_range_rect.width, 2);
				const width = 2;
				const height = Math.max(focus_range_rect.height, 20);
				this.cursor._set_absolute_pos(
					focus_range_rect.left + (this.text_selection.direction === 1 ? focus_range_rect.width : 0) - width * 0.5,
					focus_range_rect.top + this.content_scroll.scrollTop
				);
				this.cursor.style.width = width + "px";
				this.cursor.style.height = height + "px";
			}
		}

		this.cursor.classList.toggle("hidden", !this.text_selection);
	}

	initNodes() {
		this.content = this.container._child(".piep_editor_content");
		this.content_wrapper = this.container._child(".piep_editor_content_wrapper");
		this.content_scroll = this.container._child(".piep_editor_content_scroll");
		this.right_menu = this.container._child(".piep_editor_right_menu");

		const container_node = (class_name) => {
			this.container.insertAdjacentHTML("beforeend", html`<div class="${class_name}"></div>`);
			return this.container._child(`.${class_name}`);
		};

		const styles = (class_name) => {
			this.container.insertAdjacentHTML("beforeend", html`<style class="${class_name}"></style>`);
			return this.container._child(`.${class_name}`);
		};

		this.grabbed_block_wrapper = container_node("piep_editor_grabbed_block_wrapper");
		this.grabbed_block_wrapper.classList.add("focus_rect", "global_root");
		this.add_block_menu = container_node("piep_editor_add_block_menu");
		this.clipboard_menu = container_node("piep_editor_clipboard_menu");
		this.side_menu = this.container._child(".piep_editor_side_menu");
		this.paste_html = container_node("piep_editor_paste_html");
		this.paste_html.classList.add("hidden");

		{
			this.alternative_scroll_panel = container_node("piep_editor_alternative_scroll_panel");
			const scroll_node = (class_name) => {
				this.alternative_scroll_panel.insertAdjacentHTML("beforeend", html`<div class="${class_name}"></div>`);
				return this.alternative_scroll_panel._child(`.${class_name}`);
			};

			this.cursor = scroll_node("piep_editor_cursor");
			this.float_focuses = scroll_node("piep_editor_float_focuses");
			this.float_menu = scroll_node("piep_editor_float_menu");
			this.layout_controls = scroll_node("piep_editor_layout_controls");

			this.display_text_selection = scroll_node("piep_editor_display_text_selection");
			this.insert_blcs = scroll_node("piep_editor_insert_blcs");
			this.select_blcs = scroll_node("piep_editor_select_blcs");
			this.float_multi_insert_bckg = scroll_node("piep_editor_float_multi_insert_bckg");
			this.float_multi_insert_bckg.classList.add("hidden");
		}

		this.styles = styles("piep_editor_styles");
	}

	initHistory() {
		if (!this.undo_btn) {
			this.undo_btn = this.container._child(".piep_editor_header .undo");
			this.redo_btn = this.container._child(".piep_editor_header .redo");
			this.undo_btn.addEventListener("click", () => {
				this.undoHistory();
			});
			this.redo_btn.addEventListener("click", () => {
				this.redoHistory();
			});
		}

		this.history_steps_back = 0;
		this.edit_history = [];
		this.pushHistory("");
	}

	/**
	 *
	 * @param {string} name
	 */
	pushHistory(name) {
		if (this.history_change_name && this.history_change_name === name && this.edit_history.length > 1) {
			this.edit_history.splice(this.edit_history.length - 1, 1);
		}

		this.edit_history.splice(this.edit_history.length - this.history_steps_back, this.history_steps_back);
		this.history_steps_back = 0;

		if (this.edit_history.length > 0 && isEquivalent(this.edit_history[this.edit_history.length - 1].v_dom, this.v_dom)) {
			return;
		}
		this.edit_history.push({
			text_selection: cloneObject(this.text_selection),
			v_dom: cloneObject(this.v_dom),
			focus_vid: this.focus_node_vid,
			resolution: this.select_resolution._get_value(),
		});
		this.renderHistory();

		clearTimeout(this.forgetHistoryChangeName);
		this.history_change_name = name;
		this.forgetHistoryChangeName = setTimeout(() => {
			this.history_change_name = "";
		}, 2000);

		if (this.v_dom.length > 0) {
			piep_cms_manager.updateModules();
		}
	}
	redoHistory() {
		this.history_steps_back = Math.max(0, this.history_steps_back - 1);
		this.setDataFromHistory();
	}
	undoHistory() {
		this.history_steps_back = Math.min(this.history_steps_back + 1, this.edit_history.length - 1);
		this.setDataFromHistory();
	}

	setDataFromHistory() {
		const history_entry = this.edit_history[this.edit_history.length - 1 - this.history_steps_back];
		this.v_dom = cloneObject(history_entry.v_dom);
		this.text_selection = cloneObject(history_entry.text_selection);
		this.update({ all: true });
		this.renderHistory();
		this.setFocusNode(history_entry.focus_vid);
		if (history_entry.resolution !== this.select_resolution._get_value()) {
			this.select_resolution._set_value(history_entry.resolution);
		}
		this.setBlcMenuFromFocusedNode();
		this.displayNodeLayout();
	}

	renderHistory() {
		this.undo_btn.toggleAttribute("disabled", this.history_steps_back >= this.edit_history.length - 1);
		this.redo_btn.toggleAttribute("disabled", this.history_steps_back === 0);

		//this.displayTextSelection();
	}

	initSelectResolution() {
		this.select_resolution = this.container._child(".select_resolution");

		this.select_resolution.addEventListener("change", () => {
			const r = this.select_resolution._get_value();
			if (r === this.select_resolution) {
				return;
			}
			/** @type {string} */
			this.selected_resolution = r;
			let max_width = "";
			const is_df = this.selected_resolution === "df";
			if (!is_df) {
				max_width = responsive_preview_sizes[this.selected_resolution] + 20 + "px"; // 20 for scrollbar
			}

			this.content_scroll.style.maxWidth = max_width;

			this.add_block_btn_wrapper.dataset.tooltip = is_df ? "" : "Dodawanie bloków jest możliwe tylko w widoku dla komputerów";
			this.add_block_btn.classList.toggle("disabled", !is_df);

			this.update({ all: true });
			this.setBlcMenuFromFocusedNode();

			this.container.classList.toggle("is_desktop", !is_df);
		});

		this.select_resolution._set_value("df");
	}

	initFloatMenu() {
		let floating_blc_props_menu_html = "";
		piep_cms_manager.floating_blc_props.forEach((blc_prop) => {
			floating_blc_props_menu_html += html`<div
				class="prop_wrapper prop_${blc_prop.name} ${blc_prop.advanced ? "case_advanced" : ""}"
				data-prop="${blc_prop.name}"
			>
				${blc_prop.menu_html}
			</div>`;
		});
		this.float_menu._set_content(floating_blc_props_menu_html);
		registerForms();

		piep_cms_manager.floating_blc_props.forEach((blc_prop) => {
			if (blc_prop.init) {
				blc_prop.init(this, this.float_menu._child(`.prop_${blc_prop.name}`));
			}
		});
	}

	initRightMenu() {
		this.add_block_btn = this.right_menu._child(".add_block_btn");
		this.add_block_btn_wrapper = this.right_menu._child(".add_block_btn_wrapper");

		this.advanced_mode = false;

		document.addEventListener("click", (event) => {
			const target = $(event.target);
			const edit_theme_btn = target._parent(".edit_theme_btn");
			if (edit_theme_btn) {
				getThemeSettingsModal()._show({ source: edit_theme_btn });
			}
			const advanced_mode_btn = target._parent(".advanced_mode_btn");
			if (advanced_mode_btn) {
				this.advanced_mode = !this.advanced_mode;
				this.container.classList.toggle("advanced_mode", this.advanced_mode);
				advanced_mode_btn.classList.toggle("important", this.advanced_mode);
				advanced_mode_btn.classList.toggle("transparent", !this.advanced_mode);

				this.updatedSideMenu();
			}
		});

		this.clipboard_btn = this.right_menu._child(".clipboard_btn");
		this.clipboard_btn_wrapper = this.right_menu._child(".clipboard_btn_wrapper");

		this.right_menu._direct_children().forEach((e) => {
			e.dataset.tooltip_position = "left";
		});
	}

	displaySelectBlcs() {
		/**
		 *
		 * @returns {PiepNode}
		 */
		const getSelectBlc = () => {
			const select_blc = document.createElement("DIV");
			select_blc.classList.add("select_blc");
			this.insert_blcs.append(select_blc);

			// @ts-ignore
			return $(select_blc);
		};

		const content_scroll_rect = piep_cms.content_scroll.getBoundingClientRect();

		const blcs = this.content._children(this.getSelectableBlcSelector());
		this.select_blcs._empty();

		/** @type {Position[]} */
		const coords = [];
		// prioritize lowest level
		blcs
			.sort((a, b) => Math.sign(+a.dataset.level - +b.dataset.level))
			.forEach((blc) => {
				const blc_rect = blc.getBoundingClientRect();
				if (
					blc_rect.top + blc_rect.height < content_scroll_rect.top + 20 ||
					blc_rect.top > content_scroll_rect.top + content_scroll_rect.height - 20
				) {
					// whole blc off
					return;
				}

				const select_blc = getSelectBlc();

				const vid = +blc.dataset.vid;
				select_blc.dataset.vid = blc.dataset.vid;

				const v_node = this.getVNodeById(vid);

				let icon = html`<i class="fas fa-circle" style="transform:scale(0.5)"></i>`;
				let tooltip = "";
				const schema = piep_cms_manager.getVNodeSchema(v_node);
				if (schema) {
					icon = schema.icon;
					tooltip = schema.label;
				}
				select_blc._set_content(icon);
				select_blc.dataset.tooltip = tooltip;

				const hh = this.select_blc_size;
				const h = hh * 0.5;

				let left = blc_rect.left + h;
				let top = blc_rect.top + h + this.content_scroll.scrollTop;

				// not necessary cause nodes are sorted already
				// let moved = true;
				// while (moved) {
				// 	moved = false;
				coords.forEach((coord) => {
					if (Math.abs(coord.y - top) >= hh) {
						// no overlap in y axis
						return;
					}
					if (Math.abs(coord.x - left) < hh) {
						// overlap detected
						left = coord.x + hh;
						// moved = true;
					}
				});
				// }

				select_blc._set_absolute_pos(left, top);

				coords.push({ x: left, y: top });

				this.select_blcs.append(select_blc);
			});
	}

	startSelectingBlcs() {
		//this.finishEditingLayout();
		this.text_selection = undefined;

		this.selecting_blcs = true;
		this.has_select_pos = false;
		this.container.classList.remove("has_select_pos");
		this.container.classList.add("selecting_block");

		if (this.selecting_blcs) {
			this.displaySelectBlcs();
		}
	}

	finishSelectingBlcs() {
		this.selecting_blcs = false;
		this.has_select_pos = false;
		this.container.classList.remove("has_select_pos", "selecting_block");
		this.select_blcs._empty();

		tooltip.force_target = undefined;
	}

	initMultiSelect() {
		this.select_blc_size = 24;

		this.selecting_blcs = false;
		this.right_menu._child(".select_blcs_btn").addEventListener("click", () => {
			this.startSelectingBlcs();
		});

		this.content_scroll.addEventListener("scroll", () => {
			if (!this.selecting_blcs) {
				return;
			}

			if (this.select_scroll_timeout) {
				clearTimeout(this.select_scroll_timeout);
			}

			this.select_scroll_timeout = setTimeout(() => {
				this.select_scroll_timeout = undefined;
				this.displaySelectBlcs();
			}, 100);
		});
	}

	initInserting() {
		this.insert_blc_size = 24;

		this.content_scroll.addEventListener("scroll", () => {
			if (!this.grabbed_v_node) {
				return;
			}

			if (this.grab_scroll_timeout) {
				clearTimeout(this.grab_scroll_timeout);
			}

			this.grab_scroll_timeout = setTimeout(() => {
				this.grab_scroll_timeout = undefined;
				this.displayInsertPositions();
			}, 100);
		});
	}

	initLayoutEdit() {
		this.layout_control_size = 15;

		this.container.addEventListener("mousedown", (ev) => {
			if (!this.editing_layout) {
				return;
			}

			const target = $(ev.target);

			const layout_control = target._parent(".layout_control");

			if (layout_control) {
				this.layout_control_prop = layout_control.dataset.layout_prop;
				/** @type {DirectionEnum} */
				// @ts-ignore
				this.layout_control_dir = layout_control.dataset.layout_dir;
				/** @type {CornerEnum} */
				// @ts-ignore
				this.layout_corner = layout_control.dataset.corner;

				const v_node_data = this.getFocusVNodeData();
				const v_node = v_node_data.v_node;
				//const parent_v_node = v_node_data.parent_v_nodes[0];

				const focus_node = this.getNode(this.focus_node_vid);
				const focus_node_parent = focus_node._parent();
				const focus_node_rect = focus_node.getBoundingClientRect();
				const visible_width = focus_node_rect.width;
				const visible_parent_width = focus_node_parent.getBoundingClientRect().width;

				this.layout_control_grabbed_index = getNodeIndex(layout_control);
				layout_control.classList.add("grabbed");

				const care_about_resolutions = this.getResolutionsWeCareAbout();
				const v_node_styles = v_node.styles;
				if (!v_node_styles.df) {
					v_node_styles.df = {};
				}
				/** @type {string} */
				let prop_val_from_style = def(v_node_styles.df[this.layout_control_prop], "");
				care_about_resolutions.forEach((res) => {
					if (!v_node_styles[res]) {
						return;
					}
					const w = v_node_styles[res][this.layout_control_prop];
					if (w) {
						prop_val_from_style = w;
					}
				});

				if (this.layout_control_prop === "width") {
					this.layout_control_unit = prop_val_from_style.match(/\d*px/) ? "px" : "%";
				} else {
					this.layout_control_unit = prop_val_from_style.match(/\d*%/) ? "%" : "px";
				}
				this.layout_control_percent = visible_parent_width * 0.01;

				this.layout_control_base_value = 0;
				// if (this.layout_control_unit === "px") {
				// 	if (this.layout_control_prop === "width") {
				// 		this.layout_control_base_value = visible_width;
				// 	}
				// } else {
				const val_from_style_num = numberFromStr(prop_val_from_style);
				if (val_from_style_num) {
					this.layout_control_base_value = val_from_style_num;
				} else {
					if (this.layout_control_prop === "width") {
						this.layout_control_base_value = (visible_width / visible_parent_width) * 100;
					}
				}
				//}

				if (focus_node_parent.classList.contains("module_grid")) {
					this.after_grab_v_dom = cloneObject(this.v_dom);

					/**
					 *
					 * @returns {insertBlc}
					 */
					const getInsertBlc = () => {
						const insert_blc = document.createElement("DIV");
						insert_blc.classList.add("insert_blc");
						this.insert_blcs.append(insert_blc);

						// @ts-ignore
						return $(insert_blc);
					};

					focus_node_parent._children(".cell_float").forEach((cell) => {
						const row = +cell.dataset.r;
						const column = +cell.dataset.c;

						const rect = cell.getBoundingClientRect();
						const corner_insert_blc = getInsertBlc();
						corner_insert_blc._set_content(html`<i class="fas fa-plus"></i>`);

						const s = v_node.styles[this.selected_resolution];

						if (this.layout_corner === "bottomright") {
							if (row < +s.gridRowStart || column < +s.gridColumnStart) {
								return;
							}
							corner_insert_blc._insert_action = () => {
								const v_node = this.getVNodeById(this.focus_node_vid);
								const s = v_node.styles[this.selected_resolution];
								s.gridRowEnd = row + 1 + "";
								s.gridColumnEnd = column + 1 + "";
							};
							corner_insert_blc._set_absolute_pos(rect.left + rect.width, rect.top + rect.height + this.content_scroll.scrollTop);
						}
						if (this.layout_corner === "bottomleft") {
							if (row < +s.gridRowStart || column > +s.gridColumnEnd - 1) {
								return;
							}
							corner_insert_blc._insert_action = () => {
								const v_node = this.getVNodeById(this.focus_node_vid);
								const s = v_node.styles[this.selected_resolution];
								s.gridRowEnd = row + 1 + "";
								s.gridColumnStart = column + "";
							};
							corner_insert_blc._set_absolute_pos(rect.left, rect.top + rect.height + this.content_scroll.scrollTop);
						}
						if (this.layout_corner === "topright") {
							if (row > +s.gridRowEnd - 1 || column < +s.gridColumnStart) {
								return;
							}
							corner_insert_blc._insert_action = () => {
								const v_node = this.getVNodeById(this.focus_node_vid);
								const s = v_node.styles[this.selected_resolution];
								s.gridRowStart = row + "";
								s.gridColumnEnd = column + 1 + "";
							};
							corner_insert_blc._set_absolute_pos(rect.left + rect.width, rect.top + this.content_scroll.scrollTop);
						}
						if (this.layout_corner === "topleft") {
							if (row > +s.gridRowEnd - 1 || column > +s.gridColumnEnd - 1) {
								return;
							}
							corner_insert_blc._insert_action = () => {
								const v_node = this.getVNodeById(this.focus_node_vid);
								const s = v_node.styles[this.selected_resolution];
								s.gridRowStart = row + "";
								s.gridColumnStart = column + "";
							};
							corner_insert_blc._set_absolute_pos(rect.left, rect.top + this.content_scroll.scrollTop);
						}
					});
				}

				/** @type {Position} */
				this.layout_control_grabbed_pos = cloneObject(mouse.pos);
				this.layout_control_grabbed_scroll_top = this.content_scroll.scrollTop;

				ev.preventDefault();
			} else {
				// if (!target._parent(this.side_menu)) {
				// 	this.finishEditingLayout();
				// }
			}
		});
	}

	initClipboardMenu() {
		document.addEventListener("visibilitychange", () => {
			if (!document.hidden) {
				this.updateClipboard();
			}
		});

		this.updateClipboard();
	}

	updateClipboard() {
		let menu_html = "";

		let piep_cms_clipboard;
		const piep_cms_clipboard_json = localStorage.getItem("piep_cms_clipboard_json");
		try {
			piep_cms_clipboard = JSON.parse(piep_cms_clipboard_json);
		} catch (e) {}

		if (!piep_cms_clipboard) {
			piep_cms_clipboard = [];
		}

		menu_html += JSON.stringify(piep_cms_clipboard);

		//menu_html += html` <div>adadadada dsaad xxx</div> `;

		this.clipboard_menu._set_content(menu_html);
	}

	initAddBlockMenu() {
		let menu_html = "";

		piep_cms_manager.blcs_schema.forEach((e, index) => {
			e.priority = def(e.priority, 0) - index * 0.001;
		});
		piep_cms_manager.blcs_schema.sort((a, b) => Math.sign(b.priority - a.priority));

		/**
		 *
		 * @param {CmsBlockGroup} group
		 * @param {string} label
		 */
		const displayGroup = (group, label) => {
			let blocks_html = "";
			for (const blc_schema of piep_cms_manager.blcs_schema.filter((b) => !b.exclude_from_add_blc_menu).filter((b) => b.group === group)) {
				const tooltip = blc_schema.tooltip ? `data-tooltip="${blc_schema.tooltip}"` : "";
				let classes = "btn subtle block_to_add";
				if (blc_schema.is_advanced) {
					classes += " case_advanced";
				}
				blocks_html += html` <div class="${classes}" data-id="${blc_schema.id}" ${tooltip}>${blc_schema.icon} ${blc_schema.label}</div> `;
			}
			menu_html += html`<div class="label">${label}</div>
				<div class="blocks">${blocks_html}</div>`;
		};

		displayGroup("container", "Kontenery");
		displayGroup("text", "Tekst");
		displayGroup("media", "Media");
		displayGroup("module", "Moduły");

		this.add_block_menu._set_content(menu_html);
	}

	/**
	 *
	 * @param {string} prop_str
	 * @param {number} vid
	 * @param {PiepNode} input
	 */
	setPropOfVNode(prop_str, vid, input) {
		const v_node_data = this.getVNodeDataById(vid);
		if (!v_node_data) {
			return;
		}
		const v_node = v_node_data.v_node;

		// if (piep_cms_manager.text_container_props.includes(prop_str) && this.isTextable(v_node)) {
		// 	const parent = v_node_data.parent_v_nodes[0];
		// 	if (parent) {
		// 		this.setPropOfVNode(prop_str, parent.id, input);
		// 		return;
		// 	}
		// } else if (piep_cms_manager.textable_props.includes(prop_str) && this.isTextContainer(v_node)) {
		// 	// to all children
		// 	const children = v_node_data.v_node.children;
		// 	if (children) {
		// 		children.forEach((child) => {
		// 			this.setPropOfVNode(prop_str, child.id, input);
		// 		});
		// 	}
		// 	return;
		// }

		/** @type {string} */
		let val = input._get_value();
		let prop_ref = v_node;

		if (prop_str === "attrs.data-bckg_src" && val) {
			const focus_node = piep_cms.getNode(vid);
			focus_node.classList.remove("wo997_bckg_img_shown");
		}

		if (prop_str.startsWith("styles.")) {
			prop_ref = v_node.styles[this.selected_resolution];
			prop_str = prop_str.substring("styles.".length);

			if (val.endsWith("*")) {
				// maintain * at the end and trim later
				val = escapeCSS(prop_str, val.substring(0, val.length - 1)) + "*";
			} else {
				val = escapeCSS(prop_str, val);
			}
		} else if (prop_str.startsWith("responsive_settings.")) {
			prop_ref = v_node.responsive_settings[this.selected_resolution];
			prop_str = prop_str.substring("responsive_settings.".length);
		} else if (prop_str.startsWith("attrs.")) {
			prop_ref = v_node.attrs;
			prop_str = prop_str.substring("attrs.".length);
		} else if (prop_str.startsWith("settings.")) {
			prop_ref = v_node.settings;
			prop_str = prop_str.substring("settings.".length);
		}

		const bind_wrapper = input._parent(`[data-bind_wrapper]`);

		const bind_dirs = [];
		if (bind_wrapper) {
			const bind_dir = input.dataset.bind_dir;
			const bind_what = bind_wrapper.dataset.bind_wrapper;

			if (v_node.settings) {
				const bind_type = this.getVNodeResponsiveProp("responsive_settings", v_node, `bind_${bind_what}`);

				if (bind_dir === "left") {
					if (bind_type === "opposite" || bind_type === "all") {
						bind_dirs.push("right");
					}
					if (bind_type === "all") {
						bind_dirs.push("top", "bottom");
					}
				}
				if (bind_dir === "right") {
					if (bind_type === "opposite" || bind_type === "all") {
						bind_dirs.push("left");
					}
					if (bind_type === "all") {
						bind_dirs.push("top", "bottom");
					}
				}
				if (bind_dir === "top") {
					if (bind_type === "opposite" || bind_type === "all") {
						bind_dirs.push("bottom");
					}
					if (bind_type === "all") {
						bind_dirs.push("left", "right");
					}
				}
				if (bind_dir === "bottom") {
					if (bind_type === "opposite" || bind_type === "all") {
						bind_dirs.push("top");
					}
					if (bind_type === "all") {
						bind_dirs.push("left", "right");
					}
				}
			}
		}

		const all_props_to_set = [prop_str];
		bind_dirs.forEach((bind_dir) => {
			const bind_input = bind_wrapper._child(`[data-bind_dir="${bind_dir}"]`);
			//console.log(bind_input, val);
			bind_input._set_value(val, { quiet: true });
			const prop_to_set = bind_input.dataset.blc_prop.split(".")[1];
			if (prop_to_set) {
				all_props_to_set.push(prop_to_set);
			}
		});

		all_props_to_set.forEach((all_prop_str) => {
			if (val === "") {
				delete prop_ref[all_prop_str];
			} else {
				prop_ref[all_prop_str] = val;
			}
		});
	}

	initEditables() {
		this.container._children("[data-blc_prop]").forEach((input) => {
			let prop_str = input.dataset.blc_prop;
			/** @type {PiepCMSMenuName} */
			const blc_menu_name = input._parent(this.side_menu) ? "side" : "float";
			const prop_wrapper = input._parent(".prop_wrapper");
			const prop_def = (blc_menu_name === "side" ? piep_cms_manager.blc_props : piep_cms_manager.floating_blc_props).find(
				(b) => b.name === prop_wrapper.dataset.prop
			);

			const setProp = () => {
				if (this.text_selection && piep_cms_manager.textable_props.includes(prop_str)) {
					/** @type {PiepTextPartialRange[]} */
					let partial_ranges;
					if (this.text_selection.length === 0) {
						partial_ranges = [
							{ vid: this.text_selection.focus_vid, start: this.text_selection.focus_offset, end: this.text_selection.focus_offset },
						];
					} else {
						partial_ranges = [...this.text_selection.partial_ranges];
					}

					partial_ranges.forEach((range) => {
						const v_node_data = this.getVNodeDataById(range.vid);
						if (!v_node_data) {
							return;
						}
						const v_node = v_node_data.v_node;

						const bef_vid = this.getNewBlcId();
						const mid_vid = bef_vid + 1;
						const aft_vid = bef_vid + 2;

						/** @type {vDomNode[]} */
						const put_v_nodes = [];

						/**
						 *
						 * @param {number} id
						 * @param {string} text
						 * @returns
						 */
						const getSpan = (id, text) => {
							return {
								id,
								tag: "span",
								styles: {},
								text,
								attrs: {},
								classes: [],
								settings: {},
								responsive_settings: {},
							};
						};

						if (range.start > 0) {
							put_v_nodes.push(getSpan(bef_vid, v_node.text.substring(0, range.start)));
						}

						const mid_text = v_node.text.substring(range.start, range.end);
						put_v_nodes.push(getSpan(mid_vid, mid_text));

						if (range.end < v_node.text.length) {
							put_v_nodes.push(getSpan(aft_vid, v_node.text.substring(range.end)));
						}

						// do the split and spread options
						put_v_nodes.forEach((put_v_node) => {
							deepAssign(put_v_node.styles, v_node.styles);
							deepAssign(put_v_node.attrs, v_node.attrs);
							deepAssign(put_v_node.settings, v_node.settings);
							deepAssign(put_v_node.responsive_settings, v_node.responsive_settings);
						});
						v_node_data.v_nodes.splice(v_node_data.index, 1, ...put_v_nodes);

						this.text_selection.middle_vids.push(mid_vid);

						if (range.vid === this.text_selection.anchor_vid) {
							this.text_selection.anchor_vid = mid_vid;
							this.text_selection.anchor_offset = this.text_selection.direction === 1 ? 0 : mid_text.length;
						}
						if (range.vid === this.text_selection.focus_vid) {
							this.text_selection.focus_vid = mid_vid;
							this.text_selection.focus_offset = this.text_selection.direction === 1 ? mid_text.length : 0;
						}
					});

					this.text_selection.partial_ranges = [];
				}

				const set_prop_of_ids = [];
				/**
				 *
				 * @param {number[]} vids
				 */
				const considerVid = (...vids) => {
					vids.forEach((vid) => {
						if (!set_prop_of_ids.includes(vid)) {
							set_prop_of_ids.push(vid);
						}
					});
				};

				if (piep_cms_manager.text_container_props.includes(prop_str)) {
					if (this.text_selection) {
						this.getAllTextSelectionVids().forEach((vid) => {
							const v_node = this.getVNodeDataById(vid);
							if (!v_node) {
								return;
							}
							const parent_v_node = v_node.parent_v_nodes[0];
							if (parent_v_node) {
								considerVid(parent_v_node.id);
							}
						});
					}
				} else {
					if (this.text_selection) {
						considerVid(...this.getAllTextSelectionVids());
					}
				}

				if (set_prop_of_ids.length === 0 && this.focus_node_vid !== undefined) {
					considerVid(this.focus_node_vid);
				}

				this.preRecreateDom();
				set_prop_of_ids.forEach((vid) => {
					this.setPropOfVNode(prop_str, vid, input);
				});
				this.update({ all: true });

				if (this.text_selection) {
					this.setFocusNode(this.text_selection.focus_vid);
				}
				if (prop_def && prop_def.affects_selection) {
					this.displaySelectionBreadcrumbs();
				}
				this.displayTextSelection({ force: true });

				if (blc_menu_name === "float" && this.text_selection) {
					if (input._parent(this.float_menu)) {
						this.setContentActive(true);
					}
				}

				this.pushHistory(`set_blc_prop_${prop_str}`);
				this.filterMenu({ from_blc_menu_name: blc_menu_name });

				this.displayNodeLayout();
			};

			input.addEventListener("input", () => {
				setProp();
			});
			input.addEventListener("change", () => {
				setProp();
				// ugh? why we did that in the first place?
				//setTimeout(setProp);
			});
		});
	}

	initPaste() {
		this.container.addEventListener("paste", (ev) => {
			if (!this.content_active || !this.text_selection) {
				return;
			}

			ev.preventDefault();

			const pasted_html = ev.clipboardData.getData("text/html");
			const pasted_text = ev.clipboardData.getData("text/plain");

			this.removeTextInSelection();

			if (pasted_text && !pasted_html) {
				// maybe do the split dude, but it's unnecessary now
				this.insertText(pasted_text.replace(/[\n\r]/g, ""));
				return;
			}

			if (!pasted_html) {
				return;
			}

			this.paste_html._set_content(pasted_html);

			/** @type {vDomNode[]} */
			let insert = [];

			const next_vid = this.breakTextAtCursor();

			let new_id = this.getNewBlcId();

			const available_text_blocks = ["h1", "h2", "h3", "p", "li"];

			/**
			 *
			 * @param {PiepNode} node
			 */
			const traverseNode = (node) => {
				if (node.childNodes) {
					node.childNodes.forEach((child) => {
						if (child.nodeType === Node.TEXT_NODE) {
							// span wants to go into last text block, find it!

							const plain_text = child.textContent.replace(/[\n\r]/g, "");
							let success = false;

							const insert_span = {
								id: new_id++,
								classes: [],
								attrs: {},
								styles: {},
								tag: "span",
								text: plain_text,
							};

							/**
							 *
							 * @param {vDomNode[]} v_nodes
							 */
							const traverseInsert = (v_nodes) => {
								const last_v_node = v_nodes[v_nodes.length - 1];
								if (!last_v_node) {
									return;
								}
								if (available_text_blocks.includes(last_v_node.tag)) {
									last_v_node.children.push(insert_span);
									success = true;
								} else if (last_v_node.children) {
									traverseInsert(last_v_node.children);
								}
							};
							traverseInsert(insert);

							if (!success) {
								insert.push({ id: new_id++, classes: [], attrs: {}, styles: {}, tag: "p", children: [insert_span] });
							}
						} else if (child.nodeType === Node.ELEMENT_NODE) {
							const sub_node = $(child);

							const tag = sub_node.tagName.toLowerCase();
							if (tag === "br") {
								insert.push({ id: new_id++, classes: [], attrs: {}, styles: {}, tag: "p", children: [] });
							} else if (tag === "ul" || tag === "ol") {
								insert.push({ id: new_id++, classes: [], attrs: {}, styles: {}, tag: "ul", children: [] });
							} else if (tag === "li") {
								/**
								 *
								 * @param {vDomNode[]} v_nodes
								 */
								const traverseInsert = (v_nodes) => {
									const last_v_node = v_nodes[v_nodes.length - 1];
									if (!last_v_node) {
										return;
									}
									if (last_v_node.tag === "ul") {
										last_v_node.children.push({ id: new_id++, classes: [], attrs: {}, styles: {}, tag: "li", children: [] });
									} else if (last_v_node.children) {
										traverseInsert(last_v_node.children);
									}
								};
								traverseInsert(insert);
							} else if (available_text_blocks.includes(tag)) {
								insert.push({ id: new_id++, classes: [], attrs: {}, styles: {}, tag, children: [] });
							}

							traverseNode(sub_node);
						}
					});
				}
			};

			traverseNode(this.paste_html);

			const next_v_node_data = this.getVNodeDataById(next_vid);
			const next_v_node = next_v_node_data.v_node;
			const prev_v_node = next_v_node_data.v_nodes[next_v_node_data.index - 1];
			next_v_node_data.v_nodes.splice(next_v_node_data.index, 0, ...insert);

			this.update({ all: true });

			const first_insert_v_node = insert[0];
			if (first_insert_v_node) {
				if (this.isTextContainer(prev_v_node) && this.isTextContainer(first_insert_v_node)) {
					const first_textable = first_insert_v_node.children[0];

					this.text_selection.focus_vid = first_textable.id;
					this.text_selection.focus_offset = 0;
					this.collapseTextSelection();

					this.deleteAction(-1);
				}
			}

			const last_insert_v_node = insert[insert.length - 1];
			if (last_insert_v_node) {
				if (this.isTextContainer(next_v_node) && this.isTextContainer(last_insert_v_node)) {
					const first_textable = next_v_node.children[0];

					// TODO: nice to have that selection even if can't merge
					this.text_selection.focus_vid = first_textable.id;
					this.text_selection.focus_offset = 0;
					this.collapseTextSelection();

					this.deleteAction(-1);
				}
			}

			this.manageText();
		});
	}

	/**
	 *
	 * @param {vDomNode} v_node
	 */
	setNewIdsOnVNode(v_node) {
		let next_id = this.getNewBlcId();

		/**
		 * @param {vDomNode} v_node
		 */
		const setIds = (v_node) => {
			v_node.id = next_id;
			next_id++;
			if (v_node.children) {
				v_node.children.forEach((child) => {
					setIds(child);
				});
			}
		};
		setIds(v_node);
	}

	/**
	 *
	 * @param {vDomNode} v_node
	 * @param {{
	 * is_new?: boolean
	 * }} options
	 * @returns
	 */
	grabBlockFromVNode(v_node, options = {}) {
		v_node = cloneObject(v_node);
		this.setNewIdsOnVNode(v_node);

		this.v_dom.push(v_node); // hidden at the end ;) removed right when grab is triggered
		this.update({ all: true }); // creates the node to grab
		this.setFocusNode(v_node.id);
		this.text_selection = undefined;

		const grab = () => {
			this.grabBlock({ type: "insert", is_new: options.is_new });
		};
		if (piep_cms_manager.backend_rendering) {
			this.container.addEventListener("rendered_backend_modules", grab, { once: true });
		} else {
			grab();
		}

		// TODO: think about it baby
		this.setContentActive(true);
	}

	/**
	 *
	 * @param {number} vid
	 */
	selectTextableContents(vid) {
		const v_node = this.getVNodeById(vid);
		this.text_selection = {
			anchor_vid: vid,
			anchor_offset: 0,
			focus_vid: vid,
			focus_offset: v_node.text.length,
			middle_vids: [vid],
			partial_ranges: [],
			// @ts-ignore
			direction: 1,
			length: v_node.text.length,
			single_node: true,
		};
	}

	getSelectableBlcSelector() {
		let blc_selector = ".piep_editor_content .blc:not(.editor_disabled)";
		// if (this.editing_layout) {
		// 	blc_selector += ":not(.textable)";
		// }
		return blc_selector;
	}

	setDummySelection() {
		this.removing_selection = true;
		setSelectionByIndex($(".piep_editor_header"), 0);
	}

	setContentActive(active) {
		if (active && this.text_selection && !this.content_active) {
			setTimeout(() => {
				this.content_active = true;
			});
		} else {
			this.content_active = active;
			this.content.dataset.tooltip_position = "cursor";
		}
		this.content.dataset.tooltip =
			!active && this.text_selection ? "Kliknij by powrócić do edycji tekstu w miejscu ostatniego zaznaczenia" : "";
	}

	initClick() {
		document.addEventListener("mouseup", (ev) => {
			if (!this.content_active || !this.float_menu.classList.contains("hidden")) {
				return;
			}
			// why? so the selectionchange actually occours next time we click something

			if (this.remove_selection_timeout) {
				clearTimeout(this.remove_selection_timeout);
				this.remove_selection_timeout = undefined;
			}
			this.remove_selection_timeout = setTimeout(() => {
				this.remove_selection_timeout = undefined;
				this.setDummySelection();
			}, 200);
		});

		this.content.addEventListener("click", (ev) => {
			const target = $(ev.target);

			if (target._parent("a")) {
				ev.preventDefault();
			}
		});

		document.addEventListener("mousedown", (ev) => {
			const target = $(ev.target);

			if (target._parent(this.float_menu)) {
				return;
			}
			const content_active = !!(target._parent(this.content) || target._parent(".v_node_label"));
			this.setContentActive(content_active);

			const block_to_add_btn = target._parent(".block_to_add");
			if (block_to_add_btn) {
				const blc_schema = piep_cms_manager.blcs_schema.find((e) => e.id === block_to_add_btn.dataset.id);
				this.grabBlockFromVNode(blc_schema.v_node, { is_new: true });
				return;
			}

			if (this.remove_selection_timeout) {
				clearTimeout(this.remove_selection_timeout);
				this.remove_selection_timeout = undefined;
			}

			if (this.content_active && this.text_selection && ev.detail > 1) {
				const vid = +this.text_selection.focus_vid;

				if (ev.detail === 2) {
					this.selectTextableContents(vid);
				} else {
					const focus_v_node_data = this.getFocusVNodeData();
					this.selectTextContainerContents(focus_v_node_data.parent_v_nodes[0].id);
				}
				ev.preventDefault();
			}

			const click_blc = target._parent(this.getSelectableBlcSelector());
			if (this.content_active && click_blc) {
				const click_blc_vid = +click_blc.dataset.vid;
				const click_v_node_data = this.getVNodeDataById(click_blc_vid);
				const click_v_node = click_v_node_data.v_node;

				//console.log(click_blc);

				// let selection propagate basically
				setTimeout(() => {
					if (click_v_node) {
						if (this.text_selection) {
							const text_focus_node = this.getNode(this.text_selection.focus_vid);
							if (click_blc.classList.contains("textable")) {
								if (click_blc._prev() === text_focus_node) {
									// fixes inaccurate selection on edge cases
									this.text_selection.focus_vid = +click_blc.dataset.vid;
									this.text_selection.focus_offset = 0;
									this.collapseTextSelection();
								}

								this.setFocusNode(click_v_node.id);
								this.pushHistory("set_focus_node");
							} else {
								if (ev.detail > 1 || !click_blc.classList.contains("text_container")) {
									this.setFocusNode(click_v_node.id);
									this.text_selection = undefined;
									this.pushHistory("set_focus_node");
								}
							}
						} else {
							this.setFocusNode(click_v_node.id);
							this.pushHistory("set_focus_node");
						}
					}
				});
			}

			const select_blc = this.getSelectBlcUnderMouse();
			if (select_blc) {
				this.setFocusNode(+select_blc.dataset.vid);
				const v_node = this.getFocusVNode();
				if (v_node.text !== undefined) {
					this.text_selection = {
						anchor_offset: v_node.text.length,
						anchor_vid: v_node.id,
						focus_offset: v_node.text.length,
						focus_vid: v_node.id,
						// @ts-ignore
						direction: 1,
						length: 0,
						middle_vids: [],
						partial_ranges: [],
						single_node: true,
					};
					this.setContentActive(true);
				}
			}
			if (true) {
				// TODO: hot key to allow multi selection
				this.finishSelectingBlcs();
			}

			const insert_blc = this.getInsertBlcUnderMouse();

			if (insert_blc && insert_blc.classList.contains("multiple")) {
				this.float_multi_insert_bckg.classList.remove("hidden");

				const insert_blc_rect = insert_blc.getBoundingClientRect();

				this.float_multi_insert_bckg._set_absolute_pos(
					insert_blc_rect.left + insert_blc_rect.width * 0.5,
					insert_blc_rect.top + insert_blc_rect.height * 0.5 + this.content_scroll.scrollTop
				);
				this.showing_float_multi_of_blc = insert_blc;
				insert_blc.classList.add("hidden");
				const popup_blcs = insert_blc._popup_blcs;
				popup_blcs.forEach((popup_blc) => {
					popup_blc.classList.add("over");
					popup_blc.classList.remove("hidden");
				});

				// explode positions
				for (let tries = 0; tries < 7; tries++) {
					let fine = true;
					const len = popup_blcs.length;
					for (let a = 0; a < len; a++) {
						const ba = popup_blcs[a];
						const ba_rect = ba.getBoundingClientRect();
						for (let b = a + 1; b < len; b++) {
							const bb = popup_blcs[b];
							const bb_rect = bb.getBoundingClientRect();
							const s = bb.offsetHeight;
							let dx = ba_rect.left - bb_rect.left;
							let dy = ba_rect.top - bb_rect.top;
							if (Math.abs(dx) < 0.01) {
								dx = -1; // help it a lil bit
							}
							if (Math.abs(dx) < bb.offsetWidth && Math.abs(dy) < bb.offsetHeight) {
								const dist = Math.sqrt(dx * dx + dy * dy);
								const mv_fac = (s * 0.2) / dist;
								let mvx = dx * mv_fac;
								let mvy = dy * mv_fac;
								ba._set_absolute_pos(ba_rect.left + s * 0.5 + mvx, ba_rect.top + s * 0.5 + mvy + this.content_scroll.scrollTop);
								bb._set_absolute_pos(bb_rect.left + s * 0.5 - mvx, bb_rect.top + s * 0.5 - mvy + this.content_scroll.scrollTop);
								fine = false;
							}
						}
					}

					if (fine) {
						break;
					}
				}

				const float_multi_insert_bckg_rect = this.float_multi_insert_bckg.getBoundingClientRect();
				let max_ds = 0;
				popup_blcs.forEach((popup_blc) => {
					const pblc_rect = popup_blc.getBoundingClientRect();

					const dx = float_multi_insert_bckg_rect.left - pblc_rect.left + (float_multi_insert_bckg_rect.width - pblc_rect.width) * 0.5;
					const dy = float_multi_insert_bckg_rect.top - pblc_rect.top + (float_multi_insert_bckg_rect.height - pblc_rect.height) * 0.5;
					const dists = dx * dx + dy * dy;
					if (dists > max_ds) {
						max_ds = dists;
					}
				});

				const size = Math.sqrt(max_ds) * 2 + 45 + "px";
				this.float_multi_insert_bckg.style.width = size;
				this.float_multi_insert_bckg.style.height = size;

				this.container.classList.add("float_multi_insert_visible");
			} else if (this.grabbed_v_node) {
				this.releaseBlock();
			}
		});
	}

	/**
	 *
	 * @param {{
	 * restore_selection?: boolean
	 * }} options
	 * @returns
	 */
	copyTextSelection(options = {}) {
		if (!this.text_selection) {
			return;
		}

		const text_selection_copy = cloneObject(this.text_selection);

		const range = document.createRange();

		/** @type {number} */
		let start_vid;
		/** @type {number} */
		let start_offset;
		/** @type {number} */
		let end_vid;
		/** @type {number} */
		let end_offset;

		if (this.text_selection.direction === 1) {
			start_vid = this.text_selection.anchor_vid;
			start_offset = this.text_selection.anchor_offset;
			end_vid = this.text_selection.focus_vid;
			end_offset = this.text_selection.focus_offset;
		} else {
			start_vid = this.text_selection.focus_vid;
			start_offset = this.text_selection.focus_offset;
			end_vid = this.text_selection.anchor_vid;
			end_offset = this.text_selection.anchor_offset;
		}

		range.setStart(getTextNode(this.getNode(start_vid)), start_offset);
		range.setEnd(getTextNode(this.getNode(end_vid)), end_offset);
		copyRangeToClipboard(range);

		if (options.restore_selection) {
			setTimeout(() => {
				this.text_selection = text_selection_copy;
				this.setDummySelection();
			});
		}
	}

	initTyping() {
		document.addEventListener("keydown", (ev) => {
			if (!this.content_active) {
				return;
			}

			if (this.text_selection) {
				this.select_blc_active = false;

				if (ev.key && ev.key.length === 1) {
					if (!ev.ctrlKey) {
						ev.preventDefault();

						const focus_vid = this.text_selection.focus_vid;
						const focus_node = this.getNode(focus_vid);

						if (focus_node && focus_node.classList.contains("textable")) {
							this.removeTextInSelection();
							this.insertText(ev.key);
							this.pushHistory("insert_text");
						}
					}

					const lower_key = ev.key.toLocaleLowerCase();

					if (ev.ctrlKey) {
						if (lower_key === "c") {
							ev.preventDefault();
							this.copyTextSelection({ restore_selection: true });
						}
						if (lower_key == "z") {
							ev.preventDefault();
							this.undoHistory();
						}
						if (lower_key == "y") {
							ev.preventDefault();
							this.redoHistory();
						}
						if (lower_key == "x") {
							ev.preventDefault();
							this.copyTextSelection();
							this.removeTextInSelection();
						}
					}
				}
				if (ev.key === "Backspace") {
					ev.preventDefault();
					this.deleteAction(-1);
				}
				if (ev.key === "Delete") {
					ev.preventDefault();
					this.deleteAction(1);
				}
				if (ev.key === "ArrowLeft") {
					ev.preventDefault();
					this.moveCursorSideways(-1, ev.shiftKey);
				}
				if (ev.key === "ArrowRight") {
					ev.preventDefault();
					this.moveCursorSideways(1, ev.shiftKey);
				}
				// if (ev.key === "Home") {
				// 	ev.preventDefault();
				// 	this.moveCursorSideways(-1);
				// }
				// if (ev.key === "End") {
				// 	ev.preventDefault();
				// 	this.moveCursorSideways(1);
				// }
				if (ev.key === "ArrowUp") {
					ev.preventDefault();
					this.moveCursorFromAnywhere(0, -1, ev.shiftKey);
				}
				if (ev.key === "ArrowDown") {
					ev.preventDefault();
					this.moveCursorFromAnywhere(0, 1, ev.shiftKey);
				}
				if (ev.key === "Enter") {
					ev.preventDefault();
					this.breakTextAtCursor();
				}

				this.scrollToCursor();
			}

			this.manageText();
		});
	}

	/**
	 *
	 * @param {Direction} dir
	 */
	deleteAction(dir) {
		const focus_vid = this.text_selection.focus_vid;
		const focus_v_node_data = this.getVNodeDataById(focus_vid);
		const focus_v_node = focus_v_node_data ? focus_v_node_data.v_node : undefined;
		const focus_offset = this.text_selection.focus_offset;

		if (this.text_selection.length > 0) {
			this.removeTextInSelection();
		} else if (focus_v_node) {
			let text = focus_v_node.text;
			const edge = dir === 1 ? focus_offset >= text.length : focus_offset <= 0;
			if (edge) {
				const node = this.getNode(this.text_selection.focus_vid);
				const near_textable = dir === 1 ? node._next() : node._prev();
				if (near_textable) {
					const next_text = near_textable.textContent;
					this.text_selection.focus_vid = +near_textable.dataset.vid;
					this.text_selection.focus_offset = dir === 1 ? 0 : next_text.length;

					// recursive yay
					this.deleteAction(dir);
					return;
				} else {
					const next_text_container = this.getDeepSibling(node, ".text_container", dir);
					if (next_text_container) {
						const next_text_container_vid = +next_text_container.dataset.vid;
						const next_text_container_v_node_data = this.getVNodeDataById(next_text_container_vid);
						const next_text_container_v_node = next_text_container_v_node_data.v_node;

						const focus_v_node_parent = focus_v_node_data.parent_v_nodes[0];

						if (next_text_container_v_node && next_text_container_v_node.children && focus_v_node_parent.children) {
							if (dir === 1) {
								focus_v_node_parent.children.push(...next_text_container_v_node.children);
								this.removeVNodes([next_text_container_v_node.id]);
							} else {
								next_text_container_v_node.children.push(...focus_v_node_parent.children);
								this.removeVNodes([focus_v_node_parent.id]);
							}
						}
					}
				}
			} else {
				if (dir === -1) {
					this.text_selection.focus_offset--;
				}
				focus_v_node.text = text.substr(0, this.text_selection.focus_offset) + text.substr(this.text_selection.focus_offset + 1);
			}

			this.collapseTextSelection();

			this.recreateDom();
			//this.displayInspectorTree();

			this.pushHistory("delete_text");
		}
	}

	breakTextAtCursor() {
		const focus_vid = this.text_selection.focus_vid;
		const focus_v_node_data = this.getVNodeDataById(focus_vid);
		const focus_v_node = focus_v_node_data ? focus_v_node_data.v_node : undefined;
		const focus_offset = this.text_selection.focus_offset;

		const parent_v_node = focus_v_node_data.parent_v_nodes[0];
		const grand_parent_v_node = focus_v_node_data.parent_v_nodes[1];

		const ret_vid = this.getNewBlcId();
		let new_vid = ret_vid;

		if (grand_parent_v_node && grand_parent_v_node.module_name === "grid") {
			const parent_v_node_data = this.getVNodeDataById(parent_v_node.id);
			parent_v_node_data.v_nodes.splice(parent_v_node_data.index, 1, {
				id: new_vid++,
				tag: "div",
				styles: {
					df: {
						gridRowStart: parent_v_node.styles.df.gridRowStart,
						gridColumnStart: parent_v_node.styles.df.gridColumnStart,
						gridRowEnd: parent_v_node.styles.df.gridRowEnd,
						gridColumnEnd: parent_v_node.styles.df.gridColumnEnd,
					},
				},
				attrs: {},
				classes: ["vertical_container"],
				children: [parent_v_node],
			});

			this.update({ all: true });

			return this.breakTextAtCursor();
		}

		const text = focus_v_node.text;
		if (text !== undefined) {
			const parent_v_node = focus_v_node_data.parent_v_nodes[0];
			if (this.isTextContainer(parent_v_node)) {
				const parent_v_node_data = this.getVNodeDataById(parent_v_node.id);
				const move_v_nodes_on_right_down = focus_v_node_data.v_nodes.splice(
					focus_v_node_data.index,
					focus_v_node_data.v_nodes.length - focus_v_node_data.index
				);

				const tag = parent_v_node.tag === "li" ? "li" : "p";

				// place it below the text container, including the v_node
				parent_v_node_data.v_nodes.splice(parent_v_node_data.index + 1, 0, {
					tag,
					id: new_vid++,
					styles: {},
					classes: [],
					attrs: {},
					children: move_v_nodes_on_right_down,
				});

				/** @type {vDomNode} */
				// the one that stays on top where v_node has been previously
				const new_old_v_node = cloneObject(focus_v_node);
				new_old_v_node.id = new_vid++;

				// text split
				new_old_v_node.text = text.substr(0, focus_offset);
				focus_v_node.text = text.substr(focus_offset);

				focus_v_node_data.v_nodes.push(new_old_v_node);

				this.update({ all: true });

				this.text_selection.focus_vid = focus_v_node.id;
				this.text_selection.focus_offset = 0;
				this.collapseTextSelection();

				return ret_vid;
			}
		}

		this.pushHistory("insert_text");

		return undefined;
	}

	scrollToCursor() {
		this.displayTextSelection();
		const cursor_rect = this.cursor.getBoundingClientRect();

		const content_scroll_rect = this.content_scroll.getBoundingClientRect();
		const off = 100;
		const dy_top = cursor_rect.top - (content_scroll_rect.top + off);
		if (dy_top < 0) {
			this.content_scroll.scrollBy(0, dy_top);
		}
		const dy_bottom = cursor_rect.top + cursor_rect.height - (content_scroll_rect.top + content_scroll_rect.height - off);
		if (dy_bottom > 0) {
			this.content_scroll.scrollBy(0, dy_bottom);
		}
	}

	initSideMenu() {
		this.blc_menu_scroll_panel = this.side_menu._child(".blc_menu_scroll_panel");
		this.case_blc_menu_empty = this.side_menu._child(".case_blc_menu_empty");

		let blc_props_menu_html = "";
		piep_cms_manager.blc_props.forEach((blc_prop) => {
			blc_props_menu_html += html`<div
				class="prop_wrapper prop_${blc_prop.name} ${blc_prop.advanced ? "case_advanced" : ""}"
				data-prop="${blc_prop.name}"
			>
				${blc_prop.menu_html}
			</div>`;
		});
		this.blc_menu_scroll_panel._set_content(blc_props_menu_html);
		registerForms();

		this.filter_blc_menu = this.side_menu._child(".filter_blc_menu");
		this.filter_blc_menu._set_value("all");
		this.filter_blc_menu.addEventListener("change", () => {
			if (this.filter_blc_menu._get_value() === "layout") {
				this.startEditingLayout();
			} else {
				this.finishEditingLayout();
			}

			this.filterMenu({ scroll_to_top: true });
		});

		piep_cms_manager.blc_props.forEach((blc_prop) => {
			if (blc_prop.init) {
				blc_prop.init(this, this.side_menu._child(`.prop_${blc_prop.name}`));
			}
		});

		this.side_menu._children(".radio_group").forEach((r) => {
			r.classList.add("freeze");
		});
	}

	export() {
		return JSON.stringify(this.v_dom);
	}

	/**
	 *
	 * @param {vDomNode[]} set_v_dom
	 */
	import(set_v_dom) {
		this.v_dom = set_v_dom;
		this.fixMigrations();
		this.update({ all: true });
		this.setFocusNode(undefined);
		this.initHistory();
	}

	fixMigrations() {
		/**
		 * @param {vDomNode[]} v_nodes
		 */
		const traverseVDom = (v_nodes) => {
			for (const v_node of v_nodes) {
				const styles_keys = Object.keys(v_node.styles);
				if (!styles_keys.includes("df")) {
					v_node.styles = {
						df: v_node.styles,
					};
				}
				if (v_node.children) {
					traverseVDom(v_node.children);
				}
			}
		};
		traverseVDom(this.v_dom);
	}

	initSelectionBreadcrumbs() {
		this.selection_breadcrumbs = this.container._child(".piep_editor_selection_breadcrumbs");

		this.container.addEventListener("click", (ev) => {
			const target = $(ev.target);

			const unselect_everything = target._parent(".unselect_everything");
			if (unselect_everything) {
				this.setFocusNode(undefined);
				this.text_selection = undefined;
			}

			const v_node_label = target._parent(".v_node_label:not(.disabled)");
			if (v_node_label) {
				const vid = +v_node_label.dataset.vid;

				setSelectionRange(undefined);
				this.setFocusNode(vid);

				scrollIntoView(this.getNode(vid));
			}
		});
	}

	// initInspector() {
	// 	this.inspector = this.container._child(".piep_editor_inspector");
	// 	this.inspector_tree = this.inspector._child(".tree");
	// 	this.grab_inspector_btn = this.container._child(".grab_inspector_btn");

	// 	/** @type {Position} */
	// 	this.inspector_pos = { x: 1000000, y: 0 };

	// 	const edit_theme_btn = this.container._child(".edit_theme_btn");
	// 	edit_theme_btn.addEventListener("click", () => {
	// 		getThemeSettingsModal()._show({ source: edit_theme_btn });
	// 	});

	// 	this.container._child(".show_inspector_btn").addEventListener("click", () => {
	// 		this.text_selection = undefined;
	// 		this.toggleInspector();
	// 	});
	// 	this.container._child(".hide_inspector_btn").addEventListener("click", () => {
	// 		this.toggleInspector(false);
	// 	});
	// 	this.grab_inspector_btn.addEventListener("mousedown", () => {
	// 		if (!this.inspector_grabbed) {
	// 			this.inspector_grabbed = true;
	// 			this.inspector.classList.add("grabbed");
	// 		}
	// 	});

	// 	this.toggleInspector(false);

	// }

	getNewBlcId() {
		let max = this.max_vid_inside;
		/**
		 * @param {vDomNode[]} v_nodes
		 */
		const traverseVDom = (v_nodes) => {
			for (const v_node of v_nodes) {
				max = Math.max(max, v_node.id);
				if (v_node.children) {
					traverseVDom(v_node.children);
				}
			}
		};

		traverseVDom(this.v_dom);
		if (this.grabbed_v_node) {
			traverseVDom([this.grabbed_v_node]);
		}

		return max + 1;
	}

	/**
	 *
	 * @param {boolean} above
	 * @returns {string[]}
	 */
	getResolutionsWeCareAbout(above = false) {
		/** @type {string[]} */
		const care_about_resolutions = [];
		for (const [key, width] of Object.entries(responsive_breakpoints).sort((a, b) => {
			const comp_a = a[1] ? a[1] : 10000;
			const comp_b = b[1] ? b[1] : 10000;
			return Math.sign(comp_b - comp_a);
		})) {
			const eq = key === this.selected_resolution;
			if (above && eq) {
				break;
			}
			care_about_resolutions.push(key);
			if (eq) {
				break;
			}
		}

		return care_about_resolutions;
	}

	/**
	 *
	 * @param {number[]} vids
	 * @returns {boolean}
	 */
	removeVNodes(vids) {
		let anything = false;
		/**
		 * @param {vDomNode[]} v_nodes
		 */
		const traverseVNodes = (v_nodes) => {
			for (let i = 0; i < v_nodes.length; i++) {
				const v_node = v_nodes[i];
				const vid = v_node.id;
				const children = v_node.children;

				if (vids.includes(vid)) {
					v_nodes.splice(i, 1);
					i--;
					anything = true;
					continue;
				}

				if (children) {
					traverseVNodes(children);
				}
			}
		};

		traverseVNodes(this.v_dom);

		return anything;
	}

	manageText() {
		if (!this.content_active) {
			return;
		}
		// removes empty textables that are not focused btw
		// also merges textables that are similar and next to each other

		let vids = [];
		/**
		 * @param {vDomNode[]} v_nodes
		 */
		const traverseVDom = (v_nodes) => {
			const len = v_nodes.length;
			const single_node = len === 1;
			for (let i = 0; i < len; i++) {
				const v_node = v_nodes[i];
				const vid = v_node.id;
				const text = v_node.text;
				const children = v_node.children;

				if (this.isTextContainer(v_node)) {
					if (children.length === 0) {
						vids.push(vid);
						continue;
					}
				}

				if (!single_node && v_node.text !== undefined) {
					if (text === "") {
						if (!(this.text_selection && this.text_selection.focus_vid === vid)) {
							vids.push(vid);
						}
						continue;
					} else if (i + 1 < len) {
						const next_v_node = v_nodes[i + 1];

						if (
							next_v_node.text !== undefined &&
							isEquivalent(v_node.styles, next_v_node.styles) &&
							isEquivalent(v_node.attrs, next_v_node.attrs) &&
							isEquivalent(v_node.settings, next_v_node.settings) &&
							isEquivalent(v_node.responsive_settings, next_v_node.responsive_settings)
						) {
							// remove self and append text to another, ezy?
							vids.push(vid);
							if (this.text_selection) {
								if (this.text_selection.focus_vid === next_v_node.id) {
									this.text_selection.focus_offset += text.length;
								} else if (this.text_selection.focus_vid === v_node.id) {
									this.text_selection.focus_vid = next_v_node.id;
								}
							}
							next_v_node.text = text + next_v_node.text;
						}
					}
				}

				if (children) {
					traverseVDom(children);
				}
			}
		};

		traverseVDom(this.v_dom);

		const anything = this.removeVNodes(vids);
		if (anything) {
			// just in case we needed to collapse somethin
			vids = [];
			traverseVDom(this.v_dom);
			this.removeVNodes(vids);

			this.update({ dom: true, selection: true });
		}
	}

	preRecreateDom() {
		/** @type {number[]} */
		const remove_vids = [];

		/**
		 * @param {vDomNode[]} v_nodes
		 * @param {vDomNode[]} parents
		 */
		const traverseFill = (v_nodes, parents = []) => {
			for (const v_node of v_nodes) {
				if (!v_node.attrs) {
					v_node.attrs = {};
				}
				if (!v_node.settings) {
					v_node.settings = {};
				}
				if (!v_node.settings) {
					v_node.settings = {};
				}
				if (!v_node.responsive_settings) {
					v_node.responsive_settings = {};
				}
				for (const res_name of Object.keys(responsive_breakpoints)) {
					if (!v_node.styles[res_name]) {
						v_node.styles[res_name] = {};
					}
					if (!v_node.responsive_settings[res_name]) {
						v_node.responsive_settings[res_name] = {};
					}
				}

				const children = v_node.children;
				if (children) {
					traverseFill(children, [v_node, ...parents]);
				}
			}
		};

		traverseFill(this.v_dom);

		/**
		 * @param {vDomNode[]} v_nodes
		 * @param {vDomNode[]} parents
		 */
		const traverseSettings = (v_nodes, parents = []) => {
			for (const v_node of v_nodes) {
				const ressdf = v_node.responsive_settings.df;

				if (!ressdf.bind_margins) {
					ressdf.bind_margins = "none";
				}
				if (!ressdf.bind_paddings) {
					ressdf.bind_paddings = "opposite";
				}
				if (!ressdf.bind_borderWidths) {
					ressdf.bind_borderWidths = "all";
				}
				if (!ressdf.bind_borderColors) {
					ressdf.bind_borderColors = "all";
				}

				const parent = parents[0];
				// const parent_text_container = parent && this.isTextContainer(parent); // TODO: think about it - is it necessary?
				// const is_textable = this.isTextable(v_node);

				const blc_schema = piep_cms_manager.getVNodeSchema(v_node);

				if (blc_schema) {
					if (blc_schema.layout_schema === "just_content") {
						ressdf.width_type = "auto";
						for (const resn of Object.keys(v_node.styles)) {
							delete v_node.styles[resn].width;
						}
					}

					if (blc_schema.layout_schema === "needs_size") {
						if (!ressdf.width_type || ressdf.width_type === "auto") {
							ressdf.width_type = "custom";
						}
						// for (const resn of Object.keys(v_node.styles)) {
						// 	delete v_node.styles[resn].width;
						// }
					}

					if (blc_schema.layout_schema !== "has_content") {
						for (const resn of Object.keys(v_node.responsive_settings)) {
							if (resn !== "df") {
								delete v_node.responsive_settings[resn].width_type;
							}
						}
					}

					if (blc_schema.layout_schema === "has_content") {
						if (!ressdf.width_type) {
							ressdf.width_type = "full";
						}
					}
				}

				if (parent) {
					if (parent.tag === "ul" && v_node.tag !== "li") {
						v_node.tag = "li";
					}
					if (parent.tag !== "ul" && v_node.tag === "li") {
						v_node.tag = "p";
					}
				}

				if (parent && parent.module_name === "slider") {
					ressdf.width_type = "custom";
					if (!v_node.classes.includes("wo997_slide")) {
						v_node.classes.push("wo997_slide");
					}
				} else {
					const ind = v_node.classes.indexOf("wo997_slide");
					if (ind !== -1) {
						v_node.classes.splice(ind, 1);
					}
				}

				if (v_node.attrs["data-bckg_src"]) {
					if (!v_node.classes.includes("wo997_bckg_img")) {
						v_node.classes.push("wo997_bckg_img");
					}
				} else {
					const ind = v_node.classes.indexOf("wo997_bckg_img");
					if (ind !== -1) {
						v_node.classes.splice(ind, 1);
					}
				}

				if (v_node.module_name === "grid") {
					let layout_change = false;
					/** @type {number[]} */
					let grid_flow_vids;
					const ress = Object.entries(responsive_breakpoints);
					let deep_enough = false;
					for (let i = 0; i < ress.length; i++) {
						// desktop first ofc
						const res_name = ress[i][0];
						if (res_name !== this.selected_resolution && !deep_enough) {
							continue;
						}
						deep_enough = true;

						//console.log(res_name);

						const styles = v_node.styles[res_name];

						if (!styles.gridTemplateColumns) {
							styles.gridTemplateColumns = "";
						}
						if (!styles.gridTemplateRows) {
							styles.gridTemplateRows = "";
						}
						//let layout_hash = `${styles.gridTemplateColumns.split(" ").length}_${styles.gridTemplateRows.split(" ").length}.`;
						// even tiny changes change children
						let layout_hash = `${styles.gridTemplateColumns}_${styles.gridTemplateRows}.`;
						v_node.children
							.sort((a, b) => Math.sign(a.id - b.id))
							.forEach((child) => {
								const styles = child.styles[res_name];
								layout_hash += `|${child.id}_${def(styles.gridRowStart, 0)}_${def(styles.gridRowEnd, 0)}_${def(
									styles.gridColumnStart,
									0
								)}_${def(styles.gridColumnEnd, 0)}`;
							});

						if (layout_change && i > 0) {
							const top_res_name = ress[i - 1][0];
							const column = ress[i][1] < 1000;

							if (column) {
								if (!grid_flow_vids) {
									grid_flow_vids = v_node.children
										.map((child) => ({
											id: child.id,
											weight: child.styles[top_res_name].gridRowStart * 100 + child.styles[top_res_name].gridColumnStart,
										}))
										.sort((a, b) => Math.sign(a.weight - b.weight))
										.map((e) => e.id);
								}

								v_node.children
									.sort((a, b) => Math.sign(grid_flow_vids.indexOf(a.id) - grid_flow_vids.indexOf(b.id)))
									.forEach((child, index) => {
										const styles = child.styles[res_name];
										styles.gridRowStart = index + 1 + "";
										styles.gridRowEnd = index + 2 + "";
										styles.gridColumnStart = 1 + "";
										styles.gridColumnEnd = 2 + "";
									});
							} else {
								v_node.children.forEach((child, index) => {
									const styles = child.styles[res_name];
									const top_styles = child.styles[top_res_name];
									//console.log(res_name, "<", top_res_name);
									styles.gridRowStart = top_styles.gridRowStart;
									styles.gridRowEnd = top_styles.gridRowEnd;
									styles.gridColumnStart = top_styles.gridColumnStart;
									styles.gridColumnEnd = top_styles.gridColumnEnd;
								});
							}

							const styles = v_node.styles[res_name];

							if (column) {
								styles.gridTemplateColumns = "1fr";
								styles.gridTemplateRows = `auto `.repeat(v_node.children.length).trim();
							} else {
								const top_styles = v_node.styles[top_res_name];
								styles.gridTemplateColumns = top_styles.gridTemplateColumns;
								styles.gridTemplateRows = top_styles.gridTemplateRows;
							}
						}

						if (v_node.responsive_settings[res_name].layout_hash !== layout_hash) {
							//console.log(res_name, 21, v_node.responsive_settings[res_name].layout_hash, 37, layout_hash);
							v_node.responsive_settings[res_name].layout_hash = layout_hash;
							layout_change = true;
						}
					}
				}

				const children = v_node.children;
				if (children) {
					if (children.length === 0 && (v_node.tag === "ul" || v_node.tag.match(piep_cms_manager.match_text_containers))) {
						remove_vids.push(v_node.id);
					}

					traverseSettings(children, [v_node, ...parents]);
				}
			}
		};

		traverseSettings(this.v_dom);
		this.removeVNodes(remove_vids);
	}

	/**
	 *
	 * @param {{
	 * all?: boolean
	 * selection?: boolean
	 * dom?: boolean
	 * styles?: boolean
	 * }} options
	 */
	update(options) {
		this.content.style.minHeight = this.content.offsetHeight + "px";

		if (options.all || options.dom) {
			this.recreateDom();
		}
		// if (options.all || options.selection) {
		// 	this.displayInspectorTree();
		// }
		if (options.all || options.styles) {
			this.recalculateStyles();
		}

		registerForms();
		lazyLoadImages({ duration: 0 });

		window.dispatchEvent(new Event("resize"));

		this.setFocusNode(this.focus_node_vid);

		this.content.style.minHeight = "";
	}

	displaySelectionBreadcrumbs() {
		let selection_breadcrumbs_html = "";

		if (this.focus_node_vid !== undefined) {
			const v_node_data = this.getFocusVNodeData();

			if (v_node_data) {
				/** @type {vDomNode[]} */
				const crumb_v_nodes = [v_node_data.v_node, ...v_node_data.parent_v_nodes];

				crumb_v_nodes.reverse();

				selection_breadcrumbs_html =
					html`<i class="fas fa-home"></i> ` +
					crumb_v_nodes
						.map((crumb_v_node) => {
							const disabled = crumb_v_node.disabled ? " disabled" : "";
							const tooltip = disabled ? `data-tooltip="Część szablonu"` : "";

							return html`<span class="v_node_label${disabled}" data-vid="${crumb_v_node.id}" ${tooltip}>
								<i class="fas fa-chevron-right"></i>
								<span>${this.getVNodeDisplayName(crumb_v_node)}</span>
							</span>`;
						})
						.join("") +
					html` <button class="btn small transparent unselect_everything" style="margin:-4px 0" data-tooltip="Odznacz element">
						<i class="fas fa-times"></i>
					</button>`;
			}
		}

		if (!selection_breadcrumbs_html) {
			selection_breadcrumbs_html = html`<span style="color:#666">Brak zaznaczenia</span>`;
		}

		this.selection_breadcrumbs._set_content(selection_breadcrumbs_html);
	}

	/**
	 *
	 * @param {vDomNode} v_node
	 */
	getVNodeDisplayName(v_node) {
		let display_name = "";

		if (v_node.settings && v_node.settings.display_name) {
			display_name = v_node.settings.display_name;
		}

		if (!display_name) {
			const tag = v_node.tag;
			// piep_cms_manager.getVNodeSchema didnt use it cause of naming probably, kontener etc
			const blc_schema = piep_cms_manager.getVNodeSchema(v_node); //.blcs_schema.find((b) => b.id === v_node.module_name);

			// const map_tag_display_name = {
			// 	a: "Link", // never used ;)
			// 	h1: "Nagłówek H1",
			// 	h2: "Nagłówek H2",
			// 	h3: "Nagłówek H3",
			// 	h4: "Nagłówek H4",
			// 	h5: "Nagłówek H5",
			// 	h6: "Nagłówek H6",
			// 	div: "Kontener",
			// 	p: "Paragraf",
			// 	span: "Tekst",
			// 	ul: "Lista",
			// 	li: "Element listy",
			// };

			if (v_node.settings && v_node.settings.template_hook_name) {
				display_name = v_node.settings.template_hook_name;
			} else if (blc_schema) {
				display_name = blc_schema.label;
			}

			// else if (v_node.module_name) {

			// } else if (map_tag_display_name[tag]) {
			// 	//display_name = map_tag_display_name[tag];
			// }

			// if (v_node.classes.includes("vertical_container")) {
			// 	display_name = "Kontener";
			// }
		}

		if (v_node.settings && v_node.settings.link) {
			display_name += html` <i class="fas fa-link"></i>`;
		}

		return display_name;
	}

	// /**
	//  *
	//  * @param {{
	//  * vids?: number[]
	//  * }} options
	//  */
	// displayInspectorTree(options = {}) {
	// 	let pos = -1;
	// 	/** @type {number[]} */
	// 	let included_vids = [];

	// 	/**
	// 	 * @param {vDomNode[]} v_nodes
	// 	 */
	// 	const traverseVDom = (v_nodes, level = 0) => {
	// 		v_nodes.forEach((v_node, index) => {
	// 			pos++;

	// 			const vid = v_node.id;
	// 			const children = v_node.children;
	// 			included_vids.push(vid);

	// 			if (!options.vids || options.vids.includes(vid)) {
	// 				const text = v_node.text;
	// 				const display_name = this.getVNodeDisplayName(v_node);

	// 				let node = this.inspector_tree._child(`.v_node_label[data-vid="${vid}"]`);

	// 				if (!node) {
	// 					node = $(document.createElement("DIV"));
	// 				}

	// 				const before_node = this.inspector_tree._direct_children()[pos];
	// 				if (node !== before_node) {
	// 					this.inspector_tree.insertBefore(node, before_node);
	// 				}

	// 				let info = "";

	// 				if (text !== undefined) {
	// 					info = text ? escapeHTML(text) : "(pusty)";
	// 				} else if (children !== undefined) {
	// 					info = `(${children.length})`;
	// 				}
	// 				if (info) {
	// 					info = html`<span class="info"> - ${info}</span>`;
	// 				}

	// 				let classes = ["v_node_label", `tblc_${vid}`];
	// 				if (v_node.disabled) {
	// 					classes.push("disabled");
	// 				}
	// 				if (vid === this.focus_node_vid) {
	// 					classes.push("selected");
	// 				}

	// 				setNodeClasses(node, classes);

	// 				node.style.setProperty("--level", level + "");

	// 				node._set_content(html`<span class="name">${display_name}</span> ${info}`);

	// 				node.dataset.tooltip = v_node.disabled ? `Część szablonu` : "";
	// 				node.dataset.vid = vid + "";
	// 			}

	// 			if (children) {
	// 				traverseVDom(children, level + 1);
	// 			}
	// 		});
	// 	};

	// 	traverseVDom(this.v_dom);

	// 	displayPlaceholder(this.inspector_tree, pos === -1, ".no_elements", html` <div class="pa2 center no_elements">Brak elementów</div> `);

	// 	const select_to_remove = ".v_node_label" + included_vids.map((e) => `:not(.tblc_${e})`).join("");
	// 	this.inspector_tree._children(select_to_remove).forEach((r) => {
	// 		r.remove();
	// 	});
	// }

	recalculateStyles() {
		// order doesn't really matter so far
		let styles_css = "";

		const care_about_resolutions = this.getResolutionsWeCareAbout();

		/**
		 * @param {vDomNode[]} v_nodes
		 */
		const traverseVDom = (v_nodes) => {
			for (const v_node of v_nodes) {
				let node_styles = "";

				let width_type = "custom";
				let aspect_ratio = undefined;

				for (const res_name of care_about_resolutions) {
					if (v_node.responsive_settings && v_node.responsive_settings[res_name]) {
						const ress = v_node.responsive_settings[res_name];
						const wt = ress.width_type;
						if (wt) {
							width_type = wt;

							if (width_type === "full") {
								node_styles += `width: 100%;`;
							}
							if (width_type === "auto") {
								node_styles += `width: auto;`;
							}
							if (width_type === "default_container") {
								node_styles += `width: 100%;max-width: var(--container_max_width);`;
							}
						}
					}

					if (v_node.styles && v_node.styles[res_name]) {
						const res_styles = v_node.styles[res_name];
						const styles = Object.entries(res_styles);
						if (styles) {
							const ar = res_styles["--aspect_ratio"];
							// if (ar) {
							// 	aspect_ratio = ar;
							// }
							// wont truly work when padding gets huge
							// if (aspect_ratio && ["height"].includes(prop)) {
							// 	return;
							// }
							if (ar) {
								node_styles += `height: auto;max-height: auto;min-width: auto;`;
							}
							styles.forEach(([prop, val]) => {
								if (width_type !== "custom" && ["width", "minWidth", "maxWidth"].includes(prop)) {
									return;
								}
								if (ar && ["height", "minHeight", "maxHeight"].includes(prop)) {
									return;
								}

								if (!prop.startsWith("--")) {
									prop = kebabCase(prop);
								}
								node_styles += `${prop}: ${val.replace(/\*$/, "")};`;
							});
						}
					}
				}

				if (node_styles) {
					// #p is stroner than just a class
					node_styles = `#p ${this.getNodeSelector(v_node.id)} { ${node_styles} }`;
					styles_css += node_styles;
				}

				const children = v_node.children;
				if (children) {
					traverseVDom(children);
				}
			}
		};

		traverseVDom(this.v_dom);
		if (this.grabbed_v_node && !this.has_insert_pos) {
			traverseVDom([this.grabbed_v_node]);
		}

		this.styles._set_content(styles_css);
	}

	/**
	 *
	 * @param {{
	 * vids?: number[]
	 * }} options
	 */
	recreateDom(options = {}) {
		this.preRecreateDom();

		/** @type {number[]} */
		let included_vids = [];

		/**
		 *
		 * @param {PiepNode} put_in_node
		 * @param {vDomNode[]} v_nodes
		 * @param {number[]} indices
		 * @param {BlockSchema} parent_blc_schema
		 */
		const traverseVDom = (put_in_node, v_nodes, indices = [], parent_blc_schema = undefined) => {
			v_nodes.forEach((v_node, index) => {
				const vid = v_node.id;
				included_vids.push(vid);
				const blc_schema = piep_cms_manager.getVNodeSchema(v_node);
				const curr_indices = [...indices, index];
				const children = v_node.children;

				let render_tag = v_node.tag;

				if (render_tag === "button") {
					render_tag = "div";
				}

				let node = this.getNode(vid);
				if (node && node.tagName.toLocaleLowerCase() !== render_tag.toLocaleLowerCase()) {
					node.remove();
					node = undefined;
				}
				let just_created = false;
				if (!node) {
					node = $(document.createElement(render_tag));
					just_created = true;
				}

				if (!options.vids || options.vids.includes(vid)) {
					const base_class = this.getNodeSelector(v_node.id).replace(".", "");
					const text = v_node.text;

					// classes
					if (v_node.module_name) {
						const module_class = `module_${v_node.module_name}`;
						if (!v_node.classes.includes(module_class)) {
							v_node.classes.push(module_class);
						}
					}

					let classes = ["blc", base_class, ...v_node.classes]; // important that a ref was lost

					if (text !== undefined) {
						node._set_content(text);

						let content = text;
						if (text === "" && v_nodes.length === 1) {
							content = "<br>";
						}
						node._set_content(content);

						classes.push("textable");
						//console.log("textable", node, text);
					}
					if (put_in_node.classList.contains("text_container")) {
						classes.push("in_text_container");
					}

					if (this.isTextContainer(v_node)) {
						classes.push("text_container");
					}
					if (blc_schema) {
						if (blc_schema.nonclickable) {
							classes.push("nonclickable");
						}
					}
					if (v_node.disabled) {
						classes.push("editor_disabled");
					}

					if (v_node.settings && v_node.settings.link) {
						if (v_node.module_name !== "button") {
							if (!v_node.settings.link_styling) {
								classes.push("link");
							}
							if (v_node.settings.link_styling === "hover_underline") {
								classes.push("hover_underline");
							}
						}
					}

					if (node.classList.contains("wo997_bckg_img_shown")) {
						// performance boost?
						classes.push("wo997_bckg_img_shown");
					}
					setNodeClasses(node, classes);

					// attrs
					const attrs = {
						"data-vid": v_node.id + "",
						"data-index": index + "",
						"data-indices": curr_indices.join(","),
						"data-level": curr_indices.length + "",
					};
					Object.assign(attrs, v_node.attrs);

					Object.entries(attrs).map(([key, val]) => {
						if (node.getAttribute(key) !== val) {
							node.setAttribute(key, val);
						}
					});
					const attr_names = Object.keys(attrs);
					for (const attr of node.attributes) {
						if (attr.name === "class") {
							continue;
						}
						// background img is held here so skip it baby
						if (attr.name !== "style" && !attr_names.includes(attr.name)) {
							node.removeAttribute(attr.name);
						}
					}

					if (blc_schema) {
						if (blc_schema.render_html || blc_schema.backend_render) {
							let render_props = {};
							blc_schema.rerender_on.forEach((prop_str) => {
								if (prop_str.startsWith("settings.")) {
									render_props[prop_str] = v_node.settings[prop_str.substring("settings.".length)];
								}
							});

							if (just_created || !isEquivalent(this.last_map_vid_render_props[vid], render_props)) {
								this.last_map_vid_render_props[vid] = render_props;
								if (blc_schema.render_html) {
									node._set_content(blc_schema.render_html(v_node));
								}
								if (blc_schema.backend_render) {
									piep_cms_manager.requestRender(vid);
								}
							}

							if (node._is_empty() && v_node.rendered_body !== undefined) {
								node._set_content(v_node.rendered_body);
							}
						}

						if (blc_schema.render) {
							blc_schema.render(v_node, node, this);
						}
					}

					if (classes.includes("vertical_container") || v_node.module_name === "absolute_container") {
						displayEmptyVerticalContainer(node, children.length === 0);
					}

					if (parent_blc_schema && parent_blc_schema.place_node) {
						parent_blc_schema.place_node(v_node, node, put_in_node, this);
					} else {
						// place it in the DOM yay
						const before_node = put_in_node._direct_children()[index];
						if (node._parent() !== put_in_node || node !== before_node) {
							put_in_node.insertBefore(node, before_node);
						}
					}
				}

				if (children) {
					// clean up text nodes if any existed - that might be... an unnecessary step?
					node.childNodes.forEach((c) => {
						if (c.nodeType === Node.TEXT_NODE) {
							c.remove();
						}
					});

					traverseVDom(node, children, curr_indices, blc_schema);
				}
			});
		};

		const displayEmptyVerticalContainer = (node, empty) => {
			displayPlaceholder(
				node,
				empty,
				".vertical_container_placeholder",
				html`<div class="vertical_container_placeholder"><span>Pusty kontener</span></div>`
			);
		};

		traverseVDom(this.content, this.v_dom);
		piep_cms_manager.updateModules();

		displayEmptyVerticalContainer(this.content, this.v_dom.length === 0);

		const select_blcs_to_remove = ".blc" + included_vids.map((e) => `:not(.blc_${e})`).join("");
		this.content._children(select_blcs_to_remove).forEach((r) => {
			//console.log("REMOVE", r);
			r.remove();
		});
	}

	getFocusVNode(vid) {
		return this.getVNodeById(this.focus_node_vid);
	}

	getFocusVNodeData(vid) {
		return this.getVNodeDataById(this.focus_node_vid);
	}

	/**
	 *
	 * @param {number} vid
	 * @returns
	 */
	getVNodeById(vid) {
		if (!vid) {
			return undefined;
		}

		const node_data = this.getVNodeDataById(vid);
		if (!node_data) {
			return undefined;
		}
		return node_data.v_node;
	}

	/**
	 *
	 * @param {{(v_node: vDomNode): boolean}} test
	 * @returns
	 */
	getVNode(test) {
		const node_data = this.getVNodeData(test);
		if (!node_data) {
			return undefined;
		}
		return node_data.v_node;
	}

	/**
	 *
	 * @param {number} vid
	 * @returns
	 */
	getVNodeDataById(vid) {
		if (!vid) {
			return undefined;
		}

		return this.getVNodeData((v_node) => v_node.id === vid);
	}

	/**
	 *
	 * @param {{(v_node: vDomNode): boolean}} test
	 * @returns {vDomNodeData}
	 */
	getVNodeData(test) {
		/**
		 *
		 * @param {vDomNode[]} v_nodes
		 * @param {vDomNode[]} parent_v_nodes
		 * @returns
		 */
		const traverseVDom = (v_nodes, parent_v_nodes) => {
			let index = -1;
			for (const v_node of v_nodes) {
				index++;

				if (test(v_node)) {
					return {
						v_node,
						v_nodes,
						index,
						parent_v_nodes,
					};
				}

				if (v_node.children) {
					const res = traverseVDom(v_node.children, [v_node, ...parent_v_nodes]);
					if (res) {
						return res;
					}
				}
			}

			return undefined;
		};

		return traverseVDom(this.v_dom, []);
	}

	/**
	 *
	 * @param {PiepNode} node
	 * @param {string} selector
	 * @param {Direction} direction
	 * @param {{
	 * include_template?: boolean
	 * }} options
	 * @returns {PiepNode | undefined}
	 */
	getDeepSibling(node, selector, direction, options = {}) {
		/** @type {PiepNode} */
		let parent = node;
		while (parent) {
			const next = direction === 1 ? parent._next() : parent._prev();
			if (next) {
				if (!this.content.contains(next)) {
					return undefined;
				}
				if (!options.include_template && next.classList.contains("editor_disabled")) {
					return undefined;
				}

				if (next.matches(selector)) {
					return next;
				}
				const next_children = next._children(selector);
				if (next_children.length > 0) {
					if (direction === 1) {
						return next_children[0];
					} else {
						return getLast(next_children);
					}
				}

				parent = next;
			} else {
				parent = parent._parent();
			}
		}
		return undefined;
	}

	removeTextInSelection() {
		if (!this.text_selection || this.text_selection.length === 0) {
			return;
		}

		/** @type {number[]} */
		const remove_vids = [];
		for (const mid_vid of this.text_selection.middle_vids) {
			if (mid_vid === this.text_selection.focus_vid) {
				const v_node = this.getVNodeById(mid_vid);
				v_node.text = ""; // just empty the guy who is selected, remove others
				this.text_selection.focus_offset = 0;
			} else {
				remove_vids.push(mid_vid);
			}
		}

		this.text_selection.partial_ranges.forEach((range) => {
			const v_node = this.getVNodeById(range.vid);
			v_node.text = v_node.text.substring(0, range.start) + v_node.text.substring(range.end);

			if (this.text_selection.focus_vid === range.vid && this.text_selection.direction === 1) {
				this.text_selection.focus_offset += range.start - range.end;
			}
		});

		this.collapseTextSelection();

		this.removeVNodes(remove_vids);

		this.update({ all: true });
		//this.recreateDom();

		this.pushHistory("delete_text");
	}

	/**
	 *
	 * @param {string} insert_text
	 * @returns
	 */
	insertText(insert_text) {
		if (!this.text_selection) {
			return;
		}

		//const focus_node = this.getNode(this.text_selection.focus_vid);
		const focus_offset = this.text_selection.focus_offset;
		const vid = this.text_selection.focus_vid;
		const v_node = this.getVNodeById(vid);

		if (!v_node) {
			return;
		}

		const text = v_node.text;
		if (text === undefined) {
			return;
		}

		v_node.text = text.substr(0, focus_offset) + insert_text + text.substr(focus_offset);

		// optimisation
		this.recreateDom({ vids: [vid] });
		//this.displayInspectorTree({ vids: [vid] });

		this.text_selection.focus_offset += insert_text.length;
		this.collapseTextSelection();
	}

	collapseTextSelection() {
		this.text_selection.anchor_offset = this.text_selection.focus_offset;
		this.text_selection.anchor_vid = this.text_selection.focus_vid;
		this.text_selection.length = 0;
		this.text_selection.middle_vids = [];
		this.text_selection.partial_ranges = [];
	}

	getInsertBlcUnderMouse() {
		/** @type {insertBlc} */
		let insert_blc;
		{
			const hh = this.insert_blc_size;
			const h = hh * 0.5;
			for (const e of this.insert_blcs._direct_children()) {
				const r = e.getBoundingClientRect();

				if (Math.abs(mouse.pos.x - r.x - h) < h && Math.abs(mouse.pos.y - r.y - h) < h) {
					// @ts-ignore
					insert_blc = e;
					break;
				}
			}
		}
		return insert_blc;
	}

	getSelectBlcUnderMouse() {
		/** @type {PiepNode} */
		let select_blc;
		{
			const hh = this.select_blc_size;
			const h = hh * 0.5;
			for (const e of this.select_blcs._direct_children()) {
				const r = e.getBoundingClientRect();

				if (Math.abs(mouse.pos.x - r.x - h) < h && Math.abs(mouse.pos.y - r.y - h) < h) {
					// @ts-ignore
					select_blc = e;
					break;
				}
			}
		}
		return select_blc;
	}

	selectingBlock() {
		if (!this.selecting_blcs || !mouse.target) {
			return;
		}
		const select_blc = this.getSelectBlcUnderMouse();
		if (this.current_select_blc !== select_blc) {
			this.has_select_pos = false;
			this.current_select_blc = select_blc;

			removeClasses(".hovered", ["hovered"], this.select_blcs);
			if (select_blc) {
				select_blc.classList.add("hovered");
				this.has_select_pos = true;
			}
		}

		this.container.classList.toggle("has_select_pos", this.has_select_pos);
	}

	/**
	 *
	 * @param {{
	 * rewrite_html?: boolean
	 * }} options
	 */
	considerInsertAction(options = {}) {
		let change = false;

		const insert_blc = this.getInsertBlcUnderMouse();
		tooltip.force_target = insert_blc;
		if (this.current_insert_blc !== insert_blc) {
			this.current_insert_blc = insert_blc;
			this.has_insert_pos = false;

			this.v_dom.splice(0, this.v_dom.length);
			deepAssign(this.v_dom, this.after_grab_v_dom);

			if (insert_blc && insert_blc._insert_action) {
				this.has_insert_pos = true;
				insert_blc._insert_action();

				change = true;
				this.update({ all: true });

				if (options.rewrite_html) {
					// rewrite rendered module contents
					const inserted_blc = this.getNode(this.grabbed_v_node.id);
					if (inserted_blc._is_empty()) {
						const copy_from = this.grabbed_block_wrapper._direct_child();
						if (copy_from) {
							inserted_blc.innerHTML = copy_from.innerHTML;
						}
					}
				}
			} else {
				change = true;
				this.update({ all: true });
				this.float_focuses._empty();
			}

			removeClasses(".hovered", ["hovered"], this.insert_blcs);
			if (insert_blc) {
				insert_blc.classList.add("hovered");
			}
		}

		return change;
	}

	grabbedBlock() {
		if (!this.grabbed_v_node || !mouse.target) {
			return;
		}

		let left = mouse.pos.x - this.grabbed_block_wrapper_rect.width * 0.5;
		let top = mouse.pos.y - this.grabbed_block_wrapper_rect.height * 0.5;

		this.grabbed_block_wrapper._set_absolute_pos(left, top);

		if (this.showing_float_multi_of_blc) {
			const float_multi_insert_bckg_rect = this.float_multi_insert_bckg.getBoundingClientRect();
			const radius = float_multi_insert_bckg_rect.width * 0.5;
			const dx = float_multi_insert_bckg_rect.left + float_multi_insert_bckg_rect.width * 0.5 - mouse.pos.x;
			const dy = float_multi_insert_bckg_rect.top + float_multi_insert_bckg_rect.height * 0.5 - mouse.pos.y;
			const inside = dx * dx + dy * dy < radius * radius;

			if (!inside) {
				this.showing_float_multi_of_blc.classList.remove("hidden");
				this.container.classList.remove("float_multi_insert_visible");
				this.float_multi_insert_bckg.classList.add("hidden");

				this.showing_float_multi_of_blc._popup_blcs.forEach((popup_blc) => {
					popup_blc.classList.remove("over");
					popup_blc.classList.add("hidden");
				});
				this.showing_float_multi_of_blc = undefined;
			}
		}

		this.considerInsertAction({ rewrite_html: true });

		this.grabbed_block_wrapper.classList.toggle("visible", !this.has_insert_pos);
		this.container.classList.toggle("has_insert_pos", this.has_insert_pos);
	}

	getAllTextSelectionVids() {
		let all_ids = [];

		if (this.text_selection) {
			all_ids.push(...this.text_selection.partial_ranges.map((e) => e.vid));
			all_ids.push(...this.text_selection.middle_vids);
			all_ids.push(this.text_selection.focus_vid);
		}

		all_ids = all_ids.filter(onlyUnique);

		return all_ids;
	}

	showFocus() {
		/** @type {ShowFocusToNodeData[]} */
		const show_focuses = [];

		let show_float_menu = false;

		/**
		 *
		 * @param {number} vid
		 */
		const addVidsWidthParent = (vid) => {
			const v_node_data = this.getVNodeDataById(vid);
			if (!v_node_data) {
				return;
			}
			show_focuses.push({ vid, opacity: 1 });
			v_node_data.parent_v_nodes.forEach((parent_v_node, index) => {
				if (!parent_v_node.disabled) {
					show_focuses.push({ vid: parent_v_node.id, opacity: Math.pow(0.5, index + 1) });
				}
			});
		};

		if (this.selecting_blcs) {
			const select_blc = this.getSelectBlcUnderMouse();
			tooltip.force_target = select_blc;
			if (select_blc) {
				addVidsWidthParent(+select_blc.dataset.vid);
			}
		} else {
			if (!this.grabbed_v_node && this.focus_node_vid !== undefined) {
				show_float_menu = true;
				show_focuses.push({ vid: this.focus_node_vid, opacity: 1 });
			}

			if (this.grabbed_v_node) {
				addVidsWidthParent(this.grabbed_block_vid);
			}

			if (!this.layout_control_prop && !this.grabbed_v_node) {
				const blc = mouse.target ? mouse.target._parent(this.getSelectableBlcSelector()) : undefined;
				const v_node_label = mouse.target ? mouse.target._parent(".v_node_label") : undefined;

				if (blc) {
					const blc_vid = +blc.dataset.vid;
					if (blc_vid) {
						addVidsWidthParent(blc_vid);
					}
				}

				if (v_node_label) {
					show_float_menu = false;
					const label_vid = +v_node_label.dataset.vid;
					if (label_vid !== this.focus_node_vid) {
						addVidsWidthParent(label_vid);
					}

					any_picker.hide();
					this.float_menu._children("p-dropdown.dropped").forEach((d) => {
						d.click();
					});
				}
			}
		}

		this.showFocusToNodes(show_focuses);

		this.float_menu.classList.toggle("hidden", !show_float_menu);

		if (show_float_menu) {
			if (this.text_selection !== undefined) {
				let highest_y = 1000000;
				/** @type {number} */
				let highest_vid;
				for (const vid of this.getAllTextSelectionVids()) {
					const node = this.getNode(vid);
					if (!node) {
						continue;
					}
					const parent = node._parent();
					const parent_vid = +parent.dataset.vid;

					const y = node.getBoundingClientRect().y;
					if (y < highest_y) {
						highest_y = y;
						highest_vid = parent_vid;
					}
				}
				if (highest_vid) {
					this.showFloatMenuToNode(highest_vid);
				}
			} else {
				const node = this.getNode(this.focus_node_vid);
				if (!(node && node.classList.contains("textable"))) {
					this.showFloatMenuToNode(this.focus_node_vid);
				}
			}
		}
	}

	clipboardBtnMove() {
		let show_clipboard_menu = false;
		const was_visible = this.clipboard_menu.classList.contains("visible");

		if (mouse.target) {
			const hover = !!mouse.target._parent(this.clipboard_btn_wrapper) || !!mouse.target._parent(this.clipboard_menu);
			if (this.selected_resolution === "df" && hover && !this.grabbed_v_node) {
				show_clipboard_menu = true;

				if (this.hide_clipboard_menu_timeout) {
					clearTimeout(this.hide_clipboard_menu_timeout);
					this.hide_clipboard_menu_timeout = undefined;
				}
			} else {
				if (!this.hide_clipboard_menu_timeout && was_visible) {
					this.hide_clipboard_menu_timeout = setTimeout(() => {
						show_clipboard_menu = false;
						this.hide_clipboard_menu_timeout = undefined;
						this.clipboard_menu.classList.remove("visible");
					}, 300);
				}
			}
		}

		if (show_clipboard_menu) {
			if (!was_visible) {
				// display
				this.clipboard_menu.classList.add("visible");
				this.clipboard_menu._set_absolute_pos(0, 0);

				const clipboard_btn_rect = this.clipboard_btn.getBoundingClientRect();
				const clipboard_menu_rect = this.clipboard_menu.getBoundingClientRect();

				const left = clipboard_btn_rect.left - clipboard_menu_rect.width;
				const top = clipboard_btn_rect.top; // - 1; // -1 to make it pretty

				this.clipboard_menu._set_absolute_pos(left, top);
			}
		}

		this.clipboard_btn.style.setProperty("--btn-background-clr", show_clipboard_menu ? "#eee" : "");
	}

	addBlcBtnMove() {
		let show_add_block_menu = false;
		const was_visible = this.add_block_menu.classList.contains("visible");

		if (mouse.target) {
			const hover = !!mouse.target._parent(this.add_block_btn_wrapper) || !!mouse.target._parent(this.add_block_menu);
			if (this.selected_resolution === "df" && hover && !this.grabbed_v_node) {
				show_add_block_menu = true;

				if (this.hide_add_block_menu_timeout) {
					clearTimeout(this.hide_add_block_menu_timeout);
					this.hide_add_block_menu_timeout = undefined;
				}
			} else {
				if (!this.hide_add_block_menu_timeout && was_visible) {
					this.hide_add_block_menu_timeout = setTimeout(() => {
						show_add_block_menu = false;
						this.hide_add_block_menu_timeout = undefined;
						this.add_block_menu.classList.remove("visible");
					}, 300);
				}
			}
		}

		if (show_add_block_menu) {
			if (!was_visible) {
				// restrict options
				const blc_ids_we_have = [];

				/**
				 * @param {vDomNode[]} v_nodes
				 */
				const traverseVDom = (v_nodes) => {
					for (const v_node of v_nodes) {
						const blc_schema = piep_cms_manager.getVNodeSchema(v_node);
						if (blc_schema) {
							if (!blc_ids_we_have.includes(blc_schema.id)) {
								blc_ids_we_have.push(blc_schema.id);
							}
						}
						if (v_node.children) {
							traverseVDom(v_node.children);
						}
					}
				};
				traverseVDom(this.v_dom);

				this.add_block_menu._children(".block_to_add").forEach((block_to_add) => {
					let visible = true;

					const blc_id = block_to_add.dataset.id;
					const blc_schema = piep_cms_manager.blcs_schema.find((b) => b.id === blc_id);

					if (blc_schema.page_type) {
						if (blc_schema.page_type === "template") {
							if (!template_data) {
								visible = false;
							}
						} else if (blc_schema.page_type !== pageable_data.page_type) {
							visible = false;
						}
					}
					if (visible && blc_schema.single_usage && blc_ids_we_have.includes(blc_id)) {
						visible = false;
					}

					block_to_add.classList.toggle("hidden", !visible);
				});

				// display
				this.add_block_menu.classList.add("visible");
				this.add_block_menu._set_absolute_pos(0, 0);

				const add_block_btn_rect = this.add_block_btn.getBoundingClientRect();
				const add_block_menu_rect = this.add_block_menu.getBoundingClientRect();

				const left = add_block_btn_rect.left - add_block_menu_rect.width;
				const top = add_block_btn_rect.top - 1; // -1 to make it pretty

				this.add_block_menu._set_absolute_pos(left, top);
			}
		}

		this.add_block_btn.style.setProperty("--btn-background-clr", show_add_block_menu ? "#eee" : "");
	}

	layoutEditMove() {
		if (!this.editing_layout) {
			return;
		}

		const layout_hash = this.content_scroll.offsetWidth + "_" + this.content_scroll.offsetLeft;
		if (layout_hash !== this.last_content_scroll_layout_hash) {
			this.last_content_scroll_layout_hash = layout_hash;
			this.displayNodeLayout();
		}

		if (this.layout_control_prop && !mouse.down) {
			this.layout_control_prop = undefined;
			this.layout_control_base_value = undefined;
			this.layout_control_grabbed_index = undefined;
			this.layout_control_unit = undefined;
			this.layout_control_grabbed_pos = undefined;
			this.layout_control_percent = undefined;
			removeClasses(".layout_control.grabbed", ["grabbed"], this.container);
		}

		if (!mouse.down) {
			this.layout_control_grabbed_index = undefined;
			removeClasses(".editing_now", ["editing_now"], this.container);
			this.insert_blcs._empty();
		}

		if (this.layout_control_prop) {
			const dx = mouse.pos.x - this.layout_control_grabbed_pos.x;
			const dy = mouse.pos.y - this.layout_control_grabbed_pos.y + this.content_scroll.scrollTop - this.layout_control_grabbed_scroll_top;

			if (this.layout_control_prop === "grid_area") {
				if (this.considerInsertAction()) {
					this.displayNodeLayout();
				}
			} else {
				let dist = 0;
				if (this.layout_control_dir === "left") {
					dist -= dx;
				} else if (this.layout_control_dir === "right") {
					dist += dx;
				} else if (this.layout_control_dir === "top") {
					dist -= dy;
				} else if (this.layout_control_dir === "bottom") {
					dist += dy;
				}

				let min_percent = 0;
				let min_pixels = 0;
				if (this.layout_control_prop === "width") {
					min_percent = 10;
					min_pixels = 50;
				} else if (this.layout_control_prop.includes("margin")) {
					min_percent = -1000;
					min_pixels = -100000;
				}

				let set_val_pretty;
				if (this.layout_control_unit === "%") {
					let set_val = this.layout_control_base_value + dist / this.layout_control_percent;
					set_val = Math.max(min_percent, set_val);

					if (CTRL_DOWN) {
						if (this.layout_control_prop === "width") {
							let lowest_diff_val = 100;
							let closest_val = set_val;
							for (let percentage of piep_cms_manager.pretty_percentages) {
								const diff = Math.abs(percentage - set_val);
								if (diff < lowest_diff_val) {
									lowest_diff_val = diff;
									closest_val = percentage;
								}
							}
							set_val = closest_val;
						} else {
							set_val = Math.round(set_val);
							set_val_pretty = set_val + "%";
						}
					} else {
						set_val = Math.round(set_val);
					}
					set_val_pretty = floor(set_val, 4) + "%";
				} else {
					let set_val = this.layout_control_base_value + dist;
					set_val = Math.max(min_pixels, set_val);

					if (CTRL_DOWN) {
						set_val = round(set_val, -1);
					}
					set_val_pretty = floor(set_val) + "px";
				}

				const prop_input = this.side_menu._child(`[data-blc_prop="styles.${this.layout_control_prop}"]`);
				if (prop_input) {
					const change = set_val_pretty !== prop_input._get_value();
					scrollIntoView(prop_input);
					const input = prop_input._child("input");
					if (input) {
						input.classList.add("editing_now");
					}

					if (change) {
						if (this.layout_control_prop === "width") {
							const v_node = this.getFocusVNode();
							const width_type = this.getVNodeResponsiveProp("responsive_settings", v_node, "width_type");
							if (width_type !== "custom") {
								v_node.responsive_settings[this.selected_resolution].width_type = "custom";
								this.setBlcMenuFromFocusedNode();
							}
						}

						prop_input._set_value(set_val_pretty);
						this.displayNodeLayout();
					}
				}
			}
		}
	}

	/**
	 *
	 * @param {vDomNode} v_node
	 */
	getCurrentVNodeResponsiveStyle(v_node, prop_name) {
		const care_about_resolutions = this.getResolutionsWeCareAbout();
		let prop_val;
		care_about_resolutions.forEach((res_name) => {
			const res_settings = v_node.responsive_settings[res_name];
			if (!res_settings) {
				return;
			}
			const v = res_settings[prop_name];
			if (v) {
				prop_val = v;
			}
		});
		return prop_val;
	}

	/**
	 *
	 * @param {"responsive_settings" | "styles"} prop_group
	 * @param {vDomNode} v_node
	 * @returns {string}
	 */
	getVNodeResponsiveProp(prop_group, v_node, prop_name) {
		const care_about_resolutions = this.getResolutionsWeCareAbout();
		let prop_val;
		care_about_resolutions.forEach((res_name) => {
			const res = v_node[prop_group][res_name];
			if (!res) {
				return;
			}
			const v = res[prop_name];
			if (v) {
				prop_val = v;
			}
		});
		return prop_val;
	}

	// inspectorMove() {
	// 	if (this.inspector_grabbed && !mouse.down) {
	// 		this.inspector_grabbed = false;
	// 		this.inspector.classList.remove("grabbed");
	// 	}

	// 	const safe_off = 5;

	// 	//const inspector_rect = this.inspector.getBoundingClientRect();
	// 	const content_wrapper_rect = this.content_wrapper.getBoundingClientRect();

	// 	const inspector_width = this.inspector.offsetWidth;
	// 	const inspector_height = this.inspector.offsetHeight;
	// 	const inspector_grab_btn_offset = 47;

	// 	const max_x = content_wrapper_rect.left + content_wrapper_rect.width - inspector_width - safe_off;

	// 	if (this.inspector_grabbed) {
	// 		const left = mouse.pos.x + inspector_grab_btn_offset - inspector_width;
	// 		const top = mouse.pos.y - 20;

	// 		this.inspector_pos.x = this.inspector_pos.x * 0.5 + left * 0.5;
	// 		this.inspector_pos.y = this.inspector_pos.y * 0.5 + top * 0.5;
	// 	} else {
	// 		if (this.inspector_sticks_to_right_size) {
	// 			this.inspector_pos.x = max_x;
	// 		}
	// 	}

	// 	this.inspector_pos.x = clamp(safe_off, this.inspector_pos.x, max_x);
	// 	this.inspector_pos.y = clamp(
	// 		content_wrapper_rect.top + safe_off,
	// 		this.inspector_pos.y,
	// 		content_wrapper_rect.top + content_wrapper_rect.height - inspector_height - safe_off
	// 	);

	// 	this.inspector_sticks_to_right_size = this.inspector_pos.x > max_x - 1;

	// 	this.inspector.style.setProperty("--x", this.inspector_pos.x.toPrecision(5) + "px");
	// 	this.inspector.style.setProperty("--y", this.inspector_pos.y.toPrecision(5) + "px");
	// }

	mainLoop() {
		updateMouseTarget();

		this.grabbedBlock();
		this.showFocus();
		//this.inspectorMove();
		this.layoutEditMove();
		this.addBlcBtnMove();
		this.clipboardBtnMove();
		this.selectingBlock();

		const alternative_scroll_panel_left = 0;
		const alternative_scroll_panel_top = 0 - this.content_scroll.scrollTop;

		this.alternative_scroll_panel.style.transform = `translate(
            ${alternative_scroll_panel_left.toPrecision(5)}px,
            ${alternative_scroll_panel_top.toPrecision(5)}px
        )`;

		requestAnimationFrame(() => {
			this.mainLoop();
		});
	}

	startEditingLayout() {
		this.editing_layout = true;

		const v_node_data = this.getFocusVNodeData();
		const parent_v_node = v_node_data.parent_v_nodes[0];
		if (this.text_selection && parent_v_node) {
			this.setFocusNode(parent_v_node.id);
			this.text_selection = undefined;
			return;
		}

		this.container.classList.add("editing_layout");
		this.container.classList.add("disable_editing");

		if (this.filter_blc_menu._get_value() !== "layout") {
			this.filter_blc_menu._set_value("layout");
		}

		this.displayNodeLayout();
	}

	displayNodeLayout() {
		if (!this.editing_layout) {
			return;
		}

		let layout_html = "";

		const edit_node = this.getNode(this.focus_node_vid);
		const v_node_data = this.getFocusVNodeData();

		const can_edit_layout = edit_node && !edit_node.classList.contains("textable");
		const edit_node_rect = edit_node ? edit_node.getBoundingClientRect() : undefined;

		if (can_edit_layout) {
			const focus_node_style = window.getComputedStyle(edit_node);

			const orange = "#d806";
			const green = "#3d56";
			const mr_top = numberFromStr(focus_node_style.marginTop);
			const mr_right = numberFromStr(focus_node_style.marginRight);
			const mr_bottom = numberFromStr(focus_node_style.marginBottom);
			const mr_left = numberFromStr(focus_node_style.marginLeft);
			const pd_top = numberFromStr(focus_node_style.paddingTop);
			const pd_right = numberFromStr(focus_node_style.paddingRight);
			const pd_bottom = numberFromStr(focus_node_style.paddingBottom);
			const pd_left = numberFromStr(focus_node_style.paddingLeft);
			const bw_top = numberFromStr(focus_node_style.borderTopWidth);
			const bw_right = numberFromStr(focus_node_style.borderRightWidth);
			const bw_bottom = numberFromStr(focus_node_style.borderBottomWidth);
			const bw_left = numberFromStr(focus_node_style.borderLeftWidth);

			// margins
			const display_margin = (left, top, width, height, background) => {
				layout_html += html`<div
					class="margin_display"
					style="
                left:${left}px;
                top:${top + this.content_scroll.scrollTop}px;
                width:${width}px;
                height:${height}px;
                background:${background}"
				></div>`;
			};

			{
				// top
				let left = edit_node_rect.left;
				let top = edit_node_rect.top;
				let width = edit_node_rect.width;
				let height = Math.abs(mr_top);
				let background = mr_top > 0 ? orange : orange;
				if (mr_top > 0) {
					top -= height;
				}
				display_margin(left, top, width, height, background);
			}
			{
				// bottom
				let left = edit_node_rect.left;
				let top = edit_node_rect.top + edit_node_rect.height;
				let width = edit_node_rect.width;
				let height = Math.abs(mr_bottom);
				let background = mr_bottom > 0 ? orange : orange;
				if (mr_bottom < 0) {
					top -= height;
				}
				display_margin(left, top, width, height, background);
			}
			{
				// left
				let left = edit_node_rect.left;
				let top = edit_node_rect.top;
				let width = Math.abs(mr_left);
				let height = edit_node_rect.height;
				let background = mr_top > 0 ? orange : orange;
				if (mr_left > 0) {
					left -= width;
				}
				display_margin(left, top, width, height, background);
			}
			{
				// right
				let left = edit_node_rect.left + edit_node_rect.width;
				let top = edit_node_rect.top;
				let width = Math.abs(mr_right);
				let height = edit_node_rect.height;
				let background = mr_top > 0 ? orange : orange;
				if (mr_right < 0) {
					left -= width;
				}
				display_margin(left, top, width, height, background);
			}

			// paddings
			const display_padding = (left, top, width, height) => {
				layout_html += html`<div
					class="padding_display"
					style="
                left:${left}px;
                top:${top + this.content_scroll.scrollTop}px;
                width:${width}px;
                height:${height}px;
                background:${green}"
				></div>`;
			};

			{
				// top
				let left = edit_node_rect.left + bw_left;
				let top = edit_node_rect.top + bw_top;
				let width = edit_node_rect.width - bw_left - bw_right;
				let height = Math.abs(pd_top);
				display_padding(left, top, width, height);
			}
			{
				// bottom
				let left = edit_node_rect.left + bw_left;
				let top = edit_node_rect.top + edit_node_rect.height - bw_bottom;
				let width = edit_node_rect.width - bw_left - bw_right;
				let height = Math.abs(pd_bottom);
				top -= height;
				display_padding(left, top, width, height);
			}
			{
				// left
				let left = edit_node_rect.left + bw_left;
				let top = edit_node_rect.top + bw_top;
				let width = Math.abs(pd_left);
				let height = edit_node_rect.height - bw_top - bw_bottom;
				display_padding(left, top, width, height);
			}
			{
				// right
				let left = edit_node_rect.left + edit_node_rect.width - bw_right;
				let top = edit_node_rect.top + bw_top;
				let width = Math.abs(pd_right);
				let height = edit_node_rect.height - bw_top - bw_bottom;
				left -= width;
				display_padding(left, top, width, height);
			}

			// just controls
			/**
			 *
			 * @param {number} left
			 * @param {number} top
			 * @param {DirectionEnum} dir
			 * @returns {Position}
			 */
			const layoutControlPos = (left, top, dir) => {
				// prevent overlapping
				const min_size = 70;
				if (dir === "top") {
					top -= Math.max(0, min_size - edit_node_rect.height) / 2;
				}
				if (dir === "bottom") {
					top += Math.max(0, min_size - edit_node_rect.height) / 2;
				}
				if (dir === "left") {
					left -= Math.max(0, min_size - edit_node_rect.width) / 2;
				}
				if (dir === "right") {
					left += Math.max(0, min_size - edit_node_rect.width) / 2;
				}

				return {
					x: left,
					y: top + this.content_scroll.scrollTop,
				};
			};

			/**
			 *
			 * @param {number} left
			 * @param {number} top
			 * @param {string} gener_prop
			 * @param {string} spec_prop
			 * @param {DirectionEnum} dir
			 * @param {string} tooltip
			 */
			const display_layout_control = (left, top, gener_prop, spec_prop, dir, tooltip) => {
				const pos = layoutControlPos(left, top, dir);

				layout_html += html`<div
					class="layout_control ${gener_prop}_control"
					data-layout_prop="${spec_prop}"
					data-layout_dir="${dir}"
					style="left:${pos.x}px;top:${pos.y}px;"
					data-tooltip="${tooltip}"
				></div>`;
			};

			/**
			 *
			 * @param {number} left
			 * @param {number} top
			 * @param {CornerEnum} corner
			 */
			const display_grid_control = (left, top, corner) => {
				layout_html += html`<div
					class="layout_control grid_area_control"
					data-layout_prop="grid_area"
					data-corner="${corner}"
					style="left:${left}px;top:${top + this.content_scroll.scrollTop}px;"
					data-tooltip="Dostosuj wymiary / pozycję"
				></div>`;
			};

			const lcs = this.layout_control_size;

			const parent_v_node = v_node_data.parent_v_nodes[0];
			if (parent_v_node && parent_v_node.module_name === "grid") {
				{
					// left bottom
					let left = edit_node_rect.left;
					let top = edit_node_rect.top + edit_node_rect.height - lcs;
					display_grid_control(left, top, "bottomleft");
				}
				{
					// right bottom
					let left = edit_node_rect.left + edit_node_rect.width - lcs;
					let top = edit_node_rect.top + edit_node_rect.height - lcs;
					display_grid_control(left, top, "bottomright");
				}
				{
					// left top
					let left = edit_node_rect.left;
					let top = edit_node_rect.top;
					display_grid_control(left, top, "topleft");
				}
				{
					// right top
					let left = edit_node_rect.left + edit_node_rect.width - lcs;
					let top = edit_node_rect.top;
					display_grid_control(left, top, "topright");
				}
			} else {
				{
					// left bottom
					let left = edit_node_rect.left;
					let top = edit_node_rect.top + edit_node_rect.height - lcs;
					display_layout_control(left, top, "width", "width", "left", "Dostosuj szerokość");
				}
				{
					// right bottom
					let left = edit_node_rect.left + edit_node_rect.width - lcs;
					let top = edit_node_rect.top + edit_node_rect.height - lcs;
					display_layout_control(left, top, "width", "width", "right", "Dostosuj szerokość");
				}
				{
					// left top
					let left = edit_node_rect.left;
					let top = edit_node_rect.top;
					display_layout_control(left, top, "width", "width", "left", "Dostosuj szerokość");
				}
				{
					// right top
					let left = edit_node_rect.left + edit_node_rect.width - lcs;
					let top = edit_node_rect.top;
					display_layout_control(left, top, "width", "width", "right", "Dostosuj szerokość");
				}
			}

			{
				// top
				let left = edit_node_rect.left + edit_node_rect.width * 0.5 - lcs * 0.5;
				let top = edit_node_rect.top;
				display_layout_control(left, top - lcs, "margin", "marginTop", "top", "Margines zewnętrzny górny");
				display_layout_control(left, top, "borderWidth", "borderTopWidth", "top", "Grubość górnej krawędzi");
				display_layout_control(left, top + lcs, "padding", "paddingTop", "top", "Margines wewnętrzny górny");
			}
			{
				// bottom
				let left = edit_node_rect.left + edit_node_rect.width * 0.5 - lcs * 0.5;
				let top = edit_node_rect.top + edit_node_rect.height - lcs;
				display_layout_control(left, top + lcs, "margin", "marginBottom", "bottom", "Margines zewnętrzny dolny");
				display_layout_control(left, top, "borderWidth", "borderBottomWidth", "bottom", "Grubość dolnej krawędzi");
				display_layout_control(left, top - lcs, "padding", "paddingBottom", "bottom", "Margines wewnętrzny dolny");
			}
			{
				// left
				let left = edit_node_rect.left;
				let top = edit_node_rect.top + edit_node_rect.height * 0.5 - lcs * 0.5;
				display_layout_control(left - lcs, top, "margin", "marginLeft", "left", "Margines zewnętrzny lewy");
				display_layout_control(left, top, "borderWidth", "borderLeftWidth", "left", "Grubość lewej krawędzi");
				display_layout_control(left + lcs, top, "padding", "paddingLeft", "left", "Margines wewnętrzny lewy");
			}
			{
				// right
				let left = edit_node_rect.left + edit_node_rect.width - lcs;
				let top = edit_node_rect.top + edit_node_rect.height * 0.5 - lcs * 0.5;
				display_layout_control(left + lcs, top, "margin", "marginRight", "right", "Margines zewnętrzny prawy");
				display_layout_control(left, top, "borderWidth", "borderRightWidth", "right", "Grubość prawej krawędzi");
				display_layout_control(left - lcs, top, "padding", "paddingRight", "right", "Margines wewnętrzny prawy");
			}
		}

		this.layout_controls._set_content(layout_html);

		if (this.layout_control_grabbed_index !== undefined) {
			const lc = this.layout_controls._direct_children()[this.layout_control_grabbed_index];
			if (lc) {
				lc.classList.add("grabbed");
			}
		}
	}

	finishEditingLayout() {
		if (!this.editing_layout) {
			return;
		}
		this.editing_layout = false;

		this.container.classList.remove("editing_layout");
		this.container.classList.remove("disable_editing");

		this.layout_controls._set_content("");

		if (this.filter_blc_menu._get_value() !== "all") {
			this.filter_blc_menu._set_value("all");
		}
	}

	/**
	 *
	 * @param {GrabBlockOptions} options
	 */
	grabBlock(options = {}) {
		this.grab_block_options = options;
		this.grabbed_block_vid = this.focus_node_vid;

		this.container.classList.add("grabbed_block");
		this.container.classList.add("disable_editing");
		/** @type {insertBlc} */
		this.current_insert_blc = undefined;

		this.has_insert_pos = false;

		const grabbed_node = this.getNode(this.grabbed_block_vid);
		this.grabbed_block_wrapper._set_content(grabbed_node.outerHTML);
		this.grabbed_block_parent = grabbed_node._parent();
		removeClasses(".wo997_img_shown", ["wo997_img_shown"], this.grabbed_block_wrapper);
		removeClasses(".wo997_img_waiting", ["wo997_img_waiting"], this.grabbed_block_wrapper);
		lazyLoadImages({ duration: 0 });
		this.grabbed_block_wrapper.classList.add("visible");

		// won't grow by more than this.grabbed_block_wrapper.offsetHeight
		this.content.style.minHeight = this.content.scrollHeight + this.grabbed_block_wrapper.offsetHeight + "px";

		// be as wide as necessary
		this.grabbed_block_wrapper.style.left = "0";
		this.grabbed_block_wrapper.style.width = "";

		let base_width = this.grabbed_block_wrapper.offsetWidth;
		if (!this.grabbed_block_wrapper.matches(".text_container, .textable")) {
			base_width = Math.max(500, this.grabbed_block_wrapper.offsetWidth);
		}

		let ok_width = base_width;

		if (this.grabbed_block_wrapper.offsetWidth > 500) {
			// wrap
			ok_width = Math.sqrt(2 * this.grabbed_block_wrapper.offsetWidth * this.grabbed_block_wrapper.offsetHeight);
			// let pretty_width = Math.sqrt(2 * this.grabbed_block_wrapper.offsetWidth * this.grabbed_block_wrapper.offsetHeight);
			// ok_width = Math.min(800, pretty_width);
		}

		this.grabbed_block_wrapper.style.width = ok_width.toPrecision(5) + "px";
		const scale = 1 / (1 + ok_width * 0.001);
		this.grabbed_block_wrapper.style.transform = `scale(${scale.toPrecision(5)})`;

		this.grabbed_block_wrapper_rect = this.grabbed_block_wrapper.getBoundingClientRect();

		// actually remove it from v_dom
		const setBeforeGrabState = () => {
			this.before_grab_v_dom = cloneObject(this.v_dom);
		};
		if (options.type === "move") {
			setBeforeGrabState();
		}

		const grabbed_v_node_data = this.getVNodeDataById(this.grabbed_block_vid);
		/** @type {vDomNode} */
		this.grabbed_v_node = cloneObject(grabbed_v_node_data.v_node);
		grabbed_v_node_data.v_nodes.splice(grabbed_v_node_data.index, 1);

		if (options.type === "insert") {
			setBeforeGrabState();
		}
		this.after_grab_v_dom = cloneObject(this.v_dom);

		this.update({ dom: true, styles: true });

		this.displayInsertPositions();
		this.text_selection = undefined;
	}

	/**
	 *
	 * @param {vDomNode} v_node
	 */
	isTextContainer(v_node) {
		return !!v_node.tag.match(piep_cms_manager.match_text_containers);
	}

	/**
	 *
	 * @param {vDomNode} v_node
	 */
	isTextable(v_node) {
		return !!v_node.tag.match(piep_cms_manager.match_textables);
	}

	/**
	 * @param {number} vid
	 * @returns {FlowDirectionEnum}
	 */
	getFlowDirection = (vid) => {
		const parent_v_node = this.getVNodeDataById(vid).parent_v_nodes[0];
		if (parent_v_node) {
			if (this.isTextContainer(parent_v_node)) {
				return "inline";
			} else if (parent_v_node.module_name === "grid") {
				return "grid";
			} else if (parent_v_node.tag === "ul") {
				return "text_list";
			}
		}
		return "column";
	};

	/**
	 *
	 * @param {*} node
	 * @returns
	 */
	isNodeRoot(node) {
		return node.classList.contains("template_hook_root") || node === this.content;
	}

	displayInsertPositions() {
		this.insert_blcs._empty();

		const content_scroll_rect = piep_cms.content_scroll.getBoundingClientRect();

		const grabbed_blc_schema = piep_cms_manager.getVNodeSchema(this.grabbed_v_node);

		/**
		 *
		 * @returns {insertBlc}
		 */
		const getInsertBlc = () => {
			const insert_blc = document.createElement("DIV");
			insert_blc.classList.add("insert_blc");
			this.insert_blcs.append(insert_blc);

			// @ts-ignore
			return $(insert_blc);
		};

		/**
		 *
		 * @param {PiepNode} blc
		 * @param {insertPosEnum} pos
		 */
		const getInsertBlcPos = (blc, pos) => {
			const blc_rect = blc.getBoundingClientRect();

			let left, top;

			const off = 10;
			// const off_x = blc_rect.width > 50 ? off : 0;
			// const off_y = blc_rect.height > 50 ? off : 0;

			switch (pos) {
				case "left":
					left = blc_rect.left; // + off_x;
					top = blc_rect.top + blc_rect.height * 0.5;
					break;
				case "right":
					left = blc_rect.left + blc_rect.width; // - off_x;
					top = blc_rect.top + blc_rect.height * 0.5;
					break;
				case "top":
					left = blc_rect.left + blc_rect.width * 0.5;
					top = blc_rect.top; // + off_y;
					break;
				case "bottom":
					left = blc_rect.left + blc_rect.width * 0.5;
					top = blc_rect.top + blc_rect.height; // - off_y;
					break;
				case "center":
					left = blc_rect.left + blc_rect.width * 0.5;
					top = blc_rect.top + blc_rect.height * 0.5;
					break;
			}

			top += this.content_scroll.scrollTop;

			return { left, top };
		};

		/** @type {PiepNode[]} */
		let blcs = [];

		let force_in_grid = false;

		if (this.selected_resolution !== "df") {
			if (this.grabbed_block_parent && this.grabbed_block_parent.classList.contains("module_grid")) {
				force_in_grid = true;
				blcs = [this.grabbed_block_parent];
			}
		} else {
			blcs = this.content._children(".blc:not(.textable)");

			if (blcs.length === 0) {
				// left
				const insert_blc = getInsertBlc();
				const content_wrapper_rect = this.content_wrapper.getBoundingClientRect();
				insert_blc._set_absolute_pos(content_wrapper_rect.left + content_wrapper_rect.width * 0.5, content_wrapper_rect.top + 30);
				insert_blc._insert_action = () => {
					/** @type {vDomNode} */
					const grabbed_v_node_copy = cloneObject(this.grabbed_v_node);
					this.v_dom.push(grabbed_v_node_copy);
				};
			}
		}

		blcs.forEach((blc) => {
			if (blc._parent(this.getNodeSelector(this.grabbed_block_vid))) {
				// just no baby
				return;
			}

			const editor_disabled = blc.classList.contains("editor_disabled");

			const blc_rect = blc.getBoundingClientRect();
			if (
				blc_rect.top + blc_rect.height < content_scroll_rect.top + 20 ||
				blc_rect.top > content_scroll_rect.top + content_scroll_rect.height - 20
			) {
				// whole blc off
				return;
			}

			const blc_parent = blc._parent();
			const is_blc_root = this.isNodeRoot(blc);
			const is_blc_parent_root = this.isNodeRoot(blc_parent);

			const getNearVNodeData = () => {
				const near_v_node_data = this.getVNodeDataById(blc_vid);
				return near_v_node_data;
			};

			const blc_vid = +blc.dataset.vid;

			const getInsertVNode = () => {
				/** @type {vDomNode} */
				const grabbed_v_node_copy = cloneObject(this.grabbed_v_node);
				let insert_v_node = grabbed_v_node_copy;

				const is_node_container = this.grabbed_v_node.classes.includes("vertical_container") || this.grabbed_v_node.module_name === "grid";
				if (is_blc_parent_root && is_node_container) {
					insert_v_node.responsive_settings.df.width_type = "default_container";
				}

				return insert_v_node;
			};

			const getInsertVContainer = () => {
				const insert_v_node = getInsertVNode();

				// huh? a single script should be responsible for that but ok
				if (!insert_v_node.styles.df) {
					insert_v_node.styles.df = {};
				}

				return insert_v_node;

				let insert_v_container = insert_v_node;
				if (!insert_v_node.classes.includes("vertical_container")) {
					insert_v_container = {
						id: this.getNewBlcId(),
						tag: "div",
						styles: { df: {} },
						attrs: {},
						classes: ["vertical_container"],
						children: [insert_v_node],
					};
				}

				return insert_v_container;
			};

			/**
			 *
			 * @param {Direction} dir
			 */
			const insertAboveOrBelow = (dir) => {
				const near_v_node_data = this.getVNodeDataById(blc_vid);

				if (flow_direction === "grid" && !near_v_node.classes.includes("vertical_container")) {
					const insert_v_container = {
						id: this.getNewBlcId(),
						tag: "div",
						styles: {
							df: {
								gridRowStart: near_v_node.styles.df.gridRowStart,
								gridColumnStart: near_v_node.styles.df.gridColumnStart,
								gridRowEnd: near_v_node.styles.df.gridRowEnd,
								gridColumnEnd: near_v_node.styles.df.gridColumnEnd,
							},
						},
						attrs: {},
						classes: ["vertical_container"],
						children: [near_v_node],
					};

					const insert_v_node = getInsertVNode();
					let ind = near_v_node_data.index;
					if (dir === 1) {
						insert_v_container.children.push(insert_v_node);
					} else {
						insert_v_container.children.unshift(insert_v_node);
					}

					near_v_node_data.v_nodes.splice(ind, 1, insert_v_container);
				} else {
					let ind = near_v_node_data.index;
					if (dir === 1) {
						ind++;
					}

					const insert_v_node = getInsertVNode();
					near_v_node_data.v_nodes.splice(ind, 0, insert_v_node);
				}
			};

			const insertInside = () => {
				const insert_v_node = getInsertVNode();
				this.getVNodeById(blc_vid).children.push(insert_v_node);

				if (near_v_node.module_name === "absolute_container") {
					const st = insert_v_node.styles.df;
					if (!st.top && !st.bottom) {
						st.top = "0px";
					}
					if (!st.left && !st.right) {
						st.left = "0px";
					}
				}
			};

			/**
			 *
			 * @param {Direction} dir
			 */
			const insertOnSides = (dir) => {
				// if (flow_direction === "inline") {
				// 	return insertAboveOrBelow(dir); // TOOOO MANY
				// }

				const near_v_node_data = getNearVNodeData();
				const near_v_node = near_v_node_data.v_node;

				let ind = near_v_node_data.index;

				/** @type {vDomNode} */
				const grabbed_v_node_copy = cloneObject(this.grabbed_v_node);
				let suggest_wrapping_with_grid = false;

				if (flow_direction === "column") {
					suggest_wrapping_with_grid = true;
				}

				let new_vid = this.getNewBlcId();

				if (suggest_wrapping_with_grid) {
					const insert_v_container = getInsertVContainer();

					// const near_v_container = {
					// 	id: new_vid++,
					// 	tag: "div",
					// 	styles: { df: {} },
					// 	attrs: {},
					// 	classes: ["vertical_container"],
					// 	children: [near_v_node],
					// };

					const near_v_container = near_v_node;

					if (!near_v_container.styles.df) {
						near_v_container.styles.df = {};
					}

					insert_v_container.styles.df.gridRowStart = "1";
					insert_v_container.styles.df.gridColumnStart = dir === 1 ? "2" : "1";
					insert_v_container.styles.df.gridRowEnd = "2";
					insert_v_container.styles.df.gridColumnEnd = dir === 1 ? "3" : "2";
					// insert_v_container.styles.df.paddingTop = "var(--default_padding)"; // optional
					// insert_v_container.styles.df.paddingBottom = "var(--default_padding)";

					near_v_container.styles.df.gridRowStart = "1";
					near_v_container.styles.df.gridColumnStart = dir === 1 ? "1" : "2";
					near_v_container.styles.df.gridRowEnd = "2";
					// near_v_container.styles.df.paddingTop = "var(--default_padding)";
					// near_v_container.styles.df.paddingBottom = "var(--default_padding)";

					const grid = {
						tag: "div",
						id: new_vid++,
						styles: {
							df: {
								gridTemplateColumns: "1fr 1fr",
								gridTemplateRows: "auto",
								columnGap: "var(--default_padding)",
								rowGap: "var(--default_padding)",
								paddingLeft: "var(--default_padding)",
								paddingTop: "var(--default_padding)",
								paddingRight: "var(--default_padding)",
								paddingBottom: "var(--default_padding)",
							},
						},
						classes: [],
						attrs: {},
						settings: {},
						module_name: "grid",
						children: [near_v_container, insert_v_container],
					};

					near_v_node_data.v_nodes.splice(ind, 1, grid);
				}
			};

			/**
			 * @param {insertPosEnum} pos_str
			 * @param {any} action
			 * @param {boolean} ask_container
			 */
			const addInsertBlc = (pos_str, action, ask_container = true) => {
				let pos = getInsertBlcPos(blc, pos_str);

				const prev_blc = blc._prev();

				if (prev_blc) {
					/** @type {insertPosEnum} */
					let comp_pos_str;
					if (pos_str === "left") {
						comp_pos_str = "right";
					} else if (pos_str === "top") {
						comp_pos_str = "bottom";
					}
					const comp_pos = getInsertBlcPos(prev_blc, comp_pos_str);

					// useless? covers the prev pos
					if (Math.abs(comp_pos.left - pos.left) < this.insert_blc_size && Math.abs(comp_pos.top - pos.top) < this.insert_blc_size) {
						return;
					}
				}

				const insert_blc = getInsertBlc();

				if (ask_container) {
					const place_in_root = pos_str === "center" ? is_blc_root : is_blc_parent_root;
					if (!(grabbed_blc_schema && grabbed_blc_schema.standalone) && place_in_root) {
						insert_blc.classList.add("warning");
						insert_blc.dataset.tooltip = "Zalecamy umieścić ten element w dowolnym kontenerze";
					}
				}

				insert_blc._insert_action = action;

				insert_blc._set_absolute_pos(pos.left, pos.top);
			};

			const flow_direction = this.getFlowDirection(blc_vid);
			const near_v_node_data = getNearVNodeData();
			const near_v_node = near_v_node_data.v_node;

			let can_actually_move = !force_in_grid;

			const cannot_nest = grabbed_blc_schema && grabbed_blc_schema.cannot_nest_in_itself;
			const cannot_place_nearby =
				cannot_nest && !!near_v_node_data.parent_v_nodes.find((parent_v_node) => parent_v_node.module_name === grabbed_blc_schema.id);
			const cannot_put_inside = cannot_nest && (cannot_place_nearby || near_v_node.module_name === grabbed_blc_schema.id);

			let on_sides = can_actually_move;
			let above_or_below = can_actually_move;
			let inside = can_actually_move;

			if (cannot_place_nearby) {
				on_sides = false;
				above_or_below = false;
			}
			if (cannot_put_inside) {
				inside = false;
			}

			if (on_sides && (flow_direction === "inline" || flow_direction === "text_list")) {
				on_sides = false;
			}

			if (on_sides && blc._parent(".module_grid")) {
				on_sides = false;
			}

			if (flow_direction !== "column") {
				if (flow_direction === "grid" && !near_v_node.classes.includes("vertical_container")) {
					// sure let it be done
				} else if (near_v_node.module_name === "absolute_container") {
				} else {
					above_or_below = false;
				}
			}

			if (!isEquivalent(near_v_node_data.v_node.children, [])) {
				inside = false;
			}

			if (near_v_node.module_name === "grid" && !editor_disabled) {
				const cells = blc._children(".cell_float");
				const cell_map = {};
				let columns = 0;
				let rows = 0;
				cells.forEach((cell) => {
					const rect = cell.getBoundingClientRect();
					const row = +cell.dataset.r;
					const column = +cell.dataset.c;
					cell_map[`${row}_${column}`] = {
						row,
						column,
						rect,
					};
					columns = Math.max(columns, column);
					rows = Math.max(rows, row);
				});
				Object.values(cell_map).forEach((cell_data) => {
					/** @type {number} */
					const row = cell_data.row;
					/** @type {number} */
					const column = cell_data.column;
					/** @type {DOMRect} */
					const rect = cell_data.rect;

					// center
					const insert_blc = getInsertBlc();

					insert_blc._insert_action = () => {
						const v_node = this.getVNodeById(blc_vid);
						const insert_v_container = getInsertVContainer();
						const s = insert_v_container.styles[this.selected_resolution];
						s.gridRowStart = row + "";
						s.gridColumnStart = column + "";
						s.gridRowEnd = row + 1 + "";
						s.gridColumnEnd = column + 1 + "";

						v_node.children.push(insert_v_container);
					};

					insert_blc._set_absolute_pos(rect.left + rect.width * 0.5, rect.top + rect.height * 0.5 + this.content_scroll.scrollTop);

					// left
					const left_insert_blc = getInsertBlc();

					left_insert_blc._insert_action = () => {
						const v_node = this.getVNodeById(blc_vid);
						const insert_v_container = getInsertVContainer();
						const s = insert_v_container.styles[this.selected_resolution];
						s.gridRowStart = row + "";
						s.gridColumnStart = column + "";
						s.gridRowEnd = row + 1 + "";
						s.gridColumnEnd = column + 1 + "";

						const styles = v_node.styles[this.selected_resolution];

						/** @type {string[]} */
						const gtc = def(styles.gridTemplateColumns, "").split(" ");
						gtc.splice(column - 1, 0, "1fr");
						styles.gridTemplateColumns = gtc.join(" ");

						v_node.children.forEach((child) => {
							const styles = child.styles[this.selected_resolution];
							if (+styles.gridColumnStart > column - 1) {
								styles.gridColumnStart = +styles.gridColumnStart + 1 + "";
							}
							if (+styles.gridColumnEnd > column) {
								styles.gridColumnEnd = +styles.gridColumnEnd + 1 + "";
							}
						});

						v_node.children.push(insert_v_container);
					};

					if (column > 1) {
						/** @type {DOMRect} */
						const left_rect = cell_map[`${row}_${column - 1}`].rect;
						left_insert_blc._set_absolute_pos(
							(rect.left + left_rect.left + left_rect.width) * 0.5,
							rect.top + rect.height * 0.5 + this.content_scroll.scrollTop
						);
					} else {
						left_insert_blc._set_absolute_pos(rect.left, rect.top + rect.height * 0.5 + this.content_scroll.scrollTop);
					}

					// top
					const top_insert_blc = getInsertBlc();

					top_insert_blc._insert_action = () => {
						const v_node = this.getVNodeById(blc_vid);
						const insert_v_container = getInsertVContainer();
						const s = insert_v_container.styles[this.selected_resolution];
						s.gridRowStart = row + "";
						s.gridColumnStart = column + "";
						s.gridRowEnd = row + 1 + "";
						s.gridColumnEnd = column + 1 + "";

						const styles = v_node.styles[this.selected_resolution];

						/** @type {string[]} */
						const gtr = styles.gridTemplateRows.split(" ");
						gtr.splice(row - 1, 0, "1fr");
						styles.gridTemplateRows = gtr.join(" ");

						v_node.children.forEach((child) => {
							const styles = child.styles[this.selected_resolution];
							if (+styles.gridRowStart > row - 1) {
								styles.gridRowStart = +styles.gridRowStart + 1 + "";
							}
							if (+styles.gridRowEnd > row) {
								styles.gridRowEnd = +styles.gridRowEnd + 1 + "";
							}
						});

						v_node.children.push(insert_v_container);
					};

					if (row > 1) {
						/** @type {DOMRect} */
						const top_rect = cell_map[`${row - 1}_${column}`].rect;
						top_insert_blc._set_absolute_pos(
							rect.left + rect.width * 0.5,
							(rect.top + top_rect.top + top_rect.height) * 0.5 + this.content_scroll.scrollTop
						);
					} else {
						top_insert_blc._set_absolute_pos(rect.left + rect.width * 0.5, rect.top + this.content_scroll.scrollTop);
					}

					// right
					if (column === columns) {
						const right_insert_blc = getInsertBlc();

						right_insert_blc._insert_action = () => {
							const v_node = this.getVNodeById(blc_vid);
							const insert_v_container = getInsertVContainer();
							const s = insert_v_container.styles[this.selected_resolution];
							s.gridRowStart = row + "";
							s.gridColumnStart = column + 1 + "";
							s.gridRowEnd = row + 1 + "";
							s.gridColumnEnd = column + 2 + "";

							const styles = v_node.styles[this.selected_resolution];
							styles.gridTemplateColumns += " 1fr";
							v_node.children.push(insert_v_container);
						};

						right_insert_blc._set_absolute_pos(rect.left + rect.width, rect.top + rect.height * 0.5 + this.content_scroll.scrollTop);
					}

					// bottom
					if (row === rows) {
						const bottom_insert_blc = getInsertBlc();

						bottom_insert_blc._insert_action = () => {
							const v_node = this.getVNodeById(blc_vid);
							const insert_v_container = getInsertVContainer();
							const s = insert_v_container.styles[this.selected_resolution];
							s.gridRowStart = row + 1 + "";
							s.gridColumnStart = column + "";
							s.gridRowEnd = row + 2 + "";
							s.gridColumnEnd = column + 1 + "";

							const styles = v_node.styles[this.selected_resolution];
							styles.gridTemplateRows += " auto";
							v_node.children.push(insert_v_container);
						};

						bottom_insert_blc._set_absolute_pos(rect.left + rect.width * 0.5, rect.top + rect.height + this.content_scroll.scrollTop);
					}
				});
			}

			if (inside && near_v_node.module_name === "template_hook") {
				inside = false;
			}

			if (editor_disabled) {
				on_sides = false;
				above_or_below = false;
			}

			if (on_sides) {
				addInsertBlc(
					"left",
					() => {
						insertOnSides(-1);
					},
					false
				);

				addInsertBlc(
					"right",
					() => {
						insertOnSides(1);
					},
					false
				);
			}

			if (above_or_below) {
				addInsertBlc("top", () => {
					insertAboveOrBelow(-1);
				});

				addInsertBlc("bottom", () => {
					insertAboveOrBelow(1);
				});
			}

			if (inside) {
				addInsertBlc("center", () => {
					insertInside();
				});
			}
		});

		this.insert_blcs._children(".insert_blc").forEach((insert_blc) => {
			insert_blc._set_content(html`<i class="fas fa-plus"></i>`);
			insert_blc.dataset.wght = "1";
		});

		let shrunk_ids = [];

		while (true) {
			/**
			 * @type {{
			 * a: number
			 * b: number
			 * cover_area: number
			 * }[]}
			 */
			let covering_blcs_data = [];

			/** @type {insertBlc[]} */
			// @ts-ignore
			const insert_blcs = this.insert_blcs._children(".insert_blc");
			const insert_blcs_len = insert_blcs.length;
			for (let a = 0; a < insert_blcs_len; a++) {
				if (shrunk_ids.includes(a)) {
					continue;
				}
				const blc_a = insert_blcs[a];
				const blc_a_rect = blc_a.getBoundingClientRect();
				for (let b = a + 1; b < insert_blcs_len; b++) {
					if (shrunk_ids.includes(b)) {
						continue;
					}
					const blc_b = insert_blcs[b];
					const blc_b_rect = blc_b.getBoundingClientRect();

					const off = 2; // added to width as margin (half on each side ofc)

					const cover_x = Math.max(0, blc_a_rect.width + off - Math.abs(blc_a_rect.left - blc_b_rect.left));
					const cover_y = Math.max(0, blc_a_rect.height + off - Math.abs(blc_a_rect.top - blc_b_rect.top));

					const cover_area = cover_x * cover_y;

					if (cover_area > 0) {
						covering_blcs_data.push({ a, b, cover_area });
					}
				}
			}

			if (covering_blcs_data.length === 0) {
				break;
			}

			covering_blcs_data.sort((a, b) => Math.sign(b.cover_area - a.cover_area));

			covering_blcs_data.forEach((covering_blcs) => {
				const a = covering_blcs.a;
				const b = covering_blcs.b;

				if (shrunk_ids.includes(a) || shrunk_ids.includes(b)) {
					// could happen when we are in this loop
					return;
				}

				const blc_a = insert_blcs[a];
				const blc_b = insert_blcs[b];

				const blc_a_rect = blc_a.getBoundingClientRect();
				const blc_b_rect = blc_b.getBoundingClientRect();

				const weight_a = +blc_a.dataset.wght;
				const weight_b = +blc_b.dataset.wght;
				const weight = weight_a + weight_b;

				const master_insert_blc = getInsertBlc();
				master_insert_blc.classList.add("multiple");

				shrunk_ids.push(a, b);
				blc_a.classList.add("hidden");
				blc_b.classList.add("hidden");

				const popup_blcs = [];

				if (weight_a === 1) {
					popup_blcs.push(blc_a);
				} else {
					popup_blcs.push(...blc_a._popup_blcs);
				}
				if (weight_b === 1) {
					popup_blcs.push(blc_b);
				} else {
					popup_blcs.push(...blc_b._popup_blcs);
				}

				master_insert_blc._popup_blcs = popup_blcs;
				master_insert_blc.dataset.tooltip = `Kliknij by zobaczyć dodatkowe pozycje`;

				master_insert_blc._set_absolute_pos(
					(blc_a_rect.left * weight_a) / weight + (blc_b_rect.left * weight_b) / weight + blc_a_rect.width * 0.5,
					(blc_a_rect.top * weight_a) / weight +
						(blc_b_rect.top * weight_b) / weight +
						blc_a_rect.height * 0.5 +
						this.content_scroll.scrollTop
				);
				master_insert_blc._set_content(weight);
				master_insert_blc.dataset.wght = weight + "";
			});
		}
	}

	releaseBlock() {
		this.grabbed_block_wrapper.classList.remove("visible");
		this.container.classList.remove("grabbed_block");
		this.container.classList.remove("disable_editing");
		this.container.classList.remove("has_insert_pos");
		this.float_focuses._empty();
		this.container.classList.remove("float_multi_insert_visible");
		this.float_multi_insert_bckg.classList.add("hidden");

		this.content.style.minHeight = "";

		this.insert_blcs._empty();

		const grabbed_block_vid = this.grabbed_block_vid;
		delete this.grabbed_block_vid;

		const grabbed_v_node = this.grabbed_v_node;
		delete this.grabbed_v_node;

		const current_insert_blc = this.current_insert_blc;
		delete this.current_insert_blc;

		this.grabbed_block_wrapper_rect = undefined;
		delete this.has_insert_pos;

		if (current_insert_blc) {
			this.update({ all: true });

			this.pushHistory(`moved_blc_${grabbed_block_vid}`);

			this.setFocusNode(grabbed_block_vid);

			if (this.grab_block_options.is_new) {
				/**
				 * @param {vDomNode[]} v_nodes
				 */
				const traverseVDom = (v_nodes) => {
					for (const v_node of v_nodes) {
						if (this.isTextable(v_node)) {
							this.text_selection = {
								anchor_offset: 0,
								anchor_vid: v_node.id,
								focus_offset: v_node.text.length,
								focus_vid: v_node.id,
								// @ts-ignore
								direction: 1,
								length: v_node.text.length,
								middle_vids: [v_node.id],
								partial_ranges: [],
								single_node: true,
							};
							this.setContentActive(true);
							break;
						}
						if (v_node.children) {
							traverseVDom(v_node.children);
						}
					}
				};
				traverseVDom([grabbed_v_node]);
			}
		} else {
			this.v_dom.splice(0, this.v_dom.length);
			deepAssign(this.v_dom, this.before_grab_v_dom);

			this.update({ all: true });
		}

		this.displaySelectionBreadcrumbs();
		this.setBlcMenuFromFocusedNode();

		tooltip.force_target = undefined;
	}

	/**
	 *
	 * @param {number} vid
	 * @returns
	 */
	setFocusNode(vid) {
		if (this.grabbed_v_node) {
			return;
		}

		let just_changed_focus_vid = this.focus_node_vid !== vid;
		this.focus_node_vid = vid;

		const focus_node = this.getNode(vid);

		/** @type {PiepNode} */
		let tree_blc;

		if (just_changed_focus_vid) {
			this.filterMenu({ scroll_to_top: true });
		}

		if (vid === undefined) {
			this.text_selection = undefined;
			this.cursor.classList.add("hidden");
		}

		if (just_changed_focus_vid) {
			if (focus_node) {
				// it's' dumb but that's how selection works, we must wait untill it finishes
				setTimeout(() => {
					this.setBlcMenuFromFocusedNode();
				});

				// tree_blc = this.inspector_tree._child(`.tblc_${this.focus_node_vid}`);
				// if (tree_blc) {
				// 	scrollIntoView(tree_blc);
				// }
			}

			this.displaySelectionBreadcrumbs();
			this.displayNodeLayout();
		}

		// this.inspector_tree._children(".v_node_label").forEach((e) => {
		// 	e.classList.toggle("selected", +e.dataset.vid === this.focus_node_vid);
		// });
	}

	/**
	 *
	 * @param {{
	 * from_blc_menu_name?: PiepCMSMenuName
	 * }} options
	 * @returns
	 */
	setBlcMenuFromFocusedNode(options = {}) {
		const resolutions_above_rev = this.getResolutionsWeCareAbout(true).reverse();

		/** @type {number[]} */
		const from_vids = [];

		if (this.text_selection) {
			from_vids.push(...this.getAllTextSelectionVids());
		} else {
			if (this.focus_node_vid !== undefined) {
				from_vids.push(this.focus_node_vid);
			}
		}

		/** @type {vDomNode[]} */
		const from_v_nodes = [];

		from_vids.filter(onlyUnique).forEach((vid) => {
			const v_node_data = this.getVNodeDataById(vid);
			if (!v_node_data) {
				return;
			}
			const v_node = v_node_data.v_node;

			if (this.isTextable(v_node)) {
				from_v_nodes.push(v_node_data.parent_v_nodes[0]);
			}

			from_v_nodes.push(v_node);
		});

		/**
		 *
		 * @param {PiepNode[]} inputs
		 */
		const setPropsOfInputs = (inputs) => {
			inputs.forEach((input) => {
				const next = input._next();
				let responsive_info;
				let res_val;
				if (next && next.classList.contains("responsive_info")) {
					responsive_info = next;
				}

				const prop_str = input.dataset.blc_prop;
				const is_text_container_prop = piep_cms_manager.text_container_props.includes(prop_str);
				let val = "";
				for (const v_node of from_v_nodes) {
					let prop_val;
					let v_node_ref = v_node;

					// ignore textable styles of text container if there is any selection
					if (this.text_selection) {
						if (this.isTextContainer(v_node) && piep_cms_manager.textable_props.includes(prop_str)) {
							continue;
						}
					}

					// only textables propagate things like text container tag name or text alignment
					if (this.isTextable(v_node)) {
						if (is_text_container_prop) {
							continue;
						}
					}

					if (prop_str.startsWith("styles.")) {
						const prop_key = prop_str.substring("styles.".length);
						const styles = v_node_ref.styles;

						const res_styles = styles[this.selected_resolution];
						if (res_styles) {
							prop_val = res_styles[prop_key];
						}

						for (const res_name of resolutions_above_rev) {
							const res_styles = styles[res_name];
							if (res_styles && res_styles[prop_key]) {
								res_val = res_styles[prop_key];
								break;
							}
						}
					} else if (prop_str.startsWith("responsive_settings.")) {
						const prop_key = prop_str.substring("responsive_settings.".length);
						const settings = v_node_ref.responsive_settings;

						const res_settings = settings[this.selected_resolution];
						if (res_settings) {
							prop_val = res_settings[prop_key];
						}
						for (const res_name of resolutions_above_rev) {
							const res_settings = settings[res_name];
							if (res_settings && res_settings[prop_key]) {
								res_val = res_settings[prop_key];
								break;
							}
						}
					} else if (prop_str.startsWith("attrs.")) {
						prop_val = v_node_ref.attrs[prop_str.substring("attrs.".length)];
					} else if (prop_str.startsWith("settings.")) {
						prop_val = v_node_ref.settings[prop_str.substring("settings.".length)];
					} else {
						prop_val = v_node_ref[prop_str];
					}

					if (prop_val === undefined) {
						// nothing selected? just ignore, eeeeezy
						val = "";
						break;
					} else {
						if (val !== undefined) {
							val = prop_val;
						} else if (prop_val !== val) {
							// duuude, can't display 2 different values, thus leave empty
							val = "";
							break;
						}
					}
				}

				input._set_value(val, { quiet: true });

				if (responsive_info) {
					responsive_info._set_content(piep_cms_manager.translatePropVal(res_val));
					responsive_info.dataset.tooltip = res_val ? "Odziedziczona domyślna wartość" : "";
				} else if (input.classList.contains("radio_group")) {
					input._children(".inherited").forEach((e) => {
						e.classList.remove("inherited");
						e.dataset.tooltip = "";
					});
					const checkbox = input._child(`[data-value="${res_val}"]`);
					if (checkbox) {
						const checkbox_area = checkbox._parent(".checkbox_area");
						checkbox_area.classList.add("inherited");
						checkbox_area.dataset.tooltip = "Odziedziczona domyślna opcja";
					}
				}
			});
		};

		if (options.from_blc_menu_name !== "float") {
			setPropsOfInputs(this.float_menu._children("[data-blc_prop]"));
			this.container.dispatchEvent(new CustomEvent("set_blc_menu"));
		}
		if (options.from_blc_menu_name !== "side") {
			setPropsOfInputs(this.side_menu._children("[data-blc_prop]"));
		}

		registerForms();
	}

	updatedSideMenu() {
		let visible = false;
		for (const child of this.blc_menu_scroll_panel._direct_children()) {
			if (!visible && !isHidden(child)) {
				child.classList.add("first_visible");
				visible = true;
			} else {
				child.classList.remove("first_visible");
			}
		}
	}

	/**
	 *
	 * @param {{
	 * scroll_to_top?: boolean
	 * from_blc_menu_name?: PiepCMSMenuName
	 * }} options
	 */
	filterMenu(options = {}) {
		/** @type {cmsEditableGroupEnum} */
		const type_group = this.filter_blc_menu._get_value();

		const focus_node = this.getNode(this.focus_node_vid);
		const v_node = focus_node ? this.getVNodeById(+focus_node.dataset.vid) : undefined;

		const has_selection = !!v_node;
		const any_change = this.last_set_filter_menu_to_vid !== this.focus_node_vid || this.last_type_group !== type_group;
		if (has_selection && any_change) {
			this.last_set_filter_menu_to_vid = this.focus_node_vid;
			this.last_type_group = type_group;

			piep_cms_manager.blc_props
				.map((prop, index) => {
					const blc_prop_wrapper = this.side_menu._child(".prop_" + prop.name);

					let visible = true;
					let priority = -index * 0.001;
					if (prop.blc_groups) {
						visible = false;
						for (const blc_group of prop.blc_groups) {
							if (blc_group.matcher) {
								const v_node_data = this.getVNodeDataById(v_node.id);
								const matches = blc_group.matcher(v_node_data, this);
								if (matches) {
									visible = true;
								}
							}
							if (blc_group.has_classes) {
								visible = true;
								blc_group.has_classes.forEach((c) => {
									if (!v_node.classes.includes(c)) {
										visible = false;
									}
								});
							}
							if (blc_group.module_names) {
								visible = blc_group.module_names.includes(v_node.module_name);
							}
							if (blc_group.match_tag) {
								const matches = !!v_node.tag.match(blc_group.match_tag);
								if (matches) {
									visible = true;
								}
							}

							if (blc_group.exclude) {
								visible = !visible;
							}

							if (visible) {
								//priority += def(blc_group.priority, 1);
								priority += def(blc_group.priority, 0);
								break;
							}
						}
					}

					if (visible && type_group !== "all") {
						visible = prop.type_groups.includes(type_group);
					}

					blc_prop_wrapper.classList.toggle("hidden", !visible);

					return {
						visible,
						blc_prop_wrapper,
						priority,
					};
				})
				.filter((x) => x.visible)
				.sort((a, b) => Math.sign(b.priority - a.priority))
				.forEach((x, index) => {
					const before_node = this.blc_menu_scroll_panel._direct_children()[index];
					if (x.blc_prop_wrapper !== before_node) {
						this.blc_menu_scroll_panel.insertBefore(x.blc_prop_wrapper, before_node);
					}
				});

			piep_cms_manager.floating_blc_props
				.map((prop, index) => {
					const blc_prop_wrapper = this.float_menu._child(".prop_" + prop.name);

					let visible = true;
					let priority = -index * 0.001;
					if (prop.blc_groups) {
						visible = false;
						for (const blc_group of prop.blc_groups) {
							if (blc_group.matcher) {
								const v_node_data = this.getVNodeDataById(v_node.id);
								const matches = blc_group.matcher(v_node_data, this);
								if (matches) {
									visible = true;
								}
							}
							if (blc_group.has_classes) {
								visible = true;
								blc_group.has_classes.forEach((c) => {
									if (!v_node.classes.includes(c)) {
										visible = false;
									}
								});
							}
							if (blc_group.module_names) {
								visible = blc_group.module_names.includes(v_node.module_name);
							}
							if (blc_group.match_tag) {
								const matches = !!v_node.tag.match(blc_group.match_tag);
								if (matches) {
									visible = true;
								}
							}

							if (blc_group.exclude) {
								visible = !visible;
							}

							if (visible) {
								priority += def(blc_group.priority, 0);
								break;
							}
						}
					}

					blc_prop_wrapper.classList.toggle("hidden", !visible);

					return {
						blc_prop_wrapper,
						priority,
					};
				})
				.sort((a, b) => Math.sign(b.priority - a.priority))
				.forEach((x, index) => {
					const before_node = this.float_menu._direct_children()[index];
					if (x.blc_prop_wrapper !== before_node) {
						this.float_menu.insertBefore(x.blc_prop_wrapper, before_node);
					}
				});
			this.float_menu.append(this.float_menu._child(".unselect_everything"));
		}

		this.blc_menu_scroll_panel.classList.toggle("hidden", !has_selection);
		this.case_blc_menu_empty.classList.toggle("hidden", has_selection);

		if (has_selection && options.scroll_to_top) {
			this.blc_menu_scroll_panel.scrollTop = 0;
		}

		this.setBlcMenuFromFocusedNode({ from_blc_menu_name: options.from_blc_menu_name });

		this.updatedSideMenu();
	}

	/**
	 *
	 * @param {ShowFocusToNodeData[]} show_nodes
	 * @returns
	 */
	showFocusToNodes(show_nodes) {
		let float_focuses_html = "";

		/** @type {number[]} */
		const vids = [];

		if (this.select_blc_active) {
			for (const show_node of show_nodes.filter((e, index) => show_nodes.findIndex((z) => z.vid === e.vid) === index)) {
				const focus_node = this.getNode(show_node.vid);
				if (!focus_node) {
					continue;
				}
				if (focus_node.classList.contains("textable")) {
					vids.push(show_node.vid);
				} else {
					const content_scroll_rect = this.content_scroll.getBoundingClientRect();
					const focus_node_rect = focus_node.getBoundingClientRect();
					let width = focus_node_rect.width;
					let height = focus_node_rect.height;
					let x0 = focus_node_rect.left;
					let y0 = focus_node_rect.top;
					let x1 = x0 + width;
					let y1 = y0 + height;

					y0 = Math.max(y0, content_scroll_rect.top);
					if (y1 <= content_scroll_rect.top + 1) {
						continue;
					}
					x0 = Math.max(x0, content_scroll_rect.left);
					if (x1 <= content_scroll_rect.left + 1) {
						continue;
					}
					const topy = content_scroll_rect.top + content_scroll_rect.height;
					y1 = Math.min(y1, topy);
					if (y0 >= topy - 1) {
						continue;
					}
					const topx = content_scroll_rect.left + content_scroll_rect.width;
					x1 = Math.min(x1, topx);
					if (x0 >= topx - 1) {
						continue;
					}

					float_focuses_html += html`<div
						class="focus_rect"
						style="
                            left:${x0 - 1}px;
                            top:${y0 - 1 + this.content_scroll.scrollTop}px;
                            width:${x1 + 2 - x0}px;
                            height:${y1 + 2 - y0}px;
                            opacity:${show_node.opacity};
                        "
					></div>`;
				}
			}
		}

		this.displayTextSelection({ vids });

		this.float_focuses._set_content(float_focuses_html);
	}

	/**
	 *
	 * @param {number} vid
	 * @returns
	 */
	showFloatMenuToNode(vid) {
		if (vid === undefined) {
			return;
		}

		const focus_node = this.getNode(vid);
		if (focus_node === undefined) {
			return;
		}
		const focus_node_rect = focus_node.getBoundingClientRect();
		const content_wrapper_rect = this.content_wrapper.getBoundingClientRect();
		const piep_editor_float_menu_rect = this.float_menu.getBoundingClientRect();

		let left = focus_node_rect.left + (focus_node_rect.width - piep_editor_float_menu_rect.width) / 2;
		let top = focus_node_rect.top - piep_editor_float_menu_rect.height - 1;

		if (this.editing_layout) {
			const mt = $(`.margin_control[data-layout_prop="marginTop"]`);
			if (mt) {
				top = mt.getBoundingClientRect().top - piep_editor_float_menu_rect.height - 1;
			}
		}

		const safe_off_x = 5;
		const safe_off_y = 20;
		left = clamp(
			content_wrapper_rect.left + safe_off_x,
			left,
			content_wrapper_rect.left + content_wrapper_rect.width - piep_editor_float_menu_rect.width - safe_off_x
		);

		const min_y = content_wrapper_rect.top + safe_off_y;
		if (focus_node.classList.contains("text_container")) {
			top = Math.max(top, min_y);
		} else {
			if (top < min_y) {
				top += focus_node_rect.height + piep_editor_float_menu_rect.height + 2;

				if (top > content_wrapper_rect.top + content_wrapper_rect.height - safe_off_y) {
					top -= 0.5 * (focus_node_rect.height + piep_editor_float_menu_rect.height + 2);
				}
			}
		}

		this.float_menu._set_absolute_pos(left, top + this.content_scroll.scrollTop);
	}

	/**
	 *
	 * @param {number} vid
	 * @returns {string}
	 */
	getNodeSelector(vid) {
		return `.blc_${vid}`;
	}

	/**
	 *
	 * @param {number} vid
	 * @returns {PiepNode}
	 */
	getNode(vid) {
		return this.content._child(this.getNodeSelector(vid));
	}

	/**
	 *
	 * @param {Direction} dir
	 * @param {boolean} shift
	 */
	moveCursorSideways(dir, shift) {
		if (this.text_selection.length > 0 && !shift) {
			// opposite
			if (dir * this.text_selection.direction < 0) {
				this.text_selection.focus_offset = this.text_selection.anchor_offset;
				this.text_selection.focus_vid = this.text_selection.anchor_vid;
			}
			this.collapseTextSelection();
			return;
		}

		const focus_node = this.getNode(this.text_selection.focus_vid);
		const focus_offset = this.text_selection.focus_offset;
		const vid = this.text_selection.focus_vid;
		const v_node = this.getVNodeById(vid);

		if (!v_node || v_node.text === undefined) {
			return;
		}

		const edge = dir === 1 ? focus_offset >= v_node.text.length : focus_offset <= 0;
		if (edge) {
			const next_textable = this.getDeepSibling(focus_node, ".in_text_container", dir);
			if (next_textable) {
				this.text_selection.focus_vid = +next_textable.dataset.vid;
				this.text_selection.focus_offset = dir === 1 ? 0 : next_textable.textContent.length;
			}
		} else {
			this.text_selection.focus_offset += dir;
		}

		if (shift) {
			this.updateDefiniteSelection();
		} else {
			this.collapseTextSelection();
		}
		//this.displayTextSelection();
	}

	/**
	 *
	 * @param {number} dx
	 * @param {number} dy
	 * @param {boolean} shift
	 */
	moveCursorFromAnywhere(dx, dy, shift) {
		const sel_rect = this.cursor.getBoundingClientRect();
		const sel_center = getRectCenter(sel_rect);

		const textables = this.content._children(".textable:not(.editor_disabled)");

		/** @type {{node:PiepNode, dist: number}[]} */
		let textables_with_dist = [];

		for (const textable of textables) {
			/**
			 *
			 * @param {DOMRect} rect
			 */
			const tryRefPoint = (rect) => {
				const x = rect.left + rect.width * 0.5;
				const y = rect.top + (dy < 0 ? rect.height : 0);

				let textable_dist = 0;
				const ddx = x - sel_center.x;
				const ddy = y - sel_center.y;
				if (dx !== 0) {
					const dddx = dx * ddx;
					if (dddx < 1) {
						return;
					}
					textable_dist += dddx;
				}
				if (dy !== 0) {
					const dddy = dy * ddy;
					if (dddy < 5) {
						return;
					}
					textable_dist += dddy;
				}

				textables_with_dist.push({ dist: textable_dist, node: textable });
			};

			if (textable.textContent === "") {
				tryRefPoint(textable.getBoundingClientRect());
			} else {
				tryRefPoint(getRangeByIndex(textable, 0).getBoundingClientRect());
				tryRefPoint(getRangeByIndex(textable, textable.textContent.length).getBoundingClientRect());
			}
		}

		if (textables_with_dist.length > 0) {
			textables_with_dist.sort((a, b) => Math.sign(a.dist - b.dist));

			let lowest = textables_with_dist[0].dist;

			let pretty_dist = 100000000;
			/** @type {PiepNode} */
			let pretty_textable;
			/** @type {number} */
			let pretty_pos;

			const margin = 50;
			for (let i = 0; i < textables_with_dist.length; i++) {
				if (textables_with_dist[i].dist > lowest + margin) {
					break;
				}

				const textable = textables_with_dist[i].node;

				const range = document.createRange();

				let closest_pos = 0;
				let pos_smallest_dist = 100000000;
				const text_node = getTextNode(textable);

				const considerRect = (position_center) => {
					let pos_dist = 0;
					const ddx = position_center.x - sel_center.x;
					const ddy = position_center.y - sel_center.y;
					if (dx === 0) {
						pos_dist += 0.1 * Math.abs(ddx);
					} else {
						const dddx = dx * ddx;
						if (dddx < 1) {
							return false;
						}
						pos_dist += dddx;
					}
					if (dy === 0) {
						pos_dist += 0.1 * Math.abs(ddy);
					} else {
						const dddy = dy * ddy;
						if (dddy < 5) {
							return false;
						}
						pos_dist += dddy;
					}

					if (pos_dist < pos_smallest_dist) {
						pos_smallest_dist = pos_dist;
						return true;
					}

					return false;
				};

				for (let pos = 0; pos <= text_node.textContent.length; pos++) {
					range.setStart(text_node, pos);
					range.setEnd(text_node, pos);

					const position_center = getRectCenter(range.getBoundingClientRect());
					if (considerRect(position_center)) {
						closest_pos = pos;
					}
				}

				if (text_node.textContent === "") {
					if (considerRect(getRectCenter(textable.getBoundingClientRect()))) {
						closest_pos = 0;
					}
				}

				if (pos_smallest_dist < pretty_dist) {
					pretty_dist = pos_smallest_dist;

					pretty_textable = textable;
					pretty_pos = closest_pos;
				}
			}

			if (pretty_textable) {
				this.text_selection.focus_vid = +pretty_textable.dataset.vid;
				this.text_selection.focus_offset = pretty_pos;
			}

			if (shift) {
				this.updateDefiniteSelection();
			} else {
				this.collapseTextSelection();
			}
		}
	}

	// /**
	//  *
	//  * @param {boolean} open
	//  */
	// toggleInspector(open = undefined) {
	// 	if (open !== undefined) {
	// 		this.inspector_open = open;
	// 	} else {
	// 		this.inspector_open = !this.inspector_open;
	// 	}
	// 	this.inspector.classList.toggle("open", this.inspector_open);

	// 	const show_inspector_btn = this.container._child(".show_inspector_btn");
	// 	show_inspector_btn.classList.toggle("primary", this.inspector_open);
	// 	show_inspector_btn.classList.toggle("transparent", !this.inspector_open);
	// 	show_inspector_btn.dataset.tooltip = this.inspector_open ? "Ukryj drzewko elementów" : "Pokaż drzewko elementów";
	// }
}
