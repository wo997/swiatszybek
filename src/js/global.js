/* js[global] */

function domload(callback) {
  document.addEventListener("DOMContentLoaded", callback);
}

function windowload(callback) {
  window.addEventListener("load", callback);
}

function xhr(data) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", data.url, true);
  xhr.setRequestHeader("enctype", "multipart/form-data");
  xhr.onload = function () {
    var res = xhr.responseText;
    data.type = nonull(data.type, "json");
    var res_json = null;

    var match_reload_required = "[reload_required]";
    var reload_required = false;
    if (
      res.substring(0, match_reload_required.length) === match_reload_required
    ) {
      res = res.substring(match_reload_required.length);
      reload_required = true;
    }

    try {
      res_json = JSON.parse(res);
    } catch {}

    if (data.success) {
      data.success(data.type == "json" ? res_json : res);
    }

    let reloading = false;

    if (res_json) {
      if (res_json.redirect) {
        window.location = res_json.redirect;
      }
      if (res_json.reload) {
        reloading = true;
        window.location.reload();
      }
    }

    if (
      !reloading &&
      reload_required &&
      IS_ADMIN &&
      confirm("Wymagane jest odświeżenie strony, czy chcesz kontynuować?")
    ) {
      window.location.reload();
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
  formData.append("xhr", true);
  xhr.send(formData);
  return xhr;
}

// deprecated
function ajax(url, data, good, wrong) {
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

function nonull(value, defaultValue = "") {
  if (value === null || value === undefined) return defaultValue;
  return value;
}

function delay(action, time, context = window, params = []) {
  if (context["await" + action]) clearTimeout(context["await" + action]);
  context["await" + action] = setTimeout(function () {
    context[action](...params);
  }, time);
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

// TODO: prototypes make the code cleaner?
String.prototype.replacePolishLetters = function () {
  return replacePolishLetters(this);
};

// also links.php
function replacePolishLetters(string) {
  const pl = [
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

  var len = pl.length;
  for (let i = 0; i < len; i++) {
    string = string.replace(new RegExp(`${pl[i]}`, "g"), en[i]);
  }
  return string;
}

// also links.php
function escapeUrl(string) {
  return string
    .replacePolishLetters()
    .replace(/[, ]+/g, "-")
    .toLowerCase()
    .replace(/[^(a-zA-Z0-9-)]/g, "")
    .replace(/-+/g, "-");
}

domload(() => {
  $$(".mobile-hover").forEach((e) => {
    if (IS_MOBILE) {
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

// TODO: check if abandoned completely
/*document.addEventListener("touchstart", (event) => {
  var e = $(".hovered");
  var toggle = $(".hovered .dropdown-header");
  if (e && (!isInNode(event.target, e) || isInNode(event.target, toggle))) {
    //if (e && !isInNode(event.target, e)) {
    e.classList.remove("hovered");
  }
});*/

function rgbStringToHex(rgbString) {
  if (rgbString.substr(0, 3) != "rgb") return rgbString;
  return rgbString.replace(/rgb\((.+?)\)/gi, (_, rgb) => {
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
domload(() => {
  window.addEventListener("offline", () => {
    updateOnlineStatus();
  });
  window.addEventListener("online", () => {
    updateOnlineStatus();
  });
});

function setValue(input, value = null, params = {}) {
  input = $(input);

  if (value === null || isEquivalent(input.getValue(), value)) {
    if (!params.quiet) {
      input.dispatchEvent(new Event("change"));
    }
    return;
  }

  if (input.tagName == "RADIO-INPUT") {
    var option_exists = input.find(`radio-option[value="${value}"]`);
    if (!!option_exists) {
      input.findAll(`radio-option`).forEach((e) => {
        e.classList.toggle("selected", e.getAttribute("value") == value);
      });
    }
  } else if (input.tagName == "CHECKBOX") {
    input.classList.toggle("checked", !!value);
  } else if (input.datepicker) {
    if (value && value.substr(0, 4).match(/\d{4}/)) {
      value = reverseDateString(value, "-");
    }
    input.datepicker.setDate(value);
  } else if (input.classList.contains("simple-list")) {
    input.list.setListValues(value);
  } else if (input.classList.contains("table-selection-value")) {
    var datatable = input.findParentByClassName("datatable-wrapper");
    window[
      datatable.getAttribute("data-datatable-name")
    ].setSelectedValuesFromString(value);
  } else if (input.classList.contains("jscolor")) {
    value = rgbStringToHex(value);
    var hex = value.replace("#", "");
    input.value = hex;
    input.jscolor.importColor();
  } else if (input.getAttribute("type") == "checkbox") {
    input.checked = value ? true : false;
  } else if (input.classList.contains("category-picker")) {
    setCategoryPickerValue(input, value, params);
  } else {
    var type = input.getAttribute("data-type");
    if (type == "html") {
      var pointChild = input.getAttribute("data-point-child");
      if (pointChild) {
        input = input.find(pointChild);
      }
      input.setContent(value);
    } else if (type == "attribute_values") {
      setAttributePickerValues(input, value);
    } else if (type == "src") {
      if (getResponsiveImageData(value)) {
        input.setAttribute("data-real-src", value);
        input.setAttribute("data-src", value);
      } else {
        input.setAttribute("src", value);
      }
      /*var prefix = input.getAttribute(`data-src-prefix`);
      if (!prefix) prefix = ""; // "/uploads/df/";
      if (value) value = prefix + value;
      input.setAttribute("src", value);*/
    } else if (input.tagName == "SELECT") {
      if ([...input.options].find((e) => e.value == value)) {
        input.value = value;
      }
    } else {
      // for text fields
      input.value = value;
    }
  }
  if (!params.quiet) {
    input.dispatchEvent(new Event("change"));
  }
}

function getValue(input) {
  if (input.classList.contains("simple-list")) {
    if (input.list.params.data_type == "json") {
      return JSON.stringify(input.list.values);
    }
    return input.list.values;
  }
  if (input.tagName == "RADIO-INPUT") {
    var value = "";
    var selected = input.find(".selected");
    if (!selected) {
      selected = input.find("[data-default]");
    }
    if (selected) {
      value = selected.getAttribute("value");
    }
    return value;
  } else if (input.tagName == "CHECKBOX") {
    return input.classList.contains("checked") ? 1 : 0;
  } else if (input.datepicker) {
    var value = input.value;
    if (value && value.substr(6, 4).match(/\d{4}/)) {
      value = reverseDateString(value, "-");
    }
    return value;
  }
  if (input.classList.contains("jscolor")) {
    var value = input.value;
    if (value && value.charAt(0) != "#") {
      value = "#" + value;
    }
    return value;
  }
  if (input.getAttribute("type") == "checkbox") {
    return input.checked ? 1 : 0;
  }
  if (input.classList.contains("category-picker")) {
    return input.category_picker && input.category_picker.value
      ? input.category_picker.value
      : [];
  } else {
    var type = input.getAttribute("data-type");
    if (type == "html") {
      var pointChild = input.getAttribute("data-point-child");
      if (pointChild) {
        input = input.find(pointChild);
      }
      if (input.hasAttribute("data-number")) {
        return +input.innerHTML;
      }
      return input.innerHTML;
    } else if (type == "attribute_values") {
      return getAttibutePickerValues(input);
    } else if (type == "src") {
      var real_src = input.getAttribute(`data-real-src`);
      if (real_src) {
        return real_src;
      }

      //var prefix = input.getAttribute(`data-src-prefix`);
      //if (!prefix) prefix = ""; // "/uploads/df/";
      var src = input.getAttribute("src");
      //if (src && src.length > prefix.length) src = src.substr(prefix.length);
      return src;
    } else if (type == "date") {
      var format = input.getAttribute(`data-format`);
      if (format == "dmy") {
        return reverseDateString(input.value, "-");
      }
      return input.value;
    } else {
      if (input.hasAttribute("data-number")) {
        return +input.value;
      }
      return input.value;
    }
  }
}

function findParent(elem, callback, options = {}) {
  elem = $(elem);
  if (!options) {
    options = {};
  }
  options.skip = nonull(options.skip, 0);
  options.counter = nonull(options.counter, 100);
  while (elem && elem != document) {
    if (options.counter > 0) {
      options.counter--;
    } else {
      return null;
    }

    if (options.skip > 0) {
      options.skip--;
    } else if (callback(elem)) {
      return elem;
    }
    elem = elem.parent();
  }
  return null;
}

function findParentByAttribute(elem, parentAttribute, options = {}) {
  const parentAttributes = Array.isArray(parentAttribute)
    ? parentAttribute
    : [parentAttribute];

  return findParent(
    elem,
    (some_parent) => {
      for (let parentAttribute of parentAttributes) {
        if (some_parent.hasAttribute(parentAttribute)) {
          return true;
        }
      }
    },
    options
  );
}

function findParentNode(elem, parent, options = {}) {
  return findParent(
    elem,
    (some_parent) => {
      if (some_parent === parent) {
        return true;
      }
    },
    options
  );
}

function findParentByTagName(elem, parentTagName, options = {}) {
  return findParent(
    elem,
    (some_parent) => {
      if (
        some_parent.tagName &&
        some_parent.tagName.toLowerCase() == parentTagName.toLowerCase()
      ) {
        return true;
      }
    },
    options
  );
}

function findParentById(elem, id, options = {}) {
  return findParent(
    elem,
    (some_parent) => {
      if (some_parent.id == id) {
        return true;
      }
    },
    options
  );
}

function findParentByClassName(elem, parentClassName, options = {}) {
  const parentClassNames = Array.isArray(parentClassName)
    ? parentClassName
    : [parentClassName];

  return findParent(
    elem,
    (some_parent) => {
      if (!some_parent.classList) {
        return false;
      }
      if (options.require_all) {
        var all = true;
        for (parentClassName of parentClassNames) {
          if (!some_parent.classList.contains(parentClassName)) {
            all = false;
          }
        }
        if (all) {
          return true;
        }
      } else {
        for (parentClassName of parentClassNames) {
          if (some_parent.classList.contains(parentClassName)) {
            return true;
          }
        }
      }
    },
    options
  );
}

// never used, check as u use
function findParentByStyle(elem, style, value, options = {}) {
  return findParent(
    elem,
    (some_parent) => {
      if (some_parent.style[style] == value) {
        return true;
      }
    },
    options
  );
}
// never used, check as u use
function findParentByComputedStyle(elem, style, value, options = {}) {
  return findParent(
    elem,
    (some_parent) => {
      var computedStyle = window.getComputedStyle(some_parent)[style];
      if (invert) {
        if (computedStyle != value) {
          return true;
        }
      } else {
        if (computedStyle == value) {
          return true;
        }
      }
    },
    options
  );
}
function findScrollableParent(elem, options = {}) {
  var parent = findParent(
    elem,
    (some_parent) => {
      if (
        some_parent.classList.contains("scroll-panel") &&
        !some_parent.classList.contains("horizontal")
      ) {
        return elem;
      }
      elem = elem.parent();
    },
    options
  );
  elem = $(elem);

  return nonull(parent, window);
}
function findNonStaticParent(elem, options = {}) {
  var parent = findParent(
    elem,
    (some_parent) => {
      var position = window.getComputedStyle(some_parent)["position"];
      if (position !== "static") {
        return true;
      }
    },
    options
  );

  return nonull(parent, document.body);
}
function isInNode(elem, parent) {
  elem = $(elem);
  while (elem && elem != document) {
    if (elem == parent) {
      return true;
    }
    elem = elem.parent();
  }
  return false;
}

function removeNode(n) {
  n = $(n);
  if (!n) {
    return;
  }
  if (n.parent()) n.parent().removeChild(n);
}

function removeContent(node) {
  while (true) {
    var first = node.firstChild;
    if (!first) return;
    node.removeChild(first);
  }
}

function setContent(node, html = "") {
  node = $(node);
  removeContent(node);
  node.insertAdjacentHTML("afterbegin", html);
  node.dispatchEvent(new Event("scroll"));
  setTimeout(() => {
    node.dispatchEvent(new Event("scroll"));
  }, 200);
}

function setContentAndMaintainHeight(node, html = "") {
  var st = node.scrollTop;
  node.style.height = node.scrollHeight + "px";
  setTimeout(() => {
    node.setContent(html);
    setTimeout(() => {
      node.scrollTop = st;
      node.style.height = "";
    }, 0);
  });
}

function isEmpty(node) {
  return node.innerHTML.trim() === "";
}

function addMissingDirectChildren(
  parent,
  isMissingCallback,
  html,
  position = "beforeend"
) {
  if (!$(parent).directChildren().find(isMissingCallback)) {
    parent.insertAdjacentHTML(position, html);
  }
}

function swapNodes(a, b) {
  if (!a || !b) return;

  var aParent = a.parentNode;
  var bParent = b.parentNode;

  var aHolder = document.createElement("div");
  var bHolder = document.createElement("div");

  aParent.replaceChild(aHolder, a);
  bParent.replaceChild(bHolder, b);

  aParent.replaceChild(b, aHolder);
  bParent.replaceChild(a, bHolder);
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

function removeClasses(className, selector = null) {
  if (selector === null) selector = `.${className}`;
  var classList = null;
  if (Array.isArray(className)) {
    classList = className;
  } else {
    classList = [className];
  }
  for (let cn of classList) {
    $$(selector).forEach((e) => {
      e.classList.remove(cn);
    });
  }
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

function toggleDisabled(elem, disabled) {
  elem = $(elem);
  if (disabled) elem.setAttribute("disabled", true);
  else elem.removeAttribute("disabled");
}

function clamp(min, val, max) {
  return Math.max(min, Math.min(val, max));
}

function isHidden(el) {
  return el.offsetParent === null;
}

function preventLongPressMenu(node) {
  if (node.prevent_long_press) {
    return;
  }
  node.prevent_long_press = true;
  node.oncontextmenu = function (event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  };
}

function getSelectDisplayValue(select) {
  return select.options[select.selectedIndex].text;
}

function isEquivalent(a, b) {
  if (!a || !b) {
    return a === b;
  }
  // Create arrays of property names
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b);

  // If number of properties is different,
  // objects are not equivalent
  if (aProps.length != bProps.length) {
    return false;
  }

  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i];

    // If values of same property are not equal,
    // objects are not equivalent
    if (typeof a[propName] === "object") {
      if (!isEquivalent(a[propName], b[propName])) {
        return false;
      }
    } else {
      if (a[propName] !== b[propName]) {
        return false;
      }
    }
  }

  // If we made it this far, objects
  // are considered equivalent
  return true;
}

function removeUserSelection() {
  if (window.getSelection) {
    if (window.getSelection().empty) {
      // Chrome
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {
      // Firefox
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) {
    // IE?
    document.selection.empty();
  }
}
