/* js[global] */

/**
 *
 * @param {PiepNode} node
 */
function showLoader(node = undefined) {
	if (node === undefined) {
		node = $(document.body);
	}
	if (node._child(".mul7")) return;

	node.insertAdjacentHTML(
		"beforeend",
		html`
			<div class="mul7">
				<div class="rec"></div>
			</div>
		`
	);
}
/**
 *
 * @param {PiepNode} node
 */
function hideLoader(node = undefined) {
	if (node === undefined) {
		node = $(document.body);
	}
	const mul7 = node._child(".mul7");
	mul7.style.animation = "0.4s hide";
	setTimeout(() => {
		mul7.remove();
	}, 200);
}
