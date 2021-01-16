/* js[global] */

function domload(callback) {
	document.addEventListener("DOMContentLoaded", callback);
}

function windowload(callback) {
	window.addEventListener("load", callback);
}

function xhr(data) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", data.url, true);
	xhr.setRequestHeader("enctype", "multipart/form-data");
	xhr.onload = function () {
		var res = xhr.responseText;
		data.type = def(data.type, "json");
		var res_json = null;

		var match_reload_required = "[reload_required]";
		var reload_required = false;
		if (
			res.substring(0, match_reload_required.length) === match_reload_required
		) {
			res = res.substring(match_reload_required.length);
			reload_required = true;
		}

		try {
			res_json = JSON.parse(res);
		} catch {}

		if (data.success) {
			data.success(data.type == "json" ? res_json : res);
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

		if (
			!reloading &&
			reload_required &&
			IS_ADMIN &&
			confirm("Wymagane jest odświeżenie strony, czy chcesz kontynuować?")
		) {
			window.location.reload();
		}
	};

	var formData = data.formData ? data.formData : new FormData();
	if (data.params) {
		for (var [key, value] of Object.entries(data.params)) {
			if (typeof value === "object" && value !== null) {
				value = JSON.stringify(value);
			}
			formData.append(key, value);
		}
	}
	formData.append("xhr", true);
	xhr.send(formData);
	return xhr;
}

// deprecated
function ajax(url, data, good, wrong) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("enctype", "multipart/form-data");
	xhr.onload = function () {
		good(xhr.responseText);
	};
	var formData = new FormData();
	for (const [key, value] of Object.entries(data)) {
		formData.append(key, value);
	}
	xhr.send(formData);
}

/**
 *
 * @param {*} value
 * @param {*} def
 */
function def(value, def = "") {
	if (value === null || value === undefined) return def;
	return value;
}

