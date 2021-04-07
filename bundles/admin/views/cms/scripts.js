/* js[view] */

/**
 * @typedef {{
 * _insert_action()
 * } & PiepNode} insertBlc
 */

/** @type {PiepNode} */
let piep_editor;
/** @type {PiepNode} */
let piep_editor_cursor;
/** @type {PiepNode} */
let piep_editor_content;
/** @type {PiepNode} */
let piep_editor_float_menu;
/** @type {PiepNode} */
let piep_editor_float_focus;
/** @type {PiepNode} */
let piep_editor_advanced_menu;
/** @type {PiepNode} */
let piep_editor_styles;
/** @type {Selection} */
let piep_editor_last_selection;
/** @type {boolean} */
let piep_editor_content_active;
/** @type {boolean} */
let piep_editor_cursor_active;
/** @type {boolean} */
let piep_editor_float_menu_active;
/** @type {PiepNode} */
let piep_editor_inspector_tree;
/** @type {number} */
let piep_focus_node_vid;
/** @type {number} */
let piep_editor_grabbed_block_vid;
/** @type {PiepNode} */
let piep_editor_grabbed_block_wrapper;
/** @type {DOMRect} */
let piep_editor_grabbed_block_wrapper_rect;
/** @type {vDomNode} */
let v_dom_overlay;
/** @type {insertBlc} */
let piep_editor_current_insert_blc;

const single_tags = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"];

/**
 * @typedef {{
 * id: number
 * tag: string
 * text: string
 * styles: any
 * children: vDomNode[]
 * attrs: object
 * classes: string[]
 * insert?: boolean
 * }} vDomNode
 */

/** @type {vDomNode} */
let v_dom = {
	tag: "div",
	id: 0,
	text: undefined,
	styles: { display: "flex", flexDirection: "column" },
	attrs: {},
	classes: [],
	children: [
		{
			id: 1,
			tag: "h1",
			text: "Dobry frejmwork",
			styles: { fontSize: "20px", fontWeight: "bold", color: "#d5d" },
			children: undefined,
			attrs: {},
			classes: [],
		},
		{
			id: 2,
			tag: "p",
			text:
				"Wirtualny DOM krul. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
			styles: { marginTop: "20px" },
			children: undefined,
			attrs: {},
			classes: [],
		},
		{
			id: 10,
			tag: "img",
			text: undefined,
			styles: { width: "100%" },
			children: undefined,
			attrs: {
				"data-src": "/uploads/-/2021-04-02-19-41-1_559x377.jpg",
			},
			classes: ["wo997_img"],
		},
		{
			id: 3,
			tag: "div",
			text: undefined,
			styles: {},
			children: [
				{ id: 4, tag: "p", text: "dziecko 1", children: undefined, styles: {}, attrs: {}, classes: [] },
				{ id: 8, tag: "p", text: "", children: undefined, styles: {}, attrs: {}, classes: [] },
				{
					id: 5,
					tag: "p",
					text: undefined,
					children: [
						{ id: 6, tag: "span", text: "dziecko 2.1", children: undefined, styles: {}, attrs: {}, classes: [] },
						{ id: 7, tag: "span", text: "dziecko 2.2", children: undefined, styles: {}, attrs: {}, classes: [] },
					],
					styles: {},
					attrs: {},
					classes: [],
				},
			],
			attrs: {},
			classes: [],
		},
		{
			id: 9,
			tag: "div",
			text: undefined,
			styles: {
				backgroundColor: "red",
				padding: "20px",
			},
			children: undefined,
			attrs: {},
			classes: [],
		},
	],
};

function getPiepEditorId() {
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

	traversePiepHtml(v_dom.children);
	return max + 1;
}

/**
 * @param {vDomNode} target_v_dom
 */
