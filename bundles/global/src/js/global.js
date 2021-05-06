/* js[!global] */

function domload(callback) {
	document.addEventListener("DOMContentLoaded", callback);
}

function windowload(callback) {
	window.addEventListener("load", callback);
}

/**
 * @typedef {{
 * url: string
 * type?: string
 * success(res?: any)
 * formData?: FormData
 * params?: any
 * }} xhrParams
 */

/**
 *
 * @param {xhrParams} params
 */

function xhr(params) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", params.url, true);
	xhr.setRequestHeader("enctype", "multipart/form-data");
	xhr.onload = function () {
		var res = xhr.responseText;
		params.type = def(params.type, "json");
		var res_json = null;

		var match_reload_required = "[reload_required]";
		var reload_required = false;
		if (res.substring(0, match_reload_required.length) === match_reload_required) {
			res = res.substring(match_reload_required.length);
			reload_required = true;
		}

		try {
			res_json = JSON.parse(res);
		} catch {}

		if (params.success) {
			params.success(params.type == "json" ? res_json : res);
		}

		let reloading = false;

		if (res_json) {
			if (res_json.redirect) {
				window.location = res_json.redirect;
			}
			if (res_json.reload) {
				reloading = true;
				window.location.reload();
			}
		}

		// if (!reloading && reload_required && IS_ADMIN && confirm("Wymagane jest odświeżenie strony, czy chcesz kontynuować?")) {
		// 	window.location.reload();
		// }
	};

	const formData = params.formData ? params.formData : new FormData();
	if (params.params) {
		for (let [key, value] of Object.entries(params.params)) {
			if (typeof value === "object" && value !== null) {
				value = JSON.stringify(value);
			}
			formData.append(key, value);
		}
	}
	formData.append("xhr", "1");
	xhr.send(formData);
	return xhr;
}

/**
 *
 * @param {*} value
 * @param {*} def
 */
function def(value, def) {
	if (value === null || value === undefined) return def;
	return value;
}

/**
 *
 * @param {string} action
 * @param {number} time
 * @param {*} context
 * @param {*} params
 * @param {{twice?: boolean}} [options]
 */
