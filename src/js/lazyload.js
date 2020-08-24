/* js[global] */

function isNodeOnScreen(e, offset = -10) {
  var r = e.getBoundingClientRect();
  console.log(r.height);
  console.log(
    $(e).findParentByClassName("cms-block-content").getBoundingClientRect()
      .height
  );
  if (
    r.y > window.innerHeight + offset ||
    r.y + r.height < -offset ||
    r.x > window.innerWidth + offset ||
    r.x + r.width < -offset
  ) {
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("img[data-src]").forEach((e) => {
    if (isNodeOnScreen(e)) {
      e.src = e.getAttribute("data-src");
      e.removeAttribute("data-src");
    }
  });
});

document.addEventListener("scroll", () => {
  document.querySelectorAll("img[data-src]").forEach((e) => {
    if (!isNodeOnScreen(e, 500)) {
      return;
    }
    e.src = e.getAttribute("data-src");
    // e.classList.remove("lazy");
    e.removeAttribute("data-src");
    e.classList.add("hasimage");
    e.style.opacity = 0;
  });
  document.querySelectorAll(".hasimage").forEach((e) => {
    if (!isNodeOnScreen(e)) {
      return;
    }
    e.style.animation = "fadeIn 0.45s";
    e.style.opacity = 1;
    e.classList.remove("hasimage");
  });
});
