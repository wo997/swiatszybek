/* js[global] */

/**
 * @typedef { PiepNode | string } PiepSelector
 * query selectors and piep nodes
 */

/**
 * @typedef {{
 * find(query: string): PiepNode //my comment baby
 * findAll(query: string): PiepNode[]
 * directChildren(query?): PiepNode[]
 * setValue(value: any, options?: {
 *  quiet?: boolean
 * }): void
 * getValue(): any
 * dispatchChange(): void
 * parent(query?: PiepSelector | undefined, options?: findNodeOptions): PiepNode
 * prev(query?: PiepSelector | undefined, options?: findNodeOptions): PiepNode
 * next(query?: PiepSelector | undefined, options?: findNodeOptions): PiepNode
 * findScrollParent(options?): PiepNode
 * isdef(): boolean
 * def(): void
 * setContent(html: string|number): void
 * animate(keyframes: string, duration: number, options?: AnimationOptions): void
 * dataset;
 * setting_value?: boolean
 * ciiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiipa
 * _parent(selector?: PiepSelector, options?: findNodeOptions): PiepNode | undefined
 * _next(selector?: PiepSelector, options?: findNodeOptions): PiepNode | undefined
 * _prev(selector?: PiepSelector, options?: findNodeOptions): PiepNode | undefined
 * _child(selector: string): PiepNode | undefined
 * _children(selector: string): PiepNode[]
 * _direct_children(selector?: string): PiepNode[]
 * _is_empty()
 * } & HTMLElement} PiepNode
 */

/**
 * @param {PiepSelector} selector
 * @param {*} parent
 * @returns {PiepNode}
 */
function $(selector, parent = undefined) {
	/** @type {PiepNode} */
	// @ts-ignore
	let node = selector;
	if (!node) return undefined;

	if (node._child) {
		// already initialized
		return node;
	}

	if (parent === undefined) {
		parent = document.body;
	}

	node = typeof node == "string" ? parent.querySelector(node) : node;
	if (!node) {
		return undefined;
	}

	node._parent = (selector = undefined, options = {}) => {
		return findParent(node, selector, options);
	};
	node._child = (selector) => {
		return $(selector, node);
	};
	node._children = (selector) => {
		return $$(selector, node);
	};
	node._direct_children = (selector = undefined) => {
		/** @type {PiepNode[]} */
		// @ts-ignore
		const nodes = [...node.children];
		if (selector === undefined) {
			nodes.forEach((e) => {
				$(e); // initializes piep node
			});
			return nodes;
		}
		return nodes.filter((e) => $(e).matches(selector));
	};
	node._is_empty = () => {
		return node.hasChildNodes();
	};

	node.find = (query) => {
		return $(query, node);
	};
	node.findAll = (query) => {
		return $$(query, node);
	};
	if (!node.setValue) {
		node.setValue = (value, options = {}) => {
			setValue(node, value, options);
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
		// TODO parameter includeTextNodes
		return $(node.previousElementSibling);
	};
	node.parent = (
		query = undefined,
		/** @type {findNodeOptions} */ options = {}
	) => {
		return $(node.parentNode);
	};
	node.directChildren = (query = undefined) => {
		var res = [];
		[...node.children].forEach((node) => {
			if (query !== undefined && !node.matches(query)) {
				return;
			}
			res.push($(node));
		});
		return res;
	};

	node.findParentByAttribute = (
		parentAttribute,
		parentAttributeValue = null
	) => {
		return findParentByAttribute(node, parentAttribute, parentAttributeValue);
	};

	node.findParentByTagName = (parentTagName, options = {}) => {
		return findParentByTagName(node, parentTagName, options);
	};

	node.findParentNode = (parent, options = {}) => {
		return findParentNode(node, parent, options);
	};

	node.findParentById = (id, options = {}) => {
		return findParentById(node, id, options);
	};

	node.findParentByStyle = (style, value, options = {}) => {
		return findParentByStyle(node, style, value, options);
	};

	node.findParentByComputedStyle = (style, value, options = {}) => {
		return findParentByComputedStyle(node, style, value, options);
	};

	node.findScrollParent = (options = {}) => {
		return findScrollParent(node, options);
	};

	node.findNonStaticParent = (options = {}) => {
		return findNonStaticParent(node, options);
	};

	node.findParentByClassName = (parentClassNames, options = {}) => {
		return findParentByClassName(node, parentClassNames, options);
	};
	node.isEmpty = () => {
		return isdef(node);
	};

	node.empty = () => {
		return removeContent(node);
	};

	node.setContent = (html = "") => {
		return setContent(node, html);
	};

	node.animate = (keyframes, duration, options = {}) => {
		// @ts-ignore
		return animate(node, keyframes, duration, options);
	};

	return node;
}

/**
 *
 * @param {*} querySelectorAll
 * @param {*} parent
 * @returns {PiepNode[]}
 */
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
