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
		/** @type {vDomNode[]} */
		this.v_dom_overlay = [];
		/** @type {vDomNode[][]} */
		this.v_dom_history = [];

		this.initNodes();
		this.initConsts();

		this.initInspector();
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
		this.alternative_scroll_panel = node("piep_editor_alternative_scroll_panel");
		this.float_focus = node("piep_editor_float_focus");
		this.parent_float_focus = node("piep_editor_parent_float_focus"); // TODO: display more than just a parent? f.e. for columns
		this.float_menu = node("piep_editor_float_menu");
		this.add_block_menu = node("piep_editor_add_block_menu");
		this.layout_controls = node("piep_editor_layout_controls");

		// added straight to the layout_controls
		//this.show_edit_node_layout = node("piep_editor_show_edit_node_layout");
		//this.alternative_scroll_panel.append(this.show_edit_node_layout);

		this.styles = styles("piep_editor_styles");

		this.blc_menu = this.container._child(".piep_editor_blc_menu");

		this.float_multi_insert = node("piep_editor_float_multi_insert");

		this.alternative_scroll_panel.append(this.float_multi_insert);
		this.alternative_scroll_panel.append(this.layout_controls);
		this.alternative_scroll_panel.append(this.float_menu);
		this.alternative_scroll_panel.append(this.float_focus);
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
		this.pushHistory();
	}

	pushHistory() {
		this.v_dom_history.splice(this.v_dom_history.length - this.history_steps_back, this.history_steps_back);
		this.history_steps_back = 0;

		if (this.v_dom_history.length > 0 && isEquivalent(this.v_dom_history[this.v_dom_history.length - 1], this.v_dom)) {
			return;
		}
		this.v_dom_history.push(cloneObject(this.v_dom));
		this.renderHistory();

		this.filterMenu();
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
		this.recreateDom();
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
			/** @type {string} */
			this.selected_resolution = this.select_resolution._get_value();
			if (this.selected_resolution === "df") {
				this.content_scroll.style.maxWidth = "";
			} else {
				this.content_scroll.style.maxWidth = responsive_preview_sizes[this.selected_resolution] + 20 + "px"; // 20 for scrollbar
			}

			this.recreateDom();
			this.setBlcMenuFromFocusedNode();
		});

		this.select_resolution._set_value("df");
	}

	initConsts() {
		this.match_media_tags = /^(img|video|iframe)$/;

		this.single_tags = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"];

		/** @type {number[]} */
		this.pretty_percentages = [100];
		for (const w of [2, 3, 4, 5, 6]) {
			for (let i = 1; i < w; i++) {
				this.pretty_percentages.push((100 * i) / w);
			}
		}
		this.pretty_percentages = this.pretty_percentages.filter(onlyUnique);
		this.pretty_percentages.sort((a, b) => Math.sign(a - b));
	}

	initFloatMenu() {
		let floating_blc_props_menu_html = "";
		piep_cms_props_handler.floating_blc_props.forEach((blc_prop) => {
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
				any_picker.wrapper._set_content(
					html`<div class="font_size_float">
						<div class="label first">Rozmiar:</div>
						<div class="glue_children">
							<input class="field small value_input" />
							<select class="piep_editor_unit_input field inline small">
								<option value="px">px</option>
								<option value="em">em</option>
								<option value="rem">rem</option>
								<option value=""></option>
							</select>
						</div>
					</div>`
				);
				const value_input = any_picker.wrapper._child(".value_input");
				const unit_input = any_picker.wrapper._child(".piep_editor_unit_input");
				/** @type {string} */
				const get_value = different_size.classList.contains("selected") ? font_size_dropdown._get_value() : "";
				/** @type {any} */
				let val = get_value;
				let uni = "";
				for (const unit of ["px", "em", "rem"]) {
					if (get_value.endsWith(unit)) {
						val = numberFromStr(val);
						uni = unit;
					}
				}
				value_input._set_value(val);
				unit_input._set_value(uni);

				const change = () => {
					font_size_dropdown._set_value(value_input._get_value() + unit_input._get_value());
				};
				unit_input.addEventListener("change", change);
				value_input.addEventListener("change", change);
				value_input.addEventListener("input", change);

				any_picker.show(different_size);
			});
		};

		const themeSettingsChanged = () => {
			updateFontSizeDropdown(this.float_menu._child(`[data-blc_prop="style.fontSize"]`));
			updateFontSizeWrapper(this.blc_menu._child(`.prop_font_size`));
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
		 * @param {PiepNode} color_dropdown
		 */
		const updateColorDropdown = (color_dropdown) => {
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
					<i class="fas fa-eye-dropper"></i> <color-picker></color-picker>
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
			updateColorDropdown(this.float_menu._child(`.prop_background_color`));
			updateColorWrapper(this.blc_menu._child(`.prop_color`));
			updateColorWrapper(this.blc_menu._child(`.prop_background_color`));
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

			const edit_seo_btn = target._parent(".edit_seo_btn");
			if (edit_seo_btn) {
				getPageSeoDataModal()._show({ source: edit_seo_btn });
			}
		});
	}

	initLayoutEdit() {
		this.container.addEventListener("mousedown", (ev) => {
			if (!this.editing_layout) {
				return;
			}

			const target = $(ev.target);

			const width_control = target._parent(".width_control");
			if (width_control) {
				this.width_grabbed = true;
				this.container.classList.add("width_grabbed");
				this.width_grabbed_at_mouse_x = mouse.pos.x;

				const care_about_resolutions = this.getResolutionsWeCareAbout();
				const v_node_styles = this.findNodeInVDomById(this.v_dom, this.focus_node_vid).styles;
				/** @type {string} */
				let style_width = def(v_node_styles.df.width, "");
				care_about_resolutions.forEach((res) => {
					if (!v_node_styles[res]) {
						return;
					}
					const w = v_node_styles[res].width;
					if (w) {
						style_width = w;
					}
				});

				const focus_node = this.getFocusNode();
				const focus_node_parent = focus_node._parent();
				const focus_node_rect = focus_node.getBoundingClientRect();
				const visible_width = focus_node_rect.width;
				const visible_parent_width = focus_node_parent.getBoundingClientRect().width;
				this.width_grabbed_unit = style_width.match(/\d*px/) ? "px" : "%";
				this.width_grabbed_percent = visible_parent_width * 0.01;
				if (this.width_grabbed_unit === "px") {
					this.width_grabbed_base_value = visible_width;
				} else {
					const wfroms = numberFromStr(style_width);
					this.width_grabbed_base_value = wfroms ? wfroms : (visible_width / visible_parent_width) * 100;
				}
				this.width_grabbed_direction = mouse.pos.x > focus_node_rect.left + focus_node_rect.width * 0.5 ? "right" : "left";

				ev.preventDefault();
			} else {
				this.finishEditingLayout();
			}
		});
	}

	initAddBlockMenu() {
		let menu_html = "";

		/**
		 * @typedef {{
		 * id: string
		 * label: string
		 * v_node: vDomNode
		 * }} BlockToAdd
		 */

		/** @type {BlockToAdd[]} */
		const blocks_to_add = [
			{
				id: "h1",
				label: html`<span class="bold">H1</span> Nagłówek`,
				v_node: {
					tag: "h1",
					id: -1,
					text: "Nagłówek",
					styles: {},
					classes: [],
					attrs: {},
				},
			},
			{
				id: "h2",
				label: html`<span class="bold">H2</span> Nagłówek`,
				v_node: {
					tag: "h2",
					id: -1,
					text: "Nagłówek",
					styles: {},
					classes: [],
					attrs: {},
				},
			},
			{
				id: "h3",
				label: html`<span class="bold">H3</span> Nagłówek`,
				v_node: {
					tag: "h3",
					id: -1,
					text: "Nagłówek",
					styles: {},
					classes: [],
					attrs: {},
				},
			},
			{
				id: "p",
				label: html`<i class="fas fa-align-center"></i> Paragraf / Tekst`,
				v_node: {
					tag: "p",
					id: -1,
					text: "Lorem ipsum",
					styles: {},
					classes: [],
					attrs: {},
				},
			},
			{
				id: "vertical_container",
				label: html`
					<i class="vertical_container_icon">
						<div></div>
						<div></div>
						<div></div>
					</i>
					Kontener pionowy
				`,
				v_node: {
					tag: "div",
					id: -1,
					children: [],
					styles: {},
					classes: [],
					attrs: {},
				},
			},
			{
				id: "columns_container",
				label: html`
					<i class="columns_container_icon">
						<div></div>
						<div></div>
						<div></div>
					</i>
					Kontener z kolumnami
				`,
				v_node: {
					tag: "div",
					id: -1,
					styles: {},
					classes: ["columns_container"],
					attrs: {},
					settings: {
						layout_type: "basic",
					},
					children: [
						{
							id: -1,
							tag: "div",
							styles: { df: { width: "50%" } },
							attrs: {},
							classes: ["vertical_container"],
							children: [],
						},
						{
							id: -1,
							tag: "div",
							styles: { df: { width: "50%" } },
							attrs: {},
							classes: ["vertical_container"],
							children: [],
						},
					],
				},
			},
			{
				id: "img",
				label: html`<i class="far fa-image"></i> Zdjęcie`,
				v_node: {
					tag: "img",
					id: -1,
					styles: {},
					classes: ["wo997_img"],
					attrs: { "data-src": "/src/img/empty_img_147x94.svg" },
				},
			},
			{
				//<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2316.685375328343!2d18.533917818907184!3d54.503773259192585!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46fda0cc4256d643%3A0x465e190242c3fd05!2sSzperaczek!5e0!3m2!1spl!2spl!4v1619695875923!5m2!1spl!2spl" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
				id: "google_map",
				label: html`<i class="fas fa-map-marked-alt"></i> Mapa Google`,
				v_node: {
					tag: "iframe",
					id: -1,
					styles: {},
					classes: ["google_map"],
					attrs: {},
				},
			},
			{
				id: "html",
				label: html`<i class="fas fa-code"></i> Kod HTML`,
				v_node: {
					tag: "div",
					id: -1,
					styles: { minHeight: "400px" },
					classes: ["raw_html"],
					attrs: {},
				},
			},
		];

		for (const block_to_add of blocks_to_add) {
			menu_html += html` <div class="btn transparent block_to_add" data-id="${block_to_add.id}">${block_to_add.label}</div> `;
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
					const block_to_add = blocks_to_add.find((e) => e.id === block_to_add_btn.dataset.id);
					const add_v_node = block_to_add.v_node;
					add_v_node.id = this.getNewBlcId();
					if (add_v_node.children) {
						add_v_node.children.forEach((child, index) => {
							child.id = add_v_node.id + 1 + index;
						});
					}
					this.v_dom.push(add_v_node);
					this.recreateDom();
					this.setFocusNode(add_v_node.id);
					this.grabBlock({ type: "insert" });
				});
			}
		});
	}

	initEditables() {
		this.container._children("[data-blc_prop]").forEach((input) => {
			input.addEventListener("change", () => {
				const focus_node = this.getFocusNode();
				if (focus_node) {
					const v_node_data = this.getVDomNodeDataById(this.v_dom, +focus_node.dataset.vid);
					const v_node = v_node_data.v_node;
					const anchor_offset = this.last_selection.anchorOffset;
					const focus_offset = this.last_selection.focusOffset;

					if (this.last_selection.focusNode !== this.last_selection.anchorNode) {
						alert("Currently only single line editing is available");
						return;
					}

					const begin_offset = Math.min(anchor_offset, focus_offset);
					const end_offset = Math.max(anchor_offset, focus_offset);

					let val = input._get_value();

					let prop_str = input.dataset.blc_prop;

					let just_style = false;
					/**
					 *
					 * @param {vDomNode} edit_v_node
					 */
					const setPropOfVNode = (edit_v_node) => {
						let prop_ref = edit_v_node;

						if (prop_str.startsWith("style.")) {
							if (prop_ref.styles[this.selected_resolution] === undefined) {
								prop_ref.styles[this.selected_resolution] = {};
							}
							prop_ref = prop_ref.styles[this.selected_resolution];
							prop_str = prop_str.substring("style.".length);
							just_style = true;
						}
						if (prop_str.startsWith("attr.")) {
							if (!prop_ref.attrs) {
								prop_ref.attrs = {};
							}
							prop_ref = prop_ref.attrs;
							prop_str = prop_str.substring("attr.".length);
						}
						if (prop_str.startsWith("setting.")) {
							if (!prop_ref.settings) {
								prop_ref.settings = {};
							}
							prop_ref = prop_ref.settings;
							prop_str = prop_str.substring("setting.".length);
						}

						if (val === "") {
							delete prop_ref[prop_str];
						} else {
							prop_ref[prop_str] = val;
						}
					};

					let select_node, select_start, select_end;

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

						v_node.children = [];

						if (begin_offset > 0) {
							v_node.children.push(bef_child);
						}
						v_node.children.push(mid_child);
						if (end_offset < v_node.text.length) {
							v_node.children.push(aft_child);
						}

						v_node.text = undefined;

						setPropOfVNode(mid_child);
						this.recreateDom(this.v_dom, { just_style });

						const node_ref = this.getNode(mid_vid);
						if (node_ref) {
							select_node = node_ref;
							select_start = 0;
							select_end = end_offset - begin_offset;
						}
					} else {
						setPropOfVNode(v_node);
						this.recreateDom(this.v_dom, { just_style });

						const node_ref = this.getNode(v_node.id);
						this.setFocusNode(v_node.id);
						if (v_node.text === undefined) {
						} else if (node_ref) {
							select_node = node_ref;
							select_start = begin_offset;
							select_end = end_offset;
						}
					}

					if (select_node && !validPiepInput($(document.activeElement))) {
						setSelectionByIndex(select_node, select_start, select_end);
					}

					this.pushHistory();
				}
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
			this.insertPiepText(text);
		});
	}

	initClick() {
		document.addEventListener("mousedown", (ev) => {
			this.just_clicked = true;
		});

		document.addEventListener("click", (ev) => {
			const target = $(ev.target);

			if (this.grabbed_block_vid !== undefined) {
				this.releaseBlock();
			}

			const content_active = !!(target._parent(this.content) || target._parent(".v_node_label"));
			this.setContentActive(content_active);

			this.updateCursorPosition();

			const v_node_data = this.getVDomNodeDataById(this.v_dom, this.focus_node_vid);
			const v_node = v_node_data ? v_node_data.v_node : undefined;

			if (target._parent(".move_btn")) {
				this.grabBlock({ type: "move" });
			}

			if (target._parent(".layout_btn")) {
				this.editLayout();
			}

			if (target._parent(".remove_format_btn")) {
				v_node.styles = {};
				this.recreateDom();
			}

			const choose_img_btn = target._parent(".choose_img_btn");
			if (choose_img_btn) {
				const input = this.blc_menu._child(`[data-blc_prop="attr.data-src"]`);
				const select_file_modal = getSelectFileModal();
				select_file_modal._data.file_manager.select_target = input;
				select_file_modal._render();
				select_file_modal._show({ source: choose_img_btn });
			}

			if (target._parent(".remove_btn")) {
				v_node_data.v_nodes.splice(v_node_data.index, 1);
				this.recreateDom();
				this.setFocusNode(undefined);

				this.pushHistory();
			}

			if (target._parent(this.container)) {
				this.float_menu_active = true;
				if (target._parent(".hide_menu_btn") || this.focus_node_vid === undefined) {
					this.float_menu_active = false;
				}

				this.float_menu.classList.toggle("hidden", !this.float_menu_active);
			}
		});
	}

	initKeyDown() {
		document.addEventListener("keydown", (ev) => {
			const sel = window.getSelection();
			const focus_node = this.getFocusNode();
			const focus_offset = sel.focusOffset;
			const vid = focus_node ? +focus_node.dataset.vid : undefined;
			const v_node_data = this.getVDomNodeDataById(this.v_dom, vid);
			const v_node = v_node_data ? v_node_data.v_node : undefined;

			//v_node.text === undefined
			if (!this.cursor_active) {
				return;
			}

			if (ev.key.length === 1 && sel) {
				if (!ev.ctrlKey) {
					ev.preventDefault();

					if (focus_node && focus_node.classList.contains("textable")) {
						this.insertPiepText(ev.key);
					}
				}
			}

			if (ev.key === "Backspace" && v_node_data) {
				ev.preventDefault();

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
							this.recreateDom();

							const prev_node_ref = this.getNode(prev_vid);
							if (prev_node_ref) {
								setSelectionByIndex(prev_node_ref, prev_v_node_text_before.length);
							}
						}
					}
				} else {
					v_node.text = text.substr(0, focus_offset - 1) + text.substr(focus_offset);
					this.recreateDom();

					const node_ref = this.getNode(vid);
					if (node_ref) {
						setSelectionByIndex(node_ref, focus_offset - 1);
					}
				}
			}

			if (ev.key === "Delete" && v_node_data) {
				ev.preventDefault();

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
							this.recreateDom();

							const node_ref = this.getNode(node_vid);
							if (node_ref) {
								setSelectionByIndex(node_ref, v_node_text_before.length);
							}
						}
					}
				} else {
					v_node.text = text.substr(0, focus_offset) + text.substr(focus_offset + 1);
					this.recreateDom();

					const node_ref = this.getNode(vid);
					if (node_ref) {
						setSelectionByIndex(node_ref, focus_offset);
					}
				}
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

				const text = v_node.text;
				if (typeof text === "string") {
					const insert_v_node = cloneObject(v_node);
					insert_v_node.text = text.substr(focus_offset);
					const insert_node_vid = this.getNewBlcId();
					insert_v_node.id = insert_node_vid;
					v_node.text = text.substr(0, focus_offset);
					v_node_data.v_nodes.splice(v_node_data.index + 1, 0, insert_v_node);
					this.recreateDom();

					const insert_node_ref = this.getNode(insert_node_vid);
					if (insert_node_ref) {
						setSelectionByIndex(insert_node_ref, 0);
					}
				}
			}
		});
	}

	initBlcMenu() {
		this.blc_menu._set_content(html`
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

			<div class="text_center flex align_center justify_center case_blc_menu_empty">Nie zaznaczono<br />bloku do edycji</div>

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

		this.blc_menu_scroll_panel = this.blc_menu._child(".blc_menu_scroll_panel");
		this.case_blc_menu_empty = this.blc_menu._child(".case_blc_menu_empty");

		let blc_props_menu_html = "";
		piep_cms_props_handler.blc_props.forEach((blc_prop) => {
			blc_props_menu_html += html`<div class="prop_${blc_prop.name}">${blc_prop.menu_html}</div>`;
		});
		this.blc_menu_scroll_panel._set_content(blc_props_menu_html);

		registerForms();

		this.filter_blc_menu = this.blc_menu._child(".filter_blc_menu");
		this.filter_blc_menu._set_value("all");
		this.filter_blc_menu.addEventListener("change", () => {
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
		this.recreateDom();
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

			if (v_node_label) {
				const vid = +v_node_label.dataset.vid;

				setSelectionRange(undefined);
				this.setCursorActive(false);
				this.setFocusNode(vid);

				scrollIntoView(this.getNode(vid));
			}
		});
	}

	getNewBlcId() {
		let max = 0;
		const traversePiepHtml = (nodes) => {
			for (const node of nodes) {
				if (node.id > max) {
					max = node.id;
				}
				if (node.children) {
					traversePiepHtml(node.children);
				}
			}
		};

		traversePiepHtml(this.v_dom);
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

	/**
	 * @param {vDomNode[]} target_v_dom
	 * @param {{
	 * just_style?: boolean
	 * }} [options]
	 */
	recreateDom(target_v_dom = undefined, options = {}) {
		if (target_v_dom === undefined) {
			target_v_dom = this.v_dom;
		}

		const care_about_resolutions = this.getResolutionsWeCareAbout();

		// order doesn't really matter so far
		let styles_css = "";

		/**
		 *
		 * @param {vDomNode[]} v_nodes
		 * @returns {{
		 * content_html:string
		 * inspector_tree_html: string
		 * }}
		 */
		const traverseVDom = (v_nodes, level = 0) => {
			let content_html = "";
			let inspector_tree_html = "";

			for (const v_node of v_nodes) {
				let body = "";

				if (v_node.module_name) {
					const module_class = `module_${v_node.module_name}`;
					if (!v_node.classes.includes(module_class)) {
						v_node.classes.push(module_class);
					}

					if (v_node.classes.includes("columns_container")) {
						// fix widths if necessary? hard to work on it when something else than percentages are given though
					}
				}

				// oh boy, here you need to warmup children, PROBABLY A LISTENER WOULD BE IDEAL

				// if (v_node.module_name === "columns") {
				// 	v_node.children = [];
				// 	for (let column_id = 0; column_id < v_node.module_attrs.column_count; column_id++) {
				// 		// I think it's possible to reuse most of the data from above,
				// 		// ON THE OTHER HAND - THESE THINGS WONT EVEN BE STORED FUUUCK
				// 		const column_v_node = { id: this.getNewBlcId(), attrs: {}, classes: [], styles: {}, tag: "div", children: [] };

				// 		column_v_node.children = [];
				// 		const inside = v_node.module_children[column_id];
				// 		if (inside) column_v_node.children.push(inside);
				// 		v_node.children.push(column_v_node);
				// 		//v_node.module_children[]
				// 	}

				// 	//v_node.children = cloneObject();
				// }

				const children = v_node.children;
				const text = v_node.text;

				const tag = v_node.tag;
				const textable = text !== undefined;

				let attrs = { "data-vid": v_node.id };
				Object.assign(attrs, v_node.attrs);

				const base_class = this.getNodeSelector(v_node.id).replace(".", "");
				let classes = ["blc", base_class, ...v_node.classes];

				const map_tag_display_name = {
					a: "Link",
					h1: "Nagłówek",
					h2: "Nagłówek",
					h3: "Nagłówek",
					h4: "Nagłówek",
					h5: "Nagłówek",
					h6: "Nagłówek",
					div: "Kontener",
					p: "Paragraf",
					span: "Tekst",
					img: "Zdjęcie",
				};

				const display_name = def(map_tag_display_name[tag], "");

				let info = "";

				if (text !== undefined) {
					info = text ? escapeHTML(text) : "(pusty)";
				} else if (children !== undefined) {
					info = `(${children.length})`;
				}

				if (info) {
					info = html`<span class="info"> - ${info}</span>`;
				}

				inspector_tree_html += html`<div class="v_node_label tblc_${v_node.id}" style="--level:${level}" data-vid="${v_node.id}">
					<span class="name">${display_name}</span>
					${info}
				</div>`;

				if (textable) {
					classes.push("textable");
					if (text) {
						body += text;
					} else {
						body += `<br>`;
					}
				} else if (children !== undefined) {
					// traverse for styles but not contents ;)
					const { content_html: sub_content_html, inspector_tree_html: sub_inspector_tree_html } = traverseVDom(children, level + 1);

					body += sub_content_html;
					inspector_tree_html += sub_inspector_tree_html;
				}

				let add_to_body = true;
				if (v_node.id === this.grabbed_block_vid) {
					if (!this.current_insert_blc || !v_node.insert_on_release) {
						add_to_body = false;
					}
				}

				if (add_to_body) {
					const classes_csv = classes.join(" ");

					const attrs_csv = Object.entries(attrs)
						.map(([key, val]) => {
							return `${key}="${escapeAttribute(val)}"`;
						})
						.join(" ");

					if (this.single_tags.includes(tag)) {
						content_html += html`<${tag} class="${classes_csv}" ${attrs_csv} />`;
					} else {
						content_html += html`<${tag} class="${classes_csv}" ${attrs_csv}>${body}</${tag}>`;
					}
				}

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
						node_styles = `#p .${base_class} { ${node_styles} }`;
						styles_css += node_styles;
					}
				}
			}

			return { content_html, inspector_tree_html };
		};

		const { content_html, inspector_tree_html } = traverseVDom(target_v_dom);

		if (!options.just_style) {
			this.content._set_content(content_html, { maintain_height: true });
		}

		this.styles._set_content(styles_css);

		if (!options.just_style) {
			this.inspector_tree._set_content(inspector_tree_html, { maintain_height: true });
		}

		lazyLoadImages({ duration: 0 });
		registerForms();

		this.setFocusNode(this.focus_node_vid);
	}

	/**
	 *
	 * @param {vDomNode[]} v_dom
	 * @param {number} vid
	 * @returns
	 */
	findNodeInVDomById(v_dom, vid) {
		if (!vid) {
			return undefined;
		}

		const node_data = this.getVDomNodeDataById(v_dom, vid);
		if (!node_data) {
			return undefined;
		}
		return node_data.v_node;
	}

	/**
	 *
	 * @param {vDomNode[]} v_dom
	 * @param {{(v_node: vDomNode): boolean}} test
	 * @returns
	 */
	findNodeInVDom(v_dom, test) {
		const node_data = this.getVDomNodeData(v_dom, test);
		if (!node_data) {
			return undefined;
		}
		return node_data.v_node;
	}

	/**
	 *
	 * @param {vDomNode[]} v_dom
	 * @param {number} vid
	 * @param {findVDomOptions} [options]
	 * @returns
	 */
	getVDomNodeDataById(v_dom, vid, options = {}) {
		if (!vid) {
			return undefined;
		}

		return this.getVDomNodeData(v_dom, (v_node) => v_node.id === vid, options);
	}

	/**
	 *
	 * @param {vDomNode[]} v_dom
	 * @param {{(v_node: vDomNode): boolean}} test
	 * @param {findVDomOptions} [options]
	 * @returns {vDomNodeData}
	 */
	getVDomNodeData(v_dom, test, options = {}) {
		/**
		 *
		 * @param {vDomNode[]} v_nodes
		 * @returns
		 */
		const traverseVDom = (v_nodes, parent_v_nodes) => {
			let index = -1;
			for (const v_node of v_nodes) {
				index++;

				if (options.ignore_insert === true) {
					if (v_node.id === this.grabbed_block_vid) {
						if (!this.current_insert_blc || !v_node.insert_on_release) {
							continue;
						}
					}
				}

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

		return traverseVDom(v_dom, []);
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

	/**
	 *
	 * @param {string} insert_text
	 * @returns
	 */
	insertPiepText(insert_text) {
		const sel = window.getSelection();
		const focus_offset = sel.focusOffset;
		const anchor_offset = sel.anchorOffset;
		const focus_node = this.getFocusNode();
		const vid = focus_node ? +focus_node.dataset.vid : 0;
		const v_node = this.findNodeInVDomById(this.v_dom, vid);
		if (!v_node) {
			return;
		}

		const text = v_node.text;
		if (text === undefined) {
			return;
		}

		let begin_offset = focus_offset;
		let end_offset = focus_offset;
		if (anchor_offset === focus_offset) {
			v_node.text = text.substr(0, focus_offset) + insert_text + text.substr(focus_offset);
		} else {
			begin_offset = Math.min(anchor_offset, focus_offset);
			end_offset = Math.max(anchor_offset, focus_offset);
			v_node.text = text.substr(0, begin_offset) + insert_text + text.substr(end_offset);
		}
		this.recreateDom();

		const node_ref = this.getNode(vid);
		if (node_ref) {
			setSelectionByIndex(node_ref, begin_offset + insert_text.length);
		}
	}

	grabbedBlock() {
		if (!mouse.target) {
			return;
		}

		// grabbed
		const radius = 23; //35;

		let left = mouse.pos.x - this.grabbed_block_wrapper_rect.width * 0.5;
		let top = mouse.pos.y - this.grabbed_block_wrapper_rect.height * 0.5;

		this.grabbed_block_wrapper._set_absolute_pos(left, top);

		/** @type {insertBlc} */
		// @ts-ignore
		const insert_blc = mouse.target._parent(".insert_blc, .svg_insert_btn");

		if (this.showing_float_multi_of_blc) {
			const piep_editor_float_multi_insert_rect = this.float_multi_insert.getBoundingClientRect();
			const dx = piep_editor_float_multi_insert_rect.left + piep_editor_float_multi_insert_rect.width * 0.5 - mouse.pos.x;
			const dy = piep_editor_float_multi_insert_rect.top + piep_editor_float_multi_insert_rect.height * 0.5 - mouse.pos.y;
			const inside = dx * dx + dy * dy < radius * radius;

			if (inside) {
				removeClasses(".foreign_hover", ["foreign_hover"], this.float_multi_insert);
				const svg_insert_btn = mouse.target._parent(".svg_insert_btn");
				if (svg_insert_btn) {
					const index = svg_insert_btn.dataset.index;
					this.float_multi_insert._child(`.foreign_insert_btn[data-index="${index}"]`).classList.add("foreign_hover");
				}
			} else {
				this.showing_float_multi_of_blc.classList.remove("hidden");
				this.float_multi_insert.classList.add("hidden");
				this.showing_float_multi_of_blc = undefined;
			}
		}

		if (this.current_insert_blc !== insert_blc) {
			this.current_insert_blc = insert_blc;

			/** @type {PiepNode} */
			let pretty_focus_parent;

			this.v_dom_overlay.splice(0, this.v_dom_overlay.length);
			deepAssign(this.v_dom_overlay, this.v_dom);

			/** @type {insertBlc} */
			let show_insert_blc_option = undefined;

			if (insert_blc) {
				if (insert_blc.classList.contains("multiple")) {
					let edit_block_html = "";

					let buttons = "";

					const inner_radius = 0; //15;

					const norad = Math.PI / 180;

					const x0 = radius;
					const y0 = radius;

					const btn_count = insert_blc._popup_blcs.length;

					const icon_size = 20;

					const space_ratio = 0; // 0.5;
					const inner_space_ratio = 0; //(space_ratio * radius) / inner_radius;

					const point = (a, r) => {
						return {
							x: x0 - Math.sin(a * norad) * r,
							y: y0 - Math.cos(a * norad) * r,
						};
					};

					for (let i = 0; i < btn_count; i++) {
						const a1 = (i * 360) / btn_count;
						const a2 = ((i + 1) * 360) / btn_count;

						const p1 = point(a1 + space_ratio, radius);
						const p2 = point(a2 - space_ratio, radius);
						const p3 = point(a2 - inner_space_ratio, inner_radius);
						const p4 = point(a1 + inner_space_ratio, inner_radius);

						const p5 = point((a1 + a2) * 0.5, (radius + inner_radius) * 0.5);

						buttons += html`
							<path
								class="svg_insert_btn"
								data-index="${i}"
								d="
                                    M${p1.x},${p1.y}
                                    A${radius},${radius} 1 0,0 ${p2.x},${p2.y}
                                    L${p3.x},${p3.y}
                                    A${inner_radius},${inner_radius} 1 0,1 ${p4.x},${p4.y}
                                    L${p1.x},${p1.y}
                                    z
                                "
							></path>
							<foreignObject
								class="foreign_insert_btn"
								data-index="${i}"
								x="${p5.x - icon_size * 0.5}"
								y="${p5.y - icon_size * 0.5}"
								width="${icon_size}"
								height="${icon_size}"
								pointer-events="none"
							>
								<i class="fas fa-plus"></i>
							</foreignObject>
						`;
					}
					edit_block_html = html`
						<svg
							viewBox="-1 -1 ${radius * 2 + 2} ${radius * 2 + 2}"
							width="${radius * 2 + 2}"
							height="${radius * 2 + 2}"
							xmlns="http://www.w3.org/2000/svg"
							version="1.1"
						>
							<circle cx="${x0}" cy="${y0}" r="${inner_radius}" class="center_circle" />
							${buttons}
						</svg>
					`;

					this.float_multi_insert._set_content(edit_block_html);
					this.float_multi_insert.classList.remove("hidden");

					const insert_blc_rect = insert_blc.getBoundingClientRect();
					const piep_editor_float_multi_insert_rect = this.float_multi_insert.getBoundingClientRect();

					this.float_multi_insert._set_absolute_pos(
						insert_blc_rect.left + (insert_blc_rect.width - piep_editor_float_multi_insert_rect.width) * 0.5,
						insert_blc_rect.top +
							(insert_blc_rect.height - piep_editor_float_multi_insert_rect.height) * 0.5 +
							this.content_scroll.scrollTop
					);
					this.showing_float_multi_of_blc = insert_blc;
					insert_blc.classList.add("hidden");
				}

				if (!insert_blc.classList.contains("multiple")) {
					if (insert_blc.classList.contains("svg_insert_btn")) {
						if (this.showing_float_multi_of_blc) {
							show_insert_blc_option = this.showing_float_multi_of_blc._popup_blcs[+insert_blc.dataset.index];
						}
					} else {
						show_insert_blc_option = insert_blc;
					}
				}
			}

			if (show_insert_blc_option) {
				show_insert_blc_option._insert_action();
				this.recreateDom(this.v_dom_overlay);
				setTimeout(() => {
					this.showFocusToNode(this.grabbed_block_vid);
				});

				const v_node_data = this.getVDomNodeDataById(this.v_dom_overlay, this.grabbed_block_vid, { ignore_insert: true });
				if (v_node_data.parent_v_nodes[0]) {
					const parent_vid = v_node_data.parent_v_nodes[0].id;
					pretty_focus_parent = this.getNode(parent_vid);
				}
			} else {
				this.recreateDom(this.v_dom_overlay);
				this.float_focus.classList.add("hidden");
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
		let show_focus_node_vid = this.focus_node_vid;

		const v_node_label = mouse.target ? mouse.target._parent(".v_node_label") : undefined;
		if (v_node_label) {
			show_focus_node_vid = +v_node_label.dataset.vid;
		}

		this.showFocusToNode(show_focus_node_vid);
		let show_float_menu = this.float_menu_active;
		if (show_focus_node_vid !== this.focus_node_vid) {
			show_float_menu = false;
			any_picker.hide();
			this.float_menu._children("p-dropdown.dropped").forEach((d) => {
				d.click();
			});
		}
		this.float_menu.classList.toggle("hidden", !show_float_menu);
		this.showFloatMenuToNode(show_focus_node_vid);
	}

	addBtnMove() {
		let show_add_block_menu = false;

		if (mouse.target) {
			if (this.grabbed_block_vid === undefined) {
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
		if (this.width_grabbed && !mouse.down) {
			this.width_grabbed = false;
			this.container.classList.remove("width_grabbed");
		}

		if (!mouse.down) {
			removeClasses(".editing_now", ["editing_now"], this.container);
		}

		if (this.width_grabbed) {
			const dx = mouse.pos.x - this.width_grabbed_at_mouse_x;
			const ddx = dx * (this.width_grabbed_direction === "left" ? -1 : 1);

			let set_width = "100%";
			if (this.width_grabbed_unit === "%") {
				let wid = Math.max(10, this.width_grabbed_base_value + ddx / this.width_grabbed_percent);
				if (CTRL_DOWN) {
					let lowest_dwid = 100;
					let closest_wid = wid;
					for (let percentage of this.pretty_percentages) {
						const dwid = Math.abs(percentage - wid);
						if (dwid < lowest_dwid) {
							lowest_dwid = dwid;
							closest_wid = percentage;
						}
					}
					wid = closest_wid;
				}
				set_width = floor(wid, 4) + "%";
			} else {
				let wid = Math.max(this.width_grabbed_base_value + ddx);
				if (CTRL_DOWN) {
					wid = round(wid, -1);
				}
				set_width = Math.max(50, floor(this.width_grabbed_base_value + ddx, 4)) + "px";
			}

			const width_input = this.blc_menu._child(`[data-blc_prop="style.width"]`);
			const change = set_width !== width_input._get_value();
			scrollIntoView(width_input);
			width_input.classList.add("editing_now");
			width_input._set_value(set_width);

			if (change) {
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

		const content_wrapper_rect = this.content_wrapper.getBoundingClientRect();

		const inspector_width = 310;
		const inspector_height = 390;
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

		if (this.grabbed_block_vid !== undefined) {
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

		this.showFocusToNode(this.focus_node_vid);

		this.container.classList.add("editing_layout");
		this.container.classList.add("disable_editing");

		this.filter_blc_menu._set_value("layout");

		this.displayNodeLayout();
	}

	displayNodeLayout() {
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
			let left = focus_node_rect.left;
			let top = focus_node_rect.top;
			let width = focus_node_rect.width;
			let height = Math.abs(pd_top);
			display_padding(left, top, width, height);
		}
		{
			// bottom
			let left = focus_node_rect.left;
			let top = focus_node_rect.top + focus_node_rect.height;
			let width = focus_node_rect.width;
			let height = Math.abs(pd_bottom);
			top -= height;
			display_padding(left, top, width, height);
		}
		{
			// left
			let left = focus_node_rect.left;
			let top = focus_node_rect.top;
			let width = Math.abs(pd_left);
			let height = focus_node_rect.height;
			display_padding(left, top, width, height);
		}
		{
			// right
			let left = focus_node_rect.left + focus_node_rect.width;
			let top = focus_node_rect.top;
			let width = Math.abs(pd_right);
			let height = focus_node_rect.height;
			left -= width;
			display_padding(left, top, width, height);
		}

		const width_control_width = 15;

		// width_controls
		const display_width_control = (left, top) => {
			layout_html += html`<div class="width_control" style="left:${left}px;top:${top + this.content_scroll.scrollTop}px;"></div>`;
		};
		{
			// left bottom
			let left = focus_node_rect.left;
			let top = focus_node_rect.top + focus_node_rect.height - width_control_width;
			display_width_control(left, top);
		}
		{
			// right bottom
			let left = focus_node_rect.left + focus_node_rect.width - width_control_width;
			let top = focus_node_rect.top + focus_node_rect.height - width_control_width;
			display_width_control(left, top);
		}
		{
			// left top
			let left = focus_node_rect.left;
			let top = focus_node_rect.top;
			display_width_control(left, top);
		}
		{
			// right top
			let left = focus_node_rect.left + focus_node_rect.width - width_control_width;
			let top = focus_node_rect.top;
			display_width_control(left, top);
		}

		this.layout_controls._set_content(layout_html);
	}

	finishEditingLayout() {
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
		this.current_insert_blc = 123456789; // will warm up everything on grab

		this.grabbed_block_wrapper._set_content(this.getFocusNode().outerHTML);
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

		// ok we grabbed it!

		this.grabbed_block_wrapper_rect = this.grabbed_block_wrapper.getBoundingClientRect();

		this.v_dom_overlay.splice(0, this.v_dom_overlay.length);
		deepAssign(this.v_dom_overlay, this.v_dom);
		this.recreateDom(this.v_dom_overlay);

		// prepare all possible places to drop the block yay

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

			switch (pos) {
				case "left":
					left = blc_rect.left;
					top = blc_rect.top + blc_rect.height * 0.5;
					break;
				case "right":
					left = blc_rect.left + blc_rect.width;
					top = blc_rect.top + blc_rect.height * 0.5;
					break;
				case "top":
					left = blc_rect.left + blc_rect.width * 0.5;
					top = blc_rect.top;
					break;
				case "bottom":
					left = blc_rect.left + blc_rect.width * 0.5;
					top = blc_rect.top + blc_rect.height;
					break;
				case "center":
					left = blc_rect.left + blc_rect.width * 0.5;
					top = blc_rect.top + blc_rect.height * 0.5;
					break;
			}

			top += this.content_scroll.scrollTop;

			return { left, top };
		};

		this.content._children(".blc").forEach((blc) => {
			if (blc._parent(this.getNodeSelector(this.grabbed_block_vid))) {
				// just no baby
				return;
			}

			const getGrabbedVNodeData = () => {
				const grabbed_v_node_data = this.getVDomNodeDataById(this.v_dom_overlay, this.grabbed_block_vid);
				return grabbed_v_node_data;
			};
			const getNearVNodeData = () => {
				const near_v_node_data = this.getVDomNodeDataById(this.v_dom_overlay, blc_vid);
				return near_v_node_data;
			};

			const blc_vid = +blc.dataset.vid;

			const getFlowDirection = () => {
				/** @type {FlowDirectionEnum} */
				let flow_direction = "column";
				const parent_v_node = getNearVNodeData().parent_v_nodes[0];
				if (parent_v_node) {
					// const parent_display = parent_v_node.styles.display;
					// if (parent_display === "flex") {
					// 	wrap_with_a_flex = false;
					// }

					if (parent_v_node.classes.includes("columns_container")) {
						flow_direction = "row"; // TODO: wont work always ofc
					}
				}
				return flow_direction;
			};

			/**
			 *
			 * @param {-1 | 1} dir
			 */
			const insertAboveOrBelow = (dir) => {
				const grabbed_v_node_data = this.getVDomNodeDataById(this.v_dom_overlay, this.grabbed_block_vid);
				const near_v_node_data = this.getVDomNodeDataById(this.v_dom_overlay, blc_vid);

				let ind = near_v_node_data.index;
				if (dir === 1) {
					ind++;
				}

				/** @type {vDomNode} */
				const grabbed_node_copy = cloneObject(grabbed_v_node_data.v_node);
				grabbed_node_copy.insert_on_release = true;

				near_v_node_data.v_nodes.splice(ind, 0, grabbed_node_copy);
			};

			/**
			 *
			 * @param {-1 | 1} dir
			 */
			const insertOnSides = (dir) => {
				const grabbed_v_node_data = getGrabbedVNodeData();
				const near_v_node_data = getNearVNodeData();
				const near_v_node = near_v_node_data.v_node;

				let ind = near_v_node_data.index;

				/** @type {vDomNode} */
				const grabbed_node_copy = cloneObject(grabbed_v_node_data.v_node);
				grabbed_node_copy.insert_on_release = true;

				// actually here we should have block / inline-block checking, blocks can be wrapped,
				// text not so, unless what we place nearby is also a block?
				let suggest_wrapping_with_columns_module = false;
				// if (near_v_node_data.v_node.text === undefined) {
				// 	wrap_with_a_flex = true;
				// }
				const flow_direction = getFlowDirection();

				if (flow_direction === "column") {
					suggest_wrapping_with_columns_module = true;
				}

				const new_vid = this.getNewBlcId();

				const insert_column = grabbed_node_copy.classes.includes("vertical_container")
					? grabbed_node_copy
					: {
							id: new_vid,
							tag: "div",
							styles: { df: {} },
							attrs: {},
							classes: ["vertical_container"],
							children: [grabbed_node_copy],
					  };

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

					insert_column.styles.df.width = "50%";

					if (dir === 1) {
						just_columns.push(insert_column);
					} else {
						just_columns.unshift(insert_column);
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

					near_v_node_data.v_nodes.splice(ind, 0, insert_column);

					const columns_container = near_v_node_data.parent_v_nodes[0];
					if (columns_container && columns_container.settings && columns_container.settings.layout_type === "basic") {
						let percentage_sum = 0;
						near_v_node_data.v_nodes.forEach((v_node) => {
							const df = v_node.styles.df;
							percentage_sum += numberFromStr(df.width);
						});

						// will be just below 1
						let scale = ((100 / percentage_sum) * (near_v_node_data.v_nodes.length - 1)) / near_v_node_data.v_nodes.length;
						near_v_node_data.v_nodes.forEach((v_node) => {
							const df = v_node.styles.df;
							v_node.styles.df.width = floor(numberFromStr(df.width) * scale, 4) + "%";
						});
					}

					// WORKS WELL ALREADY, look at the others now
					insert_column.styles.df.width = floor(100 / near_v_node_data.v_nodes.length, 4) + "%";
				}
			};

			const insertInside = () => {
				/** @type {vDomNode} */
				const grabbed_node_copy = cloneObject(this.findNodeInVDomById(this.v_dom_overlay, this.grabbed_block_vid));
				grabbed_node_copy.insert_on_release = true;

				this.findNodeInVDomById(this.v_dom_overlay, blc_vid).children.push(grabbed_node_copy);
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

			const flow_direction = getFlowDirection();
			const near_v_node_data = getNearVNodeData();
			const near_v_node = near_v_node_data.v_node;

			let on_sides = true;
			if (near_v_node.classes.includes("columns_container")) {
				on_sides = false;
			}

			if (on_sides) {
				// left
				const insert_left_blc = getInsertBlc();
				insert_left_blc._insert_action = () => {
					insertOnSides(-1);
				};
				setInsertPos(insert_left_blc, "left");

				// right
				const insert_right_blc = getInsertBlc();
				insert_right_blc._insert_action = () => {
					insertOnSides(1);
				};
				setInsertPos(insert_right_blc, "right");
			}

			if (flow_direction === "column") {
				// top
				const insert_top_blc = getInsertBlc();
				insert_top_blc._insert_action = () => {
					insertAboveOrBelow(-1);
				};
				setInsertPos(insert_top_blc, "top");

				// bottom
				const insert_bottom_blc = getInsertBlc();
				insert_bottom_blc._insert_action = () => {
					insertAboveOrBelow(1);
				};
				setInsertPos(insert_bottom_blc, "bottom");
			}

			if (isEquivalent(near_v_node_data.v_node.children, [])) {
				// center
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
		this.float_focus.classList.add("hidden");
		this.float_multi_insert.classList.add("hidden");
		this.parent_float_focus.classList.add("hidden");

		this.content.style.minHeight = "";

		this.alternative_scroll_panel._children(".insert_blc").forEach((insert_blc) => {
			insert_blc.remove();
		});

		if (this.current_insert_blc) {
			const grabbed_block_vid = this.grabbed_block_vid;

			// use whatever the user have seen already, smooth UX
			this.v_dom.splice(0, this.v_dom.length);
			deepAssign(this.v_dom, this.v_dom_overlay);

			// remove grabbed block that was just hidden so far
			const grabbed_v_node_data = this.getVDomNodeData(
				this.v_dom,
				(v_node) => !v_node.insert_on_release && v_node.id === grabbed_block_vid
			);
			grabbed_v_node_data.v_nodes.splice(grabbed_v_node_data.index, 1);

			setTimeout(() => {
				// when vdom is ready
				this.float_menu_active = true;
				this.setFocusNode(grabbed_block_vid);
			});

			const v_node_with_insert = this.findNodeInVDom(this.v_dom, (v_node) => v_node.insert_on_release);
			if (v_node_with_insert) {
				v_node_with_insert.insert_on_release = false;
			}
		} else {
			// temp block needs to be removed
			if (this.grab_block_options.type === "insert") {
				const grabbed_v_node_data = this.getVDomNodeDataById(this.v_dom, this.grabbed_block_vid);
				grabbed_v_node_data.v_nodes.splice(grabbed_v_node_data.index, 1);
			}
		}

		this.grabbed_block_vid = undefined;
		this.grabbed_block_wrapper_rect = undefined;
		this.current_insert_blc = undefined;
		this.has_insert_pos = false;

		this.recreateDom();
		this.pushHistory();
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
		const focus_node = this.content._child(".piep_focus");
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
					const click_v_node = this.findNodeInVDomById(this.v_dom, click_blc_vid);
					if (click_v_node && click_v_node.text === undefined) {
						this.setFocusNode(click_blc_vid);
						this.removeEditorSelection();
					}
				}
			}
		}

		const sel = window.getSelection();
		if (this.content_active || this.float_menu_active) {
			this.last_selection = cloneObject(sel);
		}
		const csel = this.last_selection;

		const range = document.createRange();
		const focus_node = csel ? $(csel.focusNode) : undefined;

		const focus_textable = focus_node ? focus_node._parent(`.textable`) : undefined;

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
			this.setFocusNode(+focus_textable.dataset.vid);
		}

		this.just_clicked = false;
	}

	/**
	 *
	 * @param {number} vid
	 * @returns
	 */
	setFocusNode(vid) {
		if (this.grabbed_block_vid !== undefined || this.editing_layout) {
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
	}

	setBlcMenuFromFocusedNode() {
		if (this.last_blc_menu_to_vid === this.focus_node_vid && this.last_blc_menu_to_res === this.selected_resolution) {
			return;
		}
		this.last_blc_menu_to_vid = this.focus_node_vid;
		this.last_blc_menu_to_res = this.selected_resolution;

		const v_node = this.findNodeInVDomById(this.v_dom, this.focus_node_vid);

		if (!v_node) {
			return;
		}

		// will take everything, even hidden items
		this.container._children("[data-blc_prop]").forEach((input) => {
			const prop_str = input.dataset.blc_prop;
			let prop_val;

			if (prop_str.startsWith("style.")) {
				const res_styles = v_node.styles[this.selected_resolution];
				if (res_styles) {
					prop_val = res_styles[prop_str.substring("style.".length)];
				}
			}
			if (prop_str.startsWith("attr.")) {
				if (!v_node.attrs) {
					v_node.attrs = {};
				}
				prop_val = v_node.attrs[prop_str.substring("attr.".length)];
			}
			if (prop_str.startsWith("setting.")) {
				if (!v_node.settings) {
					v_node.settings = {};
				}
				prop_val = v_node.settings[prop_str.substring("setting.".length)];
			}

			let val = def(prop_val, "");
			input._set_value(val, { quiet: true });
		});
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
		const v_node = focus_node ? this.findNodeInVDomById(this.v_dom, +focus_node.dataset.vid) : undefined;

		const has_selection = !!v_node;
		const any_change = this.last_set_filter_menu_to_vid !== this.focus_node_vid || this.last_type_group !== type_group;
		if (has_selection && any_change) {
			this.last_set_filter_menu_to_vid = this.focus_node_vid;
			this.last_type_group = type_group;

			piep_cms_props_handler.blc_props
				.map((prop, index) => {
					const blc_prop_wrapper = this.blc_menu._child(".prop_" + prop.name);

					let visible = true;
					let priority = -index * 0.001;
					if (prop.blc_groups) {
						visible = false;
						for (const blc_group of prop.blc_groups) {
							if (blc_group.matcher) {
								const v_node_data = piep_cms.getVDomNodeDataById(piep_cms.v_dom, v_node.id);
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

			piep_cms_props_handler.floating_blc_props
				.map((prop, index) => {
					const blc_prop_wrapper = this.float_menu._child(".prop_" + prop.name);

					let visible = true;
					let priority = -index * 0.001;
					if (prop.blc_groups) {
						visible = false;
						for (const blc_group of prop.blc_groups) {
							if (blc_group.matcher) {
								const v_node_data = piep_cms.getVDomNodeDataById(piep_cms.v_dom, v_node.id);
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
			this.float_menu.append(this.float_menu._child(".hide_menu_btn"));
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
	 * @param {number} vid
	 * @returns
	 */
	showFocusToNode(vid) {
		if (vid === undefined) {
			this.float_focus.classList.add("hidden");
			return;
		}

		this.float_focus.classList.remove("hidden");

		const focus_node = this.getNode(vid);
		if (focus_node === undefined) {
			this.float_focus.classList.add("hidden");
			return;
		}
		const focus_node_rect = focus_node.getBoundingClientRect();

		this.float_focus._set_absolute_pos(focus_node_rect.left - 1, focus_node_rect.top - 1 + this.content_scroll.scrollTop);

		this.float_focus.style.width = focus_node_rect.width + 2 + "px";
		this.float_focus.style.height = focus_node_rect.height + 2 + "px";
	}

	/**
	 *
	 * @param {number} vid
	 * @returns
	 */
	showFloatMenuToNode(vid) {
		if (vid === undefined) {
			this.float_menu.classList.add("hidden");
			return;
		}

		const focus_node = this.getNode(vid);
		if (focus_node === undefined) {
			this.float_menu.classList.add("hidden");
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
		}
		if (top > content_wrapper_rect.top + content_wrapper_rect.height - safe_off_y) {
			top -= 0.5 * (focus_node_rect.height + piep_editor_float_menu_rect.height + 2);
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