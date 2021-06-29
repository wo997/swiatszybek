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
						<button class="btn transparent" data-type="cursor"><i class="fas fa-font"></i> Wstaw w pozycji kursora</button>
						<button class="btn transparent" data-type="block"><i class="square_icon"></i> Skopiuj jako blok</button>
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

		document.addEventListener("visibilitychange", () => {
			if (!document.hidden) {
				this.update();
			}
		});

		this.clipboard_item_actions.addEventListener("click", (ev) => {
			const target = $(ev.target);

			const type = target._parent(`[data-type]`);
			if (type) {
				const clipboard_item = this.getClipboardItems()[+this.clipboard_item_active.dataset.index];

				this.container.classList.remove("visible");

				if (type.dataset.type === "cursor") {
					this.piep_cms.insertVNodeAtCursor(clipboard_item.v_node);
				} else {
					this.piep_cms.grabBlockFromVNode(clipboard_item.v_node);
				}
			}
		});

		this.update();
	}

	/**
	 * Returns true if there is any selection
	 *
	 * @param {PiepNode} src
	 * @returns
	 */
	copyWhateverIsSelected(src = undefined) {
		const piep_cms = this.piep_cms;

		const v_node = piep_cms.getVNodeById(this.piep_cms.focus_node_vid);

		if (!v_node) {
			return false;
		}

		if (piep_cms.text_selection) {
			const v_node_data = piep_cms.getVNodeDataById(this.piep_cms.text_selection.focus_vid);
			const v_node = v_node_data.v_node;
			const parent_v_node = v_node_data.parent_v_nodes[0];
			if (parent_v_node && piep_cms.isTextContainer(parent_v_node)) {
				this.copyItem(parent_v_node);
			}
		} else {
			this.copyItem(v_node);
		}

		if (src) {
			this.animate(src);
		}
		return true;
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
			300
		);

		setTimeout(() => {
			this.piep_cms.clipboard_btn.classList.add("jump");
		}, 200);
		setTimeout(() => {
			this.piep_cms.clipboard_btn.classList.remove("jump");
		}, 350);
	}

	getClipboardItems() {
		/** @type {CmsClipboarItem[]} */
		let piep_cms_clipboard;
		const piep_cms_clipboard_x_json = localStorage.getItem("piep_cms_clipboard_x_json");
		try {
			piep_cms_clipboard = JSON.parse(piep_cms_clipboard_x_json);
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
		piep_cms_clipboard.unshift({ v_node });
		const max = 10;
		if (piep_cms_clipboard.length > max) {
			piep_cms_clipboard.splice(max, piep_cms_clipboard.length - max);
		}
		localStorage.setItem("piep_cms_clipboard_x_json", JSON.stringify(piep_cms_clipboard));
		this.update();
	}

	setLastCopiedHTML(copied_html) {
		console.log(copied_html);
		localStorage.setItem("piep_cms_clipboard_last_html", copied_html);
	}

	getLastCopiedHTML() {
		return localStorage.getItem("piep_cms_clipboard_last_html");
	}

	update() {
		this.recreateDom();
	}

	/**
	 *
	 * @param {{
	 * vids?: number[]
	 * }} options
	 */
	recreateDom(options = {}) {
		//this.preRecreateDom();

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
						//console.log("textable", node, text);
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
								if (blc_schema.render_html) {
									node._set_content(blc_schema.render_html(v_node));
								}
								if (blc_schema.backend_render) {
									piep_cms_manager.requestRender(vid);
								}

								if (node._is_empty() && v_node.rendered_body !== undefined) {
									node._set_content(v_node.rendered_body);
								}
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
					// clean up text nodes if any existed - that might be... an unnecessary step?
					node.childNodes.forEach((c) => {
						if (c.nodeType === Node.TEXT_NODE) {
							c.remove();
						}
					});

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

					this.clipboard_item_actions._set_absolute_pos(
						clipboard_item_rect.left +
							clipboard_item_rect.width -
							clipboard_items_wrapper_rect.left -
							this.clipboard_item_actions.offsetWidth +
							10,
						clipboard_item_rect.top - clipboard_items_wrapper_rect.top + 10
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
