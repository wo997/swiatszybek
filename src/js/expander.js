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

function expandWithArrow(elem, source, options = {}) {
  source.classList.toggle("open", expand(elem, null, options));
}

function expand(elem, show = null, options = {}) {
  if (show === null) show = elem.classList.contains("hidden");
  if (show ^ elem.classList.contains("hidden")) return;
  var duration =
    options.duration || options.duration === 0 ? options.duration : 250;
  var h = elem.scrollHeight;

  elem.style.transition = "";
  elem.style.height = (!show ? h : 0) + "px";

  var firstChild = elem.children ? elem.children[0] : null;
  if (firstChild) {
    firstChild.style.transition = "0s all";
    //firstChild.style.marginTop = -(show ? h * 0.15 : 0) + "px";
  }
  setTimeout(() => {
    elem.style.transition = `opacity ${
      duration / (show ? 500 : 1000)
    }s, height ${duration / 1000}s, padding ${duration / 1000}s`;
    elem.style.height = (show ? h : 0) + "px";
    elem.classList.toggle("hidden", !show);
    elem.scrollTop = 0;

    if (firstChild) {
      firstChild.style.transition = `margin-top ${
        duration / (show ? 500 : 1000)
      }s`;
      //firstChild.style.marginTop = -(!show ? h * 0.15 : 0) + "px";
    }
  }, 0);
  setTimeout(() => {
    elem.style.transition = ``;
    elem.style.height = "";

    if (firstChild) {
      firstChild.style.transition = ``;
      //firstChild.style.marginTop = "";
    }
  }, duration);
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
