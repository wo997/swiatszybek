/* js[global] */

/**
 *
 * @param {PiepNode} node
 */
function showLoader(node) {
	if (node._child(".mul7")) return;

	node.insertAdjacentHTML(
		"beforeend",
		html`
			<div class="mul7">
				<div class="m7c1"></div>
				<div class="m7c3"></div>
				<div class="m7c5"></div>
				<div class="m7c7"></div>
				<div class="m7c9"></div>
				<div class="m7c11"></div>
			</div>
		`
	);
}
/**
 *
 * @param {PiepNode} node
 */
function hideLoader(node) {
	const mul7 = node._child(".mul7");
	mul7.style.animation = "0.4s hide";
	setTimeout(() => {
		mul7.remove();
	}, 200);
}
