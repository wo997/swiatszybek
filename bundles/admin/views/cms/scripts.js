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
let piep_editor_advanced_menu;
/** @type {PiepNode} */
let piep_editor_styles;
/** @type {Selection} */
let piep_editor_last_selection;
/** @type {boolean} */
let piep_editor_content_active;
/** @type {boolean} */
let piep_editor_cursor_active;
/** @type {PiepNode} */
let piep_editor_inspector_tree;
/** @type {number} */
let piep_focus_node_vid;

/**
 * @typedef {{
 * id: number
 * tag: string
 * text: string
 * styles: any
 * children: vDomNode[]
 * }} vDomNode
 */

/** @type {vDomNode} */
const v_dom = {
	tag: "div",
	id: 0,
	text: undefined,
	styles: {},
	children: [
		{ id: 1, tag: "h1", text: "Dobry frejmwork", styles: { fontSize: "20px", fontWeight: "bold", color: "#d5d" }, children: [] },
		{
			id: 2,
			tag: "p",
			text:
				"Wirtualny DOM krul. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
			styles: { marginTop: "20px" },
			children: [],
		},
		{
			id: 3,
			tag: "div",
			text: undefined,
			styles: {},
			children: [
				{ id: 4, tag: "p", text: "dziecko 1", children: [], styles: {} },
				{ id: 8, tag: "p", text: "", children: [], styles: {} },
				{
					id: 5,
					tag: "p",
					text: undefined,
					children: [
						{ id: 6, tag: "span", text: "dziecko 2.1", children: [], styles: {} },
						{ id: 7, tag: "span", text: "dziecko 2.2", children: [], styles: {} },
					],
					styles: {},
				},
			],
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

function recreateDom() {
	// order doesn't really matter
	let styles_html = "";

	/**
	 *
	 * @param {vDomNode} node
	 * @returns
	 */
	const traverseVDom = (node, level = 0) => {
		let content_html = "";
		let inspector_tree_html = "";

		const children = node.children;
		const text = node.text;

		const tag = node.tag;
		const textable = text !== undefined;

		let attributes = `data-vid="${node.id}"`;
		const base_class = `vid_${node.id}`;
		let classes = [base_class];

		if (level > 0) {
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
			};

			const display_name = def(map_tag_display_name[tag], "");

			inspector_tree_html += html`<div class="v_node_label tvid_${node.id}" style="--level:${level}" data-vid="${node.id}">
				<span class="name">${display_name}</span>
				<span class="info">${textable ? " - " + text : `(${children.length})`}</span>
			</div>`;
		}

		let body = "";
		if (textable) {
			classes.push("textable");
			if (text) {
				body += text;
			} else {
				body += `<br>`;
			}
		} else {
			for (const child of children) {
				const { content_html: sub_content_html, inspector_tree_html: sub_inspector_tree_html } = traverseVDom(child, level + 1);
				body += sub_content_html;
				inspector_tree_html += sub_inspector_tree_html;
			}
		}

		content_html += html`<${tag} class="${classes.join(" ")}" ${attributes}>${body}</${tag}>`;

		if (!node.styles) {
			node.styles = {};
		}
		const styles = Object.entries(node.styles);
		if (styles.length > 0) {
			let node_styles = "";
			styles.forEach(([prop, val]) => {
				node_styles += `${kebabCase(prop)}: ${val};`;
			});
			styles_html += `.${base_class} { ${node_styles} }`;
		}

		return { content_html, inspector_tree_html };
	};

	const { content_html, inspector_tree_html } = traverseVDom(v_dom);

	piep_editor_content._set_content(content_html);

	piep_editor_styles._set_content(styles_html);

	piep_editor_inspector_tree._set_content(inspector_tree_html, { maintain_height: true });
}

function findNodeInVDom(vid) {
	const node_data = getVDomNodeData(vid);
	if (!node_data) {
		return undefined;
	}
	return node_data.node;
}

/**
 *
 * @param {number} vid
 * @returns {{
 * node: vDomNode,
 * children: vDomNode[],
 * index: number,
 * }}
 */
function getVDomNodeData(vid) {
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
	const v_node = findNodeInVDom(vid);
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

	const initInspector = () => {
		piep_editor_inspector_tree = piep_editor._child(".piep_editor_inspector .tree");
		document.addEventListener("mousemove", (ev) => {
			const target = $(ev.target);
			const v_node_label = target._parent(".v_node_label", { skip: 0 });

			removeClasses(".piep_consider_focus", ["piep_consider_focus"], piep_editor_content);
			if (v_node_label) {
				const vid = +v_node_label.dataset.vid;
				getPiepEditorNode(vid).classList.add("piep_consider_focus");
			}
		});
		document.addEventListener("click", (ev) => {
			const target = $(ev.target);
			const v_node_label = target._parent(".v_node_label", { skip: 0 });

			if (v_node_label) {
				const vid = +v_node_label.dataset.vid;
				//const v_node = findNodeInVDom(vid);

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

	piep_editor.insertAdjacentHTML("beforeend", html`<div class="piep_editor_float_menu hidden"></div>`);
	piep_editor_float_menu = piep_editor._child(".piep_editor_float_menu");

	piep_editor_float_menu._set_content(html`
		<select class="field small inline" data-style="fontSize">
			<option value=""></option>
			<option value="1rem">mała</option>
			<option value="1.5rem">średnia</option>
			<option value="2rem">duża</option>
		</select>

		<select class="field small inline" data-style="fontWeight">
			<option value=""></option>
			<option value="400">normal</option>
			<option value="600">semi-bold</option>
			<option value="700">bold</option>
		</select>

		<input class="field jscolor inline small" data-style="color" />

		<input class="field jscolor inline small" data-style="backgroundColor" />

		<button class="btn subtle small" data-tooltip="Przemieść blok">
			<i class="fas fa-arrows-alt"></i>
		</button>

		<button class="btn subtle small" data-tooltip="Usuń blok">
			<i class="fas fa-trash"></i>
		</button>

		<button class="btn subtle small" data-tooltip="Ukryj menu">
			<i class="fas fa-times"></i>
		</button>
	`);

	piep_editor_float_menu._children("[data-style]").forEach((input) => {
		input.addEventListener("change", () => {
			const focus_node = piep_editor_content._child(".piep_focus");
			if (focus_node) {
				const v_node = findNodeInVDom(+focus_node.dataset.vid);
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
				if (prop.toLocaleLowerCase().endsWith("color")) {
					val = "#" + val;
				}

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
						v_node.children.push({ id: bef_id, tag: "span", styles: {}, text: v_node.text.substring(0, begin_offset), children: [] });
					}
					const mid_vid = getPiepEditorId();
					const mid_child = {
						id: mid_vid,
						tag: "span",
						styles: {},
						text: v_node.text.substring(begin_offset, end_offset),
						children: [],
					};
					v_node.children.push(mid_child);
					if (end_offset < v_node.text.length) {
						const aft_id = getPiepEditorId();
						v_node.children.push({ id: aft_id, tag: "span", styles: {}, text: v_node.text.substring(end_offset), children: [] });
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

		const active = !!(target._parent(piep_editor_content, { skip: 0 }) || target._parent(".v_node_label", { skip: 0 }));
		setPiepEditorContentActive(active);

		updatePiepCursorPosition();
	});

	piep_editor_content.addEventListener("click", (ev) => {
		//piep_editor_content_active = true; // still necessary, not anymore lol
		//updatePiepCursorPosition();
		// const sel = window.getSelection();
		// const sel_focus_node = $(sel.focusNode);
		// if (sel_focus_node) {
		// 	const correct_selection = sel_focus_node._parent($(ev.target), { skip: 0 });
		// 	if (!correct_selection) {
		// 		console.log(21312312, ev.target, sel_focus_node);
		// 		setSelectionByIndex($(ev.target), 0);
		// 	} else if (sel_focus_node.innerText === "\n") {
		// 		setSelectionByIndex(correct_selection, 0);
		// 	}
		// }
	});

	piep_editor_content.addEventListener("mousemove", (ev) => {
		updatePiepCursorPosition();
	});

	document.addEventListener("keydown", (ev) => {
		const sel = window.getSelection();
		const focus_node = getPiepEditorFocusNode();
		const focus_offset = sel.focusOffset;
		const vid = focus_node ? +focus_node.dataset.vid : -1;
		const v_node_data = getVDomNodeData(vid);
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
});

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
// 	return focus_node ? focus_node._parent(`.textable`, { skip: 0 }) : undefined;
// }

function updatePiepCursorPosition() {
	const sel = window.getSelection();
	if (piep_editor_content_active) {
		piep_editor_last_selection = cloneObject(sel);
	}
	const csel = piep_editor_last_selection;
	// if (!sel.focusNode || $(sel.focusNode)._parent(piep_editor_content) && piep_editor_content_active) {
	// 	piep_editor_last_selection = cloneObject(sel);
	// }

	const range = document.createRange();
	const focus_node = csel ? $(csel.focusNode) : undefined;

	const focus_textable = focus_node ? focus_node._parent(`.textable`, { skip: 0 }) : undefined;

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
		setPiepEditorFocusNode(focus_textable.dataset.vid);
	}
}

function setPiepEditorFocusNode(vid) {
	if (piep_focus_node_vid === vid && piep_editor_content._child(".piep_focus")) {
		return;
	}

	removeClasses(".piep_focus", ["piep_focus"], piep_editor_content);
	removeClasses(".v_node_label", ["selected"], piep_editor_inspector_tree);
	piep_focus_node_vid = vid;
	const focus_node = getPiepEditorNode(vid);
	if (!focus_node) {
		piep_editor_float_menu.classList.add("hidden");
		return;
	}
	focus_node.classList.add("piep_focus");
	piep_editor_inspector_tree._child(`.tvid_${vid}`).classList.add("selected");

	const v_node = findNodeInVDom(+focus_node.dataset.vid);
	piep_editor_float_menu._children("[data-style]").forEach((input) => {
		const prop = input.dataset.style;
		let val = def(v_node.styles[prop], "");
		if (prop.toLocaleLowerCase().endsWith("color")) {
			val = val.replace("#", "");
		}
		input._set_value(val, { quiet: true });
	});

	piep_editor_float_menu.classList.remove("hidden");
	const focus_node_rect = focus_node.getBoundingClientRect();
	const piep_editor_float_menu_rect = piep_editor_float_menu.getBoundingClientRect();

	let left = focus_node_rect.left + (focus_node_rect.width - piep_editor_float_menu_rect.width) / 2;
	let top = focus_node_rect.top - piep_editor_float_menu_rect.height;

	piep_editor_float_menu.style.left = left + "px";
	piep_editor_float_menu.style.top = top + "px";
}

function getPiepEditorNode(vid) {
	return piep_editor_content._child(`.vid_${vid}`);
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
