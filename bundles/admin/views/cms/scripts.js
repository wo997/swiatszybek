/* js[view] */

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

			if (ev.key === "Enter") {
				target.insertAdjacentHTML("afterend", target.outerHTML);
				const next = target._next();
				next._set_content("");
				next.focus();
				ev.preventDefault();
			}
			if (ev.key === "Backspace") {
				if (window.getSelection().focusOffset === 0 && prev) {
					selectElementContentsByIndex(prev, prev.textContent.length);
					ev.preventDefault();
					if (target.textContent.length === 0) {
						target.remove();
					}
				}
			}
			if (ev.key === "Delete") {
				if (window.getSelection().focusOffset === target.textContent.length && next) {
					selectElementContentsByIndex(next, 0);
					ev.preventDefault();
					if (target.textContent.length === 0) {
						target.remove();
					}
				}
			}
			if (ev.key === "ArrowUp") {
				if (prev) {
					selectElementContentsFromOther(prev, target);
					ev.preventDefault();
				}
			}
			if (ev.key === "ArrowDown") {
				if (next) {
					selectElementContentsFromOther(next, target);
					ev.preventDefault();
				}
			}
			if (ev.key === "ArrowLeft") {
				if (window.getSelection().focusOffset === 0 && prev) {
					selectElementContentsByIndex(prev, prev.textContent.length);
					ev.preventDefault();
				}
			}
			if (ev.key === "ArrowRight") {
				if (window.getSelection().focusOffset === target.textContent.length && next) {
					selectElementContentsByIndex(next, 0);
					ev.preventDefault();
				}
			}
		}
	});
});

/**
 *
 * @param {HTMLBaseElement} node
 * @param {HTMLBaseElement} from
 * @returns
 */
function selectElementContentsFromOther(node, from) {
	const text_node = node.childNodes[0];
	if (!text_node) {
		return;
	}

	const was_cursor_x = window.getSelection().getRangeAt(0).getBoundingClientRect().left;

	const sel = window.getSelection();
	const range = document.createRange();

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
	if (!text_node) {
		return;
	}
	const sel = window.getSelection();
	const range = document.createRange();

	range.setStart(text_node, pos);
	range.setEnd(text_node, pos);

	sel.removeAllRanges();
	sel.addRange(range);
}