function recreateDom(target_v_dom = undefined) {
	if (target_v_dom === undefined) {
		target_v_dom = v_dom;
	}

	// order doesn't really matter so far
	let styles_html = "";

	/**
	 *
	 * @param {vDomNode} v_node
	 * @returns
	 */
	const traverseVDom = (v_node, level = 0) => {
		let content_html = "";
		let inspector_tree_html = "";

		const children = v_node.children;
		const text = v_node.text;

		const tag = v_node.tag;
		const textable = text !== undefined;

		let attrs = { "data-vid": v_node.id };
		Object.assign(attrs, v_node.attrs);

		const base_class = getPiepEditorNodeSelector(v_node.id).replace(".", "");
		let classes = ["blc", base_class, ...v_node.classes];

		//if (level > 0) {
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

		if (text) {
			info = text;
		} else if (children !== undefined) {
			info = children.length + "";
		}

		if (info) {
			info = html`<span class="info"> - ${info}</span>`;
		}

		inspector_tree_html += html`<div class="v_node_label tblc_${v_node.id}" style="--level:${level}" data-vid="${v_node.id}">
			<span class="name">${display_name}</span>
			${info}
		</div>`;
		//}

		let body = "";
		if (textable) {
			classes.push("textable");
			if (text) {
				body += text;
			} else {
				body += `<br>`;
			}
		} else if (children !== undefined) {
			for (const child of children) {
				// traverse for styles but not contents ;)
				const { content_html: sub_content_html, inspector_tree_html: sub_inspector_tree_html } = traverseVDom(child, level + 1);

				if (child.id === piep_editor_grabbed_block_vid) {
					if (!piep_editor_current_insert_blc || !child.insert) {
						continue;
					}
				}
				body += sub_content_html;
				inspector_tree_html += sub_inspector_tree_html;
			}
		}

		const classes_csv = classes.join(" ");

		const attrs_csv = Object.entries(attrs)
			.map(([key, val]) => {
				return `${key}="${escapeAttribute(val)}"`;
			})
			.join(" ");

		if (single_tags.includes(tag)) {
			content_html += html`<${tag} class="${classes_csv}" ${attrs_csv} />`;
		} else {
			content_html += html`<${tag} class="${classes_csv}" ${attrs_csv}>${body}</${tag}>`;
		}

		if (!v_node.styles) {
			v_node.styles = {};
		}
		const styles = Object.entries(v_node.styles);
		if (styles.length > 0) {
			let node_styles = "";
			styles.forEach(([prop, val]) => {
				node_styles += `${kebabCase(prop)}: ${val};`;
			});
			styles_html += `.${base_class} { ${node_styles} }`;
		}

		return { content_html, inspector_tree_html };
	};

	const { content_html, inspector_tree_html } = traverseVDom(target_v_dom);

	piep_editor_content._set_content(content_html);

	piep_editor_styles._set_content(styles_html);

	piep_editor_inspector_tree._set_content(inspector_tree_html, { maintain_height: true });

	lazyLoadImages({ duration: 0 });
	registerForms();
}

/**
 *
 * @param {vDomNode} v_dom
 * @param {number} vid
 * @returns
 */
function findNodeInVDom(v_dom, vid) {
	const node_data = getVDomNodeData(v_dom, vid);
	if (!node_data) {
		return undefined;
	}
	return node_data.node;
}

/**
 *
 * @param {vDomNode} v_dom
 * @param {number} vid
 * @returns {{
 * node: vDomNode,
 * children: vDomNode[],
 * index: number,
 * }}
 */
function getVDomNodeData(v_dom, vid) {
	if (vid === 0) {
		return {
			node: v_dom,
			children: v_dom.children,
			index: 0,
		};
	}

	if (!vid) {
		return undefined;
	}

	/**
	 *
	 * @param {vDomNode} node
	 * @returns
	 */
	const traverseVDom = (node) => {
		const children = node.children;

		if (children) {
			let index = -1;
			for (const child of children) {
				index++;
				if (child.id === vid) {
					return {
						node: child,
						children,
						index,
					};
				}
				const deep = traverseVDom(child);
				if (deep) {
					return deep;
				}
			}
		}

		return undefined;
	};

	return traverseVDom(v_dom);
}

/**
 *
 * @param {PiepNode} node
 * @param {-1 | 1} direction
 * @returns {PiepNode | undefined}
 */
