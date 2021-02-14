/* js[global] */

/**
 * @typedef { PiepNode | string | EventTarget} PiepSelector
 * query selectors and piep nodes
 */

/**
 * @typedef {{
 * _set_value(value: any, options?: {
 *  quiet?: boolean
 * }): void
 * _get_value(): any
 * _scroll_parent(options?: findNodeOptions): PiepNode
 * _empty(): void
 * _set_content(html: string | number): void
 * dataset: any;
 * _setting_value?: boolean
 * _parent(selector?: PiepSelector, options?: findNodeOptions): PiepNode | undefined
 * _next(selector?: PiepSelector, options?: findNodeOptions): PiepNode | undefined
 * _prev(selector?: PiepSelector, options?: findNodeOptions): PiepNode | undefined
 * _child(selector: string): PiepNode | undefined
 * _children(selector: string): PiepNode[]
 * _direct_child(selector?: string): PiepNode
 * _direct_children(selector?: string): PiepNode[]
 * _first_children(selector: string): PiepNode[]
 * _is_empty()
 * _in_body()
 * _animate(keyframes: string, duration: number, options?: AnimationOptions): void
 * _dispatch_change(): void
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
	node._next = (selector = undefined, options = {}) => {
		return findNext(node, selector, options);
	};
	node._prev = (selector = undefined, options = {}) => {
		return findPrev(node, selector, options);
	};
	node._child = (selector) => {
		return $(selector, node);
	};
	node._children = (selector) => {
		return $$(selector, node);
	};
	node._direct_child = (selector = "*") => {
		/** @type {PiepNode[]} */
		// @ts-ignore
		const nodes = [...node.children];
		return nodes.find((e) => $(e).matches(selector));
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
	node._first_children = (selector) => {
		return node._children(selector).filter((e) => {
			const p = e._parent(selector);
			return p === node || !node.contains(p);
		});
	};

	node._is_empty = () => {
		return node.hasChildNodes();
	};

	if (!node._set_value) {
		node._set_value = (value, options = {}) => {
			setValue(node, value, options);
		};
	}
	if (!node._get_value) {
		node._get_value = () => {
			return getValue(node);
		};
	}
	node._dispatch_change = () => {
		return dispatchChange(node);
	};

	node._scroll_parent = (options = {}) => {
		return findScrollParent(node, options);
	};

	node._empty = () => {
		return removeContent(node);
	};

	node._set_content = (html = "") => {
		return _set_content(node, html);
	};

	node._animate = (keyframes, duration, options = {}) => {
		// @ts-ignore
		return animate(node, keyframes, duration, options);
	};

	node._in_body = () => {
		return inBody(node);
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
