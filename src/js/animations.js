/* js[global] */

/* in general u wanna use the animator for variable animations, not the static ones ;) */
const ANIMATIONS = {
	blink: `
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  `,
	/* for some of them you better dont use the animator but the animate property instead like $.style.animation = "hide 0.4s";*/
	show: `
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  `,
	hide: `
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  `,
	replace: (zoom_factor = 0.25) => {
		return `
      0% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0;
        transform: scale(${1 - zoom_factor});
      }
      51% {
        opacity: 0;
        transform: scale(${1 + zoom_factor});
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    `;
	},
};

var wo997_animation_counter = 0;
function createAnimation(keyframes, duration) {
	wo997_animation_counter++;
	var animation_name = `wo997_animation_${wo997_animation_counter}`;
	document.body.insertAdjacentHTML(
		"beforeend",
		/*html*/ `<style id="${animation_name}">
      @keyframes ${animation_name} {
          ${keyframes}
      }
      .${animation_name} {
        animation: ${animation_name} ${duration}ms ease forwards !important;
      }
    </style>
    `
	);
	return animation_name;
}

function removeAnimation(animation_name) {
	const style_node = $(`#${animation_name}`);
	if (style_node) {
		style_node.remove();
	}
}

function finishNodeAnimation(node, is_early = false) {
	delete node.wo997_animation_timeout;
	const matches = removeClassesWithPrefix(node, "wo997_animation_");
	if (!matches) {
		return null;
	}

	if (!is_early || node.wo997_animation_early_callback) {
		const callback = node.wo997_animation_callback;
		if (callback) {
			callback();
		}
	}
	delete node.wo997_animation_early_callback;
	delete node.wo997_animation_callback;

	matches.forEach((match) => {
		removeAnimation(match);
	});
}

// exclude start
class AnimationOptions {
	callback() {}
	/** @type {boolean} */
	early_callback;
}
// exclude end

/**
 * @param {PiepNode} node
 * @param {string} keyframes
 * @param {number} duration
 * @param {AnimationOptions} options
 */

function animate(node, keyframes, duration, options = {}) {
	var animation_name = createAnimation(keyframes, duration);
	if (node.wo997_animation_timeout) {
		finishNodeAnimation(node, true);
		window.clearTimeout(node.wo997_animation_timeout);
	}

	// cleanup previous animations
	$$(`.${animation_name}`).forEach((e) => {
		e.classList.remove(animation_name);
	});

	node.classList.add(animation_name);
	if (options.callback) {
		node.wo997_animation_callback = options.callback;
	}
	node.wo997_animation_early_callback = nonull(options.early_callback, true);

	// crazy, start the second timeout once you finish the frame ;)
	setTimeout(() => {
		node.wo997_animation_timeout = setTimeout(() => {
			finishNodeAnimation(node);
		}, duration);
	});
}

domload(() => {
	setTimeout(() => {
		removeClasses("freeze_before_load");
	}, 200);
});

/*

function zoomNode(node, direction, options = {}) {
	const styles = window.getComputedStyle(node);

	const w = parseInt(styles.width);
	const h = parseInt(styles.height);

	const mr_l = parseInt(styles.marginLeft);
	const mr_r = parseInt(styles.marginRight);

	const mr_t = parseInt(styles.marginTop);
	const mr_b = parseInt(styles.marginBottom);

	const step_in = `
        transform: scale(1,1);
        margin: ${mr_t}px ${mr_r}px ${mr_b}px ${mr_l}px;
    `;
	const step_out = `
        transform: scale(0,0);
        margin: ${-h * 0.5}px ${-w * 0.5}px;
    `;

	let keyframes = "";

	if (direction == "out") {
		keyframes = `0% {${step_in}opacity: 1;} 100% {${step_out}opacity: 0;}`;
	} else {
		keyframes = `0% {${step_out}opacity: 0;} 100% {${step_in}opacity: 1;}`;
	}

	animate(node, keyframes, nonull(options.duration, 200), () => {
		if (options.callback) {
			options.callback();
		}
	});
}

*/
