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

const v_dom = {
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

	traversePiepHtml(v_dom.children);
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

		const tag = node.tag;
		const textable = text !== undefined;

		let attributes = `data-ped="${node.id}"`;
		let classes = [`ped_${node.id}`];

		let body = "";
		if (children) {
			for (const child of children) {
				body += traverseVDom(child);
			}
		} else if (textable) {
			classes.push("textable");
			if (text) {
				body += text;
			} else {
				body += `<br>`;
			}
		}

		piep_html += html`<${tag} class="${classes.join(" ")}" ${attributes}>${body}</${tag}>`;

		return piep_html;
	};

	let piep_html = traverseVDom(v_dom);

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
function findNodeInVDom(id) {
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
	const focusOffset = sel.focusOffset;
	const anchorOffset = sel.anchorOffset;
	const focus_node = $(".piep_focus");
	const id = focus_node ? +focus_node.dataset.ped : 0;
	const v_node_data = findNodeInVDom(id);
	if (!v_node_data) {
		return;
	}

	const v_node = v_node_data ? v_node_data.node : undefined;

	const text = v_node.text;

	let beginOffset = focusOffset;
	let endOffset = focusOffset;
	if (anchorOffset === focusOffset) {
		v_node.text = text.substr(0, focusOffset) + insert_text + text.substr(focusOffset);
	} else {
		beginOffset = Math.min(anchorOffset, focusOffset);
		endOffset = Math.max(focusOffset, anchorOffset);
		v_node.text = text.substr(0, beginOffset) + insert_text + text.substr(endOffset);
	}
	recreateDom();

	const node_ref = piep_editor_content._child(`[data-ped="${id}"]`);

	if (node_ref) {
		setSelectionByIndex(node_ref, beginOffset + insert_text.length);
	}
}

