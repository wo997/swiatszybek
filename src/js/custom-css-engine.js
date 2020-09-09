/* js[global] */

window.addEventListener("resize", function () {
  resizeCallback();
});
window.addEventListener("DOMContentLoaded", function () {
  resizeCallback();
});

// remember to switch back to regular responsive type, used in slider edit form
var forceMobile = false;

function getCustomSize(node, val) {
  if (val.charAt(val.length - 1) == "%") {
    return (
      ($(node).parent().getBoundingClientRect().width * parseInt(val)) / 100 +
      "px"
    );
  }
  return val;
}

function resizeCallback() {
  setCustomHeights();

  var responsiveType =
    forceMobile || window.innerWidth < 800 ? "mobile" : "desktop";

  $$(".cms-container").forEach((e) => {
    if (responsiveType == "desktop") {
      e.classList.toggle(
        "desktop-full-width",
        e.hasAttribute("data-desktop-full-width")
      );
    } else {
      e.classList.remove("desktop-full-width");
    }
  });

  var attribute = `data-${responsiveType}-width`;
  $$(`[${attribute}]`).forEach((e) => {
    e.style.width = e.getAttribute(attribute);
  });

  var attribute = `data-${responsiveType}-min-height`;
  $$(`[${attribute}]`).forEach((e) => {
    e.style.minHeight = getCustomSize(e, e.getAttribute(attribute));
  });

  for (let direction of ["Left", "Right", "Top", "Bottom"]) {
    for (let type of ["margin", "padding"]) {
      var attribute = `data-${type}_${direction.toLowerCase()}`;
      $$(`[${attribute}]`).forEach((e) => {
        if (e.classList.contains("removing")) {
          return;
        }
        var v = e.getAttribute(attribute);
        var jsstyle = type + direction;
        v = getCustomSize(e, v);

        if (
          ["Top", "Bottom"].indexOf(direction) != -1 &&
          e.classList.contains("cms-container") &&
          findParentById(e, "actual_cms_wrapper")
        ) {
          v = `calc(${v} + 10px)`;
        }

        e.style[jsstyle] = v;
      });
    }
  }

  var attribute = `data-${responsiveType}-justify-content`;
  $$(`[${attribute}]`).forEach((e) => {
    e.style.justifyContent = e.getAttribute(attribute);
  });

  var attribute = `data-${responsiveType}-align-items`;
  $$(`[${attribute}]`).forEach((e) => {
    e.style.alignItems = e.getAttribute(attribute);
  });

  var attribute = `data-${responsiveType}-flex-flow`;
  $$(`[${attribute}]`).forEach((e) => {
    e.style.flexFlow = e.getAttribute(attribute);
  });
}

function setCustomHeights() {
  $$("[data-height]").forEach((node) => {
    var height = node.getAttribute("data-height");
    if (height.indexOf("w") !== -1) {
      height = height.replace("w", "");
      var r = node.getBoundingClientRect();
      var real_height = Math.round(r.width * parseFloat(height));
      node.style.height = `${real_height}px`;
    }
  });
}
