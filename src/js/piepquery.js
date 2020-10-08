/* js[global] */

function $(node, parent = null) {
  if (!node) return null;
  if (node.find) return node; // already initialized

  if (!parent) {
    parent = document.body;
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

  node.findParentNode = (parent) => {
    return window.findParentNode(node, parent);
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

  node.findNonStaticParent = () => {
    return window.findNonStaticParent(node);
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

  node.isEmpty = () => {
    return isEmpty(node);
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

  node.setFormData = (data, params = {}) => {
    return setFormData(data, node, params);
  };

  node.getFormData = () => {
    return getFormData(node);
  };

  node.validateForm = (params = {}) => {
    return validateForm(node, params);
  };

  node.validateField = () => {
    return validateField(node);
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
