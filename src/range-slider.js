function registerRangeSliders() {
  const allRanges = document.querySelectorAll("input[type=range]:not(.range)");
  allRanges.forEach((range) => {
    var background = range.getAttribute("data-background");
    var cl = range.getAttribute("data-class");

    range.insertAdjacentHTML(
      "afterend",
      `
      <div class="range-wrap">
        <div class="range-rect"></div>
        ${range.outerHTML}
        <output class="bubble"></output>
      </div>
    `
    );

    const wrap = range.nextElementSibling;

    removeNode(range);

    range = wrap.querySelector("input[type=range]");
    range.classList.add("range");

    if (cl) {
      range.classList.add(cl);
      wrap.classList.add(cl + "-wrapper");
    }

    const rect = wrap.querySelector(".range-rect");
    if (background) rect.style.background = background;

    const bubble = wrap.querySelector(".bubble");

    range.addEventListener("input", () => {
      setBubble(range, bubble);
    });
    range.addEventListener("change", () => {
      setBubble(range, bubble);
    });

    setBubble(range, bubble);
  });

  function setBubble(range, bubble) {
    const val = range.value;

    const min = range.min || 0;
    const max = range.max || 100;

    const offset = Number(((val - min) * 100) / (max - min));

    bubble.textContent = val;

    // yes, 14px is a magic number
    bubble.style.left = `calc(${offset}% - 14px)`;
  }
}

function setRangeSliderValue(slider, value) {
  slider.value = value;
  slider.dispatchEvent(new Event("input"));
}
