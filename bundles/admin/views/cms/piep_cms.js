/* js[view] */

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
		this.initAdvancedMenu();
		this.initFloatMenu();
		this.initSelectResolution();
		this.initEditables();
		this.initEditingColors();

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
		this.parent_float_focus = node("piep_editor_parent_float_focus");
		this.float_menu = node("piep_editor_float_menu");

		this.styles = styles("piep_editor_styles");

		this.blc_menu = this.container._child(".piep_editor_blc_menu");

		this.float_multi_insert = node("piep_editor_float_multi_insert");
		this.alternative_scroll_panel.append(this.float_multi_insert);
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
	}

	renderHistory() {
		this.undo_btn.toggleAttribute("disabled", this.history_steps_back >= this.v_dom_history.length - 1);
		this.redo_btn.toggleAttribute("disabled", this.history_steps_back === 0);
	}

	initSelectResolution() {
		this.select_resolution = this.container._child(".select_resolution");
		this.select_resolution._set_value("desktop", { quiet: true });
	}

	initConsts() {
		/**
		 * @type {cmsEditableProp[]}
		 */
		this.editable_props = [
			{
				name: "fontWeight",
				groups: ["appearance"],
			},
			{
				name: "textAlign",
				groups: ["appearance"],
			},
			{
				name: "color",
				groups: ["appearance"],
			},
			{
				name: "backgroundColor",
				groups: ["appearance"],
			},
			{
				name: "margin",
				groups: ["layout"],
			},
			{
				name: "padding",
				groups: ["layout"],
			},
			{
				name: "data-src",
				match_tag: /img/, // TODO: matches array with order number?
				groups: ["appearance"],
			},
			{
				name: "alt",
				match_tag: /img|video|iframe/,
				groups: ["advanced"],
			},
			{
				name: "width",
				groups: ["layout"],
			},
			{
				name: "height",
				groups: ["layout"],
			},
		];

		this.single_tags = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"];
	}

	initFloatMenu() {
		// <p-option data-tooltip="Inny rozmiar" data-match="#\\d{1,}">
		// 	<input class="small inline" />
		// </p-option>;

		this.float_menu._set_content(html`
			<p-dropdown
				class="field small inline pretty_blue center static_label grid"
				data-blc_prop="style.fontSize"
				data-tooltip="Rozmiar czcionki"
			>
				<p-option data-value="">
					<span class="semi_bold"> A<span style="font-size:0.7em">A</span> </span>
				</p-option>
				<p-option data-value="1rem"><span style="font-size:1em">A</span></p-option>
				<p-option data-value="1.2rem"><span style="font-size:1.2em">A</span></p-option>
				<p-option data-value="1.4rem"><span style="font-size:1.4em">A</span></p-option>
			</p-dropdown>

			<p-dropdown class="field small inline pretty_blue center grid" data-blc_prop="style.fontWeight" data-tooltip="Grubość czcionki">
				<p-option data-value=""><span class="bold">B</span></p-option>
				<p-option data-value="var(--normal)">B</p-option>
				<p-option data-value="var(--semi_bold)"><span class="semi_bold">B</span></p-option>
				<p-option data-value="var(--bold)"><span class="bold">B</span></p-option>
			</p-dropdown>

			<p-dropdown class="field small inline pretty_blue center grid" data-blc_prop="style.textAlign" data-tooltip="Wyrównanie tekstu">
				<p-option data-value=""> <i class="fas fa-align-left"></i> </p-option>
				<p-option data-value="left"> <i class="fas fa-align-left"></i> </p-option>
				<p-option data-value="center"> <i class="fas fa-align-center"></i> </p-option>
				<p-option data-value="right"> <i class="fas fa-align-right"></i> </p-option>
				<p-option data-value="justify"> <i class="fas fa-align-justify"></i> </p-option>
			</p-dropdown>

			<p-dropdown
				class="field small inline pretty_blue center static_label grid global_root"
				data-blc_prop="style.color"
				data-tooltip="Kolor czcionki"
			>
				<p-option data-value=""> <i class="fas fa-paint-brush"></i> </p-option>
			</p-dropdown>

			<p-dropdown
				class="field small inline pretty_blue center static_label grid global_root"
				data-blc_prop="style.backgroundColor"
				data-tooltip="Kolor tła"
			>
				<p-option data-value=""> <i class="fas fa-fill"></i> </p-option>
			</p-dropdown>

			<button class="btn transparent small choose_img_btn" data-tooltip="Wybierz zdjęcie">
				<i class="fas fa-image"></i>
			</button>

			<button class="btn transparent small remove_format_btn" data-tooltip="Usuń formatowanie">
				<i class="fas fa-remove-format"></i>
			</button>

			<button class="btn transparent small move_block_btn" data-tooltip="Przemieść blok">
				<i class="fas fa-arrows-alt"></i>
			</button>

			<button class="btn transparent small remove_block_btn" data-tooltip="Usuń blok">
				<i class="fas fa-trash"></i>
			</button>

			<button class="btn transparent small hide_menu_btn" data-tooltip="Ukryj menu">
				<i class="fas fa-times"></i>
			</button>
		`);
	}

	initEditingColors() {
		/**
		 *
		 * @param {PiepNode} color_wrapper
		 */
		const updateColorWrapper = (color_wrapper) => {
			registerForms();

			const input = color_wrapper._child("input");
			const radio_group = color_wrapper._child(".radio_group");
			const color_picker = color_wrapper._child("color-picker");

			let color_options_html = html`
				<div class="checkbox_area">
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

			// rewrites the first element
			radio_group._set_content(color_options_html);

			registerForms();

			if (!input.classList.contains("wrrgstrd")) {
				input.classList.add("wrrgstrd");
				input.addEventListener("value_set", () => {
					/** @type {string} */
					const color = input._get_value();
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
				input._set_value(radio_group._get_value());
			});
			color_picker.addEventListener("change", () => {
				input._set_value(color_picker._get_value());
			});
		};

		/**
		 *
		 * @param {PiepNode} color_dropdown
		 */
		const updateColorDropdown = (color_dropdown) => {
			registerForms(); // let the options_wrapper appear

			const options_wrapper = color_dropdown._child(".options_wrapper");

			let color_options_html = "";
			colors_palette.forEach((color) => {
				color_options_html += html`
					<p-option data-value="var(--${color.name})">
						<div class="color_circle" style="background:var(--${color.name});"></div>
					</p-option>
				`;
			});

			// rewrites the first element
			options_wrapper._set_content(html`
				${options_wrapper._child(`[data-value=""]`).outerHTML} ${color_options_html}
				<p-option data-tooltip="Inny kolor" data-match="#\\w{3,}">
					<i class="fas fa-eye-dropper"></i> <color-picker></color-picker>
				</p-option>
				<p-option class="edit_theme_btn" data-tooltip="Zarządzaj paletą kolorów"> <i class="fas fa-cog"></i> </p-option>
			`);

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

			color_picker.addEventListener("color_picker_hidden", () => {
				color_dropdown.click();
			});
		};

		const colorPaletteChanged = () => {
			updateColorDropdown(this.float_menu._child(`[data-blc_prop="style.color"]`));
			updateColorDropdown(this.float_menu._child(`[data-blc_prop="style.backgroundColor"]`));
			updateColorWrapper(this.blc_menu._child(`[data-blc_prop_wrapper="color"]`));
			updateColorWrapper(this.blc_menu._child(`[data-blc_prop_wrapper="backgroundColor"]`));
		};
		window.addEventListener("color_palette_changed", colorPaletteChanged);
		colorPaletteChanged();

		document.addEventListener("click", (event) => {
			const target = $(event.target);
			const edit_theme_btn = target._parent(".edit_theme_btn");
			if (edit_theme_btn) {
				getThemeSettingsModal()._show({ source: edit_theme_btn });
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

					/**
					 *
					 * @param {vDomNode} edit_v_node
					 */
					const setPropOfVNode = (edit_v_node) => {
						let prop_ref = edit_v_node;

						if (prop_str.startsWith("style.")) {
							prop_ref = prop_ref.styles;
							prop_str = prop_str.substring("style.".length);
						}
						if (prop_str.startsWith("attr.")) {
							prop_ref = prop_ref.attrs;
							prop_str = prop_str.substring("attr.".length);
						}

						if (val === "") {
							delete prop_ref[prop_str];
						} else {
							prop_ref[prop_str] = val;
						}
					};

					// the selection is something but not everything in the v_node
					if (anchor_offset !== focus_offset && v_node.text.length !== end_offset - begin_offset) {
						// since the first one is the greatest so the other two will be
						const bef_vid = this.getPiepEditorId();
						const mid_vid = this.getPiepEditorId() + 1;
						const aft_vid = this.getPiepEditorId() + 2;

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
						this.recreateDom();

						const node_ref = this.getNode(mid_vid);
						if (node_ref) {
							setSelectionByIndex(node_ref, 0, end_offset - begin_offset);
						}
					} else {
						setPropOfVNode(v_node);
						this.recreateDom();

						const node_ref = this.getNode(v_node.id);
						this.setFocusNode(v_node.id);
						if (v_node.text === undefined) {
						} else if (node_ref) {
							setSelectionByIndex(node_ref, begin_offset, end_offset);
						}
					}

					this.pushHistory();
				}
			});
		});
	}

	initPaste() {
		this.container.addEventListener("paste", (e) => {
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

			if (target._parent(".move_block_btn")) {
				this.grabBlock();
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

			if (target._parent(".remove_block_btn")) {
				v_node_data.v_nodes.splice(v_node_data.index, 1);
				this.recreateDom();
				this.setFocusNode(undefined);
			}

			if (target._parent(this.container)) {
				this.float_menu_active = true; // !!(content_active || target._parent(this.float_menu) || target._parent(".picker_wrapper"));
				if (target._parent(".hide_menu_btn") || this.focus_node_vid === undefined || this.grabbed_block_vid !== undefined) {
					this.float_menu_active = false;
				}

				this.float_menu.classList.toggle("hidden", !this.float_menu_active);
			}

			if (this.inspector_grabbed) {
				this.inspector_grabbed = false;
				this.inspector.classList.remove("grabbed");
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
					const insert_node_vid = this.getPiepEditorId();
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

	initAdvancedMenu() {
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

			<div class="text_center flex align_center justify_center case_blc_menu_empty" style="flex-grow: 1;">
				Nie zaznaczono<br />bloku do edycji
			</div>

			<div class="scroll_panel scroll_shadow panel_padding blc_menu_scroll_panel">
				<div data-blc_prop_wrapper="fontWeight">
					<div class="label">Grubość czcionki</div>
					<div class="pretty_radio pretty_blue flex columns_4 spiky" data-blc_prop="style.fontWeight">
						<div class="checkbox_area">
							<p-checkbox data-value=""></p-checkbox>
							<span>-</span>
						</div>
						<div class="checkbox_area">
							<p-checkbox data-value="var(--normal)"></p-checkbox>
							<span>B</span>
						</div>
						<div class="checkbox_area">
							<p-checkbox data-value="var(--semi_bold)"></p-checkbox>
							<span class="semi_bold">B</span>
						</div>
						<div class="checkbox_area">
							<p-checkbox data-value="var(--bold)"></p-checkbox>
							<span class="bold">B</span>
						</div>
					</div>
				</div>

				<div data-blc_prop_wrapper="textAlign">
					<div class="label">Wyrównanie tekstu</div>
					<div class="pretty_radio pretty_blue flex columns_5 spiky" data-blc_prop="style.textAlign">
						<div class="checkbox_area">
							<p-checkbox data-value=""></p-checkbox>
							<span>-</span>
						</div>
						<div class="checkbox_area">
							<p-checkbox data-value="left"></p-checkbox>
							<i class="fas fa-align-left"></i>
						</div>
						<div class="checkbox_area">
							<p-checkbox data-value="center"></p-checkbox>
							<i class="fas fa-align-center"></i>
						</div>
						<div class="checkbox_area">
							<p-checkbox data-value="right"></p-checkbox>
							<i class="fas fa-align-right"></i>
						</div>
						<div class="checkbox_area">
							<p-checkbox data-value="justify"></p-checkbox>
							<i class="fas fa-align-justify"></i>
						</div>
					</div>
				</div>

				<div data-blc_prop_wrapper="color">
					<div class="label">Kolor czcionki</div>

					<input class="field hidden" data-blc_prop="style.color" />

					<div class="label normal">
						<span class="case_palette">Kolor z palety</span>
						<span class="edit_theme_btn normal link">Zarządzaj</span>
					</div>
					<div class="pretty_radio flex columns_6 global_root spiky"></div>

					<div class="label normal">Inny kolor</div>
					<color-picker class="inline"></color-picker>
				</div>

				<div data-blc_prop_wrapper="backgroundColor">
					<div class="label">Kolor tła</div>

					<input class="field hidden" data-blc_prop="style.backgroundColor" />

					<div class="label normal">
						<span class="case_palette">Kolor z palety</span>
						<span class="edit_theme_btn normal link">Zarządzaj</span>
					</div>
					<div class="pretty_radio flex columns_6 global_root spiky"></div>

					<div class="label normal">Inny kolor</div>
					<color-picker class="inline"></color-picker>
				</div>

				<div data-blc_prop_wrapper="margin">
					<div class="label">Margines zewnętrzny</div>
					<div class="flex align_center text_center text_center_fields">
						<div>
							Lewy
							<input class="field" data-blc_prop="style.marginLeft" />
						</div>
						<div class="ml2 mr2">
							Górny
							<input class="field mb3" data-blc_prop="style.marginTop" />
							Dolny
							<input class="field" data-blc_prop="style.marginBottom" />
						</div>
						<div>
							Prawy
							<input class="field" data-blc_prop="style.marginRight" />
						</div>
					</div>
				</div>

				<div data-blc_prop_wrapper="padding">
					<div class="label">Margines wewnętrzny (padding)</div>
					<div class="flex align_center text_center text_center_fields">
						<div>
							Lewy
							<input class="field" data-blc_prop="style.paddingLeft" />
						</div>
						<div class="ml2 mr2">
							Górny
							<input class="field mb3" data-blc_prop="style.paddingTop" />
							Dolny
							<input class="field" data-blc_prop="style.paddingBottom" />
						</div>
						<div>
							Prawy
							<input class="field" data-blc_prop="style.paddingRight" />
						</div>
					</div>
				</div>

				<div data-blc_prop_wrapper="width">
					<div class="label">Szerokość</div>
					<input class="field" data-blc_prop="style.width" />
				</div>

				<div data-blc_prop_wrapper="height">
					<div class="label">Wysokość</div>
					<input class="field" data-blc_prop="style.height" />
				</div>

				<div data-blc_prop_wrapper="data-src">
					<div class="label">Zdjęcie</div>
					<image-input data-blc_prop="attr.data-src" style="width:150px;height:150px"></image-input>
				</div>

				<div data-blc_prop_wrapper="alt">
					<div class="label">Opis zdjęcia (alt)</div>
					<input class="field" data-blc_prop="attr.alt" />
				</div>
			</div>

			<div class="pretty_radio semi_bold select_resolution mla mra">
				<div class="checkbox_area" data-tooltip="Komputer">
					<p-checkbox data-value="desktop"></p-checkbox>
					<span> <i class="fas fa-desktop"></i> </span>
				</div>
				<div class="checkbox_area" data-tooltip="Tablet">
					<p-checkbox data-value="tablet"></p-checkbox>
					<span> <i class="fas fa-tablet-alt"></i> </span>
				</div>
				<div class="checkbox_area" data-tooltip="Telefon">
					<p-checkbox data-value="mobile"></p-checkbox>
					<span> <i class="fas fa-mobile-alt"></i> </span>
				</div>
			</div>
		`);
		registerForms();

		this.filter_blc_menu = this.blc_menu._child(".filter_blc_menu");
		this.filter_blc_menu._set_value("all");
		this.filter_blc_menu.addEventListener("change", () => {
			this.filterMenu();
		});
	}

	export() {
		return JSON.stringify(this.v_dom);
	}

	import(set_v_dom) {
		this.v_dom = set_v_dom;
		this.recreateDom();
		this.setFocusNode(undefined);
		this.initHistory();
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
		this.grab_inspector_btn.addEventListener("click", () => {
			if (!this.inspector_grabbed) {
				setTimeout(() => {
					this.inspector_grabbed = true;
					this.inspector.classList.add("grabbed");
				});
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

	getPiepEditorId() {
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
	 * @param {vDomNode[]} target_v_dom
	 */
	recreateDom(target_v_dom = undefined) {
		if (target_v_dom === undefined) {
			target_v_dom = this.v_dom;
		}

		// order doesn't really matter so far
		let styles_html = "";

		/**
		 *
		 * @param {vDomNode[]} v_nodes
		 * @returns
		 */
		const traverseVDom = (v_nodes, level = 0) => {
			let content_html = "";
			let inspector_tree_html = "";

			for (const v_node of v_nodes) {
				let body = "";

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
					info = text ? text : "(pusty)";
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
					if (!this.current_insert_blc || !v_node.insert) {
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

				const styles = Object.entries(v_node.styles);
				if (styles.length > 0) {
					let node_styles = "";
					styles.forEach(([prop, val]) => {
						node_styles += `${kebabCase(prop)}: ${val};`;
					});
					styles_html += `.${base_class} { ${node_styles} }`;
				}
			}

			return { content_html, inspector_tree_html };
		};

		const { content_html, inspector_tree_html } = traverseVDom(target_v_dom);

		this.content._set_content(content_html, { maintain_height: true });

		this.styles._set_content(styles_html);

		this.inspector_tree._set_content(inspector_tree_html, { maintain_height: true });

		lazyLoadImages({ duration: 0 });
		registerForms();
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
	 * @typedef {{
	 * v_node: vDomNode
	 * v_nodes: vDomNode[]
	 * index: number
	 * parent_v_nodes: vDomNode[]
	 * }} vDomNodeData
	 *
	 * parent_v_nodes are ordered so the closest one is the direct parent
	 */

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
						if (!this.current_insert_blc || !v_node.insert) {
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

		const piep_editor_rect = this.container.getBoundingClientRect();

		let left = mouse.pos.x - this.grabbed_block_wrapper_rect.width * 0.5 - piep_editor_rect.left;
		let top = mouse.pos.y - this.grabbed_block_wrapper_rect.height * 0.5 - piep_editor_rect.top;

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
					const piep_editor_rect = this.container.getBoundingClientRect();
					const piep_editor_float_multi_insert_rect = this.float_multi_insert.getBoundingClientRect();

					this.float_multi_insert._set_absolute_pos(
						insert_blc_rect.left + (insert_blc_rect.width - piep_editor_float_multi_insert_rect.width) * 0.5 - piep_editor_rect.left,
						insert_blc_rect.top +
							(insert_blc_rect.height - piep_editor_float_multi_insert_rect.height) * 0.5 -
							piep_editor_rect.top +
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
				this.showFocusToNode(this.grabbed_block_vid);

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

				this.parent_float_focus._set_absolute_pos(
					focus_parent_node_rect.left - 1 - piep_editor_rect.left,
					focus_parent_node_rect.top - 1 - piep_editor_rect.top
				);

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
		}
		this.float_menu.classList.toggle("hidden", !show_float_menu);
		this.showFloatMenuToNode(show_focus_node_vid);
	}

	inspectorGrabbed() {
		const safe_off = 5;

		//const inspector_rect = this.inspector.getBoundingClientRect();
		const content_wrapper_rect = this.content_wrapper.getBoundingClientRect();

		const inspector_width = 310;
		const inspector_height = 390;
		const inspector_grab_btn_offset = 47;

		//const max_x = content_wrapper_rect.left + content_wrapper_rect.width - inspector_rect.width - off;
		const max_x = content_wrapper_rect.left + content_wrapper_rect.width - inspector_width - safe_off;

		if (this.inspector_grabbed) {
			//const grab_btn_center = getRectCenter(this.grab_inspector_btn.getBoundingClientRect());

			const left = mouse.pos.x + inspector_grab_btn_offset - inspector_width;
			const top = mouse.pos.y - 20;

			this.inspector_pos.x = left;
			this.inspector_pos.y = top;
		} else {
			if (this.inspector_sticks_to_right_size) {
				this.inspector_pos.x = max_x;
			}
		}

		this.inspector_pos.x = clamp(
			//content_wrapper_rect.left +
			safe_off,
			this.inspector_pos.x,
			max_x
		);
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

		this.inspectorGrabbed();

		const piep_editor_rect = this.container.getBoundingClientRect();
		const alternative_scroll_panel_left = piep_editor_rect.left;
		const alternative_scroll_panel_top = piep_editor_rect.top - this.content_scroll.scrollTop;

		this.alternative_scroll_panel.style.transform = `translate(
            ${alternative_scroll_panel_left.toPrecision(5)}px,
            ${alternative_scroll_panel_top.toPrecision(5)}px
        )`;

		requestAnimationFrame(() => {
			this.mainLoop();
		});
	}

	grabBlock() {
		this.float_focus.classList.add("hidden");
		this.float_menu.classList.add("hidden");
		this.cursor.classList.add("hidden");
		this.container.classList.add("grabbed_block");
		this.container.classList.remove("has_insert_pos");
		this.parent_float_focus.classList.add("hidden");

		this.grabbed_block_vid = this.focus_node_vid;

		this.grabbed_block_wrapper._set_content(this.getFocusNode().outerHTML);
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

		const piep_editor_rect = this.container.getBoundingClientRect();

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

			left += -piep_editor_rect.left;
			top += this.content_scroll.scrollTop - piep_editor_rect.top;

			return { left, top };
		};

		this.content._children(".blc").forEach((blc) => {
			if (blc._parent(this.getNodeSelector(this.grabbed_block_vid))) {
				// just no baby
				return;
			}

			const blc_vid = +blc.dataset.vid;

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
				grabbed_node_copy.insert = true;

				near_v_node_data.v_nodes.splice(ind, 0, grabbed_node_copy);
			};

			/**
			 *
			 * @param {-1 | 1} dir
			 */
			const insertOnSides = (dir) => {
				const grabbed_v_node_data = this.getVDomNodeDataById(this.v_dom_overlay, this.grabbed_block_vid);
				const near_v_node_data = this.getVDomNodeDataById(this.v_dom_overlay, blc_vid);

				let ind = near_v_node_data.index;

				/** @type {vDomNode} */
				const grabbed_node_copy = cloneObject(grabbed_v_node_data.v_node);
				grabbed_node_copy.insert = true;

				// actually here we should have block / inline-block checking, blocks can be wrapped,
				// text not so, unless what we place nearby is also a block?
				let wrap_with_a_flex = false;
				if (near_v_node_data.v_node.text === undefined) {
					wrap_with_a_flex = true;
				}
				const parent_v_node = near_v_node_data.parent_v_nodes[0];
				if (parent_v_node) {
					const parent_display = parent_v_node.styles.display;
					if (parent_display === "flex") {
						wrap_with_a_flex = false;
					}
				}

				if (wrap_with_a_flex) {
					/** @type {vDomNode} */
					const insert_container = {
						tag: "div",
						attrs: {},
						children: [near_v_node_data.v_node],
						classes: [],
						id: this.getPiepEditorId(),
						styles: { display: "flex" },
					};
					// TODO: check if parent is a flex already

					if (dir === 1) {
						insert_container.children.push(grabbed_node_copy);
					} else {
						insert_container.children.unshift(grabbed_node_copy);
					}

					near_v_node_data.v_nodes.splice(ind, 1, insert_container);
				} else {
					if (dir === 1) {
						ind++;
					}

					near_v_node_data.v_nodes.splice(ind, 0, grabbed_node_copy);
				}
			};

			const insertInside = () => {
				/** @type {vDomNode} */
				const grabbed_node_copy = cloneObject(this.findNodeInVDomById(this.v_dom_overlay, this.grabbed_block_vid));
				grabbed_node_copy.insert = true;

				this.findNodeInVDomById(this.v_dom_overlay, blc_vid).children.push(grabbed_node_copy);
			};

			const near_v_node_data = this.getVDomNodeDataById(this.v_dom_overlay, blc_vid);

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

			let do_up_and_down = true;
			if (near_v_node_data.v_node.text !== undefined) {
				do_up_and_down = false;
			}
			const parent_v_node = near_v_node_data.parent_v_nodes[0];
			if (parent_v_node) {
				const parent_display = parent_v_node.styles.display;
				if (parent_display === "flex") {
					do_up_and_down = false;
				}
			}
			if (do_up_and_down) {
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
					(blc_a_rect.left * weight_a) / weight + (blc_b_rect.left * weight_b) / weight + blc_a_rect.width * 0.5 - piep_editor_rect.left,
					(blc_a_rect.top * weight_a) / weight +
						(blc_b_rect.top * weight_b) / weight +
						blc_a_rect.height * 0.5 -
						piep_editor_rect.top +
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
		this.container.classList.remove("has_insert_pos");
		this.float_focus.classList.add("hidden");
		this.float_multi_insert.classList.add("hidden");
		this.parent_float_focus.classList.add("hidden");

		this.content.style.minHeight = "";

		this.alternative_scroll_panel._children(".insert_blc").forEach((insert_blc) => {
			insert_blc.remove();
		});

		if (this.current_insert_blc) {
			// use whatever the user have seen already, smooth UX
			this.v_dom.splice(0, this.v_dom.length);
			deepAssign(this.v_dom, this.v_dom_overlay);

			// remove grabbed block that was just hidden so far
			const grabbed_v_node_data = this.getVDomNodeData(this.v_dom, (v_node) => !v_node.insert && v_node.id === this.grabbed_block_vid);
			grabbed_v_node_data.v_nodes.splice(grabbed_v_node_data.index, 1);

			const v_node_with_insert = this.findNodeInVDom(this.v_dom, (v_node) => v_node.insert);
			if (v_node_with_insert) {
				v_node_with_insert.insert = false;
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

	updateCursorPosition() {
		if (mouse.target) {
			if (this.just_clicked) {
				const click_blc = mouse.target._parent(".blc");
				if (click_blc) {
					const click_blc_vid = +click_blc.dataset.vid;
					const click_v_node = this.findNodeInVDomById(this.v_dom, click_blc_vid);
					if (click_v_node && click_v_node.text === undefined) {
						this.setFocusNode(click_blc_vid);
						removeSelection();
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
			const piep_editor_rect = this.container.getBoundingClientRect();

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

			this.cursor.style.left = cursor_left - cursor_width * 0.5 - piep_editor_rect.left + "px";
			this.cursor.style.top = cursor_top - cursor_height * 0.5 - piep_editor_rect.top + "px";
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
		if (this.grabbed_block_vid !== undefined) {
			return;
		}

		let just_changed_focus_vid = this.focus_node_vid !== vid;
		this.focus_node_vid = vid;

		const focus_node = this.getNode(vid);
		let tblc;

		if (just_changed_focus_vid) {
			this.filterMenu();
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
		const v_node = this.findNodeInVDomById(this.v_dom, this.focus_node_vid);

		if (!v_node) {
			return;
		}

		// will take everything, even hidden items
		this.container._children("[data-blc_prop]").forEach((input) => {
			const prop_str = input.dataset.blc_prop;
			let prop_val;

			if (prop_str.startsWith("style.")) {
				prop_val = v_node.styles[prop_str.substring("style.".length)];
			}

			if (prop_str.startsWith("attr.")) {
				prop_val = v_node.attrs[prop_str.substring("attr.".length)];
			}

			let val = def(prop_val, "");
			input._set_value(val, { quiet: true });
		});
	}

	filterMenu() {
		/** @type {cmsEditableGroupEnum} */
		const group = this.filter_blc_menu._get_value();

		const focus_node = this.getNode(this.focus_node_vid);
		const v_node = focus_node ? this.findNodeInVDomById(this.v_dom, +focus_node.dataset.vid) : undefined;

		if (v_node) {
			this.editable_props.forEach((prop) => {
				const blc_prop_wrapper = this.blc_menu._child(`[data-blc_prop_wrapper="${prop.name}"]`);
				if (!blc_prop_wrapper) {
					return;
				}

				let visible = true;
				if (prop.match_tag) {
					visible = !!v_node.tag.match(prop.match_tag);
				}

				if (visible && group !== "all") {
					visible = prop.groups.includes(group);
				}

				blc_prop_wrapper.classList.toggle("hidden", !visible);
			});
		}

		this.blc_menu._child(".blc_menu_scroll_panel").classList.toggle("hidden", !v_node);
		this.blc_menu._child(".case_blc_menu_empty").classList.toggle("hidden", !!v_node);

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
		const piep_editor_rect = this.container.getBoundingClientRect();

		this.float_focus._set_absolute_pos(focus_node_rect.left - 1 - piep_editor_rect.left, focus_node_rect.top - 1 - piep_editor_rect.top);

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
		const piep_editor_rect = this.container.getBoundingClientRect();
		const piep_editor_float_menu_rect = this.float_menu.getBoundingClientRect();

		this.float_focus._set_absolute_pos(focus_node_rect.left - 1 - piep_editor_rect.left, focus_node_rect.top - 1 - piep_editor_rect.top);

		let left = focus_node_rect.left + (focus_node_rect.width - piep_editor_float_menu_rect.width) / 2;
		let top = focus_node_rect.top - piep_editor_float_menu_rect.height - 1;

		const safe_off = 5;
		left = clamp(
			content_wrapper_rect.left + safe_off,
			left,
			content_wrapper_rect.left + content_wrapper_rect.width - piep_editor_float_menu_rect.width - safe_off
		);
		// DUDE, the top should actually change by sum of heights
		if (top < safe_off) {
			top += focus_node_rect.height + piep_editor_float_menu_rect.height + 2;
		}
		//top = clamp(safe_off, top, piep_editor_rect.height - safe_off);

		const off = 5;

		this.float_menu._set_absolute_pos(left - piep_editor_rect.left, top - piep_editor_rect.top);
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
