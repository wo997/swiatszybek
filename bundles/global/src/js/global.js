/* js[global] */

domload(() => {
	$("body").style.opacity = "1";
});

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

		if (!reloading && reload_required && IS_ADMIN && confirm("Wymagane jest odświeżenie strony, czy chcesz kontynuować?")) {
			window.location.reload();
		}
	};

	var formData = params.formData ? params.formData : new FormData();
	if (params.params) {
		for (var [key, value] of Object.entries(params.params)) {
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
function delay(action, time, context = window, params = [], options = {}) {
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
	return replacePolishLetters(string)
		.replace(/[, ]+/g, "-")
		.toLowerCase()
		.replace(/[^(a-zA-Z0-9-)]/g, "")
		.replace(/-+/g, "-");
}

/* never used
domload(() => {
	$$(".mobile-hover").forEach((e) => {
		if (IS_TOUCH_DEVICE) {
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
});*/

/**
 * @typedef {{
 * quiet?: boolean
 * }} SetDataOptions
 */

/**
 *
 * @param {PiepNode} input
 * @param {*} value
 * @param {SetDataOptions} params
 */
function setValue(input, value = null, params = {}) {
	input = $(input);

	if (value === null || value === undefined || isEquivalent(input._get_value(), value)) {
		if (!params.quiet) {
			input._dispatch_change();
		}
		return;
	}

	if (input.classList.contains("radio_group")) {
		input.dataset.value = value;
		onRadioGroupValueSet(input);
	} else if (input.tagName == "P-CHECKBOX") {
		input.classList.toggle("checked", !!value);
		// @ts-ignore
	} else if (input.datepicker) {
		if (value && value.substr(0, 4).match(/\d{4}/)) {
			value = reverseDateString(value, "-");
		}
		// @ts-ignore
		input.datepicker.setDate(value);
	} else if (input.classList.contains("table-selection-value")) {
		var datatable = input._parent(".datatable-wrapper");
		window[datatable.getAttribute("data-datatable-name")].setSelectedValuesFromString(value);
	} else if (input.classList.contains("jscolor")) {
		value = rgbStringToHex(value);
		var hex = value.replace("#", "");
		input.value = hex;
		input.jscolor.importColor();
	} else if (input.getAttribute("type") == "checkbox") {
		input.checked = value ? true : false;
	} else if (input.classList.contains("category-picker")) {
		setCategoryPickerValue(input, value, params);
	} else {
		var type = input.getAttribute("data-type");
		if (type == "html") {
			var pointChild = input.getAttribute("data-point-child");
			if (pointChild) {
				input = input.find(pointChild);
			}
			input._set_content(value);
		} else if (input.tagName == "IMG") {
			if (input.classList.contains("wo997_img")) {
				switchImage(input, value);
			} else {
				input.setAttribute("src", value);
			}
		} else if (input.tagName == "SELECT") {
			if ([...input.options].find((e) => e.value == value)) {
				input.value = value;
			}
		} else if (["INPUT", "TEXTAREA"].includes(input.tagName)) {
			// for text fields
			input.value = value;
		} else {
			return;
		}
	}
	if (!params.quiet) {
		input._dispatch_change();
	}
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
		v = def(input.dataset.value, "");
	} else if (input.tagName == "P-CHECKBOX") {
		v = input.classList.contains("checked") ? 1 : 0;
	} else if (input.getAttribute("type") == "checkbox") {
		// @ts-ignore
		v = input.checked ? 1 : 0;
		// @ts-ignore
	} else if (input.datepicker) {
		if (v && v.substr(6, 4).match(/\d{4}/)) {
			v = reverseDateString(v, "-");
		}
	} else if (input.classList.contains("jscolor")) {
		if (v && v.charAt(0) != "#") {
			v = "#" + v;
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
		if (input.hasAttribute("data-number")) {
			v = numberFromStr(v);
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

			if (node === document.body || node === document.documentElement) {
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
		node.style.height = node.offsetHeight + "px";
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

function addMissing_direct_children(parent, isMissingCallback, html, position = "beforeend") {
	if (!$(parent)._direct_children().find(isMissingCallback)) {
		parent.insertAdjacentHTML(position, html);
	}
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

function removeClasses(className, selector = null) {
	if (selector === null) selector = `.${className}`;
	var classList = null;
	if (Array.isArray(className)) {
		classList = className;
	} else {
		classList = [className];
	}
	for (let cn of classList) {
		$$(selector).forEach((e) => {
			e.classList.remove(cn);
		});
	}
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
	const out = [];
	node.classList.forEach((e) => {
		if (e.indexOf(prefix) === 0) out.push(e);
	});
	return out;
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
 * @param {number} offset
 */
function isNodeOnScreen(node, offset = -10) {
	const parent = node._parent(".overflow_hidden");

	let px0 = 0;
	let py0 = 0;
	let px1 = window.innerWidth;
	let py1 = window.innerHeight;
	const r = node.getBoundingClientRect();
	if (parent) {
		const pr = parent.getBoundingClientRect();
		px0 = pr.left;
		py0 = pr.top;
		px1 = pr.left + pr.width;
		py1 = pr.top + pr.height;
	}
	if (r.y > py1 + offset || r.y + r.height < py0 - offset || r.x > px1 + offset || r.x + r.width < px0 - offset) {
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
	if (!obj || obj instanceof HTMLElement) {
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

function applyToArray(func, array) {
	return func.apply(Math, array);
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
