/* js[piep_cms] */

class PiepCMSClipboard {
	/**
	 *
	 * @param {PiepCMS} piep_cms
	 */
	constructor(piep_cms) {
		this.piep_cms = piep_cms;
	}

	init() {
		this.container = this.piep_cms.clipboard_menu;
		this.container.classList.add("keeps_text_selection");
		this.container._set_content(
			html`
				<div class="clipboard_items scroll_panel scroll_shadow">
					<div class="clipboard_items_wrapper"></div>
					<div class="clipboard_item_actions">
						<button class="btn transparent" data-type="block" data-tooltip="Skopiuj jako blok">
							<i class="square_icon"></i>
						</button>
						<button class="btn transparent" data-type="cursor" data-tooltip="Wstaw w pozycji kursora">
							<!-- <i class="fas fa-font"></i> -->
							<i class="fas fa-i-cursor"></i>
						</button>
						<button class="btn transparent" data-type="delete" data-tooltip="Usuń element">
							<i class="fas fa-trash"></i>
						</button>
					</div>
				</div>
			`
		);
		this.clipboard_items = this.container._child(".clipboard_items");
		this.clipboard_items_wrapper = this.container._child(".clipboard_items_wrapper");
		this.clipboard_item_actions = this.container._child(".clipboard_item_actions");

		this.animate_copy_icon = $(document.createElement("i"));
		this.animate_copy_icon.classList.add("fas", "fa-copy", "animate_copy_icon");
		this.piep_cms.container.append(this.animate_copy_icon);

		this.clipboard_item_actions.classList.add("hidden");

		this.initPaste();

		document.addEventListener("visibilitychange", () => {
			if (!document.hidden) {
				this.update();
			}
		});

		this.clipboard_item_actions.addEventListener("click", (ev) => {
			const target = $(ev.target);

			const btn = target._parent(`[data-type]`);
			if (btn) {
				const index = +this.clipboard_item_active.dataset.index;
				const piep_cms_clipboard = this.getClipboardItems();
				const clipboard_item = piep_cms_clipboard[index];

				const type = btn.dataset.type;
				if (type === "cursor") {
					this.container.classList.remove("visible");
					this.piep_cms.insertVNodeAtCursor(clipboard_item.v_node);
				} else if (type === "block") {
					this.container.classList.remove("visible");
					this.piep_cms.grabBlockFromVNode(clipboard_item.v_node);
				} else if (type === "delete") {
					piep_cms_clipboard.splice(index, 1);
					this.save(piep_cms_clipboard);
				}
			}
		});

		this.update();
	}

	/**
	 *
	 * @param {{
	 * restore_selection?: boolean
	 * }} options
	 * @returns
	 */
	copyTextSelection(options = {}) {
		const piep_cms = this.piep_cms;
		if (!piep_cms.text_selection) {
			return;
		}

		const text_selection_copy = cloneObject(piep_cms.text_selection);

		const range = document.createRange();

		/** @type {number} */
		let start_vid;
		/** @type {number} */
		let start_offset;
		/** @type {number} */
		let end_vid;
		/** @type {number} */
		let end_offset;

		if (piep_cms.text_selection.direction === 1) {
			start_vid = piep_cms.text_selection.anchor_vid;
			start_offset = piep_cms.text_selection.anchor_offset;
			end_vid = piep_cms.text_selection.focus_vid;
			end_offset = piep_cms.text_selection.focus_offset;
		} else {
			start_vid = piep_cms.text_selection.focus_vid;
			start_offset = piep_cms.text_selection.focus_offset;
			end_vid = piep_cms.text_selection.anchor_vid;
			end_offset = piep_cms.text_selection.anchor_offset;
		}

		const start_node = piep_cms.getNode(start_vid);
		const end_node = piep_cms.getNode(end_vid);
		const start_textable = start_node.classList.contains("textable");
		const end_textable = end_node.classList.contains("textable");
		range.setStart(start_textable ? getTextNode(start_node) : start_node, start_textable ? start_offset : 0);
		range.setEnd(end_textable ? getTextNode(end_node) : end_node, end_textable ? end_offset : 0);
		this.setLastCopiedHTML([...range.cloneContents().children].map((c) => c.outerHTML).join(""));
		copyRangeToClipboard(range);

		if (options.restore_selection) {
			setTimeout(() => {
				piep_cms.text_selection = text_selection_copy;
				piep_cms.setDummySelection();
			});
		}
	}

