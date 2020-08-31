/* js[global] */
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
  node.style.animation = `${animation_name} ${duration}ms forwards`;
  setTimeout(() => {
    if (node.style.animation == animation_name) {
      node.style.animation = "";
    }
    if (callback) {
      callback();
    }
    removeAnimation(animation_name);
  }, duration);
}
