/* js[global] */

window.addEventListener("load", function () {
  if ("ontouchstart" in window) {
    var expandable = document.getElementsByClassName("expandable");
    for (i = 0; i < expandable.length; i++) {
      expandable[i].insertAdjacentHTML(
        "beforeend",
        `<button type='button' class='drop-arrow' onclick='return mobileDrop(this);'></button>`
      );
    }
  }
});

function mobileDrop(obj) {
  obj = obj.parent().parent();
  if (obj.className == "") {
    obj.className = "mobile-drop";
  } else {
    obj.className = "";
  }
  return false;
}

function expandWithArrow(elem, source, open = null, options = {}) {
  source.classList.toggle("open", expand(elem, open, options));
}

function expand(elem, show = null, options = {}) {
  if (!elem) {
    return;
  }
  if (show === null) show = elem.classList.contains("hidden");
  if (show ^ elem.classList.contains("hidden")) return;

  var animation_node = elem.find(".expander_space");
  if (!animation_node) {
    elem.insertAdjacentHTML("afterbegin", "<div class='expander_space'></div>");
    animation_node = elem.find(".expander_space");
  }

  var duration =
    options.duration || options.duration === 0 ? options.duration : 250;
  var h = elem.scrollHeight;

  var h1 = (!show ? h : 0) + "px";
  var h2 = (show ? h : 0) + "px";

  var o1 = !show ? 1 : 0;
  var o2 = show ? 1 : 0;

  elem.classList.toggle("hidden", !show);
  elem.classList.add("animating");

  if (show) {
    elem.classList.remove("animate_hidden");
  }

  var m1 = (show ? -25 : 0) + "px";
  var m2 = (!show ? -25 : 0) + "px";

  animate(
    animation_node,
    duration,
    `
    0% {
      margin-top: ${m1};
    }
    100% {
      margin-top: ${m2};
    }
  `
  );

  animate(
    elem,
    duration,
    `
      0% {
        height: ${h1};
        opacity: ${o1};
      }
      100% {
        height: ${h2};
        opacity: ${o2};
      }
    `,
    () => {
      elem.style.height = show ? "" : "0px";

      if (!show) {
        elem.classList.add("animate_hidden");
      }
      elem.classList.remove("animating");

      if (options.callback) {
        options.callback();
      }
    }
  );

  return show;
}

window.addEventListener("DOMContentLoaded", () => {
  $$("nav a").forEach((a) => {
    href = a.getAttribute("href");
    if (href == "/") {
      if (location.pathname == "/") {
        a.classList.add("current-route");
      }
    } else if (location.pathname.indexOf(href) === 0) {
      a.classList.add("current-route");
    } else if (location.href.indexOf(href) === 0) {
      a.classList.add("current-route");
    }
  });

  $$(".expandClick").forEach((e) => {
    e.find(".expandHeader").addEventListener("click", () => {
      e.classList.toggle("expanded");
    });
  });
});