function delay(action, time = 0, context = window, params = [], options = {}) {
	if (context["await" + action]) {
		clearTimeout(context["await" + action]);
	} else {
		if (options.twice) {
			context[action](...params);
		}
	}
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

/*
never used
function decodeHtmlEntities(html) {
	var txt = document.createElement("textarea");
	txt.innerHTML = html;
	return txt.value;
}
*/

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

// also links.php
/**
 *
 * @param {string} string
 */
function escapeUrl(string) {
	return replacePolishLetters(string.trim())
		.replace(/[, ]+/g, "-")
		.replace(/[^(a-zA-Z0-9-)]/g, "")
		.replace(/-+/g, "-");
}

/**
 * @typedef {{
 * quiet?: boolean
 * force?: boolean
 * }} SetDataOptions
 */

/**
 *
 * @param {PiepNode} input
 * @param {*} value
 * @param {SetDataOptions} options
 */
function setValue(input, value = null, options = {}) {
	input = $(input);

	const quit = () => {
		if (!options.quiet) {
			input._dispatch_change();
		}
		input.dispatchEvent(new Event("value_set"));
	};

	if (!options.force) {
		let same = true;
		if (value !== null && value !== undefined) {
			const curr = input._get_value({ plain: true });
			if (input.classList.contains("number")) {
				same = numberFromStr(curr) === numberFromStr(value) && curr !== undefined;
			} else {
				same = isEquivalent(curr, value);
			}
		}

		if (same) {
			quit();
			return;
		}
	}

	if (input.classList.contains("radio_group")) {
		input.dataset.value = value;
		onRadioGroupValueSet(input);
	} else if (input.tagName == "COLOR-PICKER") {
		setColorPickerValue(input, value);
	} else if (input.tagName == "P-CHECKBOX") {
		setCheckboxValue(input, !!value);
	} else if (input.tagName == "P-DROPDOWN") {
		setDropdownValue(input, value, options);
		// @ts-ignore
	} else if (input.classList.contains("datepicker-input") || input.classList.contains("default_datepicker")) {
		if (value && value.substr(0, 4).match(/\d{4}/)) {
			value = value.substring(0, 10);
			value = reverseDateString(value, "-");
			// @ts-ignore
			if (input.datepicker) {
				// @ts-ignore
				input.datepicker.setDate(value);
			} else {
				// @ts-ignore
				input.value = value;
			}
		}
	} else if (input.classList.contains("table-selection-value")) {
		var datatable = input._parent(".datatable-wrapper");
		window[datatable.getAttribute("data-datatable-name")].setSelectedValuesFromString(value);
	} else {
		var type = input.getAttribute("data-type");
		if (type == "html") {
			input._set_content(value);
		} else if (input.tagName == "IMG") {
			if (input.classList.contains("wo997_img")) {
				setResponsiveImageUrl(input, value);
				delay("lazyLoadImages", 0);
			} else {
				// @ts-ignore
				input.src = value;
			}
		} else if (input.tagName == "SELECT") {
			// @ts-ignore
			if ([...input.options].find((e) => e.value == value)) {
				// @ts-ignore
				input.value = value;
			}
		} else if (["INPUT", "TEXTAREA"].includes(input.tagName)) {
			// for text fields
			// @ts-ignore
			input.value = value;
		} else {
			return;
		}
	}

	quit();
}

function dispatchChange(node) {
	node.dispatchEvent(new Event("change"));
}

function xor(a, b) {
	return (a || b) && !(a && b);
}

/**
 * @typedef {{
 * plain?: boolean
 * }} GetDataOptions
 */

/**
 *
 * @param {PiepNode} input
 * @param {GetDataOptions} options
 */
function getValue(input, options = {}) {
	// @ts-ignore
	let v = input.value;

	if (input.classList.contains("radio_group")) {
		v = input.dataset.value;
	} else if (input.tagName == "P-CHECKBOX") {
		v = input.classList.contains("checked") ? 1 : 0;
	} else if (input.tagName == "COLOR-PICKER") {
		v = getColorPickerValue(input);
	} else if (input.tagName == "P-DROPDOWN") {
		v = input.dataset.value;
		// @ts-ignore
	} else if (input.classList.contains("datepicker-input")) {
		if (v && v.substr(6, 4).match(/\d{4}/)) {
			v = reverseDateString(v, "-");
		}
	} else {
		var type = input.dataset.type;
		if (type == "html") {
			v = input.innerHTML;
		} else if (input.classList.contains("wo997_img")) {
			v = def(input.getAttribute(`data-src`), "");
		}
	}

	if (!options.plain) {
		if (input.classList.contains("number")) {
			v = numberFromStr(v);
		}
		if (input.classList.contains("trim")) {
			v = v.trim();
		}
	}

	return v;
}

/**
 * @typedef {{
 * skip?: number,
 * max?: number,
 * inside?: PiepSelector
 * default?: any
 * }} findNodeOptions
 */

/**
 * @param {PiepNode} node
 * @param {PiepSelector} selector
 * @param {{(node: PiepNode)}} move
 * @param {findNodeOptions} options
 * @returns {PiepNode}
 */
function findNode(node, selector, move, options = {}) {
	const defa = def(options.default, undefined);
	if (!node || !move) {
		return defa;
	}
	if (!selector) {
		return $(move(node));
	}
	node = $(node);
	options.skip = def(options.skip, 1);
	options.max = def(options.max, 100);
	while (node) {
		if (options.max > 0) {
			options.max--;
		} else {
			break;
		}
		if (options.skip > 0) {
			options.skip--;
		} else {
			if (options.inside == node) {
				break;
			}

			if (node === document.documentElement) {
				break;
			}

			if (typeof selector === "string") {
				if (node.matches && node.matches(selector)) {
					return node;
				}
			} else {
				if (node == selector) {
					return node;
				}
			}

			if (node === document.body) {
				break;
			}
		}

		node = $(move(node));
	}
	return defa;
}

/**
 * @param {PiepNode} node
 * @param {PiepSelector} selector
 * @param {findNodeOptions} options
 */
function findParent(node, selector, options) {
	options.skip = def(options.skip, 0);
	return findNode(node, selector, (node) => node.parentNode, options);
}

/**
 * @param {PiepNode} node
 * @param {PiepSelector} selector
 * @param {findNodeOptions} options
 */
function findNext(node, selector, options) {
	return findNode(node, selector, (node) => node.nextElementSibling, options);
}

/**
 * @param {PiepNode} node
 * @param {PiepSelector} selector
 * @param {findNodeOptions} options
 */
function findPrev(node, selector, options) {
	return findNode(node, selector, (node) => node.previousElementSibling, options);
}

/**
 * Counts previous children
 *
 * @param {PiepNode} node
 */
function getNodeIndex(node) {
	let i = -1;
	while (node) {
		i++;
		node = node._prev();
	}
	return i;
}

/**
 * @param {PiepNode} node
 * @param {findNodeOptions} options
 */
function findScrollParent(node, options = {}) {
	options.default = def(options.default, $(document.body));
	return findParent(node, `.scroll_panel:not(.horizontal)`, options);
	//return findParent(node, `.scroll_panel`, options);
}

function removeContent(node) {
	while (true) {
		var first = node.firstChild;
		if (!first) return;
		node.removeChild(first);
	}
}

/**
 *
 * @param {PiepNode} node
 * @param {any} html
 * @param {{maintain_height?: boolean}} [options]
 */
function setContent(node, html = "", options = {}) {
	if (node.innerHTML === html) {
		return;
	}

	if (options.maintain_height) {
		node.style.height = node.scrollHeight + "px";
	}
	node = $(node);
	removeContent(node);
	node.insertAdjacentHTML("afterbegin", html);
	node.dispatchEvent(new Event("scroll"));
	setTimeout(() => {
		node.dispatchEvent(new Event("scroll"));
		if (options.maintain_height) {
			node.style.height = "";
		}
	}, 0);
}

function swapNodes(a, b) {
	if (!a || !b) {
		return;
	}

	let aParent = a.parentNode;
	let bParent = b.parentNode;

	let aHolder = document.createElement("div");
	let bHolder = document.createElement("div");

	aParent.replaceChild(aHolder, a);
	bParent.replaceChild(bHolder, b);

	aParent.replaceChild(b, aHolder);
	bParent.replaceChild(a, bHolder);
}

/**
 *
 * @param {string} selector
 * @param {string[]} classes
 * @param {PiepNode} parent
 */
function removeClasses(selector, classes, parent = undefined) {
	$(def(parent, document))
		._children(selector)
		.forEach((e) => {
			e.classList.remove(...classes);
		});
}

/**
 *
 * @param {PiepNode} node
 * @param {string} prefix
 */
function removeClassesWithPrefix(node, prefix) {
	let cn = [...node.classList].join(" ");

	const matches = cn.match(new RegExp(`\\b${prefix}[\\w-]*\\b`, "g"));
	if (!matches) {
		return undefined;
	}
	matches.forEach((match) => {
		node.classList.remove(match);
	});

	return matches;
}

function matchClassesWithPrefix(node, prefix) {
	return node.classList.filter((e) => e.indexOf(prefix) === 0);
}

function getNodeTextWidth(node) {
	if (!node) return;
	var textNode = [...node.childNodes].find((child) => child.nodeType === Node.TEXT_NODE);
	if (!textNode) return getNodeTextWidth(node.children[0]);
	var range = document.createRange();
	range.selectNode(textNode);
	return range.getBoundingClientRect().width;
}

function clamp(min, val, max) {
	return Math.max(min, Math.min(val, max));
}

function isHidden(el) {
	return el.offsetParent === null;
}

function inBody(node) {
	return document.body.contains(node);
}

function preventLongPressMenu(node) {
	node.oncontextmenu = function (event) {
		event.preventDefault();
		event.stopPropagation();
		return false;
	};
}

function getSelectDisplayValue(select) {
	return select.options[select.selectedIndex].text;
}

/**
 * **Object** that is **not an array**
 */
function isObject(input) {
	return input && !Array.isArray(input) && typeof input === "object";
}

/**
 * Pure **arrays**
 */
function isArray(input) {
	return input && Array.isArray(input) && typeof input === "object";
}

function isEquivalent(a, b) {
	if (!a || !b || typeof a !== "object" || typeof b !== "object") {
		return a === b;
	}

	const aProps = Object.getOwnPropertyNames(a);
	const bProps = Object.getOwnPropertyNames(b);

	if (aProps.length !== bProps.length) {
		return false;
	}

	for (const prop of aProps) {
		if (typeof a[prop] === "object") {
			if (!isEquivalent(a[prop], b[prop])) {
				return false;
			}
		} else if (typeof a[prop] === "function") {
			if (!a[prop] || !b[prop]) {
				if (a[prop] !== b[prop]) {
					return false;
				}
			}
			if (a[prop].toString() !== b[prop].toString()) {
				return false;
			}
		} else {
			if (a[prop] !== b[prop]) {
				return false;
			}
		}
	}

	return true;
}

function isEmpty(obj) {
	return Object.keys(obj).length === 0;
}

function removeSelection() {
	if (window.getSelection) {
		const selection = window.getSelection();
		if (selection.empty) {
			// Chrome
			selection.empty();
		} else if (selection.removeAllRanges) {
			// Firefox
			selection.removeAllRanges();
		}
	}
}

/**
 *
 * @param {PiepNode} node
 * @returns {{
 * relative_pos: {
 * left: number
 * top: number
 * }
 * node_rect: ClientRect
 * scrollable_parent: PiepNode
 * scrollable_parent_rect: ClientRect
 * }}
 */
function nodePositionAgainstScrollableParent(node) {
	node = $(node);
	const node_rect = node.getBoundingClientRect();

	const scrollable_parent = node._scroll_parent();
	const scrollable_parent_rect = scrollable_parent.getBoundingClientRect();

	return {
		relative_pos: {
			left: node_rect.left - scrollable_parent_rect.left + scrollable_parent.scrollLeft,
			top: node_rect.top - scrollable_parent_rect.top + scrollable_parent.scrollTop,
		},
		node_rect: node_rect,
		scrollable_parent: scrollable_parent,
		scrollable_parent_rect: scrollable_parent_rect,
	};
}

function positionAgainstScrollableParent(x, y, scrollable_parent) {
	const scrollable_parent_rect = scrollable_parent.getBoundingClientRect();

	return {
		x: x - scrollable_parent_rect.left + scrollable_parent.scrollLeft,
		y: y - scrollable_parent_rect.top + scrollable_parent.scrollTop,
	};
}

/**
 * it must be a single node!
 *
 * @returns {PiepNode}
 */
function createNodeFromHtml(html) {
	document.body.insertAdjacentHTML("beforeend", html);
	return $(document.body.lastChild);
}

/**
 *
 * @param {PiepNode} node
 * @param {number} off_y
 */
function isNodeOnScreen(node, off_y = -10, off_x = -10) {
	if (isHidden(node)) {
		return false;
	}
	const parent = node._parent(".overflow_hidden", { skip: 1 });

	const r = node.getBoundingClientRect();
	if (parent) {
		const pr = parent.getBoundingClientRect();
		if (
			r.y > pr.top + pr.height + off_y ||
			r.y + r.height < pr.top - off_y ||
			r.x > pr.left + pr.width + off_x ||
			r.x + r.width < pr.left - off_x
		) {
			return false;
		}
	}
	if (r.y > window.innerHeight + off_y || r.y + r.height < -off_y || r.x > window.innerWidth + off_x || r.x + r.width < -off_x) {
		return false;
	}

	return r;
}

function isUrlOurs(url) {
	if (url.indexOf("/") === 0) {
		return true;
	} else {
		try {
			const url_obj = new URL(url);
			return url_obj.hostname === window.location.hostname;
		} catch {
			return false;
		}
	}
}

// Object.assign works only on the first level, those motherfuckers below are light af
function deepAssign(target, src) {
	return cloneObject(src, target);
}

/**
 * Don't use the src ;)
 *
 * @param {*} obj
 * @param {*} src
 */
function cloneObject(obj, src = undefined) {
	if (!obj || obj instanceof HTMLElement || obj instanceof CharacterData || obj === window) {
		return obj;
	}

	let v;
	let obj_b = def(src, Array.isArray(obj) ? [] : {});
	for (const k in obj) {
		v = obj[k];
		obj_b[k] = typeof v === "object" ? cloneObject(v, obj_b[k]) : v;
	}

	return obj_b;
}

function isObjectdef(obj) {
	return !obj || Object.keys(obj).length === 0;
}

/**
 *
 * @param {*} src
 * @param {*} to
 * @param {string[]} props
 */
function rewriteProps(src, to, props) {
	props.forEach((e) => {
		to[e] = src[e];
	});
}

/**
 *
 * @param {*} src
 * @param {*} to
 */
function rewritePropsObjHas(src, to) {
	rewriteProps(src, to, Object.keys(to));
}

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

function quickTimeout(callback, time) {
	if (!time) {
		return callback(); // make sure it's synchronous
	}
	return setTimeout(callback, time);
}
