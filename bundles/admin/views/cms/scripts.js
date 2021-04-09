/* js[view] */

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
/** @type {vDomNode[]} */
let v_dom_overlay = [];
/** @type {insertBlc} */
let piep_editor_current_insert_blc;
/** @type {boolean} */
let piep_editor_has_insert_pos;
/** @type {number} */
let piep_editor_last_v_node_label_vid;
/** @type {PiepNode} */
let piep_editor_float_multi_insert;
/** @type {insertBlc} */
let piep_editor_showing_float_multi_of_blc;

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

/** @type {vDomNode[]} */
let v_dom = /*{
	tag: "div",
	id: 0,
	text: undefined,
	styles: { display: "flex", flexDirection: "column" },
	attrs: {},
	classes: [],
	children:*/ [
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
		children: [],
		attrs: {},
		classes: [],
	},
];
//};

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

	traversePiepHtml(v_dom);
	return max + 1;
}

/**
 * @param {vDomNode[]} target_v_dom
 */
function recreateDom(target_v_dom = undefined) {
	if (target_v_dom === undefined) {
		target_v_dom = v_dom;
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

			const base_class = getPiepEditorNodeSelector(v_node.id).replace(".", "");
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

			if (text) {
				info = text;
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
			if (v_node.id === piep_editor_grabbed_block_vid) {
				if (!piep_editor_current_insert_blc || !v_node.insert) {
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

				if (single_tags.includes(tag)) {
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

	piep_editor_content._set_content(content_html);

	piep_editor_styles._set_content(styles_html);

	piep_editor_inspector_tree._set_content(inspector_tree_html, { maintain_height: true });

	lazyLoadImages({ duration: 0 });
	registerForms();
}

/**
 *
 * @param {vDomNode[]} v_dom
 * @param {number} vid
 * @returns
 */
function findNodeInVDomById(v_dom, vid) {
	if (!vid) {
		return undefined;
	}

	const node_data = getVDomNodeDataById(v_dom, vid);
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
function findNodeInVDom(v_dom, test) {
	const node_data = getVDomNodeData(v_dom, test);
	if (!node_data) {
		return undefined;
	}
	return node_data.v_node;
}

/**
 *
 * @param {vDomNode[]} v_dom
 * @param {number} vid
 * @returns
 */
function getVDomNodeDataById(v_dom, vid) {
	if (!vid) {
		return undefined;
	}

	return getVDomNodeData(v_dom, (v_node) => v_node.id === vid);
}

/**
 *
 * @param {vDomNode[]} v_dom
 * @param {{(v_node: vDomNode): boolean}} test
 * @returns {{
 * v_node: vDomNode,
 * v_nodes: vDomNode[],
 * index: number,
 * }}
 */
function getVDomNodeData(v_dom, test) {
	/**
	 *
	 * @param {vDomNode[]} v_nodes
	 * @returns
	 */
	const traverseVDom = (v_nodes) => {
		let index = -1;
		for (const v_node of v_nodes) {
			index++;

			if (test(v_node)) {
				return {
					v_node,
					v_nodes,
					index,
				};
			}

			if (v_node.children) {
				const res = traverseVDom(v_node.children);
				if (res) {
					return res;
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
	const v_node = findNodeInVDomById(v_dom, vid);
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

	piep_editor.insertAdjacentHTML("beforeend", html`<div class="piep_editor_float_multi_insert"></div>`);
	piep_editor_float_multi_insert = piep_editor._child(".piep_editor_float_multi_insert");

	const initInspector = () => {
		piep_editor_inspector_tree = piep_editor._child(".piep_editor_inspector .tree");
		document.addEventListener("mousemove", (ev) => {
			const target = $(ev.target);
			const v_node_label = target._parent(".v_node_label");

			let vid = undefined;

			if (piep_editor_grabbed_block_vid === undefined) {
				if (v_node_label) {
					vid = +v_node_label.dataset.vid;
				}

				if (piep_editor_last_v_node_label_vid !== vid) {
					piep_editor_last_v_node_label_vid = vid;
					if (vid === undefined) {
						piep_editor_float_menu.classList.toggle("hidden", !piep_focus_node_vid);
						piepEditorShowFocusToNode(piep_focus_node_vid);
					} else {
						piep_editor_float_menu.classList.toggle("hidden", vid !== piep_focus_node_vid);
						piepEditorShowFocusToNode(vid);
					}
				}
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
				const v_node = findNodeInVDomById(v_dom, +focus_node.dataset.vid);
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
			const click_blc_vid = +click_blc.dataset.vid;
			const click_v_node = findNodeInVDomById(v_dom, click_blc_vid);
			if (click_v_node && click_v_node.text === undefined) {
				setPiepEditorFocusNode(click_blc_vid);
				removeSelection();
			}
			// otherwise it's just a text, so native selection tells where to point at
		}

		// order matters
		updatePiepCursorPosition();

		if (target._parent(".move_block_btn")) {
			piepEditorGrabBlock();
		}

		if (target._parent(".remove_block_btn")) {
			const v_node_data = getVDomNodeDataById(v_dom, piep_focus_node_vid);
			v_node_data.v_nodes.splice(v_node_data.index, 1);
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
		const vid = focus_node ? +focus_node.dataset.vid : undefined;
		const v_node_data = getVDomNodeDataById(v_dom, vid);
		const v_node = v_node_data ? v_node_data.v_node : undefined;

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
					const prev_v_node = v_node_data.v_nodes[prev_index];

					if (prev_v_node.text !== undefined) {
						const prev_vid = prev_v_node.id;
						const prev_v_node_text_before = prev_v_node.text;
						prev_v_node.text = prev_v_node_text_before + v_node.text;
						v_node_data.v_nodes.splice(v_node_data.index, 1);
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
				if (next_index < v_node_data.v_nodes.length) {
					const next_v_node = v_node_data.v_nodes[next_index];

					if (next_v_node.text !== undefined) {
						const node_vid = v_node.id;
						const v_node_text_before = v_node.text;
						v_node.text = v_node_text_before + next_v_node.text;
						v_node_data.v_nodes.splice(next_index, 1);
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
				v_node_data.v_nodes.splice(v_node_data.index + 1, 0, insert_v_node);
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
	updateMouseTarget();

	if (piep_editor_grabbed_block_vid !== undefined) {
		const radius = 35;

		const piep_editor_rect = piep_editor.getBoundingClientRect();

		let left = mouse.pos.x - piep_editor_grabbed_block_wrapper_rect.width * 0.5 - piep_editor_rect.left;
		let top = mouse.pos.y - piep_editor_grabbed_block_wrapper_rect.height * 0.5 - piep_editor_rect.top;

		piep_editor_grabbed_block_wrapper._set_absolute_pos(left, top);

		/** @type {insertBlc} */
		// @ts-ignore
		const insert_blc = mouse.target ? mouse.target._parent(".insert_blc, .svg_insert_btn") : undefined;

		if (piep_editor_showing_float_multi_of_blc) {
			const piep_editor_float_multi_insert_rect = piep_editor_float_multi_insert.getBoundingClientRect();
			const dx = piep_editor_float_multi_insert_rect.left + piep_editor_float_multi_insert_rect.width * 0.5 - mouse.pos.x;
			const dy = piep_editor_float_multi_insert_rect.top + piep_editor_float_multi_insert_rect.height * 0.5 - mouse.pos.y;
			const inside = dx * dx + dy * dy < radius * radius;

			if (inside) {
				removeClasses(".foreign_hover", ["foreign_hover"], piep_editor_float_multi_insert);
				const svg_insert_btn = mouse.target._parent(".svg_insert_btn");
				if (svg_insert_btn) {
					const index = svg_insert_btn.dataset.index;
					piep_editor_float_multi_insert._child(`.foreign_insert_btn[data-index="${index}"]`).classList.add("foreign_hover");
				}
			} else {
				piep_editor_showing_float_multi_of_blc.classList.remove("hidden");
				piep_editor_float_multi_insert.classList.add("hidden");
				piep_editor_showing_float_multi_of_blc = undefined;
			}
		}

		if (piep_editor_current_insert_blc !== insert_blc) {
			piep_editor_current_insert_blc = insert_blc;

			v_dom_overlay.splice(0, v_dom_overlay.length);
			deepAssign(v_dom_overlay, v_dom);

			/** @type {insertBlc} */
			let show_insert_blc_option = undefined;

			if (insert_blc) {
				if (insert_blc.classList.contains("multiple")) {
					// clean up
					// piep_editor_float_multi_insert._direct_children().forEach((c) => {
					// 	piep_editor.append(c);
					// 	c.classList.add("hidden");
					// });
					// insert_blc._popup_blcs.forEach((c) => {
					// 	c.style.left = "0";
					// 	c.style.top = "0";
					// 	piep_editor_float_multi_insert.append(c);
					// 	c.classList.remove("hidden");
					// });

					let edit_block_html = "";

					let buttons = "";

					const inner_radius = 15;

					const norad = Math.PI / 180;

					const x0 = radius;
					const y0 = radius;

					const btn_count = insert_blc._popup_blcs.length;

					const icon_size = 20;

					const space_ratio = 0; // 0.5;
					const inner_space_ratio = (space_ratio * radius) / inner_radius;

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

						const p5 = point((a1 + a2) * 0.5, (radius + inner_radius) * 0.485);

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

					piep_editor_float_multi_insert._set_content(edit_block_html);
					piep_editor_float_multi_insert.classList.remove("hidden");

					const insert_blc_rect = insert_blc.getBoundingClientRect();
					const piep_editor_rect = piep_editor.getBoundingClientRect();
					const piep_editor_float_multi_insert_rect = piep_editor_float_multi_insert.getBoundingClientRect();

					piep_editor_float_multi_insert._set_absolute_pos(
						insert_blc_rect.left + (insert_blc_rect.width - piep_editor_float_multi_insert_rect.width) * 0.5 - piep_editor_rect.left,
						insert_blc_rect.top + (insert_blc_rect.height - piep_editor_float_multi_insert_rect.height) * 0.5 - piep_editor_rect.top
					);
					piep_editor_showing_float_multi_of_blc = insert_blc;
					insert_blc.classList.add("hidden");
				}

				if (!insert_blc.classList.contains("multiple")) {
					if (insert_blc.classList.contains("svg_insert_btn")) {
						if (piep_editor_showing_float_multi_of_blc) {
							show_insert_blc_option = piep_editor_showing_float_multi_of_blc._popup_blcs[+insert_blc.dataset.index];
						}
					} else {
						show_insert_blc_option = insert_blc;
					}
				}
			}

			if (show_insert_blc_option) {
				show_insert_blc_option._insert_action();
				recreateDom(v_dom_overlay);
				piepEditorShowFocusToNode(piep_editor_grabbed_block_vid);
			} else {
				recreateDom(v_dom_overlay);
				piep_editor_float_focus.classList.add("hidden");
			}
		}

		piep_editor_has_insert_pos = !!(piep_editor_current_insert_blc && !piep_editor_current_insert_blc.classList.contains("multiple"));
		piep_editor_grabbed_block_wrapper.classList.toggle("visible", !piep_editor_has_insert_pos);
		piep_editor.classList.toggle("has_insert_pos", piep_editor_has_insert_pos);
	}

	requestAnimationFrame(piepEditorMainLoop);
}

function piepEditorGrabBlock() {
	piep_editor_float_focus.classList.add("hidden");
	piep_editor_float_menu.classList.add("hidden");
	piep_editor_cursor.classList.add("hidden");
	piep_editor.classList.add("grabbed_block");
	piep_editor.classList.remove("has_insert_pos");

	piep_editor_grabbed_block_vid = piep_focus_node_vid;

	piep_editor_grabbed_block_wrapper._set_content(getPiepEditorFocusNode().outerHTML);
	piep_editor_grabbed_block_wrapper.classList.add("visible");

	// be as wide as necessary
	piep_editor_grabbed_block_wrapper.style.left = "0";
	piep_editor_grabbed_block_wrapper.style.width = "";

	let ok_width;
	if (piep_editor_grabbed_block_wrapper.offsetWidth > 500) {
		// wrap
		ok_width = Math.sqrt(2 * piep_editor_grabbed_block_wrapper.offsetWidth * piep_editor_grabbed_block_wrapper.offsetHeight);
		// let pretty_width = Math.sqrt(2 * piep_editor_grabbed_block_wrapper.offsetWidth * piep_editor_grabbed_block_wrapper.offsetHeight);
		// ok_width = Math.min(800, pretty_width);
	} else {
		ok_width = piep_editor_grabbed_block_wrapper.offsetWidth;
	}
	piep_editor_grabbed_block_wrapper.style.width = ok_width.toPrecision(5) + "px";
	const scale = 1 / (1 + ok_width * 0.001);
	piep_editor_grabbed_block_wrapper.style.transform = `scale(${scale.toPrecision(5)})`;

	// ok we grabbed it!

	piep_editor_grabbed_block_wrapper_rect = piep_editor_grabbed_block_wrapper.getBoundingClientRect();

	const piep_editor_rect = piep_editor.getBoundingClientRect();

	v_dom_overlay.splice(0, v_dom_overlay.length);
	deepAssign(v_dom_overlay, v_dom);
	recreateDom(v_dom_overlay);

	// prepare all possible places to drop the block yay\

	/**
	 * @typedef {{
	 * _insert_action()
	 * _popup_blcs: insertBlc[]
	 * } & PiepNode} insertBlc
	 */

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

	/**
	 *
	 * @param {PiepNode} blc
	 * @param {"left" | "right" | "top" | "bottom" | "center"} pos
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

		left -= piep_editor_rect.left;
		top -= piep_editor_rect.top;

		return { left, top };
	};

	piep_editor_content._children(".blc").forEach((blc) => {
		if (blc._parent(getPiepEditorNodeSelector(piep_editor_grabbed_block_vid))) {
			// just no baby
			return;
		}

		const blc_vid = +blc.dataset.vid;

		/**
		 *
		 * @param {-1 | 1} dir
		 */
		const insertAboveOrBelow = (dir) => {
			const grabbed_v_node_data = getVDomNodeDataById(v_dom_overlay, piep_editor_grabbed_block_vid);
			const near_v_node_data = getVDomNodeDataById(v_dom_overlay, blc_vid);

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
			const grabbed_v_node_data = getVDomNodeDataById(v_dom_overlay, piep_editor_grabbed_block_vid);
			const near_v_node_data = getVDomNodeDataById(v_dom_overlay, blc_vid);

			let ind = near_v_node_data.index;

			/** @type {vDomNode} */
			const grabbed_node_copy = cloneObject(grabbed_v_node_data.v_node);
			grabbed_node_copy.insert = true;

			// actually here we should have block / inline-block checking, blocks can be wrapped,
			// text not so, unless what we place nearby is also a block?
			if (near_v_node_data.v_node.text === undefined) {
				// block layout

				/** @type {vDomNode} */
				const insert_container = {
					tag: "div",
					attrs: {},
					children: [near_v_node_data.v_node],
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

				near_v_node_data.v_nodes.splice(ind, 1, insert_container);
			} else {
				// inline layout

				if (dir === 1) {
					ind++;
				}

				near_v_node_data.v_nodes.splice(ind, 0, grabbed_node_copy);
			}
		};

		const insertInside = () => {
			/** @type {vDomNode} */
			const grabbed_node_copy = cloneObject(findNodeInVDomById(v_dom_overlay, piep_editor_grabbed_block_vid));
			grabbed_node_copy.insert = true;

			findNodeInVDomById(v_dom_overlay, blc_vid).children.push(grabbed_node_copy);
		};

		const near_v_node_data = getVDomNodeDataById(v_dom_overlay, blc_vid);

		/**
		 * @param {insertBlc} insert_blc
		 * @param {"left" | "right" | "top" | "bottom" | "center"} pos
		 */
		const setInsertPos = (insert_blc, pos) => {
			let { left, top } = getInsertBlcPos(blc, pos);
			insert_blc._set_absolute_pos(left, top);

			switch (pos) {
				case "left":
					// prevright same
					break;
				case "right":
					// next left same
					break;
				case "top":
					// prev bottom same
					break;
				case "bottom":
					// next top same
					break;
			}
			// useless? covers the prev pos maybe
			if (false) {
				insert_blc.remove();
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

		// TODO: rethink that baby
		if (near_v_node_data.v_node.text !== undefined) {
			// top
			const insert_top_blc = getInsertBlc();
			insert_top_blc._insert_action = () => {
				insertAboveOrBelow(-1);
			};
			setInsertPos(insert_top_blc, "top");

			// bottom
			const insert_bottom_blc = getInsertBlc();
			insert_bottom_blc._insert_action = () => {
				insertAboveOrBelow(-1);
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

	piep_editor._children(".insert_blc").forEach((insert_blc) => {
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
		const insert_blcs = piep_editor._children(".insert_blc");
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

			// if (weight_a === 1) {
			// 	if (weight_b === 1) {
			// 		// a blc, b blc
			// 	} else {
			// 		// a blc, b master
			// 	}
			// } else {
			// 	if (weight_b === 1) {
			// 		// a master, b blc
			// 	} else {
			// 		// a master, b master
			// 	}
			// }

			master_insert_blc._set_absolute_pos(
				(blc_a_rect.left * weight_a) / weight + (blc_b_rect.left * weight_b) / weight + blc_a_rect.width * 0.5 - piep_editor_rect.left,
				(blc_a_rect.top * weight_a) / weight + (blc_b_rect.top * weight_b) / weight + blc_a_rect.height * 0.5 - piep_editor_rect.top
			);
			master_insert_blc._set_content(weight);
			master_insert_blc.dataset.wght = weight + "";
		});
	}
}

function piepEditorReleaseBlock() {
	piep_editor_grabbed_block_wrapper.classList.remove("visible");
	piep_editor.classList.remove("grabbed_block");
	piep_editor.classList.remove("has_insert_pos");
	piep_editor_float_focus.classList.add("hidden");

	piep_editor._children(".insert_blc").forEach((insert_blc) => {
		insert_blc.remove();
	});

	if (piep_editor_current_insert_blc) {
		// use whatever the user have seen already, smooth UX
		v_dom.splice(0, v_dom.length);
		deepAssign(v_dom, v_dom_overlay);

		// remove grabbed block that was just hidden so far
		const grabbed_v_node_data = getVDomNodeData(v_dom, (v_node) => !v_node.insert && v_node.id === piep_editor_grabbed_block_vid);
		grabbed_v_node_data.v_nodes.splice(grabbed_v_node_data.index, 1);

		const v_node_with_insert = findNodeInVDom(v_dom, (v_node) => v_node.insert);
		if (v_node_with_insert) {
			v_node_with_insert.insert = false;
		}
	}

	piep_editor_grabbed_block_vid = undefined;
	piep_editor_grabbed_block_wrapper_rect = undefined;
	piep_editor_current_insert_blc = undefined;
	piep_editor_has_insert_pos = false;

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
	if (piep_editor_grabbed_block_vid !== undefined) {
		return;
	}

	// NEVERMIND! -- was kinda for optimisation but we can easily skip it
	if (piep_focus_node_vid === vid && piep_editor_content._child(".piep_focus")) {
		return;
	}

	removeClasses(".piep_focus", ["piep_focus"], piep_editor_content);
	removeClasses(".v_node_label", ["selected"], piep_editor_inspector_tree);
	piep_focus_node_vid = vid;
	const focus_node = getPiepEditorNode(vid);
	if (focus_node) {
		focus_node.classList.add("piep_focus");

		const v_node = findNodeInVDomById(v_dom, +focus_node.dataset.vid);
		piep_editor_float_menu._children("[data-style]").forEach((input) => {
			const prop = input.dataset.style;
			let val = def(v_node.styles[prop], "");
			input._set_value(val, { quiet: true });
		});

		const tblc = piep_editor_inspector_tree._child(`.tblc_${vid}`);
		if (piep_editor_inspector_tree._child(`.tblc_${vid}`)) {
			tblc.classList.add("selected");
		}
	}

	piepEditorShowFocusToNode(vid);
	piepEditorShowFloatMenuToNode(vid);
}

/**
 *
 * @param {number} vid
 * @returns
 */
function piepEditorShowFocusToNode(vid) {
	if (vid === undefined) {
		piep_editor_float_focus.classList.add("hidden");
		return;
	}

	piep_editor_float_focus.classList.remove("hidden");

	const focus_node = getPiepEditorNode(vid);
	if (focus_node === undefined) {
		piep_editor_float_focus.classList.add("hidden");
		return;
	}
	const focus_node_rect = focus_node.getBoundingClientRect();
	const piep_editor_rect = piep_editor.getBoundingClientRect();

	piep_editor_float_focus._set_absolute_pos(
		focus_node_rect.left - 1 - piep_editor_rect.left,
		focus_node_rect.top - 1 - piep_editor_rect.top
	);

	piep_editor_float_focus.style.width = focus_node_rect.width + 2 + "px";
	piep_editor_float_focus.style.height = focus_node_rect.height + 2 + "px";
}

/**
 *
 * @param {number} vid
 * @returns
 */
function piepEditorShowFloatMenuToNode(vid) {
	if (vid === undefined) {
		piep_editor_float_menu.classList.add("hidden");
		return;
	}

	piep_editor_float_menu.classList.remove("hidden");

	const focus_node = getPiepEditorNode(vid);
	if (focus_node === undefined) {
		piep_editor_float_menu.classList.add("hidden");
		return;
	}
	const focus_node_rect = focus_node.getBoundingClientRect();
	const piep_editor_rect = piep_editor.getBoundingClientRect();
	const piep_editor_float_menu_rect = piep_editor_float_menu.getBoundingClientRect();

	piep_editor_float_focus._set_absolute_pos(
		focus_node_rect.left - 1 - piep_editor_rect.left,
		focus_node_rect.top - 1 - piep_editor_rect.top
	);

	let left = focus_node_rect.left + (focus_node_rect.width - piep_editor_float_menu_rect.width) / 2;
	let top = focus_node_rect.top - piep_editor_float_menu_rect.height - 1;

	const safe_off = 5;
	left = clamp(safe_off, left, piep_editor_rect.width - safe_off);
	// DUDE, the top should actually change by sum of heights
	top = clamp(safe_off, top, piep_editor_rect.height - safe_off);

	piep_editor_float_menu._set_absolute_pos(left - piep_editor_rect.left, top - piep_editor_rect.top);
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
