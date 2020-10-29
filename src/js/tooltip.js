/* js[global] */
var lastTooltip = null;
domload(() => {
  window.addEventListener("mousemove", function (event) {
    var t = $(".tooltip");
    if (!t) return;

    var e = findParentByAttribute(event.target, "data-tooltip");
    if (e) {
      var tooltipText = e.getAttribute("data-tooltip");

      if (tooltipText === "") {
        if (e.offsetWidth < e.scrollWidth || e.scrollHeight > e.clientHeight) {
          tooltipText = e.innerHTML;
        } else {
          return;
        }
      }

      if (lastTooltip != e) {
        t.style.display = "block";
        t.innerHTML = tooltipText;
      }

      var nodeRect = e.getBoundingClientRect();
      var tooltipRect = t.getBoundingClientRect();

      var offsetX = 3;
      var offsetY = 2;
      var left = nodeRect.left + offsetX + nodeRect.width;
      var top = nodeRect.top + offsetY + nodeRect.height;

      var nodeRectPosition = e.getAttribute("data-position");
      if (nodeRectPosition == "center") {
        left -= nodeRect.width / 2 + tooltipRect.width / 2 + offsetX;
      } else if (nodeRectPosition == "right") {
        top -= nodeRect.height / 2 + tooltipRect.height / 2 + offsetY;
      }

      var maxLeft = window.innerWidth - 30 - tooltipRect.width;
      if (left > maxLeft) {
        left -= tooltipRect.width + offsetX * 2 + nodeRect.width;
      }
      if (left > maxLeft) {
        left = maxLeft;
      }
      if (left < 10) {
        left = 10;
      }

      if (top < 10) {
        top = 10;
      }
      var maxH = window.innerHeight - tooltipRect.height - 10;
      if (top > maxH) {
        top = maxH - nodeRect.height;
      }

      t.style.left = left + "px";
      t.style.top = top + "px";
    } else t.style.display = "none";

    lastTooltip = e;
  });
  window.addEventListener("click", function (ev) {
    var t = $(".tooltip");
    if (t) t.style.display = "none";
  });

  window.addEventListener("resize", tooltipResizeCallback);
  tooltipResizeCallback();
});
function tooltipResizeCallback() {
  $$(".check-tooltip").forEach((e) => {
    e.classList.toggle(
      "require-tooltip",
      e.offsetWidth < e.scrollWidth || e.scrollHeight > e.clientHeight
    );
  });
}
