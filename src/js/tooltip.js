/* js[global] */
var lastTooltip = null;
window.addEventListener("mousemove", function (event) {
  var t = $(".tooltip");
  if (!t) return;

  var e = findParentByAttribute(event.target, "data-tooltip");
  if (e) {
    var tooltipText = e.getAttribute("data-tooltip");
    if (lastTooltip != e) {
      t.style.display = "block";
      t.innerHTML = tooltipText;
    }

    var nodeRect = e.getBoundingClientRect();
    var tooltipRect = t.getBoundingClientRect();

    var offsetX = 7;
    var left = nodeRect.left + offsetX + nodeRect.width;

    var nodeRectition = e.getAttribute("data-position");
    if (position == "center") {
      left -= nodeRect.width / 2 + tooltipRect.width / 2 + offsetX;
    }

    var maxLeft = window.innerWidth - 30 - tooltipRect.width;
    if (left > maxLeft) {
      left -= tooltipRect.width / 2 + offsetX;
    }
    if (left > maxLeft) {
      left = maxLeft;
    }
    if (left < 10) {
      left = 10;
    }

    var top = nodeRect.top + 4 + nodeRect.height;
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