	/**
	 * Returns true if there is any selection
	 *
	 * @param {PiepNode} src
	 * @returns
	 */
	copyWhateverIsSelected(src = undefined) {
		const piep_cms = this.piep_cms;

		const v_node = piep_cms.getVNodeById(piep_cms.focus_node_vid);

		if (!v_node) {
			return false;
		}

		const text_selection = piep_cms.text_selection;
		if (text_selection) {
			const all_vids = piep_cms.getAllTextSelectionVids();
			if (text_selection.direction === -1) {
				all_vids.reverse();
			}

			/** @type {vDomNode} */
			const temporary_wrapper = {
				tag: "div",
				id: -1,
				children: [],
				styles: {},
				classes: ["temporary_wrapper"],
				attrs: {},
			};

			const fuck_ids = [];

			all_vids.forEach((vid) => {
				const v_node_data = piep_cms.getVNodeDataById(vid);
				if (!v_node_data) {
					return;
				}
				const parent_v_node = v_node_data.parent_v_nodes[0];
				if (parent_v_node && !fuck_ids.includes(parent_v_node.id)) {
					fuck_ids.push(parent_v_node.id);
					/** @type {vDomNode} */
					const pvn = cloneObject(parent_v_node);
					temporary_wrapper.children.push(pvn);

					pvn.children = pvn.children.filter((c) => all_vids.includes(c.id));
					pvn.children.forEach((c) => {
						const partial_range = text_selection.partial_ranges.find((e) => e.vid === c.id);
						if (partial_range) {
							c.text = c.text.substring(partial_range.start, partial_range.end);
						}
					});
				}
			});

			this.copyItem(temporary_wrapper);
		} else {
			this.copyItem(v_node);
		}

		if (src) {
			this.animate(src);
		}
		return true;
	}

	initPaste() {
		const piep_cms = this.piep_cms;
		piep_cms.container.addEventListener("paste", (ev) => {
			if (!piep_cms.content_active || !piep_cms.text_selection) {
				return;
			}

			ev.preventDefault();

			const pasted_html = ev.clipboardData.getData("text/html");
			const pasted_text = ev.clipboardData.getData("text/plain");

			const match_vids = /blc_\d*/g;
			const last_copied_html = this.getLastCopiedHTML();
			/**
			 *
			 * @param {string} html_str
			 * @returns
			 */
			const getHTMLToken = (html_str) => {
				const matches = html_str.match(match_vids);
				if (!matches) {
					return "";
				}
				return matches.join("");
			};
			const pasted_last_clipboard_item = last_copied_html ? getHTMLToken(pasted_html).includes(getHTMLToken(last_copied_html)) : false;

			piep_cms.removeTextInSelection();

			if (pasted_text && !pasted_html) {
				// maybe do the split dude, but it's unnecessary now
				piep_cms.insertText(pasted_text.replace(/[\n\r]/g, ""));
				return;
			}

			if (!pasted_html) {
				return;
			}

			piep_cms.paste_html._set_content(pasted_html);

			/** @type {vDomNode[]} */
			const insert = [];

			const next_vid = piep_cms.breakTextAtCursor();

			let new_id = piep_cms.getNewBlcId();

			if (pasted_last_clipboard_item) {
				const first_clipboard_item = this.getClipboardItems()[0];
				if (first_clipboard_item) {
					/** @type {vDomNode} */
					let clipboard_v_node = cloneObject(first_clipboard_item.v_node);
					piep_cms.setNewIdsOnVNode(clipboard_v_node);
					if (clipboard_v_node.classes.includes("temporary_wrapper")) {
						insert.push(...clipboard_v_node.children);
					} else {
						insert.push(clipboard_v_node);
					}
				}
			} else {
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

				traverseNode(piep_cms.paste_html);
			}

			const next_v_node_data = piep_cms.getVNodeDataById(next_vid);
			const next_v_node = next_v_node_data.v_node;
			const prev_v_node = next_v_node_data.v_nodes[next_v_node_data.index - 1];
			next_v_node_data.v_nodes.splice(next_v_node_data.index, 0, ...insert);

			piep_cms.update({ all: true });

			// const first_insert_v_node = insert[0];
			// if (first_insert_v_node) {
			// 	console.log(prev_v_node, first_insert_v_node);
			// 	if (piep_cms.isTextContainer(prev_v_node) && piep_cms.isTextContainer(first_insert_v_node)) {
			// 		console.log("YEAH");
			// 		const first_textable = first_insert_v_node.children[0];

			// 		piep_cms.text_selection.focus_vid = first_textable.id;
			// 		piep_cms.text_selection.focus_offset = 0;
			// 		piep_cms.collapseTextSelection();

			// 		piep_cms.deleteAction(-1);
			// 	}
			// }

			// const last_insert_v_node = insert[insert.length - 1];
			// if (last_insert_v_node) {
			// 	if (piep_cms.isTextContainer(next_v_node) && piep_cms.isTextContainer(last_insert_v_node)) {
			// 		const first_textable = last_insert_v_node.children[0];

			// 		piep_cms.text_selection.focus_vid = first_textable.id;
			// 		piep_cms.text_selection.focus_offset = 0;
			// 		piep_cms.collapseTextSelection();

			// 		piep_cms.deleteAction(-1);
			// 	}
			// }

			piep_cms.manageText();
		});
	}

