/* js[view] */

/** @type {PiepNode} */
let piep_editor;
/** @type {PiepNode} */
let piep_editor_cursor;
/** @type {PiepNode} */
let piep_editor_content;

const virtual_dom = {
	id: 0,
	children: [
		{ id: 1, type: "h1", text: "Dobry frejmwork", styles: { fontSize: "20px", fontWeight: "bold", color: "blue" } },
		{
			id: 2,
			type: "p",
			text:
				"Wirtualny DOM krul. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
			styles: { marginTop: "20px" },
		},
		{
			id: 3,
			type: "div",
			children: [
				{ id: 4, type: "p", text: "dziecko 1" },
				{ id: 8, type: "p", text: "" },
				{
					id: 5,
					type: "p",
					children: [
						{ id: 6, type: "span", text: "dziecko 2.1" },
						{ id: 7, type: "span", text: "dziecko 2.2" },
					],
				},
			],
		},
	],
};

function getNewPed() {
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
	const traversePiepHtml = (nodes) => {
		let piep_html = "";

		for (const node of nodes) {
			piep_html += `<${node.type} class="ped_${node.id}" data-ped="${node.id}">`;

			const text = node.text;
			if (text !== undefined) {
				if (text) {
					piep_html += text;
				} else {
					piep_html += "<br>";
				}
			} else if (node.children) {
				piep_html += traversePiepHtml(node.children);
			}

			piep_html += `</${node.type}>`;
		}

		return piep_html;
	};

	let piep_html = traversePiepHtml(virtual_dom.children);

	piep_editor_content._set_content(piep_html);
}

/**
 *
 * @param {number} ped
 * @param {*} v_dom
 * @returns {{
 * node: *,
 * children: array,
 * i: number,
 * }}
 */
