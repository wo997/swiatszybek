/* js[global] */
window.addEventListener("load", function () {
  if (window.hasOwnProperty("ontouchstart")) {
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

function performSearch(form) {
  var s = form.search.value.replace(/[ /]/g, "_");
  if (s.length > 35) s = s.substring(0, 35);
  window.location = "/szukaj/" + s;
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

window.mobilecheck = function () {
  var check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

function dateToString(d, type = "") {
  var mon = d.getMonth() + 1;
  var day = d.getDate();

  if (mon < 10) mon = "0" + mon;
  if (day < 10) day = "0" + day;

  return type == "dmy"
    ? day + "-" + mon + "-" + d.getFullYear()
    : d.getFullYear() + "-" + mon + "-" + day;
}

function reverseDateString(dateString, splitter) {
  return dateString.split(splitter).reverse().join(splitter);
}

function xhr(data) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", data.url, true);
  xhr.setRequestHeader("enctype", "multipart/form-data");
  xhr.onload = function () {
    if (data.success) {
      var res = xhr.responseText;
      data.type = nonull(data.type, "json");
      if (data.type == "json") {
        try {
          res = JSON.parse(res);
        } catch {}
      }
      data.success(res);
    }
  };

  var formData = data.formData ? data.formData : new FormData();
  if (data.params) {
    for (var [key, value] of Object.entries(data.params)) {
      if (typeof value === "object" && value !== null) {
        value = JSON.stringify(value);
      }
      formData.append(key, value);
    }
  }
  xhr.send(formData);
  return xhr;
}

function ajax(url, data, good, wrong) {
  // deprecated
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("enctype", "multipart/form-data");
  xhr.onload = function () {
    good(xhr.responseText);
  };
  var formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }
  xhr.send(formData);
}

window.addEventListener("DOMContentLoaded", scaleVideos);
window.addEventListener("resize", scaleVideos);
function scaleVideos() {
  $$("iframe.ql-video").forEach((e) => {
    var h = Math.round(0.56 * e.getBoundingClientRect().width);
    if (h > 500) h = 500;
    e.style.height = h + "px";
  });
}

function nonull(value, defaultValue = "") {
  if (value === null || value === undefined) return defaultValue;
  return value;
}

function delay(action, time, context = window) {
  if (context["await" + action]) clearTimeout(context["await" + action]);
  context["await" + action] = setTimeout(function () {
    context[action](true);
  }, time);
}

function toggleBodyScroll(disable) {
  if (!window.tempScrollTop) {
    window.tempScrollTop = window.pageYOffset;
  }
  if (disable) {
    document.body.classList.add("disable-scroll");
    document.body.style.top = `-${window.tempScrollTop}px`;
  } else {
    document.body.classList.remove("disable-scroll");
    document.body.style.top = `0px`;
    window.scrollTo({ top: window.tempScrollTop });
    window.tempScrollTop = null;
  }
}

function stopAllVideos() {
  var videos = $$("video");
  for (video of videos) {
    video.pause();
  }
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  console.log(textArea);
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "successful" : "unsuccessful";
    console.log("Fallback: Copying text command was " + msg);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
  fallbackCopyTextToClipboard(text); // feels safe
  /*if (!navigator.clipboard) {
    console.log(123456);
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });*/
}

function position(elem) {
  //findParentByStyle(elem,"position","absolute");

  var left = 0,
    top = 0;

  do {
    left += elem.offsetLeft;
    top += elem.offsetTop;
  } while ((elem = elem.offsetParent));

  //console.log()
  /*{
    console.log(elem.style.top);
  }*/

  return { left: left, top: top };

  /*var doc = document.documentElement;
  var window_left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
  var window_top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

  return { left: left - window_left, top: top - window_top };*/
}

function positionWithOffset(elem, offsetX, offestY) {
  var pos = position(elem);
  var rect = elem.getBoundingClientRect();
  return {
    left: pos.left + offsetX * rect.width,
    top: pos.top + offestY * rect.height,
  };
}

function scrollToElement(elem, options = {}) {
  if (!elem) return;
  var rect = elem.getBoundingClientRect();
  var diff =
    (options.parent ? position(elem) : rect).top - nonull(options.offset, 0);
  if (options.parent) {
    diff -= options.parent.scrollTop;
  }
  if (!options.top) {
    diff += (rect.height - window.innerHeight) * 0.5;
  }
  var sag = nonull(options.sag, 100);
  if (Math.abs(diff) > sag) {
    diff -= sag * Math.sign(diff);
    scrollFromTo(options.parent, diff, nonull(options.duration, 50));
  }
}
function scrollFromTo(parent, diff, time, t = 0) {
  if (time < 2) {
    time = 2;
  }
  var d = (4 * diff * (time / 2 - Math.abs(time / 2 - t))) / (time * time);
  if (parent) parent.scrollTop += d;
  else window.scrollBy(0, d);

  if (t < time)
    window.requestAnimationFrame(function () {
      scrollFromTo(parent, diff, time, t + 1);
    });
}

function getWindowScroll() {
  var doc = document.documentElement;
  var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
  var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
  return { left: left, top: top };
}

function removeClasses(className, selector = null) {
  if (selector === null) selector = `.${className}`;
  $$(selector).forEach((e) => {
    e.classList.remove(className);
  });
}

// table end

function escapeHTML(unsafeText) {
  let div = document.createElement("div");
  div.innerText = unsafeText;
  return div.innerHTML;
}

function decodeHtmlEntities(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function renderStatus(status_id) {
  // kernel.php
  return `<div class='rect status_rect' style='background:#${statusList[status_id]["color"]}'>${statusList[status_id]["title"]}</div>`;
}

function moveCursorToEnd(el) {
  el.focus();
  if (typeof el.selectionStart == "number") {
    el.selectionStart = el.selectionEnd = el.value.length;
  } else if (typeof el.createTextRange != "undefined") {
    var range = el.createTextRange();
    range.collapse(false);
    range.select();
  }
}

function toggleDisabled(elem, disabled) {
  if (disabled) elem.setAttribute("disabled", true);
  else elem.removeAttribute("disabled");
}

function smoothScroll(diff, params = {}) {
  var time = 40;
  var t = 0;
  if (params.time) time = params.time;
  if (params.t) t = params.t;

  window.scrollBy(
    0,
    (4 * diff * (time / 2 - Math.abs(time / 2 - t))) / (time * time)
  );
  if (t < time) {
    requestAnimationFrame(() => {
      smoothScroll(diff, { time: time, t: t + 1 });
    });
  } else if (params.callback) {
    params.callback();
  }
}

function scrollToView(elem, params = {}) {
  var time = 40;
  var offset = 0;
  var margin = 0.2;
  if (params.time) time = params.time;
  if (params.offset) time = params.offset;
  if (params.margin) margin = params.margin;

  var r = elem.getBoundingClientRect();

  var top = r.top + offset;
  var bottom = r.top + r.height + offset;

  var topMin = window.innerHeight * margin;
  var bottomMin = window.innerHeight * (1 - margin);

  var diff = 0;

  if (top < topMin) {
    diff = top - topMin;
  } else if (bottom > bottomMin) {
    diff = bottom - bottomMin;
  }

  smoothScroll(diff, { time: time, callback: params.callback });
}

var toolList = [];
function useTool(name) {
  if (toolList.indexOf(name) !== -1) {
    console.warn(`module ${name} registered already`);
    return;
  }
  toolList.push(name);
  var el = document.createElement("script");
  el.src = `/admin/tools/${name}.js?v=${RELEASE}`;
  if (document.body) {
    document.body.appendChild(el);
  } else {
    window.addEventListener("DOMContentLoaded", function () {
      document.body.appendChild(el);
    });
  }
}

function validURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

function removeClassesWithPrefix(node, prefix) {
  node.className = node.className.replace(
    new RegExp(`\\b${prefix}[\\w-]*\\b`, "g"),
    ""
  );
}

function matchClassesWithPrefix(node, prefix) {
  out = [];
  node.classList.forEach((e) => {
    if (e.indexOf(prefix) === 0) out.push(e);
  });
  return out;
}

function scrollToBottom(node) {
  node.scrollTop = node.scrollHeight;
}

function setFormData(data, form = null, params = {}) {
  if (!form) form = document.body;
  Object.entries(data).forEach(([name, value]) => {
    var selector = `[name="${name}"]`;
    if (params.type == "simple-list") {
      selector = `[data-list-param="${name}"]`;
    }
    var e = $(form).find(selector);
    if (!e) {
      return;
    }
    setValue(e, value);
  });

  resizeCallback();
}

function getFormData(form = null) {
  if (!form) form = document.body;
  var data = {};

  form = $(form);
  var excludeHidden = form.hasAttribute("data-exclude-hidden");
  $(form)
    .findAll(`[name]`)
    .forEach((e) => {
      if (excludeHidden && e.findParentByClassName("hidden")) return;
      data[e.getAttribute("name")] = getValue(e);
    });
  return data;
}

function getNodeTextWidth(node) {
  if (!node) return;
  var textNode = [...node.childNodes].find(
    (child) => child.nodeType === Node.TEXT_NODE
  );
  if (!textNode) return getNodeTextWidth(node.children[0]);
  var range = document.createRange();
  range.selectNode(textNode);
  return range.getBoundingClientRect().width;
}

function getLink(phrase) {
  // also kernel.php
  const pl = [
    ",",
    " ",
    "ę",
    "Ę",
    "ó",
    "Ó",
    "ą",
    "Ą",
    "ś",
    "Ś",
    "ł",
    "Ł",
    "ż",
    "Ż",
    "ź",
    "Ź",
    "ć",
    "Ć",
    "ń",
    "Ń",
  ];
  const en = [
    "-",
    "-",
    "e",
    "E",
    "o",
    "O",
    "a",
    "A",
    "s",
    "S",
    "l",
    "L",
    "z",
    "Z",
    "z",
    "Z",
    "c",
    "C",
    "n",
    "N",
  ];
  var le = pl.length;
  for (let i = 0; i < le; i++) {
    phrase = phrase.replace(new RegExp(`${pl[i]}`, "g"), en[i]);
  }
  return phrase
    .toLowerCase()
    .replace(/[^(a-zA-Z0-9-)]/g, "")
    .replace(/-+/g, "-");
}

window.addEventListener("DOMContentLoaded", () => {
  $$(".mobile-hover").forEach((e) => {
    if (mobilecheck()) {
      e.addEventListener("touchstart", () => {
        if (!e.classList.contains("hovered")) {
          setTimeout(() => {
            e.classList.add("hovered");
          }, 0);
        }
      });
    } else {
      e.addEventListener("mouseover", () => {
        e.classList.add("hovered");
      });
      e.addEventListener("mouseleave", () => {
        e.classList.remove("hovered");
      });
    }
  });
});

document.addEventListener("touchstart", (event) => {
  var e = $(".hovered");
  var toggle = $(".hovered .dropdown-header");
  if (e && (!isInNode(event.target, e) || isInNode(event.target, toggle))) {
    //if (e && !isInNode(event.target, e)) {
    e.classList.remove("hovered");
  }
});

function addItemtoBasket(variant_id, diff, callback) {
  if (diff > 0) url = "/basket/add/" + variant_id + "/" + diff;
  else url = "/basket/remove/" + variant_id + "/" + -diff;

  xhr({
    url: url,
    success: (res) => {
      setContent($("#basketContent"), res.basket_content_html);

      $("#amount").innerHTML = res.item_count; // header basket

      if (callback) {
        callback(res);
      }
    },
  });
}

function rgbOrHexStringToHex(rgbOrHexString = "") {
  if (rgbOrHexString.substr(0, 3) != "rgb") {
    return rgbOrHexString;
  }
  return rgbOrHexString.replace(/rgb\((.+?)\)/gi, (_, rgb) => {
    return (
      "#" +
      rgb
        .split(",")
        .map((str) => parseInt(str, 10).toString(16).padStart(2, "0"))
        .join("")
    );
  });
}

function updateOnlineStatus() {
  $(".offline").classList.toggle("shown", !navigator.onLine);
}
window.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("offline", () => {
    updateOnlineStatus();
  });
  window.addEventListener("online", () => {
    updateOnlineStatus();
  });
});
