/* js[view] */

/** @type {PiepNode} */
let piep_editor;
/** @type {PiepNode} */
let piep_editor_cursor;
/** @type {PiepNode} */
let piep_editor_content;

/**
 * @typedef {{
 * id: number
 * tag: string
 * text?: string
 * styles?: any
 * children?: vDomNode[]
 * }} vDomNode
 */

const virtual_dom = {
	tag: "div",
	id: 0,
	children: [
		{ id: 1, tag: "h1", text: "Dobry frejmwork", styles: { fontSize: "20px", fontWeight: "bold", color: "blue" } },
		{
			id: 2,
			tag: "p",
			text:
				"Wirtualny DOM krul. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
			styles: { marginTop: "20px" },
		},
		{
			id: 3,
			tag: "div",
			children: [
				{ id: 4, tag: "p", text: "dziecko 1" },
				{ id: 8, tag: "p", text: "" },
				{
					id: 5,
					tag: "p",
					children: [
						{ id: 6, tag: "span", text: "dziecko 2.1" },
						{ id: 7, tag: "span", text: "dziecko 2.2" },
					],
				},
			],
		},
	],
};

function getNewId() {
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

	traversePiepHtml(virtual_dom.children);
	return max + 1;
}

function recreateDom() {
	/**
	 *
	 * @param {vDomNode} node
	 * @returns
	 */
	const traverseVDom = (node) => {
		let piep_html = "";

		const children = node.children;
		const text = node.text;

		piep_html += `<${node.tag} class="ped_${node.id}" data-ped="${node.id}">`;

		if (children) {
			for (const child of children) {
				piep_html += traverseVDom(child);
			}
		} else if (text !== undefined) {
			if (text) {
				piep_html += text;
			} else {
				piep_html += "<br>";
			}
		}

		piep_html += `</${node.tag}>`;

		return piep_html;
	};

	let piep_html = traverseVDom(virtual_dom);

	piep_editor_content._set_content(piep_html);
}

/**
 *
 * @param {number} id
 * @returns {{
 * node: vDomNode,
 * children: vDomNode[],
 * index: number,
 * }}
 */
function findNodeInVirtualDom(id) {
	if (!id) {
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
				if (child.id === id) {
					return {
						node: child,
						children,
						index,
					};
				}
				traverseVDom(child);
			}
		}

		return undefined;
	};

	return traverseVDom(virtual_dom);
}

domload(() => {
	piep_editor = $(".piep_editor");
	piep_editor_content = piep_editor._child(".piep_editor_content");

	piep_editor.insertAdjacentHTML("beforeend", html`<div class="piep_editor_cursor"></div>`);
	piep_editor_cursor = piep_editor._child(".piep_editor_cursor");

	piep_editor.addEventListener("paste", (e) => {
		e.preventDefault();
		const text = e.clipboardData.getData("text/plain");
		console.log(text);
		// TODO: do do
	});

	piep_editor.addEventListener("click", (ev) => {
		updatePiepCursorPosition();
	});

	piep_editor.addEventListener("mousemove", (ev) => {
		updatePiepCursorPosition();
	});

	document.addEventListener("keydown", (ev) => {
		//const target = $(ev.target);

		const sel = window.getSelection();
		const range = document.createRange();
		const focusOffset = sel.focusOffset;
		//const focus_node = $(sel.focusNode);
		const focus_node = $(".piep_focus");
		//const focus_html_node = focus_node ? focus_node._parent("*", { skip: 0 }) : undefined;
		//const id = focus_html_node ? +focus_html_node.dataset.ped : 0;
		const id = focus_node ? +focus_node.dataset.ped : 0;
		const virtual_node = findNodeInVirtualDom(id);
		const text_node = getTextNode(focus_node);

		let prev_node;
		let parent = focus_node;
		while (parent) {
			if (parent._prev()) {
				prev_node = parent._prev();
				break;
			} else {
				parent = parent._parent();
			}
		}
		let prev_textable;
		if (prev_node && piep_editor.contains(prev_node)) {
			prev_textable = def(getLast(prev_node._children("*")), prev_node);
		}

		let next_node;
		parent = focus_node;
		while (parent) {
			if (parent._next()) {
				next_node = parent._next();
				break;
			} else {
				parent = parent._parent();
			}
		}
		let next_textable;
		if (next_node && piep_editor.contains(next_node)) {
			next_textable = def(getLast(next_node._children("*")), next_node);
		}

		if (ev.key.length === 1 && sel) {
			ev.preventDefault();

			const text = virtual_node.node.text;
			if (typeof text === "string") {
				virtual_node.node.text = text.substr(0, focusOffset) + ev.key + text.substr(focusOffset);
				recreateDom();

				const node_ref = piep_editor_content._child(`[data-ped="${id}"]`);

				if (node_ref) {
					selectElementContentsByIndex(node_ref, focusOffset + 1);
				}
			}
		}

		if (ev.key === "Backspace") {
			ev.preventDefault();

			const text = virtual_node.node.text;
			if (focusOffset === 0) {
				const prev_index = virtual_node.index - 1;
				if (prev_index >= 0) {
					const prev_v_node = virtual_node.children[prev_index];
					const prev_id = prev_v_node.id;

					const prev_v_node_text_before = prev_v_node.text;
					prev_v_node.text = prev_v_node_text_before + virtual_node.node.text;
					virtual_node.children.splice(virtual_node.index, 1);
					recreateDom();

					const prev_node_ref = piep_editor_content._child(`[data-ped="${prev_id}"]`);
					if (prev_node_ref) {
						selectElementContentsByIndex(prev_node_ref, prev_v_node_text_before.length);
					}
				}
			} else {
				virtual_node.node.text = text.substr(0, focusOffset - 1) + text.substr(focusOffset);
				recreateDom();

				const node_ref = piep_editor_content._child(`[data-ped="${id}"]`);
				if (node_ref) {
					selectElementContentsByIndex(node_ref, focusOffset - 1);
				}
			}
		}

		if (ev.key === "ArrowLeft") {
			ev.preventDefault();

			if (focusOffset <= 0) {
				if (prev_textable) {
					selectElementContentsByIndex(prev_textable, prev_textable.textContent.length);
				}
			} else {
				selectElementContentsByIndex(focus_node, focusOffset - 1);
			}
		}
		if (ev.key === "ArrowRight") {
			ev.preventDefault();

			if (focusOffset >= focus_node.textContent.length) {
				if (next_textable) {
					selectElementContentsByIndex(next_textable, 0);
				}
			} else {
				selectElementContentsByIndex(focus_node, focusOffset + 1);
			}
		}
		if (ev.key === "Enter" && virtual_node) {
			ev.preventDefault();

			const text = virtual_node.node.text;
			if (typeof text === "string") {
				const insert_v_node = cloneObject(virtual_node.node);
				insert_v_node.text = text.substr(focusOffset);
				const insert_node_id = getNewId();
				insert_v_node.id = insert_node_id;
				virtual_node.node.text = text.substr(0, focusOffset);
				virtual_node.children.splice(virtual_node.index + 1, 0, insert_v_node);
				recreateDom();

				const insert_node_ref = piep_editor_content._child(`[data-ped="${insert_node_id}"]`);
				if (insert_node_ref) {
					selectElementContentsByIndex(insert_node_ref, 0);
				}
			}
		}
	});

	recreateDom();
});

