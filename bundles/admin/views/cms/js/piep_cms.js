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
		/** @type {vDomNode[][]} */
		this.v_dom_history = [];

		this.max_vid_inside = 0;

		this.last_map_vid_render_props = {}; // vid => props

		/** @type {"float" | "side" | ""} */
		this.last_blc_menu_name = "";

		this.initNodes();
		this.initConsts();

		piep_cms_manager.setPiepCms(this);

		this.initInspector();
		this.initSelectionBreadcrumbs();
		this.initBlcMenu();
		this.initFloatMenu();
		this.initSelectResolution();
		this.initRightMenu();
		this.initAddBlockMenu();
		this.initLayoutEdit();

		this.initEditables();
		this.initEditingColors();
		this.initEditingFontSize();

		this.initPaste();
		this.initClick();
		this.initKeyDown();

		this.initHistory();

		this.mainLoop();

		piep_cms_manager.editorReady();
	}

	initNodes() {
		this.content = this.container._child(".piep_editor_content");
		this.content_wrapper = this.container._child(".piep_editor_content_wrapper");
		this.content_scroll = this.container._child(".piep_editor_content_scroll");

		const node = (class_name) => {
			this.container.insertAdjacentHTML("beforeend", html`<div class="${class_name}"></div>`);
			return this.container._child(`.${class_name}`);
		};

		const styles = (class_name) => {
			this.container.insertAdjacentHTML("beforeend", html`<style class="${class_name}"></style>`);
			return this.container._child(`.${class_name}`);
		};

		this.cursor = node("piep_editor_cursor");
		this.grabbed_block_wrapper = node("piep_editor_grabbed_block_wrapper");
		this.grabbed_block_wrapper.classList.add("focus_rect");

		this.alternative_scroll_panel = node("piep_editor_alternative_scroll_panel");
		this.float_focuses = node("piep_editor_float_focuses");
		this.parent_float_focus = node("piep_editor_parent_float_focus"); // TODO: display more than just a parent? f.e. for columns
		this.float_menu = node("piep_editor_float_menu");
		this.add_block_menu = node("piep_editor_add_block_menu");
		this.layout_controls = node("piep_editor_layout_controls");

		this.styles = styles("piep_editor_styles");

		this.side_menu = this.container._child(".piep_editor_blc_menu");

		this.float_multi_insert_bckg = node("piep_editor_float_multi_insert_bckg");
		this.float_multi_insert_bckg.classList.add("hidden");

		this.alternative_scroll_panel.append(this.float_multi_insert_bckg);
		this.alternative_scroll_panel.append(this.layout_controls);
		this.alternative_scroll_panel.append(this.float_menu);
		this.alternative_scroll_panel.append(this.float_focuses);
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
			// document.addEventListener("keydown", (ev) => {
			//     if (!history_comp_focus) {
			//         return;
			//     }

			//     if (ev.key && ev.ctrlKey) {
			//         if (ev.key.toLowerCase() == "z") {
			//             ev.preventDefault();
			//         }
			//         if (ev.key.toLowerCase() == "y") {
			//             ev.preventDefault();
			//         }
			//     }
			// });
		}

		this.history_steps_back = 0;
		this.v_dom_history = [];
		this.pushHistory("");
	}

	/**
	 *
	 * @param {string} name
	 */
	pushHistory(name) {
		if (this.history_change_name && this.history_change_name === name && this.v_dom_history.length > 1) {
			this.v_dom_history.splice(this.v_dom_history.length - 1, 1);
		}

		this.v_dom_history.splice(this.v_dom_history.length - this.history_steps_back, this.history_steps_back);
		this.history_steps_back = 0;

		if (this.v_dom_history.length > 0 && isEquivalent(this.v_dom_history[this.v_dom_history.length - 1], this.v_dom)) {
			return;
		}
		this.v_dom_history.push(cloneObject(this.v_dom));
		this.renderHistory();

		this.filterMenu();

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
		this.history_steps_back = Math.min(this.history_steps_back + 1, this.v_dom_history.length - 1);
		this.setDataFromHistory();
	}

	setDataFromHistory() {
		this.v_dom = cloneObject(this.v_dom_history[this.v_dom_history.length - 1 - this.history_steps_back]);
		this.update({ all: true });
		this.renderHistory();
		this.setFocusNode(undefined);
		this.removeEditorSelection();
	}

	renderHistory() {
		this.undo_btn.toggleAttribute("disabled", this.history_steps_back >= this.v_dom_history.length - 1);
		this.redo_btn.toggleAttribute("disabled", this.history_steps_back === 0);
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
			if (this.selected_resolution === "df") {
				this.content_scroll.style.maxWidth = "";
			} else {
				this.content_scroll.style.maxWidth = responsive_preview_sizes[this.selected_resolution] + 20 + "px"; // 20 for scrollbar
			}

			this.update({ all: true });
			this.setBlcMenuFromFocusedNode();
		});

		this.select_resolution._set_value("df");
	}

	initConsts() {}

	initFloatMenu() {
		let floating_blc_props_menu_html = "";
		piep_cms_manager.floating_blc_props.forEach((blc_prop) => {
			floating_blc_props_menu_html += html`<div class="prop_${blc_prop.name}">${blc_prop.menu_html}</div>`;
		});
		this.float_menu._set_content(floating_blc_props_menu_html);
	}

	initEditingFontSize() {
		/**
		 *
		 * @param {PiepNode} font_size_wrapper
		 */
		const updateFontSizeWrapper = (font_size_wrapper) => {
			registerForms(); // let the options_wrapper appear

			const middle_input = font_size_wrapper._child("input.hidden");

			const radio_group = font_size_wrapper._child(".radio_group");
			let font_size_options_html = html`
				<div class="checkbox_area empty">
					<p-checkbox data-value=""></p-checkbox>
					<span>-</span>
				</div>
			`;

			font_sizes.forEach((font_size) => {
				font_size_options_html += html`
					<div class="checkbox_area">
						<p-checkbox data-value="var(--${font_size.name})"></p-checkbox>
						<div style="font-size:var(--${font_size.name});line-height: 1;">A</div>
					</div>
				`;
			});

			radio_group._set_content(font_size_options_html);

			registerForms();

			const value_input = font_size_wrapper._child(".value_input");
			const unit_input = font_size_wrapper._child(".piep_editor_unit_input");

			if (!middle_input.classList.contains("wrrgstrd")) {
				middle_input.classList.add("wrrgstrd");

				let middle_input_setting_val_user = false;
				middle_input.addEventListener("value_set", () => {
					if (middle_input_setting_val_user) {
						return;
					}

					/** @type {string} */
					const get_value = middle_input._get_value();
					const on_the_list = !!font_sizes.find((f) => `var(--${f.name})` === get_value);

					/** @type {any} */
					let val = get_value;
					let uni = "";
					for (const unit of ["px", "em", "rem"]) {
						if (get_value.endsWith(unit)) {
							val = numberFromStr(val);
							uni = unit;
						}
					}

					const set_val = on_the_list ? "" : val;
					value_input._set_value(set_val, { quiet: true });
					unit_input._set_value(on_the_list ? "px" : uni, { quiet: true });

					radio_group._set_value(on_the_list ? get_value : "", { quiet: true });
				});

				const change = () => {
					middle_input_setting_val_user = true;
					middle_input._set_value(value_input._get_value() + unit_input._get_value());
					middle_input_setting_val_user = false;
				};
				unit_input.addEventListener("change", change);
				value_input.addEventListener("change", change);
				value_input.addEventListener("input", change);

				radio_group.addEventListener("change", () => {
					middle_input._set_value(radio_group._get_value());
				});
			}
		};

		/**
		 *
		 * @param {PiepNode} font_size_dropdown
		 */
		const updateFontSizeDropdown = (font_size_dropdown) => {
			registerForms(); // let the options_wrapper appear

			const options_wrapper = font_size_dropdown._child(".options_wrapper");

			let font_size_options_html = options_wrapper._child(`[data-value=""]`).outerHTML;

			font_sizes.forEach((font_size) => {
				font_size_options_html += html`
					<p-option data-value="var(--${font_size.name})">
						<div style="font-size:var(--${font_size.name});">A</div>
					</p-option>
				`;
			});

			font_size_options_html += html`<p-option data-tooltip="Inny rozmiar" class="different_size" data-match=".*">
					<div class="input_icon">|</div>
				</p-option>
				<p-option class="edit_theme_btn" data-tooltip="Zarządzaj listą rozmiarów"> <i class="fas fa-cog"></i> </p-option>`;

			options_wrapper._set_content(font_size_options_html);

			registerForms();

			const different_size = options_wrapper._child(".different_size");
			different_size.addEventListener("click", () => {
				piep_cms.filter_blc_menu._set_value("appearance");
				const value_input = piep_cms.side_menu._child(".prop_font_size .value_input");
				value_input.click();
				value_input.focus();
				this.last_blc_menu_name = "side";
			});
		};

		const themeSettingsChanged = () => {
			updateFontSizeDropdown(this.float_menu._child(`[data-blc_prop="styles.fontSize"]`));
			updateFontSizeWrapper(this.side_menu._child(`.prop_font_size`));
		};
		window.addEventListener("theme_settings_changed", themeSettingsChanged);
		themeSettingsChanged();
	}

	initEditingColors() {
		/**
		 *
		 * @param {PiepNode} color_wrapper
		 */
		const updateColorWrapper = (color_wrapper) => {
			registerForms();

			const middle_input = color_wrapper._child("input");
			const radio_group = color_wrapper._child(".radio_group");
			const color_picker = color_wrapper._child("color-picker");

			let color_options_html = html`
				<div class="checkbox_area empty">
					<p-checkbox data-value=""></p-checkbox>
					<span>-</span>
				</div>
			`;
			colors_palette.forEach((color) => {
				color_options_html += html`
					<div class="checkbox_area">
						<p-checkbox data-value="var(--${color.name})"></p-checkbox>
						<div class="color_circle" style="background:var(--${color.name});"></div>
					</div>
				`;
			});

			radio_group._set_content(color_options_html);

			registerForms();

			if (!middle_input.classList.contains("wrrgstrd")) {
				middle_input.classList.add("wrrgstrd");
				middle_input.addEventListener("value_set", () => {
					/** @type {string} */
					const color = middle_input._get_value();
					let radio_value, picker_value;
					if (color.match(/#\w{3,}/)) {
						radio_value = false;
						picker_value = color;
					} else {
						radio_value = color;
						picker_value = "";
					}
					radio_group._set_value(radio_value, { quiet: true });
					color_picker._set_value(picker_value, { quiet: true });
				});
			}

			radio_group.addEventListener("change", () => {
				middle_input._set_value(radio_group._get_value());
			});
			color_picker.addEventListener("change", () => {
				middle_input._set_value(color_picker._get_value());
			});
		};

		/**
		 *
		 * @param {PiepNode} color_wrapper
		 */
		const updateColorDropdown = (color_wrapper) => {
			const color_dropdown = color_wrapper._child("p-dropdown");

			registerForms(); // let the options_wrapper appear

			const options_wrapper = color_dropdown._child(".options_wrapper");

			let color_options_html = options_wrapper._child(`[data-value=""]`).outerHTML;
			colors_palette.forEach((color) => {
				color_options_html += html`
					<p-option data-value="var(--${color.name})">
						<div class="color_circle" style="background:var(--${color.name});"></div>
					</p-option>
				`;
			});

			color_options_html += html`
				<p-option data-tooltip="Inny kolor" data-match="#\\w{3,}">
					<i class="fas fa-eye-dropper"></i> <color-picker class="alpha"></color-picker>
				</p-option>
				<p-option class="edit_theme_btn" data-tooltip="Zarządzaj paletą kolorów"> <i class="fas fa-cog"></i> </p-option>
			`;

			options_wrapper._set_content(color_options_html);

			registerForms();

			const color_picker = color_dropdown._child("color-picker");
			color_dropdown.addEventListener("value_set", () => {
				/** @type {string} */
				const color = color_dropdown._get_value();
				if (color.match(/#\w{3,}/)) {
					color_picker._set_value(color, { quiet: true });
				}
			});

			color_picker.addEventListener("change", () => {
				color_dropdown._set_value(color_picker._get_value());
			});

			color_picker.addEventListener("any_picker_hidden", () => {
				color_dropdown.click();
			});
		};

		const themeSettingsChanged = () => {
			updateColorDropdown(this.float_menu._child(`.prop_color`));
			//updateColorDropdown(this.float_menu._child(`.prop_background_color`));
			updateColorWrapper(this.side_menu._child(`.prop_color`));
			updateColorWrapper(this.side_menu._child(`.prop_background_color`));
		};
		window.addEventListener("theme_settings_changed", themeSettingsChanged);
		themeSettingsChanged();
	}

	initRightMenu() {
		this.add_block_btn = this.container._child(".add_block_btn");
		this.add_block_btn_wrapper = this.container._child(".add_block_btn_wrapper");

		document.addEventListener("click", (event) => {
			const target = $(event.target);
			const edit_theme_btn = target._parent(".edit_theme_btn");
			if (edit_theme_btn) {
				getThemeSettingsModal()._show({ source: edit_theme_btn });
			}
		});
	}

	initLayoutEdit() {
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

				const focus_node = this.getFocusNode();
				const focus_node_parent = focus_node._parent();
				const focus_node_rect = focus_node.getBoundingClientRect();
				const visible_width = focus_node_rect.width;
				const visible_parent_width = focus_node_parent.getBoundingClientRect().width;

				this.layout_control_grabbed_index = getNodeIndex(layout_control);
				layout_control.classList.add("grabbed");

				const care_about_resolutions = this.getResolutionsWeCareAbout();
				const v_node_styles = this.getVNodeById(this.focus_node_vid).styles;
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

				/** @type {Position} */
				this.layout_control_grabbed_pos = cloneObject(mouse.pos);
				this.layout_control_grabbed_scroll_top = this.content_scroll.scrollTop;

				ev.preventDefault();
			} else {
				if (!target._parent(this.side_menu)) {
					this.finishEditingLayout();
				}
			}
		});
	}

	initAddBlockMenu() {
		let menu_html = "";

		piep_cms_manager.blcs_schema.forEach((e, index) => {
			e.priority = def(e.priority, 0) - index * 0.001;
		});
		piep_cms_manager.blcs_schema.sort((a, b) => Math.sign(b.priority - a.priority));

		for (const blc_schema of piep_cms_manager.blcs_schema) {
			const tooltip = blc_schema.tooltip ? `data-tooltip="${blc_schema.tooltip}"` : "";
			menu_html += html`
				<div class="btn transparent block_to_add" data-id="${blc_schema.id}" ${tooltip}>${blc_schema.icon} ${blc_schema.label}</div>
			`;
		}

		// menu_html += html`
		// 	<div style="width:100%"></div>
		// 	<div class="btn transparent mt2"><i class="fas fa-ellipsis-h"></i> Więcej</div>
		// `;

		this.add_block_menu._set_content(menu_html);

		this.add_block_menu.addEventListener("click", (ev) => {
			const target = $(ev.target);

			const block_to_add_btn = target._parent(".block_to_add");
			if (block_to_add_btn) {
				setTimeout(() => {
					const blc_schema = piep_cms_manager.blcs_schema.find((e) => e.id === block_to_add_btn.dataset.id);
					const add_v_node = blc_schema.v_node;
					add_v_node.id = this.getNewBlcId();
					if (add_v_node.children) {
						add_v_node.children.forEach((child, index) => {
							child.id = add_v_node.id + 1 + index;
						});
					}
					this.v_dom.push(add_v_node); // hidden at the end ;) removed right when grab is triggered
					this.update({ all: true }); // creates the node to grab
					this.setFocusNode(add_v_node.id);
					this.grabBlock({ type: "insert" });
				});
			}
		});
	}

	initEditables() {
		this.container._children("[data-blc_prop]").forEach((input) => {
			const setProp = () => {
				const focus_node = this.getFocusNode();
				//console.log(input, focus_node);
				if (focus_node) {
					const v_node_data = this.getVNodeDataById(+focus_node.dataset.vid);
					let v_node = v_node_data.v_node;
					const anchor_offset = this.last_selection ? this.last_selection.anchorOffset : 0;
					const focus_offset = this.last_selection ? this.last_selection.focusOffset : 0;

					if (this.last_selection && this.last_selection.focusNode !== this.last_selection.anchorNode) {
						alert("Currently only single line editing is available");
						return;
					}

					const begin_offset = Math.min(anchor_offset, focus_offset);
					const end_offset = Math.max(anchor_offset, focus_offset);

					let prop_str = input.dataset.blc_prop;

					/** @type {number} */
					let select_vid;
					/** @type {vDomNode} */
					let set_prop_of_v_node;
					/** @type {vDomNodeData} */
					let set_prop_of_v_node_data;

					// the selection is something but not everything in the v_node
					if (anchor_offset !== focus_offset && v_node.text.length !== end_offset - begin_offset) {
						// since the first one is the greatest so the other two will be
						const bef_vid = this.getNewBlcId();
						const mid_vid = bef_vid + 1;
						const aft_vid = mid_vid + 1;

						/** @type {vDomNode} */
						const bef_child = {
							id: bef_vid,
							tag: "span",
							styles: {},
							text: v_node.text.substring(0, begin_offset),
							attrs: {},
							classes: [],
						};
						/** @type {vDomNode} */
						const mid_child = {
							id: mid_vid,
							tag: "span",
							styles: {},
							text: v_node.text.substring(begin_offset, end_offset),
							attrs: {},
							classes: [],
						};
						/** @type {vDomNode} */
						const aft_child = {
							id: aft_vid,
							tag: "span",
							styles: {},
							text: v_node.text.substring(end_offset),
							attrs: {},
							classes: [],
						};

						const put_v_nodes = [];
						if (begin_offset > 0) {
							put_v_nodes.push(bef_child);
						}
						put_v_nodes.push(mid_child);
						if (end_offset < v_node.text.length) {
							put_v_nodes.push(aft_child);
						}

						if (this.isTextContainer(v_node)) {
							// split inside
							v_node.children = put_v_nodes;
							v_node.text = undefined;
						} else {
							// do the split and spread options
							put_v_nodes.forEach((put_v_node) => {
								deepAssign(put_v_node.styles, v_node.styles);
								deepAssign(put_v_node.attrs, v_node.attrs);
								deepAssign(put_v_node.settings, v_node.settings);
							});
							v_node_data.v_nodes.splice(v_node_data.index, 1, ...put_v_nodes);
						}

						const min_v_node_data = this.getVNodeDataById(+mid_vid);

						set_prop_of_v_node_data = min_v_node_data;
						set_prop_of_v_node = set_prop_of_v_node_data.v_node;
						select_vid = mid_vid;
					} else {
						set_prop_of_v_node_data = v_node_data;
						set_prop_of_v_node = set_prop_of_v_node_data.v_node;
						select_vid = v_node.id;
					}

					/**
					 *
					 * @param {vDomNode} edit_v_node
					 */
					const setPropOfVNode = (edit_v_node) => {
						let val = input._get_value();
						let prop_ref = edit_v_node;

						if (prop_str.startsWith("styles.")) {
							if (prop_ref.styles[this.selected_resolution] === undefined) {
								prop_ref.styles[this.selected_resolution] = {};
							}
							prop_ref = prop_ref.styles[this.selected_resolution];
							prop_str = prop_str.substring("styles.".length);
						} else if (prop_str.startsWith("attrs.")) {
							if (!prop_ref.attrs) {
								prop_ref.attrs = {};
							}
							prop_ref = prop_ref.attrs;
							prop_str = prop_str.substring("attrs.".length);
						} else if (prop_str.startsWith("settings.")) {
							if (!prop_ref.settings) {
								prop_ref.settings = {};
							}
							prop_ref = prop_ref.settings;
							prop_str = prop_str.substring("settings.".length);
						}

						const bind_wrapper = input._parent(`[data-bind_wrapper]`);

						const bind_dirs = [];
						if (bind_wrapper) {
							const bind_dir = input.dataset.bind_dir;
							const bind_what = bind_wrapper.dataset.bind_wrapper;

							if (v_node.settings) {
								const bind_type = v_node.settings[`bind_${bind_what}`];

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
					};

					if (piep_cms_manager.text_block_props.includes(prop_str) && set_prop_of_v_node.tag.match(piep_cms_manager.match_inline_tag)) {
						const parent = set_prop_of_v_node_data.parent_v_nodes[0];
						if (parent && this.isTextContainer(parent)) {
							set_prop_of_v_node = parent;
						}
					}

					setPropOfVNode(set_prop_of_v_node);

					this.update({ all: true });

					this.last_selection = undefined;
					this.setFocusNode(select_vid);

					this.pushHistory(`set_blc_prop_${prop_str}`);
					this.displayNodeLayout();
				}
			};

			input.addEventListener("input", () => {
				setProp();
			});
			input.addEventListener("change", () => {
				setTimeout(setProp);
			});
		});
	}

	initPaste() {
		this.container.addEventListener("paste", (e) => {
			if (validPiepInput($(document.activeElement))) {
				// let people live
				return;
			}

			e.preventDefault();
			// "text/html" is cool but dont use it yet
			const text = e.clipboardData.getData("text/plain");
			// this text can contain html cool
			this.insertText(text);
		});
	}

	initClick() {
		document.addEventListener("mousedown", (ev) => {
			const target = $(ev.target);

			/** @type {"float" | "side" | ""} */
			this.last_blc_menu_name = target._parent(".blc_menu_scroll_panel") ? "side" : "float";

			this.just_clicked = true;
		});

		document.addEventListener("click", (ev) => {
			const target = $(ev.target);

			/** @type {insertBlc} */
			// @ts-ignore
			const insert_blc = mouse.target._parent(".insert_blc");

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
				for (let tries = 0; tries < 4; tries++) {
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
			} else if (this.grabbed_v_node) {
				this.releaseBlock();
			}

			const content_active = !!(target._parent(this.content) || target._parent(".v_node_label"));
			this.setContentActive(content_active);

			this.updateCursorPosition();

			const v_node_data = this.getVNodeDataById(this.focus_node_vid);
			const v_node = v_node_data ? v_node_data.v_node : undefined;

			if (target._parent(".move_btn")) {
				this.grabBlock({ type: "move" });
			}

			if (target._parent(".layout_btn")) {
				this.editLayout();
			}

			if (target._parent(".remove_format_btn")) {
				v_node.styles = {};
				this.update({ all: true });
				this.pushHistory(`remove_format_${v_node_data.v_node.id}`);
			}

			const choose_img_btn = target._parent(".choose_img_btn");
			if (choose_img_btn) {
				const input = this.side_menu._child(`[data-blc_prop="settings.img_src"]`);
				const select_file_modal = getSelectFileModal();
				select_file_modal._data.file_manager.select_target = input;
				select_file_modal._render();
				select_file_modal._show({ source: choose_img_btn });
			}

			if (target._parent(".remove_btn")) {
				v_node_data.v_nodes.splice(v_node_data.index, 1);
				this.update({ all: true });
				this.setFocusNode(undefined);

				this.pushHistory(`remove_blc_${v_node_data.v_node.id}`);
			}
		});
	}

	initKeyDown() {
		document.addEventListener("keyup", (ev) => {
			this.update({ selection: true }); // optimisation
		});

		document.addEventListener("keydown", (ev) => {
			const sel = window.getSelection();
			const focus_node = this.getFocusNode();
			const focus_offset = sel.focusOffset;
			const vid = focus_node ? +focus_node.dataset.vid : undefined;
			const v_node_data = this.getVNodeDataById(vid);
			const v_node = v_node_data ? v_node_data.v_node : undefined;

			//v_node.text === undefined
			if (!this.cursor_active) {
				return;
			}

			if (ev.key.length === 1 && sel) {
				if (!ev.ctrlKey) {
					ev.preventDefault();

					if (focus_node && focus_node.classList.contains("textable")) {
						this.insertText(ev.key);
						this.pushHistory("insert_text");
					}
				}
			}

			if (ev.key === "Backspace" && v_node_data) {
				ev.preventDefault();

				let chars_removed = this.removeTextSelection();

				if (chars_removed === 0) {
					const text = v_node.text;
					if (focus_offset <= 0) {
						const prev_index = v_node_data.index - 1;
						if (prev_index >= 0) {
							const prev_v_node = v_node_data.v_nodes[prev_index];

							if (prev_v_node.text !== undefined) {
								const prev_vid = prev_v_node.id;
								const prev_v_node_text_before = prev_v_node.text;
								prev_v_node.text = prev_v_node_text_before + v_node.text;
								v_node_data.v_nodes.splice(v_node_data.index, 1);
								this.update({ dom: true, styles: true });

								const prev_node_ref = this.getNode(prev_vid);
								if (prev_node_ref) {
									setSelectionByIndex(prev_node_ref, prev_v_node_text_before.length);
								}
							}
						}
					} else {
						v_node.text = text.substr(0, focus_offset - 1) + text.substr(focus_offset);
						this.recreateDom();

						const node = this.getNode(vid);
						if (node) {
							setSelectionByIndex(node, focus_offset - 1);
						}
					}
				}

				this.pushHistory("delete_text");
			}

			if (ev.key === "Delete" && v_node_data) {
				ev.preventDefault();

				let chars_removed = this.removeTextSelection();

				if (chars_removed === 0) {
					const text = v_node.text;
					if (focus_offset >= v_node.text.length) {
						const next_index = v_node_data.index + 1;
						if (next_index < v_node_data.v_nodes.length) {
							const next_v_node = v_node_data.v_nodes[next_index];

							if (next_v_node.text !== undefined) {
								const node_vid = v_node.id;
								const v_node_text_before = v_node.text;
								v_node.text = v_node_text_before + next_v_node.text;
								v_node_data.v_nodes.splice(next_index, 1);
								this.update({ dom: true, styles: true });

								const node_ref = this.getNode(node_vid);
								if (node_ref) {
									setSelectionByIndex(node_ref, v_node_text_before.length);
								}
							}
						}
					} else {
						v_node.text = text.substr(0, focus_offset) + text.substr(focus_offset + 1);
						this.update({ dom: true, styles: true });

						const node_ref = this.getNode(vid);
						if (node_ref) {
							setSelectionByIndex(node_ref, focus_offset);
						}
					}
				}

				this.pushHistory("delete_text");
			}

			if (ev.key === "ArrowLeft") {
				ev.preventDefault();

				if (focus_offset <= 0) {
					const prev_textable = this.getTextable(focus_node, -1);
					if (prev_textable) {
						setSelectionByIndex(prev_textable, prev_textable.textContent.length);
					}
				} else {
					setSelectionByIndex(focus_node, focus_offset - 1);
				}
			}
			if (ev.key === "ArrowRight") {
				ev.preventDefault();

				if (focus_offset >= v_node.text.length) {
					const next_textable = this.getTextable(focus_node, 1);
					if (next_textable) {
						setSelectionByIndex(next_textable, 0);
					} else {
						setSelectionByIndex(focus_node, focus_offset);
					}
				} else {
					setSelectionByIndex(focus_node, focus_offset + 1);
				}
			}

			if (ev.key === "ArrowUp") {
				this.selectElementContentsFromAnywhere(0, -1);
				ev.preventDefault();
			}

			if (ev.key === "ArrowDown") {
				this.selectElementContentsFromAnywhere(0, 1);
				ev.preventDefault();
			}

			if (ev.key === "Enter" && v_node_data) {
				ev.preventDefault();

				// maybe insert a new paragraph?
				const text = v_node.text;
				if (text !== undefined) {
					//v_node.text = text.substr(0, focus_offset);

					if (!this.isTextContainer(v_node_data.v_node)) {
						const parent_v_node = v_node_data.parent_v_nodes[0];
						if (this.isTextContainer(parent_v_node)) {
							const parent_v_node_data = this.getVNodeDataById(parent_v_node.id);
							const move_v_nodes_on_right_down = v_node_data.v_nodes.splice(
								v_node_data.index,
								v_node_data.v_nodes.length - v_node_data.index
							);

							// place it below the text container
							const new_vid = this.getNewBlcId();
							parent_v_node_data.v_nodes.splice(parent_v_node_data.index + 1, 0, {
								tag: "p",
								id: new_vid,
								styles: {},
								classes: [],
								attrs: {},
								children: move_v_nodes_on_right_down,
							});

							/** @type {vDomNode} */
							const new_old_v_node = cloneObject(v_node);
							new_old_v_node.id = new_vid + 1;

							// text split
							new_old_v_node.text = text.substr(0, focus_offset);
							v_node.text = text.substr(focus_offset);

							v_node_data.v_nodes.push(new_old_v_node);

							this.update({ all: true });

							const insert_first_node = this.getNode(v_node.id);
							if (insert_first_node) {
								setSelectionByIndex(insert_first_node, 0);
							}
						}
					}
				}

				this.pushHistory("insert_text");
			}
		});
	}

	initBlcMenu() {
		this.side_menu._set_content(html`
			<div class="filter_blc_menu radio_group hide_checks">
				<div class="checkbox_area">
					<div>
						<p-checkbox data-value="all"></p-checkbox>
						<i class="fas fa-th-large filter_icon"></i>
					</div>
					<span>Wszystko</span>
				</div>

				<div class="checkbox_area">
					<div>
						<p-checkbox data-value="appearance"></p-checkbox>
						<span> <i class="fas fa-palette filter_icon"></i></span>
					</div>
					<span>Wygląd</span>
				</div>

				<div class="checkbox_area">
					<div>
						<p-checkbox data-value="layout"></p-checkbox>
						<span> <i class="fas fa-ruler-combined filter_icon"></i> </span>
					</div>
					<span>Układ</span>
				</div>

				<div class="checkbox_area">
					<div>
						<p-checkbox data-value="advanced"></p-checkbox>
						<span> <i class="fas fa-cog filter_icon"></i></span>
					</div>
					<span>Więcej</span>
				</div>
			</div>

			<div class="pa1" style="border-bottom:1px solid #ccc">
				<div class="float_icon">
					<input class="field" placeholder="Filtruj opcje" />
					<i class="fas fa-search"></i>
				</div>
			</div>

			<div class="center flex align_center justify_center case_blc_menu_empty">Nie zaznaczono<br />bloku do edycji</div>

			<div class="scroll_panel scroll_shadow panel_padding blc_menu_scroll_panel">
				<!-- place for blc props etc. -->
			</div>

			<div class="pretty_radio semi_bold select_resolution mla mra">
				<div class="checkbox_area" data-tooltip="Komputer">
					<p-checkbox data-value="df"></p-checkbox>
					<span> <i class="fas fa-desktop"></i> </span>
				</div>
				<div class="checkbox_area" data-tooltip="Tablet poziomo">
					<p-checkbox data-value="bg"></p-checkbox>
					<span> <i class="fas fa-tablet-alt" style="transform:rotate(90deg) scale(0.9,1)"></i> </span>
				</div>
				<div class="checkbox_area" data-tooltip="Tablet pionowo">
					<p-checkbox data-value="md"></p-checkbox>
					<span> <i class="fas fa-tablet-alt" style="transform:scale(0.9,1)"></i> </span>
				</div>
				<div class="checkbox_area" data-tooltip="Telefon">
					<p-checkbox data-value="sm"></p-checkbox>
					<span> <i class="fas fa-mobile-alt"></i> </span>
				</div>
			</div>
		`);

		this.blc_menu_scroll_panel = this.side_menu._child(".blc_menu_scroll_panel");
		this.case_blc_menu_empty = this.side_menu._child(".case_blc_menu_empty");

		let blc_props_menu_html = "";
		piep_cms_manager.blc_props.forEach((blc_prop) => {
			blc_props_menu_html += html`<div class="prop_${blc_prop.name}">${blc_prop.menu_html}</div>`;
		});
		this.blc_menu_scroll_panel._set_content(blc_props_menu_html);

		registerForms();

		this.filter_blc_menu = this.side_menu._child(".filter_blc_menu");
		this.filter_blc_menu._set_value("all");
		this.filter_blc_menu.addEventListener("change", () => {
			if (this.filter_blc_menu._get_value() === "layout") {
				this.editLayout();
			} else {
				this.finishEditingLayout();
			}

			this.filterMenu({ scroll_to_top: true });
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
			}
		});
	}

	initInspector() {
		this.inspector = this.container._child(".piep_editor_inspector");
		this.inspector_tree = this.inspector._child(".tree");
		this.grab_inspector_btn = this.container._child(".grab_inspector_btn");

		/** @type {Position} */
		this.inspector_pos = { x: 1000000, y: 0 };

		const edit_theme_btn = this.container._child(".edit_theme_btn");
		edit_theme_btn.addEventListener("click", () => {
			getThemeSettingsModal()._show({ source: edit_theme_btn });
		});

		this.container._child(".show_inspector_btn").addEventListener("click", () => {
			this.toggleInspector();
		});
		this.container._child(".hide_inspector_btn").addEventListener("click", () => {
			this.toggleInspector(false);
		});
		this.grab_inspector_btn.addEventListener("mousedown", () => {
			if (!this.inspector_grabbed) {
				this.inspector_grabbed = true;
				this.inspector.classList.add("grabbed");
			}
		});

		this.toggleInspector(false);

		document.addEventListener("click", (ev) => {
			const target = $(ev.target);
			const v_node_label = target._parent(".v_node_label");

			if (v_node_label && !v_node_label.classList.contains("disabled")) {
				const vid = +v_node_label.dataset.vid;

				setSelectionRange(undefined);
				this.setCursorActive(false);
				this.setFocusNode(vid);

				scrollIntoView(this.getNode(vid));
			}
		});
	}

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
	 * @returns {string[]}
	 */
	getResolutionsWeCareAbout() {
		/** @type {string[]} */
		const care_about_resolutions = [];
		for (const [key, width] of Object.entries(responsive_breakpoints).sort((a, b) => {
			const comp_a = a[1] ? a[1] : 10000;
			const comp_b = b[1] ? b[1] : 10000;
			return Math.sign(comp_b - comp_a);
		})) {
			care_about_resolutions.push(key);
			if (key === this.selected_resolution) {
				break;
			}
		}

		return care_about_resolutions;
	}

	recalculateFromSettings() {
		/**
		 * @param {vDomNode[]} v_nodes
		 */
		const traverseVDom = (v_nodes) => {
			for (const v_node of v_nodes) {
				if (!v_node.settings) {
					v_node.settings = {};
				}

				if (!v_node.settings.bind_margins) {
					v_node.settings.bind_margins = "none";
				}
				if (!v_node.settings.bind_paddings) {
					v_node.settings.bind_paddings = "opposite";
				}
				if (!v_node.settings.bind_borderWidths) {
					v_node.settings.bind_borderWidths = "all";
				}
				if (!v_node.settings.bind_borderColors) {
					v_node.settings.bind_borderColors = "all";
				}

				const children = v_node.children;
				if (children) {
					traverseVDom(children);
				}
			}
		};

		traverseVDom(this.v_dom);
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
	update(options = {}) {
		this.content.style.minHeight = this.content.offsetHeight + "px";

		if (options.all || options.selection) {
			this.displayInspectorTree();
		}
		if (options.all || options.styles) {
			this.recalculateStyles();
		}
		if (options.all || options.dom) {
			this.recreateDom();
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
			const v_node_data = this.getVNodeDataById(this.focus_node_vid);

			if (v_node_data) {
				selection_breadcrumbs_html =
					html`<i class="fas fa-home"></i> ` +
					[v_node_data.v_node, ...v_node_data.parent_v_nodes]
						.reverse()
						.map((parent_v_node) => {
							const disabled = parent_v_node.disabled ? "disabled" : "";
							const tooltip = disabled ? `data-tooltip="Część szablonu"` : "";

							return html`<span class="v_node_label ${disabled}" data-vid="${parent_v_node.id}" ${tooltip}>
								<i class="fas fa-chevron-right"></i>
								<span>${this.getVNodeDisplayName(parent_v_node)}</span>
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
		const tag = v_node.tag;
		const blc_schema = piep_cms_manager.blcs_schema.find((b) => b.id === v_node.module_name);

		const map_tag_display_name = {
			a: "Link",
			h1: "Nagłówek H1",
			h2: "Nagłówek H2",
			h3: "Nagłówek H3",
			h4: "Nagłówek H4",
			h5: "Nagłówek H5",
			h6: "Nagłówek H6",
			div: "Kontener",
			p: "Paragraf",
			span: "Tekst",
		};
		let display_name = "";
		if (v_node.settings && v_node.settings.template_hook_name) {
			display_name = v_node.settings.template_hook_name;
		} else if (v_node.module_name) {
			if (blc_schema) {
				display_name = blc_schema.label;
			}
		} else if (map_tag_display_name[tag]) {
			display_name = map_tag_display_name[tag];
		}

		if (v_node.settings && v_node.settings.link) {
			display_name += html` <i class="fas fa-link"></i>`;
		}

		return display_name;
	}

	displayInspectorTree() {
		/**
		 * @param {vDomNode[]} v_nodes
		 */
		const traverseVDom = (v_nodes, level = 0) => {
			let inspector_tree_html = "";

			for (const v_node of v_nodes) {
				const text = v_node.text;
				const children = v_node.children;

				const display_name = this.getVNodeDisplayName(v_node);

				let info = "";

				if (text !== undefined) {
					info = text ? escapeHTML(text) : "(pusty)";
				} else if (children !== undefined) {
					info = `(${children.length})`;
				}
				if (info) {
					info = html`<span class="info"> - ${info}</span>`;
				}
				const disabled = v_node.disabled ? "disabled" : "";
				const tooltip = disabled ? `data-tooltip="Część szablonu"` : "";
				inspector_tree_html += html`
					<div class="v_node_label tblc_${v_node.id} ${disabled}" style="--level:${level}" data-vid="${v_node.id}" ${tooltip}>
						<span class="name">${display_name}</span>
						${info}
					</div>
				`;

				if (children) {
					const { inspector_tree_html: sub_inspector_tree_html } = traverseVDom(children, level + 1);
					inspector_tree_html += sub_inspector_tree_html;
				}
			}

			return { inspector_tree_html };
		};

		let { inspector_tree_html } = traverseVDom(this.v_dom);

		if (!inspector_tree_html) {
			inspector_tree_html = html`<div class="pa2 center">Brak elementów</div>`;
		}
		this.inspector_tree._set_content(inspector_tree_html, { maintain_height: true });
	}

	recalculateStyles() {
		// order doesn't really matter so far
		let styles_css = "";

		const care_about_resolutions = this.getResolutionsWeCareAbout();

		/**
		 * @param {vDomNode[]} v_nodes
		 */
		const traverseVDom = (v_nodes) => {
			for (const v_node of v_nodes) {
				if (v_node.styles) {
					let node_styles = "";
					for (const res_name of care_about_resolutions) {
						const res_styles = v_node.styles[res_name];
						if (!res_styles) {
							continue;
						}
						const styles = Object.entries(res_styles);
						if (styles.length === 0) {
							continue;
						}
						styles.forEach(([prop, val]) => {
							node_styles += `${kebabCase(prop)}: ${val};`;
						});
					}
					if (node_styles) {
						// #p is stroner than just a class
						node_styles = `#p ${this.getNodeSelector(v_node.id)} { ${node_styles} }`;
						styles_css += node_styles;
					}
				}

				const children = v_node.children;
				if (children) {
					traverseVDom(children);
				}
			}
		};

		traverseVDom(this.v_dom);
		if (this.grabbed_v_node) {
			traverseVDom([this.grabbed_v_node]);
		}

		this.styles._set_content(styles_css);
	}

	/**
	 *
	 * @param {{
	 * vids?: number[]
	 * }} options
	 *
	 * options just for optimisation but seems unnecessary
	 */
	recreateDom(options = {}) {
		this.recalculateFromSettings();

		/** @type {number[]} */
		let included_vids = [];

		/**
		 *
		 * @param {PiepNode} put_in_node
		 * @param {vDomNode[]} v_nodes
		 */
		const traverseVDom = (put_in_node, v_nodes, level = 0) => {
			v_nodes.forEach((v_node, index) => {
				const vid = v_node.id;
				included_vids.push(vid);
				const blc_schema = piep_cms_manager.blcs_schema.find((b) => b.id === v_node.module_name);

				let node = this.getNode(vid);

				if (node && node.tagName.toLocaleLowerCase() !== v_node.tag.toLocaleLowerCase()) {
					node.remove();
					node = undefined;
					//console.log("removed node");
				}

				if (!node) {
					node = $(document.createElement(v_node.tag));
					//console.log("new", node);
				}

				const before_node = put_in_node._direct_children()[index];
				if (node._parent() !== put_in_node || node !== before_node) {
					put_in_node.insertBefore(node, before_node);
					//console.log("insertBefore", node, before_node);
				}

				// classes
				if (v_node.module_name) {
					const module_class = `module_${v_node.module_name}`;
					if (!v_node.classes.includes(module_class)) {
						v_node.classes.push(module_class);
					}
				}

				const base_class = this.getNodeSelector(v_node.id).replace(".", "");
				let classes = ["blc", base_class, ...v_node.classes]; // important that a ref was lost

				const text = v_node.text;
				if (text !== undefined) {
					node._set_content(text === "" ? "<br>" : text);
					classes.push("textable");
					//console.log("textable", node, text);
				}
				if (this.isTextContainer(v_node)) {
					classes.push("text_container");
				}

				if (v_node.module_name) {
					classes.push("any_module");
				}
				if (blc_schema) {
					if (blc_schema.nonclickable) {
						classes.push("nonclickable");
					}
				}
				if (v_node.disabled) {
					classes.push("editor_disabled");
				}
				classes.forEach((c) => {
					node.classList.add(c);
				});
				node.classList.forEach((c) => {
					if (!classes.includes(c)) {
						node.classList.remove(c);
					}
				});

				// attrs
				const attrs = { "data-vid": v_node.id + "" };
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
					if (!attr_names.includes(attr.name)) {
						node.removeAttribute(attr.name);
					}
				}

				if (blc_schema && blc_schema.render && blc_schema.rerender_on) {
					let render_props = {};
					blc_schema.rerender_on.forEach((prop_str) => {
						if (prop_str.startsWith("settings.")) {
							render_props[prop_str] = v_node.settings[prop_str.substring("settings.".length)];
						}
					});

					if (!isEquivalent(this.last_map_vid_render_props[vid], render_props)) {
						this.last_map_vid_render_props[vid] = render_props;
						const html = blc_schema.render(v_node);
						if (html === undefined) {
							// TODO: call a manager to
						} else {
							node._set_content(html);
						}
					}
				}

				const children = v_node.children;
				if (children) {
					// clean up text nodes if any existed
					node.childNodes.forEach((c) => {
						if (c.nodeType === Node.TEXT_NODE) {
							c.remove();
						}
					});

					traverseVDom(node, children, level + 1);
				}
			});
		};

		traverseVDom(this.content, this.v_dom);

		const select_bls_to_remove = ".blc" + included_vids.map((e) => `:not(.blc_${e})`).join("");
		this.content._children(select_bls_to_remove).forEach((r) => {
			//console.log("REMOVE", r);
			r.remove();
		});
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
	 * @param {-1 | 1} direction
	 * @returns {PiepNode | undefined}
	 */
	getTextable(node, direction) {
		let next_node;
		let parent = node;
		while (parent) {
			const next = direction === 1 ? parent._next() : parent._prev();
			if (next) {
				next_node = next;
				break;
			} else {
				parent = parent._parent();
			}
		}
		if (next_node && this.content.contains(next_node)) {
			if (direction === 1) {
				return def(next_node._children("*")[0], next_node);
			} else {
				return def(getLast(next_node._children("*")), next_node);
			}
		}
		return undefined;
	}

	removeTextSelection() {
		const sel = window.getSelection();
		const focus_offset = sel.focusOffset;
		const anchor_offset = sel.anchorOffset;
		const focus_node = this.getFocusNode();
		if (!focus_node) {
			return 0;
		}
		const vid = +focus_node.dataset.vid;
		const v_node = this.getVNodeById(vid);
		if (!v_node) {
			return 0;
		}

		const text = v_node.text;
		if (text === undefined) {
			return 0;
		}

		let begin_offset = focus_offset;
		let end_offset = focus_offset;
		let chars_removed = 0;
		if (anchor_offset === focus_offset) {
			return 0;
		}

		begin_offset = Math.min(anchor_offset, focus_offset);
		end_offset = Math.max(anchor_offset, focus_offset);
		chars_removed = end_offset - begin_offset;
		v_node.text = text.substr(0, begin_offset) + text.substr(end_offset);

		this.update({ dom: true, selection: true });

		const node_ref = this.getNode(vid);
		if (node_ref) {
			setSelectionByIndex(node_ref, begin_offset);
		}

		return chars_removed;
	}

	/**
	 *
	 * @param {string} insert_text
	 * @returns
	 */
	insertText(insert_text) {
		this.removeTextSelection();

		const sel = window.getSelection();
		const focus_offset = sel.focusOffset;
		const focus_node = this.getFocusNode();
		const vid = focus_node ? +focus_node.dataset.vid : 0;
		const v_node = this.getVNodeById(vid);

		if (!v_node) {
			return;
		}

		const text = v_node.text;
		if (text === undefined) {
			return;
		}

		v_node.text = text.substr(0, focus_offset) + insert_text + text.substr(focus_offset);

		//this.update({ dom: true });
		this.recreateDom(); // optimisation

		const node_ref = this.getNode(vid);
		if (node_ref) {
			setSelectionByIndex(node_ref, focus_offset + insert_text.length);
		}
	}

	grabbedBlock() {
		if (!mouse.target) {
			return;
		}

		let left = mouse.pos.x - this.grabbed_block_wrapper_rect.width * 0.5;
		let top = mouse.pos.y - this.grabbed_block_wrapper_rect.height * 0.5;

		this.grabbed_block_wrapper._set_absolute_pos(left, top);

		/** @type {insertBlc} */
		// @ts-ignore
		const insert_blc = mouse.target._parent(".insert_blc");

		if (this.showing_float_multi_of_blc) {
			const float_multi_insert_bckg_rect = this.float_multi_insert_bckg.getBoundingClientRect();
			const radius = float_multi_insert_bckg_rect.width * 0.5;
			const dx = float_multi_insert_bckg_rect.left + float_multi_insert_bckg_rect.width * 0.5 - mouse.pos.x;
			const dy = float_multi_insert_bckg_rect.top + float_multi_insert_bckg_rect.height * 0.5 - mouse.pos.y;
			const inside = dx * dx + dy * dy < radius * radius;

			if (!inside) {
				this.showing_float_multi_of_blc.classList.remove("hidden");
				this.float_multi_insert_bckg.classList.add("hidden");

				this.showing_float_multi_of_blc._popup_blcs.forEach((popup_blc) => {
					popup_blc.classList.remove("over");
					popup_blc.classList.add("hidden");
				});
				this.showing_float_multi_of_blc = undefined;
			}
		}

		if (this.current_insert_blc !== insert_blc) {
			this.current_insert_blc = insert_blc;

			/** @type {PiepNode} */
			let pretty_focus_parent;

			this.v_dom.splice(0, this.v_dom.length);
			deepAssign(this.v_dom, this.after_grab_v_dom);

			if (insert_blc && insert_blc._insert_action) {
				insert_blc._insert_action();
				this.update({ dom: true, styles: true });

				const v_node_data = this.getVNodeDataById(this.grabbed_block_vid);
				if (v_node_data.parent_v_nodes[0]) {
					const parent_vid = v_node_data.parent_v_nodes[0].id;
					pretty_focus_parent = this.getNode(parent_vid);
				}
			} else {
				this.update({ dom: true, styles: true });
				this.float_focuses._empty();
			}

			this.parent_float_focus.classList.toggle("hidden", !pretty_focus_parent);
			if (pretty_focus_parent) {
				const focus_parent_node_rect = pretty_focus_parent.getBoundingClientRect();

				this.parent_float_focus._set_absolute_pos(focus_parent_node_rect.left - 1, focus_parent_node_rect.top - 1);

				this.parent_float_focus.style.width = focus_parent_node_rect.width + 2 + "px";
				this.parent_float_focus.style.height = focus_parent_node_rect.height + 2 + "px";
			}
		}

		this.has_insert_pos = !!(this.current_insert_blc && !this.current_insert_blc.classList.contains("multiple"));
		this.grabbed_block_wrapper.classList.toggle("visible", !this.has_insert_pos);
		this.container.classList.toggle("has_insert_pos", this.has_insert_pos);
	}

	notGrabbedBlock() {
		// not grabbed
		/** @type {ShowFocusToNodeData[]} */
		const show_vids = [];

		let show_float_menu = false;
		if (this.focus_node_vid !== undefined) {
			show_float_menu = true;
			show_vids.push({ vid: this.focus_node_vid, opacity: 1 });
		}

		if (!this.layout_control_prop) {
			const blc = mouse.target ? mouse.target._parent(".piep_editor_content .blc:not(.editor_disabled)") : undefined;
			const v_node_label = mouse.target ? mouse.target._parent(".v_node_label") : undefined;

			if (blc) {
				const blc_vid = +blc.dataset.vid;
				if (blc_vid) {
					show_vids.push({ vid: blc_vid, opacity: 1 });

					const v_node_data = this.getVNodeDataById(blc_vid);

					if (v_node_data && v_node_data.parent_v_nodes.length > 0) {
						show_vids.push(...v_node_data.parent_v_nodes.map((p, index) => ({ vid: p.id, opacity: Math.pow(0.5, index + 1) })));
					}
				}
			}

			if (v_node_label) {
				show_float_menu = false;
				const label_vid = +v_node_label.dataset.vid;
				if (label_vid !== this.focus_node_vid) {
					show_vids.push({ vid: label_vid, opacity: 0.5 });
				}

				any_picker.hide();
				this.float_menu._children("p-dropdown.dropped").forEach((d) => {
					d.click();
				});
			}
		}

		this.showFocusToNodes(show_vids);

		this.float_menu.classList.toggle("hidden", !show_float_menu);
		if (show_float_menu) {
			this.showFloatMenuToNode(this.focus_node_vid);
		}
	}

	addBtnMove() {
		let show_add_block_menu = false;

		if (mouse.target) {
			if (!this.grabbed_v_node) {
				show_add_block_menu = !!(mouse.target._parent(this.add_block_btn_wrapper) || mouse.target._parent(this.add_block_menu));
			}
		}
		if (show_add_block_menu) {
			if (!this.add_block_menu.classList.contains("visible")) {
				this.add_block_menu.classList.add("visible");
				this.add_block_menu._set_absolute_pos(0, 0);

				const add_block_btn_rect = this.add_block_btn.getBoundingClientRect();
				const add_block_menu_rect = this.add_block_menu.getBoundingClientRect();

				const left = add_block_btn_rect.left - add_block_menu_rect.width;
				const top = add_block_btn_rect.top;

				this.add_block_menu._set_absolute_pos(left, top);
			}
		} else {
			this.add_block_menu.classList.remove("visible");
		}

		this.add_block_btn.style.setProperty("--btn-background-clr", show_add_block_menu ? "#eee" : "");
	}

	layoutEditMove() {
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
		}

		if (this.layout_control_prop) {
			const dx = mouse.pos.x - this.layout_control_grabbed_pos.x;
			const dy = mouse.pos.y - this.layout_control_grabbed_pos.y + this.content_scroll.scrollTop - this.layout_control_grabbed_scroll_top;
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

				if (ALT_DOWN) {
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
				}
				set_val_pretty = floor(set_val, 4) + "%";
			} else {
				let set_val = this.layout_control_base_value + dist;
				set_val = Math.max(min_pixels, set_val);

				if (ALT_DOWN) {
					set_val = round(set_val, -1);
				}
				set_val_pretty = floor(set_val) + "px";
			}

			const prop_input = this.side_menu._child(`[data-blc_prop="styles.${this.layout_control_prop}"]`);
			const change = set_val_pretty !== prop_input._get_value();
			scrollIntoView(prop_input);
			prop_input.classList.add("editing_now");

			if (change) {
				prop_input._set_value(set_val_pretty);
				this.displayNodeLayout();
			}
		}
	}

	inspectorMove() {
		if (this.inspector_grabbed && !mouse.down) {
			this.inspector_grabbed = false;
			this.inspector.classList.remove("grabbed");
		}

		const safe_off = 5;

		//const inspector_rect = this.inspector.getBoundingClientRect();
		const content_wrapper_rect = this.content_wrapper.getBoundingClientRect();

		const inspector_width = this.inspector.offsetWidth;
		const inspector_height = this.inspector.offsetHeight;
		const inspector_grab_btn_offset = 47;

		const max_x = content_wrapper_rect.left + content_wrapper_rect.width - inspector_width - safe_off;

		if (this.inspector_grabbed) {
			const left = mouse.pos.x + inspector_grab_btn_offset - inspector_width;
			const top = mouse.pos.y - 20;

			this.inspector_pos.x = this.inspector_pos.x * 0.5 + left * 0.5;
			this.inspector_pos.y = this.inspector_pos.y * 0.5 + top * 0.5;
		} else {
			if (this.inspector_sticks_to_right_size) {
				this.inspector_pos.x = max_x;
			}
		}

		this.inspector_pos.x = clamp(safe_off, this.inspector_pos.x, max_x);
		this.inspector_pos.y = clamp(
			content_wrapper_rect.top + safe_off,
			this.inspector_pos.y,
			content_wrapper_rect.top + content_wrapper_rect.height - inspector_height - safe_off
		);

		this.inspector_sticks_to_right_size = this.inspector_pos.x > max_x - 1;

		this.inspector.style.setProperty("--x", this.inspector_pos.x.toPrecision(5) + "px");
		this.inspector.style.setProperty("--y", this.inspector_pos.y.toPrecision(5) + "px");
	}

	mainLoop() {
		updateMouseTarget();
		this.updateCursorPosition();

		if (this.grabbed_v_node) {
			this.grabbedBlock();
		} else {
			this.notGrabbedBlock();
		}

		this.inspectorMove();

		this.layoutEditMove();

		this.addBtnMove();

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

	editLayout() {
		this.editing_layout = true;

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

		const focus_node = this.getFocusNode();
		const focus_node_rect = focus_node.getBoundingClientRect();

		const focus_node_style = window.getComputedStyle(focus_node);

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
			let left = focus_node_rect.left;
			let top = focus_node_rect.top;
			let width = focus_node_rect.width;
			let height = Math.abs(mr_top);
			let background = mr_top > 0 ? orange : orange;
			if (mr_top > 0) {
				top -= height;
			}
			display_margin(left, top, width, height, background);
		}
		{
			// bottom
			let left = focus_node_rect.left;
			let top = focus_node_rect.top + focus_node_rect.height;
			let width = focus_node_rect.width;
			let height = Math.abs(mr_bottom);
			let background = mr_bottom > 0 ? orange : orange;
			if (mr_bottom < 0) {
				top -= height;
			}
			display_margin(left, top, width, height, background);
		}
		{
			// left
			let left = focus_node_rect.left;
			let top = focus_node_rect.top;
			let width = Math.abs(mr_left);
			let height = focus_node_rect.height;
			let background = mr_top > 0 ? orange : orange;
			if (mr_left > 0) {
				left -= width;
			}
			display_margin(left, top, width, height, background);
		}
		{
			// right
			let left = focus_node_rect.left + focus_node_rect.width;
			let top = focus_node_rect.top;
			let width = Math.abs(mr_right);
			let height = focus_node_rect.height;
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
			let left = focus_node_rect.left + bw_left;
			let top = focus_node_rect.top + bw_top;
			let width = focus_node_rect.width - bw_left - bw_right;
			let height = Math.abs(pd_top);
			display_padding(left, top, width, height);
		}
		{
			// bottom
			let left = focus_node_rect.left + bw_left;
			let top = focus_node_rect.top + focus_node_rect.height - bw_bottom;
			let width = focus_node_rect.width - bw_left - bw_right;
			let height = Math.abs(pd_bottom);
			top -= height;
			display_padding(left, top, width, height);
		}
		{
			// left
			let left = focus_node_rect.left + bw_left;
			let top = focus_node_rect.top + bw_top;
			let width = Math.abs(pd_left);
			let height = focus_node_rect.height - bw_top - bw_bottom;
			display_padding(left, top, width, height);
		}
		{
			// right
			let left = focus_node_rect.left + focus_node_rect.width - bw_right;
			let top = focus_node_rect.top + bw_top;
			let width = Math.abs(pd_right);
			let height = focus_node_rect.height - bw_top - bw_bottom;
			left -= width;
			display_padding(left, top, width, height);
		}

		const layout_control_width = 15;

		// just controls
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
			layout_html += html`<div
				class="layout_control ${gener_prop}_control"
				data-layout_prop="${spec_prop}"
				data-layout_dir="${dir}"
				style="left:${left}px;top:${top + this.content_scroll.scrollTop}px;"
				data-tooltip="${tooltip}"
			></div>`;
		};
		{
			// left bottom
			let left = focus_node_rect.left;
			let top = focus_node_rect.top + focus_node_rect.height - layout_control_width;
			display_layout_control(left, top, "width", "width", "left", "Dostosuj szerokość");
		}
		{
			// right bottom
			let left = focus_node_rect.left + focus_node_rect.width - layout_control_width;
			let top = focus_node_rect.top + focus_node_rect.height - layout_control_width;
			display_layout_control(left, top, "width", "width", "right", "Dostosuj szerokość");
		}
		{
			// left top
			let left = focus_node_rect.left;
			let top = focus_node_rect.top;
			display_layout_control(left, top, "width", "width", "left", "Dostosuj szerokość");
		}
		{
			// right top
			let left = focus_node_rect.left + focus_node_rect.width - layout_control_width;
			let top = focus_node_rect.top;
			display_layout_control(left, top, "width", "width", "right", "Dostosuj szerokość");
		}

		{
			// top
			let left = focus_node_rect.left + focus_node_rect.width * 0.5 - layout_control_width * 0.5;
			let top = focus_node_rect.top;
			display_layout_control(left, top - layout_control_width, "margin", "marginTop", "top", "Margines zewnętrzny górny");
			display_layout_control(left, top, "borderWidth", "borderTopWidth", "top", "Grubość górnej krawędzi");
			display_layout_control(left, top + layout_control_width, "padding", "paddingTop", "top", "Margines wewnętrzny górny");
		}
		{
			// bottom
			let left = focus_node_rect.left + focus_node_rect.width * 0.5 - layout_control_width * 0.5;
			let top = focus_node_rect.top + focus_node_rect.height - layout_control_width;
			display_layout_control(left, top + layout_control_width, "margin", "marginBottom", "bottom", "Margines zewnętrzny dolny");
			display_layout_control(left, top, "borderWidth", "borderBottomWidth", "bottom", "Grubość dolnej krawędzi");
			display_layout_control(left, top - layout_control_width, "padding", "paddingBottom", "bottom", "Margines wewnętrzny dolny");
		}
		{
			// left
			let left = focus_node_rect.left;
			let top = focus_node_rect.top + focus_node_rect.height * 0.5 - layout_control_width * 0.5;
			display_layout_control(left - layout_control_width, top, "margin", "marginLeft", "left", "Margines zewnętrzny lewy");
			display_layout_control(left, top, "borderWidth", "borderLeftWidth", "left", "Grubość lewej krawędzi");
			display_layout_control(left + layout_control_width, top, "padding", "paddingLeft", "left", "Margines wewnętrzny lewy");
		}
		{
			// right
			let left = focus_node_rect.left + focus_node_rect.width - layout_control_width;
			let top = focus_node_rect.top + focus_node_rect.height * 0.5 - layout_control_width * 0.5;
			display_layout_control(left + layout_control_width, top, "margin", "marginRight", "right", "Margines zewnętrzny prawy");
			display_layout_control(left, top, "borderWidth", "borderRightWidth", "right", "Grubość prawej krawędzi");
			display_layout_control(left - layout_control_width, top, "padding", "paddingRight", "right", "Margines wewnętrzny prawy");
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
	}

	/**
	 *
	 * @param {GrabBlockOptions} options
	 */
	grabBlock(options) {
		this.grab_block_options = options;
		this.grabbed_block_vid = this.focus_node_vid;

		this.container.classList.add("grabbed_block");
		this.container.classList.add("disable_editing");
		// TODO: think if necessary ugh
		this.current_insert_blc = 123456789; // will warm up everything on grab

		const focus_node = this.getFocusNode();
		this.grabbed_block_wrapper._set_content(focus_node.outerHTML);
		removeClasses(".wo997_img_shown", ["wo997_img_shown"], this.grabbed_block_wrapper);
		removeClasses(".wo997_img_waiting", ["wo997_img_waiting"], this.grabbed_block_wrapper);
		lazyLoadImages({ duration: 0 });
		this.grabbed_block_wrapper.classList.add("visible");

		// won't grow by more than this.grabbed_block_wrapper.offsetHeight
		this.content.style.minHeight = this.content.scrollHeight + this.grabbed_block_wrapper.offsetHeight + "px";

		// be as wide as necessary
		this.grabbed_block_wrapper.style.left = "0";
		this.grabbed_block_wrapper.style.width = "";

		let ok_width;
		if (this.grabbed_block_wrapper.offsetWidth > 500) {
			// wrap
			ok_width = Math.sqrt(2 * this.grabbed_block_wrapper.offsetWidth * this.grabbed_block_wrapper.offsetHeight);
			// let pretty_width = Math.sqrt(2 * this.grabbed_block_wrapper.offsetWidth * this.grabbed_block_wrapper.offsetHeight);
			// ok_width = Math.min(800, pretty_width);
		} else {
			ok_width = this.grabbed_block_wrapper.offsetWidth;
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
	}

	/**
	 *
	 * @param {vDomNode} v_node
	 */
	isTextContainer(v_node) {
		return ["h1", "h2", "h3", "h4", "h5", "h6", "p"].includes(v_node.tag);
	}

	getParentTextContainerId(vid) {
		const v_node_data = this.getVNodeDataById(vid);
		const v_node = v_node_data.v_node;
		if (this.isTextContainer(v_node)) {
			return v_node.id;
		}
		const parent_v_node = v_node_data.parent_v_nodes[0];
		if (parent_v_node) {
			if (this.isTextContainer(parent_v_node)) {
				return parent_v_node.id;
			}
		}
		return undefined;
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
			} else if (parent_v_node.classes.includes("columns_container")) {
				return "row";
			}
		}
		return "column";
	};

	displayInsertPositions() {
		/**
		 *
		 * @returns {insertBlc}
		 */
		const getInsertBlc = () => {
			const insert_blc = document.createElement("DIV");
			insert_blc.classList.add("insert_blc");
			this.alternative_scroll_panel.append(insert_blc);

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
			const off_x = blc_rect.width > 50 ? off : 0;
			const off_y = blc_rect.height > 50 ? off : 0;

			switch (pos) {
				case "left":
					left = blc_rect.left + off_x;
					top = blc_rect.top + blc_rect.height * 0.5;
					break;
				case "right":
					left = blc_rect.left + blc_rect.width - off_x;
					top = blc_rect.top + blc_rect.height * 0.5;
					break;
				case "top":
					left = blc_rect.left + blc_rect.width * 0.5;
					top = blc_rect.top + off_y;
					break;
				case "bottom":
					left = blc_rect.left + blc_rect.width * 0.5;
					top = blc_rect.top + blc_rect.height - off_y;
					break;
				case "center":
					left = blc_rect.left + blc_rect.width * 0.5;
					top = blc_rect.top + blc_rect.height * 0.5;
					break;
			}

			top += this.content_scroll.scrollTop;

			return { left, top };
		};

		const blcs = this.content._children(".blc");

		if (blcs.length === 0) {
			// left
			const insert_blc = getInsertBlc();
			const content_wrapper_rect = this.content_wrapper.getBoundingClientRect();
			insert_blc._set_absolute_pos(content_wrapper_rect.left + content_wrapper_rect.width * 0.5, content_wrapper_rect.top + 30);
			insert_blc._insert_action = () => {
				/** @type {vDomNode} */
				const grabbed_node_copy = cloneObject(this.grabbed_v_node);
				this.v_dom.push(grabbed_node_copy);
			};
		}

		blcs.forEach((blc) => {
			if (blc._parent(this.getNodeSelector(this.grabbed_block_vid))) {
				// just no baby
				return;
			}

			const getGrabbedVNodeData = () => {
				const grabbed_v_node_data = this.getVNodeDataById(this.grabbed_block_vid);
				return grabbed_v_node_data;
			};
			const getNearVNodeData = () => {
				const near_v_node_data = this.getVNodeDataById(blc_vid);
				return near_v_node_data;
			};

			const blc_vid = +blc.dataset.vid;

			/**
			 *
			 * @param {-1 | 1} dir
			 */
			const insertAboveOrBelow = (dir) => {
				const near_v_node_data = this.getVNodeDataById(blc_vid);

				let ind = near_v_node_data.index;
				if (dir === 1) {
					ind++;
				}

				/** @type {vDomNode} */
				const grabbed_node_copy = cloneObject(this.grabbed_v_node);
				near_v_node_data.v_nodes.splice(ind, 0, grabbed_node_copy);
			};

			/**
			 *
			 * @param {-1 | 1} dir
			 */
			const insertOnSides = (dir) => {
				if (flow_direction === "inline") {
					return insertAboveOrBelow(dir);
				}

				const near_v_node_data = getNearVNodeData();
				const near_v_node = near_v_node_data.v_node;

				let ind = near_v_node_data.index;

				/** @type {vDomNode} */
				const grabbed_node_copy = cloneObject(this.grabbed_v_node);
				let suggest_wrapping_with_columns_module = false;

				if (flow_direction === "column") {
					suggest_wrapping_with_columns_module = true;
				}

				const new_vid = this.getNewBlcId();

				let insert_v_node = grabbed_node_copy;

				if (suggest_wrapping_with_columns_module && !grabbed_node_copy.classes.includes("vertical_container")) {
					insert_v_node = {
						id: new_vid,
						tag: "div",
						styles: { df: {} },
						attrs: {},
						classes: ["vertical_container"],
						children: [grabbed_node_copy],
					};
				}

				if (suggest_wrapping_with_columns_module) {
					const near_column = {
						id: new_vid + 1,
						tag: "div",
						styles: { df: { width: "50%" } },
						attrs: {},
						classes: ["vertical_container"],
						children: [near_v_node],
					};

					/** @type {vDomNode[]} */
					const just_columns = [near_column];

					insert_v_node.styles.df.width = "50%";

					if (dir === 1) {
						just_columns.push(insert_v_node);
					} else {
						just_columns.unshift(insert_v_node);
					}

					/** @type {vDomNode} */
					const columns_container = {
						tag: "div",
						attrs: {},
						children: just_columns,
						classes: ["columns_container"],
						id: new_vid + 2,
						styles: {},
						module_name: "columns",
						settings: {
							layout_type: "basic",
						},
					};

					near_v_node_data.v_nodes.splice(ind, 1, columns_container);
				} else {
					if (dir === 1) {
						ind++;
					}

					near_v_node_data.v_nodes.splice(ind, 0, insert_v_node);

					const columns_container = near_v_node_data.parent_v_nodes[0];
					if (columns_container && columns_container.settings && columns_container.settings.layout_type === "basic") {
						let percentage_sum = 0;
						near_v_node_data.v_nodes.forEach((v_node) => {
							if (!v_node.styles.df) {
								v_node.styles.df = {};
							}
							const df = v_node.styles.df;
							percentage_sum += numberFromStr(df.width);
						});
						console.log(percentage_sum);

						// TODO: TEMPORARY solution here, assuming 1 row
						if (Math.abs(percentage_sum - 100) < 2) {
							// if it's above 101 make sure u split it, well even margins should add up, that's ticky as hell broo

							// will be just below 1
							let scale = ((100 / percentage_sum) * (near_v_node_data.v_nodes.length - 1)) / near_v_node_data.v_nodes.length;
							near_v_node_data.v_nodes.forEach((v_node) => {
								const df = v_node.styles.df;
								v_node.styles.df.width = floor(numberFromStr(df.width) * scale, 4) + "%";
							});
						}
					}

					// WORKS WELL ALREADY, look at the others now
					if (!insert_v_node.styles.df) {
						insert_v_node.styles.df = {};
					}
					insert_v_node.styles.df.width = floor(100 / near_v_node_data.v_nodes.length, 4) + "%";
				}
			};

			const insertInside = () => {
				/** @type {vDomNode} */
				const grabbed_node_copy = cloneObject(this.grabbed_v_node);
				this.getVNodeById(blc_vid).children.push(grabbed_node_copy);
			};

			/**
			 * @param {insertBlc} insert_blc
			 * @param {insertPosEnum} pos_str
			 */
			const setInsertPos = (insert_blc, pos_str) => {
				let pos = getInsertBlcPos(blc, pos_str);
				insert_blc._set_absolute_pos(pos.left, pos.top);

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
					if (Math.abs(comp_pos.left - pos.left) < insert_blc.offsetWidth && Math.abs(comp_pos.top - pos.top) < insert_blc.offsetHeight) {
						insert_blc.remove();
					}
				}
			};

			const flow_direction = this.getFlowDirection(blc_vid);
			const near_v_node_data = getNearVNodeData();
			const near_v_node = near_v_node_data.v_node;

			let on_sides = true;
			let above_or_below = true;
			let inside = true;
			if (near_v_node.classes.includes("columns_container")) {
				on_sides = false;
			}

			if (flow_direction !== "column") {
				above_or_below = false;
			}

			if (!isEquivalent(near_v_node_data.v_node.children, [])) {
				inside = false;
			}

			if (inside && near_v_node.module_name === "template_hook") {
				inside = false;
			}

			if (blc.classList.contains("editor_disabled")) {
				on_sides = false;
				above_or_below = false;
			}

			if (on_sides) {
				const insert_left_blc = getInsertBlc();
				insert_left_blc._insert_action = () => {
					insertOnSides(-1);
				};
				setInsertPos(insert_left_blc, "left");

				const insert_right_blc = getInsertBlc();
				insert_right_blc._insert_action = () => {
					insertOnSides(1);
				};
				setInsertPos(insert_right_blc, "right");
			}

			if (above_or_below) {
				const insert_top_blc = getInsertBlc();
				insert_top_blc._insert_action = () => {
					insertAboveOrBelow(-1);
				};
				setInsertPos(insert_top_blc, "top");

				const insert_bottom_blc = getInsertBlc();
				insert_bottom_blc._insert_action = () => {
					insertAboveOrBelow(1);
				};
				setInsertPos(insert_bottom_blc, "bottom");
			}

			if (inside) {
				const insert_center_blc = getInsertBlc();
				insert_center_blc._insert_action = () => {
					insertInside();
				};
				setInsertPos(insert_center_blc, "center");
			}
		});

		this.alternative_scroll_panel._children(".insert_blc").forEach((insert_blc) => {
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
			const insert_blcs = this.alternative_scroll_panel._children(".insert_blc");
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
		this.float_multi_insert_bckg.classList.add("hidden");
		this.parent_float_focus.classList.add("hidden");

		this.content.style.minHeight = "";

		this.alternative_scroll_panel._children(".insert_blc").forEach((insert_blc) => {
			insert_blc.remove();
		});

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

			this.float_menu_active = true;
			this.setFocusNode(grabbed_block_vid);
		} else {
			this.v_dom.splice(0, this.v_dom.length);
			deepAssign(this.v_dom, this.before_grab_v_dom);

			this.update({ all: true });
		}
	}

	/**
	 *
	 * @param {boolean} peca
	 */
	setContentActive(peca) {
		this.content_active = peca;
		if (!this.content_active) {
			this.setCursorActive(false);
		}
	}

	/**
	 *
	 * @param {boolean} peca
	 */
	setCursorActive(peca) {
		this.cursor_active = peca;
		this.cursor.classList.toggle("hidden", !this.cursor_active);
	}
	getFocusNode() {
		const focus_node = this.getNode(this.focus_node_vid);
		return focus_node;
	}

	removeEditorSelection() {
		this.last_selection = undefined;
		removeSelection();
	}

	updateCursorPosition() {
		if (mouse.target) {
			if (this.just_clicked) {
				const click_blc = mouse.target._parent(".blc");
				if (click_blc) {
					const click_blc_vid = +click_blc.dataset.vid;
					const click_v_node = this.getVNodeById(click_blc_vid);
					if (click_v_node && click_v_node.text === undefined && !click_blc.classList.contains("editor_disabled")) {
						this.setFocusNode(click_blc_vid);
						this.removeEditorSelection();
					}
				}
			}
		}

		const sel = window.getSelection();
		if (this.content_active || this.float_menu_active) {
			/** @type {Selection} */
			this.last_selection = cloneObject(sel);
		}
		const csel = this.last_selection;

		const range = document.createRange();
		const focus_node = csel ? $(csel.focusNode) : undefined;

		const focus_textable = focus_node ? focus_node._parent(`.textable:not(.editor_disabled)`) : undefined;

		if (focus_textable) {
			let cursor_top, cursor_left, cursor_width, cursor_height;

			if (focus_textable.innerText === "\n") {
				const node_cursor_rect = focus_textable._child("br").getBoundingClientRect();
				const sel_width = node_cursor_rect.width;
				const sel_height = node_cursor_rect.height;
				cursor_width = Math.max(sel_width, 2);
				cursor_height = Math.max(sel_height, 20);

				cursor_left = node_cursor_rect.left + 1 + sel_width * 0.5;
				cursor_top = node_cursor_rect.top + sel_height * 0.5;
			} else {
				range.setStart(csel.focusNode, csel.focusOffset);
				range.setEnd(csel.focusNode, csel.focusOffset);

				const selection_cursor_rect = range.getBoundingClientRect();
				const sel_width = selection_cursor_rect.width;
				const sel_height = selection_cursor_rect.height;
				cursor_width = Math.max(sel_width, 2);
				cursor_height = Math.max(sel_height, 20);

				cursor_left = selection_cursor_rect.left + sel_width * 0.5;
				cursor_top = selection_cursor_rect.top + sel_height * 0.5;
			}

			this.cursor.style.left = cursor_left - cursor_width * 0.5 + "px";
			this.cursor.style.top = cursor_top - cursor_height * 0.5 + "px";
			this.cursor.style.width = cursor_width + "px";
			this.cursor.style.height = cursor_height + "px";

			if (this.content_active) {
				this.setCursorActive(true);
			}
		} else {
			this.setCursorActive(false);
		}

		if (focus_textable) {
			const vid = +focus_textable.dataset.vid;
			if (vid !== this.focus_node_vid) {
				this.setFocusNode(vid);
			}
		}

		this.just_clicked = false;
	}

	/**
	 *
	 * @param {number} vid
	 * @returns
	 */
	setFocusNode(vid) {
		if (this.grabbed_v_node || this.editing_layout) {
			return;
		}

		let just_changed_focus_vid = this.focus_node_vid !== vid;
		this.focus_node_vid = vid;

		const focus_node = this.getNode(vid);
		let tblc;

		if (just_changed_focus_vid) {
			this.filterMenu({ scroll_to_top: true });

			if (vid === undefined) {
				this.removeEditorSelection();
			}
		}

		if (focus_node) {
			if (just_changed_focus_vid) {
				this.setBlcMenuFromFocusedNode();
			}

			tblc = this.inspector_tree._child(`.tblc_${this.focus_node_vid}`);
			if (tblc && just_changed_focus_vid) {
				scrollIntoView(tblc);
			}
		}

		this.content._children(".blc").forEach((e) => {
			e.classList.toggle("piep_focus", e === focus_node);
		});
		this.inspector_tree._children(".v_node_label").forEach((e) => {
			e.classList.toggle("selected", e === tblc);
		});

		this.displaySelectionBreadcrumbs();
	}

	setBlcMenuFromFocusedNode() {
		let quiet = false;

		const blc_menu_token = this.focus_node_vid + "_" + this.selected_resolution;
		if (this.last_blc_menu_token === blc_menu_token) {
			quiet = true;
		}
		this.last_blc_menu_token = blc_menu_token;

		let v_node_data = this.getVNodeDataById(this.focus_node_vid);
		let v_node = v_node_data ? v_node_data.v_node : undefined;

		if (!v_node) {
			return;
		}

		/**
		 *
		 * @param {PiepNode[]} inputs
		 */
		const setPropsOfInputs = (inputs) => {
			inputs.forEach((input) => {
				const prop_str = input.dataset.blc_prop;
				let prop_val;
				let v_node_ref = v_node; // we cant change it below dude

				if (piep_cms_manager.text_block_props.includes(prop_str) && v_node_ref.tag.match(piep_cms_manager.match_inline_tag)) {
					const parent = v_node_data.parent_v_nodes[0];
					if (parent && this.isTextContainer(parent)) {
						v_node_ref = parent;
					}
				}

				if (prop_str.startsWith("styles.")) {
					const res_styles = v_node_ref.styles[this.selected_resolution];
					if (res_styles) {
						prop_val = res_styles[prop_str.substring("styles.".length)];
					}
				} else if (prop_str.startsWith("attrs.")) {
					if (!v_node_ref.attrs) {
						v_node_ref.attrs = {};
					}
					prop_val = v_node_ref.attrs[prop_str.substring("attrs.".length)];
				} else if (prop_str.startsWith("settings.")) {
					if (!v_node_ref.settings) {
						v_node_ref.settings = {};
					}
					prop_val = v_node_ref.settings[prop_str.substring("settings.".length)];
				} else {
					prop_val = v_node_ref[prop_str];
				}

				let val = def(prop_val, "");
				input._set_value(val, { quiet: true });
			});
		};

		if (this.last_blc_menu_name !== "float" || !quiet) {
			setPropsOfInputs(this.float_menu._children("[data-blc_prop]"));
		}
		if (this.last_blc_menu_name !== "side" || !quiet) {
			setPropsOfInputs(this.side_menu._children("[data-blc_prop]"));
		}
	}

	/**
	 *
	 * @param {{
	 * scroll_to_top?: boolean
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
								const matches = blc_group.matcher(v_node_data);
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
					x.blc_prop_wrapper.classList.toggle("first", index === 0);
					this.blc_menu_scroll_panel.append(x.blc_prop_wrapper);
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
								const matches = blc_group.matcher(v_node_data);
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
							if (visible) {
								priority += def(blc_group.priority, 0);
								break;
							}
						}
					}

					blc_prop_wrapper.classList.toggle("hidden", !visible);

					return {
						blc_prop: blc_prop_wrapper,
						priority,
					};
				})
				.sort((a, b) => Math.sign(b.priority - a.priority))
				.forEach((x) => {
					this.float_menu.append(x.blc_prop);
				});
			this.float_menu.append(this.float_menu._child(".unselect_everything"));
		}

		this.blc_menu_scroll_panel.classList.toggle("hidden", !has_selection);
		this.case_blc_menu_empty.classList.toggle("hidden", has_selection);

		if (has_selection && options.scroll_to_top) {
			this.blc_menu_scroll_panel.scrollTop = 0;
		}

		this.setBlcMenuFromFocusedNode();
	}

	/**
	 *
	 * @param {ShowFocusToNodeData[]} show_nodes
	 * @returns
	 */
	showFocusToNodes(show_nodes) {
		let float_focuses_html = "";

		for (const show_node of show_nodes.filter((e, index) => show_nodes.findIndex((z) => z.vid === e.vid) === index)) {
			const focus_node = this.getNode(show_node.vid);
			if (!focus_node) {
				continue;
			}
			const focus_node_rect = focus_node.getBoundingClientRect();
			float_focuses_html += html`<div
				class="focus_rect"
				style="
                left:${focus_node_rect.left - 1}px;
                top:${focus_node_rect.top - 1 + this.content_scroll.scrollTop}px;
                width:${focus_node_rect.width + 2}px;
                height:${focus_node_rect.height + 2}px;
                opacity:${show_node.opacity};
            "
			></div>`;
		}

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

		const safe_off_x = 5;
		const safe_off_y = 25;
		left = clamp(
			content_wrapper_rect.left + safe_off_x,
			left,
			content_wrapper_rect.left + content_wrapper_rect.width - piep_editor_float_menu_rect.width - safe_off_x
		);
		// TODO: hide sometimes? not always necessary when user scrolls
		if (top < content_wrapper_rect.top + safe_off_y) {
			top += focus_node_rect.height + piep_editor_float_menu_rect.height + 2;

			if (top > content_wrapper_rect.top + content_wrapper_rect.height - safe_off_y) {
				top -= 0.5 * (focus_node_rect.height + piep_editor_float_menu_rect.height + 2);
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
	 * @param {number} dx
	 * @param {number} dy
	 */
	selectElementContentsFromAnywhere(dx, dy) {
		const sel = window.getSelection();
		/** @type {DOMRect} */
		let sel_rect;

		const focus_node = this.getFocusNode();
		if (focus_node && focus_node.innerText === "\n") {
			sel_rect = focus_node._child("br").getBoundingClientRect();
		} else {
			sel_rect = sel.getRangeAt(0).getBoundingClientRect();
		}
		const sel_center = getRectCenter(sel_rect);

		const textables = this.content._children(".textable");
		let closest_textable;
		let textable_smallest_dist = 100000000;
		for (const textable of textables) {
			const textable_rect = textable.getBoundingClientRect();

			/** @type {DOMRect} */
			let start_range_rect;
			/** @type {DOMRect} */
			let end_range_rect;

			if (textable.innerText === "\n") {
				start_range_rect = textable._child("br").getBoundingClientRect();
				end_range_rect = start_range_rect;
			} else {
				const start_range = getRangeByIndex(textable, 0);
				start_range_rect = start_range.getBoundingClientRect();

				const end_range = getRangeByIndex(textable, textable.textContent.length);
				end_range_rect = end_range.getBoundingClientRect();
			}

			if (dy === 1) {
				if (end_range_rect.top < sel_rect.top + 1) {
					continue;
				}
			}
			if (dy === -1) {
				if (start_range_rect.top > sel_rect.top - 1) {
					continue;
				}
			}
			if (dx === 1) {
				if (end_range_rect.left < sel_rect.left + 1) {
					continue;
				}
			}
			if (dx === -1) {
				if (start_range_rect.left > sel_rect.left - 1) {
					continue;
				}
			}

			const textable_center = getRectCenter(textable_rect);

			const textable_dist = dx * textable_center.x + dy * textable_center.y;
			if (textable_dist < textable_smallest_dist) {
				textable_smallest_dist = textable_dist;
				closest_textable = textable;
			}
		}

		if (closest_textable) {
			const range = document.createRange();

			let closest_pos = 0;
			let pos_smallest_dist = 100000000;
			const text_node = getTextNode(closest_textable);
			for (let pos = 0; pos <= text_node.textContent.length; pos++) {
				range.setStart(text_node, pos);
				range.setEnd(text_node, pos);

				const position_center = getRectCenter(range.getBoundingClientRect());
				let pos_dist = 0;
				const ddx = position_center.x - sel_center.x;
				const ddy = position_center.y - sel_center.y;
				if (dx === 0) {
					pos_dist += 0.1 * Math.abs(ddx);
				} else {
					const dddx = dx * ddx;
					if (dddx < 1) {
						continue;
					}
					pos_dist += dddx;
				}
				if (dy === 0) {
					pos_dist += 0.1 * Math.abs(ddy);
				} else {
					const dddy = dy * ddy;
					if (dddy < 1) {
						continue;
					}
					pos_dist += dddy;
				}

				if (pos_dist < pos_smallest_dist) {
					pos_smallest_dist = pos_dist;
					closest_pos = pos;
				}
			}

			setSelectionByIndex(closest_textable, closest_pos);
		}
	}

	/**
	 *
	 * @param {boolean} open
	 */
	toggleInspector(open = undefined) {
		if (open !== undefined) {
			this.inspector_open = open;
		} else {
			this.inspector_open = !this.inspector_open;
		}
		this.inspector.classList.toggle("open", this.inspector_open);

		const show_inspector_btn = this.container._child(".show_inspector_btn");
		show_inspector_btn.classList.toggle("primary", this.inspector_open);
		show_inspector_btn.classList.toggle("transparent", !this.inspector_open);
		show_inspector_btn.dataset.tooltip = this.inspector_open ? "Ukryj drzewko elementów" : "Pokaż drzewko elementów";
	}
}
