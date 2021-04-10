/* js[global] */

/**
 *
 * @param {PiepNode} node
 */
function autoHeight(node) {
	node.style.height = "0";
	node.style.height = node.scrollHeight + 2 + "px";
}