	/**
	 *
	 * @param {PiepNode} src
	 */
	animate(src) {
		const src_rect = src.getBoundingClientRect();
		const clipboard_btn_wrapper_rect = this.piep_cms.clipboard_btn_wrapper.getBoundingClientRect();

		animate(
			this.animate_copy_icon,
			`
                0% {
                    transform: translate(${src_rect.left + src_rect.width * 0.5}px,
                    ${src_rect.top + src_rect.height * 0.5}px) translate(-50%, -50%);
                }
                100% {
                    transform: translate(${clipboard_btn_wrapper_rect.left + clipboard_btn_wrapper_rect.width * 0.5}px,
                    ${clipboard_btn_wrapper_rect.top + clipboard_btn_wrapper_rect.height * 0.5}px) translate(-50%, -50%);
                }
            `,
			400
		);

		setTimeout(() => {
			this.piep_cms.clipboard_btn.classList.add("jump");
		}, 300);
		setTimeout(() => {
			this.piep_cms.clipboard_btn.classList.remove("jump");
		}, 450);
	}

	getClipboardItems() {
		/** @type {CmsClipboarItem[]} */
		let piep_cms_clipboard;
		const piep_cms_clipboard_2137_json = localStorage.getItem("piep_cms_clipboard_2137_json");
		try {
			piep_cms_clipboard = JSON.parse(piep_cms_clipboard_2137_json);
		} catch (e) {}

		if (!piep_cms_clipboard) {
			piep_cms_clipboard = [];
		}

		return piep_cms_clipboard;
	}

	/**
	 *
	 * @param {vDomNode} v_node
	 */
	copyItem(v_node) {
		const piep_cms_clipboard = this.getClipboardItems();
		piep_cms_clipboard.unshift({ v_node: cloneObject(v_node) }); // lose ref to prevent bugs
		const max = 10;
		if (piep_cms_clipboard.length > max) {
			piep_cms_clipboard.splice(max, piep_cms_clipboard.length - max);
		}
		this.save(piep_cms_clipboard);
	}

	/**
	 *
	 * @param {CmsClipboarItem[]} clipboard_items
	 */
	save(clipboard_items) {
		localStorage.setItem("piep_cms_clipboard_2137_json", JSON.stringify(clipboard_items));
		this.update();
	}

	setLastCopiedHTML(copied_html) {
		localStorage.setItem("piep_cms_clipboard_last_html", copied_html);
	}

	getLastCopiedHTML() {
		return localStorage.getItem("piep_cms_clipboard_last_html");
	}

	update() {
		this.recreateDom();
		lazyLoadImages();
	}