domload(() => {
	piep_editor = $(".piep_editor");
	piep_editor_content = piep_editor._child(".piep_editor_content");

	piep_editor.insertAdjacentHTML("beforeend", html`<div class="piep_editor_cursor"></div>`);
	piep_editor_cursor = piep_editor._child(".piep_editor_cursor");

	piep_editor.addEventListener("paste", (e) => {
		e.preventDefault();
		// "text/html" is cool but dont use it yet
		const text = e.clipboardData.getData("text/plain");
		// this text can contain html cool
		//console.log(text);
		insertPiepText(text);
		// TODO: do do
	});

	piep_editor.addEventListener("click", (ev) => {
		const sel = window.getSelection();
		const focus_node = $(sel.focusNode);
		const correct_selection = focus_node._parent($(ev.target), { skip: 0 });
		if (!correct_selection) {
			setSelectionByIndex($(ev.target), 0);
		} else if (focus_node.innerText === "\n") {
			setSelectionByIndex(correct_selection, 0);
		}
		updatePiepCursorPosition();
	});

	piep_editor.addEventListener("mousemove", (ev) => {
		updatePiepCursorPosition();
	});

	document.addEventListener("keydown", (ev) => {
		const sel = window.getSelection();
		const focusOffset = sel.focusOffset;
		const focus_node = $(".piep_focus");
		const id = focus_node ? +focus_node.dataset.ped : 0;
		const v_node_data = findNodeInVDom(id);
		const v_node = v_node_data ? v_node_data.node : undefined;

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
			if (focusOffset <= 0) {
				const prev_index = v_node_data.index - 1;
				if (prev_index >= 0) {
					const prev_v_node = v_node_data.children[prev_index];

					if (prev_v_node.text !== undefined) {
						const prev_id = prev_v_node.id;
						const prev_v_node_text_before = prev_v_node.text;
						prev_v_node.text = prev_v_node_text_before + v_node.text;
						v_node_data.children.splice(v_node_data.index, 1);
						recreateDom();

						const prev_node_ref = piep_editor_content._child(`[data-ped="${prev_id}"]`);
						if (prev_node_ref) {
							setSelectionByIndex(prev_node_ref, prev_v_node_text_before.length);
						}
					}
				}
			} else {
				v_node.text = text.substr(0, focusOffset - 1) + text.substr(focusOffset);
				recreateDom();

				const node_ref = piep_editor_content._child(`[data-ped="${id}"]`);
				if (node_ref) {
					setSelectionByIndex(node_ref, focusOffset - 1);
				}
			}
		}

		if (ev.key === "Delete" && v_node_data) {
			ev.preventDefault();

			const text = v_node.text;
			if (focusOffset >= v_node.text.length) {
				const next_index = v_node_data.index + 1;
				if (next_index < v_node_data.children.length) {
					const next_v_node = v_node_data.children[next_index];

					if (next_v_node.text !== undefined) {
						const node_id = v_node.id;
						const v_node_text_before = v_node.text;
						v_node.text = v_node_text_before + next_v_node.text;
						v_node_data.children.splice(next_index, 1);
						recreateDom();

						const node_ref = piep_editor_content._child(`[data-ped="${node_id}"]`);
						if (node_ref) {
							setSelectionByIndex(node_ref, v_node_text_before.length);
						}
					}
				}
			} else {
				v_node.text = text.substr(0, focusOffset) + text.substr(focusOffset + 1);
				recreateDom();

				const node_ref = piep_editor_content._child(`[data-ped="${id}"]`);
				if (node_ref) {
					setSelectionByIndex(node_ref, focusOffset);
				}
			}
		}

		if (ev.key === "ArrowLeft") {
			ev.preventDefault();

			if (focusOffset <= 0) {
				const prev_textable = getTextable(focus_node, -1);
				if (prev_textable) {
					setSelectionByIndex(prev_textable, prev_textable.textContent.length);
				}
			} else {
				setSelectionByIndex(focus_node, focusOffset - 1);
			}
		}
		if (ev.key === "ArrowRight") {
			ev.preventDefault();

			if (focusOffset >= v_node.text.length) {
				const next_textable = getTextable(focus_node, 1);
				if (next_textable) {
					setSelectionByIndex(next_textable, 0);
				}
			} else {
				setSelectionByIndex(focus_node, focusOffset + 1);
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
				insert_v_node.text = text.substr(focusOffset);
				const insert_node_id = getNewId();
				insert_v_node.id = insert_node_id;
				v_node.text = text.substr(0, focusOffset);
				v_node_data.children.splice(v_node_data.index + 1, 0, insert_v_node);
				recreateDom();

				const insert_node_ref = piep_editor_content._child(`[data-ped="${insert_node_id}"]`);
				if (insert_node_ref) {
					setSelectionByIndex(insert_node_ref, 0);
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

function getFocusTextable() {
	const sel = window.getSelection();
	const focus_node = sel ? $(sel.focusNode) : undefined;
	return focus_node ? focus_node._parent(`.textable`, { skip: 0 }) : undefined;
}

function updatePiepCursorPosition() {
	const sel = window.getSelection();
	const range = document.createRange();
	const focus_textable = getFocusTextable();

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
			range.setStart(sel.focusNode, sel.focusOffset);
			range.setEnd(sel.focusNode, sel.focusOffset);

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
	}

	removeClasses(".piep_focus", ["piep_focus"], piep_editor_content);
	if (focus_textable) {
		focus_textable.classList.add("piep_focus");
	}
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

// /**
//  *
//  * @param {PiepNode} node
//  */
// function getFirstTextable(node, end = false) {
// 	while (true) {
// 		const children = node._direct_children();
// 		const next = end ? children[children.length - 1] : children[0];
// 		if (!next) {
// 			return undefined;
// 		}
// 		node = next;
// 		if (node.classList.contains("textable")) {
// 			return node;
// 		}
// 	}
// 	return undefined;
// }

/**
 *
 * @param {number} dx
 * @param {number} dy
 */
function selectElementContentsFromAnywhere(dx, dy) {
	const sel = window.getSelection();
	/** @type {DOMRect} */
	let sel_rect;

	const focus_textable = getFocusTextable();
	if (focus_textable && focus_textable.innerText === "\n") {
		sel_rect = focus_textable._child("br").getBoundingClientRect();
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
function getRangeByIndex(node, pos) {
	const text_node = getTextNode(node);
	const range = document.createRange();
	if (!text_node) {
		range.setStart(node, 0);
		range.setEnd(node, 0);
	} else {
		range.setStart(text_node, pos);
		range.setEnd(text_node, pos);
	}
	return range;
}

/**
 *
 * @param {PiepNode} node
 * @param {number} pos
 * @returns
 */
function setSelectionByIndex(node, pos) {
	const sel = window.getSelection();
	const range = getRangeByIndex(node, pos);
	sel.removeAllRanges();
	sel.addRange(range);
	updatePiepCursorPosition();
}
