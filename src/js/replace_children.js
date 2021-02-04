/* js[global] */

/**
 *
 * @param {PiepNode} node
 * @param {string[]} children_html
 */
function setNodeChildren(node, children_html) {
	// @ts-ignore
	const last_children_html = def(node._last_children_html, []);

	let i = -1;
	for (const child_html of children_html) {
		i++;
		if (last_children_html[i] !== child_html) {
			const cell = createNodeFromHtml(child_html);
			const ref = node._direct_children()[i];
			node.insertBefore(cell, ref);
			if (ref) {
				ref.remove();
			}
		}
	}

	node._children(`.dt_cell:nth-child(n + ${children_html.length + 1})`).forEach((e) => {
		e.remove();
	});

	// @ts-ignore
	node._last_children_html = children_html;
}
