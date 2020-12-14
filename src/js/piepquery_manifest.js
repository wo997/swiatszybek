class PiepNode extends HTMLElement {
	/** @returns {PiepNode} */
	find(query) {}
	/** @returns {PiepNode[]} */
	findAll(query) {}
	/** @returns {PiiepNode[]} */
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
