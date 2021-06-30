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
	while (text_node && text_node.nodeType !== Node.TEXT_NODE) {
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
	const text_node = getTextNode(node);
	const range = document.createRange();
	if (!text_node) {
		range.setStart(node, 0);
		range.setEnd(node, 0);
	} else {
		try {
			range.setStart(text_node, pos);
			range.setEnd(text_node, def(end, pos));
		} catch (e) {
			console.error(e, node);
			range.setStart(text_node, 0);
			range.setEnd(text_node, 0);
		}
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
	//const sel = window.getSelection();
	const range = getRangeByIndex(node, pos, end);
	// sel.removeAllRanges();
	// sel.addRange(range)
	window.setSelectionRange(range);
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
 * @param {number[]} indices_a
 * @param {number[]} indices_b
 * @return {-1 | 1 | 0}
 */
function compareIndices(indices_a, indices_b) {
	const len_a = indices_a.length;
	const len_b = indices_b.length;
	const search_len = Math.min(len_a, len_b);
	for (let i = 0; i < search_len; i++) {
		const compare = Math.sign(indices_b[i] - indices_a[i]);
		if (compare !== 0) {
			// @ts-ignore
			return compare;
		}
	}
	// @ts-ignore
	return Math.sign(len_b - len_a);
}

/**
 *
 * @param {PiepNode} node
 * @param {string[]} classes
 */
function setNodeClasses(node, classes) {
	node.classList.add(...classes);
	// hacky but worky ;)
	[...node.classList].forEach((c) => {
		if (!classes.includes(c)) {
			node.classList.remove(c);
		}
	});
}

/**
 *
 * @param {PiepNode} node
 * @param {*} empty
 */
function displayPlaceholder(node, empty, match, content) {
	const placeholder = node._direct_child(match);
	if (empty) {
		if (!placeholder) {
			node.insertAdjacentHTML("beforeend", content);
		}
	} else {
		if (placeholder) {
			placeholder.remove();
		}
	}
}
