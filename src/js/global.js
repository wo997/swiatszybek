/* js[global] */

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

function setValue(input, value, quiet = false) {
  input = $(input);
  if (input.classList.contains("simple-list")) {
    list = window[input.getAttribute("data-list-name")];
    list.setValuesFromString(value);
  }
  if (input.classList.contains("table-selection-value")) {
    var datatable = input.findParentByClassName("datatable-wrapper");
    window[datatable.getAttribute("data-table-name")].setSelectedValuesString(
      value
    );
  } else if (input.classList.contains("jscolor")) {
    var hex = value.replace("#", "");
    input.value = hex;
    input.style.background = hex ? "#" + hex : "";
  } else if (input.getAttribute("type") == "checkbox") {
    input.checked = value ? true : false;
  } else if (input.hasAttribute("data-category-picker")) {
    setCategoryPickerValues(input.next(), JSON.parse(value));
  } else {
    var type = input.getAttribute("data-type");
    if (type == "html") {
      var pointChild = input.getAttribute("data-point-child");
      if (pointChild) {
        input = input.find(pointChild);
      }
      input.innerHTML = value;
    } else if (type == "attribute_values") {
      input.findAll(".combo-select-wrapper").forEach((combo) => {
        combo.findAll("select").forEach((select) => {
          var option = [...select.options].find((o) => {
            return value.selected.indexOf(parseInt(o.value)) !== -1;
          });
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

      value.values.forEach((e) => {
        var attribute_row = input.find(
          `[data-attribute_id="${e.attribute_id}"]`
        );

        if (attribute_row) {
          var has_attribute_node = attribute_row.find(`.has_attribute`);
          var attribute_value_node = attribute_row.find(`.attribute_value`);
          if (has_attribute_node && attribute_value_node) {
            has_attribute_node.setValue(true);
            attribute_value_node.setValue(
              nonull(e.numerical_value, nonull(e.text_value, e.date_value))
            );
          }
        }
      });
    } else if (type == "src") {
      var prefix = input.getAttribute(`data-src-prefix`);
      if (!prefix) prefix = "/uploads/df/";
      if (value) value = prefix + value;
      input.setAttribute("src", value);
    } else if (input.tagName == "SELECT") {
      if ([...input.options].find((e) => e.value == value)) {
        input.value = value;
      }
    } else {
      // for text fields
      input.value = value;
    }
  }
  if (!quiet) {
    input.dispatchEvent(new Event("change"));
  }
}

function getValue(input) {
  if (input.classList.contains("simple-list")) {
    list = window[input.getAttribute("data-list-name")];
    return JSON.stringify(list.values);
  }
  if (input.classList.contains("jscolor")) {
    var value = input.value;
    if (value && value.charAt(0) != "#") {
      value = "#" + value;
    }
    return value;
  } else if (input.getAttribute("type") == "checkbox") {
    return input.checked ? 1 : 0;
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
      var attribute_values = {};
      input.findAll(".any-value-wrapper").forEach((attribute_row) => {
        var attr_id = attribute_row.getAttribute("data-attribute_id");
        var attr_val_node = attribute_row.find(".attribute_value:not(.hidden)");

        if (attr_val_node) {
          attribute_values[attr_id] = attr_val_node.getValue();
        }
      });
      return JSON.stringify({
        selected: attribute_selected_values,
        values: attribute_values,
      });
    } else if (type == "src") {
      var prefix = input.getAttribute(`data-src-prefix`);
      if (!prefix) prefix = "/uploads/df/";
      var src = input.getAttribute("src");
      if (src && src.length > prefix.length) src = src.substr(prefix.length);
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
  return null;
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
  if (disabled) elem.setAttribute("disabled", true);
  else elem.removeAttribute("disabled");
}
