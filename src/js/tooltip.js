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

    var pos = e.getBoundingClientRect();
    var tooltipRect = t.getBoundingClientRect();

    var offsetX = 7;
    var left = pos.left + offsetX + pos.width;

    var position = e.getAttribute("data-position");
    if (position == "center") {
      left -= pos.width / 2 + tooltipRect.width / 2 + offsetX;
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

    t.style.left = left + "px";
    t.style.top = pos.top + 4 + pos.height + "px";
  } else t.style.display = "none";

  lastTooltip = e;
});
window.addEventListener("click", function (ev) {
  var t = $(".tooltip");
  if (t) t.style.display = "none";
});
