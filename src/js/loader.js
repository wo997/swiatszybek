/* js[global] */

/**
 *
 * @param {PiepNode} node
 */
function showLoader(node) {
	node.insertAdjacentHTML(
		"beforeend",
		html`
			<div class="mul7">
				<div class="mul7circ m7c1"></div>
				<div class="mul7circ m7c2"></div>
				<div class="mul7circ m7c3"></div>
				<div class="mul7circ m7c4"></div>
				<div class="mul7circ m7c5"></div>
				<div class="mul7circ m7c6"></div>
				<div class="mul7circ m7c7"></div>
				<div class="mul7circ m7c8"></div>
				<div class="mul7circ m7c9"></div>
				<div class="mul7circ m7c10"></div>
				<div class="mul7circ m7c11"></div>
				<div class="mul7circ m7c12"></div>
			</div>
			<link href="/admin/tools/loader.css?v=${RELEASE}" rel="stylesheet" />
		`
	);
}