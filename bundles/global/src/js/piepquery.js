/* js[global] */

/**
 * @typedef { PiepNode | string | EventTarget} PiepSelector
 * query selectors and piep nodes
 */

/**
 * @typedef {{
 * _set_value(value: any, options?: SetDataOptions): void
 * _get_value(options?: GetDataOptions): any
 * _scroll_parent(options?: findNodeOptions): PiepNode
 * _empty(): void
 * _set_content(html: string | number, options?: {maintain_height?: boolean}): void
 * _setting_value?: boolean
 * _parent(selector?: PiepSelector, options?: findNodeOptions): PiepNode | undefined
 * _next(selector?: PiepSelector, options?: findNodeOptions): PiepNode | undefined
 * _prev(selector?: PiepSelector, options?: findNodeOptions): PiepNode | undefined
 * _first(): PiepNode
 * _last(): PiepNode
 * _first_sibling(): PiepNode
 * _last_sibling(): PiepNode
 * _child(selector: string): PiepNode | undefined
 * _children(selector: string): PiepNode[]
 * _direct_child(selector?: string): PiepNode
 * _direct_children(selector?: string): PiepNode[]
 * _first_children(selector: string): PiepNode[]
 * _is_empty()
 * _in_body()
 * _animate(keyframes: string, duration: number, options?: AnimationOptions): void
 * _dispatch_change(): void
 * _set_absolute_pos(left:number,top:number)
 * } & HTMLBaseElement} PiepNode
 */

/**
 *
 * @param {PiepNode} node
 * @returns
 */
function validPiepInput(node) {
	if (node.matches) {
		return node.matches(
			".radio_group, .pretty_radio, .wo997_img, p-checkbox, input, select, textarea, p-dropdown, color-picker, image-picker, unit-input"
		);
	}
	return false;
}

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

	if (parent === undefined) {
		parent = document;
	}

	node = typeof node == "string" ? parent.querySelector(node) : node;
	if (!node) {
		return undefined;
	}

	if (validPiepInput(node)) {
		if (!node._set_value) {
			node._set_value = (value, options = {}) => {
				setValue(node, value, options);
			};
		}
		if (!node._get_value) {
			node._get_value = (options = {}) => {
				return getValue(node, options);
			};
		}
	}

	// MAKE SURE THE ORDER IS RIGHT
	if (node._child) {
		// already initialized
		return node;
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
	node._first = () => {
		return $(node.firstElementChild);
	};
	node._last = () => {
		return $(node.lastElementChild);
	};
	node._first_sibling = () => {
		return $(node._parent().firstElementChild);
	};
	node._last_sibling = () => {
		return $(node._parent().lastElementChild);
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
		return !node.hasChildNodes();
	};

	node._dispatch_change = () => {
		return dispatchChange(node);
	};

	node._scroll_parent = (options = {}) => {
		options.default = def(options.default, document.documentElement);
		return findScrollParent(node, options);
	};

	node._empty = () => {
		return removeContent(node);
	};

	node._set_content = (html = "", options) => {
		return setContent(node, html, options);
	};

	node._animate = (keyframes, duration, options = {}) => {
		// @ts-ignore
		return animate(node, keyframes, duration, options);
	};

	node._in_body = () => {
		return inBody(node);
	};

	node._set_absolute_pos = (left, top) => {
		node.style.left = left.toPrecision(5) + "px";
		node.style.top = top.toPrecision(5) + "px";
	};

	return node;
}

/**
 *
 * @param {*} selector
 * @param {*} parent
 * @returns {PiepNode[]}
 */
function $$(selector, parent = null) {
	return [...def(parent, document).querySelectorAll(selector)].map((e) => $(e));
}
