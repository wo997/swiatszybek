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

function finishNodeAnimation(node) {
	delete node.wo997_animation_timeout;
	const animation_name = node.wo997_animation_name;
	if (!animation_name) {
		return;
	}
	node.classList.remove(animation_name);
	delete node.wo997_animation_name;

	const callback = node.wo997_animation_callback;
	if (callback) {
		callback();
		delete node.wo997_animation_callback;
	}
	removeAnimation(animation_name);
}

function animate(node, keyframes, duration, callback = null) {
	var animation_name = createAnimation(keyframes, duration);
	if (node.wo997_animation_timeout) {
		finishNodeAnimation(node);
		window.clearTimeout(node.wo997_animation_timeout);
	}

	// cleanup previous animations
	$$(`.${animation_name}`).forEach((e) => {
		e.classList.remove(animation_name);
	});

	node.classList.add(animation_name);
	node.wo997_animation_name = animation_name;
	if (callback) {
		node.wo997_animation_callback = callback;
	}

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
