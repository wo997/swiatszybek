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
	$(`#${animation_name}`).remove();
}

function animate(node, keyframes, duration, callback = null) {
	var animation_name = createAnimation(keyframes, duration);
	if (node.animationTimeout) {
		window.clearTimeout(node.animationTimeout);
	}

	$$(`.${animation_name}`).forEach((e) => {
		e.classList.remove(animation_name);
	});
	node.classList.add(animation_name);

	// crazy, start the second timeout once you finish the frame ;)
	setTimeout(() => {
		node.animationTimeout = setTimeout(() => {
			node.classList.remove(animation_name);
			if (callback) {
				callback();
			}
			removeAnimation(animation_name);
		}, duration);
	});
}

domload(() => {
	setTimeout(() => {
		removeClasses("freeze_before_load");
	}, 200);
});
