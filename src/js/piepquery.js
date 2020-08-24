/* js[global] */

function $(node, parent = null) {
  if (!node) return null;
  if (node.find) return node; // already initialized

  if (parent === null) {
    parent = document;
  }

  // query selector or html node
  node = typeof node == "string" ? parent.querySelector(node) : node;
  if (!node) return null;
  node.find = (query) => {
    return $(query, node);
  };
  node.findAll = (query) => {
    return $$(query, node);
  };
  node.setValue = (value, quiet = false) => {
    setValue(node, value, quiet);
  };
  node.getValue = () => {
    return getValue(node);
  };
  node.next = () => {
    // TODO parameter includeTextNodes
    return $(node.nextElementSibling);
  };
  node.prev = () => {
    return $(node.previousElementSibling);
  };
  node.parent = () => {
    return $(node.parentNode);
  };
  node.directChildren = () => {
    var res = [];
    [...node.children].forEach((node) => {
      res.push($(node));
    });
    return res;
  };
  /*node.children = () => {
      return $(node.parentNode);
    };*/

  node.findParentByAttribute = (
    parentAttribute,
    parentAttributeValue = null
  ) => {
    return window.findParentByAttribute(
      node,
      parentAttribute,
      parentAttributeValue
    );
  };

  node.findParentByTagName = (parentAttribute, parentAttributeValue = null) => {
    return window.findParentByTagName(
      node,
      parentAttribute,
      parentAttributeValue
    );
  };

  node.findParentById = (id) => {
    return window.findParentById(node, id);
  };

  node.findParentByStyle = (style, value) => {
    return window.findParentByStyle(node, style, value);
  };

  node.findParentByComputedStyle = (style, value) => {
    return window.findParentByComputedStyle(node, style, value);
  };

  node.findScrollableParent = () => {
    return window.findScrollableParent(node);
  };

  node.findParentByClassName = (parentClassNames, stopAtClassName = null) => {
    return window.findParentByClassName(
      node,
      parentClassNames,
      stopAtClassName
    );
  };

  node.isInNode = (parent) => {
    return window.isInNode(node, parent);
  };

  node.remove = () => {
    return window.removeNode(node);
  };

  node.empty = () => {
    return window.removeContent(node);
  };

  node.setContent = (html = "") => {
    return window.setContent(node, html);
  };

  return node;
}

function $$(querySelectorAll, parent = null) {
  if (parent === null) {
    parent = document;
  }
  var group = parent.querySelectorAll(querySelectorAll);
  var res = [];
  group.forEach((node) => {
    res.push($(node));
  });
  return res;
}

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
    var hex = rgbOrHexStringToHex(value).replace("#", "");
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
