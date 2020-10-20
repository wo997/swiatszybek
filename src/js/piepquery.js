/* js[global] */

function $(node, parent = null) {
  if (!node) return null;
  if (node.find) return node; // already initialized

  if (!parent) {
    parent = document.body;
  }
  if (!parent) {
    return null;
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

  node.findParentByTagName = (parentTagName, options) => {
    return window.findParentByTagName(node, parentTagName, options);
  };

  node.findParentNode = (parent, options) => {
    return window.findParentNode(node, parent, options);
  };

  node.findParentById = (id, options) => {
    return window.findParentById(node, id, options);
  };

  node.findParentByStyle = (style, value, options) => {
    return window.findParentByStyle(node, style, value, options);
  };

  node.findParentByComputedStyle = (style, value, options) => {
    return window.findParentByComputedStyle(node, style, value, options);
  };

  node.findScrollableParent = (options) => {
    return window.findScrollableParent(node, options);
  };

  node.findNonStaticParent = (options) => {
    return window.findNonStaticParent(node, options);
  };

  node.findParentByClassName = (parentClassNames, options) => {
    return window.findParentByClassName(node, parentClassNames, options);
  };

  node.isInNode = (parent, options) => {
    return window.isInNode(node, parent, options);
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
