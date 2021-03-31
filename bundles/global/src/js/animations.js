/* js[global] */

/* in general u wanna use the animator for variable animations, not the static ones ;) */
const ANIMATIONS = {
	blink: `0% {opacity: 1;}50% {opacity: 0;}100% {opacity: 1;}
  `,
	/* for some of them you better dont use the animator but the animate property instead like $.style.animation = "hide 0.4s";*/
	show: `0% {opacity: 0;}100% {opacity: 1;}`,
	hide: `0% {opacity: 1;}100% {opacity: 0;}`,
	replace: (zoom_factor = 0.25) => {
		return `
      0% {opacity: 1;transform: scale(1);}
      50% {opacity: 0;transform: scale(${1 - zoom_factor});}
      51% {opacity: 0;transform: scale(${1 + zoom_factor});}
      100% {opacity: 1;transform: scale(1);}
    `;
	},
};

var wo997_anm_counter = 0;
function createAnimation(keyframes, duration) {
	wo997_anm_counter++;
	const animation_name = `wo997_anm_${wo997_anm_counter}`;
	document.body.insertAdjacentHTML(
		"beforeend",
		html`<style id="${animation_name}">
			@keyframes ${animation_name} {
			    ${keyframes}
			}
			.${animation_name} {
			  animation: ${animation_name} ${duration}ms cubic-bezier(.46,0,.56,1) forwards !important;
			}
		</style> `
	);
	return animation_name;
}

function removeAnimation(animation_name) {
	const style_node = $(`#${animation_name}`);
	if (style_node) {
		style_node.remove();
	}
}

/**
 *
 * @param {PiepNode} node
 */
function cleanNodeFromAnimations(node) {
	return removeClassesWithPrefix(node, "wo997_anm_");
}

function finishNodeAnimation(node, is_early = false) {
	delete node.wo997_anm_timeout;
	const matches = cleanNodeFromAnimations(node);
	if (!matches) {
		return null;
	}

	if (!is_early || node.wo997_anm_early_callback) {
		const callback = node.wo997_anm_callback;
		if (callback) {
			callback();
		}
	}
	delete node.wo997_anm_early_callback;
	delete node.wo997_anm_callback;

	matches.forEach((match) => {
		removeAnimation(match);
	});

	return true;
}

/**
 * @typedef {{
 * callback?(): void
 * early_callback?: boolean
 * }} AnimationOptions
 */

/**
 * @typedef {Object} AnimationNodeParams
 * @property {number} [wo997_anm_timeout]
 * @property {function} [wo997_anm_callback]
 * @property {boolean} [wo997_anm_early_callback]
 *
 * @typedef {AnimationNodeParams & PiepNode} AnimationNode
 * */

/**
 * @param {AnimationNode} node
 * @param {string} keyframes f.e "0% {opacity:0} 100% {opacity:1}"
 * @param {number} duration miliseconds
 * @param {AnimationOptions} options
 */

function animate(node, keyframes, duration, options = {}) {
	if (node._parent(".freeze")) {
		duration = 0;
	}

	if (node.wo997_anm_timeout) {
		finishNodeAnimation(node, true);
		clearTimeout(node.wo997_anm_timeout);
	}

	if (duration > 0) {
		const animation_name = createAnimation(keyframes, duration);

		// cleanup previous animations
		$$(`.${animation_name}`).forEach((e) => {
			e.classList.remove(animation_name);
		});

		node.classList.add(animation_name);
	} else {
		// make sure it can finish
		node.classList.add("wo997_anm_xxx");
	}

	if (options.callback) {
		node.wo997_anm_callback = options.callback;
	}
	node.wo997_anm_early_callback = def(options.early_callback, true);

	// start the second timeout once you finish the frame, that way all animations start at the same time yay
	setTimeout(() => {
		node.wo997_anm_timeout = setTimeout(() => {
			finishNodeAnimation(node);
		}, duration);
	});
}

domload(() => {
	setTimeout(() => {
		document.body.classList.remove("freeze");
	}, 100);
});