	/**
	 *
	 * @param {{
	 * vids?: number[]
	 * }} options
	 */
	recreateDom(options = {}) {
		/**
		 *
		 * @param {PiepNode} put_in_node
		 * @param {vDomNode[]} v_nodes
		 */
		const traverseVDom = (put_in_node, v_nodes) => {
			v_nodes.forEach((v_node, index) => {
				const vid = v_node.id;
				const blc_schema = piep_cms_manager.getVNodeSchema(v_node);
				const children = v_node.children;

				let render_tag = v_node.tag;

				const node = $(document.createElement(render_tag));

				let care_about_children = true;

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

				if (!options.vids || options.vids.includes(vid)) {
					const text = v_node.text;

					// classes
					if (v_node.module_name) {
						const module_class = `module_${v_node.module_name}`;
						if (!v_node.classes.includes(module_class)) {
							v_node.classes.push(module_class);
						}
					}

					let classes = ["blc", ...v_node.classes];

					if (put_in_node.classList.contains("text_container")) {
						classes.push("in_text_container");
					}

					if (this.piep_cms.isTextContainer(v_node)) {
						classes.push("text_container");
					}

					if (text !== undefined) {
						node._set_content(text);

						let content = text;
						if (text === "" && v_nodes.length === 1) {
							content = "<br>";
						}
						node._set_content(content);

						classes.push("textable");
					}

					// attrs
					const attrs = {};
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

					// styles
					const df_styles = v_node.styles.df;
					if (df_styles) {
						let node_styles = "";
						Object.entries(df_styles).map(([prop, val]) => {
							if (!prop.startsWith("--")) {
								prop = kebabCase(prop);
							}
							node_styles += `${prop}: ${val.replace(/\*$/, "")};`;
						});
						node.setAttribute("style", node_styles);
					}

					if (blc_schema) {
						if (blc_schema.backend_render || blc_schema.place_node) {
							node._set_content(html`<div class="we_wont_render">${blc_schema.icon} ${blc_schema.label}</div>`);
							care_about_children = false;
						} else {
							if (blc_schema.render_html) {
								node._set_content(blc_schema.render_html(v_node));
							}

							if (blc_schema.render) {
								blc_schema.render(v_node, node, this.piep_cms);
							}
						}
					}

					if (!care_about_children) {
						const module_class = `module_${v_node.module_name}`;
						const ind = classes.indexOf(module_class);
						if (ind !== -1) {
							classes.splice(ind, 1);
						}
					}

					setNodeClasses(node, classes);

					put_in_node.append(node);
				}

				if (care_about_children && children) {
					traverseVDom(node, children);
				}
			});
		};

		this.clipboard_items_wrapper._empty();

		const ci = this.getClipboardItems();
		ci.forEach((e, index) => {
			const item = $(document.createElement("DIV"));

			item.classList.add("clipboard_item", "global_root");
			item.dataset.index = index + "";

			this.clipboard_items_wrapper.append(item);
			traverseVDom(item, [e.v_node]);
		});

		if (ci.length === 0) {
			this.clipboard_items_wrapper._set_content(html` <div class="semi_bold">Brak elementów w schowku</div> `);
		}
	}

	mouseMove() {
		let show_menu = false;
		const was_menu_visible = this.container.classList.contains("visible");
		const hover_menu =
			mouse.target && (!!mouse.target._parent(this.piep_cms.clipboard_btn_wrapper) || !!mouse.target._parent(this.container));

		if (this.piep_cms.selected_resolution === "df" && hover_menu && !this.piep_cms.grabbed_v_node) {
			show_menu = true;
			if (this.hide_clipboard_menu_timeout) {
				clearTimeout(this.hide_clipboard_menu_timeout);
				this.hide_clipboard_menu_timeout = undefined;
			}
		} else {
			if (!this.hide_clipboard_menu_timeout && was_menu_visible) {
				this.hide_clipboard_menu_timeout = setTimeout(() => {
					show_menu = false;
					this.hide_clipboard_menu_timeout = undefined;
					this.container.classList.remove("visible");
				}, 300);
			}
		}

		if (mouse.target && !mouse.target._parent(this.clipboard_item_actions)) {
			const clipboard_item = mouse.target._parent(".clipboard_item");

			removeClasses(".active", ["active"], this.clipboard_items);
			if (clipboard_item) {
				clipboard_item.classList.add("active");
			}
			this.clipboard_item_actions.classList.toggle("hidden", !clipboard_item);

			if (this.clipboard_item_active !== clipboard_item) {
				this.clipboard_item_active = clipboard_item;
				if (clipboard_item) {
					this.clipboard_item_actions._set_absolute_pos(0, 0);

					const clipboard_items_wrapper_rect = this.clipboard_items_wrapper.getBoundingClientRect();
					const clipboard_item_rect = clipboard_item.getBoundingClientRect();

					const padding = 10;
					this.clipboard_item_actions._set_absolute_pos(
						clipboard_item_rect.left +
							1 * (clipboard_item_rect.width - this.clipboard_item_actions.offsetWidth) -
							clipboard_items_wrapper_rect.left +
							padding,
						clipboard_item_rect.top +
							1 * (clipboard_item_rect.height - this.clipboard_item_actions.offsetHeight) -
							clipboard_items_wrapper_rect.top +
							padding
					);
				}
			}
		}

		if (show_menu) {
			if (!was_menu_visible) {
				// display
				this.container.classList.add("visible");
				this.container._set_absolute_pos(0, 0);

				const clipboard_btn_rect = this.piep_cms.clipboard_btn.getBoundingClientRect();
				const clipboard_menu_rect = this.container.getBoundingClientRect();

				const left = clipboard_btn_rect.left - clipboard_menu_rect.width;
				const top = clipboard_btn_rect.top; // - 1; // -1 to make it pretty

				this.container._set_absolute_pos(left, top);

				this.clipboard_items.scrollTop = 0;
			}
		}

		this.piep_cms.clipboard_btn.style.setProperty("--btn-background-clr", show_menu ? "#eee" : "");
	}
}