function findNodeInVirtualDom(ped, v_dom = undefined) {
	if (!ped) {
		return undefined;
	}
	if (v_dom === undefined) {
		v_dom = virtual_dom;
	}
	if (v_dom.id === ped) {
		return v_dom;
	}
	const children = v_dom.children;
	if (children) {
		for (let i = 0; i < children.length; i++) {
			const sub_v_dom = children[i];
			const res = findNodeInVirtualDom(ped, sub_v_dom);
			if (res) {
				return {
					node: sub_v_dom,
					children,
					i,
				};
			}
		}
	}
	return undefined;
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
		const focus_node = $(sel.focusNode);
		const focus_html_node = focus_node ? focus_node._parent("*", { skip: 0 }) : undefined;
		const ped = focus_html_node ? +focus_html_node.dataset.ped : 0;
		const virtual_node = findNodeInVirtualDom(ped);
		const text_node = getTextNode(focus_node);

		let prev_node;
		let parent = focus_html_node;
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
		parent = focus_html_node;
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
			const text = virtual_node.node.text;
			if (typeof text === "string") {
				virtual_node.node.text = text.substr(0, focusOffset) + ev.key + text.substr(focusOffset);
				recreateDom();

				const node_ref = piep_editor_content._child(`[data-ped="${ped}"]`);

				if (node_ref) {
					const t = node_ref.childNodes[0];
					range.setStart(t, focusOffset + 1);
					range.setEnd(t, focusOffset + 1);
					setSelectionRange(range);
				}
			}

			if (ev.key === " ") {
				ev.preventDefault();
			}
		}

		if (ev.key === "ArrowLeft") {
			if (focusOffset === 0 && prev_textable) {
				selectElementContentsByIndex(prev_textable, prev_textable.textContent.length);
				ev.preventDefault();
			} else {
				range.setStart(focus_node, focusOffset - 1);
				range.setEnd(focus_node, focusOffset - 1);

				sel.removeAllRanges();
				sel.addRange(range);
			}
			updatePiepCursorPosition();
		}
		if (ev.key === "ArrowRight") {
			if (focusOffset === focus_html_node.textContent.length && next_textable) {
				selectElementContentsByIndex(next_textable, 0);
				ev.preventDefault();
			} else {
				range.setStart(focus_node, focusOffset + 1);
				range.setEnd(focus_node, focusOffset + 1);

				sel.removeAllRanges();
				sel.addRange(range);
			}
			updatePiepCursorPosition();
		}
		if (ev.key === "Enter" && sel) {
			const text = virtual_node.node.text;
			if (typeof text === "string") {
				const insert_v_node = cloneObject(virtual_node.node);
				insert_v_node.text = text.substr(focusOffset);
				insert_v_node.id = getNewPed();
				virtual_node.node.text = text.substr(0, focusOffset);
				virtual_node.children.splice(virtual_node.i + 1, 0, insert_v_node);
				recreateDom();

				const node_ref = piep_editor_content._child(`[data-ped="${ped}"]`);

				if (node_ref) {
					const next = node_ref._next();
					if (next) {
						const t = next.childNodes[0];
						range.setStart(t, 0);
						range.setEnd(t, 0);
						setSelectionRange(range);
					}
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
	const text_node = getTextNode(focus_node);

	let focus_html_node;
	if (sel && sel.focusNode && focus_node.innerHTML === focus_node.innerText) {
		focus_html_node = focus_node ? focus_node._parent("*", { skip: 0 }) : undefined;

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
 * @param {HTMLBaseElement} node
 * @param {HTMLBaseElement} from
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
 * @param {HTMLBaseElement} node
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

// /* js[view] */

// /** @type {PiepNode} */
// let piep_editor;
// /** @type {PiepNode} */
// let piep_editor_cursor;
// /** @type {PiepNode} */
// let piep_editor_content;

// const virtual_dom = [{ type: "heading", inner_html: "Dobry frejmwork" }];

// domload(() => {
// 	piep_editor = $(".piep_editor");
// 	piep_editor._set_content(
// 		`<div class="piep_editor_content"><h1>teścik</h1><div>dfghds<br>fsdf<br>sdfsdf</div><div>dfghdfg dsfgh dgfdf gds fhghf</div><div>dfghdfghdfgh</div><div style="display:flex;"><div>left</div><div>right</div></div></div>`
// 	);

// 	const font_size_node = $(".font_size");
// 	font_size_node.addEventListener("change", () => {
// 		const font_size = font_size_node._get_value();
// 	});

// 	document.addEventListener("keydown", (ev) => {
// 		const target = $(ev.target);
// 		if (target.hasAttribute("contenteditable")) {
// 			const prev = target._prev();
// 			const next = target._next();

// 			// if (ev.key === "Enter") {
// 			// 	target.insertAdjacentHTML("afterend", target.outerHTML);
// 			// 	const next = target._next();
// 			// 	next._set_content("");
// 			// 	next.focus();
// 			// 	ev.preventDefault();
// 			// }
// 			// if (ev.key === "Backspace") {
// 			// 	if (window.getSelection().focusOffset === 0 && prev) {
// 			// 		selectElementContentsByIndex(prev, prev.textContent.length);
// 			// 		ev.preventDefault();
// 			// 		if (target.textContent.length === 0) {
// 			// 			target.remove();
// 			// 		}
// 			// 	}
// 			// }
// 			// if (ev.key === "Delete") {
// 			// 	if (window.getSelection().focusOffset === target.textContent.length && next) {
// 			// 		selectElementContentsByIndex(next, 0);
// 			// 		ev.preventDefault();
// 			// 		if (target.textContent.length === 0) {
// 			// 			target.remove();
// 			// 		}
// 			// 	}
// 			// }
// 			// if (ev.key === "ArrowUp") {
// 			// 	if (prev) {
// 			// 		selectElementContentsFromOther(prev, target);
// 			// 		ev.preventDefault();
// 			// 	}
// 			// }
// 			// if (ev.key === "ArrowDown") {
// 			// 	if (next) {
// 			// 		selectElementContentsFromOther(next, target);
// 			// 		ev.preventDefault();
// 			// 	}
// 			// }
// 			// if (ev.key === "ArrowLeft") {
// 			// 	if (window.getSelection().focusOffset === 0 && prev) {
// 			// 		selectElementContentsByIndex(prev, prev.textContent.length);
// 			// 		ev.preventDefault();
// 			// 	}
// 			// }
// 			// if (ev.key === "ArrowRight") {
// 			// 	if (window.getSelection().focusOffset === target.textContent.length && next) {
// 			// 		selectElementContentsByIndex(next, 0);
// 			// 		ev.preventDefault();
// 			// 	}
// 			// }
// 		}
// 	});

// 	//piep_editor.setAttribute("contenteditable", "true");

// 	piep_editor.insertAdjacentHTML("beforeend", html`<div class="piep_editor_cursor"></div>`);
// 	piep_editor_cursor = piep_editor._child(".piep_editor_cursor");

// 	piep_editor_content = piep_editor._child(".piep_editor_content");

// 	document.addEventListener("keydown", (ev) => {
// 		//const target = $(ev.target);

// 		const sel = window.getSelection();
// 		const range = document.createRange();
// 		const focusOffset = sel.focusOffset;
// 		const focus_node = $(sel.focusNode);
// 		const focus_html_node = focus_node._parent("*", { skip: 0 });

// 		/** @type {CharacterData} */
// 		// @ts-ignore
// 		let text_node = focus_node;
// 		if (text_node) {
// 			while (text_node.nodeType === 1) {
// 				if (!text_node.childNodes[0]) {
// 					break;
// 				}
// 				// @ts-ignore
// 				text_node = text_node.childNodes[0];
// 			}
// 		}

// 		let prev_node;
// 		let parent = focus_html_node;
// 		while (parent) {
// 			if (parent._prev()) {
// 				prev_node = parent._prev();
// 				break;
// 			} else {
// 				parent = parent._parent();
// 			}
// 		}
// 		let prev_textable;
// 		if (prev_node && piep_editor.contains(prev_node)) {
// 			prev_textable = def(getLast(prev_node._children("*")), prev_node);
// 		}

// 		let next_node;
// 		parent = focus_html_node;
// 		while (parent) {
// 			if (parent._next()) {
// 				next_node = parent._next();
// 				break;
// 			} else {
// 				parent = parent._parent();
// 			}
// 		}
// 		let next_textable;
// 		if (next_node && piep_editor.contains(next_node)) {
// 			next_textable = def(getLast(next_node._children("*")), next_node);
// 		}

// 		// if (ev.key === "Enter") {
// 		// 	console.log();
// 		// }

// 		//console.log(ev.key, ev.key.length);
// 		if (ev.key.length === 1) {
// 			if (sel) {
// 				if (text_node) {
// 					text_node.insertData(sel.focusOffset, ev.key);
// 					range.setStart(text_node, focusOffset + 1);
// 					range.setEnd(text_node, focusOffset + 1);

// 					sel.removeAllRanges();
// 					sel.addRange(range);

// 					updatePiepCursorPosition();

// 					// piep_editor_content.insertAdjacentHTML("beforeend", ev.key);

// 					// note: dont play with virtual selection but rather adjust it lol, ofc u can do it
// 				}
// 			}
// 		}

// 		if (ev.key === "ArrowLeft") {
// 			if (focusOffset === 0 && prev_textable) {
// 				selectElementContentsByIndex(prev_textable, prev_textable.textContent.length);
// 				ev.preventDefault();
// 			} else {
// 				range.setStart(focus_node, focusOffset - 1);
// 				range.setEnd(focus_node, focusOffset - 1);

// 				sel.removeAllRanges();
// 				sel.addRange(range);
// 			}
// 			updatePiepCursorPosition();
// 		}
// 		if (ev.key === "ArrowRight") {
// 			//console.log(focusOffset, focus_html_node.textContent.length);
// 			if (focusOffset === focus_html_node.textContent.length && next_textable) {
// 				selectElementContentsByIndex(next_textable, 0);
// 				ev.preventDefault();
// 			} else {
// 				range.setStart(focus_node, focusOffset + 1);
// 				range.setEnd(focus_node, focusOffset + 1);

// 				sel.removeAllRanges();
// 				sel.addRange(range);
// 			}
// 			updatePiepCursorPosition();
// 		}
// 		if (ev.key === "Enter") {
// 			//text_node.insertData(sel.focusOffset, "<br>");
// 			const next_text_node = document.createTextNode("CIPA");
// 			text_node.appendChild(next_text_node);
// 			//text_node.insertData(offset, data)

// 			//focus_html_node.insertAdjacentHTML("afterend", "<br>");
// 			//focus_html_node.insertAdjacentHTML("afterend", focus_html_node.outerHTML);
// 			//const next = focus_html_node._next();
// 			//next._set_content("<br>");
// 			//selectElementContentsByIndex(next, 0);
// 			//ev.preventDefault();
// 		}
// 	});

// 	piep_editor.addEventListener("click", (ev) => {
// 		const target = $(ev.target);
// 		const prev = target._prev();
// 		const next = target._next();

// 		const sel = window.getSelection();
// 		const range = document.createRange();

// 		updatePiepCursorPosition();
// 	});

// 	// const piep_editor_observer = new MutationObserver((mutations) => {
// 	// 	for (let mutation of mutations) {
// 	// 		if (mutation.addedNodes) {
// 	// 			for (let node of mutation.addedNodes) {
// 	// 				console.log(node);
// 	// 			}
// 	// 		}
// 	// 	}
// 	// });

// 	// piep_editor_observer.observe(piep_editor, { childList: true });
// });

// function updatePiepCursorPosition() {
// 	const sel = window.getSelection();
// 	const range = document.createRange();

// 	if (sel) {
// 		//console.log(sel.focusNode);
// 		range.setStart(sel.focusNode, sel.focusOffset);
// 		range.setEnd(sel.focusNode, sel.focusOffset);

// 		const piep_editor_rect = piep_editor.getBoundingClientRect();
// 		const selection_cursor_rect = range.getBoundingClientRect();

// 		const width = selection_cursor_rect.width;
// 		const cursor_width = Math.max(width, 2);
// 		const height = selection_cursor_rect.height;
// 		const cursor_height = Math.max(height, 20);

// 		piep_editor_cursor.style.left = selection_cursor_rect.left + (width - cursor_width) * 0.5 - piep_editor_rect.left + "px";
// 		piep_editor_cursor.style.top = selection_cursor_rect.top + (height - cursor_height) * 0.5 - piep_editor_rect.top + "px";
// 		piep_editor_cursor.style.width = cursor_width + "px";
// 		piep_editor_cursor.style.height = cursor_height + "px";
// 	}
// }

// /**
//  *
//  * @param {HTMLBaseElement} node
//  * @param {HTMLBaseElement} from
//  * @returns
//  */
// function selectElementContentsFromOther(node, from) {
// 	const text_node = node.childNodes[0];
// 	const sel = window.getSelection();
// 	const range = document.createRange();
// 	if (!text_node) {
// 		range.setStart(node, 0);
// 		range.setEnd(node, 0);
// 	} else {
// 		const was_cursor_x = window.getSelection().getRangeAt(0).getBoundingClientRect().left;

// 		let last_cursor_x;
// 		for (let i = 0; i <= text_node.textContent.length; i++) {
// 			range.setStart(text_node, i);
// 			range.setEnd(text_node, i);

// 			const cursor_x = range.getBoundingClientRect().left;
// 			if (last_cursor_x === undefined) {
// 				last_cursor_x = cursor_x;
// 			}
// 			if (-last_cursor_x * 0.5 + cursor_x * 1.5 > was_cursor_x) {
// 				break;
// 			}
// 			last_cursor_x = cursor_x;
// 		}
// 	}

// 	sel.removeAllRanges();
// 	sel.addRange(range);
// 	updatePiepCursorPosition();
// }

// /**
//  *
//  * @param {HTMLBaseElement} node
//  * @param {number} pos
//  * @returns
//  */
// function selectElementContentsByIndex(node, pos) {
// 	const text_node = node.childNodes[0];
// 	const sel = window.getSelection();
// 	const range = document.createRange();
// 	if (!text_node) {
// 		range.setStart(node, 0);
// 		range.setEnd(node, 0);
// 	} else {
// 		range.setStart(text_node, pos);
// 		range.setEnd(text_node, pos);
// 	}
// 	sel.removeAllRanges();
// 	sel.addRange(range);
// 	updatePiepCursorPosition();
// }
