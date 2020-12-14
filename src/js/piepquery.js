/* js[global] */

// TODO: do it? BUT I would exclude this classes by piep compiler, keep the weight small
// other than that comments are excluded anyway AND dev tools will tell you in the runtime what methods can be applied, cool
class PiepNode extends HTMLElement {
	/** @returns {PiepNode} */
	find(query) {}
	/** @returns {PiepNode[]} */
	findAll(query) {}
	/** @returns {PiepNode[]} */
	directChildren() {}
	setValue(value, quiet) {}
	getValue() {}
	/** @returns {PiepNode} */

	findParentByClassName(parentClassNames, options = {}) {}
	/** @returns {PiepNode} */
	findScrollParent(options = {}) {}
	/** @returns {PiepNode} */
	findParentByAttribute(options = {}) {}
	/** @returns {PiepNode} */
	findParentByComputedStyle(options = {}) {}
	/** @returns {PiepNode} */
	findParentById(options = {}) {}
	/** @returns {PiepNode} */
	findParentNode(options = {}) {}
	/** @returns {PiepNode} */
	findNonStaticParent(options = {}) {}
	/** @returns {PiepNode} */
	findParentByTagName() {}

	/** @returns {PiepNode} */
	dispatchChange() {}
	/** @returns {PiepNode} */
	parent() {}
	/** @returns {PiepNode} */
	next() {}
	/** @returns {PiepNode} */
	prev() {}
	/** @returns {boolean} */
	isEmpty() {}

	empty() {}

	setContent(html = "") {}

	setFormData(data, params = {}) {}

	getFormData() {}

	validateForm(params = {}) {}

	validateField() {}
}

/**
 * PIEPQUERY
 *
 * @param {*} node
 * @param {*} parent
 * @returns {PiepNode}
 */
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

	// TODO: should we return nulls? I would make an empty object on which u can still use methods defined below so "chaining" is allowed

	node.find = (query) => {
		return $(query, node);
	};
	node.findAll = (query) => {
		return $$(query, node);
	};
	if (!node.setValue) {
		node.setValue = (value, quiet = false) => {
			setValue(node, value, quiet);
		};
	}
	if (!node.getValue) {
		node.getValue = () => {
			return getValue(node);
		};
	}
	node.dispatchChange = () => {
		return dispatchChange(node);
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

	node.findParentByTagName = (parentTagName, options = {}) => {
		return window.findParentByTagName(node, parentTagName, options);
	};

	node.findParentNode = (parent, options = {}) => {
		return window.findParentNode(node, parent, options);
	};

	node.findParentById = (id, options = {}) => {
		return window.findParentById(node, id, options);
	};

	node.findParentByStyle = (style, value, options = {}) => {
		return window.findParentByStyle(node, style, value, options);
	};

	node.findParentByComputedStyle = (style, value, options = {}) => {
		return window.findParentByComputedStyle(node, style, value, options);
	};

	node.findScrollParent = (options = {}) => {
		return window.findScrollParent(node, options);
	};

	node.findNonStaticParent = (options = {}) => {
		return window.findNonStaticParent(node, options);
	};

	node.findParentByClassName = (parentClassNames, options = {}) => {
		return window.findParentByClassName(node, parentClassNames, options);
	};
	node.isEmpty = () => {
		return isEmpty(node);
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
