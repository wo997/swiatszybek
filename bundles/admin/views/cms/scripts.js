/* js[view] */

/** @type {PiepNode} */
let piep_editor;
/** @type {PiepNode} */
let piep_editor_cursor;
/** @type {PiepNode} */
let piep_editor_content;

domload(() => {
	const font_size_node = $(".font_size");
	font_size_node.addEventListener("change", () => {
		const font_size = font_size_node._get_value();
	});

	document.addEventListener("keydown", (ev) => {
		const target = $(ev.target);
		if (target.hasAttribute("contenteditable")) {
			const prev = target._prev();
			const next = target._next();

			// if (ev.key === "Enter") {
			// 	target.insertAdjacentHTML("afterend", target.outerHTML);
			// 	const next = target._next();
			// 	next._set_content("");
			// 	next.focus();
			// 	ev.preventDefault();
			// }
			// if (ev.key === "Backspace") {
			// 	if (window.getSelection().focusOffset === 0 && prev) {
			// 		selectElementContentsByIndex(prev, prev.textContent.length);
			// 		ev.preventDefault();
			// 		if (target.textContent.length === 0) {
			// 			target.remove();
			// 		}
			// 	}
			// }
			// if (ev.key === "Delete") {
			// 	if (window.getSelection().focusOffset === target.textContent.length && next) {
			// 		selectElementContentsByIndex(next, 0);
			// 		ev.preventDefault();
			// 		if (target.textContent.length === 0) {
			// 			target.remove();
			// 		}
			// 	}
			// }
			// if (ev.key === "ArrowUp") {
			// 	if (prev) {
			// 		selectElementContentsFromOther(prev, target);
			// 		ev.preventDefault();
			// 	}
			// }
			// if (ev.key === "ArrowDown") {
			// 	if (next) {
			// 		selectElementContentsFromOther(next, target);
			// 		ev.preventDefault();
			// 	}
			// }
			// if (ev.key === "ArrowLeft") {
			// 	if (window.getSelection().focusOffset === 0 && prev) {
			// 		selectElementContentsByIndex(prev, prev.textContent.length);
			// 		ev.preventDefault();
			// 	}
			// }
			// if (ev.key === "ArrowRight") {
			// 	if (window.getSelection().focusOffset === target.textContent.length && next) {
			// 		selectElementContentsByIndex(next, 0);
			// 		ev.preventDefault();
			// 	}
			// }
		}
	});

	piep_editor = $(".piep_editor");
	//piep_editor.setAttribute("contenteditable", "true");

	piep_editor.insertAdjacentHTML("beforeend", html`<div class="piep_editor_cursor"></div>`);
	piep_editor_cursor = piep_editor._child(".piep_editor_cursor");

	piep_editor_content = piep_editor._child(".piep_editor_content");

	document.addEventListener("keydown", (ev) => {
		//const target = $(ev.target);

		const sel = window.getSelection();
		const range = document.createRange();
		const focusOffset = sel.focusOffset;
		const focus_node = $(sel.focusNode);
		const focus_html_node = focus_node._parent("*", { skip: 0 });

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

		// if (ev.key === "Enter") {
		// 	console.log();
		// }

		console.log(ev.key, ev.key.length);
		if (ev.key.length === 1) {
			if (sel) {
				/** @type {ChildNode} */
				let text_node = focus_node;
				if (text_node) {
					while (text_node.nodeType === 1) {
						if (!text_node.childNodes[0]) {
							break;
						}
						text_node = text_node.childNodes[0];
					}

					text_node.textContent =
						text_node.textContent.substring(0, sel.focusOffset) + ev.key + text_node.textContent.substring(focusOffset);
					range.setStart(text_node, focusOffset + 1);
					range.setEnd(text_node, focusOffset + 1);

					sel.removeAllRanges();
					sel.addRange(range);

					updatePiepCursorPosition();

					// piep_editor_content.insertAdjacentHTML("beforeend", ev.key);

					// note: dont play with virtual selection but rather adjust it lol, ofc u can do it
				}
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
			console.log(focusOffset, focus_html_node.textContent.length);
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
	});

	piep_editor.addEventListener("click", (ev) => {
		const target = $(ev.target);
		const prev = target._prev();
		const next = target._next();

		const sel = window.getSelection();
		const range = document.createRange();

		updatePiepCursorPosition();
	});

	// const piep_editor_observer = new MutationObserver((mutations) => {
	// 	for (let mutation of mutations) {
	// 		if (mutation.addedNodes) {
	// 			for (let node of mutation.addedNodes) {
	// 				console.log(node);
	// 			}
	// 		}
	// 	}
	// });

	// piep_editor_observer.observe(piep_editor, { childList: true });
});

function updatePiepCursorPosition() {
	const sel = window.getSelection();
	const range = document.createRange();

	if (sel) {
		console.log(sel.focusNode);
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
}
