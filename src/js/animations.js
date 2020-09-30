/* js[global] */

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

function animate(node, duration, keyframes, callback = null) {
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