function getTextable(node, direction) {
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
	if (next_node && piep_editor_content.contains(next_node)) {
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
function insertPiepText(insert_text) {
	const sel = window.getSelection();
	const focus_offset = sel.focusOffset;
	const anchor_offset = sel.anchorOffset;
	const focus_node = getPiepEditorFocusNode();
	const vid = focus_node ? +focus_node.dataset.vid : 0;
	const v_node = findNodeInVDom(v_dom, vid);
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
	recreateDom();

	const node_ref = getPiepEditorNode(vid);
	if (node_ref) {
		setSelectionByIndex(node_ref, begin_offset + insert_text.length);
	}
}

domload(() => {
	piep_editor = $(".piep_editor");
	piep_editor_content = piep_editor._child(".piep_editor_content");

	piep_editor.insertAdjacentHTML("beforeend", html`<div class="piep_editor_cursor"></div>`);
	piep_editor_cursor = piep_editor._child(".piep_editor_cursor");

	piep_editor.insertAdjacentHTML("beforeend", html`<style class="piep_editor_styles"></style>`);
	piep_editor_styles = piep_editor._child(".piep_editor_styles");

	piep_editor.insertAdjacentHTML("beforeend", html`<div class="piep_editor_grabbed_block_wrapper"></div>`);
	piep_editor_grabbed_block_wrapper = piep_editor._child(".piep_editor_grabbed_block_wrapper");

	const initInspector = () => {
		piep_editor_inspector_tree = piep_editor._child(".piep_editor_inspector .tree");
		document.addEventListener("mousemove", (ev) => {
			const target = $(ev.target);
			const v_node_label = target._parent(".v_node_label");

			removeClasses(".piep_consider_focus", ["piep_consider_focus"], piep_editor_content);
			if (v_node_label) {
				const vid = +v_node_label.dataset.vid;
				getPiepEditorNode(vid).classList.add("piep_consider_focus");
			}
		});
		document.addEventListener("click", (ev) => {
			const target = $(ev.target);
			const v_node_label = target._parent(".v_node_label");

			if (v_node_label) {
				const vid = +v_node_label.dataset.vid;
				//const v_node = findNodeInVDom(v_dom,vid);

				setSelectionRange(undefined);
				setPiepEditorCursorActive(false);
				setPiepEditorFocusNode(vid);

				// const focus_node = getPiepEditorNode(vid);
				// if (v_node.text === undefined) {
				// 	setSelectionByIndex(focus_node, 0);
				// 	piep_editor_cursor.classList.add("hidden");
				// 	setPiepEditorFocusNode(vid);
				// } else {
				// 	setSelectionByIndex(focus_node, 0, v_node.text.length);
				// }
			}
		});
	};

	initInspector();

	piep_editor.insertAdjacentHTML("beforeend", html`<div class="piep_editor_advanced_menu"></div>`);
	piep_editor_advanced_menu = piep_editor._child(".piep_editor_advanced_menu");

	piep_editor_advanced_menu._set_content(html`
		<div class="label">Margines</div>
		<select class="field small" data-style="fontSize">
			<option value=""></option>
			<option value="1rem">mała</option>
			<option value="1.5rem">średnia</option>
			<option value="2rem">duża</option>
		</select>
	`);

	piep_editor.insertAdjacentHTML("beforeend", html`<div class="piep_editor_float_focus hidden"></div>`);
	piep_editor_float_focus = piep_editor._child(".piep_editor_float_focus");

	piep_editor.insertAdjacentHTML("beforeend", html`<div class="piep_editor_float_menu hidden"></div>`);
	piep_editor_float_menu = piep_editor._child(".piep_editor_float_menu");

	piep_editor_float_menu._set_content(html`
		<p-dropdown class="field small inline pretty_blue center static_label grid" data-style="fontSize" data-tooltip="Rozmiar czcionki">
			<p-option data-value="">
				<span class="semi_bold"> A<span style="font-size:0.7em">A</span> </span>
			</p-option>
			<p-option data-value="1rem"><span style="font-size:1em">A</span></p-option>
			<p-option data-value="1.2rem"><span style="font-size:1.2em">A</span></p-option>
			<p-option data-value="1.4rem"><span style="font-size:1.4em">A</span></p-option>
		</p-dropdown>

		<p-dropdown class="field small inline pretty_blue center grid" data-style="fontWeight" data-tooltip="Grubość czcionki">
			<p-option data-value=""><span class="bold">B</span></p-option>
			<p-option data-value="400">B</p-option>
			<p-option data-value="600"><span class="semi_bold">B</span></p-option>
			<p-option data-value="700"><span class="bold">B</span></p-option>
		</p-dropdown>

		<p-dropdown class="field small inline pretty_blue center static_label grid" data-style="color" data-tooltip="Kolor czcionki">
			<p-option data-value=""> <i class="fas fa-paint-brush"></i> </p-option>
			<p-option data-value="var(--primary-clr)">
				<div class="color_circle" style="background:var(--primary-clr);"></div>
			</p-option>
			<p-option data-value="#000">
				<div class="color_circle" style="background:#000;"></div>
			</p-option>
			<p-option data-value="#fff">
				<div class="color_circle" style="background:#fff;"></div>
			</p-option>
			<p-option data-tooltip="Inny kolor"> <i class="fas fa-eye-dropper"></i><color-picker></color-picker> </p-option>
			<p-option data-tooltip="Zarządzaj paletą kolorów"> <i class="fas fa-cog"></i> </p-option>
		</p-dropdown>

		<p-dropdown class="field small inline pretty_blue center static_label grid" data-style="backgroundColor" data-tooltip="Kolor tła">
			<p-option data-value=""> <i class="fas fa-fill"></i> </p-option>
			<p-option data-value="var(--primary-clr)">
				<div class="color_circle" style="background:var(--primary-clr);"></div>
			</p-option>
			<p-option data-value="#000">
				<div class="color_circle" style="background:#000;"></div>
			</p-option>
			<p-option data-value="#fff">
				<div class="color_circle" style="background:#fff;"></div>
			</p-option>
			<p-option data-tooltip="Inny kolor"> <i class="fas fa-eye-dropper"></i><color-picker></color-picker> </p-option>
			<p-option data-tooltip="Zarządzaj paletą kolorów"> <i class="fas fa-cog"></i> </p-option>
		</p-dropdown>

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

	piep_editor_float_menu._children("[data-style]").forEach((input) => {
		input.addEventListener("change", () => {
			const focus_node = piep_editor_content._child(".piep_focus");
			if (focus_node) {
				const v_node = findNodeInVDom(v_dom, +focus_node.dataset.vid);
				const anchor_offset = piep_editor_last_selection.anchorOffset;
				const focus_offset = piep_editor_last_selection.focusOffset;

				if (piep_editor_last_selection.focusNode !== piep_editor_last_selection.anchorNode) {
					alert("Currently only single line editing is available");
					return;
				}

				const begin_offset = Math.min(anchor_offset, focus_offset);
				const end_offset = Math.max(anchor_offset, focus_offset);

				let val = input._get_value();
				let prop = input.dataset.style;

				const setPropOfVNode = (edit_v_node) => {
					if (val === "") {
						delete edit_v_node.styles[prop];
					} else {
						edit_v_node.styles[prop] = val;
					}
				};

				// the selection is something but not everything in the v_node
				if (anchor_offset !== focus_offset && v_node.text.length !== end_offset - begin_offset) {
					if (begin_offset > 0) {
						const bef_id = getPiepEditorId();
						v_node.children.push({
							id: bef_id,
							tag: "span",
							styles: {},
							text: v_node.text.substring(0, begin_offset),
							children: undefined,
							attrs: {},
							classes: [],
						});
					}
					const mid_vid = getPiepEditorId();
					const mid_child = {
						id: mid_vid,
						tag: "span",
						styles: {},
						text: v_node.text.substring(begin_offset, end_offset),
						children: undefined,
						attrs: {},
						classes: [],
					};
					v_node.children.push(mid_child);
					if (end_offset < v_node.text.length) {
						const aft_id = getPiepEditorId();
						v_node.children.push({
							id: aft_id,
							tag: "span",
							styles: {},
							text: v_node.text.substring(end_offset),
							children: undefined,
							attrs: {},
							classes: [],
						});
					}
					v_node.text = undefined;

					setPropOfVNode(mid_child);
					recreateDom();

					const node_ref = getPiepEditorNode(mid_vid);
					if (node_ref) {
						setSelectionByIndex(node_ref, 0, end_offset - begin_offset);
					}
				} else {
					setPropOfVNode(v_node);
					recreateDom();

					const node_ref = getPiepEditorNode(v_node.id);
					if (v_node.text === undefined) {
						setPiepEditorFocusNode(v_node.id);
					} else if (node_ref) {
						setSelectionByIndex(node_ref, begin_offset, end_offset);
					}
				}
			}
		});
	});

	piep_editor.addEventListener("paste", (e) => {
		e.preventDefault();
		// "text/html" is cool but dont use it yet
		const text = e.clipboardData.getData("text/plain");
		// this text can contain html cool
		//console.log(text);
		insertPiepText(text);
	});

	document.addEventListener("click", (ev) => {
		const target = $(ev.target);

		if (piep_editor_grabbed_block_vid !== undefined) {
			piepEditorReleaseBlock();
		}

		const content_active = !!(target._parent(piep_editor_content) || target._parent(".v_node_label"));
		setPiepEditorContentActive(content_active);

		const click_blc = target._parent(".blc");
		if (click_blc) {
			setPiepEditorFocusNode(+click_blc.dataset.vid);
			removeSelection();
		}

		// order matters
		updatePiepCursorPosition();

		if (target._parent(".move_block_btn")) {
			piepEditorGrabBlock();
		}

		if (target._parent(".remove_block_btn")) {
			const v_node_data = getVDomNodeData(v_dom, piep_focus_node_vid);
			v_node_data.children.splice(v_node_data.index, 1);
			recreateDom();
			setPiepEditorFocusNode(undefined);
		}

		if (target._parent(piep_editor)) {
			piep_editor_float_menu_active = !!(content_active || target._parent(piep_editor_float_menu) || target._parent(".picker_wrapper"));
			if (target._parent(".hide_menu_btn") || !piep_focus_node_vid || piep_editor_grabbed_block_vid !== undefined) {
				piep_editor_float_menu_active = false;
			}

			piep_editor_float_menu.classList.toggle("hidden", !piep_editor_float_menu_active);
		}
	});

	piep_editor_content.addEventListener("mousemove", (ev) => {
		updatePiepCursorPosition();
	});

	document.addEventListener("keydown", (ev) => {
		const sel = window.getSelection();
		const focus_node = getPiepEditorFocusNode();
		const focus_offset = sel.focusOffset;
		const vid = focus_node ? +focus_node.dataset.vid : -1;
		const v_node_data = getVDomNodeData(v_dom, vid);
		const v_node = v_node_data ? v_node_data.node : undefined;

		//v_node.text === undefined
		if (!piep_editor_cursor_active) {
			return;
		}

		if (ev.key.length === 1 && sel) {
			if (!ev.ctrlKey) {
				ev.preventDefault();

				if (focus_node.classList.contains("textable")) {
					insertPiepText(ev.key);
				}
			}
		}

		if (ev.key === "Backspace" && v_node_data) {
			ev.preventDefault();

			const text = v_node.text;
			if (focus_offset <= 0) {
				const prev_index = v_node_data.index - 1;
				if (prev_index >= 0) {
					const prev_v_node = v_node_data.children[prev_index];

					if (prev_v_node.text !== undefined) {
						const prev_vid = prev_v_node.id;
						const prev_v_node_text_before = prev_v_node.text;
						prev_v_node.text = prev_v_node_text_before + v_node.text;
						v_node_data.children.splice(v_node_data.index, 1);
						recreateDom();

						const prev_node_ref = getPiepEditorNode(prev_vid);
						if (prev_node_ref) {
							setSelectionByIndex(prev_node_ref, prev_v_node_text_before.length);
						}
					}
				}
			} else {
				v_node.text = text.substr(0, focus_offset - 1) + text.substr(focus_offset);
				recreateDom();

				const node_ref = getPiepEditorNode(vid);
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
				if (next_index < v_node_data.children.length) {
					const next_v_node = v_node_data.children[next_index];

					if (next_v_node.text !== undefined) {
						const node_vid = v_node.id;
						const v_node_text_before = v_node.text;
						v_node.text = v_node_text_before + next_v_node.text;
						v_node_data.children.splice(next_index, 1);
						recreateDom();

						const node_ref = getPiepEditorNode(node_vid);
						if (node_ref) {
							setSelectionByIndex(node_ref, v_node_text_before.length);
						}
					}
				}
			} else {
				v_node.text = text.substr(0, focus_offset) + text.substr(focus_offset + 1);
				recreateDom();

				const node_ref = getPiepEditorNode(vid);
				if (node_ref) {
					setSelectionByIndex(node_ref, focus_offset);
				}
			}
		}

		if (ev.key === "ArrowLeft") {
			ev.preventDefault();

			if (focus_offset <= 0) {
				const prev_textable = getTextable(focus_node, -1);
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
				const next_textable = getTextable(focus_node, 1);
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
			selectElementContentsFromAnywhere(0, -1);
			ev.preventDefault();
		}

		if (ev.key === "ArrowDown") {
			selectElementContentsFromAnywhere(0, 1);
			ev.preventDefault();
		}

		if (ev.key === "Enter" && v_node_data) {
			ev.preventDefault();

			const text = v_node.text;
			if (typeof text === "string") {
				const insert_v_node = cloneObject(v_node);
				insert_v_node.text = text.substr(focus_offset);
				const insert_node_vid = getPiepEditorId();
				insert_v_node.id = insert_node_vid;
				v_node.text = text.substr(0, focus_offset);
				v_node_data.children.splice(v_node_data.index + 1, 0, insert_v_node);
				recreateDom();

				const insert_node_ref = getPiepEditorNode(insert_node_vid);
				if (insert_node_ref) {
					setSelectionByIndex(insert_node_ref, 0);
				}
			}
		}
	});

	recreateDom();

	piepEditorMainLoop();
});

function piepEditorMainLoop() {
	if (piep_editor_grabbed_block_vid !== undefined) {
		const piep_editor_rect = piep_editor.getBoundingClientRect();

		let left = mouse.pos.x - piep_editor_grabbed_block_wrapper_rect.width * 0.5 - piep_editor_rect.left;
		let top = mouse.pos.y - piep_editor_grabbed_block_wrapper_rect.height * 0.5 - piep_editor_rect.top;

		piep_editor_grabbed_block_wrapper._set_absolute_pos(left, top);

		/** @type {insertBlc} */
		// @ts-ignore
		const insert_blc = mouse.target ? mouse.target._parent(".insert_blc") : undefined;

		if (piep_editor_current_insert_blc !== insert_blc) {
			piep_editor_current_insert_blc = insert_blc;

			cloneVDom(v_dom, v_dom_overlay);
			if (piep_editor_current_insert_blc) {
				piep_editor_current_insert_blc._insert_action();
			}
			recreateDom(v_dom_overlay);
		}
	}

	requestAnimationFrame(piepEditorMainLoop);
}

function piepEditorGrabBlock() {
	piep_editor_float_focus.classList.add("hidden");
	piep_editor_float_menu.classList.add("hidden");
	piep_editor_cursor.classList.add("hidden");
	piep_editor.classList.add("grabbed_block");

	piep_editor_grabbed_block_vid = piep_focus_node_vid;

	piep_editor_grabbed_block_wrapper._set_content(getPiepEditorFocusNode().outerHTML);
	piep_editor_grabbed_block_wrapper.classList.add("visible");

	// be as wide as necessary
	piep_editor_grabbed_block_wrapper.style.left = "0";
	piep_editor_grabbed_block_wrapper.style.width = "";

	let ok_width;
	if (piep_editor_grabbed_block_wrapper.offsetWidth > 500) {
		// wrap
		let pretty_width = Math.sqrt(2 * piep_editor_grabbed_block_wrapper.offsetWidth * piep_editor_grabbed_block_wrapper.offsetHeight);
		ok_width = Math.min(800, pretty_width);
	} else {
		ok_width = piep_editor_grabbed_block_wrapper.offsetWidth;
	}
	piep_editor_grabbed_block_wrapper.style.width = ok_width.toPrecision(5) + "px";

	// ok we grabbed it!

	piep_editor_grabbed_block_wrapper_rect = piep_editor_grabbed_block_wrapper.getBoundingClientRect();

	const piep_editor_rect = piep_editor.getBoundingClientRect();

	if (!v_dom_overlay) {
		// @ts-ignore
		v_dom_overlay = {};
	}
	cloneVDom(v_dom, v_dom_overlay);
	recreateDom(v_dom_overlay);

	// prepare all possible places to drop the block yay
	piep_editor_content._children(".blc").forEach((blc) => {
		if (blc._parent() === piep_editor_content) {
			// think about top later
			return;
		}

		if (blc._parent(getPiepEditorNodeSelector(piep_editor_grabbed_block_vid))) {
			// just no baby
			return;
		}

		const blc_rect = blc.getBoundingClientRect();
		const blc_vid = +blc.dataset.vid;

		/**
		 *
		 * @param {-1 | 1} dir
		 */
		const insertAboveOrBelow = (dir) => {
			const grabbed_v_node_data = getVDomNodeData(v_dom_overlay, piep_editor_grabbed_block_vid);
			const near_v_node_data = getVDomNodeData(v_dom_overlay, blc_vid);

			let ind = near_v_node_data.index;
			if (dir === 1) {
				ind++;
			}

			/** @type {vDomNode} */
			const grabbed_node_copy = cloneObject(grabbed_v_node_data.node);
			grabbed_node_copy.insert = true;

			near_v_node_data.children.splice(ind, 0, grabbed_node_copy);
		};

		/**
		 *
		 * @param {-1 | 1} dir
		 */
		const insertOnSides = (dir) => {
			const grabbed_v_node_data = getVDomNodeData(v_dom_overlay, piep_editor_grabbed_block_vid);
			const near_v_node_data = getVDomNodeData(v_dom_overlay, blc_vid);

			let ind = near_v_node_data.index;

			/** @type {vDomNode} */
			const grabbed_node_copy = cloneObject(grabbed_v_node_data.node);
			grabbed_node_copy.insert = true;

			// actually here we should have block / inline-block checking, blocks can be wrapped,
			// text not so, unless what we place nearby is also a block?
			if (near_v_node_data.node.text === undefined) {
				// block layout

				/** @type {vDomNode} */
				const insert_container = {
					tag: "div",
					attrs: {},
					children: [near_v_node_data.node],
					classes: [],
					id: getPiepEditorId(),
					styles: { display: "flex" },
					text: undefined,
				};

				if (dir === 1) {
					insert_container.children.push(grabbed_node_copy);
				} else {
					insert_container.children.unshift(grabbed_node_copy);
				}

				near_v_node_data.children.splice(ind, 1, insert_container);
			} else {
				// inline layout

				if (dir === 1) {
					ind++;
				}

				near_v_node_data.children.splice(ind, 0, grabbed_node_copy);
			}
		};

		/**
		 *
		 * @returns {insertBlc}
		 */
		const getInsertBlc = () => {
			const insert_blc = document.createElement("DIV");
			insert_blc.classList.add("insert_blc");
			piep_editor.append(insert_blc);

			// @ts-ignore
			return $(insert_blc);
		};

		const insert_left_blc = getInsertBlc();
		insert_left_blc._set_absolute_pos(blc_rect.left - piep_editor_rect.left, blc_rect.top + blc_rect.height * 0.5 - piep_editor_rect.top);

		const insert_right_blc = getInsertBlc();
		insert_right_blc._set_absolute_pos(
			blc_rect.left + blc_rect.width - piep_editor_rect.left,
			blc_rect.top + blc_rect.height * 0.5 - piep_editor_rect.top
		);

		const insert_up_blc = getInsertBlc();
		insert_up_blc._set_absolute_pos(blc_rect.left + blc_rect.width * 0.5 - piep_editor_rect.left, blc_rect.top - piep_editor_rect.top);

		const insert_down_blc = getInsertBlc();
		insert_down_blc._set_absolute_pos(
			blc_rect.left + blc_rect.width * 0.5 - piep_editor_rect.left,
			blc_rect.top + blc_rect.height - piep_editor_rect.top
		);

		insert_left_blc._insert_action = () => {
			insertOnSides(-1);
		};
		insert_right_blc._insert_action = () => {
			insertOnSides(1);
		};
		insert_up_blc._insert_action = () => {
			insertAboveOrBelow(-1);
		};
		insert_down_blc._insert_action = () => {
			insertAboveOrBelow(1);
		};

		/**
		 *
		 * @param {PiepNode} blc
		 */
		const setInsertBlcContents = (blc) => {
			blc._set_content(html`<i class="fas fa-plus"></i>`);

			//blc._set_content(html`1`);
			//blc.classList.add("multiple");
			if (Math.random() > 0.8) {
				blc._set_content(html`3`);
				blc.classList.add("multiple");
			}
			if (Math.random() > 0.8) {
				blc._set_content(html`2`);
				blc.classList.add("multiple");
			}
		};

		setInsertBlcContents(insert_left_blc);
		setInsertBlcContents(insert_right_blc);
		setInsertBlcContents(insert_up_blc);
		setInsertBlcContents(insert_down_blc);

		const near_v_node_data = getVDomNodeData(v_dom_overlay, blc_vid);

		// TODO: rethink that baby
		if (near_v_node_data.node.text !== undefined) {
			insert_up_blc.remove();
			insert_down_blc.remove();
		}
	});
}

/**
 *
 * @param {vDomNode} src
 * @param {vDomNode} target
 * @returns
 */
function cloneVDom(src, target) {
	if (target) {
		target.attrs = {};
		target.classes = [];
		target.children = [];
		target.styles = {};
	}
	deepAssign(target, src);
}

function piepEditorReleaseBlock() {
	piep_editor_grabbed_block_wrapper.classList.remove("visible");
	piep_editor.classList.remove("grabbed_block");

	piep_editor._children(".insert_blc").forEach((insert_blc) => {
		insert_blc.remove();
	});

	// use whatever the user have seen already, smooth
	cloneVDom(v_dom_overlay, v_dom);

	// remove grabbed block that was just hidden so far
	// MAYBE ONLY IN CASE IT'S A DIFFERENT POSITION?
	const grabbed_v_node_data = getVDomNodeData(v_dom, piep_editor_grabbed_block_vid);
	grabbed_v_node_data.children.splice(grabbed_v_node_data.index, 1);

	piep_editor_grabbed_block_vid = undefined;
	piep_editor_grabbed_block_wrapper_rect = undefined;

	recreateDom();
}

/**
 *
 * @param {boolean} peca
 */
function setPiepEditorContentActive(peca) {
	piep_editor_content_active = peca;
	if (!piep_editor_content_active) {
		setPiepEditorCursorActive(false);
	}
}

/**
 *
 * @param {boolean} peca
 */
function setPiepEditorCursorActive(peca) {
	piep_editor_cursor_active = peca;
	piep_editor_cursor.classList.toggle("hidden", !piep_editor_cursor_active);
}

function setSelectionRange(range) {
	const sel = window.getSelection();
	sel.removeAllRanges();
	if (range) {
		sel.addRange(range);
	}
	updatePiepCursorPosition();
}

/**
 *
 * @param {PiepNode} node
 * @returns {CharacterData}
 */
function getTextNode(node) {
	let text_node = node;
	while (text_node && text_node.nodeType === 1) {
		const t = text_node.childNodes[0];
		if (!t) {
			break;
		}
		// @ts-ignore
		text_node = t;
	}
	// @ts-ignore
	return text_node;
}

function getPiepEditorFocusNode() {
	const focus_node = piep_editor_content._child(".piep_focus");
	return focus_node;
}

// function getFocusTextable() {
// 	const focus_node = piep_editor_content._child(".piep_focus");
// 	return focus_node ? focus_node._parent(`.textable`) : undefined;
// }

function updatePiepCursorPosition() {
	const sel = window.getSelection();
	if (piep_editor_content_active || piep_editor_float_menu_active) {
		piep_editor_last_selection = cloneObject(sel);
	}
	const csel = piep_editor_last_selection;

	const range = document.createRange();
	const focus_node = csel ? $(csel.focusNode) : undefined;

	const focus_textable = focus_node ? focus_node._parent(`.textable`) : undefined;

	if (focus_textable) {
		const piep_editor_rect = piep_editor.getBoundingClientRect();

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

		piep_editor_cursor.style.left = cursor_left - cursor_width * 0.5 - piep_editor_rect.left + "px";
		piep_editor_cursor.style.top = cursor_top - cursor_height * 0.5 - piep_editor_rect.top + "px";
		piep_editor_cursor.style.width = cursor_width + "px";
		piep_editor_cursor.style.height = cursor_height + "px";

		if (piep_editor_content_active) {
			setPiepEditorCursorActive(true);
		}
	}

	if (focus_textable) {
		setPiepEditorFocusNode(+focus_textable.dataset.vid);
	}
}

/**
 *
 * @param {number} vid
 * @returns
 */
function setPiepEditorFocusNode(vid) {
	// NEVERMIND! -- was kinda for optimisation but we can easily skip it
	if (piep_focus_node_vid === vid && piep_editor_content._child(".piep_focus")) {
		return;
	}

	removeClasses(".piep_focus", ["piep_focus"], piep_editor_content);
	removeClasses(".v_node_label", ["selected"], piep_editor_inspector_tree);
	piep_focus_node_vid = vid;
	const focus_node = getPiepEditorNode(vid);
	if (!focus_node) {
		piep_editor_float_focus.classList.add("hidden");
		return;
	}
	focus_node.classList.add("piep_focus");
	piep_editor_inspector_tree._child(`.tblc_${vid}`).classList.add("selected");

	const v_node = findNodeInVDom(v_dom, +focus_node.dataset.vid);
	piep_editor_float_menu._children("[data-style]").forEach((input) => {
		const prop = input.dataset.style;
		let val = def(v_node.styles[prop], "");
		input._set_value(val, { quiet: true });
	});

	piep_editor_float_focus.classList.remove("hidden");
	piep_editor_float_menu.classList.remove("hidden");

	const focus_node_rect = focus_node.getBoundingClientRect();
	const piep_editor_float_menu_rect = piep_editor_float_menu.getBoundingClientRect();
	const piep_editor_rect = piep_editor.getBoundingClientRect();

	let left = focus_node_rect.left + (focus_node_rect.width - piep_editor_float_menu_rect.width) / 2;
	let top = focus_node_rect.top - piep_editor_float_menu_rect.height - 1;

	const safe_off = 5;
	left = clamp(safe_off, left, piep_editor_rect.width - safe_off);
	// DUDE, the top should actually change by sum of heights
	top = clamp(safe_off, top, piep_editor_rect.height - safe_off);

	piep_editor_float_menu.style.left = left - piep_editor_rect.left + "px";
	piep_editor_float_menu.style.top = top - piep_editor_rect.top + "px";

	piep_editor_float_focus.style.left = focus_node_rect.left - 1 - piep_editor_rect.left + "px";
	piep_editor_float_focus.style.top = focus_node_rect.top - 1 - piep_editor_rect.top + "px";
	piep_editor_float_focus.style.width = focus_node_rect.width + 2 + "px";
	piep_editor_float_focus.style.height = focus_node_rect.height + 2 + "px";
}

/**
 *
 * @param {number} vid
 * @returns {string}
 */
function getPiepEditorNodeSelector(vid) {
	return `.blc_${vid}`;
}

/**
 *
 * @param {number} vid
 * @returns {PiepNode}
 */
function getPiepEditorNode(vid) {
	return piep_editor_content._child(getPiepEditorNodeSelector(vid));
}

/**
 *
 * @param {DOMRect} rect
 */
function getRectCenter(rect) {
	return {
		x: rect.left + rect.width * 0.5,
		y: rect.top + rect.height * 0.5,
	};
}

/**
 *
 * @param {number} dx
 * @param {number} dy
 */
function selectElementContentsFromAnywhere(dx, dy) {
	const sel = window.getSelection();
	/** @type {DOMRect} */
	let sel_rect;

	const focus_node = getPiepEditorFocusNode();
	if (focus_node && focus_node.innerText === "\n") {
		sel_rect = focus_node._child("br").getBoundingClientRect();
	} else {
		sel_rect = sel.getRangeAt(0).getBoundingClientRect();
	}
	const sel_center = getRectCenter(sel_rect);

	const textables = piep_editor_content._children(".textable");
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
 * @param {PiepNode} node
 * @param {number} pos
 * @returns
 */
function getRangeByIndex(node, pos, end = undefined) {
	const text_node = getTextNode(node);
	const range = document.createRange();
	if (!text_node) {
		range.setStart(node, 0);
		range.setEnd(node, 0);
	} else {
		range.setStart(text_node, pos);
		range.setEnd(text_node, def(end, pos));
	}
	return range;
}

/**
 *
 * @param {PiepNode} node
 * @param {number} pos
 * @returns
 */
function setSelectionByIndex(node, pos, end = undefined) {
	const sel = window.getSelection();
	const range = getRangeByIndex(node, pos, end);
	sel.removeAllRanges();
	sel.addRange(range);
	updatePiepCursorPosition();
}
