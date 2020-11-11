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
function createAnimation(keyframes) {
  wo997_animation_counter++;
  var animation_name = `wo997_animation_${wo997_animation_counter}`;
  document.body.insertAdjacentHTML(
    "beforeend",
    `<style id="${animation_name}">
    @keyframes ${animation_name} {
        ${keyframes}
    }
    </style>`
  );
  return animation_name;
}

function removeAnimation(animation_name) {
  $(`#${animation_name}`).remove();
}

function animate(node, keyframes, duration, callback = null) {
  var animation_name = createAnimation(keyframes);
  if (node.animationTimeout) {
    window.clearTimeout(node.animationTimeout);
  }
  node.style.animation = `${animation_name} ${duration}ms forwards`;
  node.animationTimeout = setTimeout(() => {
    if (node.style.animation == animation_name) {
      node.style.animation = "";
    }
    if (callback) {
      callback();
    }
    removeAnimation(animation_name);
  }, duration);
}

domload(() => {
  setTimeout(() => {
    removeClasses("freeze_before_load");
  }, 200);
});
