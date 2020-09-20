/* js[global] */

var IS_MOBILE = "ontouchstart" in document.documentElement;

function xhr(data) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", data.url, true);
  xhr.setRequestHeader("enctype", "multipart/form-data");
  xhr.onload = function () {
    var res = xhr.responseText;
    data.type = nonull(data.type, "json");
    if (data.type == "json") {
      try {
        res = JSON.parse(res);
      } catch {}
    }
    if (data.success) {
      data.success(res);
    }
    if (res.redirect) {
      window.location = res.redirect;
    }
    if (res.reload) {
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

// also helpers/files.php
function getUploadedFileName(file_path) {
  // it doesn't work, file extension needs to be removed, look for getResponsiveImageData instead
  return file_path.substr(UPLOADS_PLAIN_PATH.length);
}

// also kernel.php
function getLink(phrase) {
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

document.addEventListener("touchstart", (event) => {
  var e = $(".hovered");
  var toggle = $(".hovered .dropdown-header");
  if (e && (!isInNode(event.target, e) || isInNode(event.target, toggle))) {
    //if (e && !isInNode(event.target, e)) {
    e.classList.remove("hovered");
  }
});

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
window.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("offline", () => {
    updateOnlineStatus();
  });
  window.addEventListener("online", () => {
    updateOnlineStatus();
  });
});

function setValue(input, value = null, params = {}) {
  input = $(input);

  if (value === null) {
    input.dispatchEvent(new Event("change"));
    return;
  }

  if (input.tagName == "RADIO-INPUT") {
    var radio = input.find(`radio-option[value="${value}"]`);
    if (radio) {
      input.findAll(`radio-option`).forEach((e) => {
        e.classList.toggle("selected", e.getAttribute("value") == value);
      });
    }
  } else if (input.datepicker) {
    if (value && value.substr(0, 4).match(/\d{4}/)) {
      value = reverseDateString(value, "-");
    }
    input.datepicker.setDate(value);
  } else if (input.classList.contains("simple-list")) {
    list = window[input.getAttribute("data-list-name")];
    list.setValuesFromString(value);
  } else if (input.classList.contains("table-selection-value")) {
    var datatable = input.findParentByClassName("datatable-wrapper");
    window[
      datatable.getAttribute("data-datatable-name")
    ].setSelectedValuesFromString(value);
  } else if (input.classList.contains("jscolor")) {
    value = rgbStringToHex(value);
    var hex = value.replace("#", "");
    input.value = hex;
    input.style.background = hex ? "#" + hex : "";
  } else if (input.getAttribute("type") == "checkbox") {
    input.checked = value ? true : false;
  } else if (input.classList.contains("category-picker")) {
    var v = [];
    try {
      var v = JSON.parse(value);
    } catch {}
    setCategoryPickerValuesString(input, v, params);
  } else {
    var type = input.getAttribute("data-type");
    if (type == "html") {
      var pointChild = input.getAttribute("data-point-child");
      if (pointChild) {
        input = input.find(pointChild);
      }
      input.innerHTML = value;
    } else if (type == "attribute_values") {
      if (typeof value === "string") {
        try {
          value = JSON.parse(value);
        } catch {
          value = "";
        }
      }
      input.findAll(".combo-select-wrapper").forEach((combo) => {
        combo.findAll("select").forEach((select) => {
          var option = value.selected
            ? [...select.options].find((o) => {
                return value.selected.indexOf(parseInt(o.value)) !== -1;
              })
            : null;
          if (option) {
            select.setValue(option.value);
          } else {
            select.setValue("");
          }
        });
      });

      input.findAll(".any-value-wrapper").forEach((any) => {
        any.find(`.has_attribute`).setValue(false);
      });

      if (value.values) {
        value.values.forEach((attribute) => {
          var attribute_row = input.find(
            `[data-attribute_id="${attribute.attribute_id}"]`
          );

          if (attribute_row) {
            var has_attribute_node = attribute_row.find(`.has_attribute`);
            var attribute_value_node = attribute_row.find(`.attribute_value`);
            if (has_attribute_node && attribute_value_node) {
              has_attribute_node.setValue(1);
              attribute_value_node.setValue(attribute.value);
            }
          }
        });
      }
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
    list = window[input.getAttribute("data-list-name")];
    return JSON.stringify(list.values);
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
    return input.getAttribute("value");
  } else {
    var type = input.getAttribute("data-type");
    if (type == "html") {
      var pointChild = input.getAttribute("data-point-child");
      if (pointChild) {
        input = input.find(pointChild);
      }
      return input.innerHTML;
    } else if (type == "attribute_values") {
      var attribute_selected_values = [];
      input.findAll("[data-attribute-value]").forEach((select) => {
        if (select.value) {
          attribute_selected_values.push(parseInt(select.value));
        }
      });
      var attribute_values = [];
      input.findAll(".any-value-wrapper").forEach((attribute_row) => {
        var attr_id = attribute_row.getAttribute("data-attribute_id");
        var attr_val_node = attribute_row.find(".attribute_value:not(.hidden)");

        if (attr_val_node) {
          attribute_values.push({
            attribute_id: attr_id,
            value: attr_val_node.getValue(),
          });
        }
      });
      return JSON.stringify({
        selected: attribute_selected_values,
        values: attribute_values,
      });
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
      return input.value;
    }
  }
}

function findParentByAttribute(
  elem,
  parentAttribute,
  parentAttributeValue = null
) {
  elem = $(elem);
  while (elem && elem != document) {
    if (parentAttributeValue) {
      if (elem.getAttribute(parentAttribute) == parentAttributeValue) {
        return elem;
      }
    } else {
      if (elem.hasAttribute(parentAttribute)) {
        return elem;
      }
    }
    elem = elem.parent();
  }
  return null;
}

function findParentByTagName(elem, parentTagName) {
  elem = $(elem);
  parentTagName = parentTagName.toUpperCase();
  while (elem && elem != document) {
    if (elem.tagName == parentTagName) {
      return elem;
    }
    elem = elem.parent();
  }
  return null;
}

function findParentById(elem, id) {
  elem = $(elem);
  while (elem && elem != document) {
    if (elem.id == id) {
      return elem;
    }
    elem = elem.parent();
  }
  return null;
}

function findParentByClassName(elem, parentClassNames, stopAtClassName = null) {
  elem = $(elem);
  while (elem && elem != document) {
    if (stopAtClassName && elem.classList.contains(stopAtClassName)) {
      return null;
    }
    if (Array.isArray(parentClassNames)) {
      for (c of parentClassNames) {
        if (elem.classList && elem.classList.contains(c)) {
          return elem;
        }
      }
    } else {
      if (elem.classList && elem.classList.contains(parentClassNames)) {
        return elem;
      }
    }

    elem = elem.parent();
  }
  return null;
}
function findParentByStyle(elem, style, value) {
  elem = $(elem);
  while (elem && elem != document) {
    if (elem.style[style] == value) {
      return elem;
    }
    elem = elem.parent();
  }
  return null;
}
function findParentByComputedStyle(elem, style, value, invert = false) {
  elem = $(elem);

  while (elem && elem != document) {
    var computedStyle = window.getComputedStyle(elem)[style];
    if (invert) {
      if (computedStyle != value) {
        return elem;
      }
    } else {
      if (computedStyle == value) {
        return elem;
      }
    }
    elem = elem.parent();
  }
  return null;
}
function findScrollableParent(elem) {
  elem = $(elem);

  while (elem && elem != document.body) {
    var overflowY = window.getComputedStyle(elem)["overflow-y"];
    if (overflowY === "scroll" || overflowY === "auto") {
      return elem;
    }
    elem = elem.parent();
  }
  return window;
}
function findNonStaticParent(elem) {
  elem = $(elem);

  while (elem && elem != document.body) {
    var position = window.getComputedStyle(elem)["position"];
    if (position !== "static") {
      return elem;
    }
    elem = elem.parent();
  }
  return document.body;
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
  removeContent(node);
  node.insertAdjacentHTML("afterbegin", html);
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
  $$(selector).forEach((e) => {
    e.classList.remove(className);
  });
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
