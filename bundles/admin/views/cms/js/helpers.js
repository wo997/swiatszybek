/* js[piep_cms] */

function setSelectionRange(range) {
	const sel = window.getSelection();
	sel.removeAllRanges();
	if (range) {
		sel.addRange(range);
	}
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

/**
 *
 * @param {PiepNode} node
 * @param {number} pos
 * @returns
 */
function getRangeByIndex(node, pos, end = undefined) {
	const text_node = this.getTextNode(node);
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
	const range = this.getRangeByIndex(node, pos, end);
	sel.removeAllRanges();
	sel.addRange(range);
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