function delay(action, time, context = window, params = []) {
	if (context["await" + action]) clearTimeout(context["await" + action]);
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

function escapeHTML(unsafeText) {
	let div = document.createElement("div");
	div.innerText = unsafeText;
	return div.innerHTML;
}

function escapeCSS(prop, val) {
	const prop_css = kebabToSnakeCase(prop);
	let div = document.createElement("div");
	div.style[prop_css] = val;
	return div.style[prop_css];
}

function escapeNumericalExpression(str) {
	return str.replace(/[^\d,.\*\-\+\/\(\)]*/g, "");
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
function replacePolishLetters(string) {
	const pl = [
		"ę",
		"Ę",
		"ó",
		"Ó",
		"ą",
		"Ą",
		"ś",
		"Ś",
		"ł",
		"Ł",
		"ż",
		"Ż",
		"ź",
		"Ź",
		"ć",
		"Ć",
		"ń",
		"Ń",
	];
	const en = [
		"e",
		"E",
		"o",
		"O",
		"a",
		"A",
		"s",
		"S",
		"l",
		"L",
		"z",
		"Z",
		"z",
		"Z",
		"c",
		"C",
		"n",
		"N",
	];

	var len = pl.length;
	for (let i = 0; i < len; i++) {
		string = string.replace(new RegExp(`${pl[i]}`, "g"), en[i]);
	}
	return string;
}

function capitalize(str) {
	const first = str.charAt(0);
	return str.replace(first, first.toUpperCase());
}

// also links.php
/**
 *
 * @param {string} string
 */
function escapeUrl(string) {
	return string
		.replacePolishLetters()
		.replace(/[, ]+/g, "-")
		.toLowerCase()
		.replace(/[^(a-zA-Z0-9-)]/g, "")
		.replace(/-+/g, "-");
}

/* never used
domload(() => {
	$$(".mobile-hover").forEach((e) => {
		if (IS_MOBILE) {
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

function updateOnlineStatus() {
	$(".offline").classList.toggle("shown", !navigator.onLine);
}
domload(() => {
	window.addEventListener("offline", () => {
		updateOnlineStatus();
	});
	window.addEventListener("online", () => {
		updateOnlineStatus();
	});
});

function setValue(input, value = null, params = {}) {
	input = $(input);

	if (
		value === null ||
		value === undefined ||
		isEquivalent(input.getValue(), value)
	) {
		if (!params.quiet) {
			input._dispatch_change();
		}
		return;
	}

	if (input.tagName == "RADIO-INPUT") {
		setRadioInputValue(input, value, params);
	} else if (input.tagName == "CHECKBOX") {
		input.classList.toggle("checked", !!value);
	} else if (input.datepicker) {
		if (value && value.substr(0, 4).match(/\d{4}/)) {
			value = reverseDateString(value, "-");
		}
		input.datepicker.setDate(value);
	} else if (input.classList.contains("table-selection-value")) {
		var datatable = input._parent(".datatable-wrapper");
		window[
			datatable.getAttribute("data-datatable-name")
		].setSelectedValuesFromString(value);
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
			input.setContent(value);
		} else if (type == "attribute_values") {
			setAttributePickerValues(input, value);
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

function getValue(input) {
	// TODO: move these motherfuckers to them components instead
	// funny how some might not have registering process so we can leave some in here ;)
	if (input.tagName == "RADIO-INPUT") {
		return getRadioInputValue(input);
	} else if (input.tagName == "CHECKBOX") {
		return input.classList.contains("checked") ? 1 : 0;
	} else if (input.datepicker) {
		var value = input.value;
		if (value && value.substr(6, 4).match(/\d{4}/)) {
			value = reverseDateString(value, "-");
		}
		return value;
	}
	if (input.classList.contains("jscolor")) {
		var value = input.value;
		if (value && value.charAt(0) != "#") {
			value = "#" + value;
		}
		return value;
	}
	if (input.getAttribute("type") == "checkbox") {
		return input.checked ? 1 : 0;
	}
	if (input.classList.contains("category-picker")) {
		return input.category_picker && input.category_picker.value
			? input.category_picker.value
			: [];
	} else {
		var type = input.getAttribute("data-type");
		if (type == "html") {
			var pointChild = input.getAttribute("data-point-child");
			if (pointChild) {
				input = input.find(pointChild);
			}
			if (input.hasAttribute("data-number")) {
				return +input.innerHTML;
			}
			return input.innerHTML;
		} else if (type == "attribute_values") {
			return getAttibutePickerValues(input);
		} else if (input.tagName == "IMG") {
			if (input.classList.contains("wo997_img")) {
				return def(input.getAttribute(`data-src`), "");
			}
			return input.getAttribute(`src`);
		} else if (type == "date") {
			var format = input.getAttribute(`data-format`);
			if (format == "dmy") {
				return reverseDateString(input.value, "-");
			}
			return input.value;
		} else if (["INPUT", "SELECT", "TEXTAREA"].includes(input.tagName)) {
			if (input.hasAttribute("data-number")) {
				return +input.value;
			}
			return input.value;
		} else {
			return undefined;
		}
	}
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
		return move(node);
	}
	node = $(node);
	options.skip = def(options.skip, 1);
	options.max = def(options.max, 100);
	while (node) {
		if (options.max > 0) {
			options.max--;
		} else {
			return defa;
		}
		if (options.skip > 0) {
			options.skip--;
		} else {
			if (typeof selector === "string") {
				if (node.matches(selector)) {
					return node;
				}
			} else {
				if (node == selector) {
					return node;
				}
			}
		}
		if (options.inside == node) {
			return defa;
		}
		if (node === document.body) {
			return defa;
		}
		node = move(node);
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
	return findNode(
		node,
		selector,
		(node) => node.previousElementSibling,
		options
	);
}

/**
 * @param {PiepNode} node
 * @param {findNodeOptions} options
 */
function findScrollParent(node, options = {}) {
	options.default = def(options.default, $(document.body));
	return findParent(node, `.scroll-panel:not(.horizontal)`, options);
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
 * @param {*} node
 * @param {string | number} html
 */
function setContent(node, html = "") {
	node = $(node);
	removeContent(node);
	node.insertAdjacentHTML("afterbegin", html);
	node.dispatchEvent(new Event("scroll"));
	setTimeout(() => {
		node.dispatchEvent(new Event("scroll"));
	}, 200);
}

function addMissingDirectChildren(
	parent,
	isMissingCallback,
	html,
	position = "beforeend"
) {
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

function position(node) {
	var left = 0,
		top = 0;

	do {
		left += node.offsetLeft;
		top += node.offsetTop;
	} while ((node = node.offsetParent));

	return { left: left, top: top };
}

// probably another thing to die, nodePositionAgainstScrollableParent is better
function positionWithOffset(node, offsetX, offestY) {
	var pos = position(node);
	var rect = node.getBoundingClientRect();
	return {
		left: pos.left + offsetX * rect.width,
		top: pos.top + offestY * rect.height,
	};
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

function removeClassesWithPrefix(node, prefix) {
	let cn = node.className;
	const matches = cn.match(new RegExp(`\\b${prefix}[\\w-]*\\b`, "g"), "");
	if (!matches) {
		return undefined;
	}
	matches.forEach((match) => {
		cn = cn.replace(match, "");
	});
	node.className = cn.trim();

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
	var textNode = [...node.childNodes].find(
		(child) => child.nodeType === Node.TEXT_NODE
	);
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
	document.body.contains(node);
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
	if (!a || !b) {
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
 * @param {*} node
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

	const scrollable_parent = node.findScrollParent();
	const scrollable_parent_rect = scrollable_parent.getBoundingClientRect();

	return {
		relative_pos: {
			left:
				node_rect.left -
				scrollable_parent_rect.left +
				scrollable_parent.scrollLeft,
			top:
				node_rect.top -
				scrollable_parent_rect.top +
				scrollable_parent.scrollTop,
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
 * @returns {PiepNode}
 */
function createNodeFromHtml(html) {
	const random_class_name = "sddsfgsdfgsdfgcvcvc";
	document.body.insertAdjacentHTML(
		"beforeend",
		`<div class="${random_class_name}" style="display:none">${html}</div>`
	);
	const node = $(`.${random_class_name} *`);
	node.remove();
	return node;
}

function isNodeOnScreen(node, offset = -10) {
	var r = node.getBoundingClientRect();
	if (
		r.y > window.innerHeight + offset ||
		r.y + r.height < -offset ||
		r.x > window.innerWidth + offset ||
		r.x + r.width < -offset
	) {
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

function kebabToSnakeCase(string) {
	return string.replace(/-([a-z])/gi, function (s, group1) {
		return group1.toUpperCase();
	});
}

const applyToArray = (func, array) => func.apply(Math, array);