function setSelectionRange(range) {
	const sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
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

function updatePiepCursorPosition() {
	const sel = window.getSelection();
	const range = document.createRange();

	const focus_node = $(sel.focusNode);
	//const text_node = getTextNode(focus_node);

	let focus_html_node;
	if (sel && sel.focusNode && focus_node.innerHTML === focus_node.innerText) {
		focus_html_node = focus_node ? focus_node._parent(`[data-ped]`, { skip: 0 }) : undefined;

		range.setStart(sel.focusNode, sel.focusOffset);
		range.setEnd(sel.focusNode, sel.focusOffset);

		const piep_editor_rect = piep_editor.getBoundingClientRect();
		const selection_cursor_rect = range.getBoundingClientRect();

		const width = selection_cursor_rect.width;
		const cursor_width = Math.max(width, 2);
		const height = selection_cursor_rect.height;
		const cursor_height = Math.max(height, 20);

		piep_editor_cursor.style.left = selection_cursor_rect.left + (width - cursor_width) * 0.5 - piep_editor_rect.left + "px";
		piep_editor_cursor.style.top = selection_cursor_rect.top + (height - cursor_height) * 0.5 - piep_editor_rect.top + "px";
		piep_editor_cursor.style.width = cursor_width + "px";
		piep_editor_cursor.style.height = cursor_height + "px";
	}

	$$(".piep_focus").forEach((e) => e.classList.toggle("piep_focus", e === focus_html_node));
	if (focus_html_node) {
		focus_html_node.classList.add("piep_focus");
	}
}

/**
 *
 * @param {PiepNode} node
 * @param {PiepNode} from
 * @returns
 */
function selectElementContentsFromOther(node, from) {
	const text_node = node.childNodes[0];
	const sel = window.getSelection();
	const range = document.createRange();
	if (!text_node) {
		range.setStart(node, 0);
		range.setEnd(node, 0);
	} else {
		const was_cursor_x = window.getSelection().getRangeAt(0).getBoundingClientRect().left;

		let last_cursor_x;
		for (let i = 0; i <= text_node.textContent.length; i++) {
			range.setStart(text_node, i);
			range.setEnd(text_node, i);

			const cursor_x = range.getBoundingClientRect().left;
			if (last_cursor_x === undefined) {
				last_cursor_x = cursor_x;
			}
			if (-last_cursor_x * 0.5 + cursor_x * 1.5 > was_cursor_x) {
				break;
			}
			last_cursor_x = cursor_x;
		}
	}

	sel.removeAllRanges();
	sel.addRange(range);
	updatePiepCursorPosition();
}

/**
 *
 * @param {PiepNode} node
 * @param {number} pos
 * @returns
 */
function selectElementContentsByIndex(node, pos) {
	const text_node = node.childNodes[0];
	const sel = window.getSelection();
	const range = document.createRange();
	if (!text_node) {
		range.setStart(node, 0);
		range.setEnd(node, 0);
	} else {
		range.setStart(text_node, pos);
		range.setEnd(text_node, pos);
	}
	sel.removeAllRanges();
	sel.addRange(range);
	updatePiepCursorPosition();
}
